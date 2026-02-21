import mongoose from "mongoose";
import { connectDatabase } from "../database/mongodb";
import {
  DEFAULT_SEED_LEAGUE,
  DEFAULT_SEED_SPORT,
  seedFantasyRules,
} from "./seeds/seed-fantasy-rules";
import { seedPlayers } from "./seeds/seed-players";
import { seedMatches } from "./seeds/seed-matches";

async function main() {
  await connectDatabase();
  await seedFantasyRules({ sport: DEFAULT_SEED_SPORT, league: DEFAULT_SEED_LEAGUE });
  await seedPlayers();
  await seedMatches({ sport: DEFAULT_SEED_SPORT, league: DEFAULT_SEED_LEAGUE });
  console.log("\n✅ Fantasy seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Fantasy seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
