import { z } from "zod";

const TeamInningsSchema = z.object({
  teamShortName: z.string().min(1),
  runs: z.number().min(0),
  wickets: z.number().min(0).max(10),
  overs: z.number().min(0),
});

const TopPerformerSchema = z.object({
  playerName: z.string().min(1),
  teamShortName: z.string().min(1),
  performance: z.string().min(1),
});

const PlayerPerformanceSchema = z.object({
  playerId: z.string().min(1).optional(),
  playerName: z.string().min(1),
  teamShortName: z.string().min(1),
  runs: z.number().min(0).default(0),
  wickets: z.number().min(0).default(0),
  fours: z.number().min(0).default(0),
  sixes: z.number().min(0).default(0),
  maidens: z.number().min(0).default(0),
  catches: z.number().min(0).default(0),
  stumpings: z.number().min(0).default(0),
  runOuts: z.number().min(0).default(0),
});

export const ScorecardSchema = z.object({
  matchId: z.string().min(1),
  innings: z.array(TeamInningsSchema).min(1),
  topBatters: z.array(TopPerformerSchema).default([]),
  topBowlers: z.array(TopPerformerSchema).default([]),
  playerPerformances: z.array(PlayerPerformanceSchema).default([]),
  resultText: z.string().optional(),
});

export type ScorecardType = z.infer<typeof ScorecardSchema>;

export type ScorecardDocument = ScorecardType & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};
