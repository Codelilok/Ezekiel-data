import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateOrder } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const BUNDLES = [
  { id: '1gb', size: '1GB', validity: '2 days', price: 'GHS 5', priceValue: 5, gbAmount: 1 },
  { id: '2gb', size: '2GB', validity: '7 days', price: 'GHS 10', priceValue: 10, gbAmount: 2 },
  { id: '5gb', size: '5GB', validity: '30 days', price: 'GHS 25', priceValue: 25, gbAmount: 5 },
  { id: '10gb', size: '10GB', validity: '30 days', price: 'GHS 45', priceValue: 45, gbAmount: 10 },
  { id: '20gb', size: '20GB', validity: '30 days', price: 'GHS 80', priceValue: 80, gbAmount: 20 },
];

export default function NetworkPage({ network, name, colorTheme }: { network: string, name: string, colorTheme: 'yellow' | 'red' | 'blue' }) {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1); // 1: phone, 2: bundle, 3: confirm, 4: success
  const [phone, setPhone] = useState("");
  const [bundle, setBundle] = useState("");
  const [orderId, setOrderId] = useState("");

  const createOrderMutation = useCreateOrder();

  const handleNext = () => {
    if (step === 1 && phone.length < 10) return toast.error("Please enter a valid phone number");
    if (step === 2 && !bundle) return toast.error("Please select a data bundle");
    setStep(s => s + 1);
  };

  const handlePayment = () => {
    const selectedBundle = BUNDLES.find(b => b.id === bundle);
    if (!selectedBundle) return;

    createOrderMutation.mutate({
      data: {
        network: name,
        bundleSize: selectedBundle.size,
        bundleValidity: selectedBundle.validity,
        phone,
        gbAmount: selectedBundle.gbAmount,
        price: selectedBundle.priceValue
      }
    }, {
      onSuccess: (data) => {
        setOrderId(data.orderId);
        setStep(4);
      },
      onError: () => {
        toast.error("Failed to process order. Please try again.");
      }
    });
  };

  const colorClasses = {
    yellow: "bg-yellow-500 text-yellow-500 border-yellow-500 from-yellow-500 to-yellow-600",
    red: "bg-red-500 text-red-500 border-red-500 from-red-500 to-red-600",
    blue: "bg-blue-500 text-blue-500 border-blue-500 from-blue-500 to-blue-600"
  };

  const selectedBundleData = BUNDLES.find(b => b.id === bundle);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation('/dashboard')} className="hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-${colorTheme}-500 shadow-lg`}>
            {name[0]}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Buy {name} Data</h1>
        </div>

        <Card className="border-white/10 bg-background/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 h-1 bg-white/5 w-full">
            <motion.div 
              className={`h-full bg-gradient-to-r ${colorClasses[colorTheme].split(' ').filter(c => c.startsWith('from-') || c.startsWith('to-')).join(' ')}`}
              initial={{ width: "25%" }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <CardContent className="p-8 lg:p-12 min-h-[400px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6 max-w-md mx-auto w-full">
                  <h3 className="text-xl font-semibold text-center mb-8">Enter Phone Number</h3>
                  <Input 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    placeholder="e.g. 024XXXXXXX" 
                    className={`h-16 text-2xl tracking-widest text-center bg-black/20 border-white/10 focus-visible:ring-${colorTheme}-500`}
                    autoFocus
                  />
                  <div className="pt-4">
                    <Button onClick={handleNext} className="w-full h-12 bg-white text-black hover:bg-gray-200">Next</Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                  <h3 className="text-xl font-semibold text-center mb-8">Select Bundle</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {BUNDLES.map(b => (
                      <button
                        key={b.id}
                        onClick={() => { setBundle(b.id); setTimeout(() => setStep(3), 300); }}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${bundle === b.id ? `border-${colorTheme}-500/50 bg-${colorTheme}-500/10` : 'border-white/5 bg-black/20 hover:border-white/20'}`}
                      >
                        <div className="text-2xl font-bold text-white mb-1">{b.size}</div>
                        <div className="text-sm text-muted-foreground mb-4">{b.validity}</div>
                        <div className={`text-lg font-semibold text-${colorTheme}-400`}>{b.price}</div>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-start pt-4">
                    <Button variant="ghost" onClick={() => setStep(1)} className="h-12 text-muted-foreground hover:text-white">Back</Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && selectedBundleData && (
                <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 max-w-md mx-auto w-full">
                  <h3 className="text-xl font-semibold text-center">Confirm Details</h3>
                  <div className="bg-black/20 rounded-2xl p-6 border border-white/5 space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-muted-foreground">Network</span>
                      <span className="font-medium text-white flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full bg-${colorTheme}-500`}></span>
                        {name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-muted-foreground">Phone Number</span>
                      <span className="font-mono text-white tracking-wider">{phone}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-muted-foreground">Bundle</span>
                      <span className="font-medium text-white">{selectedBundleData.size} ({selectedBundleData.validity})</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-muted-foreground">Total</span>
                      <span className={`text-2xl font-bold text-${colorTheme}-400`}>{selectedBundleData.price}</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 h-14" disabled={createOrderMutation.isPending}>Back</Button>
                    <Button 
                      onClick={handlePayment} 
                      className={`flex-[2] h-14 bg-gradient-to-r ${colorClasses[colorTheme].split(' ').filter(c => c.startsWith('from-') || c.startsWith('to-')).join(' ')} text-white font-bold border-none`}
                      disabled={createOrderMutation.isPending}
                    >
                      {createOrderMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Pay & Order'}
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-6">
                  <div className={`w-24 h-24 bg-${colorTheme}-500/20 text-${colorTheme}-400 rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <Check className="w-12 h-12" />
                  </div>
                  <h3 className="text-3xl font-bold text-white">Order Successful</h3>
                  <p className="text-muted-foreground">Your data is on its way.</p>
                  
                  <div className="inline-block bg-black/20 rounded-xl p-4 border border-white/5 text-left min-w-[280px]">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order ID</div>
                    <div className="font-mono text-lg text-white mb-4">{orderId}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</div>
                    <div className={`text-${colorTheme}-400 font-medium flex items-center gap-2`}>
                      <span className={`w-2 h-2 rounded-full bg-${colorTheme}-400 animate-pulse`}></span> Processing
                    </div>
                  </div>

                  <div className="pt-8 flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => setLocation('/dashboard')} className="border-white/10 bg-white/5">
                      Back to Dashboard
                    </Button>
                    <Button onClick={() => { setStep(1); setPhone(''); setBundle(''); }} className="bg-white text-black hover:bg-gray-200">
                      Buy More Data
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}