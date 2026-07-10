import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MessageSquare, Clock, CheckCircle2,
  ShieldCheck, Zap, AlertCircle, ChevronDown, ChevronUp,
  Home, Package, CreditCard, Menu, LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { format } from "date-fns";

interface Complaint {
  id: string;
  trackingId: string;
  orderId: string;
  phone: string;
  network: string;
  bundleSize: string;
  orderStatus: string;
  preset: string;
  message: string;
  status: "Submitted" | "Accepted" | "Resolved";
  acceptedBy: string | null;
  userEmail?: string;
  createdAt: string;
}

function getUser() {
  try {
    const raw = localStorage.getItem("nsUser");
    if (raw) return JSON.parse(raw) as { name: string; email: string };
  } catch {}
  return { name: "Alex", email: "alex@netswift.app" };
}

function getMyComplaints(userEmail: string): Complaint[] {
  try {
    const all: Complaint[] = JSON.parse(localStorage.getItem("nsComplaints") ?? "[]");
    // Show complaints owned by this user, OR legacy complaints with no owner (userEmail: "")
    return all.filter((c) => !c.userEmail || c.userEmail === userEmail);
  } catch {
    return [];
  }
}

function safeDate(iso: string): Date {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return new Date();
    return d;
  } catch {
    return new Date();
  }
}

function statusConfig(status: string) {
  switch (status) {
    case "Resolved":
      return {
        label: "Resolved",
        icon: CheckCircle2,
        cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        dot: "bg-emerald-400",
      };
    case "Accepted":
      return {
        label: "In Review",
        icon: ShieldCheck,
        cls: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        dot: "bg-blue-400 animate-pulse",
      };
    default:
      return {
        label: "Submitted",
        icon: Clock,
        cls: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        dot: "bg-amber-400 animate-pulse",
      };
  }
}

const NETWORK_COLORS: Record<string, string> = {
  mtn: "bg-yellow-500",
  telecel: "bg-red-500",
  airteltigo: "bg-blue-500",
};

function networkColor(network: string) {
  return NETWORK_COLORS[network?.toLowerCase()] ?? "bg-teal-500";
}

function ComplaintCard({ complaint, index }: { complaint: Complaint; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const sc = statusConfig(complaint.status);
  const Icon = sc.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Card className="bg-white/[0.03] border-white/10 hover:border-white/20 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${networkColor(complaint.network)}/10`}
              >
                <MessageSquare className={`w-5 h-5 text-white/70`} />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-sm text-white font-semibold truncate">
                  {complaint.trackingId ?? complaint.id}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  Order: <span className="text-white/60">{complaint.orderId}</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${sc.cls}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} inline-block`} />
                {sc.label}
              </span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-white/5 px-3 py-2">
              <p className="text-muted-foreground mb-0.5">Issue</p>
              <p className="text-white font-medium leading-snug">{complaint.preset}</p>
            </div>
            <div className="rounded-lg bg-white/5 px-3 py-2">
              <p className="text-muted-foreground mb-0.5">Submitted</p>
              <p className="text-white font-medium">
                {format(safeDate(complaint.createdAt), "MMM d, h:mm a")}
              </p>
            </div>
          </div>

          {complaint.message && (
            <div className="mt-2">
              <button
                onClick={() => setExpanded((v) => !v)}
                className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors"
              >
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {expanded ? "Hide message" : "View message"}
              </button>
              <AnimatePresence>
                {expanded && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 text-xs text-muted-foreground bg-white/5 rounded-lg px-3 py-2 leading-relaxed overflow-hidden"
                  >
                    {complaint.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )}

          {complaint.status === "Accepted" && complaint.acceptedBy && (
            <div className="mt-3 flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 rounded-lg px-3 py-2">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              Being handled by {complaint.acceptedBy}
            </div>
          )}
          {complaint.status === "Resolved" && (
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              This complaint has been resolved
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

const NETWORKS = [
  { id: "mtn", name: "MTN", color: "bg-yellow-500" },
  { id: "telecel", name: "Telecel", color: "bg-red-500" },
  { id: "airteltigo", name: "AirtelTigo", color: "bg-blue-500" },
];

export default function MyComplaints() {
  const [, setLocation] = useLocation();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filter, setFilter] = useState<"all" | "Submitted" | "Accepted" | "Resolved">("all");

  const user = getUser();
  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    setComplaints(getMyComplaints(user.email));
  }, [user.email]);

  function handleLogout() {
    localStorage.removeItem("nsUser");
    setLocation("/");
  }

  const filtered =
    filter === "all" ? complaints : complaints.filter((c) => c.status === filter);

  const counts = {
    all: complaints.length,
    Submitted: complaints.filter((c) => c.status === "Submitted").length,
    Accepted: complaints.filter((c) => c.status === "Accepted").length,
    Resolved: complaints.filter((c) => c.status === "Resolved").length,
  };

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
        <Link href="/profile">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
            <Avatar className="h-9 w-9 border border-teal-500/30">
              <AvatarFallback className="bg-gradient-to-br from-teal-500/20 to-purple-600/20 text-teal-400 text-sm font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-white truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors text-sm">
          <Home className="w-4 h-4" />Dashboard
        </Link>
        <Link href="/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors text-sm">
          <Package className="w-4 h-4" />Orders
        </Link>
        <Link href="/transactions" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors text-sm">
          <CreditCard className="w-4 h-4" />Transactions
        </Link>
        <Link href="/complaints" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-red-500/20 to-orange-500/10 text-red-400 font-medium text-sm border border-red-500/20">
          <MessageSquare className="w-4 h-4" />My Complaints
        </Link>

        <div className="pt-5 pb-2 px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Quick Buy</div>
        {NETWORKS.map((net) => (
          <Link key={net.id} href={`/${net.id}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-colors text-sm">
            <div className={`w-4 h-4 rounded-full ${net.color} shadow-sm`} />{net.name}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-black/20 backdrop-blur-xl fixed inset-y-0 left-0 z-10">
        <SidebarContent />
      </aside>

      <main className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Header */}
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
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-500/15 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-red-400" />
                </div>
                <h1 className="font-bold text-white">My Complaints</h1>
              </div>
            </div>
            <Link href="/orders" className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1">
              <Package className="w-3.5 h-3.5" /> File new complaint
            </Link>
          </div>
        </header>

        <div className="flex-1 px-4 md:px-6 py-6 max-w-3xl mx-auto w-full">
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Submitted", count: counts.Submitted, color: "text-amber-400", bg: "bg-amber-500/10" },
              { label: "In Review", count: counts.Accepted, color: "text-blue-400", bg: "bg-blue-500/10" },
              { label: "Resolved", count: counts.Resolved, color: "text-emerald-400", bg: "bg-emerald-500/10" },
            ].map((s) => (
              <Card key={s.label} className="bg-white/[0.03] border-white/10">
                <CardContent className="p-3 text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {(["all", "Submitted", "Accepted", "Resolved"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  filter === f
                    ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                {f === "all" ? "All" : f === "Accepted" ? "In Review" : f}{" "}
                <span className="opacity-60">
                  ({f === "all" ? counts.all : counts[f]})
                </span>
              </button>
            ))}
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-semibold text-white mb-1">No complaints yet</p>
              <p className="text-sm text-muted-foreground max-w-[240px]">
                {filter === "all"
                  ? "You haven't filed any complaints. Go to an order and tap 'File Complaint' if you have an issue."
                  : `No ${filter.toLowerCase()} complaints.`}
              </p>
              <Link href="/orders">
                <Button size="sm" variant="outline" className="mt-5 border-white/10 hover:border-white/20">
                  View my orders
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filtered.map((c, i) => (
                <ComplaintCard key={c.id} complaint={c} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
