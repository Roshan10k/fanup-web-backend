import mongoose from "mongoose";
import { MatchModel } from "../models/match.model";
import { ScorecardModel } from "../models/scorecard.model";
import { HttpError } from "../errors/http-error";

export class MatchService {
  async getCompletedMatches(page?: string, size?: string, league?: string) {
    const currentPage = Math.max(parseInt(page || "1", 10) || 1, 1);
    const currentSize = Math.max(parseInt(size || "10", 10) || 10, 1);

    const filter: Record<string, unknown> = { status: "completed" };
    if (league?.trim()) {
      filter.league = league.trim();
    }

    const [matches, totalItems] = await Promise.all([
      MatchModel.find(filter)
        .sort({ startTime: -1 })
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
