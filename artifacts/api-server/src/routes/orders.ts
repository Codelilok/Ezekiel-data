import { Router, type IRouter } from "express";
import { datamartFetch } from "../lib/datamart";
import { mapOrder, unwrap, unwrapOne, type DatamartOrder } from "../lib/mapper";

const router: IRouter = Router();

// List orders — proxies GET /api/store/v1/orders, returns mapped array
router.get("/orders", async (req, res): Promise<void> => {
  try {
    const { status, from, page, limit } = req.query as Record<string, string | undefined>;
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (from) params.set("from", from);
    params.set("page", page ?? "1");
    params.set("limit", limit ?? "20");

    const raw = await datamartFetch(`/api/store/v1/orders?${params.toString()}`);
    const orders = unwrap<DatamartOrder>(raw).map(mapOrder);
    res.json(orders);
  } catch (err: unknown) {
    const e = err as { status?: number; body?: unknown; message?: string };
    res.status(e.status ?? 500).json({ error: e.body ?? e.message ?? "Failed to fetch orders" });
  }
});

// Create order — proxies POST /api/store/v1/orders
router.post("/orders", async (req, res): Promise<void> => {
  try {
    const raw = await datamartFetch("/api/store/v1/orders", {
      method: "POST",
      body: JSON.stringify(req.body),
    });
    const order = unwrapOne<DatamartOrder>(raw);
    req.log.info("Order created via Datamart");
    res.status(201).json(order ? mapOrder(order) : raw);
  } catch (err: unknown) {
    const e = err as { status?: number; body?: unknown; message?: string };
    res.status(e.status ?? 500).json({ error: e.body ?? e.message ?? "Failed to create order" });
  }
});

// Track order — look up by reference via GET /api/store/v1/orders/:reference
router.get("/orders/track", async (req, res): Promise<void> => {
  const q = req.query["q"] as string | undefined;
  if (!q) {
    res.status(400).json({ error: "Query parameter 'q' is required" });
    return;
  }

  try {
    const raw = await datamartFetch(`/api/store/v1/orders/${encodeURIComponent(q)}`);
    const order = unwrapOne<DatamartOrder>(raw);
    res.json(order ? mapOrder(order) : raw);
  } catch (err: unknown) {
    const e = err as { status?: number; body?: unknown; message?: string };
    if (e.status === 404) {
      res.status(404).json({
        error: "No order found matching this ID or phone number. Please check and try again.",
      });
      return;
    }
    res.status(e.status ?? 500).json({ error: e.body ?? e.message ?? "Failed to track order" });
  }
});

// Get single order by reference — proxies GET /api/store/v1/orders/:reference
router.get("/orders/:reference", async (req, res): Promise<void> => {
  const { reference } = req.params;
  try {
    const raw = await datamartFetch(`/api/store/v1/orders/${encodeURIComponent(reference)}`);
    const order = unwrapOne<DatamartOrder>(raw);
    res.json(order ? mapOrder(order) : raw);
  } catch (err: unknown) {
    const e = err as { status?: number; body?: unknown; message?: string };
    if (e.status === 404) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.status(e.status ?? 500).json({ error: e.body ?? e.message ?? "Failed to fetch order" });
  }
});

export default router;
