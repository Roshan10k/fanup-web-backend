import mongoose from "mongoose";
import { MatchModel } from "../models/match.model";
import { ScorecardModel } from "../models/scorecard.model";
import { HttpError } from "../errors/http-error";
import { ContestEntryModel } from "../models/contest-entry.model";
import { WalletService } from "./wallet.service";
import { LeaderboardService } from "./leaderboard.service";
import { NotificationService } from "./notification.service";

const walletService = new WalletService();
const leaderboardService = new LeaderboardService();
const notificationService = new NotificationService();

const getPrizeByRank = (rank: number) => {
  if (rank === 1) return 1000;
  if (rank === 2) return 500;
  if (rank === 3) return 300;
  if (rank <= 10) return 100;
  return 0;
};

export class MatchService {
  async listMatches(input: {
    page?: string;
    size?: string;
    league?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const { page, size, league, status, sortBy, sortOrder } = input;
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
      // Default: only show "upcoming" matches on home (exclude locked and completed)
      filter.status = "upcoming";
    }

    if (league?.trim()) {
      filter.league = league.trim();
    }

    // Client-driven sorting with allowed field whitelist
    const allowedSortFields = ["startTime", "league", "status", "createdAt"];
    const sortField = allowedSortFields.includes(sortBy || "") ? sortBy! : "startTime";
    const sortDirection: 1 | -1 = sortOrder === "asc" ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [sortField]: sortDirection };

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

  async completeMatchAndSettle(
    matchId: string,
    input?: {
      result?: "team_a" | "team_b" | "draw" | "no_result";
      winnerTeamShortName?: string | null;
      summary?: string | null;
    }
  ) {
    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      throw new HttpError(400, "Invalid match id");
    }

    const match = await MatchModel.findById(matchId);
    if (!match) {
      throw new HttpError(404, "Match not found");
    }

    if (match.status === "abandoned") {
      throw new HttpError(400, "Abandoned match cannot be completed");
    }

    // Set isEditable to false and status to completed
    const setData: Record<string, unknown> = { 
      status: "completed",
      isEditable: false 
    };
    if (input?.result) setData.result = input.result;
    if (typeof input?.winnerTeamShortName !== "undefined") {
      setData.winnerTeamShortName = input.winnerTeamShortName || null;
    }
    if (typeof input?.summary !== "undefined") {
      setData.summary = input.summary || null;
    }

    await MatchModel.findByIdAndUpdate(matchId, { $set: setData }, { new: true });

    await leaderboardService.refreshMatchEntryPoints(matchId);

    const entries = await ContestEntryModel.find({
      matchId: new mongoose.Types.ObjectId(matchId),
    }).sort({ points: -1, updatedAt: 1 });

    if (!entries.length) {
      return {
        settled: true,
        message: "Match marked completed. No contest entries to settle.",
        payouts: [],
      };
    }

    const payouts: Array<{
      userId: string;
      entryId: string;
      rankStart: number;
      rankEnd: number;
      points: number;
      amount: number;
      credited: boolean;
    }> = [];
    let creditedCount = 0;
    let skippedCount = 0;
    let totalPrizeDistributed = 0;

    let cursor = 0;
    while (cursor < entries.length) {
      const groupPoints = entries[cursor].points;
      let end = cursor;
      while (end + 1 < entries.length && entries[end + 1].points === groupPoints) {
        end += 1;
      }

      const rankStart = cursor + 1;
      const rankEnd = end + 1;
      let pooledPrize = 0;
      for (let rank = rankStart; rank <= rankEnd; rank += 1) {
        pooledPrize += getPrizeByRank(rank);
      }

      const groupSize = rankEnd - rankStart + 1;
      const perUserPrize = pooledPrize > 0 ? Math.round(pooledPrize / groupSize) : 0;

      for (let index = cursor; index <= end; index += 1) {
        const entry = entries[index];
        const userId = entry.userId.toString();
        let credited = false;
        const userRank = rankStart; // Use rankStart as user's rank (tied users share the same rank)

        if (perUserPrize > 0) {
          const txResult = await walletService.createBalanceTransaction({
            userId,
            type: "credit",
            source: "contest_win",
            amount: perUserPrize,
            title: `Contest Prize - ${match.teamA.shortName} vs ${match.teamB.shortName}`,
            referenceId: matchId,
            eventKey: `contest_win:${userId}:${matchId}`,
          });
          credited = txResult.created;
          if (credited) {
            creditedCount += 1;
            totalPrizeDistributed += perUserPrize;

            // Create notification for prize credited
            await notificationService.createPrizeCreditedNotification(
              userId,
              matchId,
              match.teamA.shortName,
              match.teamB.shortName,
              perUserPrize,
              userRank
            );
          } else {
            skippedCount += 1;
          }
        }

        // Create match completed notification for all participants
        await notificationService.createMatchCompletedNotification(
          userId,
          matchId,
          match.teamA.shortName,
          match.teamB.shortName,
          userRank,
          entry.points
        );

        payouts.push({
          userId,
          entryId: entry._id.toString(),
          rankStart,
          rankEnd,
          points: entry.points,
          amount: perUserPrize,
          credited,
        });
      }

      cursor = end + 1;
    }

    const hasPrizeRows = payouts.some((item) => item.amount > 0);
    const alreadySettled = hasPrizeRows && creditedCount === 0;

    return {
      settled: true,
      alreadySettled,
      creditedCount,
      skippedCount,
      totalPrizeDistributed,
      message: alreadySettled
        ? "Match already settled earlier. No new prize credits applied."
        : `Match completed and settled. Credited ${creditedCount} winner(s).`,
      payouts,
    };
  }

  // Admin-specific methods
  async getAllMatchesForAdmin(input?: {
    status?: string;
    limit?: number;
  }) {
    const filter: Record<string, unknown> = {};
    
    if (input?.status) {
      const normalizedStatuses = input.status
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      if (normalizedStatuses.length === 1) {
        filter.status = normalizedStatuses[0];
      } else if (normalizedStatuses.length > 1) {
        filter.status = { $in: normalizedStatuses };
      }
    }

    const limit = input?.limit ? Math.min(input.limit, 100) : 50;

    const matches = await MatchModel.find(filter)
      .sort({ startTime: -1 })
      .limit(limit)
      .lean();

    return matches.map((match) => ({
      id: match._id.toString(),
      label: `${match.teamA.shortName} vs ${match.teamB.shortName} - ${match.league}`,
      league: match.league,
      teamA: match.teamA.shortName,
      teamB: match.teamB.shortName,
      startTime: match.startTime,
      status: match.status,
      isEditable: match.isEditable ?? true,
    }));
  }

  async lockMatch(matchId: string) {
    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      throw new HttpError(400, "Invalid match id");
    }

    const match = await MatchModel.findById(matchId);
    if (!match) {
      throw new HttpError(404, "Match not found");
    }

    if (match.status === "completed") {
      throw new HttpError(400, "Cannot lock an already completed match");
    }

    if (match.status === "abandoned") {
      throw new HttpError(400, "Cannot lock an abandoned match");
    }

    if (match.isEditable === false)  {
      throw new HttpError(400, "Match is already locked");
    }

    // Lock the match - users can no longer join or edit
    await MatchModel.findByIdAndUpdate(
      matchId,
      { 
        $set: { 
          status: "locked",
          isEditable: false 
        } 
      },
      { new: true }
    );

    // Refresh all entry points one last time before locking
    await leaderboardService.refreshMatchEntryPoints(matchId);

    return {
      success: true,
      message: "Match locked successfully. Users can no longer join or edit teams.",
    };
  }
}
