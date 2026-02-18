import { Router } from "express";
import { PlayerController } from "../controllers/player.controller";

const router = Router();
const playerController = new PlayerController();

router.get("/", playerController.getPlayers);

export default router;
