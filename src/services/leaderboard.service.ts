import mongoose from "mongoose";
import { MatchModel } from "../models/match.model";
import { UserModel } from "../models/user.model";
import { ContestEntryModel, IContestEntry } from "../models/contest-entry.model";
import { ScorecardModel } from "../models/scorecard.model";
import { PlayerModel } from "../models/player.model";
import { HttpError } from "../errors/http-error";
import { WalletService } from "./wallet.service";

type ContestStatus = "upcoming" | "live" | "completed";

interface LeaderRow {
  userId: string;
  rank: number;
  name: string;
  teams: number;
  pts: number;
  winRate: number;
  prize: number;
}

const ENTRY_FEE = 50;
const RUN_POINT = 1;
const FOUR_POINT = 1;
const SIX_POINT = 2;
const WICKET_POINT = 25;
const MAIDEN_POINT = 12;
const CATCH_POINT = 8;
const STUMPING_POINT = 12;
const RUN_OUT_POINT = 6;
const walletService = new WalletService();

const getPrizeByRank = (rank: number) => {
  if (rank === 1) return 1000;
  if (rank === 2) return 500;
  if (rank === 3) return 300;
  if (rank <= 10) return 100;
  return 0;
};

const parseRuns = (value: string) => {
  const match = value.match(/^(\d+)/);
  return match ? Number(match[1]) : 0;
};

const parseWickets = (value: string) => {
  const match = value.match(/^(\d+)\//);
  return match ? Number(match[1]) : 0;
};

const roundPoints = (value: number) => Math.max(0, Math.round(value * 10) / 10);

const buildPointsByPlayerName = (scorecard: {
  playerPerformances?: Array<{
    playerName?: string;
    runs?: number;
    wickets?: number;
    fours?: number;
    sixes?: number;
    maidens?: number;
    catches?: number;
    stumpings?: number;
    runOuts?: number;
  }>;
  topBatters?: Array<{ playerName?: string; performance?: string }>;
  topBowlers?: Array<{ playerName?: string; performance?: string }>;
}) => {
  const pointsByName = new Map<string, number>();
  const playerPerformances = Array.isArray(scorecard.playerPerformances)
    ? scorecard.playerPerformances
    : [];

  if (playerPerformances.length) {
    for (const row of playerPerformances) {
      const playerName = String(row.playerName || "").trim();
      if (!playerName) continue;

      const total =
        (Number(row.runs) || 0) * RUN_POINT +
        (Number(row.fours) || 0) * FOUR_POINT +
        (Number(row.sixes) || 0) * SIX_POINT +
        (Number(row.wickets) || 0) * WICKET_POINT +
        (Number(row.maidens) || 0) * MAIDEN_POINT +
        (Number(row.catches) || 0) * CATCH_POINT +
        (Number(row.stumpings) || 0) * STUMPING_POINT +
        (Number(row.runOuts) || 0) * RUN_OUT_POINT;

      pointsByName.set(playerName, total);
    }

    return pointsByName;
  }

  const topBatters = Array.isArray(scorecard.topBatters) ? scorecard.topBatters : [];
  const topBowlers = Array.isArray(scorecard.topBowlers) ? scorecard.topBowlers : [];

  for (const batter of topBatters) {
    const playerName = String(batter.playerName || "").trim();
    if (!playerName) continue;
    const runs = parseRuns(String(batter.performance || ""));
    pointsByName.set(playerName, (pointsByName.get(playerName) || 0) + runs * RUN_POINT);
  }

  for (const bowler of topBowlers) {
    const playerName = String(bowler.playerName || "").trim();
    if (!playerName) continue;
    const wickets = parseWickets(String(bowler.performance || ""));
    pointsByName.set(playerName, (pointsByName.get(playerName) || 0) + wickets * WICKET_POINT);
  }

  return pointsByName;
};

const calculateContestPointsFromMaps = (
  entry: Pick<IContestEntry, "playerIds" | "captainId" | "viceCaptainId">,
  pointsByName: Map<string, number>,
  playerNameById: Map<string, string>
) => {
  let total = 0;

  for (const playerId of entry.playerIds || []) {
    const playerName = playerNameById.get(String(playerId));
    if (!playerName) continue;

    const base = pointsByName.get(playerName) || 0;
    if (String(playerId) === String(entry.captainId || "")) {
      total += base * 2;
      continue;
    }
    if (String(playerId) === String(entry.viceCaptainId || "")) {
      total += base * 1.5;
      continue;
    }

    total += base;
  }

  return roundPoints(total);
};

export class LeaderboardService {
  async listMatchContests(status: ContestStatus) {
    const matchFilter = { status };
    const matches = await MatchModel.find(matchFilter)
      .sort({ startTime: -1 })
      .limit(30)
      .lean();

    const matchIds = matches.map((item) => item._id);
    const participantsRows = await ContestEntryModel.aggregate<{
      _id: mongoose.Types.ObjectId;
      participantsCount: number;
    }>([
      { $match: { matchId: { $in: matchIds } } },
      { $group: { _id: "$matchId", participantsCount: { $sum: 1 } } },
    ]);
    const participantsMap = new Map(
      participantsRows.map((item) => [item._id.toString(), item.participantsCount])
    );

    return matches.map((match) => {
      const participantsCount = participantsMap.get(match._id.toString()) || 0;
      return {
        id: match._id.toString(),
        matchLabel: `${match.teamA.shortName} vs ${match.teamB.shortName}`,
        startsAt: match.startTime,
        status,
        entryFee: ENTRY_FEE,
        participantsCount,
        prizePool: participantsCount * ENTRY_FEE,
      };
    });
  }

  async getMatchContestLeaderboard(matchId: string, userId?: string | null) {
    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      throw new HttpError(400, "Invalid match id");
    }

    const match = await MatchModel.findById(matchId).lean();
    if (!match) {
      throw new HttpError(404, "Match not found");
    }

    if (match.status !== "completed" && match.status !== "upcoming" && match.status !== "live") {
      throw new HttpError(400, "Leaderboard supports upcoming, live, or completed matches");
    }

    const entries = await ContestEntryModel.find({ matchId: match._id })
      .sort({ points: -1, updatedAt: 1 })
      .lean();

    if (!entries.length) {
      return {
        match: {
          id: match._id.toString(),
          matchLabel: `${match.teamA.shortName} vs ${match.teamB.shortName}`,
          startsAt: match.startTime,
          status: match.status,
        },
        leaders: [] as LeaderRow[],
        myEntry: null,
      };
    }

    const users = await UserModel.find(
      { _id: { $in: entries.map((item) => item.userId) } },
      { _id: 1, fullName: 1, email: 1 }
    ).lean();
    const userMap = new Map(
      users.map((item) => [
        item._id.toString(),
        item.fullName || item.email || "User",
      ])
    );

    const leaders: LeaderRow[] = entries.map((entry) => {
      const normalized = Math.max(0, Math.min(100, Math.round((entry.points / 1200) * 100)));
      return {
        userId: entry.userId.toString(),
        rank: 0,
        name: userMap.get(entry.userId.toString()) || "User",
        teams: 1,
        pts: entry.points,
        winRate: normalized,
        prize: 0,
      };
    });

    leaders.sort((a, b) => b.pts - a.pts || a.name.localeCompare(b.name));
    leaders.forEach((item, index) => {
      const rank = index + 1;
      item.rank = rank;
      item.prize = match.status === "completed" ? getPrizeByRank(rank) : 0;
    });

    const myEntry = userId
      ? leaders.find((item) => item.userId === userId) || null
      : null;

    return {
      match: {
        id: match._id.toString(),
        matchLabel: `${match.teamA.shortName} vs ${match.teamB.shortName}`,
        startsAt: match.startTime,
        status: match.status,
      },
      leaders: leaders.slice(0, 20),
      myEntry,
    };
  }

  private async buildPlayerNameMap(playerIds: string[]) {
    const uniqueValidIds = Array.from(new Set(playerIds.filter((id) => mongoose.Types.ObjectId.isValid(id))));
    if (!uniqueValidIds.length) {
      return new Map<string, string>();
    }

    const rows = await PlayerModel.find(
      { _id: { $in: uniqueValidIds } },
      { _id: 1, fullName: 1 }
    ).lean();

    return new Map(rows.map((row) => [row._id.toString(), row.fullName]));
  }

  async refreshMatchEntryPoints(matchId: string) {
    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      throw new HttpError(400, "Invalid match id");
    }

    const [match, scorecard, entries] = await Promise.all([
      MatchModel.findById(matchId).lean(),
      ScorecardModel.findOne({ matchId: String(matchId) }).lean(),
      ContestEntryModel.find({ matchId: new mongoose.Types.ObjectId(matchId) }),
    ]);

    if (!match) {
      throw new HttpError(404, "Match not found");
    }

    if (!entries.length || !scorecard) {
      return { updatedCount: 0 };
    }

    const allPlayerIds = entries.flatMap((entry) => entry.playerIds || []);
    const playerNameById = await this.buildPlayerNameMap(allPlayerIds);
    const pointsByName = buildPointsByPlayerName(scorecard);

    let updatedCount = 0;
    for (const entry of entries) {
      const recalculated = calculateContestPointsFromMaps(entry, pointsByName, playerNameById);
      if (entry.points !== recalculated) {
        entry.points = recalculated;
        await entry.save();
        updatedCount += 1;
      }
    }

    return { updatedCount };
  }

  async submitContestEntry(input: {
    matchId: string;
    userId: string;
    teamId: string;
    teamName: string;
    captainId?: string;
    viceCaptainId?: string;
    playerIds: string[];
  }) {
    if (!mongoose.Types.ObjectId.isValid(input.matchId)) {
      throw new HttpError(400, "Invalid match id");
    }

    if (!input.teamId.trim()) {
      throw new HttpError(400, "teamId is required");
    }

    if (!input.teamName.trim()) {
      throw new HttpError(400, "teamName is required");
    }

    if (!Array.isArray(input.playerIds) || input.playerIds.length === 0) {
      throw new HttpError(400, "playerIds is required");
    }

    const match = await MatchModel.findById(input.matchId).lean();
    if (!match) {
      throw new HttpError(404, "Match not found");
    }

    if (match.status !== "upcoming" && match.status !== "completed" && match.status !== "live") {
      throw new HttpError(400, "Contest entry is not allowed for this match status");
    }

    const existingEntry = await ContestEntryModel.findOne({
      matchId: match._id,
      userId: new mongoose.Types.ObjectId(input.userId),
    });

    const playerNameById = await this.buildPlayerNameMap(input.playerIds);
    const scorecard = await ScorecardModel.findOne({ matchId: match._id.toString() }).lean();
    const pointsByName = buildPointsByPlayerName(scorecard || {});
    const calculatedPoints = calculateContestPointsFromMaps(
      {
        playerIds: input.playerIds,
        captainId: input.captainId,
        viceCaptainId: input.viceCaptainId,
      },
      pointsByName,
      playerNameById
    );

    const payload = {
      teamId: input.teamId.trim(),
      teamName: input.teamName.trim(),
      captainId: input.captainId?.trim() || null,
      viceCaptainId: input.viceCaptainId?.trim() || null,
      playerIds: input.playerIds,
      points: calculatedPoints,
    };

    if (!existingEntry) {
      await walletService.applyContestJoinDebit(
        input.userId,
        input.matchId,
        payload.teamId
      );

      const createdEntry = await ContestEntryModel.create({
        matchId: match._id,
        userId: new mongoose.Types.ObjectId(input.userId),
        ...payload,
      });

      return {
        created: true,
        entry: createdEntry,
      };
    }

    existingEntry.teamId = payload.teamId;
    existingEntry.teamName = payload.teamName;
    existingEntry.captainId = payload.captainId;
    existingEntry.viceCaptainId = payload.viceCaptainId;
    existingEntry.playerIds = payload.playerIds;
    existingEntry.points = payload.points;
    await existingEntry.save();

    return {
      created: false,
      entry: existingEntry,
    };
  }

  async getMyEntries(userId: string) {
    const rows = await ContestEntryModel.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .sort({ updatedAt: -1 })
      .lean();

    if (!rows.length) {
      return [];
    }

    const matches = await MatchModel.find(
      { _id: { $in: rows.map((item) => item.matchId) } },
      {
        _id: 1,
        league: 1,
        startTime: 1,
        status: 1,
        teamA: 1,
        teamB: 1,
      }
    ).lean();
    const matchMap = new Map(matches.map((item) => [item._id.toString(), item]));

    return rows.map((entry) => {
      const match = matchMap.get(entry.matchId.toString());
      return {
        matchId: entry.matchId.toString(),
        entryId: entry._id.toString(),
        teamId: entry.teamId,
        teamName: entry.teamName,
        captainId: entry.captainId || "",
        viceCaptainId: entry.viceCaptainId || "",
        playerIds: entry.playerIds,
        points: entry.points,
        updatedAt: entry.updatedAt,
        match: match
          ? {
              id: match._id.toString(),
              league: match.league,
              startTime: match.startTime,
              status: match.status,
              teamA: match.teamA,
              teamB: match.teamB,
            }
          : null,
      };
    });
  }

  async deleteMyEntry(matchId: string, userId: string) {
    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      throw new HttpError(400, "Invalid match id");
    }

    const deleted = await ContestEntryModel.findOneAndDelete({
      matchId: new mongoose.Types.ObjectId(matchId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!deleted) {
      throw new HttpError(404, "Contest entry not found");
    }

    return deleted;
  }
}
