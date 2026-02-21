import mongoose from "mongoose";
import { MatchModel } from "../models/match.model";
import { ScorecardModel } from "../models/scorecard.model";
import { HttpError } from "../errors/http-error";

export class MatchService {
  async listMatches(input: {
    page?: string;
    size?: string;
    league?: string;
    status?: string;
  }) {
    const { page, size, league, status } = input;
    const currentPage = Math.max(parseInt(page || "1", 10) || 1, 1);
    const currentSize = Math.max(parseInt(size || "10", 10) || 10, 1);

    const filter: Record<string, unknown> = {};
    let normalizedStatuses: string[] = [];

    if (status?.trim()) {
      normalizedStatuses = status
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      if (normalizedStatuses.length === 1) {
        filter.status = normalizedStatuses[0];
      } else if (normalizedStatuses.length > 1) {
        filter.status = { $in: normalizedStatuses };
      }
    } else {
      filter.status = "completed";
    }

    if (league?.trim()) {
      filter.league = league.trim();
    }

    const includesLiveAndUpcoming =
      normalizedStatuses.includes("live") &&
      normalizedStatuses.includes("upcoming");
    const sort: Record<string, 1 | -1> = { startTime: -1 };
    if (includesLiveAndUpcoming) {
      sort.status = 1;
    }

    const [matches, totalItems] = await Promise.all([
      MatchModel.find(filter)
        .sort(sort)
        .skip((currentPage - 1) * currentSize)
        .limit(currentSize)
        .lean(),
      MatchModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / currentSize);

    return {
      matches,
      pagination: {
        page: currentPage,
        size: currentSize,
        totalItems,
        totalPages,
      },
    };
  }

  async getCompletedMatches(page?: string, size?: string, league?: string) {
    return this.listMatches({ page, size, league, status: "completed" });
  }

  async getMatchScorecard(matchId: string) {
    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      throw new HttpError(400, "Invalid match id");
    }

    const match = await MatchModel.findById(matchId).lean();
    if (!match) {
      throw new HttpError(404, "Match not found");
    }

    const scorecard = await ScorecardModel.findOne({ matchId }).lean();
    if (!scorecard) {
      throw new HttpError(404, "Scorecard not found");
    }

    return { match, scorecard };
  }
}
