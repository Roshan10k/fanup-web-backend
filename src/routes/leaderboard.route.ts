import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { LeaderboardController } from "../controllers/leaderboard.controller";

const router = Router();
const leaderboardController = new LeaderboardController();

router.get("/contests", leaderboardController.listMatchContests);
router.get("/my-entries", authorizedMiddleware, leaderboardController.getMyEntries);
router.post(
  "/contests/:matchId/entry",
  authorizedMiddleware,
  leaderboardController.submitContestEntry
);
router.delete(
  "/contests/:matchId/entry",
  authorizedMiddleware,
  leaderboardController.deleteMyEntry
);
router.get(
  "/contests/:matchId",
  authorizedMiddleware,
  leaderboardController.getMatchContestLeaderboard
);

export default router;
