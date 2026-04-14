import { Router, type IRouter } from "express";
import { sql, and, gte } from "drizzle-orm";
import { db, ordersTable, walletTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [ordersToday] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(ordersTable)
    .where(gte(ordersTable.createdAt, todayStart));

  const [gbToday] = await db
    .select({ total: sql<number>`coalesce(sum(gb_amount), 0)` })
    .from(ordersTable)
    .where(gte(ordersTable.createdAt, todayStart));

  const [allOrders] = await db
    .select({ total: sql<number>`cast(count(*) as int)` })
    .from(ordersTable);

  const [completedOrders] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(ordersTable)
    .where(sql`status = 'completed'`);

  const [wallet] = await db.select().from(walletTable).limit(1);
  const balance = wallet?.balance ?? 500;

  const totalOrders = allOrders?.total ?? 0;
  const completed = completedOrders?.count ?? 0;
  const successRate = totalOrders > 0 ? Math.round((completed / totalOrders) * 100) : 100;

  res.json({
    walletBalance: balance,
    ordersToday: ordersToday?.count ?? 0,
    gbSoldToday: Number((gbToday?.total ?? 0).toFixed(2)),
    successRate,
    totalOrders,
  });
});

export default router;
