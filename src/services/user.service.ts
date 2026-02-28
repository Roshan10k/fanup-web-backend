import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../dtos/user.dto";
import jwt from "jsonwebtoken";
import { CLIENT_URL, JWT_SECRET} from "../configs";
import { sendEmail } from "../configs/email";
import { WalletService } from "./wallet.service";
import mongoose from "mongoose";
import { ContestEntryModel } from "../models/contest-entry.model";
import { MatchModel } from "../models/match.model";

const userRepository = new UserRepository();
const walletService = new WalletService();
const INVALID_LOGIN_ERROR = "Invalid credentials";

export class UserService {
  private getProfileCompletionScore(input: {
    hasFullName: boolean;
    hasEmail: boolean;
    hasPhone: boolean;
    hasProfilePicture: boolean;
  }) {
    let score = 0;
    if (input.hasFullName) score += 25;
    if (input.hasEmail) score += 25;
    if (input.hasPhone) score += 25;
    if (input.hasProfilePicture) score += 25;
    return Math.min(100, score);
  }

  async registerUser(userData: CreateUserDto) {
    const existingEmail = await userRepository.getUserByEmail(userData.email);
    if (existingEmail) {
      throw new HttpError(409, "Email already in use");
    }

    const hashedPassword = await bcryptjs.hash(userData.password, 10);
    const { confirmPassword, ...userPayload } = userData;
    userPayload.password = hashedPassword;

    const newUser = await userRepository.createUser(userPayload);
    await walletService.applyWelcomeBonusIfEligible(newUser._id.toString());

    const userWithBonus = await userRepository.getUserById(newUser._id.toString());
    if (!userWithBonus) {
      throw new HttpError(404, "User not found after registration");
    }

    return userWithBonus;
  }

  async loginUser(loginData: LoginUserDto) {
    const user = await userRepository.getUserByEmail(loginData.email);
    if (!user) {
      throw new HttpError(401, INVALID_LOGIN_ERROR);
    }

    const isPasswordValid = await bcryptjs.compare(
      loginData.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new HttpError(401, INVALID_LOGIN_ERROR);
    }

    await walletService.claimDailyLoginBonus(user._id.toString());

    const refreshedUser = await userRepository.getUserById(user._id.toString());
    if (!refreshedUser) {
      throw new HttpError(404, "User not found");
    }

     const payload = {
      //what to store in token
      id: refreshedUser._id,
      email: refreshedUser.email,
      role: refreshedUser.role,
    }
    const token = jwt.sign(payload, JWT_SECRET, {expiresIn: '30d'}); //30days
    return {token, user: refreshedUser};
  }

  async updateProfile(userId: string, updateData: UpdateUserDto) {
    if (updateData.email) {
      const existingUser = await userRepository.getUserByEmail(updateData.email);
      if (existingUser && existingUser._id.toString() !== userId) {
        throw new HttpError(409, "Email already in use");
      }
    }

    const updatedUser = await userRepository.updateUser(userId, updateData);
    if (!updatedUser) {
      throw new HttpError(404, "User not found");
    }

    return updatedUser;
  }

  async updateProfilePicture(userId: string, filename: string) {
    const updatedUser = await userRepository.updateUser(userId, {
      profilePicture: filename,
    });
    if (!updatedUser) {
      throw new HttpError(404, "User not found");
    }
    return updatedUser;
  }

  async getProfileStats(userId: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const missingFields: string[] = [];
    if (!user.fullName) missingFields.push("Full name");
    if (!user.email) missingFields.push("Email");
    if (!user.phone) missingFields.push("Phone number");
    if (!user.profilePicture) missingFields.push("Profile picture");

    const allEntries = await ContestEntryModel.find(
      { userId: new mongoose.Types.ObjectId(userId) },
      { matchId: 1, points: 1 }
    ).lean();

    const contestsJoined = allEntries.length;
    const teamsCreated = contestsJoined;

    const matchIds = Array.from(
      new Set(allEntries.map((entry) => entry.matchId.toString()))
    ).map((id) => new mongoose.Types.ObjectId(id));

    if (!matchIds.length) {
      return {
        contestsJoined,
        teamsCreated,
        winRate: 0,
        profileCompletion: this.getProfileCompletionScore({
          hasFullName: Boolean(user.fullName),
          hasEmail: Boolean(user.email),
          hasPhone: Boolean(user.phone),
          hasProfilePicture: Boolean(user.profilePicture),
        }),
        missingFields,
      };
    }

    const completedMatches = await MatchModel.find(
      { _id: { $in: matchIds }, status: "completed" },
      { _id: 1 }
    ).lean();

    const completedMatchIds = completedMatches.map((item) => item._id);
    const completedMatchIdSet = new Set(
      completedMatchIds.map((item) => item.toString())
    );

    const completedEntries = allEntries.filter((entry) =>
      completedMatchIdSet.has(entry.matchId.toString())
    );

    let wins = 0;
    if (completedEntries.length > 0 && completedMatchIds.length > 0) {
      const topRows = await ContestEntryModel.aggregate<{
        _id: mongoose.Types.ObjectId;
        maxPoints: number;
      }>([
        {
          $match: {
            matchId: { $in: completedMatchIds },
          },
        },
        {
          $group: {
            _id: "$matchId",
            maxPoints: { $max: "$points" },
          },
        },
      ]);

      const topPointByMatch = new Map(
        topRows.map((row) => [row._id.toString(), row.maxPoints])
      );

      for (const entry of completedEntries) {
        const maxPoints = topPointByMatch.get(entry.matchId.toString());
        if (typeof maxPoints === "number" && entry.points >= maxPoints) {
          wins += 1;
        }
      }
    }

    const winRate = completedEntries.length
      ? Math.round((wins / completedEntries.length) * 100)
      : 0;

    return {
      contestsJoined,
      teamsCreated,
      winRate,
      profileCompletion: this.getProfileCompletionScore({
        hasFullName: Boolean(user.fullName),
        hasEmail: Boolean(user.email),
        hasPhone: Boolean(user.phone),
        hasProfilePicture: Boolean(user.profilePicture),
      }),
      missingFields,
    };
  }

  async sendResetPasswordEmail(email?: string) {
        if (!email) {
            throw new HttpError(400, "Email is required");
        }
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            // Return success-like flow to avoid exposing whether an account exists.
            return;
        }
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' }); // 1 hour expiry
        const resetLink = `${CLIENT_URL}/reset-password?token=${token}`;
        const html = `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`;
        await sendEmail(user.email, "Password Reset", html);
        return user;

    }

    async resetPassword(token?: string, newPassword?: string) {
        try {
            if (!token || !newPassword) {
                throw new HttpError(400, "Token and new password are required");
            }
            const decoded: any = jwt.verify(token, JWT_SECRET);
            const userId = decoded.id;
            const user = await userRepository.getUserById(userId);
            if (!user) {
                throw new HttpError(404, "User not found");
            }
            const hashedPassword = await bcryptjs.hash(newPassword, 10);
            await userRepository.updateUser(userId, { password: hashedPassword });
            return user;
        } catch (error) {
            throw new HttpError(400, "Invalid or expired token");
        }
    }


}
