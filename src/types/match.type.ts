import { z } from "zod";
import {
  DataSourceEnum,
  MatchResultEnum,
  MatchStatusEnum,
  SportEnum,
} from "./fantasy.enums";

const TeamInfoSchema = z.object({
  name: z.string().min(1),
  shortName: z.string().min(1),
  logoUrl: z.string().url().optional(),
});

export const MatchSchema = z.object({
  externalMatchId: z.string().optional(),
  source: DataSourceEnum.default("internal_seed"),
  sport: SportEnum.default("cricket"),
  league: z.string().min(1),
  season: z.string().optional(),
  teamA: TeamInfoSchema,
  teamB: TeamInfoSchema,
  venue: z.string().optional(),
  startTime: z.date(),
  status: MatchStatusEnum.default("upcoming"),
  isEditable: z.boolean().default(true),
  result: MatchResultEnum.optional(),
  winnerTeamShortName: z.string().optional(),
  summary: z.string().optional(),
  scorecardId: z.string().optional(),
});

export type MatchType = z.infer<typeof MatchSchema>;

export type MatchDocument = MatchType & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};
