import { Router, type IRouter } from "express";
import { eq, desc, or, sql } from "drizzle-orm";
import { db, ordersTable, transactionsTable, walletTable } from "@workspace/db";
import {
  CreateOrderBody,
  ListOrdersQueryParams,
  TrackOrderQueryParams,
  GetOrderParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/orders", async (req, res): Promise<void> => {
  const parsed = ListOrdersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { limit = 20, network, status } = parsed.data;

  let query = db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt))
    .$dynamic();

  const conditions = [];
  if (network) conditions.push(eq(ordersTable.network, network));
  if (status) conditions.push(eq(ordersTable.status, status));

  if (conditions.length > 0) {
    for (const cond of conditions) {
      query = query.where(cond) as typeof query;
    }
  }

  const orders = await query.limit(limit);
  res.json(orders);
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const orderId =
    "NSW-" +
    Math.random().toString(36).substring(2, 10).toUpperCase();

  const statuses = ["pending", "completed", "completed", "completed"];
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  const [order] = await db
    .insert(ordersTable)
    .values({ ...parsed.data, orderId, status })
    .returning();

  await db
    .insert(transactionsTable)
    .values({
      type: "debit",
      amount: parsed.data.price,
      description: `${parsed.data.bundleSize} data for ${parsed.data.phone} (${parsed.data.network})`,
      reference: orderId,
    });

  req.log.info({ orderId }, "Order created");
  res.status(201).json(order);
});

router.get("/orders/track", async (req, res): Promise<void> => {
  const parsed = TrackOrderQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Query parameter 'q' is required" });
    return;
  }

  const { q } = parsed.data;

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(
      or(
        eq(ordersTable.orderId, q),
        eq(ordersTable.phone, q)
      )
    )
    .limit(1);

  if (!order) {
    res.status(404).json({
      error: "No order found matching this ID or phone number. Please check and try again.",
    });
    return;
  }

  res.json(order);
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetOrderParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.id));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(order);
});

export default router;
