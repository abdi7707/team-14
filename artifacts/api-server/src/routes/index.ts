import { Router } from "express";
import { authRouter } from "./auth";
import { documentsRouter } from "./documents";
import { healthRouter } from "./health";

export const router = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(documentsRouter);
