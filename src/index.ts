import express, { Application, Request, Response } from "express";
import authRoutes from "./routes/auth.route";

import { connectDatabase } from "./database/mongodb";
import { PORT } from "./configs";

const app: Application = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);

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