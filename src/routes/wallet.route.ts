import { Router } from "express";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { WalletController } from "../controllers/wallet.controller";

const router = Router();
const walletController = new WalletController();

router.get("/summary", authorizedMiddleware, walletController.getSummary);
router.get("/transactions", authorizedMiddleware, walletController.getTransactions);
router.post("/daily-bonus", authorizedMiddleware, walletController.claimDailyBonus);
router.post("/contest-join", authorizedMiddleware, walletController.contestJoinDebit);

export default router;
