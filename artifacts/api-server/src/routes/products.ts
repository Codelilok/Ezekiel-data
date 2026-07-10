import { Router, type IRouter } from "express";
import { datamartFetch } from "../lib/datamart";

const router: IRouter = Router();

// List available data products/bundles — proxies GET /api/store/v1/products
router.get("/products", async (req, res): Promise<void> => {
  try {
    const data = await datamartFetch("/api/store/v1/products");
    res.json(data);
  } catch (err: unknown) {
    const e = err as { status?: number; body?: unknown; message?: string };
    res.status(e.status ?? 500).json({ error: e.body ?? e.message ?? "Failed to fetch products" });
  }
});

export default router;
