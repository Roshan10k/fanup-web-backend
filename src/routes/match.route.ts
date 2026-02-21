import { Router } from "express";
import { MatchController } from "../controllers/match.controller";

const router = Router();
const matchController = new MatchController();

router.get("/", matchController.listMatches);
router.get("/completed", matchController.getCompletedMatches);
router.get("/:id/scorecard", matchController.getMatchScorecard);

export default router;
