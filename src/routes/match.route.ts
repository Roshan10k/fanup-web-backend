import { Router } from "express";
import { MatchController } from "../controllers/match.controller";
import { adminMiddleware, authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const matchController = new MatchController();

router.get("/", matchController.listMatches);
router.get("/completed", matchController.getCompletedMatches);
router.get("/:id/scorecard", matchController.getMatchScorecard);
router.patch(
  "/:id/complete",
  authorizedMiddleware,
  adminMiddleware,
  matchController.completeMatchAndSettle
);

export default router;
