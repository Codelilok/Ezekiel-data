export const DUMMY_ORDERS = [
  {
    id: 1,
    orderId: "NS-K8M3P1",
    network: "MTN",
    bundleSize: "5GB",
    bundleValidity: "30 days",
    phone: "0244123456",
    status: "Completed",
    gbAmount: 5,
    price: 25,
    customerName: "Demo User",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 2,
    orderId: "NS-Q2W9X4",
    network: "Telecel",
    bundleSize: "2GB",
    bundleValidity: "7 days",
    phone: "0205678901",
    status: "Pending",
    gbAmount: 2,
    price: 10,
    customerName: "Demo User",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 3,
    orderId: "NS-A7N5L2",
    network: "AirtelTigo",
    bundleSize: "10GB",
    bundleValidity: "30 days",
    phone: "0271234567",
    status: "Completed",
    gbAmount: 10,
    price: 45,
    customerName: "Demo User",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: 4,
    orderId: "NS-Z3C6V8",
    network: "MTN",
    bundleSize: "1GB",
    bundleValidity: "2 days",
    phone: "0557654321",
    status: "Failed",
    gbAmount: 1,
    price: 5,
    customerName: "Demo User",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 5,
    orderId: "NS-R1T4Y6",
    network: "MTN",
    bundleSize: "20GB",
    bundleValidity: "30 days",
    phone: "0244987654",
    status: "Completed",
    gbAmount: 20,
    price: 80,
    customerName: "Demo User",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 6,
    orderId: "NS-B9H2J5",
    network: "Telecel",
    bundleSize: "5GB",
    bundleValidity: "30 days",
    phone: "0209876543",
    status: "Pending",
    gbAmount: 5,
    price: 25,
    customerName: "Demo User",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
];

export const DUMMY_COMPLAINT = {
  id: "TRK-DEMO01",
  trackingId: "TRK-DEMO01",
  orderId: "NS-Q2W9X4",
  phone: "0205678901",
  network: "Telecel",
  bundleSize: "2GB",
  orderStatus: "Pending",
  preset: "Completed but not received",
  message: "I paid for 2GB but nothing was credited to my line. Please help.",
  status: "Submitted",
  acceptedBy: null,
  userEmail: "",   // seed complaint is visible to any user (no owner)
  customerName: "Demo User",
  createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
};

export function seedDummyData() {
  if (!localStorage.getItem("nsDummySeeded")) {
    localStorage.setItem("nsOrders", JSON.stringify(DUMMY_ORDERS));
    const existing = (() => { try { return JSON.parse(localStorage.getItem("nsComplaints") ?? "[]"); } catch { return []; } })();
    if (existing.length === 0) {
      localStorage.setItem("nsComplaints", JSON.stringify([DUMMY_COMPLAINT]));
    }
    localStorage.setItem("nsDummySeeded", "1");
  }
}

export function getLocalOrders(): typeof DUMMY_ORDERS {
  try {
    const raw = localStorage.getItem("nsOrders");
    if (raw) return JSON.parse(raw);
  } catch {}
  return DUMMY_ORDERS;
}
