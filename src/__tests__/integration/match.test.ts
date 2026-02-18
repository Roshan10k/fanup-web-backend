import mongoose from "mongoose";
import request from "supertest";
import app from "../../app";
import { MatchModel } from "../../models/match.model";
import { ScorecardModel } from "../../models/scorecard.model";

describe("Match API Integration Tests", () => {
  const runId = Date.now();
  const league = `Test League ${runId}`;
  const otherLeague = `Other League ${runId}`;

  let matchWithScorecardId = "";
  let matchWithoutScorecardId = "";

  beforeAll(async () => {
    await ScorecardModel.deleteMany({
      resultText: { $in: [`Result ${runId}`, `Result 2 ${runId}`] },
    });
    await MatchModel.deleteMany({
      league: { $in: [league, otherLeague] },
    });

    const matchWithScorecard = await MatchModel.create({
      source: "internal_seed",
      externalMatchId: `TEST-MATCH-1-${runId}`,
      sport: "cricket",
      league,
      season: "2026",
      teamA: { name: "India", shortName: "IND" },
      teamB: { name: "Pakistan", shortName: "PAK" },
      venue: "Test Stadium",
      startTime: new Date("2026-06-01T12:00:00.000Z"),
      status: "completed",
      result: "team_a",
      winnerTeamShortName: "IND",
      summary: "India won by 10 runs",
    });

    const secondCompletedMatch = await MatchModel.create({
      source: "internal_seed",
      externalMatchId: `TEST-MATCH-2-${runId}`,
      sport: "cricket",
      league,
      season: "2026",
      teamA: { name: "Australia", shortName: "AUS" },
      teamB: { name: "England", shortName: "ENG" },
      venue: "Another Stadium",
      startTime: new Date("2026-06-02T12:00:00.000Z"),
      status: "completed",
      result: "team_b",
      winnerTeamShortName: "ENG",
      summary: "England won by 6 wickets",
    });

    const nonFilteredLeagueMatch = await MatchModel.create({
      source: "internal_seed",
      externalMatchId: `TEST-MATCH-3-${runId}`,
      sport: "cricket",
      league: otherLeague,
      season: "2026",
      teamA: { name: "New Zealand", shortName: "NZ" },
      teamB: { name: "South Africa", shortName: "SA" },
      venue: "Third Stadium",
      startTime: new Date("2026-06-03T12:00:00.000Z"),
      status: "completed",
      result: "team_b",
      winnerTeamShortName: "SA",
      summary: "South Africa won by 3 wickets",
    });

    const scorecard = await ScorecardModel.create({
      matchId: matchWithScorecard._id.toString(),
      innings: [
        { teamShortName: "IND", runs: 160, wickets: 6, overs: 20 },
        { teamShortName: "PAK", runs: 150, wickets: 8, overs: 20 },
      ],
      topBatters: [
        { playerName: "Virat Kohli", teamShortName: "IND", performance: "65 (45)" },
      ],
      topBowlers: [
        { playerName: "Jasprit Bumrah", teamShortName: "IND", performance: "3/20" },
      ],
      resultText: `Result ${runId}`,
    });

    await MatchModel.findByIdAndUpdate(matchWithScorecard._id, {
      $set: { scorecardId: scorecard._id },
    });

    matchWithScorecardId = matchWithScorecard._id.toString();
    matchWithoutScorecardId = secondCompletedMatch._id.toString();

    // Keep reference to avoid lint/no-unused under strict settings.
    void nonFilteredLeagueMatch;
  });

  afterAll(async () => {
    await ScorecardModel.deleteMany({
      resultText: { $in: [`Result ${runId}`, `Result 2 ${runId}`] },
    });
    await MatchModel.deleteMany({
      league: { $in: [league, otherLeague] },
    });
  });

  describe("GET /api/matches/completed", () => {
    test("should return completed matches with pagination", async () => {
      const res = await request(app).get("/api/matches/completed?page=1&size=2");

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.size).toBe(2);
    });

    test("should filter completed matches by league", async () => {
      const res = await request(app)
        .get("/api/matches/completed")
        .query({ league, page: "1", size: "10" });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(
        res.body.data.every((match: { league: string }) => match.league === league)
      ).toBe(true);
    });
  });

  describe("GET /api/matches/:id/scorecard", () => {
    test("should return match scorecard for valid match id", async () => {
      const res = await request(app).get(
        `/api/matches/${matchWithScorecardId}/scorecard`
      );

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.match).toBeDefined();
      expect(res.body.data.scorecard).toBeDefined();
      expect(res.body.data.match._id.toString()).toBe(matchWithScorecardId);
    });

    test("should return 400 for invalid match id", async () => {
      const res = await request(app).get("/api/matches/invalid-id/scorecard");

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid match id");
    });

    test("should return 404 when scorecard does not exist", async () => {
      const res = await request(app).get(
        `/api/matches/${matchWithoutScorecardId}/scorecard`
      );

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Scorecard not found");
    });

    test("should return 404 when match does not exist", async () => {
      const nonExistingMatchId = new mongoose.Types.ObjectId().toString();

      const res = await request(app).get(
        `/api/matches/${nonExistingMatchId}/scorecard`
      );

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Match not found");
    });
  });
});
