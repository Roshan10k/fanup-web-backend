/**
 * Standalone script to seed IPL 2024 players
 * Run: npx ts-node src/scripts/seed-ipl2024.ts
 * 
 * 100% offline - no API calls!
 */

import mongoose from "mongoose";
import { connectDatabase } from "../database/mongodb";
import { seedIPL2024Players } from "./seeds/seed-ipl2024-players";

async function main() {
  await connectDatabase();
  console.log("✅ Connected to database");

  const result = await seedIPL2024Players();

  console.log("\n" + "=".repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Upserted : ${result.upserted} players`);
  console.log(`   ❌ Errors   : ${result.errors} players`);
  console.log(`   📡 API calls: 0  (fully offline)\n`);
}

main()
  .catch((err) => {
    console.error("\n❌ Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
