import React from "react";
import { Link } from "wouter";
import { ArrowLeft, CreditCard, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format } from "date-fns";
import { useListTransactions } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionsPage() {
  const { data: transactions, isLoading } = useListTransactions();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-semibold text-lg text-white">Transactions</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        
        <div className="bg-white/5 border border-white/5 rounded-xl overflow-hidden backdrop-blur-md">
          <div className="p-4 border-b border-white/5 bg-black/20">
            <h2 className="font-medium text-muted-foreground uppercase text-xs tracking-wider">Transaction History</h2>
          </div>
          <div className="divide-y divide-white/5">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32 bg-white/10" />
                      <Skeleton className="h-3 w-20 bg-white/10" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-16 bg-white/10" />
                </div>
              ))
            ) : transactions?.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No transactions found</p>
              </div>
            ) : (
              transactions?.map(tx => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center
                      ${tx.type.toLowerCase() === 'credit' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}
                    >
                      {tx.type.toLowerCase() === 'credit' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-white">{tx.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{format(new Date(tx.createdAt), 'MMM d, yyyy • h:mm a')}</span>
                        {tx.reference && (
                          <>
                            <span>•</span>
                            <span className="font-mono">{tx.reference}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`font-bold ${tx.type.toLowerCase() === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.type.toLowerCase() === 'credit' ? '+' : '-'} GHS {tx.amount.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}