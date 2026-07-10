/**
 * Maps Datamart API response shapes to the field names the frontend expects.
 */

const NETWORK_MAP: Record<string, string> = {
  YELLO: "mtn",
  TELECEL: "telecel",
  AT_PREMIUM: "airteltigo",
  // Fallbacks for potential variations
  MTN: "mtn",
  AIRTELTIGO: "airteltigo",
};

export interface DatamartOrder {
  id?: string;
  reference?: string;
  phoneNumber?: string;
  phone?: string;
  network?: string;
  capacity?: number;
  bundleSize?: string;
  displayName?: string;
  price?: number;
  cost?: number;
  profit?: number;
  status?: string;
  paymentStatus?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface MappedOrder {
  id: string;
  orderId: string;
  phone: string;
  network: string;
  bundleSize: string;
  gbAmount: number;
  price: number;
  status: string;
  createdAt: string;
}

export function mapOrder(o: DatamartOrder): MappedOrder {
  const rawNetwork = o.network ?? "";
  const network = NETWORK_MAP[rawNetwork.toUpperCase()] ?? rawNetwork.toLowerCase();

  const capacity = typeof o.capacity === "number" ? o.capacity : 0;
  const bundleSize = o.bundleSize ?? o.displayName ?? `${capacity}GB`;

  return {
    id: String(o.id ?? o.reference ?? ""),
    orderId: o.reference ?? String(o.id ?? ""),
    phone: o.phoneNumber ?? o.phone ?? "",
    network,
    bundleSize,
    gbAmount: capacity,
    price: typeof o.price === "number" ? o.price : 0,
    status: o.status ?? "pending",
    createdAt: o.createdAt ?? new Date().toISOString(),
  };
}

export interface DatamartTransaction {
  id?: string;
  type?: string;
  amount?: number;
  description?: string;
  reference?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface MappedTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  reference: string | null;
  createdAt: string;
}

export function mapTransaction(t: DatamartTransaction): MappedTransaction {
  return {
    id: String(t.id ?? ""),
    type: t.type ?? "debit",
    amount: typeof t.amount === "number" ? t.amount : 0,
    description: t.description ?? "",
    reference: t.reference ?? null,
    createdAt: t.createdAt ?? new Date().toISOString(),
  };
}

/** Unwrap the standard Datamart envelope { status, data } */
export function unwrap<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];
  const r = response as Record<string, unknown>;
  if (Array.isArray(r["data"])) return r["data"] as T[];
  return [];
}

export function unwrapOne<T>(response: unknown): T | null {
  const r = response as Record<string, unknown>;
  if (r["data"] && !Array.isArray(r["data"])) return r["data"] as T;
  return r as T;
}
