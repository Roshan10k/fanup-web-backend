import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../dtos/user.dto";
import jwt from "jsonwebtoken";
import { CLIENT_URL, JWT_SECRET} from "../configs";
import { sendEmail } from "../configs/email";

const userRepository = new UserRepository();

export class UserService {
  async registerUser(userData: CreateUserDto) {
    const existingEmail = await userRepository.getUserByEmail(userData.email);
    if (existingEmail) {
      throw new HttpError(409, "Email already in use");
    }

    const hashedPassword = await bcryptjs.hash(userData.password, 10);
    const { confirmPassword, ...userPayload } = userData;
    userPayload.password = hashedPassword;

    const newUser = await userRepository.createUser(userPayload);
    return newUser;
  }

  async loginUser(loginData: LoginUserDto) {
    const user = await userRepository.getUserByEmail(loginData.email);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const isPasswordValid = await bcryptjs.compare(
      loginData.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new HttpError(401, "Invalid credentials");
    }

     const payload = {
      //what to store in token
      id: user._id,
      email: user.email,
      role: user.role,
    }
    const token = jwt.sign(payload, JWT_SECRET, {expiresIn: '30d'}); //30days
    return {token, user};
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

  async sendResetPasswordEmail(email?: string) {
        if (!email) {
            throw new HttpError(400, "Email is required");
        }
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            throw new HttpError(404, "User not found");
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

