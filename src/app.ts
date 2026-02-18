import express, { Application, Request, Response } from "express";
import cors from "cors"; 
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import adminUserRoutes from "./routes/admin/user.route";
import matchRoutes from "./routes/match.route";
import playerRoutes from "./routes/player.route";
import path from "path";


const app: Application = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(
  cors({
    origin: "http://localhost:3000", 
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
app.use("/api/matches", matchRoutes);
app.use("/api/players", playerRoutes);

export default app;
