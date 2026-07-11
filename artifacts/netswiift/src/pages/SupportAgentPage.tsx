import React, { useMemo } from "react";
import { useLocation } from "wouter";
import { Zap, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import SupportAdminPanel from "./SupportAdminPanel";

export default function SupportAgentPage() {
  const [, setLocation] = useLocation();

  const viewer = useMemo(() => {
    try {
      const raw = localStorage.getItem("nsUser");
      if (!raw) return null;
      const u = JSON.parse(raw) as { name: string; email: string };
      // Verify this user is actually an agent or admin in nsUsers
      const users: any[] = JSON.parse(localStorage.getItem("nsUsers") ?? "[]");
      const found = users.find((x: any) => x.email?.toLowerCase() === u.email?.toLowerCase());
      const role: "admin" | "agent" = found?.role === "admin" ? "admin" : "agent";
      return { email: u.email, name: u.name, role };
    } catch {
      return null;
    }
  }, []);

  // Also allow admin to view this page
  const adminSession = useMemo(() => {
    try {
      const s = localStorage.getItem("nsAdmin");
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  }, []);

  const effectiveViewer = viewer ?? (adminSession
    ? { email: adminSession.email ?? "admin@netswift.app", name: "Admin", role: "admin" as const }
    : null);

  if (!effectiveViewer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <p className="text-white font-semibold">Access Denied</p>
          <p className="text-sm text-muted-foreground">You must be logged in as an agent or admin.</p>
          <Button onClick={() => setLocation("/")} variant="outline" size="sm" className="border-white/10 text-white">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center h-14 px-4 gap-3 max-w-6xl mx-auto w-full">
          <Link href="/agent">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-white -ml-1">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white fill-current" />
            </div>
            <span className="font-bold text-white">Support Inbox</span>
          </div>
          <span className="ml-2 text-xs text-muted-foreground capitalize">{effectiveViewer.role}</span>
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <SupportAdminPanel viewer={effectiveViewer} />
      </div>
    </div>
  );
}
