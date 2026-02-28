import mongoose from "mongoose";
import request from "supertest";
import app from "../../app";
import { ContestEntryModel } from "../../models/contest-entry.model";
import { MatchModel } from "../../models/match.model";
import { UserModel } from "../../models/user.model";

describe("Leaderboard API Integration Tests", () => {
  const runId = Date.now();
  const email = `leaderboard-${runId}@example.com`;
  const password = "password123";
  const league = `Leaderboard League ${runId}`;

  let token = "";
  let matchId = "";

  beforeAll(async () => {
    await UserModel.deleteMany({ email });
    await MatchModel.deleteMany({ league });

    await request(app).post("/api/auth/register").send({
      fullName: "Leaderboard User",
      email,
      password,
      confirmPassword: password,
    });

    const loginRes = await request(app).post("/api/auth/login").send({
      email,
      password,
    });
    token = loginRes.body.token;

    const match = await MatchModel.create({
      source: "internal_seed",
      externalMatchId: `LB-MATCH-${runId}`,
      sport: "cricket",
      league,
      season: "2026",
      teamA: { name: "India", shortName: "IND" },
      teamB: { name: "Pakistan", shortName: "PAK" },
      venue: "Leaderboard Ground",
      startTime: new Date("2026-07-01T12:00:00.000Z"),
      status: "upcoming",
      isEditable: true,
    });

    matchId = match._id.toString();
  });

  afterAll(async () => {
    await ContestEntryModel.deleteMany({ matchId: new mongoose.Types.ObjectId(matchId) });
    await MatchModel.deleteMany({ league });
    await UserModel.deleteMany({ email });
  });

  test("should list leaderboard contests without auth", async () => {
    const res = await request(app).get("/api/leaderboard/contests?status=upcoming");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("should reject my-entries without auth token", async () => {
    const res = await request(app).get("/api/leaderboard/my-entries");

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("should return empty my-entries list initially", async () => {
    const res = await request(app)
      .get("/api/leaderboard/my-entries")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("should fail contest entry submission for invalid match id", async () => {
    const res = await request(app)
      .post("/api/leaderboard/contests/invalid-id/entry")
      .set("Authorization", `Bearer ${token}`)
      .send({
        teamId: `team-${runId}`,
        teamName: "My XI",
        playerIds: ["p1"],
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should create contest entry for valid payload", async () => {
    const res = await request(app)
      .post(`/api/leaderboard/contests/${matchId}/entry`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        teamId: `team-${runId}`,
        teamName: "My XI",
        captainId: "captain-1",
        viceCaptainId: "vice-1",
        playerIds: ["p1", "p2", "p3"],
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.created).toBe(true);
    expect(res.body.data.entryId).toBeDefined();
  });

  test("should update existing contest entry on second submit", async () => {
    const res = await request(app)
      .post(`/api/leaderboard/contests/${matchId}/entry`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        teamId: `team-${runId}`,
        teamName: "My XI Updated",
        playerIds: ["p1", "p2"],
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.created).toBe(false);
  });

  test("should return leaderboard for valid match id", async () => {
    const res = await request(app)
      .get(`/api/leaderboard/contests/${matchId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.match).toBeDefined();
    expect(Array.isArray(res.body.data.leaders)).toBe(true);
  });

  test("should return my entries after submission", async () => {
    const res = await request(app)
      .get("/api/leaderboard/my-entries")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test("should delete my contest entry", async () => {
    const res = await request(app)
      .delete(`/api/leaderboard/contests/${matchId}/entry`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("should fail deleting non-existing contest entry", async () => {
    const res = await request(app)
      .delete(`/api/leaderboard/contests/${matchId}/entry`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
