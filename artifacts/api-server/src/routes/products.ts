import { Router, type IRouter } from "express";
import { datamartFetch } from "../lib/datamart";

const router: IRouter = Router();

// Map frontend network slug → Datamart network code
const NETWORK_MAP: Record<string, string> = {
  mtn: "YELLO",
  telecel: "TELECEL",
  airteltigo: "AT_PREMIUM",
};

// List available data products/bundles — proxies GET /api/store/v1/products
// Supports optional ?network=mtn|telecel|airteltigo query param to filter by network.
router.get("/products", async (req, res): Promise<void> => {
  try {
    const raw = await datamartFetch("/api/store/v1/products");
    // raw is { status: "success", data: [...] }
    const allProducts: any[] = Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw)
      ? raw
      : [];

    const networkSlug = (req.query.network as string | undefined)?.toLowerCase();
    const datamartCode = networkSlug ? (NETWORK_MAP[networkSlug] ?? networkSlug.toUpperCase()) : null;

    const filtered = datamartCode
      ? allProducts.filter((p) => p.network === datamartCode)
      : allProducts;

    // Map to a clean, frontend-friendly shape
    const products = filtered.map((p) => ({
      id: String(p.id ?? p._id ?? Math.random()),
      network: p.network,          // e.g. "YELLO"
      networkName: p.displayName ?? p.network,
      capacity: Number(p.capacity ?? 0),     // GB amount
      mb: Number(p.mb ?? 0),
      validity: p.validity ?? null,
      validityUnit: p.validity_unit ?? p.validityUnit ?? null,
      basePrice: Number(p.basePrice ?? p.base_price ?? 0),
      sellingPrice: Number(p.sellingPrice ?? p.selling_price ?? 0),
      planId: p.plan_id ?? p.planId ?? null,
    }));

    // Sort by capacity ascending
    products.sort((a, b) => a.capacity - b.capacity);

    res.json({ status: "success", data: products });
  } catch (err: unknown) {
    const e = err as { status?: number; body?: unknown; message?: string };
    res.status(e.status ?? 500).json({ error: e.body ?? e.message ?? "Failed to fetch products" });
  }
});

export default router;
