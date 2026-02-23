import { MatchModel } from "../../models/match.model";
import { ScorecardModel } from "../../models/scorecard.model";
import { PlayerModel } from "../../models/player.model";

type FixtureStatus = "upcoming" | "completed";

type TopPerformer = {
  playerName: string;
  teamShortName: string;
  performance: string;
};

type Fixture = {
  externalMatchId: string;
  teamA: { name: string; shortName: string };
  teamB: { name: string; shortName: string };
  venue: string;
  startTime: Date;
  summary: string;
  scorecard?: {
    innings: Array<{ teamShortName: string; runs: number; wickets: number; overs: number }>;
    topBatters: TopPerformer[];
    topBowlers: TopPerformer[];
    resultText: string;
  };
  result?: "team_a" | "team_b" | "draw" | "no_result";
  winnerTeamShortName?: string;
};

const SOURCE = "internal_seed";
const DEFAULT_SEED_SPORT = "cricket";
const DEFAULT_SEED_LEAGUE = "ICC Men's T20 World Cup";

const COMPLETED_MATCHES: Fixture[] = [
  {
    externalMatchId: "WT20C-001",
    teamA: { name: "India", shortName: "IND" },
    teamB: { name: "Pakistan", shortName: "PAK" },
    venue: "Nassau County International Cricket Stadium",
    startTime: new Date("2026-06-12T14:00:00.000Z"),
    result: "team_a",
    winnerTeamShortName: "IND",
    summary: "India won by 6 runs",
    scorecard: {
      innings: [
        { teamShortName: "IND", runs: 153, wickets: 7, overs: 20 },
        { teamShortName: "PAK", runs: 147, wickets: 9, overs: 20 },
      ],
      topBatters: [
        { playerName: "Virat Kohli", teamShortName: "IND", performance: "58 (39)" },
        { playerName: "Babar Azam", teamShortName: "PAK", performance: "52 (42)" },
      ],
      topBowlers: [
        { playerName: "Jasprit Bumrah", teamShortName: "IND", performance: "3/18" },
        { playerName: "Shaheen Afridi", teamShortName: "PAK", performance: "2/24" },
      ],
      resultText: "India won by 6 runs",
    },
  },
  {
    externalMatchId: "WT20C-002",
    teamA: { name: "Australia", shortName: "AUS" },
    teamB: { name: "England", shortName: "ENG" },
    venue: "Kensington Oval",
    startTime: new Date("2026-06-13T18:00:00.000Z"),
    result: "team_a",
    winnerTeamShortName: "AUS",
    summary: "Australia won by 4 wickets",
    scorecard: {
      innings: [
        { teamShortName: "ENG", runs: 168, wickets: 8, overs: 20 },
        { teamShortName: "AUS", runs: 172, wickets: 6, overs: 19.3 },
      ],
      topBatters: [
        { playerName: "Travis Head", teamShortName: "AUS", performance: "71 (44)" },
        { playerName: "Jos Buttler", teamShortName: "ENG", performance: "49 (30)" },
      ],
      topBowlers: [
        { playerName: "Pat Cummins", teamShortName: "AUS", performance: "3/29" },
        { playerName: "Adil Rashid", teamShortName: "ENG", performance: "2/27" },
      ],
      resultText: "Australia won by 4 wickets",
    },
  },
  {
    externalMatchId: "WT20C-003",
    teamA: { name: "New Zealand", shortName: "NZ" },
    teamB: { name: "South Africa", shortName: "SA" },
    venue: "Providence Stadium",
    startTime: new Date("2026-06-14T14:00:00.000Z"),
    result: "team_b",
    winnerTeamShortName: "SA",
    summary: "South Africa won by 3 wickets",
    scorecard: {
      innings: [
        { teamShortName: "NZ", runs: 161, wickets: 9, overs: 20 },
        { teamShortName: "SA", runs: 162, wickets: 7, overs: 19.5 },
      ],
      topBatters: [
        { playerName: "Heinrich Klaasen", teamShortName: "SA", performance: "63 (41)" },
        { playerName: "Kane Williamson", teamShortName: "NZ", performance: "47 (36)" },
      ],
      topBowlers: [
        { playerName: "Trent Boult", teamShortName: "NZ", performance: "2/25" },
        { playerName: "Kagiso Rabada", teamShortName: "SA", performance: "3/30" },
      ],
      resultText: "South Africa won by 3 wickets",
    },
  },
  {
    externalMatchId: "WT20C-004",
    teamA: { name: "India", shortName: "IND" },
    teamB: { name: "Australia", shortName: "AUS" },
    venue: "Brian Lara Cricket Academy",
    startTime: new Date("2026-06-16T18:00:00.000Z"),
    result: "team_a",
    winnerTeamShortName: "IND",
    summary: "India won by 8 wickets",
    scorecard: {
      innings: [
        { teamShortName: "AUS", runs: 142, wickets: 9, overs: 20 },
        { teamShortName: "IND", runs: 143, wickets: 2, overs: 16.4 },
      ],
      topBatters: [
        { playerName: "Rohit Sharma", teamShortName: "IND", performance: "66 (43)" },
        { playerName: "Glenn Maxwell", teamShortName: "AUS", performance: "41 (28)" },
      ],
      topBowlers: [
        { playerName: "Jasprit Bumrah", teamShortName: "IND", performance: "3/20" },
        { playerName: "Adam Zampa", teamShortName: "AUS", performance: "1/24" },
      ],
      resultText: "India won by 8 wickets",
    },
  },
  {
    externalMatchId: "WT20C-005",
    teamA: { name: "Pakistan", shortName: "PAK" },
    teamB: { name: "England", shortName: "ENG" },
    venue: "Sir Vivian Richards Stadium",
    startTime: new Date("2026-06-17T14:00:00.000Z"),
    result: "team_b",
    winnerTeamShortName: "ENG",
    summary: "England won by 5 wickets",
    scorecard: {
      innings: [
        { teamShortName: "PAK", runs: 155, wickets: 8, overs: 20 },
        { teamShortName: "ENG", runs: 159, wickets: 5, overs: 18.2 },
      ],
      topBatters: [
        { playerName: "Phil Salt", teamShortName: "ENG", performance: "61 (37)" },
        { playerName: "Mohammad Rizwan", teamShortName: "PAK", performance: "46 (34)" },
      ],
      topBowlers: [
        { playerName: "Haris Rauf", teamShortName: "PAK", performance: "2/28" },
        { playerName: "Jofra Archer", teamShortName: "ENG", performance: "2/31" },
      ],
      resultText: "England won by 5 wickets",
    },
  },
];

const UPCOMING_MATCHES: Fixture[] = [
  {
    externalMatchId: "WT20C-UPC-001",
    teamA: { name: "New Zealand", shortName: "NZ" },
    teamB: { name: "South Africa", shortName: "SA" },
    venue: "Wankhede Stadium",
    startTime: new Date("2026-03-01T14:00:00.000Z"),
    summary: "Super 8 clash",
  },
  {
    externalMatchId: "WT20C-UPC-002",
    teamA: { name: "India", shortName: "IND" },
    teamB: { name: "Australia", shortName: "AUS" },
    venue: "Narendra Modi Stadium",
    startTime: new Date("2026-03-02T14:00:00.000Z"),
    summary: "High-intensity evening fixture",
  },
  {
    externalMatchId: "WT20C-UPC-003",
    teamA: { name: "England", shortName: "ENG" },
    teamB: { name: "Pakistan", shortName: "PAK" },
    venue: "Trent Bridge",
    startTime: new Date("2026-03-03T17:00:00.000Z"),
    summary: "Powerplay-heavy contest expected",
  },
  {
    externalMatchId: "WT20C-UPC-004",
    teamA: { name: "South Africa", shortName: "SA" },
    teamB: { name: "India", shortName: "IND" },
    venue: "Arun Jaitley Stadium",
    startTime: new Date("2026-03-04T14:00:00.000Z"),
    summary: "Day game under dry conditions",
  },
  {
    externalMatchId: "WT20C-UPC-005",
    teamA: { name: "Australia", shortName: "AUS" },
    teamB: { name: "New Zealand", shortName: "NZ" },
    venue: "Sydney Cricket Ground",
    startTime: new Date("2026-03-05T08:30:00.000Z"),
    summary: "Trans-Tasman rivalry fixture",
  },
  {
    externalMatchId: "WT20C-UPC-006",
    teamA: { name: "Pakistan", shortName: "PAK" },
    teamB: { name: "South Africa", shortName: "SA" },
    venue: "Gaddafi Stadium",
    startTime: new Date("2026-03-06T15:00:00.000Z"),
    summary: "Late-stage group decider",
  },
];

const parseRuns = (value: string) => {
  const match = value.match(/^(\d+)/);
  return match ? Number(match[1]) : 0;
};

const parseWickets = (value: string) => {
  const match = value.match(/^(\d+)\//);
  return match ? Number(match[1]) : 0;
};

const scoreSeed = (seed: string) =>
  Array.from(seed).reduce((sum, ch, index) => sum + ch.charCodeAt(0) * (index + 1), 0);

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const buildPlayerPerformances = (
  fixture: Fixture,
  status: FixtureStatus,
  players: Array<{ _id: unknown; fullName: string; teamShortName: string; role: string }>
) => {
  const intensity = 1;
  const byName = new Map(
    players.map((player) => [
      player.fullName,
      {
        playerId: String(player._id),
        playerName: player.fullName,
        teamShortName: player.teamShortName,
        runs: 0,
        wickets: 0,
        fours: 0,
        sixes: 0,
        maidens: 0,
        catches: 0,
        stumpings: 0,
        runOuts: 0,
      },
    ])
  );

  for (const player of players) {
    const profile = byName.get(player.fullName);
    if (!profile) continue;

    const seed = scoreSeed(`${fixture.externalMatchId}:${player.fullName}`);
    const role = player.role;

    const baseRuns =
      role === "batsman" || role === "wicket_keeper"
        ? 8 + (seed % 34)
        : role === "all_rounder"
        ? 5 + (seed % 26)
        : seed % 14;
    const baseWickets =
      role === "bowler"
        ? seed % 4
        : role === "all_rounder"
        ? seed % 3
        : 0;

    profile.runs = clamp(Math.round(baseRuns * intensity), 0, 95);
    profile.wickets = clamp(Math.round(baseWickets * intensity), 0, 5);
    profile.fours = clamp(Math.floor(profile.runs / 10), 0, 10);
    profile.sixes = clamp(Math.floor(profile.runs / 18), 0, 8);
    profile.maidens = role === "bowler" && profile.wickets >= 2 && seed % 2 === 0 ? 1 : 0;
    profile.catches = seed % 9 === 0 ? 1 : 0;
    profile.stumpings = role === "wicket_keeper" && seed % 17 === 0 ? 1 : 0;
    profile.runOuts = seed % 23 === 0 ? 1 : 0;
  }

  if (fixture.scorecard) {
    for (const item of fixture.scorecard.topBatters) {
      const profile = byName.get(item.playerName);
      if (!profile) continue;
      const runs = parseRuns(item.performance);
      profile.runs = Math.max(profile.runs, runs);
      profile.fours = clamp(Math.max(profile.fours, Math.floor(runs / 8)), 0, 14);
      profile.sixes = clamp(Math.max(profile.sixes, Math.floor(runs / 16)), 0, 10);
    }

    for (const item of fixture.scorecard.topBowlers) {
      const profile = byName.get(item.playerName);
      if (!profile) continue;
      const wickets = parseWickets(item.performance);
      profile.wickets = Math.max(profile.wickets, wickets);
      if (wickets >= 2) {
        profile.maidens = Math.max(profile.maidens, 1);
      }
    }
  }

  return Array.from(byName.values());
};

export async function seedMatches(input?: { sport?: string; league?: string }) {
  const sport = input?.sport || DEFAULT_SEED_SPORT;
  const league = input?.league || DEFAULT_SEED_LEAGUE;

  const fixtures = [
    ...COMPLETED_MATCHES.map((item) => ({ ...item, status: "completed" as const })),
    ...UPCOMING_MATCHES.map((item) => ({ ...item, status: "upcoming" as const })),
  ];

  console.log(`Seeding ${fixtures.length} matches (completed/upcoming)...`);

  for (const item of fixtures) {
    try {
      const match = await MatchModel.findOneAndUpdate(
        { source: SOURCE, externalMatchId: item.externalMatchId },
        {
          $set: {
            source: SOURCE,
            externalMatchId: item.externalMatchId,
            sport,
            league,
            teamA: item.teamA,
            teamB: item.teamB,
            venue: item.venue,
            startTime: item.startTime,
            status: item.status,
            result: item.status === "completed" && "result" in item ? item.result : null,
            winnerTeamShortName:
              item.status === "completed" && "winnerTeamShortName" in item
                ? item.winnerTeamShortName
                : null,
            summary: item.summary,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      const matchId = match._id.toString();

      if ("scorecard" in item && item.scorecard) {
        const [teamAPlayers, teamBPlayers] = await Promise.all([
          PlayerModel.find(
            { teamShortName: item.teamA.shortName, isPlaying: true },
            { _id: 1, fullName: 1, teamShortName: 1, role: 1 }
          ).lean(),
          PlayerModel.find(
            { teamShortName: item.teamB.shortName, isPlaying: true },
            { _id: 1, fullName: 1, teamShortName: 1, role: 1 }
          ).lean(),
        ]);

        const playerPerformances = buildPlayerPerformances(
          item,
          item.status,
          [...teamAPlayers, ...teamBPlayers]
        );

        const scorecard = await ScorecardModel.findOneAndUpdate(
          { matchId },
          {
            $set: {
              matchId,
              innings: item.scorecard.innings,
              topBatters: item.scorecard.topBatters,
              topBowlers: item.scorecard.topBowlers,
              playerPerformances,
              resultText: item.scorecard.resultText,
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await MatchModel.findByIdAndUpdate(match._id, {
          $set: { scorecardId: scorecard._id },
        });
      }

      console.log(
        `  ✓ ${item.status.toUpperCase()} ${item.externalMatchId} (${item.teamA.shortName} vs ${item.teamB.shortName})`
      );
    } catch (err: unknown) {
      console.warn(
        `  ✗ Failed to seed match ${item.externalMatchId}:`,
        err instanceof Error ? err.message : "Unknown seed error"
      );
    }
  }

  console.log("All match fixtures seeded.");
}
