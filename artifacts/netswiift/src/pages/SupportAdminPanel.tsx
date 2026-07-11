import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  MessageCircle, User, Package, Check, RefreshCw, Settings, X, Send,
  Paperclip, ChevronLeft, Trash2, AlertCircle, Circle, Clock,
  CheckCircle, XCircle, RotateCcw, Upload, ToggleLeft, ToggleRight,
  Eye, EyeOff, UserCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  getTickets, getTicketById, updateTicket, acceptTicket, addMessage,
  getMessages, softDeleteMessage, getSupportSettings, saveSupportSettings,
  setAgentStatus, getAgentStatuses,
  type SupportTicket, type SupportMessage, type TicketStatus,
  type SupportSettings, type AgentStatusValue,
} from "@/lib/supportStore";

// ── Types ────────────────────────────────────────────────────────────────────

interface Viewer {
  email: string;
  name: string;
  role: "admin" | "agent";
}

type FilterTab = "all" | "pending" | "active" | "resolved";

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_META: Record<TicketStatus, { label: string; color: string; dot: string; icon: React.ElementType }> = {
  pending:     { label: "Pending",     color: "bg-amber-500/10 text-amber-400 border-amber-500/20",     dot: "bg-amber-400 animate-pulse", icon: Clock },
  accepted:    { label: "Accepted",    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",        dot: "bg-blue-400",                icon: UserCircle2 },
  in_progress: { label: "In Progress", color: "bg-teal-500/10 text-teal-400 border-teal-500/20",        dot: "bg-teal-400",                icon: Circle },
  waiting:     { label: "Waiting",     color: "bg-purple-500/10 text-purple-400 border-purple-500/20",  dot: "bg-purple-400",              icon: Clock },
  resolved:    { label: "Resolved",    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400",           icon: CheckCircle },
  closed:      { label: "Closed",      color: "bg-white/5 text-muted-foreground border-white/10",       dot: "bg-gray-500",                icon: XCircle },
  reopened:    { label: "Reopened",    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",     dot: "bg-amber-400 animate-pulse", icon: RotateCcw },
};

const NET_DOT: Record<string, string> = {
  MTN: "bg-yellow-500", Telecel: "bg-red-500", AirtelTigo: "bg-blue-500",
};

// ── Settings Panel ────────────────────────────────────────────────────────────

function SettingsPanel({ onClose }: { onClose: () => void }) {
  const [s, setS] = useState<SupportSettings>(() => getSupportSettings());
  const fileRef = useRef<HTMLInputElement>(null);

  function save(patch: Partial<SupportSettings>) {
    const next = { ...s, ...patch };
    setS(next);
    saveSupportSettings(patch);
    toast.success("Settings saved");
  }

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => save({ supportAvatarBase64: ev.target?.result as string });
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center gap-3 pb-3 border-b border-white/5">
        <Settings className="w-4 h-4 text-teal-400" />
        <h3 className="font-bold text-white">Support Settings</h3>
        <button onClick={onClose} className="ml-auto w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {([
          { label: "Widget Enabled", key: "widgetEnabled", desc: "Show chat widget to customers" },
          { label: "Support Open",   key: "supportOpen",   desc: "Agents are online / available" },
          { label: "Floating Message", key: "floatingMessageEnabled", desc: "Show speech bubble above widget" },
          { label: "Show Agent Name", key: "showHandlerNameDefault" as any, desc: "(Applied per-ticket)" },
        ] as { label: string; key: keyof SupportSettings; desc: string }[]).map(({ label, key, desc }) => (
          <div key={key} className="flex items-center justify-between gap-3 bg-white/5 border border-white/8 rounded-xl p-3">
            <div>
              <p className="text-sm font-medium text-white">{label}</p>
              <p className="text-[11px] text-muted-foreground">{desc}</p>
            </div>
            <button onClick={() => key in s && save({ [key]: !(s as any)[key] })} className="shrink-0">
              {(s as any)[key] ? (
                <ToggleRight className="w-8 h-8 text-teal-400" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-muted-foreground" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Text fields */}
      {([
        { label: "Support Name",      key: "supportName",      placeholder: "NetSwift Support" },
        { label: "Welcome Message",   key: "welcomeMessage",   placeholder: "Hi! How can we help?" },
        { label: "Floating Message",  key: "floatingMessage",  placeholder: "Need help? Chat with us!" },
      ] as { label: string; key: keyof SupportSettings; placeholder: string }[]).map(({ label, key, placeholder }) => (
        <div key={key} className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
          <Input
            value={String((s as any)[key] ?? "")}
            onChange={(e) => setS((prev) => ({ ...prev, [key]: e.target.value }))}
            onBlur={(e) => save({ [key]: e.target.value })}
            placeholder={placeholder}
            className="h-10 bg-black/20 border-white/10 focus-visible:ring-teal-500 text-white text-sm"
          />
        </div>
      ))}

      {/* Avatar */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Support Avatar</label>
        <div className="flex items-center gap-3">
          {s.supportAvatarBase64 ? (
            <img src={s.supportAvatarBase64} alt="avatar" className="w-12 h-12 rounded-full object-cover border border-white/10" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground">
              <UserCircle2 className="w-6 h-6" />
            </div>
          )}
          <div className="space-y-1">
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white/8 hover:bg-white/12 border border-white/10 text-xs text-white font-medium transition-colors">
              <Upload className="w-3 h-3" />Upload Image
            </button>
            {s.supportAvatarBase64 && (
              <button onClick={() => save({ supportAvatarBase64: null })}
                className="text-xs text-red-400 hover:text-red-300 px-1">
                Remove
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>
      </div>
    </div>
  );
}

// ── Chat View ─────────────────────────────────────────────────────────────────

function ChatView({ ticket, viewer, onUpdate }: { ticket: SupportTicket; viewer: Viewer; onUpdate: () => void }) {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [text, setText] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const settings = getSupportSettings();

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const refreshMessages = useCallback(() => {
    setMessages(getMessages(ticket.id));
  }, [ticket.id]);

  useEffect(() => {
    refreshMessages();
    const id = setInterval(refreshMessages, 2000);
    return () => clearInterval(id);
  }, [refreshMessages]);

  // Only auto-scroll when user is near the bottom (within 140px)
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distFromBottom < 140) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImageBase64(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (!text.trim() && !imageBase64) return;
    setSending(true);
    addMessage({
      ticketId: ticket.id,
      senderEmail: viewer.email,
      senderName: viewer.name,
      senderRole: viewer.role,
      content: text.trim(),
      imageBase64,
    });
    // Auto-progress status
    if (ticket.status === "accepted" || ticket.status === "reopened") {
      updateTicket(ticket.id, { status: "in_progress" });
    }
    setText("");
    setImageBase64(null);
    setSending(false);
    refreshMessages();
    onUpdate();
  }

  function handleDelete(msgId: string) {
    softDeleteMessage(msgId);
    refreshMessages();
    toast.success("Message removed");
  }

  const isHandlerOrAdmin = viewer.role === "admin" || ticket.assignedHandlerEmail === viewer.email;
  const agentLabel = ticket.showHandlerName && ticket.assignedHandlerName ? ticket.assignedHandlerName : settings.supportName;

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full space-y-2 py-10">
            <MessageCircle className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-xs text-muted-foreground">No messages yet. Start the conversation.</p>
          </div>
        )}
        {messages.map((msg) => {
          const isCustomer = msg.senderRole === "customer";
          if (msg.isDeleted) {
            return (
              <div key={msg.id} className={`flex ${isCustomer ? "justify-start" : "justify-end"}`}>
                <p className="text-[11px] text-muted-foreground/50 italic px-2 py-1">This message was removed</p>
              </div>
            );
          }
          return (
            <div key={msg.id}
              className={`flex ${isCustomer ? "justify-start" : "justify-end"} gap-2`}
              onMouseEnter={() => setHoveredMsg(msg.id)}
              onMouseLeave={() => setHoveredMsg(null)}
            >
              {isCustomer && (
                <div className="w-6 h-6 rounded-full bg-teal-500/20 border border-teal-500/20 flex items-center justify-center text-teal-400 text-[10px] font-bold shrink-0 mt-auto mb-1">
                  {ticket.customerName[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <div className={`max-w-[70%] space-y-0.5`}>
                <p className={`text-[10px] text-muted-foreground px-1 ${isCustomer ? "text-left" : "text-right"}`}>
                  {isCustomer ? ticket.customerName : agentLabel}
                </p>
                <div className="relative group">
                  <div className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    isCustomer
                      ? "bg-white/8 text-white rounded-bl-sm"
                      : "bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-br-sm"
                  }`}>
                    {msg.imageBase64 && (
                      <img src={msg.imageBase64} alt="attachment"
                        className="rounded-lg max-w-full mb-1.5 max-h-48 object-cover cursor-pointer"
                        onClick={() => window.open(msg.imageBase64!, "_blank")}
                      />
                    )}
                    {msg.content && <p>{msg.content}</p>}
                  </div>
                  {/* Delete button (hover) */}
                  {hoveredMsg === msg.id && isHandlerOrAdmin && (
                    <button onClick={() => handleDelete(msg.id)}
                      className={`absolute top-0 ${isCustomer ? "right-0 translate-x-full" : "left-0 -translate-x-full"} px-1 opacity-80 hover:opacity-100 text-red-400`}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className={`text-[10px] text-muted-foreground/50 px-1 ${isCustomer ? "text-left" : "text-right"}`}>
                  {format(new Date(msg.createdAt), "h:mm a")}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {isHandlerOrAdmin && !["closed"].includes(ticket.status) && (
        <div className="shrink-0 border-t border-white/5 px-3 py-3 space-y-2">
          {imageBase64 && (
            <div className="relative inline-block">
              <img src={imageBase64} alt="preview" className="h-14 w-auto rounded-lg border border-white/10" />
              <button onClick={() => setImageBase64(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          )}
          <form onSubmit={handleSend} className="flex items-end gap-2">
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-teal-400 transition-colors shrink-0">
              <Paperclip className="w-3.5 h-3.5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Reply to customer…"
              rows={1}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-teal-500/50 resize-none max-h-24 overflow-y-auto"
            />
            <button type="submit" disabled={sending || (!text.trim() && !imageBase64)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center text-white shrink-0 disabled:opacity-40 hover:opacity-90 transition-opacity">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ── Ticket Detail ─────────────────────────────────────────────────────────────

function TicketDetail({
  ticket: initialTicket,
  viewer,
  onBack,
  onUpdate,
}: {
  ticket: SupportTicket;
  viewer: Viewer;
  onBack: () => void;
  onUpdate: () => void;
}) {
  const [ticket, setTicket] = useState(initialTicket);
  const [showNameToggle, setShowNameToggle] = useState(ticket.showHandlerName);
  const isAdmin = viewer.role === "admin";
  const isHandler = ticket.assignedHandlerEmail === viewer.email;
  const canAct = isAdmin || isHandler;
  const isUnclaimed = !ticket.assignedHandlerEmail;

  // Sync ticket from store (polls every 2s)
  useEffect(() => {
    const id = setInterval(() => {
      const fresh = getTicketById(ticket.id);
      if (fresh) setTicket(fresh);
    }, 2000);
    return () => clearInterval(id);
  }, [ticket.id]);

  function doStatus(status: TicketStatus) {
    updateTicket(ticket.id, { status, ...(status === "resolved" ? { resolvedAt: new Date().toISOString() } : {}) });
    setTicket((t) => ({ ...t, status }));
    onUpdate();
    toast.success(`Ticket ${status.replace(/_/g, " ")}`);
  }

  function handleAccept() {
    const ok = acceptTicket(ticket.id, viewer);
    if (!ok) { toast.error("This ticket was already accepted by someone else."); return; }
    const fresh = getTicketById(ticket.id);
    if (fresh) setTicket(fresh);
    onUpdate();
    toast.success("Ticket accepted — you're now handling this.");
  }

  function toggleShowName(val: boolean) {
    updateTicket(ticket.id, { showHandlerName: val });
    setShowNameToggle(val);
  }

  const sm = STATUS_META[ticket.status] ?? STATUS_META.pending;

  const NEXT_ACTIONS: Partial<Record<TicketStatus, { label: string; next: TicketStatus; color: string }[]>> = {
    accepted:    [{ label: "Mark In Progress", next: "in_progress", color: "text-teal-400 border-teal-500/20 bg-teal-500/10 hover:bg-teal-500/20" }],
    in_progress: [
      { label: "Set Waiting",  next: "waiting",  color: "text-purple-400 border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/20" },
      { label: "Mark Resolved", next: "resolved", color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20" },
    ],
    waiting:     [
      { label: "Resume",        next: "in_progress", color: "text-teal-400 border-teal-500/20 bg-teal-500/10 hover:bg-teal-500/20" },
      { label: "Mark Resolved", next: "resolved",    color: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20" },
    ],
    resolved:    [
      { label: "Close",   next: "closed",   color: "text-muted-foreground border-white/10 bg-white/5 hover:bg-white/8" },
      { label: "Reopen",  next: "reopened", color: "text-amber-400 border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20" },
    ],
    closed:      [{ label: "Reopen", next: "reopened", color: "text-amber-400 border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20" }],
    reopened:    [{ label: "Mark In Progress", next: "in_progress", color: "text-teal-400 border-teal-500/20 bg-teal-500/10 hover:bg-teal-500/20" }],
  };

  return (
    <div className="flex flex-col h-full">
      {/* Detail header */}
      <div className="shrink-0 px-4 py-3 border-b border-white/5 space-y-3">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors md:hidden shrink-0">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <Badge className={`text-xs border ${sm.color}`}>{sm.label}</Badge>
          <span className="text-xs text-muted-foreground font-mono">#{ticket.conversationNumber}</span>
          <span className="text-xs text-muted-foreground ml-auto">{format(new Date(ticket.createdAt), "MMM d, h:mm a")}</span>
        </div>

        {/* Customer info — visible to admin & agent only */}
        <div className="bg-black/30 border border-white/5 rounded-xl p-3 space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Customer Details</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div>
              <p className="text-muted-foreground text-[10px]">Full Name</p>
              <p className="text-white font-semibold">{ticket.customerName}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-[10px]">Phone</p>
              <p className="text-white font-mono">{ticket.customerPhone || "—"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground text-[10px]">Email</p>
              <p className="text-white truncate">{ticket.customerEmail}</p>
            </div>
          </div>

          {ticket.orderId && ticket.orderData && (
            <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Attached Order</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div>
                  <p className="text-muted-foreground text-[10px]">Order ID</p>
                  <p className="text-white font-mono">{ticket.orderId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px]">Status</p>
                  <p className="text-white">{String(ticket.orderData.status ?? "—")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px]">Bundle</p>
                  <p className="text-white">{String(ticket.orderData.bundleSize ?? "—")} · {String(ticket.orderData.network ?? "—")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px]">Phone</p>
                  <p className="text-white font-mono">{String(ticket.orderData.phone ?? "—")}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accept / Status actions */}
        {ticket.status === "pending" && (
          <div className="flex gap-2">
            {(isAdmin || isUnclaimed) && (
              <button onClick={handleAccept}
                className="flex-1 h-8 text-xs font-bold rounded-xl border border-blue-500/30 bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-colors">
                Accept Ticket
              </button>
            )}
            {isAdmin && (
              <button onClick={() => doStatus("closed")}
                className="h-8 px-3 text-xs rounded-xl border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 transition-colors">
                Dismiss
              </button>
            )}
          </div>
        )}

        {canAct && ticket.status !== "pending" && (
          <div className="flex flex-wrap gap-1.5">
            {(NEXT_ACTIONS[ticket.status] ?? []).map(({ label, next, color }) => (
              <button key={next} onClick={() => doStatus(next)}
                className={`h-7 px-3 text-[11px] font-semibold rounded-lg border transition-colors ${color}`}>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Handler name toggle (admin only) */}
        {isAdmin && ticket.assignedHandlerName && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Show agent name to customer</span>
            <button onClick={() => toggleShowName(!showNameToggle)} className="text-teal-400">
              {showNameToggle ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <ChatView ticket={ticket} viewer={viewer} onUpdate={onUpdate} />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SupportAdminPanel({ viewer }: { viewer: Viewer }) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [showSettings, setShowSettings] = useState(false);
  const [agentStatusValue, setAgentStatusValue] = useState<AgentStatusValue>(() => {
    return getAgentStatuses()[viewer.email] ?? "online";
  });

  const refresh = useCallback(() => {
    const all = getTickets().sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    // Agents see: pending tickets + their own tickets
    const visible = viewer.role === "admin"
      ? all
      : all.filter((t) => t.status === "pending" || t.assignedHandlerEmail === viewer.email);
    setTickets(visible);
  }, [viewer.role, viewer.email]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, [refresh]);

  function handleAgentStatus(s: AgentStatusValue) {
    setAgentStatus(viewer.email, s);
    setAgentStatusValue(s);
  }

  const filtered = tickets.filter((t) => {
    if (filterTab === "all") return true;
    if (filterTab === "pending") return t.status === "pending";
    if (filterTab === "active") return ["accepted", "in_progress", "waiting", "reopened"].includes(t.status);
    if (filterTab === "resolved") return ["resolved", "closed"].includes(t.status);
    return true;
  });

  const pendingCount = tickets.filter((t) => t.status === "pending").length;
  const selectedTicket = selectedId ? tickets.find((t) => t.id === selectedId) ?? null : null;

  const AGENT_STATUS_CFG: Record<AgentStatusValue, { label: string; color: string }> = {
    online:  { label: "Online",  color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    busy:    { label: "Busy",    color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    offline: { label: "Offline", color: "text-muted-foreground bg-white/5 border-white/10" },
  };

  const FILTER_TABS: { id: FilterTab; label: string; count?: number }[] = [
    { id: "all",      label: "All",     count: tickets.length },
    { id: "pending",  label: "Pending", count: pendingCount },
    { id: "active",   label: "Active" },
    { id: "resolved", label: "Resolved" },
  ];

  return (
    <div className="flex h-full min-h-[600px] gap-0 overflow-hidden rounded-xl border border-white/8 bg-black/20">
      {/* Left: Ticket List */}
      <div className={`flex flex-col border-r border-white/5 bg-black/10 ${selectedTicket ? "hidden md:flex md:w-72 lg:w-80" : "flex w-full md:w-72 lg:w-80"}`}>
        {/* List header */}
        <div className="px-4 py-3 border-b border-white/5 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Support Tickets</h3>
            <div className="flex items-center gap-2">
              <button onClick={refresh} className="text-muted-foreground hover:text-white transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              {viewer.role === "admin" && (
                <button onClick={() => setShowSettings((s) => !s)} className={`text-muted-foreground hover:text-teal-400 transition-colors ${showSettings ? "text-teal-400" : ""}`}>
                  <Settings className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Agent status selector */}
          <div className="flex gap-1">
            {(Object.entries(AGENT_STATUS_CFG) as [AgentStatusValue, { label: string; color: string }][]).map(([s, cfg]) => (
              <button key={s} onClick={() => handleAgentStatus(s)}
                className={`flex-1 h-7 text-[11px] font-semibold rounded-lg border transition-all ${agentStatusValue === s ? cfg.color : "text-muted-foreground bg-transparent border-transparent hover:bg-white/5"}`}>
                {cfg.label}
              </button>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-0.5 bg-black/20 rounded-xl p-0.5">
            {FILTER_TABS.map((tab) => (
              <button key={tab.id} onClick={() => setFilterTab(tab.id)}
                className={`flex-1 h-7 text-[11px] font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${filterTab === tab.id ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"}`}>
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-[10px] rounded-full px-1 leading-none py-0.5 ${filterTab === tab.id ? "bg-white/20" : "bg-white/8"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Settings panel (inline) */}
        <AnimatePresence>
          {showSettings && viewer.role === "admin" && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="border-b border-white/5 overflow-y-auto max-h-80 px-4 pt-4">
              <SettingsPanel onClose={() => setShowSettings(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ticket list */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <MessageCircle className="w-8 h-8 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">No tickets</p>
            </div>
          )}
          {filtered.map((t) => {
            const sm = STATUS_META[t.status];
            const isSelected = t.id === selectedId;
            return (
              <button key={t.id} onClick={() => setSelectedId(t.id)}
                className={`w-full text-left px-4 py-3.5 hover:bg-white/5 transition-colors space-y-1.5 ${isSelected ? "bg-teal-500/5 border-l-2 border-l-teal-500" : ""}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${sm.dot}`} />
                    <p className="text-sm font-semibold text-white truncate">{t.customerName}</p>
                  </div>
                  <Badge className={`text-[10px] border shrink-0 ${sm.color}`}>{sm.label}</Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground truncate">
                    {t.orderId ? `📦 ${t.orderId}` : "No order attached"}
                  </p>
                  <span className="text-[10px] text-muted-foreground/50 shrink-0">
                    {format(new Date(t.updatedAt), "h:mm a")}
                  </span>
                </div>
                {t.assignedHandlerName && (
                  <p className="text-[10px] text-muted-foreground">
                    Handled by: <span className="text-white">{t.assignedHandlerName}</span>
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Ticket Detail */}
      <div className={`flex-1 overflow-hidden ${selectedTicket ? "flex flex-col" : "hidden md:flex md:flex-col"}`}>
        {selectedTicket ? (
          <TicketDetail
            ticket={selectedTicket}
            viewer={viewer}
            onBack={() => setSelectedId(null)}
            onUpdate={refresh}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-3 text-center px-8">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <p className="font-semibold text-white">Select a ticket</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Choose a support ticket from the left panel to view the conversation and customer details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
