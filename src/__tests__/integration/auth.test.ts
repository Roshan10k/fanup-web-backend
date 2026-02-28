jest.mock("../../configs/email", () => ({
  sendEmail: jest.fn().mockResolvedValue(undefined),
}));

import jwt from "jsonwebtoken";
import request from "supertest";
import app from "../../app";
import { JWT_SECRET } from "../../configs";
import { sendEmail } from "../../configs/email";
import { UserModel } from "../../models/user.model";

const mockedSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;

const createUserPayload = (email: string, fullName = "Test User") => ({
  fullName,
  email,
  password: "password123",
  confirmPassword: "password123",
});

describe("Auth API Integration Tests", () => {
  const runId = Date.now();

  const registerEmail = `register-${runId}@example.com`;
  const loginEmail = `login-${runId}@example.com`;
  const resetEmail = `reset-${runId}@example.com`;
  const profileEmail = `profile-${runId}@example.com`;
  const otherEmail = `other-${runId}@example.com`;

  beforeAll(async () => {
    await UserModel.deleteMany({
      email: { $in: [registerEmail, loginEmail, resetEmail, profileEmail, otherEmail] },
    });

    await request(app).post("/api/auth/register").send(createUserPayload(loginEmail, "Login User"));
    await request(app).post("/api/auth/register").send(createUserPayload(resetEmail, "Reset User"));
    await request(app).post("/api/auth/register").send(createUserPayload(profileEmail, "Profile User"));
    await request(app).post("/api/auth/register").send(createUserPayload(otherEmail, "Other User"));
  });

  afterAll(async () => {
    await UserModel.deleteMany({
      email: { $in: [registerEmail, loginEmail, resetEmail, profileEmail, otherEmail] },
    });
  });

  describe("POST /api/auth/register", () => {
    test("1. should fail when required fields are missing", async () => {
      const res = await request(app).post("/api/auth/register").send({
        fullName: "Only Name",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("2. should fail for invalid email", async () => {
      const res = await request(app).post("/api/auth/register").send({
        fullName: "Invalid Email",
        email: "invalid-email",
        password: "password123",
        confirmPassword: "password123",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("3. should fail for short password", async () => {
      const res = await request(app).post("/api/auth/register").send({
        fullName: "Short Password",
        email: `short-pass-${runId}@example.com`,
        password: "123",
        confirmPassword: "123",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("4. should fail when passwords do not match", async () => {
      const res = await request(app).post("/api/auth/register").send({
        fullName: "Mismatch",
        email: `mismatch-${runId}@example.com`,
        password: "password123",
        confirmPassword: "password999",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Passwords do not match");
    });

    test("5. should register a new user", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(createUserPayload(registerEmail, "Register User"));

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("User registered successfully");
      expect(res.body.data.email).toBe(registerEmail);
    });

    test("6. should not return password in register response", async () => {
      const res = await request(app).post("/api/auth/register").send({
        fullName: "No Password Response",
        email: `no-password-${runId}@example.com`,
        password: "password123",
        confirmPassword: "password123",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.password).toBeUndefined();
      await UserModel.deleteOne({ email: `no-password-${runId}@example.com` });
    });

    test("7. should reject duplicate email registration", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(createUserPayload(registerEmail, "Duplicate Register"));

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Email already in use");
    });

    test("8. should ignore unknown fields and keep default role", async () => {
      const email = `unknown-field-${runId}@example.com`;
      const res = await request(app).post("/api/auth/register").send({
        ...createUserPayload(email, "Unknown Field User"),
        role: "admin",
        randomField: "ignored",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe("user");

      await UserModel.deleteOne({ email });
    });
  });

  describe("POST /api/auth/login", () => {
    test("9. should login with valid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: loginEmail,
        password: "password123",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    test("10. should not return password in login response", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: loginEmail,
        password: "password123",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.password).toBeUndefined();
    });

    test("11. should fail for invalid email format", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "not-an-email",
        password: "password123",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("12. should fail when password is missing", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: loginEmail,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test("13. should fail for unknown email", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: `missing-${runId}@example.com`,
        password: "password123",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid credentials");
    });

    test("14. should fail for wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: loginEmail,
        password: "wrong-password",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid credentials");
    });
  });

  describe("POST /api/auth/request-password-reset", () => {
    test("15. should fail when email is missing", async () => {
      const res = await request(app).post("/api/auth/request-password-reset").send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Email is required");
    });

    test("16. should return generic success for unknown email", async () => {
      mockedSendEmail.mockClear();

      const res = await request(app).post("/api/auth/request-password-reset").send({
        email: `unknown-reset-${runId}@example.com`,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockedSendEmail).not.toHaveBeenCalled();
    });

    test("17. should send reset email for existing user", async () => {
      mockedSendEmail.mockClear();

      const res = await request(app).post("/api/auth/request-password-reset").send({
        email: resetEmail,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockedSendEmail).toHaveBeenCalledTimes(1);
      expect(mockedSendEmail).toHaveBeenCalledWith(
        resetEmail,
        "Password Reset",
        expect.stringContaining("reset-password"),
      );
    });
  });

  describe("POST /api/auth/reset-password/:token", () => {
    test("18. should fail when token is invalid", async () => {
      const res = await request(app).post("/api/auth/reset-password/invalid-token").send({
        newPassword: "newPassword123",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid or expired token");
    });

    test("19. should fail when new password is missing", async () => {
      const user = await UserModel.findOne({ email: resetEmail });
      const token = jwt.sign({ id: user!._id }, JWT_SECRET, { expiresIn: "1h" });

      const res = await request(app).post(`/api/auth/reset-password/${token}`).send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid or expired token");
    });

    test("20. should reset password successfully", async () => {
      const user = await UserModel.findOne({ email: resetEmail });
      const token = jwt.sign({ id: user!._id }, JWT_SECRET, { expiresIn: "1h" });

      const res = await request(app).post(`/api/auth/reset-password/${token}`).send({
        newPassword: "newPassword123",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Password has been reset successfully.");

      const loginRes = await request(app).post("/api/auth/login").send({
        email: resetEmail,
        password: "newPassword123",
      });
      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body.success).toBe(true);
    });
  });

  describe("PUT /api/auth/:id", () => {
    test("21. should reject update when authorization header is missing", async () => {
      const profileUser = await UserModel.findOne({ email: profileEmail });

      const res = await request(app).put(`/api/auth/${profileUser!._id}`).send({
        fullName: "No Auth",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Unauthorized: JWT invalid");
    });

    test("22. should reject updating another user's profile", async () => {
      const loginRes = await request(app).post("/api/auth/login").send({
        email: profileEmail,
        password: "password123",
      });
      const token = loginRes.body.token;

      const otherUser = await UserModel.findOne({ email: otherEmail });

      const res = await request(app)
        .put(`/api/auth/${otherUser!._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ fullName: "Hacker Name" });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Forbidden: Cannot update another user's profile");
    });

    test("23. should update own profile", async () => {
      const loginRes = await request(app).post("/api/auth/login").send({
        email: profileEmail,
        password: "password123",
      });
      const token = loginRes.body.token;

      const profileUser = await UserModel.findOne({ email: profileEmail });

      const res = await request(app)
        .put(`/api/auth/${profileUser!._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ fullName: "Updated Profile Name" });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("User updated successfully");
      expect(res.body.data.fullName).toBe("Updated Profile Name");
    });
  });

  describe("POST /api/auth/upload-profile-photo", () => {
    test("24. should fail upload without file", async () => {
      const loginRes = await request(app).post("/api/auth/login").send({
        email: profileEmail,
        password: "password123",
      });
      const token = loginRes.body.token;

      const res = await request(app)
        .post("/api/auth/upload-profile-photo")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("No file uploaded");
    });

    test("25. should upload profile picture successfully", async () => {
      const loginRes = await request(app).post("/api/auth/login").send({
        email: profileEmail,
        password: "password123",
      });
      const token = loginRes.body.token;

      const res = await request(app)
        .post("/api/auth/upload-profile-photo")
        .set("Authorization", `Bearer ${token}`)
        .attach("photo", Buffer.from("fake-image-content"), {
          filename: "avatar.jpg",
          contentType: "image/jpeg",
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Profile picture uploaded successfully");
      expect(res.body.data.profilePicture).toBeDefined();
    });
  });
});
