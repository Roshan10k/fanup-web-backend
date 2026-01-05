import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../dtos/user.dto";
import jwt from "jsonwebtoken";
import { JWT_SECRET} from "../configs";

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
}
