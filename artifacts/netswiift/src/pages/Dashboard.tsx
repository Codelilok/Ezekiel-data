import React, { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useGetDashboardStats, useListOrders, useListTransactions } from "@workspace/api-client-react";
import { getLocalOrders } from "@/lib/dummyData";
import { format } from "date-fns";
import {
  Home, Package, CreditCard,
  Menu, Bell, Wifi, Zap,
  ChevronRight, LogOut, TrendingUp, ArrowUpRight,
  ArrowDownRight, Plus, RefreshCw, Activity, ShieldCheck,
  X, Loader2, Check, Wallet, MessageSquare
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const NETWORKS = [
  { id: "mtn",       name: "MTN",       color: "bg-yellow-500", light: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20", glow: "shadow-yellow-500/20" },
  { id: "telecel",   name: "Telecel",   color: "bg-red-500",    light: "bg-red-500/10",    text: "text-red-400",    border: "border-red-500/20",    glow: "shadow-red-500/20" },
  { id: "airteltigo",name: "AirtelTigo",color: "bg-blue-500",   light: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/20",   glow: "shadow-blue-500/20" },
];

function statusConfig(status: string) {
  switch (status.toLowerCase()) {
    case "completed": return { cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" };
    case "failed":    return { cls: "bg-red-500/10 text-red-400 border-red-500/20",             dot: "bg-red-400" };
    default:          return { cls: "bg-amber-500/10 text-amber-400 border-amber-500/20",       dot: "bg-amber-400 animate-pulse" };
  }
}

function networkFor(id: string) {
  return NETWORKS.find(n => n.id.toLowerCase() === id.toLowerCase()) ?? NETWORKS[0];
}

function getWalletBalance(): number {
  try { return JSON.parse(localStorage.getItem("nsWallet") ?? "{}").balance ?? 0; } catch { return 0; }
}

function DepositModal({ onClose, onDeposited }: { onClose: () => void; onDeposited: (amount: number) => void }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const fee = numAmount * 0.03;
  const total = numAmount + fee;

  function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    if (numAmount < 1) { toast.error("Enter a valid amount"); return; }
    setLoading(true);
    setTimeout(() => {
      const current = getWalletBalance();
      const updated = { balance: current + numAmount };
      localStorage.setItem("nsWallet", JSON.stringify(updated));
      setLoading(false);
      setDone(true);
      onDeposited(numAmount);
      toast.success(`GHS ${numAmount.toFixed(2)} added to your wallet!`);
    }, 1400);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-4 sm:pb-0" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-md bg-[#0f1117] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <p className="font-bold text-white">Deposit Funds</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-teal-500/15 border-2 border-teal-500/30 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-teal-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">Deposit Successful!</p>
                  <p className="text-sm text-muted-foreground mt-1">GHS {numAmount.toFixed(2)} added to your NetSwift wallet</p>
                </div>
                <Button onClick={onClose} className="w-full h-11 bg-gradient-to-r from-teal-500 to-purple-600 text-white font-bold border-none">Done</Button>
              </motion.div>
            ) : (
              <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleDeposit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount (GHS)</label>
                  <Input
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="e.g. 50"
                    type="number"
                    min="1"
                    inputMode="decimal"
                    className="h-14 text-2xl font-bold bg-black/20 border-white/10 focus-visible:ring-teal-500 text-white text-center"
                    autoFocus
                  />
                </div>

                {/* Quick amounts */}
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 50, 100].map(v => (
                    <button key={v} type="button" onClick={() => setAmount(String(v))}
                      className={`h-9 rounded-xl border text-sm font-semibold transition-all ${amount === String(v) ? "border-teal-500/50 bg-teal-500/15 text-teal-400" : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"}`}>
                      {v}
                    </button>
                  ))}
                </div>

                {numAmount > 0 && (
                  <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Amount</span><span className="text-white">GHS {numAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Paystack fee (3%)</span><span className="text-white">GHS {fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-white/5 pt-2">
                      <span className="text-muted-foreground">You pay</span><span className="text-teal-400 text-base">GHS {total.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <Button type="submit" disabled={loading || numAmount < 1}
                  className="w-full h-12 bg-gradient-to-r from-teal-500 to-purple-600 text-white font-bold border-none hover:opacity-90 transition-opacity">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</> : `Deposit via Paystack`}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [showDeposit, setShowDeposit] = useState(false);
  const [walletBalance, setWalletBalance] = useState(() => getWalletBalance());

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("nsUser");
      if (raw) return JSON.parse(raw) as { name: string; email: string };
    } catch {}
    return { name: "Alex", email: "alex@netswift.app" };
  }, []);

  const firstName = user.name.split(" ")[0];
  const initials = user.name.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase();

  useEffect(() => {
    try {
      const allUsers: any[] = JSON.parse(localStorage.getItem("nsUsers") ?? "[]");
      const record = allUsers.find((u: any) => u.email === user.email);
      if (record?.role === "agent") setLocation("/agent");
    } catch {}
  }, [user.email]);

  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { refetchInterval: 30000, staleTime: 10000 } } as any);
  const { data: apiOrders, isLoading: ordersLoading } = useListOrders({ limit: 6 }, { query: { refetchInterval: 30000, staleTime: 10000 } } as any);
  const { data: recentTx } = useListTransactions({ limit: 4 }, { query: { refetchInterval: 30000, staleTime: 10000 } } as any);

  // Guard: server used to return { status, data:[...] } — normalise to array
  const ordersArray: typeof apiOrders = Array.isArray(apiOrders)
    ? apiOrders
    : Array.isArray((apiOrders as any)?.data)
    ? (apiOrders as any).data
    : undefined;
  const recentOrders = (!ordersLoading && (!ordersArray || ordersArray.length === 0))
    ? getLocalOrders().slice(0, 6)
    : ordersArray;

  function handleLogout() {
    localStorage.removeItem("nsUser");
    setLocation("/");
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-white/5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-purple-600 text-white shadow-lg shadow-teal-500/20">
          <Zap className="h-4 w-4 fill-current" />
        </div>
        <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text text-transparent">NetSwift</span>
      </div>

      <div className="px-4 py-4 border-b border-white/5">
        <Link href="/profile">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
            <Avatar className="h-9 w-9 border border-teal-500/30">
              <AvatarFallback className="bg-gradient-to-br from-teal-500/20 to-purple-600/20 text-teal-400 text-sm font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-white truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-teal-500/20 to-purple-500/10 text-teal-400 font-medium text-sm border border-teal-500/20">
          <Home className="w-4 h-4" />Dashboard
        </Link>
        <Link href="/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors text-sm">
          <Package className="w-4 h-4" />Orders
        </Link>
        <Link href="/transactions" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors text-sm">
          <CreditCard className="w-4 h-4" />Transactions
        </Link>
        <Link href="/complaints" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors text-sm">
          <MessageSquare className="w-4 h-4" />My Complaints
        </Link>

        <div className="pt-5 pb-2 px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Quick Buy</div>
        {NETWORKS.map(net => (
          <Link key={net.id} href={`/${net.id}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors text-sm">
            <div className={`w-4 h-4 rounded-full ${net.color} shadow-sm`} />{net.name}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/5">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors text-sm">
          <LogOut className="w-4 h-4" />Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-black/20 backdrop-blur-xl fixed inset-y-0 left-0 z-10">
        <SidebarContent />
      </aside>

      <main className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 border-b border-white/5 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between h-14 px-4 md:px-6">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden -ml-1 h-9 w-9"><Menu className="w-5 h-5" /></Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 border-r border-white/10 bg-background/95 backdrop-blur-xl">
                  <SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle></SheetHeader>
                  <SidebarContent />
                </SheetContent>
              </Sheet>
              <div className="flex items-center gap-2 md:hidden">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white fill-current" />
                </div>
                <span className="font-bold text-sm bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text text-transparent">NetSwift</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white h-9 w-9"><Bell className="w-4 h-4" /></Button>
              <Avatar className="h-8 w-8 border border-teal-500/30 cursor-pointer hover:border-teal-400 transition-colors" onClick={() => setLocation("/profile")}>
                <AvatarFallback className="bg-gradient-to-br from-teal-500/20 to-purple-600/20 text-teal-400 text-xs font-bold">{initials}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto pb-24">

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div>
              <p className="text-sm text-muted-foreground mb-0.5">{(() => { const h = new Date().getHours(); return h < 12 ? "Good morning," : h < 17 ? "Good afternoon," : "Good evening,"; })()}</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{firstName}</h2>
            </div>
          </motion.div>

          {/* Wallet + Stats */}
          <div className="grid grid-cols-1 gap-4">
            {statsLoading ? (
              <Card className="border-white/5 bg-white/5"><CardContent className="p-6"><Skeleton className="h-20 w-full bg-white/10" /></CardContent></Card>
            ) : (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <div className="relative rounded-2xl overflow-hidden border border-teal-500/20 shadow-2xl shadow-teal-500/10">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-teal-500/5 to-purple-600/20" />
                  <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
                  <div className="relative p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-teal-300/70 font-medium mb-1">Wallet Balance</p>
                      <p className="text-4xl font-bold text-white tracking-tight mb-1">GHS {walletBalance.toFixed(2)}</p>
                      <div className="flex items-center gap-1.5 text-xs text-teal-400">
                        <ShieldCheck className="w-3.5 h-3.5" /><span>Secured · Updated now</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowDeposit(true)}
                      className="h-10 px-5 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm text-sm font-semibold transition-all">
                      <Plus className="w-4 h-4 mr-1.5" />Deposit
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {statsLoading ? (
                Array(2).fill(0).map((_, i) => (
                  <Card key={i} className="border-white/5 bg-white/5"><CardContent className="p-4"><Skeleton className="h-16 w-full bg-white/10" /></CardContent></Card>
                ))
              ) : (
                <>
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="border-purple-500/20 bg-purple-500/5 backdrop-blur-xl hover:bg-purple-500/10 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Package className="w-4 h-4 text-purple-400" />
                          <ArrowUpRight className="w-3.5 h-3.5 text-purple-400 opacity-60" />
                        </div>
                        <p className="text-2xl font-bold text-white">{stats?.ordersToday ?? 0}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Orders Today</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <Card className="border-blue-500/20 bg-blue-500/5 backdrop-blur-xl hover:bg-blue-500/10 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Wifi className="w-4 h-4 text-blue-400" />
                          <TrendingUp className="w-3.5 h-3.5 text-blue-400 opacity-60" />
                        </div>
                        <p className="text-2xl font-bold text-white">{stats?.gbSoldToday ?? 0}<span className="text-sm font-normal text-muted-foreground ml-1">GB</span></p>
                        <p className="text-xs text-muted-foreground mt-0.5">Sold Today</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </>
              )}
            </div>
          </div>

          {/* Buy Data — Network Cards */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white">Buy Data</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {NETWORKS.map((net, i) => (
                <motion.div key={net.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.28 + i * 0.05 }}>
                  <Link href={`/${net.id}`}>
                    <div className={`relative rounded-2xl border ${net.border} ${net.light} p-4 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 overflow-hidden shadow-lg ${net.glow}`}>
                      <div className={`absolute top-0 right-0 w-16 h-16 ${net.color} rounded-full blur-2xl opacity-20 -translate-y-1/2 translate-x-1/2`} />
                      <div className={`w-9 h-9 rounded-xl ${net.color} flex items-center justify-center text-white font-bold text-base mb-3 shadow-md`}>{net.name[0]}</div>
                      <p className={`text-sm font-bold ${net.text}`}>{net.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">Buy <ChevronRight className="w-3 h-3" /></p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { href: "/orders",       icon: Package,    label: "All Orders",    color: "text-purple-400", bg: "bg-purple-500/10 hover:bg-purple-500/20", border: "border-purple-500/20" },
                { href: "/transactions", icon: CreditCard, label: "Transactions",  color: "text-blue-400",   bg: "bg-blue-500/10 hover:bg-blue-500/20",   border: "border-blue-500/20" },
                { href: "/bulk-orders",  icon: RefreshCw,  label: "Bulk Orders",   color: "text-teal-400",   bg: "bg-teal-500/10 hover:bg-teal-500/20",   border: "border-teal-500/20" },
              ].map(item => (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center gap-3 p-4 rounded-xl border ${item.border} ${item.bg} cursor-pointer transition-all`}>
                    <div className="p-2 rounded-lg bg-white/5"><item.icon className={`w-4 h-4 ${item.color}`} /></div>
                    <span className="text-sm font-medium text-white">{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Recent Orders */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white">Recent Orders</h3>
              <Link href="/orders" className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-0.5 font-medium">View all <ChevronRight className="w-3.5 h-3.5" /></Link>
            </div>
            <Card className="border-white/5 bg-black/20 backdrop-blur-md overflow-hidden">
              <div className="divide-y divide-white/5">
                {ordersLoading ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="p-4 flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-xl bg-white/10 shrink-0" />
                      <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-28 bg-white/10" /><Skeleton className="h-3 w-20 bg-white/10" /></div>
                      <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
                    </div>
                  ))
                ) : recentOrders?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 px-6 text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-1">
                      <Activity className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <p className="font-semibold text-white">No orders yet</p>
                    <p className="text-sm text-muted-foreground max-w-[220px]">Your data purchases will show up here once you place your first order.</p>
                    <Link href="/mtn">
                      <Button size="sm" className="mt-2 h-9 bg-gradient-to-r from-teal-500 to-purple-600 text-white font-semibold border-none text-xs">
                        <Plus className="w-3.5 h-3.5 mr-1.5" />Place Your First Order
                      </Button>
                    </Link>
                  </div>
                ) : (
                  recentOrders?.map((order, i) => {
                    const net = networkFor(order.network);
                    const sc = statusConfig(order.status);
                    return (
                      <motion.div key={order.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.42 + i * 0.04 }}
                        className="p-4 flex items-center gap-3 hover:bg-white/3 transition-colors">
                        <div className={`w-10 h-10 rounded-xl ${net.color} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md`}>
                          {order.network.substring(0, 1).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-sm text-white font-medium truncate">{order.orderId}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span className={`font-semibold ${net.text}`}>{order.bundleSize}</span>
                            <span>·</span>
                            <span>{format(new Date(order.createdAt), "MMM d, h:mm a")}</span>
                          </div>
                        </div>
                        <Badge className={`border text-xs font-medium px-2.5 py-0.5 ${sc.cls} gap-1.5 items-center`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} inline-block`} />{order.status}
                        </Badge>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </Card>
          </motion.div>

          {/* Recent Transactions */}
          {recentTx && recentTx.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white">Recent Transactions</h3>
                <Link href="/transactions" className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-0.5 font-medium">View all <ChevronRight className="w-3.5 h-3.5" /></Link>
              </div>
              <Card className="border-white/5 bg-black/20 backdrop-blur-md overflow-hidden">
                <div className="divide-y divide-white/5">
                  {recentTx.map((tx, i) => (
                    <motion.div key={tx.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.52 + i * 0.04 }}
                      className="p-4 flex items-center gap-3 hover:bg-white/3 transition-colors">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === "credit" ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                        {tx.type === "credit" ? <ArrowDownRight className="w-5 h-5 text-emerald-400" /> : <ArrowUpRight className="w-5 h-5 text-red-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{tx.description}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(tx.createdAt), "MMM d, h:mm a")}</p>
                      </div>
                      <p className={`text-sm font-bold ${tx.type === "credit" ? "text-emerald-400" : "text-red-400"}`}>
                        {tx.type === "credit" ? "+" : "-"}GHS {tx.amount.toFixed(2)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

        </div>
      </main>

      <AnimatePresence>
        {showDeposit && (
          <DepositModal
            onClose={() => setShowDeposit(false)}
            onDeposited={(amt) => { setWalletBalance(prev => prev + amt); setShowDeposit(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
