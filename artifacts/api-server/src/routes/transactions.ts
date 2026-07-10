import { Router, type IRouter } from "express";
import { datamartFetch } from "../lib/datamart";
import { mapTransaction, unwrap, type DatamartTransaction } from "../lib/mapper";

const router: IRouter = Router();

// List transactions — proxies GET /api/store/v1/wallet/transactions
router.get("/transactions", async (req, res): Promise<void> => {
  try {
    const { page = "1", limit = "20", type } = req.query as Record<string, string | undefined>;
    const params = new URLSearchParams({ page, limit });
    if (type) params.set("type", type);

    const raw = await datamartFetch(`/api/store/v1/wallet/transactions?${params.toString()}`);
    const transactions = unwrap<DatamartTransaction>(raw).map(mapTransaction);
    res.json(transactions);
  } catch (err: unknown) {
    const e = err as { status?: number; body?: unknown; message?: string };
    res.status(e.status ?? 500).json({ error: e.body ?? e.message ?? "Failed to fetch transactions" });
  }
});

export default router;
