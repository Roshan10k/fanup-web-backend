import { FantasyRuleModel } from "../../models/fantasy-rule.model";

export const DEFAULT_SEED_SPORT = "cricket";
export const DEFAULT_SEED_LEAGUE = "ICC Men's T20 World Cup";

export async function seedFantasyRules(input?: { sport?: string; league?: string }) {
  const sport = input?.sport || DEFAULT_SEED_SPORT;
  const league = input?.league || DEFAULT_SEED_LEAGUE;

  console.log("Seeding fantasy rules...");
  await FantasyRuleModel.findOneAndUpdate(
    { sport, league },
    {
      $set: {
        sport,
        league,
        teamSize: 11,
        creditCap: 100,
        roleLimits: {
          wicket_keeper: { min: 1, max: 4 },
          batsman: { min: 3, max: 6 },
          all_rounder: { min: 1, max: 4 },
          bowler: { min: 3, max: 6 },
        },
        captainMultiplier: 2,
        viceCaptainMultiplier: 1.5,
        pointsTable: {
          run: 1,
          four: 1,
          six: 2,
          wicket: 25,
          maiden_over: 12,
          catch: 8,
          stumping: 12,
          run_out: 6,
        },
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log("Fantasy rules seeded.");
}
