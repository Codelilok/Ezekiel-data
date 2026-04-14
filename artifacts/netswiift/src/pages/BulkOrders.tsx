import React, { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Zap, CheckCircle2, XCircle, AlertTriangle, ShoppingCart, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const VALID_SIZES = [1, 2, 5, 10, 20];
const PRICE_MAP: Record<number, number> = { 1: 5, 2: 10, 5: 25, 10: 45, 20: 80 };

type EntryStatus = "valid" | "invalid_phone" | "invalid_gb" | "duplicate";

interface ParsedEntry {
  raw: string;
  phone: string;
  gb: number;
  price: number;
  status: EntryStatus;
  error?: string;
}

function parseEntries(raw: string): ParsedEntry[] {
  const seen = new Set<string>();
  return raw
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean)
    .map(line => {
      const parts = line.split(/\s+/);
      const phone = parts[0] ?? "";
      const gbRaw = parts[1] ?? "";
      const gb = parseFloat(gbRaw);
      if (!/^0\d{9}$/.test(phone))
        return { raw: line, phone, gb: 0, price: 0, status: "invalid_phone" as EntryStatus, error: "Invalid phone" };
      if (!gbRaw || isNaN(gb) || !VALID_SIZES.includes(gb))
        return { raw: line, phone, gb, price: 0, status: "invalid_gb" as EntryStatus, error: `GB must be one of: ${VALID_SIZES.join(", ")}` };
      if (seen.has(phone))
        return { raw: line, phone, gb, price: PRICE_MAP[gb], status: "duplicate" as EntryStatus, error: "Duplicate phone" };
      seen.add(phone);
      return { raw: line, phone, gb, price: PRICE_MAP[gb], status: "valid" as EntryStatus };
    });
}

const STATUS_CFG = {
  valid:         { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  invalid_phone: { icon: XCircle,      color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20" },
  invalid_gb:    { icon: XCircle,      color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20" },
  duplicate:     { icon: AlertTriangle,color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20" },
};

export default function BulkOrders() {
  const [, setLocation] = useLocation();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const entries = useMemo(() => (input.trim() ? parseEntries(input) : []), [input]);
  const valid   = entries.filter(e => e.status === "valid");
  const invalid = entries.filter(e => e.status !== "valid");
  const total   = valid.reduce((sum, e) => sum + e.price, 0);

  function handleClear() { setInput(""); setDone(false); }

  function handlePurchase() {
    if (valid.length === 0) return toast.error("No valid entries to purchase");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      toast.success(`${valid.length} order${valid.length > 1 ? "s" : ""} placed!`);
    }, 1800);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center h-14 px-4 gap-3 max-w-3xl mx-auto w-full">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")} className="h-9 w-9 text-muted-foreground hover:text-white -ml-1 shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white fill-current" />
            </div>
            <span className="font-bold text-white">Bulk Orders</span>
          </div>
          {input && (
            <button onClick={handleClear} className="text-xs text-muted-foreground hover:text-white flex items-center gap-1 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-5">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div key="input" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

              <Card className="border-white/10 bg-black/20">
                <CardContent className="p-4 space-y-2">
                  <p className="text-sm font-semibold text-white">How it works</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Enter one entry per line: <span className="font-mono text-teal-400">phone space GB</span>
                  </p>
                  <div className="mt-2 bg-black/30 rounded-lg p-3 font-mono text-xs text-muted-foreground space-y-0.5 border border-white/5">
                    <p>0557654101 1</p><p>0244123456 5</p><p>0201234567 10</p>
                  </div>
                </CardContent>
              </Card>

              <Textarea
                value={input}
                onChange={e => { setInput(e.target.value); setDone(false); }}
                placeholder={"0557654101 1\n0244123456 5\n0201234567 10"}
                className="min-h-[180px] font-mono text-sm bg-black/20 border-white/10 focus-visible:ring-teal-500 text-white resize-none leading-relaxed"
              />

              {entries.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* Summary */}
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300 font-medium">{valid.length} valid</span>
                    </div>
                    {invalid.length > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-sm">
                        <XCircle className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-red-300 font-medium">{invalid.length} error{invalid.length > 1 ? "s" : ""}</span>
                      </div>
                    )}
                    {valid.length > 0 && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-sm ml-auto">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="text-teal-300 font-bold">GHS {total}</span>
                      </div>
                    )}
                  </div>

                  <Card className="border-white/10 bg-black/20 overflow-hidden">
                    <div className="divide-y divide-white/5">
                      {entries.map((entry, i) => {
                        const cfg = STATUS_CFG[entry.status];
                        const Icon = cfg.icon;
                        return (
                          <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                            className="flex items-center gap-3 px-4 py-3">
                            <Icon className={`w-4 h-4 shrink-0 ${cfg.color}`} />
                            <span className="font-mono text-sm text-white flex-1">{entry.phone}</span>
                            {entry.status === "valid" ? (
                              <>
                                <span className="text-sm font-semibold text-white">{entry.gb}GB</span>
                                <span className="text-sm text-teal-400 font-bold min-w-[56px] text-right">GHS {entry.price}</span>
                              </>
                            ) : (
                              <Badge className={`text-xs border ${cfg.bg} ${cfg.border} ${cfg.color} font-medium`}>{entry.error}</Badge>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </Card>

                  {valid.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                      <Button onClick={handlePurchase} disabled={loading}
                        className="w-full h-14 bg-gradient-to-r from-teal-500 to-purple-600 text-white font-bold border-none text-base shadow-lg shadow-teal-500/20 hover:opacity-90 transition-opacity">
                        {loading
                          ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing {valid.length} orders...</>
                          : <><ShoppingCart className="w-5 h-5 mr-2" /> Purchase {valid.length} order{valid.length > 1 ? "s" : ""} · GHS {total}</>
                        }
                      </Button>
                      {invalid.length > 0 && <p className="text-xs text-center text-amber-400 mt-2">{invalid.length} invalid entr{invalid.length > 1 ? "ies" : "y"} will be skipped</p>}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div key="done" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center text-center py-16 space-y-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                className="w-24 h-24 rounded-full bg-teal-500/15 border-2 border-teal-500/30 flex items-center justify-center shadow-2xl shadow-teal-500/10">
                <CheckCircle2 className="w-12 h-12 text-teal-400" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-extrabold text-white mb-1">Orders Placed!</h2>
                <p className="text-muted-foreground text-sm">{valid.length} order{valid.length > 1 ? "s" : ""} submitted · <span className="text-teal-400 font-semibold">GHS {total} charged</span></p>
              </div>
              <div className="flex gap-3 w-full max-w-xs">
                <Button variant="outline" onClick={() => setLocation("/dashboard")} className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-white">Dashboard</Button>
                <Button onClick={handleClear} className="flex-1 bg-gradient-to-r from-teal-500 to-purple-600 text-white font-bold border-none">
                  <RefreshCw className="w-4 h-4 mr-1.5" /> New Batch
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
