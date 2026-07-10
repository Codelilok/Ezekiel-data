import { Router, type IRouter } from "express";
import { datamartFetch } from "../lib/datamart";

const router: IRouter = Router();

// Search customers — proxies GET /api/store/v1/customers?q=&page=
router.get("/customers", async (req, res): Promise<void> => {
  try {
    const { q, page = "1" } = req.query as Record<string, string | undefined>;
    const params = new URLSearchParams({ page });
    if (q) params.set("q", q);

    const data = await datamartFetch(`/api/store/v1/customers?${params.toString()}`);
    res.json(data);
  } catch (err: unknown) {
    const e = err as { status?: number; body?: unknown; message?: string };
    res.status(e.status ?? 500).json({ error: e.body ?? e.message ?? "Failed to fetch customers" });
  }
});

// Get customer by phone — proxies GET /api/store/v1/customers/:phone
router.get("/customers/:phone", async (req, res): Promise<void> => {
  const { phone } = req.params;
  try {
    const data = await datamartFetch(`/api/store/v1/customers/${encodeURIComponent(phone)}`);
    res.json(data);
  } catch (err: unknown) {
    const e = err as { status?: number; body?: unknown; message?: string };
    if (e.status === 404) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }
    res.status(e.status ?? 500).json({ error: e.body ?? e.message ?? "Failed to fetch customer" });
  }
});

export default router;
