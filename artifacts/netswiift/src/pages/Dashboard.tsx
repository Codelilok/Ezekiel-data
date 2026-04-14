import React, { useMemo } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetDashboardStats, useListOrders, useListTransactions } from "@workspace/api-client-react";
import { format } from "date-fns";
import {
  Home, Package, CreditCard, Clock,
  Menu, Bell, CheckCircle, Wifi, Zap,
  ChevronRight, LogOut, TrendingUp, ArrowUpRight,
  ArrowDownRight, Plus, RefreshCw, Activity, ShieldCheck
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const NETWORKS = [
  { id: "mtn", name: "MTN", color: "bg-yellow-500", light: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20", glow: "shadow-yellow-500/20" },
  { id: "telecel", name: "Telecel", color: "bg-red-500", light: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", glow: "shadow-red-500/20" },
  { id: "airteltigo", name: "AirtelTigo", color: "bg-blue-500", light: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", glow: "shadow-blue-500/20" },
];

function statusConfig(status: string) {
  switch (status.toLowerCase()) {
    case "completed": return { cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" };
    case "failed": return { cls: "bg-red-500/10 text-red-400 border-red-500/20", dot: "bg-red-400" };
    default: return { cls: "bg-amber-500/10 text-amber-400 border-amber-500/20", dot: "bg-amber-400 animate-pulse" };
  }
}

function networkFor(id: string) {
  return NETWORKS.find(n => n.id.toLowerCase() === id.toLowerCase()) ?? NETWORKS[0];
}

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("nsUser");
      if (raw) return JSON.parse(raw) as { name: string; email: string };
    } catch {}
    return { name: "Alex", email: "alex@netswift.app" };
  }, []);

  const firstName = user.name.split(" ")[0];
  const initials = user.name.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase();

  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: recentOrders, isLoading: ordersLoading } = useListOrders({ limit: 6 });
  const { data: recentTx } = useListTransactions({ limit: 4 });

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
        <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text text-transparent">
          NetSwift
        </span>
      </div>

      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="h-9 w-9 border border-teal-500/30">
            <AvatarFallback className="bg-gradient-to-br from-teal-500/20 to-purple-600/20 text-teal-400 text-sm font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-white truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-teal-500/20 to-purple-500/10 text-teal-400 font-medium text-sm border border-teal-500/20">
          <Home className="w-4 h-4" />
          Dashboard
        </Link>
        <Link href="/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors text-sm">
          <Package className="w-4 h-4" />
          Orders
        </Link>
        <Link href="/transactions" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors text-sm">
          <CreditCard className="w-4 h-4" />
          Transactions
        </Link>
        <Link href="/history" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors text-sm">
          <Clock className="w-4 h-4" />
          History
        </Link>

        <div className="pt-5 pb-2 px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Quick Buy
        </div>
        {NETWORKS.map(net => (
          <Link key={net.id} href={`/${net.id}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors text-sm">
            <div className={`w-4 h-4 rounded-full ${net.color} shadow-sm`} />
            {net.name}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Log out
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
                  <Button variant="ghost" size="icon" className="md:hidden -ml-1 h-9 w-9">
                    <Menu className="w-5 h-5" />
                  </Button>
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
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white h-9 w-9">
                <Bell className="w-4 h-4" />
              </Button>
              <Avatar className="h-8 w-8 border border-teal-500/30 cursor-pointer">
                <AvatarFallback className="bg-gradient-to-br from-teal-500/20 to-purple-600/20 text-teal-400 text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto pb-24">
          
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-0.5">Good day,</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {firstName}
                </h2>
              </div>
              <Link href="/mtn">
                <Button className="h-9 bg-gradient-to-r from-teal-500 to-purple-600 text-white text-sm font-semibold border-none shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-shadow">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Buy Data
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Wallet + Stats */}
          <div className="grid grid-cols-1 gap-4">
            {/* Wallet Card — full width, hero */}
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
                      <p className="text-4xl font-bold text-white tracking-tight mb-1">
                        GHS {stats?.walletBalance?.toFixed(2) ?? "0.00"}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-teal-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Secured • Updated now</span>
                      </div>
                    </div>
                    <Button className="h-10 px-5 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm text-sm font-semibold transition-all">
                      <Plus className="w-4 h-4 mr-1.5" />
                      Deposit
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3 stat cards */}
            <div className="grid grid-cols-3 gap-3">
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
                      <div className={`w-9 h-9 rounded-xl ${net.color} flex items-center justify-center text-white font-bold text-base mb-3 shadow-md`}>
                        {net.name[0]}
                      </div>
                      <p className={`text-sm font-bold ${net.text}`}>{net.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        Buy <ChevronRight className="w-3 h-3" />
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions Row */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { href: "/orders", icon: Package, label: "All Orders", color: "text-purple-400", bg: "bg-purple-500/10 hover:bg-purple-500/20", border: "border-purple-500/20" },
                { href: "/transactions", icon: CreditCard, label: "Transactions", color: "text-blue-400", bg: "bg-blue-500/10 hover:bg-blue-500/20", border: "border-blue-500/20" },
                { href: "/history", icon: Clock, label: "History", color: "text-amber-400", bg: "bg-amber-500/10 hover:bg-amber-500/20", border: "border-amber-500/20" },
                { href: "/mtn", icon: RefreshCw, label: "Bulk Orders", color: "text-teal-400", bg: "bg-teal-500/10 hover:bg-teal-500/20", border: "border-teal-500/20" },
              ].map(item => (
                <Link key={item.href} href={item.href}>
                  <div className={`flex items-center gap-3 p-4 rounded-xl border ${item.border} ${item.bg} cursor-pointer transition-all`}>
                    <div className={`p-2 rounded-lg bg-white/5`}>
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
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
              <Link href="/history" className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-0.5 font-medium">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <Card className="border-white/5 bg-black/20 backdrop-blur-md overflow-hidden">
              <div className="divide-y divide-white/5">
                {ordersLoading ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="p-4 flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-xl bg-white/10 shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-28 bg-white/10" />
                        <Skeleton className="h-3 w-20 bg-white/10" />
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
                    </div>
                  ))
                ) : recentOrders?.length === 0 ? (
                  <div className="p-10 text-center text-muted-foreground">
                    <Activity className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No orders yet</p>
                    <Link href="/mtn"><p className="text-xs text-teal-400 mt-2 hover:text-teal-300">Place your first order</p></Link>
                  </div>
                ) : (
                  recentOrders?.map((order, i) => {
                    const net = networkFor(order.network);
                    const sc = statusConfig(order.status);
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.42 + i * 0.04 }}
                        className="p-4 flex items-center gap-3 hover:bg-white/3 transition-colors"
                      >
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
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} inline-block`} />
                          {order.status}
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
                <Link href="/transactions" className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-0.5 font-medium">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <Card className="border-white/5 bg-black/20 backdrop-blur-md overflow-hidden">
                <div className="divide-y divide-white/5">
                  {recentTx.map((tx, i) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.52 + i * 0.04 }}
                      className="p-4 flex items-center gap-3 hover:bg-white/3 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === "credit" ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                        {tx.type === "credit"
                          ? <ArrowDownRight className="w-5 h-5 text-emerald-400" />
                          : <ArrowUpRight className="w-5 h-5 text-red-400" />
                        }
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
    </div>
  );
}
