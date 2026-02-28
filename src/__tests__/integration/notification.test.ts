import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";
import { NotificationModel } from "../../models/notification.model";
import { DeviceTokenModel } from "../../models/device-token.model";

describe("Notification API Integration Tests", () => {
  const runId = Date.now();
  const email = `notification-${runId}@example.com`;
  const password = "password123";

  let token = "";
  let userId = "";
  let unreadNotificationId = "";
  let deleteNotificationId = "";

  beforeAll(async () => {
    await UserModel.deleteMany({ email });

    await request(app).post("/api/auth/register").send({
      fullName: "Notification User",
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

    const unread = await NotificationModel.create({
      userId,
      type: "system",
      title: "Unread notification",
      message: "Unread message",
      isRead: false,
    });

    const toDelete = await NotificationModel.create({
      userId,
      type: "system",
      title: "Delete notification",
      message: "Delete message",
      isRead: false,
    });

    unreadNotificationId = unread._id.toString();
    deleteNotificationId = toDelete._id.toString();
  });

  afterAll(async () => {
    await NotificationModel.deleteMany({ userId });
    await DeviceTokenModel.deleteMany({ userId });
    await UserModel.deleteMany({ email });
  });

  test("should reject notifications list without auth token", async () => {
    const res = await request(app).get("/api/notifications");

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("should return paginated notifications for authenticated user", async () => {
    const res = await request(app)
      .get("/api/notifications?page=1&size=20")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.rows)).toBe(true);
    expect(res.body.data.pagination).toBeDefined();
  });

  test("should return unread notification count", async () => {
    const res = await request(app)
      .get("/api/notifications/unread-count")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.count).toBe("number");
  });

  test("should mark one notification as read", async () => {
    const res = await request(app)
      .patch(`/api/notifications/${unreadNotificationId}/read`)
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isRead).toBe(true);
  });

  test("should return 404 for marking invalid notification id", async () => {
    const res = await request(app)
      .patch("/api/notifications/invalid-id/read")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("should mark all notifications as read", async () => {
    const res = await request(app)
      .patch("/api/notifications/read-all")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.markedCount).toBe("number");
  });

  test("should delete a notification", async () => {
    const res = await request(app)
      .delete(`/api/notifications/${deleteNotificationId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deleted).toBe(true);
  });

  test("should return 404 when deleting invalid notification id", async () => {
    const res = await request(app)
      .delete("/api/notifications/invalid-id")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("should register device token", async () => {
    const deviceToken = `device-token-${runId}-123456789012345`;
    const res = await request(app)
      .post("/api/notifications/devices/register")
      .set("Authorization", `Bearer ${token}`)
      .send({
        token: deviceToken,
        platform: "android",
        deviceId: `device-${runId}`,
        appVersion: "1.0.0",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBe(deviceToken);
    expect(res.body.data.platform).toBe("android");
  });

  test("should fail device token registration for invalid payload", async () => {
    const res = await request(app)
      .post("/api/notifications/devices/register")
      .set("Authorization", `Bearer ${token}`)
      .send({
        token: "short",
        platform: "android",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("should unregister device token", async () => {
    const tokenToDelete = `device-token-delete-${runId}-123456789012345`;
    await request(app)
      .post("/api/notifications/devices/register")
      .set("Authorization", `Bearer ${token}`)
      .send({
        token: tokenToDelete,
        platform: "ios",
      });

    const res = await request(app)
      .delete(`/api/notifications/devices/${tokenToDelete}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.deactivated).toBe("boolean");
  });

  test("should fail unregistering device token when token param is empty", async () => {
    const res = await request(app)
      .delete("/api/notifications/devices/%20")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
