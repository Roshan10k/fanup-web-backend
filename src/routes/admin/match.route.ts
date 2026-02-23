import { Router } from "express";
import { AdminMatchController } from "../../controllers/admin/match.controller";
import { adminMiddleware, authorizedMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();
const adminMatchController = new AdminMatchController();

// All routes require auth + admin middleware
router.use(authorizedMiddleware, adminMiddleware);

// Get all matches for admin dropdown
router.get("/matches", adminMatchController.getAllMatches);

// Get leaderboard for any match
router.get("/matches/:matchId/leaderboard", adminMatchController.getMatchLeaderboard);

// Lock a match (prevent new entries/edits)
router.patch("/matches/:matchId/lock", adminMatchController.lockMatch);

// Complete and settle a match (distribute prizes)
router.patch("/matches/:matchId/complete", adminMatchController.completeAndSettleMatch);

export default router;
