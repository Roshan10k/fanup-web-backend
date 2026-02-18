import mongoose from "mongoose";
import { connectDatabase } from "../database/mongodb";
import { MatchModel } from "../models/match.model";
import { ScorecardModel } from "../models/scorecard.model";
import { PlayerModel } from "../models/player.model";
import { FantasyRuleModel } from "../models/fantasy-rule.model";

const LEAGUE = "ICC Men's T20 World Cup";
const SPORT = "cricket";
const SOURCE = "internal_seed";

const PLAYERS = [
  { fullName: "Rohit Sharma", teamShortName: "IND", role: "batsman", credit: 9.5 },
  { fullName: "Virat Kohli", teamShortName: "IND", role: "batsman", credit: 10 },
  { fullName: "Hardik Pandya", teamShortName: "IND", role: "all_rounder", credit: 9 },
  { fullName: "Rishabh Pant", teamShortName: "IND", role: "wicket_keeper", credit: 8.5 },
  { fullName: "Jasprit Bumrah", teamShortName: "IND", role: "bowler", credit: 9 },
  { fullName: "Shaheen Afridi", teamShortName: "PAK", role: "bowler", credit: 9 },
  { fullName: "Babar Azam", teamShortName: "PAK", role: "batsman", credit: 9.5 },
  { fullName: "Mohammad Rizwan", teamShortName: "PAK", role: "wicket_keeper", credit: 9 },
  { fullName: "Shadab Khan", teamShortName: "PAK", role: "all_rounder", credit: 8.5 },
  { fullName: "Haris Rauf", teamShortName: "PAK", role: "bowler", credit: 8.5 },
  { fullName: "Travis Head", teamShortName: "AUS", role: "batsman", credit: 9 },
  { fullName: "Pat Cummins", teamShortName: "AUS", role: "bowler", credit: 9 },
  { fullName: "Glenn Maxwell", teamShortName: "AUS", role: "all_rounder", credit: 9.5 },
  { fullName: "Josh Inglis", teamShortName: "AUS", role: "wicket_keeper", credit: 8 },
  { fullName: "Adam Zampa", teamShortName: "AUS", role: "bowler", credit: 8.5 },
  { fullName: "Jos Buttler", teamShortName: "ENG", role: "wicket_keeper", credit: 9.5 },
  { fullName: "Phil Salt", teamShortName: "ENG", role: "batsman", credit: 8.5 },
  { fullName: "Ben Stokes", teamShortName: "ENG", role: "all_rounder", credit: 9 },
  { fullName: "Jofra Archer", teamShortName: "ENG", role: "bowler", credit: 8.5 },
  { fullName: "Adil Rashid", teamShortName: "ENG", role: "bowler", credit: 8 },
  { fullName: "Kane Williamson", teamShortName: "NZ", role: "batsman", credit: 9 },
  { fullName: "Devon Conway", teamShortName: "NZ", role: "wicket_keeper", credit: 8.5 },
  { fullName: "Mitchell Santner", teamShortName: "NZ", role: "all_rounder", credit: 8.5 },
  { fullName: "Trent Boult", teamShortName: "NZ", role: "bowler", credit: 8.5 },
  { fullName: "Lockie Ferguson", teamShortName: "NZ", role: "bowler", credit: 8 },
  { fullName: "Quinton de Kock", teamShortName: "SA", role: "wicket_keeper", credit: 9 },
  { fullName: "Aiden Markram", teamShortName: "SA", role: "all_rounder", credit: 8.5 },
  { fullName: "Heinrich Klaasen", teamShortName: "SA", role: "batsman", credit: 9 },
  { fullName: "Kagiso Rabada", teamShortName: "SA", role: "bowler", credit: 8.5 },
  { fullName: "Anrich Nortje", teamShortName: "SA", role: "bowler", credit: 8 },
] as const;

const COMPLETED_MATCHES = [
  {
    externalMatchId: "WT20C-001",
    teamA: { name: "India", shortName: "IND" },
    teamB: { name: "Pakistan", shortName: "PAK" },
    venue: "Nassau County International Cricket Stadium",
    startTime: new Date("2026-06-12T14:00:00.000Z"),
    result: "team_a",
    winnerTeamShortName: "IND",
    summary: "India won by 6 runs",
    scorecard: {
      innings: [
        { teamShortName: "IND", runs: 153, wickets: 7, overs: 20 },
        { teamShortName: "PAK", runs: 147, wickets: 9, overs: 20 },
      ],
      topBatters: [
        { playerName: "Virat Kohli", teamShortName: "IND", performance: "58 (39)" },
        { playerName: "Babar Azam", teamShortName: "PAK", performance: "52 (42)" },
      ],
      topBowlers: [
        { playerName: "Jasprit Bumrah", teamShortName: "IND", performance: "3/18" },
        { playerName: "Shaheen Afridi", teamShortName: "PAK", performance: "2/24" },
      ],
      resultText: "India won by 6 runs",
    },
  },
  {
    externalMatchId: "WT20C-002",
    teamA: { name: "Australia", shortName: "AUS" },
    teamB: { name: "England", shortName: "ENG" },
    venue: "Kensington Oval",
    startTime: new Date("2026-06-13T18:00:00.000Z"),
    result: "team_a",
    winnerTeamShortName: "AUS",
    summary: "Australia won by 4 wickets",
    scorecard: {
      innings: [
        { teamShortName: "ENG", runs: 168, wickets: 8, overs: 20 },
        { teamShortName: "AUS", runs: 172, wickets: 6, overs: 19.3 },
      ],
      topBatters: [
        { playerName: "Travis Head", teamShortName: "AUS", performance: "71 (44)" },
        { playerName: "Jos Buttler", teamShortName: "ENG", performance: "49 (30)" },
      ],
      topBowlers: [
        { playerName: "Pat Cummins", teamShortName: "AUS", performance: "3/29" },
        { playerName: "Adil Rashid", teamShortName: "ENG", performance: "2/27" },
      ],
      resultText: "Australia won by 4 wickets",
    },
  },
  {
    externalMatchId: "WT20C-003",
    teamA: { name: "New Zealand", shortName: "NZ" },
    teamB: { name: "South Africa", shortName: "SA" },
    venue: "Providence Stadium",
    startTime: new Date("2026-06-14T14:00:00.000Z"),
    result: "team_b",
    winnerTeamShortName: "SA",
    summary: "South Africa won by 3 wickets",
    scorecard: {
      innings: [
        { teamShortName: "NZ", runs: 161, wickets: 9, overs: 20 },
        { teamShortName: "SA", runs: 162, wickets: 7, overs: 19.5 },
      ],
      topBatters: [
        { playerName: "Heinrich Klaasen", teamShortName: "SA", performance: "63 (41)" },
        { playerName: "Kane Williamson", teamShortName: "NZ", performance: "47 (36)" },
      ],
      topBowlers: [
        { playerName: "Trent Boult", teamShortName: "NZ", performance: "2/25" },
        { playerName: "Kagiso Rabada", teamShortName: "SA", performance: "3/30" },
      ],
      resultText: "South Africa won by 3 wickets",
    },
  },
  {
    externalMatchId: "WT20C-004",
    teamA: { name: "India", shortName: "IND" },
    teamB: { name: "Australia", shortName: "AUS" },
    venue: "Brian Lara Cricket Academy",
    startTime: new Date("2026-06-16T18:00:00.000Z"),
    result: "team_a",
    winnerTeamShortName: "IND",
    summary: "India won by 8 wickets",
    scorecard: {
      innings: [
        { teamShortName: "AUS", runs: 142, wickets: 9, overs: 20 },
        { teamShortName: "IND", runs: 143, wickets: 2, overs: 16.4 },
      ],
      topBatters: [
        { playerName: "Rohit Sharma", teamShortName: "IND", performance: "66 (43)" },
        { playerName: "Glenn Maxwell", teamShortName: "AUS", performance: "41 (28)" },
      ],
      topBowlers: [
        { playerName: "Jasprit Bumrah", teamShortName: "IND", performance: "3/20" },
        { playerName: "Adam Zampa", teamShortName: "AUS", performance: "1/24" },
      ],
      resultText: "India won by 8 wickets",
    },
  },
  {
    externalMatchId: "WT20C-005",
    teamA: { name: "Pakistan", shortName: "PAK" },
    teamB: { name: "England", shortName: "ENG" },
    venue: "Sir Vivian Richards Stadium",
    startTime: new Date("2026-06-17T14:00:00.000Z"),
    result: "team_b",
    winnerTeamShortName: "ENG",
    summary: "England won by 5 wickets",
    scorecard: {
      innings: [
        { teamShortName: "PAK", runs: 155, wickets: 8, overs: 20 },
        { teamShortName: "ENG", runs: 159, wickets: 5, overs: 18.2 },
      ],
      topBatters: [
        { playerName: "Phil Salt", teamShortName: "ENG", performance: "61 (37)" },
        { playerName: "Mohammad Rizwan", teamShortName: "PAK", performance: "46 (34)" },
      ],
      topBowlers: [
        { playerName: "Haris Rauf", teamShortName: "PAK", performance: "2/28" },
        { playerName: "Jofra Archer", teamShortName: "ENG", performance: "2/31" },
      ],
      resultText: "England won by 5 wickets",
    },
  },
];

async function seedFantasyRules() {
  await FantasyRuleModel.findOneAndUpdate(
    { sport: SPORT, league: LEAGUE },
    {
      $set: {
        sport: SPORT,
        league: LEAGUE,
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
}

async function seedPlayers() {
  for (const player of PLAYERS) {
    await PlayerModel.findOneAndUpdate(
      { fullName: player.fullName, teamShortName: player.teamShortName },
      {
        $set: {
          fullName: player.fullName,
          shortName: player.fullName.split(" ").slice(-1)[0],
          teamShortName: player.teamShortName,
          role: player.role,
          credit: player.credit,
          isPlaying: true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
}

async function seedCompletedMatches() {
  for (const item of COMPLETED_MATCHES) {
    const match = await MatchModel.findOneAndUpdate(
      { source: SOURCE, externalMatchId: item.externalMatchId },
      {
        $set: {
          source: SOURCE,
          externalMatchId: item.externalMatchId,
          sport: SPORT,
          league: LEAGUE,
          teamA: item.teamA,
          teamB: item.teamB,
          venue: item.venue,
          startTime: item.startTime,
          status: "completed",
          result: item.result,
          winnerTeamShortName: item.winnerTeamShortName,
          summary: item.summary,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const matchId = match._id.toString();
    let scorecard = await ScorecardModel.findOne({ matchId });
    if (!scorecard) {
      scorecard = await ScorecardModel.create({
        matchId,
        innings: item.scorecard.innings,
        topBatters: item.scorecard.topBatters,
        topBowlers: item.scorecard.topBowlers,
        resultText: item.scorecard.resultText,
      });
    } else {
      scorecard.innings = item.scorecard.innings;
      scorecard.topBatters = item.scorecard.topBatters;
      scorecard.topBowlers = item.scorecard.topBowlers;
      scorecard.resultText = item.scorecard.resultText;
      await scorecard.save();
    }

    await MatchModel.findByIdAndUpdate(match._id, {
      $set: { scorecardId: scorecard._id },
    });
  }
}

async function main() {
  await connectDatabase();
  await seedFantasyRules();
  await seedPlayers();
  await seedCompletedMatches();
  console.log("Fantasy seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Fantasy seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
