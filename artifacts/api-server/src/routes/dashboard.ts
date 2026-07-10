import { Router, type IRouter } from "express";
import { datamartFetch } from "../lib/datamart";

const router: IRouter = Router();

interface WalletResponse {
  status: string;
  data: {
    deposit?: { balance?: number };
    earnings?: { availableBalance?: number };
    balance?: number;
  };
}

interface OrdersResponse {
  status: string;
  data?: OrderRecord[];
  orders?: OrderRecord[];
  total?: number;
  pagination?: { total?: number };
}

interface OrderRecord {
  status?: string;
  capacity?: number;
  gbAmount?: number;
  gb_amount?: number;
}

// Dashboard stats — combines wallet balance + orders from Datamart
router.get("/dashboard/stats", async (req, res): Promise<void> => {
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const [walletData, ordersData, ordersTodayData] = await Promise.all([
      datamartFetch<WalletResponse>("/api/store/v1/wallet/balance"),
      datamartFetch<OrdersResponse>("/api/store/v1/orders?page=1&limit=100"),
      datamartFetch<OrdersResponse>(`/api/store/v1/orders?from=${today}&page=1&limit=100`),
    ]);

    // Wallet: { data: { deposit: { balance }, earnings: { availableBalance } } }
    const depositBalance = walletData.data?.deposit?.balance ?? 0;
    const earningsBalance = walletData.data?.earnings?.availableBalance ?? 0;
    const walletBalance = Number((depositBalance + earningsBalance).toFixed(2));

    // Normalise orders arrays
    const allOrders: OrderRecord[] = ordersData.data ?? ordersData.orders ?? [];
    const todayOrders: OrderRecord[] = ordersTodayData.data ?? ordersTodayData.orders ?? [];

    const totalOrders =
      ordersData.pagination?.total ?? ordersData.total ?? allOrders.length;

    const completed = allOrders.filter((o) => o.status === "completed").length;
    const successRate =
      totalOrders > 0 ? Math.round((completed / totalOrders) * 100) : 100;

    // Datamart uses `capacity` (GB); fall back to gbAmount / gb_amount for compatibility
    const gbSoldToday = todayOrders.reduce((sum, o) => {
      const gb = o.capacity ?? o.gbAmount ?? o.gb_amount ?? 0;
      return sum + Number(gb);
    }, 0);

    res.json({
      walletBalance,
      ordersToday: todayOrders.length,
      gbSoldToday: Number(gbSoldToday.toFixed(2)),
      successRate,
      totalOrders,
    });
  } catch (err: unknown) {
    const e = err as { status?: number; body?: unknown; message?: string };
    res
      .status(e.status ?? 500)
      .json({ error: e.body ?? e.message ?? "Failed to fetch dashboard stats" });
  }
});

export default router;
