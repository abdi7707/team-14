import { Router } from "express";
import { authRouter } from "./auth";
import { documentsRouter } from "./documents";
import { healthRouter } from "./health";
import { paymentsRouter } from "./payments";

export const router = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(documentsRouter);
router.use(paymentsRouter);
