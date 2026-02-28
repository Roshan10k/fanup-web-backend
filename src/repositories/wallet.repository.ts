import { ClientSession, Types } from "mongoose";
import {
  IWalletTransaction,
  WalletTransactionModel,
} from "../models/wallet-transaction.model";
import { WalletTransaction } from "../types/wallet-transaction.type";

export class WalletRepository {
  async createTransaction(
    transactionData: WalletTransaction,
    session?: ClientSession
  ): Promise<IWalletTransaction> {
    const transaction = new WalletTransactionModel({
      ...transactionData,
      userId: new Types.ObjectId(transactionData.userId),
    });
    await transaction.save({ session });
    return transaction;
  }

  async getTransactionsByUser(
    userId: string,
    page: number,
    size: number
  ): Promise<{ rows: IWalletTransaction[]; total: number }> {
    const filter = { userId: new Types.ObjectId(userId) };

    const [rows, total] = await Promise.all([
      WalletTransactionModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * size)
        .limit(size),
      WalletTransactionModel.countDocuments(filter),
    ]);

    return { rows, total };
  }

  async getTotalsByUser(userId: string): Promise<{
    totalCredit: number;
    totalDebit: number;
    transactionCount: number;
    lastTransactionAt: Date | null;
  }> {
    const result = await WalletTransactionModel.aggregate<{
      totalCredit: number;
      totalDebit: number;
      transactionCount: number;
      lastTransactionAt: Date | null;
    }>([
      { $match: { userId: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalCredit: {
            $sum: {
              $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0],
            },
          },
          totalDebit: {
            $sum: {
              $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0],
            },
          },
          transactionCount: { $sum: 1 },
          lastTransactionAt: { $max: "$createdAt" },
        },
      },
    ]);

    const summary = result[0];

    return {
      totalCredit: summary?.totalCredit || 0,
      totalDebit: summary?.totalDebit || 0,
      transactionCount: summary?.transactionCount || 0,
      lastTransactionAt: summary?.lastTransactionAt || null,
    };
  }
}
