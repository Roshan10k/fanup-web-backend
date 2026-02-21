import { Request, Response } from "express";
import { HttpError } from "../errors/http-error";
import { LeaderboardService } from "../services/leaderboard.service";
import { WalletService } from "../services/wallet.service";
import { liveContestStreamService } from "../services/live-contest-stream.service";

const leaderboardService = new LeaderboardService();
const walletService = new WalletService();

export class LeaderboardController {
  async listMatchContests(req: Request, res: Response) {
    try {
      const statusParam = String(req.query.status || "completed");
      const status: "upcoming" | "live" | "completed" =
        statusParam === "upcoming" || statusParam === "live"
          ? statusParam
          : "completed";
      const contests = await leaderboardService.listMatchContests(status);

      return res.status(200).json({
        success: true,
        message: "Leaderboard contests retrieved successfully",
        data: contests,
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
        message: "Failed to retrieve leaderboard contests",
      });
    }
  }

  async getMatchContestLeaderboard(req: Request, res: Response) {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        throw new HttpError(401, "User not authenticated");
      }

      const { matchId } = req.params;
      const result = await leaderboardService.getMatchContestLeaderboard(matchId, userId);

      return res.status(200).json({
        success: true,
        message: "Leaderboard retrieved successfully",
        data: result,
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
        message: "Failed to retrieve leaderboard",
      });
    }
  }

  async submitContestEntry(req: Request, res: Response) {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        throw new HttpError(401, "User not authenticated");
      }

      const { matchId } = req.params;
      const teamId = String(req.body?.teamId || "");
      const teamName = String(req.body?.teamName || "");
      const captainId = String(req.body?.captainId || "");
      const viceCaptainId = String(req.body?.viceCaptainId || "");
      const playerIds = Array.isArray(req.body?.playerIds)
        ? req.body.playerIds.map((item: unknown) => String(item))
        : [];

      const result = await leaderboardService.submitContestEntry({
        matchId,
        userId,
        teamId,
        teamName,
        captainId,
        viceCaptainId,
        playerIds,
      });

      await leaderboardService.refreshMatchEntryPoints(matchId);
      await liveContestStreamService.publishLeaderboardSnapshot(matchId);

      const walletSummary = await walletService.getSummary(userId);

      return res.status(200).json({
        success: true,
        message: result.created
          ? "Contest entry submitted successfully"
          : "Contest entry updated successfully",
        data: {
          created: result.created,
          entryId: result.entry._id.toString(),
          walletSummary,
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
        message: "Failed to submit contest entry",
      });
    }
  }

  async getMyEntries(req: Request, res: Response) {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        throw new HttpError(401, "User not authenticated");
      }

      const entries = await leaderboardService.getMyEntries(userId);

      return res.status(200).json({
        success: true,
        message: "Contest entries retrieved successfully",
        data: entries,
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
        message: "Failed to retrieve contest entries",
      });
    }
  }

  async deleteMyEntry(req: Request, res: Response) {
    try {
      const userId = req.user?._id.toString();
      if (!userId) {
        throw new HttpError(401, "User not authenticated");
      }

      const { matchId } = req.params;
      await leaderboardService.deleteMyEntry(matchId, userId);
      await liveContestStreamService.publishLeaderboardSnapshot(matchId);

      return res.status(200).json({
        success: true,
        message: "Contest entry deleted successfully",
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
        message: "Failed to delete contest entry",
      });
    }
  }

  async streamMatchContestLive(req: Request, res: Response) {
    const { matchId } = req.params;
    if (!matchId) {
      return res.status(400).json({
        success: false,
        message: "matchId is required",
      });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    liveContestStreamService.subscribe(matchId, res);
    void liveContestStreamService.publishLeaderboardSnapshot(matchId).catch(() => {
      // Keep stream connection open even when initial snapshot is unavailable.
    });

    req.on("close", () => {
      liveContestStreamService.unsubscribe(matchId, res);
    });
  }
}
