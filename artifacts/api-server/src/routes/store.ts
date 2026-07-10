import { Router, type IRouter } from "express";
import { datamartFetch } from "../lib/datamart";

const router: IRouter = Router();

// Get store info — proxies GET /api/store/v1/store
router.get("/store", async (req, res): Promise<void> => {
  try {
    const data = await datamartFetch("/api/store/v1/store");
    res.json(data);
  } catch (err: unknown) {
    const e = err as { status?: number; body?: unknown; message?: string };
    res.status(e.status ?? 500).json({ error: e.body ?? e.message ?? "Failed to fetch store info" });
  }
});

export default router;
