import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";

describe("Auth API Integration Tests", () => {
  const testUser = {
    fullName: "Test User",
    email: "test@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  beforeAll(async () => {
    await UserModel.deleteOne({ email: testUser.email });
  });

  afterAll(async () => {
    await UserModel.deleteOne({ email: testUser.email });
  });

  describe("POST /api/auth/register", () => {
    test("should validate missing fields", async () => {
      const res = await request(app).post("/api/auth/register").send({
        fullName: testUser.fullName,
        email: testUser.email,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("should register new user", async () => {
      const res = await request(app).post("/api/auth/register").send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("User registered successfully");
    });
  });

  describe("POST /api/auth/login", () => {
    test("should login with valid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    test("should fail with invalid email", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "wrong@example.com",
        password: testUser.password,
      });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
