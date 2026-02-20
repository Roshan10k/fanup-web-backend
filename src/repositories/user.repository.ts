import { QueryFilter } from "mongoose";
import { UserModel, IUser } from "../models/user.model";

export interface IUserRepository {
  createUser(userData: Partial<IUser>): Promise<IUser>;
  getUserByEmail(email: string): Promise<IUser | null>;

  getUserById(id: string): Promise<IUser | null>;
  updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
  incrementBalance(id: string, amount: number): Promise<IUser | null>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(
        page: number, size: number, search?: string
    ): Promise<{users: IUser[], total: number}>;
}

export class UserRepository implements IUserRepository {
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData);
    await user.save();
    return user;
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }

  async getUserById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id);
  }

  async getAllUsers(
        page: number, size: number, search?: string
    ): Promise<{users: IUser[], total: number}> {
        const filter: QueryFilter<IUser> = {};
        if (search) {
            filter.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
            ];
        }
        const [users, total] = await Promise.all([
            UserModel.find(filter)
                .skip((page - 1) * size)
                .limit(size),
            UserModel.countDocuments(filter)
        ]);
        return { users, total };
    }

  async updateUser(
    id: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
  }

  async incrementBalance(id: string, amount: number): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(
      id,
      { $inc: { balance: amount } },
      { new: true }
    );
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }
}
