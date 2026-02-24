import { Router } from "express";
import { PlayerController } from "../controllers/player.controller";

const router = Router();
const playerController = new PlayerController();

// Get players from database (static seed data)
router.get("/", playerController.getPlayers);

export default router;
