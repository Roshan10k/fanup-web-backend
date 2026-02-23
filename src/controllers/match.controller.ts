import { Request, Response } from "express";
import { HttpError } from "../errors/http-error";
import { MatchService } from "../services/match.service";

const matchService = new MatchService();

export class MatchController {
  async listMatches(req: Request, res: Response) {
    try {
      const { page, size, league, status } = req.query as {
        page?: string;
        size?: string;
        league?: string;
        status?: string;
      };

      const { matches, pagination } = await matchService.listMatches({
        page,
        size,
        league,
        status,
      });

      return res.status(200).json({
        success: true,
        message: "Matches retrieved successfully",
        data: matches,
        pagination,
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

  async getCompletedMatches(req: Request, res: Response) {
    try {
      const { page, size, league } = req.query as {
        page?: string;
        size?: string;
        league?: string;
      };

      const { matches, pagination } = await matchService.getCompletedMatches(
        page,
        size,
        league
      );

      return res.status(200).json({
        success: true,
        message: "Completed matches retrieved successfully",
        data: matches,
        pagination,
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
        message: "Failed to retrieve completed matches",
      });
    }
  }

  async getMatchScorecard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await matchService.getMatchScorecard(id);

      return res.status(200).json({
        success: true,
        message: "Match scorecard retrieved successfully",
        data: result,
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
        message: "Failed to retrieve match scorecard",
      });
    }
  }

  async completeMatchAndSettle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { result, winnerTeamShortName, summary } = req.body as {
        result?: "team_a" | "team_b" | "draw" | "no_result";
        winnerTeamShortName?: string;
        summary?: string;
      };

      const output = await matchService.completeMatchAndSettle(id, {
        result,
        winnerTeamShortName,
        summary,
      });

      return res.status(200).json({
        success: true,
        message: output.message,
        data: output,
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
