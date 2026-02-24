import mongoose from "mongoose";
import { connectDatabase } from "../database/mongodb";
import { seedFantasyRules } from "./seeds/seed-fantasy-rules";
import { seedIPL2024Players } from "./seeds/seed-ipl2024-players";
import { seedIPL2024Matches } from "./seeds/seed-ipl2024-matches";

async function main() {
  await connectDatabase();
  console.log("✅ Connected to database");

  await seedFantasyRules({ sport: "cricket", league: "Indian Premier League" });
  
  // Use static IPL 2024 players - no API calls!
  const playerResult = await seedIPL2024Players();
  console.log(`\n📊 Players: ${playerResult.upserted} upserted, ${playerResult.errors} errors`);

  // Use static IPL 2024 matches with full scorecards
  await seedIPL2024Matches();
  
  console.log("\n✅ Fantasy seed completed successfully.");
  console.log("📡 API calls: 0 (fully offline)\n");
}

main()
  .catch((error) => {
    console.error("Fantasy seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
