import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../errors/http-error";
import { CreateUserDto, LoginUserDto } from "../dtos/user.dto";

const userRepository = new UserRepository();

export class UserService {
  async registerUser(userData: CreateUserDto) {
    // Check email
    const existingEmail = await userRepository.getUserByEmail(userData.email);
    if (existingEmail) {
      throw new HttpError(409, "Email already in use");
    }

    

    // Hash password
    const hashedPassword = await bcryptjs.hash(userData.password, 10);

    // Remove confirmPassword before saving
    const { confirmPassword, ...userPayload } = userData;

    // Replace plain password
    userPayload.password = hashedPassword;

    // Save user
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

    return user;
  }
}