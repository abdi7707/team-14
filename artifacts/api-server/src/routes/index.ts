import { Router } from "express";
import { authRouter } from "./auth";
import { healthRouter } from "./health";

export const router = Router();

router.use(healthRouter);
router.use(authRouter);
