import React, { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, LogOut, Users, Package, MessageSquare, Shield,
  CheckCircle2, Clock, XCircle, ChevronRight, Eye, EyeOff,
  UserCheck, UserX, AlertTriangle, Loader2, Check, X, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { format } from "date-fns";
import { useListOrders } from "@workspace/api-client-react";

const ADMIN_EMAIL    = "codelilok@gmail.com";
const ADMIN_PASSWORD = "NetSwift@26";

type Tab = "orders" | "complaints" | "users";

function getComplaints() {
  try { return JSON.parse(localStorage.getItem("nsComplaints") ?? "[]"); } catch { return []; }
}
function saveComplaints(list: any[]) {
  localStorage.setItem("nsComplaints", JSON.stringify(list));
}
function getMockUsers() {
  return [
    { id: "u1", name: "Kwame Asante",    email: "kwame@example.com",   role: "user",  status: "active",    joined: "2025-12-01" },
    { id: "u2", name: "Akua Mensah",     email: "akua@example.com",    role: "user",  status: "active",    joined: "2026-01-15" },
    { id: "u3", name: "Kofi Boateng",    email: "kofi@example.com",    role: "agent", status: "active",    joined: "2026-02-10" },
    { id: "u4", name: "Abena Frimpong",  email: "abena@example.com",   role: "user",  status: "suspended", joined: "2026-03-05" },
    { id: "u5", name: "Yaw Darko",       email: "yaw@example.com",     role: "user",  status: "active",    joined: "2026-04-01" },
  ];
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      toast.error("Invalid admin credentials");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("nsAdmin", JSON.stringify({ email, role: "admin" }));
      setLoading(false);
      onLogin();
    }, 900);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center mx-auto shadow-xl shadow-teal-500/20">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Admin Portal</h1>
          <p className="text-sm text-muted-foreground">NetSwift Operations Dashboard</p>
        </div>

        <Card className="border-white/10 bg-black/20 backdrop-blur-xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</label>
                <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="admin@netswift.app"
                  className="h-12 bg-black/20 border-white/10 focus-visible:ring-teal-500 text-white" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Input value={password} onChange={e => setPassword(e.target.value)} type={showPw ? "text" : "password"} placeholder="••••••••••"
                    className="h-12 bg-black/20 border-white/10 focus-visible:ring-teal-500 text-white pr-11" />
                  <button type="button" onClick={() => setShowPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-teal-500 to-purple-600 text-white font-bold border-none">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Signing in...</> : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function ComplaintsTab() {
  const [complaints, setComplaints] = useState<any[]>(() => getComplaints());

  function acceptComplaint(id: string, agent: string = "Admin") {
    const updated = complaints.map(c => c.id === id ? { ...c, status: "Accepted", acceptedBy: agent } : c);
    setComplaints(updated);
    saveComplaints(updated);
    toast.success("Complaint accepted — you're now working on it");
  }
  function resolveComplaint(id: string) {
    const updated = complaints.map(c => c.id === id ? { ...c, status: "Resolved" } : c);
    setComplaints(updated);
    saveComplaints(updated);
    toast.success("Complaint marked as resolved");
  }

  const statusCls = (s: string) => {
    if (s === "Resolved") return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (s === "Accepted") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  };

  return (
    <div className="space-y-4">
      {complaints.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground">No complaints yet</p>
        </div>
      ) : (
        complaints.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="bg-black/25 border border-white/8 rounded-2xl p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-teal-400 font-bold">{c.trackingId}</span>
                  <Badge className={`text-xs border ${statusCls(c.status)}`}>{c.status}</Badge>
                </div>
                {c.acceptedBy && <p className="text-xs text-muted-foreground">Working: <span className="text-white">{c.acceptedBy}</span></p>}
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{c.createdAt ? format(new Date(c.createdAt), "MMM d, h:mm a") : ""}</span>
            </div>

            <div className="bg-black/30 rounded-xl p-3 border border-white/5 text-sm space-y-1.5">
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-2">ORDER COMPLAINT</p>
              {[
                { k: "Order ID", v: c.orderId }, { k: "Phone", v: c.phone },
                { k: "Network", v: c.network }, { k: "Bundle", v: c.bundleSize },
                { k: "Status", v: c.orderStatus },
              ].map(r => (
                <div key={r.k} className="flex justify-between">
                  <span className="text-muted-foreground">{r.k}:</span>
                  <span className="text-white font-mono">{r.v}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-white/5">
                <p className="text-muted-foreground text-xs mb-1">Issue: <span className="text-amber-400">{c.preset}</span></p>
                {c.message && <p className="text-white text-xs">"{c.message}"</p>}
              </div>
            </div>

            <div className="flex gap-2">
              {c.status === "Submitted" && (
                <Button size="sm" onClick={() => acceptComplaint(c.id)}
                  className="h-8 px-3 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/20 text-xs font-semibold">
                  <UserCheck className="w-3.5 h-3.5 mr-1.5" />Accept
                </Button>
              )}
              {c.status !== "Resolved" && (
                <Button size="sm" onClick={() => resolveComplaint(c.id)}
                  className="h-8 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                  <Check className="w-3.5 h-3.5 mr-1.5" />Resolve
                </Button>
              )}
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState(() => getMockUsers());

  function changeRole(id: string, role: string) {
    setUsers(u => u.map(x => x.id === id ? { ...x, role } : x));
    toast.success(`Role updated to ${role}`);
  }
  function toggleStatus(id: string) {
    setUsers(u => u.map(x => x.id === id ? { ...x, status: x.status === "active" ? "suspended" : "active" } : x));
    toast.success("Account status updated");
  }

  const roleCls = (r: string) => {
    if (r === "admin") return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    if (r === "agent") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    return "bg-white/5 text-muted-foreground border-white/10";
  };

  return (
    <div className="space-y-3">
      {users.map((u, i) => (
        <motion.div key={u.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
          className={`bg-black/25 border rounded-2xl p-4 flex items-center gap-3 ${u.status === "suspended" ? "border-red-500/20 opacity-60" : "border-white/8"}`}>
          <Avatar className="h-10 w-10 border border-white/10 shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-teal-500/20 to-purple-600/20 text-teal-400 text-sm font-bold">
              {u.name.split(" ").map(p => p[0]).join("").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{u.name}</p>
            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
            <Badge className={`text-xs border ${roleCls(u.role)}`}>{u.role}</Badge>

            {/* Role actions */}
            <select
              value={u.role}
              onChange={e => changeRole(u.id, e.target.value)}
              className="h-7 px-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="user">User</option>
              <option value="agent">Agent</option>
              <option value="admin">Admin</option>
            </select>

            <button onClick={() => toggleStatus(u.id)}
              className={`h-7 w-7 rounded-lg flex items-center justify-center border transition-colors
                ${u.status === "active"
                  ? "border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                }`}
              title={u.status === "active" ? "Suspend" : "Activate"}
            >
              {u.status === "active" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function OrdersTab() {
  const { data: orders, isLoading, refetch } = useListOrders({});

  const statusCls = (s: string) => {
    switch (s.toLowerCase()) {
      case "completed": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "failed":    return "bg-red-500/10 text-red-400 border-red-500/20";
      default:          return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => refetch()} className="h-8 text-xs text-muted-foreground hover:text-white gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />Refresh
        </Button>
      </div>
      {isLoading ? (
        Array(5).fill(0).map((_, i) => (
          <div key={i} className="bg-black/25 border border-white/8 rounded-2xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 animate-pulse shrink-0" />
            <div className="flex-1 space-y-2"><div className="h-4 w-32 bg-white/10 rounded animate-pulse" /><div className="h-3 w-24 bg-white/10 rounded animate-pulse" /></div>
          </div>
        ))
      ) : orders?.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <Package className="w-12 h-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        orders?.map((order, i) => {
          const netColor = order.network.toLowerCase() === "mtn" ? "bg-yellow-500" : order.network.toLowerCase() === "telecel" ? "bg-red-500" : "bg-blue-500";
          return (
            <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-black/25 border border-white/8 rounded-2xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${netColor} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                {order.network.substring(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-white font-semibold">{order.orderId}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span>{order.network}</span><span>·</span>
                  <span className="font-bold text-white">{order.bundleSize}</span><span>·</span>
                  <span>{order.phone?.substring(0, 3)}***{order.phone?.substring(order.phone?.length - 3)}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge className={`text-xs border ${statusCls(order.status)}`}>{order.status}</Badge>
                <span className="text-xs text-muted-foreground">{format(new Date(order.createdAt), "MMM d, h:mm a")}</span>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<Tab>("orders");

  const isLoggedIn = useMemo(() => {
    try { const s = JSON.parse(localStorage.getItem("nsAdmin") ?? "null"); return s?.role === "admin"; }
    catch { return false; }
  }, []);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn);

  function handleLogout() {
    localStorage.removeItem("nsAdmin");
    setLoggedIn(false);
  }

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;

  const TABS = [
    { id: "orders" as Tab,     label: "Orders",     icon: Package },
    { id: "complaints" as Tab, label: "Complaints", icon: MessageSquare },
    { id: "users" as Tab,      label: "Users",      icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center h-14 px-4 gap-3 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">Admin Dashboard</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-400 transition-colors">
            <LogOut className="w-3.5 h-3.5" />Logout
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto w-full px-4 py-6 space-y-5 flex-1">
        {/* Tab bar */}
        <div className="flex gap-1 bg-black/20 border border-white/8 rounded-2xl p-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 h-9 rounded-xl text-sm font-semibold transition-all
                ${tab === t.id ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {tab === "orders"     && <OrdersTab />}
            {tab === "complaints" && <ComplaintsTab />}
            {tab === "users"      && <UsersTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
