import React, { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, LogOut, Users, Package, MessageSquare, Shield,
  CheckCircle2, Clock, XCircle, ChevronRight, Eye, EyeOff,
  UserCheck, UserX, AlertTriangle, Loader2, Check, X, RefreshCw,
  UserCog, Briefcase
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

type Tab = "orders" | "complaints" | "users" | "agents" | "admins";

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

function UserCard({ u, actions }: { u: any; actions: React.ReactNode }) {
  const roleCls = (r: string) => {
    if (r === "admin") return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    if (r === "agent") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    return "bg-white/5 text-muted-foreground border-white/10";
  };
  const initials = u.name?.split(" ").map((p: string) => p[0]).join("").slice(0, 2).toUpperCase() ?? "?";
  return (
    <div className="bg-black/25 border border-white/8 rounded-2xl p-4 flex items-center gap-3">
      <Avatar className="h-10 w-10 border border-white/10 shrink-0">
        <AvatarFallback className="bg-gradient-to-br from-teal-500/20 to-purple-600/20 text-teal-400 text-sm font-bold">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{u.name}</p>
        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
        {u.joinedAt && <p className="text-[11px] text-muted-foreground/50 mt-0.5">Joined {format(new Date(u.joinedAt), "MMM d, yyyy")}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
        <Badge className={`text-xs border ${roleCls(u.role ?? "user")}`}>{u.role ?? "user"}</Badge>
        {actions}
      </div>
    </div>
  );
}

function SectionHeader({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-2 pt-2 pb-1">
      <span className={`text-xs font-bold uppercase tracking-widest ${color}`}>{label}</span>
      <span className="text-xs text-muted-foreground bg-white/5 border border-white/10 rounded-full px-2 py-0.5">{count}</span>
      <div className="flex-1 h-px bg-white/5" />
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<any[]>(() => getUsers());

  function update(id: string, patch: Record<string, unknown>) {
    setUsers(prev => {
      const next = prev.map(x => x.id === id ? { ...x, ...patch } : x);
      saveUsers(next);
      return next;
    });
  }

  function changeRole(id: string, role: string) {
    update(id, { role });
    toast.success(`Role updated to ${role}`);
  }

  function suspendUser(id: string) {
    update(id, { status: "suspended" });
    toast.success("User suspended");
  }

  function removeUser(id: string) {
    update(id, { status: "removed" });
    toast.success("User removed");
  }

  function unsuspendUser(id: string) {
    update(id, { status: "active" });
    toast.success("User unsuspended");
  }

  function restoreUser(id: string) {
    update(id, { status: "active" });
    toast.success("User restored");
  }

  const active    = users.filter(u => u.status === "active" || !u.status);
  const suspended = users.filter(u => u.status === "suspended");
  const removed   = users.filter(u => u.status === "removed");

  if (users.length === 0) {
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
      {/* ── Active ── */}
      <SectionHeader label="Active" count={active.length} color="text-emerald-400" />
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
              <button onClick={() => suspendUser(u.id)} title="Suspend"
                className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors whitespace-nowrap">
                Suspend
              </button>
              <button onClick={() => removeUser(u.id)} title="Remove"
                className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors whitespace-nowrap">
                Remove
              </button>
            </div>
          } />
        </motion.div>
      ))}

      {/* ── Suspended ── */}
      <SectionHeader label="Suspended" count={suspended.length} color="text-amber-400" />
      {suspended.length === 0 && <p className="text-xs text-muted-foreground px-1 pb-2">No suspended users.</p>}
      {suspended.map((u, i) => (
        <motion.div key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <UserCard u={u} actions={
            <div className="flex items-center gap-1.5">
              <button onClick={() => unsuspendUser(u.id)}
                className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors whitespace-nowrap">
                Unsuspend
              </button>
              <button onClick={() => removeUser(u.id)}
                className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors whitespace-nowrap">
                Remove
              </button>
            </div>
          } />
        </motion.div>
      ))}

      {/* ── Removed ── */}
      <SectionHeader label="Removed" count={removed.length} color="text-red-400" />
      {removed.length === 0 && <p className="text-xs text-muted-foreground px-1 pb-2">No removed users.</p>}
      {removed.map((u, i) => (
        <motion.div key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <UserCard u={u} actions={
            <button onClick={() => restoreUser(u.id)}
              className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-white/10 bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap">
              Restore
            </button>
          } />
        </motion.div>
      ))}
    </div>
  );
}

function AgentsTab() {
  const [users, setUsers] = useState<any[]>(() => getUsers());

  function update(id: string, patch: Record<string, unknown>) {
    setUsers(prev => {
      const next = prev.map(x => x.id === id ? { ...x, ...patch } : x);
      saveUsers(next);
      return next;
    });
  }

  function demoteAgent(id: string) {
    update(id, { role: "user" });
    toast.success("Agent demoted to user");
  }

  function suspendAgent(id: string) {
    update(id, { status: "suspended" });
    toast.success("Agent suspended");
  }

  function removeAgent(id: string) {
    update(id, { status: "removed" });
    toast.success("Agent removed");
  }

  const agents = users.filter(u => u.role === "agent");
  const active    = agents.filter(u => u.status === "active" || !u.status);
  const suspended = agents.filter(u => u.status === "suspended");
  const removed   = agents.filter(u => u.status === "removed");

  if (agents.length === 0) {
    return (
      <div className="text-center py-16 space-y-2">
        <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/30" />
        <p className="font-semibold text-white">No agents yet</p>
        <p className="text-sm text-muted-foreground">Assign agent roles to users in the Users tab.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <SectionHeader label="Active Agents" count={active.length} color="text-blue-400" />
      {active.length === 0 && <p className="text-xs text-muted-foreground px-1 pb-2">No active agents.</p>}
      {active.map((u, i) => (
        <motion.div key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <UserCard u={u} actions={
            <div className="flex items-center gap-1.5">
              <button onClick={() => demoteAgent(u.id)}
                className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-white/10 bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap">
                Demote
              </button>
              <button onClick={() => suspendAgent(u.id)}
                className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors whitespace-nowrap">
                Suspend
              </button>
              <button onClick={() => removeAgent(u.id)}
                className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors whitespace-nowrap">
                Remove
              </button>
            </div>
          } />
        </motion.div>
      ))}

      <SectionHeader label="Suspended" count={suspended.length} color="text-amber-400" />
      {suspended.length === 0 && <p className="text-xs text-muted-foreground px-1 pb-2">No suspended agents.</p>}
      {suspended.map((u, i) => (
        <motion.div key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <UserCard u={u} actions={
            <div className="flex items-center gap-1.5">
              <button onClick={() => update(u.id, { status: "active" })}
                className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors whitespace-nowrap">
                Unsuspend
              </button>
              <button onClick={() => removeAgent(u.id)}
                className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors whitespace-nowrap">
                Remove
              </button>
            </div>
          } />
        </motion.div>
      ))}

      <SectionHeader label="Removed" count={removed.length} color="text-red-400" />
      {removed.length === 0 && <p className="text-xs text-muted-foreground px-1 pb-2">No removed agents.</p>}
      {removed.map((u, i) => (
        <motion.div key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <UserCard u={u} actions={
            <button onClick={() => update(u.id, { status: "active" })}
              className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-white/10 bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap">
              Restore
            </button>
          } />
        </motion.div>
      ))}
    </div>
  );
}

function AdminsTab() {
  const [users, setUsers] = useState<any[]>(() => getUsers());

  function update(id: string, patch: Record<string, unknown>) {
    setUsers(prev => {
      const next = prev.map(x => x.id === id ? { ...x, ...patch } : x);
      saveUsers(next);
      return next;
    });
  }

  function demoteAdmin(id: string) {
    update(id, { role: "user" });
    toast.success("Admin demoted to user");
  }

  function suspendAdmin(id: string) {
    update(id, { status: "suspended" });
    toast.success("Admin suspended");
  }

  function removeAdmin(id: string) {
    update(id, { status: "removed" });
    toast.success("Admin removed");
  }

  const admins = users.filter(u => u.role === "admin");
  const active    = admins.filter(u => u.status === "active" || !u.status);
  const suspended = admins.filter(u => u.status === "suspended");
  const removed   = admins.filter(u => u.status === "removed");

  if (admins.length === 0) {
    return (
      <div className="text-center py-16 space-y-2">
        <UserCog className="w-12 h-12 mx-auto text-muted-foreground/30" />
        <p className="font-semibold text-white">No admins listed</p>
        <p className="text-sm text-muted-foreground">Assign admin roles to users in the Users tab.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <SectionHeader label="Active Admins" count={active.length} color="text-purple-400" />
      {active.length === 0 && <p className="text-xs text-muted-foreground px-1 pb-2">No active admins.</p>}
      {active.map((u, i) => (
        <motion.div key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <UserCard u={u} actions={
            <div className="flex items-center gap-1.5">
              <button onClick={() => demoteAdmin(u.id)}
                className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-white/10 bg-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap">
                Demote
              </button>
              <button onClick={() => suspendAdmin(u.id)}
                className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors whitespace-nowrap">
                Suspend
              </button>
              <button onClick={() => removeAdmin(u.id)}
                className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors whitespace-nowrap">
                Remove
              </button>
            </div>
          } />
        </motion.div>
      ))}

      <SectionHeader label="Suspended" count={suspended.length} color="text-amber-400" />
      {suspended.length === 0 && <p className="text-xs text-muted-foreground px-1 pb-2">No suspended admins.</p>}
      {suspended.map((u, i) => (
        <motion.div key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <UserCard u={u} actions={
            <div className="flex items-center gap-1.5">
              <button onClick={() => update(u.id, { status: "active" })}
                className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors whitespace-nowrap">
                Unsuspend
              </button>
              <button onClick={() => removeAdmin(u.id)}
                className="h-7 px-2 rounded-lg text-[11px] font-semibold border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors whitespace-nowrap">
                Remove
              </button>
            </div>
          } />
        </motion.div>
      ))}

      <SectionHeader label="Removed" count={removed.length} color="text-red-400" />
      {removed.length === 0 && <p className="text-xs text-muted-foreground px-1 pb-2">No removed admins.</p>}
      {removed.map((u, i) => (
        <motion.div key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <UserCard u={u} actions={
            <button onClick={() => update(u.id, { status: "active" })}
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
    { id: "agents" as Tab,     label: "Agents",     icon: Briefcase },
    { id: "admins" as Tab,     label: "Admins",     icon: UserCog },
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
        <div className="flex gap-1 bg-black/20 border border-white/8 rounded-2xl p-1 overflow-x-auto scrollbar-none">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-shrink-0 flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold transition-all whitespace-nowrap
                ${tab === t.id ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"}`}>
              <t.icon className="w-3.5 h-3.5" />{t.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {tab === "orders"     && <OrdersTab />}
            {tab === "complaints" && <ComplaintsTab />}
            {tab === "users"      && <UsersTab />}
            {tab === "agents"     && <AgentsTab />}
            {tab === "admins"     && <AdminsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
