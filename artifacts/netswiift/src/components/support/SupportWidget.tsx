import React, { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSupportSettings } from "@/lib/supportStore";
import CustomerChatPanel from "./CustomerChatPanel";

function getLoggedInCustomer(): { name: string; email: string; phone?: string } | null {
  try {
    const admin = localStorage.getItem("nsAdmin");
    if (admin) return null;
    const raw = localStorage.getItem("nsUser");
    if (!raw) return null;
    const user = JSON.parse(raw) as { name: string; email: string; phone?: string; role?: string };
    const users: any[] = JSON.parse(localStorage.getItem("nsUsers") ?? "[]");
    const found = users.find((u: any) => u.email?.toLowerCase() === user.email?.toLowerCase());
    if (found && (found.role === "agent" || found.role === "admin")) return null;
    return user;
  } catch {
    return null;
  }
}

export default function SupportWidget() {
  const [settings, setSettings] = useState(() => getSupportSettings());
  const [open, setOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [customer, setCustomer] = useState(() => getLoggedInCustomer());

  // Position state — fixed bottom-right by default
  const [pos, setPos] = useState({ x: -1, y: -1 });
  const dragging = useRef(false);
  const moved = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const btnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refresh = () => {
      setSettings(getSupportSettings());
      setCustomer(getLoggedInCustomer());
    };
    window.addEventListener("focus", refresh);
    const id = setInterval(refresh, 3000);
    return () => { window.removeEventListener("focus", refresh); clearInterval(id); };
  }, []);

  // Show floating bubble once after delay, auto-dismiss
  useEffect(() => {
    if (!settings.floatingMessageEnabled || !settings.widgetEnabled || open) return;
    const t = setTimeout(() => setShowBubble(true), 1800);
    const t2 = setTimeout(() => setShowBubble(false), 8000);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [settings.floatingMessageEnabled, settings.widgetEnabled, open]);

  // Hide bubble when chat opens
  useEffect(() => { if (open) setShowBubble(false); }, [open]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    moved.current = false;
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    moved.current = true;
    const x = Math.max(0, Math.min(window.innerWidth - 64, e.clientX - offset.current.x));
    const y = Math.max(0, Math.min(window.innerHeight - 64, e.clientY - offset.current.y));
    setPos({ x, y });
    e.preventDefault();
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const wasDrag = moved.current;
    dragging.current = false;
    moved.current = false;
    if (!wasDrag && customer) setOpen((o) => !o);
    e.preventDefault();
  }, [customer]);

  if (!settings.widgetEnabled || !customer) return null;

  const defaultX = window.innerWidth - 76;
  const defaultY = window.innerHeight - 96;
  const widgetX = pos.x >= 0 ? pos.x : defaultX;
  const widgetY = pos.y >= 0 ? pos.y : defaultY;

  return (
    <>
      {/* Floating Widget Button */}
      <div
        ref={btnRef}
        style={{ position: "fixed", left: widgetX, top: widgetY, zIndex: 9990, touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* Speech bubble — no close button, tapping it opens chat */}
        <AnimatePresence>
          {showBubble && !open && settings.floatingMessageEnabled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 4 }}
              className="absolute bottom-[72px] right-0 w-52 bg-white text-gray-900 text-xs rounded-2xl rounded-br-sm shadow-2xl px-3 py-2.5 leading-snug select-none cursor-pointer"
            >
              {settings.floatingMessage}
              {/* Arrow */}
              <span className="absolute -bottom-2 right-4 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Widget button — always shows chat icon */}
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-teal-500/40 cursor-pointer select-none"
        >
          <MessageCircle className="w-6 h-6 text-white fill-white/30" />
        </motion.div>
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <CustomerChatPanel
            customer={customer}
            settings={settings}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
