import type { Response } from "express";
import { MatchModel } from "../models/match.model";
import { ScorecardModel } from "../models/scorecard.model";
import { PlayerModel } from "../models/player.model";
import { LeaderboardService } from "./leaderboard.service";

const HEARTBEAT_MS = 15000;
const SIMULATION_INTERVAL_MS = 8000;

const leaderboardService = new LeaderboardService();

type ScorecardEntry = {
  playerName: string;
  teamShortName: string;
  performance: string;
};

type PlayerPerformance = {
  playerId?: string | null;
  playerName: string;
  teamShortName: string;
  runs: number;
  wickets: number;
  fours: number;
  sixes: number;
  maidens: number;
  catches: number;
  stumpings: number;
  runOuts: number;
};

const formatBattingPerformance = (runs: number, balls: number) => `${Math.max(0, runs)} (${Math.max(1, balls)})`;
const formatBowlingPerformance = (wickets: number, conceded: number) => `${Math.max(0, wickets)}/${Math.max(0, conceded)}`;

const parseBattingPerformance = (value: string) => {
  const match = value.match(/^(\d+)\s*\((\d+)\)$/);
  if (!match) return { runs: 0, balls: 1 };
  return { runs: Number(match[1]) || 0, balls: Number(match[2]) || 1 };
};

const parseBowlingPerformance = (value: string) => {
  const match = value.match(/^(\d+)\/(\d+)$/);
  if (!match) return { wickets: 0, conceded: 0 };
  return { wickets: Number(match[1]) || 0, conceded: Number(match[2]) || 0 };
};

const incrementOvers = (current: number, extraBalls: number) => {
  const whole = Math.floor(current);
  const balls = Math.round((current - whole) * 10);
  const totalBalls = whole * 6 + Math.max(0, extraBalls) + balls;
  const nextOvers = Math.floor(totalBalls / 6);
  const nextBalls = totalBalls % 6;
  return Number(`${nextOvers}.${nextBalls}`);
};

class LiveContestStreamService {
  private clientsByMatch = new Map<string, Set<Response>>();
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private simulationTimer: NodeJS.Timeout | null = null;

  start() {
    if (!this.heartbeatTimer) {
      this.heartbeatTimer = setInterval(() => {
        this.broadcastAll("heartbeat", { ts: Date.now() });
      }, HEARTBEAT_MS);
    }

    if (!this.simulationTimer) {
      this.simulationTimer = setInterval(() => {
        void this.simulateLiveTick();
      }, SIMULATION_INTERVAL_MS);
    }
  }

  subscribe(matchId: string, res: Response) {
    const matchKey = String(matchId);
    const clients = this.clientsByMatch.get(matchKey) || new Set<Response>();
    clients.add(res);
    this.clientsByMatch.set(matchKey, clients);

    this.push(res, "connected", { matchId: matchKey, ts: Date.now() });
  }

  unsubscribe(matchId: string, res: Response) {
    const matchKey = String(matchId);
    const clients = this.clientsByMatch.get(matchKey);
    if (!clients) return;

    clients.delete(res);
    if (!clients.size) {
      this.clientsByMatch.delete(matchKey);
    }
  }

  async publishLeaderboardSnapshot(matchId: string) {
    const payload = await leaderboardService.getMatchContestLeaderboard(matchId, null);
    this.broadcast(matchId, "leaderboard_update", payload);
  }

  private push(res: Response, event: string, payload: unknown) {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  }

  private broadcast(matchId: string, event: string, payload: unknown) {
    const clients = this.clientsByMatch.get(String(matchId));
    if (!clients || !clients.size) return;

    for (const client of clients) {
      this.push(client, event, payload);
    }
  }

  private broadcastAll(event: string, payload: unknown) {
    for (const clients of this.clientsByMatch.values()) {
      for (const client of clients) {
        this.push(client, event, payload);
      }
    }
  }

  private async ensureScorecard(matchId: string, teamA: string, teamB: string) {
    const existing = await ScorecardModel.findOne({ matchId });
    if (existing) {
      return existing;
    }

    return ScorecardModel.create({
      matchId,
      innings: [
        { teamShortName: teamA, runs: 0, wickets: 0, overs: 0 },
        { teamShortName: teamB, runs: 0, wickets: 0, overs: 0 },
      ],
      topBatters: [],
      topBowlers: [],
      playerPerformances: [],
      resultText: "Live",
    });
  }

  private async getTeamPlayers(teamShortName: string) {
    const rows = await PlayerModel.find(
      { teamShortName, isPlaying: true },
      { _id: 1, fullName: 1 }
    )
      .limit(11)
      .lean();

    return rows.map((row) => ({ id: row._id.toString(), fullName: row.fullName }));
  }

  private updateTopBatters(
    list: ScorecardEntry[],
    playerName: string,
    teamShortName: string,
    runsDelta: number,
    ballsDelta: number
  ) {
    const idx = list.findIndex((item) => item.playerName === playerName);
    if (idx === -1) {
      list.push({
        playerName,
        teamShortName,
        performance: formatBattingPerformance(runsDelta, ballsDelta),
      });
    } else {
      const current = parseBattingPerformance(list[idx].performance);
      list[idx].performance = formatBattingPerformance(current.runs + runsDelta, current.balls + ballsDelta);
    }

    list.sort((a, b) => {
      const aRuns = parseBattingPerformance(a.performance).runs;
      const bRuns = parseBattingPerformance(b.performance).runs;
      return bRuns - aRuns;
    });

    return list.slice(0, 6);
  }

  private updateTopBowlers(
    list: ScorecardEntry[],
    playerName: string,
    teamShortName: string,
    wicketDelta: number,
    concededDelta: number
  ) {
    const idx = list.findIndex((item) => item.playerName === playerName);
    if (idx === -1) {
      list.push({
        playerName,
        teamShortName,
        performance: formatBowlingPerformance(wicketDelta, concededDelta),
      });
    } else {
      const current = parseBowlingPerformance(list[idx].performance);
      list[idx].performance = formatBowlingPerformance(
        current.wickets + wicketDelta,
        current.conceded + concededDelta
      );
    }

    list.sort((a, b) => {
      const aStats = parseBowlingPerformance(a.performance);
      const bStats = parseBowlingPerformance(b.performance);
      return bStats.wickets - aStats.wickets || aStats.conceded - bStats.conceded;
    });

    return list.slice(0, 6);
  }

  private upsertPlayerPerformance(
    list: PlayerPerformance[],
    input: {
      playerId?: string;
      playerName: string;
      teamShortName: string;
      runsDelta?: number;
      wicketsDelta?: number;
      concededDelta?: number;
    }
  ) {
    const idx = list.findIndex((item) => item.playerName === input.playerName);
    const current =
      idx >= 0
        ? list[idx]
        : {
            playerId: input.playerId || null,
            playerName: input.playerName,
            teamShortName: input.teamShortName,
            runs: 0,
            wickets: 0,
            fours: 0,
            sixes: 0,
            maidens: 0,
            catches: 0,
            stumpings: 0,
            runOuts: 0,
          };

    const runsDelta = Math.max(0, input.runsDelta || 0);
    const wicketsDelta = Math.max(0, input.wicketsDelta || 0);
    const concededDelta = Math.max(0, input.concededDelta || 0);

    current.runs += runsDelta;
    current.wickets += wicketsDelta;
    current.fours += Math.floor(runsDelta / 4);
    current.sixes += Math.floor(runsDelta / 6);
    if (wicketsDelta > 0 && concededDelta <= 6) {
      current.maidens += 1;
    }

    if (idx >= 0) {
      list[idx] = current;
      return;
    }
    list.push(current);
  }

  private async simulateLiveTick() {
    const liveMatches = await MatchModel.find({ status: "live" })
      .sort({ startTime: 1 })
      .limit(3)
      .lean();

    if (!liveMatches.length) {
      return;
    }

    const match = liveMatches[Math.floor(Math.random() * liveMatches.length)];
    const scorecard = await this.ensureScorecard(
      match._id.toString(),
      match.teamA.shortName,
      match.teamB.shortName
    );

    const innings = Array.isArray(scorecard.innings) ? [...scorecard.innings] : [];
    if (innings.length < 2) {
      innings.push(
        { teamShortName: match.teamA.shortName, runs: 0, wickets: 0, overs: 0 },
        { teamShortName: match.teamB.shortName, runs: 0, wickets: 0, overs: 0 }
      );
    }

    const battingIndex = Math.random() > 0.5 ? 0 : 1;
    const bowlingIndex = battingIndex === 0 ? 1 : 0;

    if (innings[battingIndex].overs < 20 && innings[battingIndex].wickets < 10) {
      const runsDelta = Math.floor(Math.random() * 7);
      const wicketFalls = Math.random() < 0.16 ? 1 : 0;
      const concededDelta = runsDelta + (wicketFalls ? 1 : 0);

      innings[battingIndex].runs += runsDelta;
      innings[battingIndex].wickets = Math.min(10, innings[battingIndex].wickets + wicketFalls);
      innings[battingIndex].overs = incrementOvers(innings[battingIndex].overs, 1);

      const [batters, bowlers] = await Promise.all([
        this.getTeamPlayers(innings[battingIndex].teamShortName),
        this.getTeamPlayers(innings[bowlingIndex].teamShortName),
      ]);

      const topBatters = Array.isArray(scorecard.topBatters)
        ? [...(scorecard.topBatters as unknown as ScorecardEntry[])]
        : [];
      const topBowlers = Array.isArray(scorecard.topBowlers)
        ? [...(scorecard.topBowlers as unknown as ScorecardEntry[])]
        : [];
      const playerPerformances = Array.isArray(scorecard.playerPerformances)
        ? [...(scorecard.playerPerformances as unknown as PlayerPerformance[])]
        : [];

      if (batters.length) {
        const batter = batters[Math.floor(Math.random() * Math.min(4, batters.length))];
        scorecard.topBatters = this.updateTopBatters(
          topBatters,
          batter.fullName,
          innings[battingIndex].teamShortName,
          runsDelta,
          1
        ) as never;
        this.upsertPlayerPerformance(playerPerformances, {
          playerId: batter.id,
          playerName: batter.fullName,
          teamShortName: innings[battingIndex].teamShortName,
          runsDelta,
        });
      }

      if (bowlers.length) {
        const bowler = bowlers[Math.floor(Math.random() * Math.min(4, bowlers.length))];
        scorecard.topBowlers = this.updateTopBowlers(
          topBowlers,
          bowler.fullName,
          innings[bowlingIndex].teamShortName,
          wicketFalls,
          concededDelta
        ) as never;
        this.upsertPlayerPerformance(playerPerformances, {
          playerId: bowler.id,
          playerName: bowler.fullName,
          teamShortName: innings[bowlingIndex].teamShortName,
          wicketsDelta: wicketFalls,
          concededDelta,
        });
      }

      scorecard.innings = innings as never;
      scorecard.playerPerformances = playerPerformances as never;
      scorecard.resultText = `Live: ${innings[0].teamShortName} ${innings[0].runs}/${innings[0].wickets} (${innings[0].overs}) · ${innings[1].teamShortName} ${innings[1].runs}/${innings[1].wickets} (${innings[1].overs})`;
      await scorecard.save();

      await leaderboardService.refreshMatchEntryPoints(match._id.toString());
      await this.publishLeaderboardSnapshot(match._id.toString());
    }
  }
}

export const liveContestStreamService = new LiveContestStreamService();
