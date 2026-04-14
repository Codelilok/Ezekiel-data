import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ShieldOff, UserX, Zap, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Blocked() {
  const [, setLocation] = useLocation();

  const params = new URLSearchParams(window.location.search);
  const reason = params.get("reason") ?? "suspended";
  const name = params.get("name") ?? "";

  const isSuspended = reason === "suspended";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center px-4">
          <div
            className="flex items-center gap-2 font-bold text-xl cursor-pointer"
            onClick={() => setLocation("/")}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-purple-600 text-white">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <span className="bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text text-transparent tracking-tight">
              NetSwift
            </span>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md text-center space-y-8"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mx-auto"
          >
            <div className={`w-24 h-24 rounded-3xl mx-auto flex items-center justify-center shadow-2xl ${isSuspended ? "bg-amber-500/15 border-2 border-amber-500/30 shadow-amber-500/10" : "bg-red-500/15 border-2 border-red-500/30 shadow-red-500/10"}`}>
              {isSuspended
                ? <ShieldOff className="w-12 h-12 text-amber-400" />
                : <UserX className="w-12 h-12 text-red-400" />}
            </div>
          </motion.div>

          <div className="space-y-3">
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-3xl font-extrabold tracking-tight ${isSuspended ? "text-amber-400" : "text-red-400"}`}
            >
              {isSuspended ? "Account Suspended" : "Account Removed"}
            </motion.h1>

            {name && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-muted-foreground text-sm"
              >
                Hi <span className="text-white font-medium">{name}</span>,
              </motion.p>
            )}

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground leading-relaxed"
            >
              {isSuspended
                ? "Your NetSwift account has been temporarily suspended. This may be due to a policy violation or suspicious activity. Please contact our support team to resolve this."
                : "Your NetSwift account has been permanently removed. If you believe this is a mistake, please reach out to our support team."}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`rounded-2xl border p-5 text-left space-y-3 ${isSuspended ? "bg-amber-500/5 border-amber-500/20" : "bg-red-500/5 border-red-500/20"}`}
          >
            <p className="text-sm font-semibold text-white">What you can do:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Mail className={`w-4 h-4 mt-0.5 shrink-0 ${isSuspended ? "text-amber-400" : "text-red-400"}`} />
                <span>Email us at <span className="text-white font-medium">support@netswift.app</span> with your account details</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className={`w-4 h-4 mt-0.5 shrink-0 ${isSuspended ? "text-amber-400" : "text-red-400"}`} />
                <span>Include your registered email address and a brief explanation</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col gap-3"
          >
            <Button
              onClick={() => setLocation("/")}
              variant="outline"
              className="w-full h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Homepage
            </Button>
          </motion.div>
        </motion.div>
      </div>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} NetSwift. All rights reserved.
      </footer>
    </div>
  );
}
