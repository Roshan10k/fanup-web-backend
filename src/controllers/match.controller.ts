import { Request, Response } from "express";
import { HttpError } from "../errors/http-error";
import { MatchService } from "../services/match.service";
import { createLink, createPaginationLinks, buildLinkHeader } from "../helpers/hateoas";

const matchService = new MatchService();

export class MatchController {
  async listMatches(req: Request, res: Response) {
    try {
      const { page, size, league, status, sortBy, sortOrder } = req.query as {
        page?: string;
        size?: string;
        league?: string;
        status?: string;
        sortBy?: string;
        sortOrder?: string;
      };

      const { matches, pagination } = await matchService.listMatches({
        page,
        size,
        league,
        status,
        sortBy,
        sortOrder,
      });

      const paginationLinks = createPaginationLinks(
        "/api/matches",
        pagination.page,
        pagination.totalPages,
        pagination.size,
        { league, status, sortBy, sortOrder }
      );

      res.setHeader(
        "Link",
        buildLinkHeader("/api/matches", pagination.page, pagination.totalPages, pagination.size, { league, status, sortBy, sortOrder })
      );
      res.setHeader("X-Total-Count", String(pagination.totalItems));

      return res.status(200).json({
        success: true,
        message: "Matches retrieved successfully",
        data: matches,
        pagination,
        _links: {
          ...paginationLinks,
          completed: createLink("/api/matches/completed", "GET", "View completed matches"),
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

      const paginationLinks = createPaginationLinks(
        "/api/matches/completed",
        pagination.page,
        pagination.totalPages,
        pagination.size,
        { league }
      );

      res.setHeader(
        "Link",
        buildLinkHeader("/api/matches/completed", pagination.page, pagination.totalPages, pagination.size, { league })
      );
      res.setHeader("X-Total-Count", String(pagination.totalItems));

      return res.status(200).json({
        success: true,
        message: "Completed matches retrieved successfully",
        data: matches,
        pagination,
        _links: {
          ...paginationLinks,
          allMatches: createLink("/api/matches", "GET", "View all matches"),
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
        _links: {
          self: createLink(`/api/matches/${id}/scorecard`, "GET"),
          matches: createLink("/api/matches", "GET", "Browse all matches"),
          leaderboard: createLink(`/api/leaderboard/contests/${id}`, "GET", "View match leaderboard"),
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
        _links: {
          self: createLink(`/api/matches/${id}/complete`, "PATCH"),
          match: createLink(`/api/matches/${id}/scorecard`, "GET", "View scorecard"),
          matches: createLink("/api/matches", "GET", "Browse all matches"),
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
