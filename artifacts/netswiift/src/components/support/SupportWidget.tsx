import React, { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSupportSettings } from "@/lib/supportStore";
import CustomerChatPanel from "./CustomerChatPanel";

function getLoggedInCustomer(): { name: string; email: string; phone?: string } | null {
  try {
    // Not admin, not agent-only — a regular user
    const admin = localStorage.getItem("nsAdmin");
    if (admin) return null; // admin is viewing, don't show widget
    const raw = localStorage.getItem("nsUser");
    if (!raw) return null;
    const user = JSON.parse(raw) as { name: string; email: string; phone?: string; role?: string };
    // Agents also get the widget (they might be customers too), but only plain users
    // If the user has role agent/admin in nsUsers, skip the widget
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

  // Position state
  const [pos, setPos] = useState({ x: -1, y: -1 }); // -1 = unset (snap to default)
  const dragging = useRef(false);
  const moved = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const btnRef = useRef<HTMLDivElement>(null);

  // Reload settings and customer on focus (tab switch)
  useEffect(() => {
    const refresh = () => {
      setSettings(getSupportSettings());
      setCustomer(getLoggedInCustomer());
    };
    window.addEventListener("focus", refresh);
    const id = setInterval(refresh, 3000);
    return () => { window.removeEventListener("focus", refresh); clearInterval(id); };
  }, []);

  // Show floating bubble after delay (once)
  useEffect(() => {
    if (!settings.floatingMessageEnabled || !settings.widgetEnabled) return;
    const t = setTimeout(() => setShowBubble(true), 1800);
    const t2 = setTimeout(() => setShowBubble(false), 8000);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [settings.floatingMessageEnabled, settings.widgetEnabled]);

  // Pointer drag handlers
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    moved.current = false;
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
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
    dragging.current = false;
    if (!moved.current) {
      // It was a tap, open/close chat
      if (customer) setOpen((o) => !o);
    }
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
        {/* Speech bubble */}
        <AnimatePresence>
          {showBubble && !open && settings.floatingMessageEnabled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 4 }}
              className="absolute bottom-[72px] right-0 w-52 bg-white text-gray-900 text-xs rounded-2xl rounded-br-sm shadow-2xl px-3 py-2.5 leading-snug select-none"
            >
              {settings.floatingMessage}
              <button
                className="absolute top-1 right-1.5 text-gray-400 hover:text-gray-600 leading-none"
                onPointerUp={(e) => { e.stopPropagation(); setShowBubble(false); }}
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Widget button */}
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-teal-500/40 cursor-pointer select-none"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X className="w-6 h-6 text-white" />
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <MessageCircle className="w-6 h-6 text-white fill-white/30" />
              </motion.div>
            )}
          </AnimatePresence>
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
