import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { WalletTransactionModel } from "../../models/wallet-transaction.model";

describe("Wallet API Integration Tests", () => {
  const runId = Date.now();
  const email = `wallet-${runId}@example.com`;
  const password = "password123";

  let token = "";
  let userId = "";

  beforeAll(async () => {
    await UserModel.deleteMany({ email });

    await request(app).post("/api/auth/register").send({
      fullName: "Wallet User",
      email,
      password,
      confirmPassword: password,
    });

    const loginRes = await request(app).post("/api/auth/login").send({
      email,
      password,
    });
    token = loginRes.body.token;

    const user = await UserModel.findOne({ email });
    userId = user!._id.toString();
  });

  afterAll(async () => {
    await WalletTransactionModel.deleteMany({ userId });
    await UserModel.deleteMany({ email });
  });

  test("should reject wallet summary without auth token", async () => {
    const res = await request(app).get("/api/wallet/summary");

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("should return wallet summary for authenticated user", async () => {
    const res = await request(app)
      .get("/api/wallet/summary")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(typeof res.body.data.balance).toBe("number");
  });

  test("should return paginated wallet transactions", async () => {
    const res = await request(app)
      .get("/api/wallet/transactions?page=1&size=10")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  test("should fail contest join debit when required fields are missing", async () => {
    const res = await request(app)
      .post("/api/wallet/contest-join")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should apply contest join debit with valid payload", async () => {
    const res = await request(app)
      .post("/api/wallet/contest-join")
      .set("Authorization", `Bearer ${token}`)
      .send({
        matchId: `test-match-${runId}`,
        teamId: `team-${runId}`,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(typeof res.body.data.created).toBe("boolean");
  });

  test("should keep contest join debit idempotent for same event key", async () => {
    const payload = {
      matchId: `test-match-idempotent-${runId}`,
      teamId: `team-idempotent-${runId}`,
    };

    const first = await request(app)
      .post("/api/wallet/contest-join")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    const second = await request(app)
      .post("/api/wallet/contest-join")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(first.statusCode).toBe(200);
    expect(second.statusCode).toBe(200);
    expect(first.body.success).toBe(true);
    expect(second.body.success).toBe(true);
    expect(second.body.data.created).toBe(false);
  });

  test("should process daily bonus endpoint for authenticated user", async () => {
    const res = await request(app)
      .post("/api/wallet/daily-bonus")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(typeof res.body.data.created).toBe("boolean");
  });
});
