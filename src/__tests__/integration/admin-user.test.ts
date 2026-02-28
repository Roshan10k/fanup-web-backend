import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";

describe("Admin User API Integration Tests", () => {
  const runId = Date.now();
  const adminEmail = `admin-user-${runId}@example.com`;
  const userEmail = `normal-user-${runId}@example.com`;
  const createdByAdminEmail = `created-by-admin-${runId}@example.com`;

  const password = "password123";

  let adminToken = "";
  let userToken = "";
  let normalUserId = "";
  let adminCreatedUserId = "";

  beforeAll(async () => {
    await UserModel.deleteMany({
      email: { $in: [adminEmail, userEmail, createdByAdminEmail] },
    });

    await request(app).post("/api/auth/register").send({
      fullName: "Admin User",
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

    const normalUser = await UserModel.findOne({ email: userEmail });
    normalUserId = normalUser!._id.toString();
  });

  afterAll(async () => {
    await UserModel.deleteMany({
      email: { $in: [adminEmail, userEmail, createdByAdminEmail] },
    });
  });

  test("should reject admin routes without auth token", async () => {
    const res = await request(app).get("/api/admin/users");

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("should reject admin routes for non-admin user", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("should get admin user stats", async () => {
    const res = await request(app)
      .get("/api/admin/users/stats")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(typeof res.body.data.totalUsers).toBe("number");
  });

  test("should get all users for admin", async () => {
    const res = await request(app)
      .get("/api/admin/users?page=1&size=10")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  test("should get user by id for admin", async () => {
    const res = await request(app)
      .get(`/api/admin/users/${normalUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(normalUserId);
    expect(res.body.data.password).toBeUndefined();
  });

  test("should create user as admin", async () => {
    const res = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        fullName: "Created By Admin",
        email: createdByAdminEmail,
        password,
        confirmPassword: password,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(createdByAdminEmail);

    adminCreatedUserId = res.body.data._id;
  });

  test("should update any user as admin", async () => {
    const res = await request(app)
      .put(`/api/admin/users/${normalUserId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        fullName: "Updated By Admin",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fullName).toBe("Updated By Admin");
  });

  test("should delete admin-created user", async () => {
    const res = await request(app)
      .delete(`/api/admin/users/${adminCreatedUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("should return 404 for deleting non-existing user", async () => {
    const res = await request(app)
      .delete(`/api/admin/users/${adminCreatedUserId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
