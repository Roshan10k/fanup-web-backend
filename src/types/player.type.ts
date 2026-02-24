import { z } from "zod";
import { PlayerRoleEnum } from "./fantasy.enums";

export const PlayerStatsSchema = z.object({
  battingAverage: z.number().optional().nullable(),
  strikeRate: z.number().optional().nullable(),
  bowlingEconomy: z.number().optional().nullable(),
  wickets: z.number().optional().nullable(),
  runs: z.number().optional().nullable(),
  hundreds: z.number().optional().nullable(),
  fifties: z.number().optional().nullable(),
});

export const PlayerSchema = z.object({
  fullName: z.string().min(1),
  shortName: z.string().optional(),
  teamShortName: z.string().min(1),
  role: PlayerRoleEnum,
  credit: z.number().min(0).max(15),
  imageUrl: z.string().url().optional(),
  isPlaying: z.boolean().default(true),
  cricApiId: z.string().optional().nullable(),
  stats: PlayerStatsSchema.optional(),
});

export type PlayerType = z.infer<typeof PlayerSchema>;
export type PlayerStatsType = z.infer<typeof PlayerStatsSchema>;

export type PlayerDocument = PlayerType & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};
