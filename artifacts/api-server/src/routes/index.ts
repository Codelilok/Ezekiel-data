import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ordersRouter from "./orders";
import dashboardRouter from "./dashboard";
import transactionsRouter from "./transactions";
import productsRouter from "./products";
import customersRouter from "./customers";
import storeRouter from "./store";

const router: IRouter = Router();

router.use(healthRouter);
router.use(ordersRouter);
router.use(dashboardRouter);
router.use(transactionsRouter);
router.use(productsRouter);
router.use(customersRouter);
router.use(storeRouter);

export default router;
