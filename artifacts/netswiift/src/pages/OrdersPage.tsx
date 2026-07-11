import React, { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Package, Activity, MessageSquare, Check, ChevronDown, ChevronUp, Loader2, X, Plus } from "lucide-react";
import { format } from "date-fns";
import { useListOrders } from "@workspace/api-client-react";
import { getLocalOrders } from "@/lib/dummyData";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const NET_COLOR: Record<string, string> = {
  mtn: "bg-yellow-500", telecel: "bg-red-500", airteltigo: "bg-blue-500",
};
const NET_TEXT: Record<string, string> = {
  mtn: "text-yellow-400", telecel: "text-red-400", airteltigo: "text-blue-400",
};

function statusCls(s: string) {
  switch (s.toLowerCase()) {
    case "completed": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "failed":    return "bg-red-500/10 text-red-400 border-red-500/20";
    default:          return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  }
}
function statusDot(s: string) {
  switch (s.toLowerCase()) {
    case "completed": return "bg-emerald-400";
    case "failed":    return "bg-red-400";
    default:          return "bg-amber-400 animate-pulse";
  }
}

const PRESET_REASONS = [
  "Completed but not received",
  "Wrong number credited",
  "Data expired too quickly",
  "Double charge on my account",
  "Other (describe below)",
];

function generateTrackingId() {
  return `TRK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

function getCurrentUser(): { email: string; name: string } {
  try {
    const raw = localStorage.getItem("nsUser");
    if (raw) {
      const u = JSON.parse(raw) as { email?: string; name?: string };
      return { email: u.email ?? "", name: u.name ?? "" };
    }
  } catch {}
  return { email: "", name: "" };
}

function saveComplaint(complaint: Record<string, unknown>) {
  const existing = JSON.parse(localStorage.getItem("nsComplaints") ?? "[]");
  const { email, name } = getCurrentUser();
  existing.push({ ...complaint, userEmail: email, customerName: name });
  localStorage.setItem("nsComplaints", JSON.stringify(existing));
}

function ComplaintPanel({ order, onClose }: { order: { orderId: string; phone: string; network: string; bundleSize: string; status: string }; onClose: () => void }) {
  const [preset, setPreset] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trackingId] = useState(generateTrackingId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!preset) { toast.error("Please select an issue type"); return; }
    if (preset === "Other (describe below)" && !message.trim()) { toast.error("Please describe your issue"); return; }
    setLoading(true);
    setTimeout(() => {
      saveComplaint({
        id: trackingId,
        trackingId,
        orderId: order.orderId,
        phone: order.phone,
        network: order.network,
        bundleSize: order.bundleSize,
        orderStatus: order.status,
        preset,
        message: message.trim(),
        status: "Submitted",
        acceptedBy: null,
        createdAt: new Date().toISOString(),
      });
      setLoading(false);
      setSubmitted(true);
      toast.success("Complaint submitted successfully");
    }, 1200);
  }

  const formatted = `ORDER COMPLAINT\n\nOrder ID: ${order.orderId}\nPhone: ${order.phone}\nNetwork: ${order.network}\nBundle: ${order.bundleSize}\nStatus: ${order.status}\n\nIssue: ${preset}\nMessage:\n"${message}"`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-4 sm:pb-0" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-md bg-[#0f1117] border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/15 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Order Complaint</p>
              <p className="text-xs text-muted-foreground">Tracking: <span className="font-mono text-teal-400">{trackingId}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-teal-500/15 border-2 border-teal-500/30 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-teal-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">Complaint Received</p>
                  <p className="text-sm text-muted-foreground mt-1">Our team will review and respond shortly.</p>
                </div>
                <div className="bg-black/30 rounded-xl p-4 border border-white/5 text-left">
                  <p className="text-xs text-muted-foreground mb-1">Tracking ID</p>
                  <p className="font-mono text-teal-400 font-bold">{trackingId}</p>
                </div>
                <Button onClick={onClose} className="w-full h-11 bg-gradient-to-r from-teal-500 to-purple-600 text-white font-bold border-none">Done</Button>
              </motion.div>
            ) : (
              <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="space-y-4">
                {/* Order summary */}
                <div className="bg-black/30 rounded-2xl p-4 border border-white/5 text-sm space-y-2">
                  {[
                    { k: "Order ID", v: order.orderId },
                    { k: "Phone", v: order.phone },
                    { k: "Network", v: order.network },
                    { k: "Bundle", v: order.bundleSize },
                    { k: "Status", v: order.status },
                  ].map(row => (
                    <div key={row.k} className="flex justify-between">
                      <span className="text-muted-foreground">{row.k}</span>
                      <span className="text-white font-medium font-mono">{row.v}</span>
                    </div>
                  ))}
                </div>

                {/* Preset reasons */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Issue Type</p>
                  <div className="space-y-2">
                    {PRESET_REASONS.map((reason) => (
                      <button key={reason} type="button" onClick={() => setPreset(reason)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all
                          ${preset === reason ? "border-teal-500/50 bg-teal-500/10 text-white" : "border-white/10 bg-black/20 text-muted-foreground hover:border-white/20 hover:text-white"}`}>
                        <div className="flex items-center justify-between">
                          <span>{reason}</span>
                          {preset === reason && <Check className="w-4 h-4 text-teal-400 shrink-0" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Message {preset !== "Other (describe below)" && <span className="normal-case text-muted-foreground/50">(optional)</span>}
                  </p>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    className="min-h-[90px] bg-black/20 border-white/10 focus-visible:ring-red-400 resize-none text-white text-sm"
                  />
                </div>

                <Button type="submit" disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold border-none hover:opacity-90 transition-opacity">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Submitting...</> : "Submit Complaint"}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function OrderCard({ order, index }: { order: any; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [showComplaint, setShowComplaint] = useState(false);
  const netKey = order.network.toLowerCase();
  const dotColor = NET_COLOR[netKey] ?? "bg-gray-500";
  const textColor = NET_TEXT[netKey] ?? "text-gray-400";
  const isCompleted = order.status.toLowerCase() === "completed";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className="bg-black/25 border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-colors"
      >
        <div className="p-4 flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(e => !e)}>
          <div className={`w-10 h-10 rounded-xl ${dotColor} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md`}>
            {order.network.substring(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-sm text-white font-semibold truncate">{order.orderId}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs font-bold ${textColor}`}>{order.bundleSize}</span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-xs text-muted-foreground">{format(new Date(order.createdAt), "MMM d, h:mm a")}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusCls(order.status)}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusDot(order.status)} inline-block`} />
              {order.status}
            </span>
            {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {[
                    { k: "Network", v: order.network },
                    { k: "Bundle",  v: order.bundleSize },
                    { k: "Phone",   v: order.phone },
                    { k: "Date",    v: format(new Date(order.createdAt), "MMM d, yyyy") },
                  ].map(row => (
                    <div key={row.k}>
                      <p className="text-xs text-muted-foreground mb-0.5">{row.k}</p>
                      <p className="text-white font-medium">{row.v}</p>
                    </div>
                  ))}
                </div>

                {isCompleted && (
                  <button
                    onClick={() => setShowComplaint(true)}
                    className="group w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageSquare className="w-4 h-4 text-red-400 shrink-0" />
                      <div className="text-left">
                        <p className="text-xs font-semibold text-white">Issue with this order?</p>
                        <p className="text-[11px] text-muted-foreground">Tap to make a complaint</p>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-red-400 -rotate-90 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showComplaint && (
          <ComplaintPanel
            order={{ orderId: order.orderId, phone: order.phone ?? "", network: order.network, bundleSize: order.bundleSize, status: order.status }}
            onClose={() => setShowComplaint(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default function OrdersPage() {
  const [filter, setFilter] = useState<string>("all");
  const { data: apiOrders, isLoading } = useListOrders({
    status: filter !== "all" ? filter.charAt(0).toUpperCase() + filter.slice(1) : undefined,
  });

  const allLocal = getLocalOrders();
  const filteredLocal = filter === "all" ? allLocal : allLocal.filter(o => o.status.toLowerCase() === filter);
  const orders = (!isLoading && (!apiOrders || apiOrders.length === 0)) ? filteredLocal : apiOrders;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="hover:bg-white/10 h-9 w-9"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <h1 className="font-bold text-lg text-white">Orders</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-5">
        <Tabs defaultValue="all" onValueChange={setFilter} className="w-full">
          <TabsList className="bg-white/5 border border-white/10 h-10 w-full flex">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="pending" className="flex-1">Pending</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 text-xs sm:text-sm">Completed</TabsTrigger>
            <TabsTrigger value="failed" className="flex-1">Failed</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-3">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-black/25 border border-white/8 rounded-2xl p-4 flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl bg-white/10 shrink-0" />
                <div className="flex-1 space-y-2"><Skeleton className="h-4 w-32 bg-white/10" /><Skeleton className="h-3 w-24 bg-white/10" /></div>
                <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
              </div>
            ))
          ) : orders?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Package className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="font-semibold text-white">No orders found</p>
              <p className="text-sm text-muted-foreground">Your orders will appear here once you make a purchase.</p>
              <Link href="/mtn">
                <Button size="sm" className="mt-2 h-9 bg-gradient-to-r from-teal-500 to-purple-600 text-white font-semibold border-none text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />Buy Data
                </Button>
              </Link>
            </div>
          ) : (
            orders?.map((order, i) => <OrderCard key={order.id} order={order} index={i} />)
          )}
        </div>
      </main>
    </div>
  );
}
