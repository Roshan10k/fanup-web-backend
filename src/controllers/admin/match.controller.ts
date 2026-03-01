import { Request, Response } from "express";
import { HttpError } from "../../errors/http-error";
import { MatchService } from "../../services/match.service";
import { LeaderboardService } from "../../services/leaderboard.service";
import { createLink } from "../../helpers/hateoas";

const matchService = new MatchService();
const leaderboardService = new LeaderboardService();

export class AdminMatchController {
  /**
   * Get all matches for admin dropdown
   * Query params: status (optional, comma-separated: upcoming,locked,completed)
   */
  getAllMatches = async (req: Request, res: Response) => {
    try {
      const { status, limit } = req.query as {
        status?: string;
        limit?: string;
      };

      const matches = await matchService.getAllMatchesForAdmin({
        status,
        limit: limit ? parseInt(limit, 10) : undefined,
      });

      return res.status(200).json({
        success: true,
        message: "Matches retrieved successfully",
        data: matches,
        _links: {
          self: createLink("/api/admin/matches", "GET"),
        },
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to retrieve matches",
      });
    }
  }

  /**
   * Get leaderboard for any match (admin can view any match)
   */
  getMatchLeaderboard = async (req: Request, res: Response) => {
    try {
      const { matchId } = req.params;

      // Admin doesn't need userId for viewing leaderboard
      const result = await leaderboardService.getMatchContestLeaderboard(
        matchId,
        null
      );

      return res.status(200).json({
        success: true,
        message: "Leaderboard retrieved successfully",
        data: result,
        _links: {
          self: createLink(`/api/admin/matches/${matchId}/leaderboard`, "GET"),
          matches: createLink("/api/admin/matches", "GET", "View all matches"),
          lock: createLink(`/api/admin/matches/${matchId}/lock`, "PATCH", "Lock this match"),
          complete: createLink(`/api/admin/matches/${matchId}/complete`, "PATCH", "Complete this match"),
        },
      });
    } catch (error) {
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

  /**
   * Lock a match - users can no longer join or edit teams
   */
  lockMatch = async (req: Request, res: Response) => {
    try {
      const { matchId } = req.params;

      const result = await matchService.lockMatch(matchId);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result,
        _links: {
          self: createLink(`/api/admin/matches/${matchId}/lock`, "PATCH"),
          leaderboard: createLink(`/api/admin/matches/${matchId}/leaderboard`, "GET", "View leaderboard"),
          complete: createLink(`/api/admin/matches/${matchId}/complete`, "PATCH", "Complete and settle"),
          matches: createLink("/api/admin/matches", "GET", "View all matches"),
        },
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to lock match",
      });
    }
  }

  /**
   * Complete and settle a match - distribute prizes and mark as completed
   */
  completeAndSettleMatch = async (req: Request, res: Response) => {
    try {
      const { matchId } = req.params;
      const { result, winnerTeamShortName, summary } = req.body as {
        result?: "team_a" | "team_b" | "draw" | "no_result";
        winnerTeamShortName?: string;
        summary?: string;
      };

      const output = await matchService.completeMatchAndSettle(matchId, {
        result,
        winnerTeamShortName,
        summary,
      });

      return res.status(200).json({
        success: true,
        message: output.message,
        data: output,
        _links: {
          self: createLink(`/api/admin/matches/${matchId}/complete`, "PATCH"),
          leaderboard: createLink(`/api/admin/matches/${matchId}/leaderboard`, "GET", "View final leaderboard"),
          matches: createLink("/api/admin/matches", "GET", "View all matches"),
        },
      });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to complete and settle match",
      });
    }
  }
}
