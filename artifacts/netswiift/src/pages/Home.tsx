import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Check, AlertCircle, Loader2, ArrowRight, Eye, EyeOff, Mail, Send } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useTrackOrder, getTrackOrderQueryKey, useCreateOrder } from "@workspace/api-client-react";
import { format } from "date-fns";
import { useLocation } from "wouter";

// Smooth scrolling utility
const scrollTo = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 font-bold text-xl cursor-pointer" onClick={() => scrollTo('hero')}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-purple-600 text-white">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <span className="bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text text-transparent tracking-tight">
            NetSwift
          </span>
        </div>
      </div>
    </nav>
  );
}

function PasswordInput({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="h-12 bg-black/20 border-white/10 focus-visible:ring-teal-500 pr-12"
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-white/10" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

function HeroAuthSection() {
  const [, setLocation] = useLocation();

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  function saveUser(name: string, email: string) {
    localStorage.setItem("nsUser", JSON.stringify({ name, email }));
  }

  function handleGoogleAuth() {
    toast.info("Google sign-in coming soon — use email login for now.", { duration: 3000 });
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail) { toast.error("Please enter your email"); return; }
    if (!loginPassword) { toast.error("Please enter your password"); return; }
    setLoginLoading(true);
    setTimeout(() => {
      setLoginLoading(false);
      if (loginEmail === "codelilok@gmail.com" && loginPassword === "NetSwift@26") {
        localStorage.setItem("nsAdmin", JSON.stringify({ email: loginEmail, role: "admin" }));
        toast.success("Welcome back, Admin");
        setLocation("/admin");
        return;
      }
      const users: any[] = (() => { try { return JSON.parse(localStorage.getItem("nsUsers") ?? "[]"); } catch { return []; } })();
      const existing = users.find((u: any) => u.email === loginEmail);
      if (existing) {
        if (existing.status === "suspended") {
          setLocation("/blocked?reason=suspended&name=" + encodeURIComponent(existing.name ?? ""));
          return;
        }
        if (existing.status === "removed") {
          setLocation("/blocked?reason=removed&name=" + encodeURIComponent(existing.name ?? ""));
          return;
        }
        if (existing.role === "admin") {
          localStorage.setItem("nsAdmin", JSON.stringify({ email: existing.email, role: "admin" }));
          localStorage.setItem("nsUser", JSON.stringify({ name: existing.name, email: existing.email }));
          toast.success(`Welcome back, ${existing.name}`);
          setLocation("/admin");
          return;
        }
        if (existing.role === "agent") {
          localStorage.setItem("nsUser", JSON.stringify({ name: existing.name, email: existing.email, role: "agent" }));
          toast.success(`Welcome back, ${existing.name}`);
          setLocation("/agent");
          return;
        }
        localStorage.setItem("nsUser", JSON.stringify({ name: existing.name, email: existing.email, role: existing.role ?? "user" }));
      } else {
        const name = loginEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
        saveUser(name, loginEmail);
      }
      toast.success("Logged in successfully");
      setLocation("/dashboard");
    }, 1000);
  }

  function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!signupName) { toast.error("Please enter your name"); return; }
    if (!signupEmail) { toast.error("Please enter your email"); return; }
    if (signupPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setSignupLoading(true);
    setTimeout(() => {
      setSignupLoading(false);
      saveUser(signupName, signupEmail);
      const users: any[] = (() => { try { return JSON.parse(localStorage.getItem("nsUsers") ?? "[]"); } catch { return []; } })();
      const alreadyExists = users.some((u: any) => u.email === signupEmail);
      if (!alreadyExists) {
        const newUser = { id: `u_${Date.now()}`, name: signupName, email: signupEmail, role: "user", status: "active", joinedAt: new Date().toISOString() };
        localStorage.setItem("nsUsers", JSON.stringify([...users, newUser]));
      }
      toast.success("Account created! Welcome to NetSwift");
      setLocation("/dashboard");
    }, 1000);
  }

  function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail) { toast.error("Please enter your email"); return; }
    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setMagicSent(true);
    }, 1200);
  }

  return (
    <section id="hero" className="container mx-auto px-4 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-24 relative">
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />

      <div className="flex-1 space-y-8 z-10 text-center lg:text-left">
        <div className="inline-flex items-center rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-sm font-medium text-teal-400">
          <span className="flex h-2 w-2 rounded-full bg-teal-500 mr-2 animate-pulse"></span>
          Lightning fast delivery
        </div>
        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground">
          Buy Data Instantly<br />
          <span className="text-muted-foreground font-light">No Signup Needed.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
          Fast, secure data purchase for all networks. Experience the future of mobile connectivity with premium fintech-grade reliability.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <Button size="lg" className="h-14 px-8 text-base bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-teal-950 font-bold border-none shadow-[0_0_40px_-10px_rgba(20,184,166,0.5)] transition-all hover:scale-105" onClick={() => scrollTo('buy')}>
            Buy Data Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-base border-white/10 bg-white/5 hover:bg-white/10" onClick={() => scrollTo('track')}>
            Track Order
          </Button>
        </div>
      </div>

      <div className="w-full max-w-md z-10">
        <Card className="border-white/10 bg-card/60 backdrop-blur-2xl shadow-2xl shadow-black/50">
          <CardHeader className="pb-2">
            <CardTitle>Welcome to NetSwift</CardTitle>
            <CardDescription>Log in or sign up to save your payment methods.</CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {showForgot ? (
                <motion.div key="forgot" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
                  {magicSent ? (
                    <div className="py-6 text-center space-y-3">
                      <div className="w-14 h-14 rounded-full bg-teal-500/20 flex items-center justify-center mx-auto">
                        <Mail className="w-7 h-7 text-teal-400" />
                      </div>
                      <p className="font-semibold text-white">Check your inbox</p>
                      <p className="text-sm text-muted-foreground">A magic login link was sent to <span className="text-teal-400">{forgotEmail}</span>. Click it to sign in instantly.</p>
                      <Button variant="ghost" className="text-muted-foreground text-sm" onClick={() => { setShowForgot(false); setMagicSent(false); setForgotEmail(""); }}>
                        Back to login
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleMagicLink} className="space-y-4">
                      <div>
                        <p className="text-sm text-white font-medium mb-1">Forgot your password?</p>
                        <p className="text-xs text-muted-foreground mb-4">Enter your email and we'll send you a magic link to sign in instantly — no password needed.</p>
                      </div>
                      <Input
                        placeholder="Email address"
                        type="email"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        className="h-12 bg-black/20 border-white/10 focus-visible:ring-teal-500"
                      />
                      <Button type="submit" className="w-full h-12 bg-gradient-to-r from-teal-500 to-purple-600 text-white font-semibold border-none" disabled={forgotLoading}>
                        {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                        {forgotLoading ? "Sending..." : "Send Magic Link"}
                      </Button>
                      <Button type="button" variant="ghost" className="w-full text-muted-foreground text-sm" onClick={() => setShowForgot(false)}>
                        Back to login
                      </Button>
                    </form>
                  )}
                </motion.div>
              ) : (
                <motion.div key="auth" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-5 bg-white/5 border border-white/10">
                      <TabsTrigger value="login" className="data-[state=active]:bg-white/10">Login</TabsTrigger>
                      <TabsTrigger value="signup" className="data-[state=active]:bg-white/10">Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" className="space-y-4 mt-0">
                      <Button type="button" variant="outline" onClick={handleGoogleAuth} className="w-full border-white/10 bg-white/5 hover:bg-white/10 h-12">
                        <SiGoogle className="mr-2 h-4 w-4 text-red-400" />
                        Continue with Google
                      </Button>
                      <Divider label="Or continue with" />
                      <form onSubmit={handleLogin} className="space-y-3">
                        <Input
                          placeholder="Email address"
                          type="email"
                          value={loginEmail}
                          onChange={e => setLoginEmail(e.target.value)}
                          className="h-12 bg-black/20 border-white/10 focus-visible:ring-teal-500"
                        />
                        <PasswordInput placeholder="Password" value={loginPassword} onChange={setLoginPassword} />
                        <div className="flex justify-between items-center pt-0.5">
                          <button
                            type="button"
                            onClick={() => setShowForgot(true)}
                            className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                          >
                            Forgot password?
                          </button>
                          <button
                            type="button"
                            onClick={() => { setForgotEmail(loginEmail); setShowForgot(true); }}
                            className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" /> Magic link
                          </button>
                        </div>
                        <Button type="submit" className="w-full h-12 bg-gradient-to-r from-teal-500 to-purple-600 text-white font-semibold border-none" disabled={loginLoading}>
                          {loginLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          {loginLoading ? "Logging in..." : "Login"}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="signup" className="space-y-4 mt-0">
                      <Button type="button" variant="outline" onClick={handleGoogleAuth} className="w-full border-white/10 bg-white/5 hover:bg-white/10 h-12">
                        <SiGoogle className="mr-2 h-4 w-4 text-red-400" />
                        Continue with Google
                      </Button>
                      <Divider label="Or sign up with email" />
                      <form onSubmit={handleSignup} className="space-y-3">
                        <Input
                          placeholder="Full Name"
                          value={signupName}
                          onChange={e => setSignupName(e.target.value)}
                          className="h-12 bg-black/20 border-white/10 focus-visible:ring-teal-500"
                        />
                        <Input
                          placeholder="Email address"
                          type="email"
                          value={signupEmail}
                          onChange={e => setSignupEmail(e.target.value)}
                          className="h-12 bg-black/20 border-white/10 focus-visible:ring-teal-500"
                        />
                        <PasswordInput placeholder="Create Password (min. 6 chars)" value={signupPassword} onChange={setSignupPassword} />
                        <Button type="submit" className="w-full h-12 bg-gradient-to-r from-teal-500 to-purple-600 text-white font-semibold border-none mt-1" disabled={signupLoading}>
                          {signupLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          {signupLoading ? "Creating account..." : "Create Account"}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              )}
            </AnimatePresence>
            <p className="text-xs text-center text-muted-foreground mt-5 border-t border-white/5 pt-4">
              Auth is optional — you can buy data without an account
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

const NETWORKS = [
  { id: 'mtn', name: 'MTN', color: 'bg-yellow-500', border: 'border-yellow-500/50', text: 'text-yellow-500' },
  { id: 'telecel', name: 'Telecel', color: 'bg-red-500', border: 'border-red-500/50', text: 'text-red-500' },
  { id: 'airteltigo', name: 'AirtelTigo', color: 'bg-blue-500', border: 'border-blue-500/50', text: 'text-blue-500' },
];

const BUNDLES = [
  { id: '1gb', size: '1GB', validity: '2 days', price: 'GHS 5', priceValue: 5, gbAmount: 1 },
  { id: '2gb', size: '2GB', validity: '7 days', price: 'GHS 10', priceValue: 10, gbAmount: 2 },
  { id: '5gb', size: '5GB', validity: '30 days', price: 'GHS 25', priceValue: 25, gbAmount: 5 },
  { id: '10gb', size: '10GB', validity: '30 days', price: 'GHS 45', priceValue: 45, gbAmount: 10 },
  { id: '20gb', size: '20GB', validity: '30 days', price: 'GHS 80', priceValue: 80, gbAmount: 20 },
];

function BuyDataSection() {
  const [step, setStep] = useState(1);
  const [network, setNetwork] = useState("");
  const [phone, setPhone] = useState("");
  const [bundle, setBundle] = useState("");
  const [orderId, setOrderId] = useState("");
  
  const createOrderMutation = useCreateOrder();

  const handleNext = () => {
    if (step === 1 && !network) return toast.error("Please select a network");
    if (step === 2 && phone.length < 10) return toast.error("Please enter a valid phone number");
    if (step === 3 && !bundle) return toast.error("Please select a data bundle");
    setStep(s => s + 1);
  };

  const handlePayment = () => {
    const selectedNetwork = NETWORKS.find(n => n.id === network);
    const selectedBundle = BUNDLES.find(b => b.id === bundle);
    
    if (!selectedNetwork || !selectedBundle) return;
    
    createOrderMutation.mutate({
      data: {
        network: selectedNetwork.name,
        bundleSize: selectedBundle.size,
        bundleValidity: selectedBundle.validity,
        phone,
        gbAmount: selectedBundle.gbAmount,
        price: selectedBundle.priceValue
      }
    }, {
      onSuccess: (data) => {
        setOrderId(data.orderId);
        setStep(5);
      },
      onError: () => {
        toast.error("Failed to process order");
      }
    });
  };

  const resetFlow = () => {
    setStep(1);
    setNetwork("");
    setPhone("");
    setBundle("");
    setOrderId("");
  };

  return (
    <section id="buy" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Instant Data Purchase</h2>
          <p className="text-muted-foreground">Get connected in seconds with our streamlined flow.</p>
        </div>

        <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 bg-white/5 w-full">
            <motion.div 
              className="h-full bg-gradient-to-r from-teal-500 to-purple-500"
              initial={{ width: "20%" }}
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <CardContent className="p-4 sm:p-8 lg:p-12 min-h-[400px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                  <h3 className="text-xl font-semibold text-center mb-8">Select Network</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {NETWORKS.map(net => (
                      <button
                        key={net.id}
                        onClick={() => { setNetwork(net.id); setTimeout(() => setStep(2), 300); }}
                        className={`relative aspect-square flex flex-col items-center justify-center gap-3 rounded-2xl border-2 transition-all ${network === net.id ? `${net.border} bg-white/5 scale-105` : 'border-white/5 bg-black/20 hover:border-white/20 hover:bg-white/5'}`}
                      >
                        <div className={`w-12 h-12 rounded-full ${net.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                          {net.name[0]}
                        </div>
                        <span className="font-medium">{net.name}</span>
                        {network === net.id && (
                          <motion.div layoutId="check" className="absolute top-2 right-2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center text-teal-950">
                            <Check className="w-4 h-4" />
                          </motion.div>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6 max-w-md mx-auto w-full">
                  <h3 className="text-xl font-semibold text-center mb-8">Enter Phone Number</h3>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 shrink-0 rounded-full ${NETWORKS.find(n => n.id === network)?.color} flex items-center justify-center text-white font-bold`}>
                      {NETWORKS.find(n => n.id === network)?.name[0]}
                    </div>
                    <Input 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)} 
                      placeholder="e.g. 024XXXXXXX" 
                      className="h-16 text-2xl tracking-widest text-center bg-black/20 border-white/10 focus-visible:ring-teal-500"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-4 pt-8">
                    <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 h-12 text-muted-foreground hover:text-white">Back</Button>
                    <Button onClick={handleNext} className="flex-1 h-12 bg-white text-black hover:bg-gray-200">Next</Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                  <h3 className="text-xl font-semibold text-center mb-8">Select Bundle</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {BUNDLES.map(b => (
                      <button
                        key={b.id}
                        onClick={() => { setBundle(b.id); setTimeout(() => setStep(4), 300); }}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${bundle === b.id ? 'border-teal-500/50 bg-teal-500/10' : 'border-white/5 bg-black/20 hover:border-white/20'}`}
                      >
                        <div className="text-2xl font-bold text-white mb-3">{b.size}</div>
                        <div className="text-lg font-semibold text-teal-400">{b.price}</div>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-start pt-4">
                    <Button variant="ghost" onClick={() => setStep(2)} className="h-12 text-muted-foreground hover:text-white">Back</Button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 max-w-md mx-auto w-full">
                  <h3 className="text-xl font-semibold text-center">Confirm Details</h3>
                  <div className="bg-black/20 rounded-2xl p-6 border border-white/5 space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-muted-foreground">Network</span>
                      <span className="font-medium text-white flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${NETWORKS.find(n => n.id === network)?.color}`}></span>
                        {NETWORKS.find(n => n.id === network)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-muted-foreground">Phone Number</span>
                      <span className="font-mono text-white tracking-wider">{phone}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-muted-foreground">Bundle</span>
                      <span className="font-medium text-white">{BUNDLES.find(b => b.id === bundle)?.size}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-muted-foreground">Total</span>
                      <span className="text-2xl font-bold text-teal-400">{BUNDLES.find(b => b.id === bundle)?.price}</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => setStep(3)} className="flex-1 h-14" disabled={createOrderMutation.isPending}>Back</Button>
                    <Button 
                      onClick={handlePayment} 
                      className="flex-[2] h-14 bg-gradient-to-r from-teal-500 to-purple-600 text-white font-bold border-none"
                      disabled={createOrderMutation.isPending}
                    >
                      {createOrderMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Proceed to Payment'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div key="step5" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-6">
                  <div className="w-24 h-24 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-bold text-white">Order Received</h3>
                  <p className="text-muted-foreground">Your transaction is being processed.</p>
                  
                  <div className="w-full max-w-xs mx-auto bg-black/20 rounded-xl p-4 border border-white/5 text-left">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order ID</div>
                    <div className="font-mono text-lg text-white mb-4">{orderId}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</div>
                    <div className="text-teal-400 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span> Processing
                    </div>
                  </div>

                  <div className="pt-8">
                    <Button variant="outline" onClick={resetFlow} className="border-white/10 bg-white/5">
                      Buy More Data
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function TrackOrderSection() {
  const [queryInput, setQueryInput] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const { data: result, isLoading: isSearching, error } = useTrackOrder(
    { q: submittedQuery },
    { 
      query: { 
        enabled: !!submittedQuery, 
        queryKey: getTrackOrderQueryKey({ q: submittedQuery }),
        retry: false
      } 
    }
  );

  const handleTrack = () => {
    if (!queryInput) return;
    setSubmittedQuery(queryInput);
  };

  return (
    <section id="track" className="py-24 bg-black/20">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Track Your Order</h2>
          <p className="text-muted-foreground">Enter your Order ID or phone number to check status.</p>
        </div>

        <div className="flex gap-2 mb-8">
          <Input 
            value={queryInput} 
            onChange={e => setQueryInput(e.target.value)} 
            placeholder="Order ID or Phone Number" 
            className="h-14 text-lg bg-background border-white/10 focus-visible:ring-teal-500"
          />
          <Button onClick={handleTrack} className="h-14 px-8 bg-white text-black hover:bg-gray-200">
            Track
          </Button>
        </div>

        {isSearching && (
          <Card className="border-white/5 bg-background/50">
            <CardContent className="p-8 flex flex-col items-center justify-center text-muted-foreground space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
              <p>Searching records...</p>
            </CardContent>
          </Card>
        )}

        {error && !isSearching && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-red-500/30 bg-red-500/5 relative overflow-hidden">
              <CardContent className="p-8 flex items-center gap-4 text-red-400">
                <AlertCircle className="h-8 w-8 shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Order Not Found</h4>
                  <p className="text-sm opacity-90">No order found matching this ID or phone number. Please check and try again.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {result && !isSearching && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-teal-500/30 bg-teal-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="inline-flex items-center rounded-full bg-teal-500/20 px-2.5 py-0.5 text-xs font-medium text-teal-400 border border-teal-500/30">
                  {result.status}
                </span>
              </div>
              <CardContent className="p-8 space-y-4">
                <div className="grid grid-cols-2 gap-y-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Order ID</div>
                    <div className="font-mono text-white">{result.orderId}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Network</div>
                    <div className="font-medium text-white">{result.network}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Bundle</div>
                    <div className="font-medium text-white">{result.bundleSize}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Time</div>
                    <div className="font-medium text-white">{format(new Date(result.createdAt), 'MMM d, yyyy HH:mm')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <ComplaintButton prefillRef={submittedQuery} />
      </div>
    </section>
  );
}

function ComplaintButton({ prefillRef }: { prefillRef?: string }) {
  const [open, setOpen] = useState(false);
  const [ref, setRef] = useState(prefillRef || "");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  React.useEffect(() => {
    if (prefillRef) setRef(prefillRef);
  }, [prefillRef]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ref) { toast.error("Please enter your order ID or phone number"); return; }
    if (!message) { toast.error("Please describe your issue"); return; }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
      toast.success("Complaint submitted — we'll get back to you shortly");
    }, 1400);
  }

  return (
    <div className="mt-8">
      <AnimatePresence mode="wait">
        {!open && !done && (
          <motion.div key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button
              onClick={() => setOpen(true)}
              className="group w-full flex items-center justify-between gap-4 p-4 rounded-2xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/40 transition-all cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0 group-hover:bg-red-500/25 transition-colors">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">Having an issue with your order?</p>
                  <p className="text-xs text-muted-foreground">Tap here to make a complaint</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-red-400 shrink-0 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}
        {open && !done && (
          <motion.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <Card className="border-red-500/20 bg-red-500/5 backdrop-blur-md">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">Make a Complaint</p>
                    <p className="text-xs text-muted-foreground">We'll look into it and respond promptly</p>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <Input
                    value={ref}
                    onChange={e => setRef(e.target.value)}
                    placeholder="Order ID or Phone Number (e.g. NS-XXXXXX or 024XXXXXXX)"
                    className="h-12 bg-black/20 border-white/10 focus-visible:ring-red-400 font-mono"
                  />
                  <Textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Describe your issue in detail..."
                    className="min-h-[100px] bg-black/20 border-white/10 focus-visible:ring-red-400 resize-none"
                  />
                  <div className="flex gap-3">
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="flex-1 text-muted-foreground">Cancel</Button>
                    <Button type="submit" className="flex-[2] h-11 bg-red-500/80 hover:bg-red-500 text-white border-none" disabled={submitting}>
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {submitting ? "Submitting..." : "Submit Complaint"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {done && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-3">
            <div className="w-12 h-12 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 text-teal-400" />
            </div>
            <p className="font-semibold text-white">Complaint Received</p>
            <p className="text-sm text-muted-foreground">We'll review your complaint and respond shortly.</p>
            <button onClick={() => { setDone(false); setOpen(false); setRef(""); setMessage(""); }} className="text-xs text-teal-400 hover:text-teal-300">Submit another</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SupportSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderRef, setOrderRef] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderRef && !phone) { toast.error("Please enter your order ID or phone number"); return; }
    if (!message) { toast.error("Please describe your issue"); return; }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      toast.success("Complaint submitted successfully");
    }, 1500);
  };

  return (
    <section id="support" className="py-24">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Make a Complaint</h2>
          <p className="text-muted-foreground">Having an issue with your order? Let us know and we'll resolve it.</p>
        </div>

        <Card className="border-white/10 bg-background/40 backdrop-blur-md">
          <CardContent className="p-8">
            {success ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Complaint Received</h3>
                <p className="text-muted-foreground">We've received your complaint and will reach out to you shortly.</p>
                <Button variant="outline" onClick={() => { setSuccess(false); setOrderRef(""); setPhone(""); setMessage(""); }} className="mt-8 border-white/10 bg-white/5">
                  Submit Another
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Order ID</label>
                  <Input
                    value={orderRef}
                    onChange={e => setOrderRef(e.target.value)}
                    placeholder="e.g. NS-XXXXXXXX"
                    className="h-12 bg-black/20 border-white/10 focus-visible:ring-teal-500 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                  <Input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. 024XXXXXXX"
                    className="h-12 bg-black/20 border-white/10 focus-visible:ring-teal-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Describe your issue</label>
                  <Textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Tell us what happened with your order..."
                    className="min-h-[130px] bg-black/20 border-white/10 focus-visible:ring-teal-500 resize-none"
                  />
                </div>
                <Button type="submit" className="w-full h-12 bg-gradient-to-r from-teal-500 to-purple-600 text-white font-semibold border-none" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  {isSubmitting ? "Submitting..." : "Submit Complaint"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background py-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-purple-600 text-white">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <span className="bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text text-transparent">
            NetSwift
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} NetSwift. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background selection:bg-teal-500/30">
      <Navbar />
      <HeroAuthSection />
      <BuyDataSection />
      <TrackOrderSection />
      <Footer />
    </div>
  );
}