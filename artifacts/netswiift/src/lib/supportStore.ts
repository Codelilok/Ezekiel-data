// ── Support System Data Layer ────────────────────────────────────────────────
// All data is persisted in localStorage. Components poll this store to simulate
// real-time updates.

// ── Types ────────────────────────────────────────────────────────────────────

export type TicketStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "waiting"
  | "resolved"
  | "closed"
  | "reopened";

export interface SupportTicket {
  id: string;
  conversationNumber: number;       // per-customer increment
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  orderId: string | null;
  orderData: Record<string, unknown> | null;
  assignedHandlerEmail: string | null;
  assignedHandlerName: string | null;
  assignedHandlerRole: "admin" | "agent" | null;
  showHandlerName: boolean;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderEmail: string;
  senderName: string;
  senderRole: "customer" | "admin" | "agent";
  content: string;
  imageBase64: string | null;
  isDeleted: boolean;
  createdAt: string;
}

export interface SupportSettings {
  widgetEnabled: boolean;
  supportOpen: boolean;
  supportName: string;
  supportAvatarBase64: string | null;
  welcomeMessage: string;
  floatingMessage: string;
  floatingMessageEnabled: boolean;
}

// ── Storage Keys ─────────────────────────────────────────────────────────────

const KEY_SETTINGS = "nsSupportSettings";
const KEY_TICKETS  = "nsSupportTickets";
const KEY_MESSAGES = "nsSupportMessages";
const KEY_STATUSES = "nsAgentStatuses";

// ── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: SupportSettings = {
  widgetEnabled: true,
  supportOpen: true,
  supportName: "NetSwift Support",
  supportAvatarBase64: null,
  welcomeMessage: "Hi there! 👋 How can we help you today?",
  floatingMessage: "Need help? Chat with us!",
  floatingMessageEnabled: true,
};

// ── Utility ──────────────────────────────────────────────────────────────────

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function now(): string {
  return new Date().toISOString();
}

// ── Settings ─────────────────────────────────────────────────────────────────

export function getSupportSettings(): SupportSettings {
  try {
    const raw = localStorage.getItem(KEY_SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSupportSettings(patch: Partial<SupportSettings>): void {
  localStorage.setItem(KEY_SETTINGS, JSON.stringify({ ...getSupportSettings(), ...patch }));
}

// ── Tickets ──────────────────────────────────────────────────────────────────

export function getTickets(): SupportTicket[] {
  try {
    return JSON.parse(localStorage.getItem(KEY_TICKETS) ?? "[]");
  } catch {
    return [];
  }
}

function saveTickets(list: SupportTicket[]): void {
  localStorage.setItem(KEY_TICKETS, JSON.stringify(list));
}

export function getTicketById(id: string): SupportTicket | null {
  return getTickets().find((t) => t.id === id) ?? null;
}

/** Returns the most recent active (non-resolved/closed) ticket for a customer */
export function getActiveTicketForCustomer(email: string): SupportTicket | null {
  const closed: TicketStatus[] = ["resolved", "closed"];
  const active = getTickets()
    .filter((t) => t.customerEmail === email && !closed.includes(t.status))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return active[0] ?? null;
}

export function createTicket(data: {
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  orderId?: string | null;
  orderData?: Record<string, unknown> | null;
}): SupportTicket {
  const list = getTickets();
  const convNum = list.filter((t) => t.customerEmail === data.customerEmail).length + 1;
  const ticket: SupportTicket = {
    id: uid(),
    conversationNumber: convNum,
    customerEmail: data.customerEmail,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    orderId: data.orderId ?? null,
    orderData: data.orderData ?? null,
    assignedHandlerEmail: null,
    assignedHandlerName: null,
    assignedHandlerRole: null,
    showHandlerName: true,
    status: "pending",
    createdAt: now(),
    updatedAt: now(),
    resolvedAt: null,
  };
  list.push(ticket);
  saveTickets(list);
  return ticket;
}

export function updateTicket(id: string, patch: Partial<SupportTicket>): void {
  const list = getTickets().map((t) =>
    t.id === id ? { ...t, ...patch, updatedAt: now() } : t
  );
  saveTickets(list);
}

export function acceptTicket(
  ticketId: string,
  handler: { email: string; name: string; role: "admin" | "agent" }
): boolean {
  const ticket = getTicketById(ticketId);
  if (!ticket || ticket.assignedHandlerEmail) return false; // already claimed
  updateTicket(ticketId, {
    assignedHandlerEmail: handler.email,
    assignedHandlerName: handler.name,
    assignedHandlerRole: handler.role,
    status: "accepted",
  });
  return true;
}

// ── Messages ─────────────────────────────────────────────────────────────────

function getAllMessages(): SupportMessage[] {
  try {
    return JSON.parse(localStorage.getItem(KEY_MESSAGES) ?? "[]");
  } catch {
    return [];
  }
}

export function getMessages(ticketId: string): SupportMessage[] {
  return getAllMessages()
    .filter((m) => m.ticketId === ticketId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function addMessage(data: {
  ticketId: string;
  senderEmail: string;
  senderName: string;
  senderRole: "customer" | "admin" | "agent";
  content: string;
  imageBase64?: string | null;
}): SupportMessage {
  const all = getAllMessages();
  const msg: SupportMessage = {
    id: uid(),
    ticketId: data.ticketId,
    senderEmail: data.senderEmail,
    senderName: data.senderName,
    senderRole: data.senderRole,
    content: data.content,
    imageBase64: data.imageBase64 ?? null,
    isDeleted: false,
    createdAt: now(),
  };
  all.push(msg);
  localStorage.setItem(KEY_MESSAGES, JSON.stringify(all));
  updateTicket(data.ticketId, {}); // touch updatedAt
  return msg;
}

export function softDeleteMessage(msgId: string): void {
  const all = getAllMessages().map((m) =>
    m.id === msgId ? { ...m, isDeleted: true } : m
  );
  localStorage.setItem(KEY_MESSAGES, JSON.stringify(all));
}

// ── Agent Statuses ────────────────────────────────────────────────────────────

export type AgentStatusValue = "online" | "busy" | "offline";

export function getAgentStatuses(): Record<string, AgentStatusValue> {
  try {
    return JSON.parse(localStorage.getItem(KEY_STATUSES) ?? "{}");
  } catch {
    return {};
  }
}

export function setAgentStatus(email: string, status: AgentStatusValue): void {
  const all = getAgentStatuses();
  all[email] = status;
  localStorage.setItem(KEY_STATUSES, JSON.stringify(all));
}
