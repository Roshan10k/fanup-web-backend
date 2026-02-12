import { UserRepository } from "../../repositories/user.repository";
import { HttpError } from "../../errors/http-error";
import { UpdateUserDto, CreateUserDto } from "../../dtos/user.dto";
import bcryptjs from "bcryptjs";

const userRepository = new UserRepository();

export class AdminUserService {
  // Create new user
  async createUser(userData: CreateUserDto & { profilePicture?: string | null }) {
    // Check if email already exists
    const existingEmail = await userRepository.getUserByEmail(userData.email);
    if (existingEmail) {
      throw new HttpError(409, "Email already in use");
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(userData.password, 10);
    const { confirmPassword, ...userPayload } = userData;
    userPayload.password = hashedPassword;

    const newUser = await userRepository.createUser(userPayload);
    return newUser;
  }

  // Get all users with pagination and optional search
  async getAllUsers(
        page?: string, size?: string, search?: string
    ){
        const pageNumber = page ? parseInt(page) : 1;
        const pageSize = size ? parseInt(size) : 10;
        const {users, total} = await userRepository.getAllUsers(
            pageNumber, pageSize, search
        );
        const pagination = {
            page: pageNumber,
            size: pageSize,
            totalItems: total,
            totalPages: Math.ceil(total / pageSize)
        }
        return {users, pagination};
    }

  // Get user by ID
  async getUserById(id: string) {
    const user = await userRepository.getUserById(id);
    if (!user) {
      throw new HttpError(404, "User not found");
    }
    return user;
  }

  // Update any user (admin can update any user)
  async updateUser(id: string, updateData: UpdateUserDto) {
    // If email is being updated, check if it's already in use
    if (updateData.email) {
      const existingUser = await userRepository.getUserByEmail(updateData.email);
      if (existingUser && existingUser._id.toString() !== id) {
        throw new HttpError(409, "Email already in use");
      }
    }

    // Hash password if it's being updated
    if (updateData.password) {
      updateData.password = await bcryptjs.hash(updateData.password, 10);
    }

    const updatedUser = await userRepository.updateUser(id, updateData);
    if (!updatedUser) {
      throw new HttpError(404, "User not found");
    }

    return updatedUser;
  }

  // Delete user
  async deleteUser(id: string) {
    const deleted = await userRepository.deleteUser(id);
    if (!deleted) {
      throw new HttpError(404, "User not found");
    }
    return deleted;
  }

  // Get user statistics
  async getUserStats() {
  const { users } = await userRepository.getAllUsers(1, Number.MAX_SAFE_INTEGER);

  return {
    totalUsers: users.length,
    adminCount: users.filter(u => u.role === "admin").length,
    userCount: users.filter(u => u.role === "user").length,
  };
}
}