import express, { Application, Request, Response } from "express";
import cors from "cors"; 
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import adminUserRoutes from "./routes/admin/user.route";
import adminMatchRoutes from "./routes/admin/match.route";
import matchRoutes from "./routes/match.route";
import playerRoutes from "./routes/player.route";
import walletRoutes from "./routes/wallet.route";
import leaderboardRoutes from "./routes/leaderboard.route";
import notificationRoutes from "./routes/notification.route";
import path from "path";
import { CORS_ORIGINS } from "./configs";


const app: Application = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(
  cors({
    origin: CORS_ORIGINS,
    credentials: true,               
  })
);

// Serve static files for profile pictures
app.use(
  "/uploads/profile-pictures",
  express.static(path.join(__dirname, "../public/uploads/profile-pictures"))
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin", adminMatchRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/notifications", notificationRoutes);

export default app;
