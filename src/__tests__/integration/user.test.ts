import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";

describe("User API Integration Tests", () => {
  const runId = Date.now();
  const email = `user-${runId}@example.com`;
  const password = "password123";

  let token = "";

  beforeAll(async () => {
    await UserModel.deleteMany({ email });

    await request(app).post("/api/auth/register").send({
      fullName: "User Profile",
      email,
      password,
      confirmPassword: password,
    });

    const loginRes = await request(app).post("/api/auth/login").send({
      email,
      password,
    });
    token = loginRes.body.token;
  });

  afterAll(async () => {
    await UserModel.deleteMany({ email });
  });

  test("should reject profile request without auth token", async () => {
    const res = await request(app).get("/api/users/profile");

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("should return authenticated user profile", async () => {
    const res = await request(app)
      .get("/api/users/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(email);
    expect(res.body.data.password).toBeUndefined();
  });

  test("should update authenticated user profile", async () => {
    const res = await request(app)
      .put("/api/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fullName: "Updated User Profile",
        phone: "9800000000",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fullName).toBe("Updated User Profile");
    expect(res.body.data.phone).toBe("9800000000");
  });

  test("should fail update for invalid payload", async () => {
    const res = await request(app)
      .put("/api/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        phone: "1",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should return profile stats for authenticated user", async () => {
    const res = await request(app)
      .get("/api/users/profile/stats")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(typeof res.body.data.profileCompletion).toBe("number");
    expect(Array.isArray(res.body.data.missingFields)).toBe(true);
  });
});
