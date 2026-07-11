import React, { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Users, Package, MessageSquare, Shield,
  Eye, EyeOff, UserCheck, Loader2, Check, RefreshCw,
  UserCog, Briefcase, UserX, Ban, HeadphonesIcon,
} from "lucide-react";
import SupportAdminPanel from "./SupportAdminPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { format } from "date-fns";
import { useListOrders } from "@workspace/api-client-react";
import { getLocalOrders } from "@/lib/dummyData";

const ADMIN_EMAIL    = "codelilok@gmail.com";
const ADMIN_PASSWORD = "NetSwift@26";

type Tab = "orders" | "complaints" | "users" | "agents" | "admins" | "suspended" | "removed" | "support";

function getComplaints() {
  try { return JSON.parse(localStorage.getItem("nsComplaints") ?? "[]"); } catch { return []; }
}
function saveComplaints(list: any[]) {
  localStorage.setItem("nsComplaints", JSON.stringify(list));
}
function getUsers(): any[] {
  try { return JSON.parse(localStorage.getItem("nsUsers") ?? "[]"); } catch { return []; }
}
function saveUsers(list: any[]) {
  localStorage.setItem("nsUsers", JSON.stringify(list));
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const isMainAdmin =
      email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
      password === ADMIN_PASSWORD;
    if (!isMainAdmin) {
      toast.error("Invalid admin credentials");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("nsAdmin", JSON.stringify({ email: ADMIN_EMAIL, role: "admin" }));
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

  function acceptComplaint(id: string) {
    const updated = complaints.map(c => c.id === id ? { ...c, status: "Accepted", acceptedBy: "Admin" } : c);
    setComplaints(updated); saveComplaints(updated);
    toast.success("Complaint accepted — you're now working on it");
  }
  function resolveComplaint(id: string) {
    const updated = complaints.map(c => c.id === id ? { ...c, status: "Resolved" } : c);
    setComplaints(updated); saveComplaints(updated);
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

function UserCard({ u, actions }: { u: any; actions: React.ReactNode }) {
  const roleCls = (r: string) => {
    if (r === "admin") return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    if (r === "agent") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    return "bg-white/5 text-muted-foreground border-white/10";
  };
  const initials = u.name?.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase() ?? "?";
  return (
    <div className="bg-black/25 border border-white/8 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border border-white/10 shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-teal-500/20 to-purple-600/20 text-teal-400 text-sm font-bold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{u.name}</p>
          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
          {u.joinedAt && <p className="text-[11px] text-muted-foreground/50 mt-0.5">Joined {format(new Date(u.joinedAt), "MMM d, yyyy")}</p>}
        </div>
        <Badge className={`text-xs border shrink-0 ${roleCls(u.role ?? "user")}`}>{u.role ?? "user"}</Badge>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {actions}
      </div>
    </div>
  );
}

function useUsersMutate() {
  const [users, setUsers] = useState<any[]>(() => getUsers());
  function update(id: string, patch: Record<string, unknown>) {
    setUsers(prev => {
      const next = prev.map(x => x.id === id ? { ...x, ...patch } : x);
      saveUsers(next);
      return next;
    });
  }
  return { users, update };
}

function UsersTab() {
  const { users, update } = useUsersMutate();

  function changeRole(id: string, role: string) { update(id, { role }); toast.success(`Role updated to ${role}`); }
  function suspend(id: string)  { update(id, { status: "suspended" }); toast.success("User suspended"); }
  function remove(id: string)   { update(id, { status: "removed" });   toast.success("User removed"); }

  const active = users.filter(u => u.role === "user" && (u.status === "active" || !u.status));

  if (users.filter(u => u.role === "user").length === 0) {
    return (
      <div className="text-center py-16 space-y-2">
        <Users className="w-12 h-12 mx-auto text-muted-foreground/30" />
        <p className="font-semibold text-white">No users yet</p>
        <p className="text-sm text-muted-foreground">Users who sign up on the homepage will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {active.length === 0 && <p className="text-xs text-muted-foreground px-1 pb-2">No active users.</p>}
      {active.map((u, i) => (
        <motion.div key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <UserCard u={u} actions={
            <div className="flex items-center gap-1.5">
              <select value={u.role ?? "user"} onChange={e => changeRole(u.id, e.target.value)}
                className="h-7 px-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-teal-500">
                <option value="user">User</option>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={() => suspend(u.id)}
                className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors whitespace-nowrap">
                Suspend
              </button>
              <button onClick={() => remove(u.id)}
                className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors whitespace-nowrap">
                Remove
              </button>
            </div>
          } />
        </motion.div>
      ))}
    </div>
  );
}

function AgentsTab() {
  const { users, update } = useUsersMutate();

  function changeRole(id: string, role: string) { update(id, { role }); toast.success(`Role updated to ${role}`); }
  function suspend(id: string) { update(id, { status: "suspended" }); toast.success("Agent suspended"); }
  function remove(id: string)  { update(id, { status: "removed" });   toast.success("Agent removed"); }

  const active = users.filter(u => u.role === "agent" && (u.status === "active" || !u.status));

  if (users.filter(u => u.role === "agent").length === 0) {
    return (
      <div className="text-center py-16 space-y-2">
        <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/30" />
        <p className="font-semibold text-white">No agents yet</p>
        <p className="text-sm text-muted-foreground">Assign the agent role to a user in the Users tab.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {active.length === 0 && <p className="text-xs text-muted-foreground px-1 pb-2">No active agents.</p>}
      {active.map((u, i) => (
        <motion.div key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <UserCard u={u} actions={
            <div className="flex items-center gap-1.5">
              <select value={u.role ?? "agent"} onChange={e => changeRole(u.id, e.target.value)}
                className="h-7 px-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-teal-500">
                <option value="user">User</option>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={() => suspend(u.id)}
                className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors whitespace-nowrap">
                Suspend
              </button>
              <button onClick={() => remove(u.id)}
                className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors whitespace-nowrap">
                Remove
              </button>
            </div>
          } />
        </motion.div>
      ))}
    </div>
  );
}

function AdminsTab() {
  const { users, update } = useUsersMutate();

  function changeRole(id: string, role: string) { update(id, { role }); toast.success(`Role updated to ${role}`); }
  function suspend(id: string) { update(id, { status: "suspended" }); toast.success("Admin suspended"); }
  function remove(id: string)  { update(id, { status: "removed" });   toast.success("Admin removed"); }

  const active = users.filter(u => u.role === "admin" && (u.status === "active" || !u.status));

  if (users.filter(u => u.role === "admin").length === 0) {
    return (
      <div className="text-center py-16 space-y-2">
        <UserCog className="w-12 h-12 mx-auto text-muted-foreground/30" />
        <p className="font-semibold text-white">No admins listed</p>
        <p className="text-sm text-muted-foreground">Assign the admin role to a user in the Users tab.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {active.length === 0 && <p className="text-xs text-muted-foreground px-1 pb-2">No active admins.</p>}
      {active.map((u, i) => (
        <motion.div key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <UserCard u={u} actions={
            <div className="flex items-center gap-1.5">
              <select value={u.role ?? "admin"} onChange={e => changeRole(u.id, e.target.value)}
                className="h-7 px-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-teal-500">
                <option value="user">User</option>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={() => suspend(u.id)}
                className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors whitespace-nowrap">
                Suspend
              </button>
              <button onClick={() => remove(u.id)}
                className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors whitespace-nowrap">
                Remove
              </button>
            </div>
          } />
        </motion.div>
      ))}
    </div>
  );
}

function SuspendedTab() {
  const { users, update } = useUsersMutate();

  function unsuspend(id: string) { update(id, { status: "active" });   toast.success("User unsuspended"); }
  function remove(id: string)    { update(id, { status: "removed" });  toast.success("User removed"); }

  const suspended = users.filter(u => u.status === "suspended");

  if (suspended.length === 0) {
    return (
      <div className="text-center py-16 space-y-2">
        <Ban className="w-12 h-12 mx-auto text-muted-foreground/30" />
        <p className="font-semibold text-white">No suspended accounts</p>
        <p className="text-sm text-muted-foreground">Suspended users will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {suspended.map((u, i) => (
        <motion.div key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <UserCard u={u} actions={
            <div className="flex items-center gap-1.5">
              <button onClick={() => unsuspend(u.id)}
                className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors whitespace-nowrap">
                Unsuspend
              </button>
              <button onClick={() => remove(u.id)}
                className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors whitespace-nowrap">
                Remove
              </button>
            </div>
          } />
        </motion.div>
      ))}
    </div>
  );
}

function RemovedTab() {
  const { users, update } = useUsersMutate();

  function restore(id: string) { update(id, { status: "active" }); toast.success("User restored"); }

  const removed = users.filter(u => u.status === "removed");

  if (removed.length === 0) {
    return (
      <div className="text-center py-16 space-y-2">
        <UserX className="w-12 h-12 mx-auto text-muted-foreground/30" />
        <p className="font-semibold text-white">No removed accounts</p>
        <p className="text-sm text-muted-foreground">Removed users will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {removed.map((u, i) => (
        <motion.div key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <UserCard u={u} actions={
            <button onClick={() => restore(u.id)}
              className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-white/10 bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap">
              Restore
            </button>
          } />
        </motion.div>
      ))}
    </div>
  );
}

function OrdersTab() {
  const { data: apiOrders, isLoading, refetch } = useListOrders({});
  // Guard: normalise wrapped envelope { status, data:[...] } to plain array
  const ordersArray: typeof apiOrders = Array.isArray(apiOrders)
    ? apiOrders
    : Array.isArray((apiOrders as any)?.data)
    ? (apiOrders as any).data
    : undefined;
  const orders = (!isLoading && (!ordersArray || ordersArray.length === 0)) ? getLocalOrders() : ordersArray;

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
                  <span className="font-mono">{order.phone}</span>
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
    setLocation("/");
  }

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />;

  const allUsers = getUsers();
  const counts = {
    users:     allUsers.filter(u => u.role === "user"  && (u.status === "active" || !u.status)).length,
    agents:    allUsers.filter(u => u.role === "agent" && (u.status === "active" || !u.status)).length,
    admins:    allUsers.filter(u => u.role === "admin" && (u.status === "active" || !u.status)).length,
    suspended: allUsers.filter(u => u.status === "suspended").length,
    removed:   allUsers.filter(u => u.status === "removed").length,
    support:   (() => { try { const t: any[] = JSON.parse(localStorage.getItem("nsSupportTickets") ?? "[]"); return t.filter(x => x.status === "pending").length; } catch { return 0; } })(),
  };

  const TABS: { id: Tab; label: string; icon: React.ElementType; count?: number; activeColor?: string }[] = [
    { id: "orders",     label: "Orders",     icon: Package },
    { id: "complaints", label: "Complaints", icon: MessageSquare },
    { id: "support",    label: "Support",    icon: HeadphonesIcon, count: counts.support, activeColor: counts.support > 0 ? "bg-teal-500/15 text-teal-300" : undefined },
    { id: "users",      label: "Users",      icon: Users,    count: counts.users },
    { id: "agents",     label: "Agents",     icon: Briefcase, count: counts.agents },
    { id: "admins",     label: "Admins",     icon: UserCog,  count: counts.admins },
    { id: "suspended",  label: "Suspended",  icon: Ban,      count: counts.suspended, activeColor: "bg-amber-500/15 text-amber-300" },
    { id: "removed",    label: "Removed",    icon: UserX,    count: counts.removed,   activeColor: "bg-red-500/15 text-red-300" },
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
        <div className="flex gap-1 bg-black/20 border border-white/8 rounded-2xl p-1 overflow-x-auto scrollbar-none">
          {TABS.map(t => {
            const isActive = tab === t.id;
            const activeClass = t.activeColor && isActive ? t.activeColor : isActive ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white";
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-shrink-0 flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${activeClass}`}>
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
                {t.count !== undefined && (
                  <span className={`ml-0.5 text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none ${
                    isActive ? "bg-white/20" : "bg-white/8 text-muted-foreground"
                  }`}>{t.count}</span>
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {tab === "orders"     && <OrdersTab />}
            {tab === "complaints" && <ComplaintsTab />}
            {tab === "support"    && <SupportAdminPanel viewer={{ email: ADMIN_EMAIL, name: "Admin", role: "admin" }} />}
            {tab === "users"      && <UsersTab />}
            {tab === "agents"     && <AgentsTab />}
            {tab === "admins"     && <AdminsTab />}
            {tab === "suspended"  && <SuspendedTab />}
            {tab === "removed"    && <RemovedTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
