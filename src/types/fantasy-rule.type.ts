import { z } from "zod";
import { SportEnum } from "./fantasy.enums";

const RoleLimitSchema = z.object({
  min: z.number().int().min(0),
  max: z.number().int().min(0),
});

export const FantasyRuleSchema = z.object({
  sport: SportEnum.default("cricket"),
  league: z.string().min(1),
  teamSize: z.number().int().min(1),
  creditCap: z.number().min(1),
  roleLimits: z.object({
    wicket_keeper: RoleLimitSchema,
    batsman: RoleLimitSchema,
    all_rounder: RoleLimitSchema,
    bowler: RoleLimitSchema,
  }),
  captainMultiplier: z.number().min(1).default(2),
  viceCaptainMultiplier: z.number().min(1).default(1.5),
  pointsTable: z.record(z.string(), z.number()),
});

export type FantasyRuleType = z.infer<typeof FantasyRuleSchema>;

export type FantasyRuleDocument = FantasyRuleType & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};
