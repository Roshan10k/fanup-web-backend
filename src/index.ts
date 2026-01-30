import express, { Application, Request, Response } from "express";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import adminUserRoutes from "./routes/admin/user.route";
import path from "path";

import { connectDatabase } from "./database/mongodb";
import { PORT } from "./configs";

const app: Application = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public folder
app.use("/public", express.static(path.join(__dirname, "../public")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/users", adminUserRoutes);

// Test route
app.get("/", (req: Request, res: Response) => {
  return res
    .status(200)
    .json({ success: true, message: "Welcome to FanUp API" });
});

// Start server
async function startServer() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();