import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";

import { PORT } from "./config";
import { connectDatabase } from "./database/mongodb";

const app: Application = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
//will add routes here later

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
