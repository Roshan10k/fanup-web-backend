import mongoose from "mongoose";
import request from "supertest";
import app from "../../app";
import { MatchModel } from "../../models/match.model";
import { UserModel } from "../../models/user.model";

describe("Admin Match API Integration Tests", () => {
  const runId = Date.now();
  const adminEmail = `admin-match-${runId}@example.com`;
  const userEmail = `admin-match-user-${runId}@example.com`;
  const password = "password123";
  const league = `Admin Match League ${runId}`;

  let adminToken = "";
  let userToken = "";
  let lockMatchId = "";
  let completeMatchId = "";

  beforeAll(async () => {
    await UserModel.deleteMany({
      email: { $in: [adminEmail, userEmail] },
    });
    await MatchModel.deleteMany({ league });

    await request(app).post("/api/auth/register").send({
      fullName: "Admin Match User",
      email: adminEmail,
      password,
      confirmPassword: password,
    });

    await request(app).post("/api/auth/register").send({
      fullName: "Normal User",
      email: userEmail,
      password,
      confirmPassword: password,
    });

    await UserModel.updateOne({ email: adminEmail }, { $set: { role: "admin" } });

    const adminLogin = await request(app).post("/api/auth/login").send({
      email: adminEmail,
      password,
    });
    adminToken = adminLogin.body.token;

    const userLogin = await request(app).post("/api/auth/login").send({
      email: userEmail,
      password,
    });
    userToken = userLogin.body.token;

    const lockMatch = await MatchModel.create({
      source: "internal_seed",
      externalMatchId: `ADMIN-LOCK-${runId}`,
      sport: "cricket",
      league,
      season: "2026",
      teamA: { name: "India", shortName: "IND" },
      teamB: { name: "Pakistan", shortName: "PAK" },
      venue: "Admin Stadium 1",
      startTime: new Date("2026-08-01T12:00:00.000Z"),
      status: "upcoming",
      isEditable: true,
    });
    lockMatchId = lockMatch._id.toString();

    const completeMatch = await MatchModel.create({
      source: "internal_seed",
      externalMatchId: `ADMIN-COMPLETE-${runId}`,
      sport: "cricket",
      league,
      season: "2026",
      teamA: { name: "Australia", shortName: "AUS" },
      teamB: { name: "England", shortName: "ENG" },
      venue: "Admin Stadium 2",
      startTime: new Date("2026-08-02T12:00:00.000Z"),
      status: "upcoming",
      isEditable: true,
    });
    completeMatchId = completeMatch._id.toString();
  });

  afterAll(async () => {
    await MatchModel.deleteMany({ league });
    await UserModel.deleteMany({
      email: { $in: [adminEmail, userEmail] },
    });
  });

  test("should reject admin match routes without auth token", async () => {
    const res = await request(app).get("/api/admin/matches");

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("should reject admin match routes for non-admin user", async () => {
    const res = await request(app)
      .get("/api/admin/matches")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("should list matches for admin", async () => {
    const res = await request(app)
      .get("/api/admin/matches?status=upcoming&limit=10")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test("should get leaderboard for a valid match id", async () => {
    const res = await request(app)
      .get(`/api/admin/matches/${lockMatchId}/leaderboard`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.match).toBeDefined();
    expect(Array.isArray(res.body.data.leaders)).toBe(true);
  });

  test("should fail leaderboard for invalid match id", async () => {
    const res = await request(app)
      .get("/api/admin/matches/invalid-id/leaderboard")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should lock an upcoming match", async () => {
    const res = await request(app)
      .patch(`/api/admin/matches/${lockMatchId}/lock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.success).toBe(true);
  });

  test("should fail locking an already locked match", async () => {
    const res = await request(app)
      .patch(`/api/admin/matches/${lockMatchId}/lock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should complete and settle a match", async () => {
    const res = await request(app)
      .patch(`/api/admin/matches/${completeMatchId}/complete`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        result: "team_a",
        winnerTeamShortName: "AUS",
        summary: "Australia won by 8 wickets",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.settled).toBe(true);
  });

  test("should fail complete for invalid match id", async () => {
    const res = await request(app)
      .patch("/api/admin/matches/invalid-id/complete")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        result: "team_a",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should return 404 for non-existing valid object id match", async () => {
    const missingId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .patch(`/api/admin/matches/${missingId}/lock`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
