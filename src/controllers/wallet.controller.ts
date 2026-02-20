import { Request, Response } from "express";
import { HttpError } from "../errors/http-error";
import { WalletService } from "../services/wallet.service";

const walletService = new WalletService();

export class WalletController {
  async getSummary(req: Request, res: Response) {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        throw new HttpError(401, "User not authenticated");
      }

      const summary = await walletService.getSummary(userId);
      return res.status(200).json({
        success: true,
        message: "Wallet summary fetched successfully",
        data: summary,
      });
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to fetch wallet summary",
      });
    }
  }

  async getTransactions(req: Request, res: Response) {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        throw new HttpError(401, "User not authenticated");
      }

      const page = Number(req.query.page || 1);
      const size = Number(req.query.size || 20);
      const result = await walletService.getTransactions(userId, page, size);

      return res.status(200).json({
        success: true,
        message: "Wallet transactions fetched successfully",
        data: result.rows.map((item) => ({
          _id: item._id.toString(),
          type: item.type,
          source: item.source,
          amount: item.amount,
          title: item.title,
          referenceId: item.referenceId || null,
          createdAt: item.createdAt,
        })),
        pagination: result.pagination,
      });
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to fetch wallet transactions",
      });
    }
  }

  async claimDailyBonus(req: Request, res: Response) {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        throw new HttpError(401, "User not authenticated");
      }

      const result = await walletService.claimDailyLoginBonus(userId);
      const summary = await walletService.getSummary(userId);

      return res.status(200).json({
        success: true,
        message: result.created
          ? "Daily bonus credited successfully"
          : "Daily bonus already claimed today",
        data: {
          ...result,
          summary,
        },
      });
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to claim daily bonus",
      });
    }
  }

  async contestJoinDebit(req: Request, res: Response) {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        throw new HttpError(401, "User not authenticated");
      }

      const matchId = String(req.body?.matchId || "").trim();
      const teamId = String(req.body?.teamId || "").trim();

      if (!matchId) {
        throw new HttpError(400, "matchId is required");
      }

      if (!teamId) {
        throw new HttpError(400, "teamId is required");
      }

      const result = await walletService.applyContestJoinDebit(userId, matchId, teamId);
      const summary = await walletService.getSummary(userId);

      return res.status(200).json({
        success: true,
        message: result.created
          ? "Contest join fee debited successfully"
          : "Contest join fee already debited",
        data: {
          ...result,
          summary,
        },
      });
    } catch (error: unknown) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to debit contest join fee",
      });
    }
  }
}
