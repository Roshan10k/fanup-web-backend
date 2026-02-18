import { z } from "zod";

export const SportEnum = z.enum(["cricket"]);
export const MatchStatusEnum = z.enum([
  "upcoming",
  "live",
  "completed",
  "abandoned",
]);
export const MatchResultEnum = z.enum(["team_a", "team_b", "draw", "no_result"]);
export const PlayerRoleEnum = z.enum([
  "wicket_keeper",
  "batsman",
  "all_rounder",
  "bowler",
]);
export const DataSourceEnum = z.enum(["internal_seed", "external_provider"]);

export type Sport = z.infer<typeof SportEnum>;
export type MatchStatus = z.infer<typeof MatchStatusEnum>;
export type MatchResult = z.infer<typeof MatchResultEnum>;
export type PlayerRole = z.infer<typeof PlayerRoleEnum>;
export type DataSource = z.infer<typeof DataSourceEnum>;
