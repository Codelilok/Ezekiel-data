import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Check, AlertCircle, ChevronRight, Loader2, ArrowRight } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

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
            NetSwiift
          </span>
        </div>
        <div className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
          <button onClick={() => scrollTo('hero')} className="hover:text-foreground transition-colors">Home</button>
          <button onClick={() => scrollTo('buy')} className="hover:text-foreground transition-colors">Buy Data</button>
          <button onClick={() => scrollTo('track')} className="hover:text-foreground transition-colors">Track Order</button>
          <button onClick={() => scrollTo('support')} className="hover:text-foreground transition-colors">Support</button>
        </div>
        <Button variant="outline" className="md:hidden border-white/10 bg-white/5">
          Menu
        </Button>
      </div>
    </nav>
  );
}

function HeroAuthSection() {
  return (
    <section id="hero" className="container mx-auto px-4 py-20 lg:py-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-24 relative">
      {/* Background ambient glow */}
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
        <Card className="border-white/10 bg-background/40 backdrop-blur-2xl shadow-2xl shadow-black/50">
          <CardHeader>
            <CardTitle>Welcome to NetSwiift</CardTitle>
            <CardDescription>Log in or sign up to save your payment methods.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5 border border-white/10">
                <TabsTrigger value="login" className="data-[state=active]:bg-white/10">Login</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-white/10">Sign Up</TabsTrigger>
              </TabsList>
              <TabsContent value="login" className="space-y-4">
                <Button variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10 h-12">
                  <SiGoogle className="mr-2 h-5 w-5 text-red-400" />
                  Continue with Google
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <Input placeholder="Email address" type="email" className="h-12 bg-black/20 border-white/10 focus-visible:ring-teal-500" />
                  <Input placeholder="Password" type="password" className="h-12 bg-black/20 border-white/10 focus-visible:ring-teal-500" />
                  <Button className="w-full h-12 bg-white text-black hover:bg-gray-200">
                    Login
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="signup" className="space-y-4">
                <Button variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10 h-12">
                  <SiGoogle className="mr-2 h-5 w-5 text-red-400" />
                  Continue with Google
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or sign up with email</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <Input placeholder="Full Name" className="h-12 bg-black/20 border-white/10 focus-visible:ring-teal-500" />
                  <Input placeholder="Email address" type="email" className="h-12 bg-black/20 border-white/10 focus-visible:ring-teal-500" />
                  <Input placeholder="Create Password" type="password" className="h-12 bg-black/20 border-white/10 focus-visible:ring-teal-500" />
                  <Button className="w-full h-12 bg-white text-black hover:bg-gray-200">
                    Create Account
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            <p className="text-xs text-center text-muted-foreground mt-6">
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
  { id: '1gb', size: '1GB', validity: '2 days', price: 'GHS 5' },
  { id: '2gb', size: '2GB', validity: '7 days', price: 'GHS 10' },
  { id: '5gb', size: '5GB', validity: '30 days', price: 'GHS 25' },
  { id: '10gb', size: '10GB', validity: '30 days', price: 'GHS 45' },
  { id: '20gb', size: '20GB', validity: '30 days', price: 'GHS 80' },
];

function BuyDataSection() {
  const [step, setStep] = useState(1);
  const [network, setNetwork] = useState("");
  const [phone, setPhone] = useState("");
  const [bundle, setBundle] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState("");

  const handleNext = () => {
    if (step === 1 && !network) return toast.error("Please select a network");
    if (step === 2 && phone.length < 10) return toast.error("Please enter a valid phone number");
    if (step === 3 && !bundle) return toast.error("Please select a data bundle");
    setStep(s => s + 1);
  };

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setOrderId("NST-" + Math.random().toString(36).substring(2, 10).toUpperCase());
      setStep(5);
    }, 2000);
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
          {/* Progress bar */}
          <div className="absolute top-0 left-0 h-1 bg-white/5 w-full">
            <motion.div 
              className="h-full bg-gradient-to-r from-teal-500 to-purple-500"
              initial={{ width: "20%" }}
              animate={{ width: `${(step / 5) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <CardContent className="p-8 lg:p-12 min-h-[400px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                  <h3 className="text-xl font-semibold text-center mb-8">Select Network</h3>
                  <div className="grid grid-cols-3 gap-4">
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
                        <div className="text-2xl font-bold text-white mb-1">{b.size}</div>
                        <div className="text-sm text-muted-foreground mb-4">{b.validity}</div>
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
                    <Button variant="ghost" onClick={() => setStep(3)} className="flex-1 h-14" disabled={isProcessing}>Back</Button>
                    <Button 
                      onClick={handlePayment} 
                      className="flex-[2] h-14 bg-gradient-to-r from-teal-500 to-purple-600 text-white font-bold border-none"
                      disabled={isProcessing}
                    >
                      {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Proceed to Payment'}
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
                  
                  <div className="inline-block bg-black/20 rounded-xl p-4 border border-white/5 text-left min-w-[280px]">
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
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTrack = () => {
    if (!query) return;
    setIsSearching(true);
    setResult(null);
    
    setTimeout(() => {
      setIsSearching(false);
      setResult({
        id: query,
        status: "Completed",
        network: "MTN",
        bundle: "5GB",
        time: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString()
      });
    }, 1500);
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
            value={query} 
            onChange={e => setQuery(e.target.value)} 
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
                    <div className="font-mono text-white">{result.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Network</div>
                    <div className="font-medium text-white">{result.network}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Bundle</div>
                    <div className="font-medium text-white">{result.bundle}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Time</div>
                    <div className="font-medium text-white">{result.time} - {result.date}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function SupportSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
          <h2 className="text-3xl font-bold mb-4">Get Support</h2>
          <p className="text-muted-foreground">Having issues? We're here to help.</p>
        </div>

        <Card className="border-white/10 bg-background/40 backdrop-blur-md">
          <CardContent className="p-8">
            {success ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Message Received</h3>
                <p className="text-muted-foreground">Your complaint has been received. We'll reach out shortly.</p>
                <Button variant="outline" onClick={() => setSuccess(false)} className="mt-8">
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Phone Number or Order ID</label>
                  <Input required placeholder="Enter reference..." className="bg-black/20 border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Message</label>
                  <Textarea required placeholder="Describe your issue in detail..." className="min-h-[120px] bg-black/20 border-white/10" />
                </div>
                <Button type="submit" className="w-full h-12 bg-white text-black hover:bg-gray-200" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
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
    <footer className="border-t border-white/10 bg-black/40 py-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 font-bold text-lg opacity-50">
          <Zap className="h-4 w-4" />
          <span>NetSwiift</span>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} NetSwiift. Premium data delivery.
        </p>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground font-sans overflow-x-hidden selection:bg-teal-500/30 selection:text-teal-200">
      <Navbar />
      <main>
        <HeroAuthSection />
        <BuyDataSection />
        <TrackOrderSection />
        <SupportSection />
      </main>
      <Footer />
    </div>
  );
}
