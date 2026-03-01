import { HttpError } from "../errors/http-error";
import mongoose from "mongoose";
import { UserRepository } from "../repositories/user.repository";
import { WalletRepository } from "../repositories/wallet.repository";
import {
  WalletTransactionSource,
  WalletTransactionType,
} from "../types/wallet-transaction.type";

const walletRepository = new WalletRepository();
const userRepository = new UserRepository();

const WELCOME_BONUS_AMOUNT = 500;
const DAILY_LOGIN_BONUS_AMOUNT = 100;
const CONTEST_JOIN_FEE = 50;

const getUtcDateKey = (date = new Date()) => date.toISOString().slice(0, 10);

export class WalletService {
  async getSummary(userId: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const totals = await walletRepository.getTotalsByUser(userId);

    return {
      balance: user.balance || 0,
      ...totals,
    };
  }

  async getTransactions(userId: string, page = 1, size = 20, sortBy?: string, sortOrder?: string) {
    const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
    const safeSize = Number.isFinite(size)
      ? Math.max(1, Math.min(100, Math.floor(size)))
      : 20;

    const { rows, total } = await walletRepository.getTransactionsByUser(
      userId,
      safePage,
      safeSize,
      sortBy,
      sortOrder
    );

    return {
      rows,
      pagination: {
        page: safePage,
        size: safeSize,
        total,
        totalPages: Math.ceil(total / safeSize) || 1,
      },
    };
  }

  async applyWelcomeBonusIfEligible(userId: string) {
    const eventKey = `welcome_bonus:${userId}`;
    return await this.createBalanceTransaction({
      userId,
      type: "credit",
      source: "welcome_bonus",
      amount: WELCOME_BONUS_AMOUNT,
      title: "Welcome Bonus",
      eventKey,
    });
  }

  async claimDailyLoginBonus(userId: string) {
    const eventKey = `daily_login:${userId}:${getUtcDateKey()}`;
    return await this.createBalanceTransaction({
      userId,
      type: "credit",
      source: "daily_login",
      amount: DAILY_LOGIN_BONUS_AMOUNT,
      title: "Daily Login Bonus",
      eventKey,
    });
  }

  async applyContestJoinDebit(userId: string, matchId: string, _teamId?: string) {
    const safeMatchId = matchId.trim() || "unknown_match";
    const eventKey = `contest_join:${userId}:${safeMatchId}`;

    return await this.createBalanceTransaction({
      userId,
      type: "debit",
      source: "contest_join",
      amount: CONTEST_JOIN_FEE,
      title: "Contest Join Fee",
      referenceId: safeMatchId,
      eventKey,
    });
  }

  async createBalanceTransaction(input: {
    userId: string;
    type: WalletTransactionType;
    source: WalletTransactionSource;
    amount: number;
    title: string;
    referenceId?: string;
    eventKey: string;
  }) {
    if (input.amount <= 0) {
      throw new HttpError(400, "Transaction amount must be positive");
    }

    const session = await mongoose.startSession();
    let output: { created: boolean; message: string; amount: number } = {
      created: false,
      message: "Transaction already applied",
      amount: input.amount,
    };

    try {
      await session.withTransaction(async () => {
        await walletRepository.createTransaction(
          {
            userId: input.userId,
            type: input.type,
            source: input.source,
            amount: input.amount,
            title: input.title,
            referenceId: input.referenceId,
            eventKey: input.eventKey,
          },
          session
        );

        const delta = input.type === "credit" ? input.amount : -input.amount;
        const updatedUser = await userRepository.incrementBalance(input.userId, delta, {
          session,
          minRequiredBalance: input.type === "debit" ? input.amount : undefined,
        });

        if (!updatedUser) {
          const user = await userRepository.getUserById(input.userId);
          if (!user) {
            throw new HttpError(404, "User not found");
          }
          throw new HttpError(400, "Insufficient balance");
        }

        output = {
          created: true,
          message: "Transaction applied",
          amount: input.amount,
        };
      });
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
      ) {
        return {
          created: false,
          message: "Transaction already applied",
          amount: input.amount,
        };
      }
      throw error;
    } finally {
      await session.endSession();
    }

    return output;
  }
}
