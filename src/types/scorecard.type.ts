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

export const ScorecardSchema = z.object({
  matchId: z.string().min(1),
  innings: z.array(TeamInningsSchema).min(1),
  topBatters: z.array(TopPerformerSchema).default([]),
  topBowlers: z.array(TopPerformerSchema).default([]),
  resultText: z.string().optional(),
});

export type ScorecardType = z.infer<typeof ScorecardSchema>;

export type ScorecardDocument = ScorecardType & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};
