import React, { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft, User, Mail, Phone, Save, Zap,
  CheckCircle, Loader2, LogOut, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export default function Profile() {
  const [, setLocation] = useLocation();

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("nsUser");
      if (raw) return JSON.parse(raw) as { name: string; email: string; phone?: string };
    } catch {}
    return { name: "Alex", email: "alex@netswift.app", phone: "" };
  }, []);

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error("Name cannot be empty"); return; }
    if (!email.trim()) { toast.error("Email cannot be empty"); return; }
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem("nsUser", JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() }));
      setSaving(false);
      setSaved(true);
      toast.success("Profile updated successfully");
      setTimeout(() => setSaved(false), 3000);
    }, 900);
  }

  function handleLogout() {
    localStorage.removeItem("nsUser");
    setLocation("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center h-14 px-4 gap-3 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-white -ml-1"
            onClick={() => setLocation("/dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white fill-current" />
            </div>
            <span className="font-bold text-sm bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text text-transparent">
              NetSwift
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="relative">
              <Avatar className="h-20 w-20 border-2 border-teal-500/40 shadow-xl shadow-teal-500/10">
                <AvatarFallback className="bg-gradient-to-br from-teal-500/30 to-purple-600/30 text-teal-300 text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">{user.name}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-white/10 bg-black/20 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-teal-400" />
                Edit Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="h-12 pl-10 bg-black/20 border-white/10 focus-visible:ring-teal-500 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="Your email address"
                      className="h-12 pl-10 bg-black/20 border-white/10 focus-visible:ring-teal-500 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Phone Number <span className="text-muted-foreground/50 normal-case">(optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 024XXXXXXX"
                      className="h-12 pl-10 bg-black/20 border-white/10 focus-visible:ring-teal-500 text-white"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-teal-500 to-purple-600 text-white font-semibold border-none mt-2 hover:opacity-90 transition-opacity"
                  disabled={saving}
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</>
                  ) : saved ? (
                    <><CheckCircle className="w-4 h-4 mr-2" />Saved</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" />Save Changes</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-red-500/10 bg-red-500/5 backdrop-blur-xl">
            <CardContent className="p-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
