import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Loader2, Phone, Zap, CreditCard, Wallet, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useCreateOrder } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

// Map frontend network slug → Datamart code for products API
const NETWORK_TO_CODE: Record<string, string> = {
  mtn: "mtn",
  telecel: "telecel",
  airteltigo: "airteltigo",
};

const THEME = {
  yellow: { dot:"bg-yellow-500", border:"border-yellow-500/40", ring:"ring-yellow-500/40", bg:"bg-yellow-500/10", text:"text-yellow-400", btn:"from-yellow-500 to-yellow-600", bar:"from-yellow-400 to-yellow-600", glow:"shadow-yellow-500/20" },
  red:    { dot:"bg-red-500",    border:"border-red-500/40",    ring:"ring-red-500/40",    bg:"bg-red-500/10",    text:"text-red-400",    btn:"from-red-500 to-red-600",       bar:"from-red-400 to-red-600",    glow:"shadow-red-500/20" },
  blue:   { dot:"bg-blue-500",   border:"border-blue-500/40",   ring:"ring-blue-500/40",   bg:"bg-blue-500/10",   text:"text-blue-400",   btn:"from-blue-500 to-blue-600",     bar:"from-blue-400 to-blue-600",  glow:"shadow-blue-500/20" },
} as const;

type ColorTheme = keyof typeof THEME;
type PayMethod = "wallet" | "paystack";

interface Bundle {
  id: string;
  size: string;
  validity: string;
  price: string;
  priceValue: number;
  gbAmount: number;
}

function getWalletBalance(): number {
  try { return JSON.parse(localStorage.getItem("nsWallet") ?? "{}").balance ?? 0; } catch { return 0; }
}

function getCurrentUser(): { name: string; email: string; phone?: string } | null {
  try {
    const raw = localStorage.getItem("nsUser");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveOrderLocally(order: Record<string, unknown>) {
  try {
    const existing = JSON.parse(localStorage.getItem("nsOrders") ?? "[]");
    // Avoid duplicates by orderId
    const alreadyExists = existing.some((o: any) => o.orderId === order.orderId);
    if (!alreadyExists) {
      existing.unshift(order);
      localStorage.setItem("nsOrders", JSON.stringify(existing));
    }
  } catch {}
}

// Fallback bundles (used when API is unavailable)
const FALLBACK_BUNDLES: Bundle[] = [
  { id: "1gb",  size: "1GB",  validity: "2 days",  price: "GHS 5",  priceValue: 5,  gbAmount: 1 },
  { id: "2gb",  size: "2GB",  validity: "7 days",  price: "GHS 10", priceValue: 10, gbAmount: 2 },
  { id: "5gb",  size: "5GB",  validity: "30 days", price: "GHS 25", priceValue: 25, gbAmount: 5 },
  { id: "10gb", size: "10GB", validity: "30 days", price: "GHS 45", priceValue: 45, gbAmount: 10 },
  { id: "20gb", size: "20GB", validity: "30 days", price: "GHS 80", priceValue: 80, gbAmount: 20 },
];

function useProducts(network: string) {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError(false);
    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${base}/api/products?network=${NETWORK_TO_CODE[network] ?? network}`);
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      const raw: any[] = Array.isArray(json?.data) ? json.data : [];
      if (raw.length === 0) {
        setBundles(FALLBACK_BUNDLES);
        return;
      }
      const mapped: Bundle[] = raw.map((p) => {
        const gb = p.capacity;
        const price = p.sellingPrice;
        const validity = p.validityUnit
          ? `${p.validity} ${p.validityUnit}`
          : p.validity
          ? `${p.validity} days`
          : "30 days";
        return {
          id: String(p.id),
          size: `${gb}GB`,
          validity,
          price: `GHS ${price.toFixed(2)}`,
          priceValue: price,
          gbAmount: gb,
        };
      });
      setBundles(mapped);
    } catch {
      setError(true);
      setBundles(FALLBACK_BUNDLES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [network]);

  return { bundles, loading, error, retry: fetchProducts };
}

export default function NetworkPage({ network, name, colorTheme }: { network: string; name: string; colorTheme: ColorTheme }) {
  const [, setLocation] = useLocation();
  const [step, setStep]       = useState(1);
  const [bundle, setBundle]   = useState("");
  const [phone, setPhone]     = useState("");
  const [payMethod, setPayMethod] = useState<PayMethod>("paystack");
  const [orderId, setOrderId] = useState("");

  const { bundles, loading: productsLoading, error: productsError, retry } = useProducts(network);
  const createOrderMutation = useCreateOrder();
  const t = THEME[colorTheme];
  const selectedBundle = bundles.find((b) => b.id === bundle);
  const walletBalance = useMemo(() => getWalletBalance(), [step]);

  function goBack() {
    if (step > 1) setStep((s) => s - 1);
    else setLocation("/dashboard");
  }

  function handlePhoneNext() {
    if (phone.replace(/\s/g, "").length < 10) return toast.error("Please enter a valid phone number");
    setStep(3);
  }

  function handlePay() {
    if (!selectedBundle) return;
    if (payMethod === "wallet" && walletBalance < selectedBundle.priceValue) {
      return toast.error("Insufficient wallet balance. Please top up or use Paystack.");
    }
    if (payMethod === "wallet") {
      const current = getWalletBalance();
      localStorage.setItem("nsWallet", JSON.stringify({ balance: Math.max(0, current - selectedBundle.priceValue) }));
    }

    const currentUser = getCurrentUser();
    const customerName = currentUser?.name ?? "Customer";

    createOrderMutation.mutate(
      { data: { network: name, bundleSize: selectedBundle.size, bundleValidity: selectedBundle.validity, phone, gbAmount: selectedBundle.gbAmount, price: selectedBundle.priceValue } },
      {
        onSuccess: (data) => {
          const oid = data.orderId;
          setOrderId(oid);
          setStep(4);
          // Persist locally with full phone + customer name so admin can see unmasked data
          saveOrderLocally({
            id: Date.now(),
            orderId: oid,
            network: name,
            bundleSize: selectedBundle.size,
            bundleValidity: selectedBundle.validity,
            phone,
            status: "Pending",
            gbAmount: selectedBundle.gbAmount,
            price: selectedBundle.priceValue,
            customerName,
            createdAt: new Date().toISOString(),
          });
        },
        onError: () => toast.error("Payment failed. Please try again."),
      }
    );
  }

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center h-14 px-4 gap-3 max-w-2xl mx-auto w-full">
          <Button variant="ghost" size="icon" onClick={goBack} className="h-9 w-9 text-muted-foreground hover:text-white -ml-1 shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className={`w-7 h-7 rounded-full ${t.dot} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg`}>{name[0]}</div>
            <span className="font-bold text-white truncate">Buy {name} Data</span>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{step < 4 ? `Step ${step} of 3` : "Done"}</span>
        </div>
        <div className="h-0.5 bg-white/5 w-full">
          <motion.div className={`h-full bg-gradient-to-r ${t.bar}`} initial={false} animate={{ width: `${progress}%` }} transition={{ duration: 0.35 }} />
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">

            {/* STEP 1: Bundle */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-5">
                <div className="text-center space-y-1 mb-6">
                  <h2 className="text-xl font-bold text-white">Select a Bundle</h2>
                  <p className="text-sm text-muted-foreground">Live prices · Tap a bundle to continue</p>
                  {productsError && (
                    <p className="text-xs text-amber-400">Using fallback prices. <button onClick={retry} className="underline">Retry</button></p>
                  )}
                </div>

                {productsLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Array(5).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-24 rounded-2xl bg-white/5" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {bundles.map((b) => (
                      <motion.button key={b.id} whileTap={{ scale: 0.96 }}
                        onClick={() => { setBundle(b.id); setTimeout(() => setStep(2), 180); }}
                        className={`relative flex flex-col items-start p-4 rounded-2xl border-2 transition-all text-left overflow-hidden
                          ${bundle === b.id ? `${t.border} ${t.bg} ring-2 ${t.ring}` : "border-white/8 bg-black/25 hover:border-white/20 hover:bg-white/5"}`}
                      >
                        <div className={`absolute -top-4 -right-4 w-16 h-16 ${t.dot} rounded-full blur-2xl opacity-20`} />
                        <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none mb-1">{b.size}</p>
                        <p className={`text-sm font-bold ${t.text}`}>{b.price}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate w-full">{b.validity}</p>
                        {bundle === b.id && (
                          <motion.div layoutId="bundleCheck" className={`absolute top-2 right-2 w-5 h-5 rounded-full ${t.dot} flex items-center justify-center`}>
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                    {/* Retry button inside grid */}
                    {productsError && (
                      <button onClick={retry} className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-white/8 bg-black/25 hover:bg-white/5 transition-all gap-2">
                        <RefreshCw className="w-5 h-5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Retry</span>
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2: Phone */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="max-w-md mx-auto w-full space-y-6">
                <div className="text-center space-y-1 mb-6">
                  <h2 className="text-xl font-bold text-white">Enter Phone Number</h2>
                  <p className="text-sm text-muted-foreground">The number to receive <span className={`font-semibold ${t.text}`}>{selectedBundle?.size}</span> on <span className="text-white font-semibold">{name}</span></p>
                </div>
                <Card className="border-white/10 bg-black/20 backdrop-blur-xl">
                  <CardContent className="p-5 space-y-4">
                    <div className={`flex items-center justify-between px-4 py-3 rounded-xl ${t.bg} border ${t.border}`}>
                      <p className={`font-bold text-lg ${t.text}`}>{selectedBundle?.size}</p>
                      <p className="text-white font-bold text-lg">{selectedBundle?.price}</p>
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 024XXXXXXX" type="tel" inputMode="numeric" autoFocus
                        className="h-14 pl-10 text-xl tracking-widest bg-black/20 border-white/10 focus-visible:ring-teal-500 text-white" />
                    </div>
                    <Button onClick={handlePhoneNext} className={`w-full h-12 bg-gradient-to-r ${t.btn} text-white font-bold border-none`}>Continue</Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* STEP 3: Payment */}
            {step === 3 && selectedBundle && (
              <motion.div key="step3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="max-w-md mx-auto w-full space-y-5">
                <div className="text-center space-y-1 mb-6">
                  <h2 className="text-xl font-bold text-white">Choose Payment</h2>
                  <p className="text-sm text-muted-foreground">Review your order and pay</p>
                </div>

                <Card className="border-white/10 bg-black/20 backdrop-blur-xl">
                  <CardContent className="p-5 space-y-3">
                    {[
                      { label: "Network", value: name },
                      { label: "Bundle",  value: selectedBundle.size },
                      { label: "Phone",   value: phone },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                        <span className="text-sm text-muted-foreground">{row.label}</span>
                        <span className="text-sm font-medium text-white">{row.value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-muted-foreground font-medium">Total</span>
                      <span className={`text-2xl font-extrabold ${t.text}`}>{selectedBundle.price}</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Payment Method</p>

                  <motion.button whileTap={{ scale: 0.98 }} onClick={() => setPayMethod("wallet")}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left
                      ${payMethod === "wallet" ? "border-teal-500/50 bg-teal-500/10 ring-2 ring-teal-500/20" : "border-white/10 bg-black/20 hover:border-white/20"}`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center shadow-lg shrink-0">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm">NetSwift Wallet</p>
                      <p className="text-xs text-muted-foreground">Balance: <span className={walletBalance >= selectedBundle.priceValue ? "text-emerald-400" : "text-red-400"}>GHS {walletBalance.toFixed(2)}</span></p>
                    </div>
                    {payMethod === "wallet" && <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-white" /></div>}
                  </motion.button>

                  <motion.button whileTap={{ scale: 0.98 }} onClick={() => setPayMethod("paystack")}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left
                      ${payMethod === "paystack" ? "border-blue-500/50 bg-blue-500/10 ring-2 ring-blue-500/20" : "border-white/10 bg-black/20 hover:border-white/20"}`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shrink-0">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-sm">Paystack</p>
                      <p className="text-xs text-muted-foreground">3% processing fee · <span className="text-white">GHS {(selectedBundle.priceValue * 1.03).toFixed(2)}</span> total</p>
                    </div>
                    {payMethod === "paystack" && <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0"><Check className="w-3 h-3 text-white" /></div>}
                  </motion.button>
                </div>

                <Button onClick={handlePay} disabled={createOrderMutation.isPending}
                  className="w-full h-14 bg-gradient-to-r from-teal-500 to-purple-600 text-white font-bold border-none text-base shadow-lg shadow-teal-500/20 hover:opacity-90 transition-opacity">
                  {createOrderMutation.isPending
                    ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</>
                    : <><CreditCard className="w-5 h-5 mr-2" /> Pay {payMethod === "paystack" ? `GHS ${(selectedBundle.priceValue * 1.03).toFixed(2)}` : selectedBundle.price}</>
                  }
                </Button>
              </motion.div>
            )}

            {/* STEP 4: Success */}
            {step === 4 && (
              <motion.div key="step4" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 24 }} className="max-w-md mx-auto w-full text-center space-y-6 py-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
                  className={`w-24 h-24 rounded-full ${t.bg} border-2 ${t.border} flex items-center justify-center mx-auto shadow-2xl ${t.glow}`}>
                  <Check className={`w-12 h-12 ${t.text}`} />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-extrabold text-white mb-1">Order Placed!</h2>
                  <p className="text-muted-foreground text-sm">Your {selectedBundle?.size} bundle is on its way to <span className="text-white font-medium">{phone}</span></p>
                </div>
                <Card className="border-white/10 bg-black/20 text-left">
                  <CardContent className="p-5 space-y-3">
                    {[
                      { label: "Order ID",  value: orderId },
                      { label: "Network",   value: name },
                      { label: "Bundle",    value: selectedBundle?.size ?? "" },
                      { label: "Paid via",  value: payMethod === "wallet" ? "NetSwift Wallet" : "Paystack" },
                      { label: "Status",    value: "Processing" },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between items-center text-sm border-b border-white/5 pb-3 last:border-0 last:pb-0">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className={`font-medium ${row.label === "Status" ? t.text : "text-white"} font-mono`}>
                          {row.label === "Status" ? <span className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${t.dot} animate-pulse`} />{row.value}</span> : row.value}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setLocation("/dashboard")} className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-white">Dashboard</Button>
                  <Button onClick={() => { setStep(1); setBundle(""); setPhone(""); }} className={`flex-1 bg-gradient-to-r ${t.btn} text-white font-bold border-none`}>Buy More</Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
