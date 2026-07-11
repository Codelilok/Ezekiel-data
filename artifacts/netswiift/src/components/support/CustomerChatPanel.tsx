import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Send, X, Paperclip, Package, ChevronRight, MessageCircle, Plus } from "lucide-react";
import { format } from "date-fns";
import {
  getSupportSettings,
  getActiveTicketForCustomer,
  createTicket,
  updateTicket,
  getMessages,
  addMessage,
  type SupportTicket,
  type SupportMessage,
  type SupportSettings,
} from "@/lib/supportStore";
import { getLocalOrders } from "@/lib/dummyData";

interface CustomerChatPanelProps {
  customer: { name: string; email: string; phone?: string };
  settings: SupportSettings;
  onClose: () => void;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:     { label: "Waiting for agent", color: "text-amber-400" },
  accepted:    { label: "Agent connected",   color: "text-blue-400" },
  in_progress: { label: "In progress",       color: "text-teal-400" },
  waiting:     { label: "Waiting on you",    color: "text-purple-400" },
  resolved:    { label: "Resolved ✓",        color: "text-emerald-400" },
  closed:      { label: "Closed",            color: "text-muted-foreground" },
  reopened:    { label: "Reopened",          color: "text-amber-400" },
};

function OrderSelector({ onSelect, onClose }: { onSelect: (o: any) => void; onClose: () => void; }) {
  const orders = getLocalOrders();
  const NET_COLOR: Record<string, string> = { MTN: "bg-yellow-500", Telecel: "bg-red-500", AirtelTigo: "bg-blue-500" };
  return (
    <div className="absolute inset-x-0 bottom-full mb-2 mx-2 bg-[#0f1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
        <p className="text-xs font-bold text-white uppercase tracking-wider">Select an Order</p>
        <button onClick={onClose} className="text-muted-foreground hover:text-white"><X className="w-3.5 h-3.5" /></button>
      </div>
      {orders.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">No orders found</p>
      ) : (
        orders.slice(0, 8).map((o: any) => {
          const netKey = o.network as string;
          const dotColor = NET_COLOR[netKey] ?? "bg-gray-500";
          return (
            <button key={o.orderId} onClick={() => onSelect(o)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0">
              <div className={`w-7 h-7 rounded-lg ${dotColor} flex items-center justify-center text-white font-bold text-xs shrink-0`}>{netKey[0]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono font-semibold text-white truncate">{o.orderId}</p>
                <p className="text-[11px] text-muted-foreground">{o.network} · {o.bundleSize}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            </button>
          );
        })
      )}
    </div>
  );
}

export default function CustomerChatPanel({ customer, settings, onClose }: CustomerChatPanelProps) {
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [text, setText] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderPicker, setShowOrderPicker] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [phase, setPhase] = useState<"welcome" | "chat">("welcome");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const CLOSED_STATUSES = ["resolved", "closed"];

  // Load ticket and messages, poll every 2s
  const refresh = useCallback(() => {
    const t = getActiveTicketForCustomer(customer.email);
    setTicket(t);
    if (t) {
      setMessages(getMessages(t.id));
      setPhase("chat");
    } else {
      setPhase("welcome");
    }
  }, [customer.email]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 2000);
    return () => clearInterval(id);
  }, [refresh]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImageBase64(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  // Auto-send called when customer taps an order in the picker
  function handleSendOrder(order: any) {
    setSending(true);
    let t = ticket;

    if (!t) {
      t = createTicket({
        customerEmail: customer.email,
        customerName: customer.name,
        customerPhone: customer.phone ?? "",
        orderId: order.orderId,
        orderData: order,
      });
      setTicket(t);
      setPhase("chat");
    } else if (!t.orderId) {
      // Attach order to existing open ticket
      updateTicket(t.id, { orderId: order.orderId, orderData: order });
    }

    addMessage({
      ticketId: t.id,
      senderEmail: customer.email,
      senderName: customer.name,
      senderRole: "customer",
      content: `I need help with my order: ${order.orderId} · ${order.network} ${order.bundleSize}`,
      imageBase64: null,
    });

    setSelectedOrder(null);
    setShowOrderPicker(false);
    setSending(false);
    refresh();
  }

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (!text.trim() && !imageBase64) return;
    setSending(true);

    let t = ticket;

    // Create a new ticket if none active
    if (!t) {
      t = createTicket({
        customerEmail: customer.email,
        customerName: customer.name,
        customerPhone: customer.phone ?? "",
        orderId: selectedOrder?.orderId ?? null,
        orderData: selectedOrder ?? null,
      });
      setTicket(t);
      setPhase("chat");
    }

    addMessage({
      ticketId: t.id,
      senderEmail: customer.email,
      senderName: customer.name,
      senderRole: "customer",
      content: text.trim(),
      imageBase64,
    });

    setText("");
    setImageBase64(null);
    setSelectedOrder(null);
    setSending(false);
    refresh();
  }

  function handleStartNew() {
    // The customer's current ticket is resolved/closed — just clear local state
    // Next message will create a fresh ticket automatically
    setTicket(null);
    setMessages([]);
    setPhase("welcome");
  }

  const agentName =
    ticket?.showHandlerName && ticket?.assignedHandlerName
      ? ticket.assignedHandlerName
      : settings.supportName;

  const isResolved = ticket && CLOSED_STATUSES.includes(ticket.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      style={{ position: "fixed", zIndex: 9985 }}
      className="bottom-4 right-4 left-4 sm:left-auto sm:w-[360px] sm:right-6 sm:bottom-24"
    >
      <div className="bg-[#0d0f14] border border-white/10 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden flex flex-col h-[520px] sm:h-[500px]">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5 bg-gradient-to-r from-teal-500/10 to-purple-500/10 shrink-0">
          {settings.supportAvatarBase64 ? (
            <img src={settings.supportAvatarBase64} alt="Support" className="w-9 h-9 rounded-full object-cover border border-white/10" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4 text-white fill-white/30" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm truncate">{settings.supportName}</p>
            {ticket && (
              <p className={`text-[11px] font-medium truncate ${STATUS_LABEL[ticket.status]?.color ?? "text-muted-foreground"}`}>
                {STATUS_LABEL[ticket.status]?.label ?? ticket.status}
              </p>
            )}
            {!ticket && (
              <p className="text-[11px] text-emerald-400 font-medium">
                {settings.supportOpen ? "● Online" : "● Offline"}
              </p>
            )}
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-white transition-colors shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Welcome screen */}
        {phase === "welcome" && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 to-purple-500/20 border border-teal-500/20 flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-teal-400" />
            </div>
            <div className="space-y-1.5">
              <p className="font-bold text-white text-base">{settings.welcomeMessage}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {settings.supportOpen
                  ? "Our team typically replies in a few minutes."
                  : "We're currently offline. Leave a message and we'll respond when we're back."}
              </p>
            </div>
          </div>
        )}

        {/* Chat messages */}
        {phase === "chat" && (
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {/* Ticket info banner */}
            {ticket?.orderId && (
              <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2 mb-2">
                <Package className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Order: <span className="text-white font-mono font-semibold">{ticket.orderId}</span>
                  {ticket.orderData?.bundleSize ? ` · ${ticket.orderData.bundleSize}` : ""}
                </p>
              </div>
            )}

            {messages.length === 0 && (
              <div className="text-center py-6">
                <p className="text-xs text-muted-foreground">Start the conversation below.</p>
              </div>
            )}

            {messages.map((msg) => {
              const isMe = msg.senderRole === "customer";
              if (msg.isDeleted) {
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <p className="text-[11px] text-muted-foreground/50 italic px-3 py-1">This message was removed</p>
                  </div>
                );
              }
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} gap-2`}>
                  {!isMe && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 mt-auto mb-1">
                      {agentName[0]}
                    </div>
                  )}
                  <div className={`max-w-[75%] space-y-0.5`}>
                    {!isMe && (
                      <p className="text-[10px] text-muted-foreground px-1">{agentName}</p>
                    )}
                    <div className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      isMe
                        ? "bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-br-sm"
                        : "bg-white/8 text-white rounded-bl-sm"
                    }`}>
                      {msg.imageBase64 && (
                        <img src={msg.imageBase64} alt="attachment" className="rounded-lg max-w-full mb-1.5 max-h-48 object-cover" />
                      )}
                      {msg.content && <p>{msg.content}</p>}
                    </div>
                    <p className={`text-[10px] text-muted-foreground/50 px-1 ${isMe ? "text-right" : "text-left"}`}>
                      {format(new Date(msg.createdAt), "h:mm a")}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Resolved banner + New conversation */}
        {isResolved && (
          <div className="px-4 py-3 border-t border-white/5 bg-emerald-500/5 shrink-0">
            <p className="text-xs text-emerald-400 text-center mb-2">This conversation has been resolved.</p>
            <button onClick={handleStartNew}
              className="w-full h-9 rounded-xl bg-gradient-to-r from-teal-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center gap-2">
              <Plus className="w-3.5 h-3.5" />Start New Conversation
            </button>
          </div>
        )}

        {/* Input area (hidden when resolved) */}
        {!isResolved && (
          <div className="shrink-0 border-t border-white/5 px-3 py-3 space-y-2 relative">
            {showOrderPicker && (
              <OrderSelector
                onSelect={(o) => { handleSendOrder(o); }}
                onClose={() => setShowOrderPicker(false)}
              />
            )}

            {/* Selected order tag */}
            {selectedOrder && (
              <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-lg px-2.5 py-1.5">
                <Package className="w-3 h-3 text-teal-400 shrink-0" />
                <p className="text-xs text-teal-300 flex-1 truncate font-mono">{selectedOrder.orderId} · {selectedOrder.bundleSize}</p>
                <button onClick={() => setSelectedOrder(null)} className="text-muted-foreground hover:text-white shrink-0"><X className="w-3 h-3" /></button>
              </div>
            )}

            {/* Image preview */}
            {imageBase64 && (
              <div className="relative inline-block">
                <img src={imageBase64} alt="preview" className="h-16 w-auto rounded-lg border border-white/10" />
                <button onClick={() => setImageBase64(null)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            )}

            <form onSubmit={handleSend} className="flex items-end gap-2">
              <div className="flex gap-1 shrink-0">
                <button type="button" onClick={() => setShowOrderPicker((s) => !s)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-teal-400 transition-colors">
                  <Package className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-teal-400 transition-colors">
                  <Paperclip className="w-3.5 h-3.5" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={settings.supportOpen ? "Type a message…" : "Leave a message…"}
                rows={1}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-teal-500/50 resize-none leading-relaxed max-h-24 overflow-y-auto"
              />
              <button type="submit" disabled={sending || (!text.trim() && !imageBase64)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center text-white shrink-0 disabled:opacity-40 transition-opacity hover:opacity-90">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </motion.div>
  );
}
