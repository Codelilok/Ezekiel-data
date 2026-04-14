import React, { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Search, Package, Activity } from "lucide-react";
import { format } from "date-fns";
import { useListOrders } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OrdersPage() {
  const [filter, setFilter] = useState<string>("all");
  const { data: orders, isLoading } = useListOrders({ 
    status: filter !== 'all' ? filter.charAt(0).toUpperCase() + filter.slice(1) : undefined 
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-semibold text-lg text-white">Orders History</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <Tabs defaultValue="all" onValueChange={setFilter} className="w-full sm:w-auto">
            <TabsList className="bg-white/5 border border-white/10 h-10 w-full sm:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search orders..." 
              className="pl-9 bg-white/5 border-white/10 focus-visible:ring-teal-500"
            />
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-black/20">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Network</th>
                  <th className="px-6 py-4 font-medium">Bundle</th>
                  <th className="px-6 py-4 font-medium">Phone</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24 bg-white/10" /></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-6 w-6 rounded-full bg-white/10" />
                          <Skeleton className="h-4 w-16 bg-white/10" />
                        </div>
                      </td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-12 bg-white/10" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24 bg-white/10" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full bg-white/10" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-24 bg-white/10 ml-auto" /></td>
                    </tr>
                  ))
                ) : orders?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No orders found</p>
                    </td>
                  </tr>
                ) : (
                  orders?.map(order => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono font-medium text-white">{order.orderId}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[10px]
                            ${order.network.toLowerCase() === 'mtn' ? 'bg-yellow-500' : 
                              order.network.toLowerCase() === 'telecel' ? 'bg-red-500' : 'bg-blue-500'}`}
                          >
                            {order.network.substring(0, 1)}
                          </div>
                          <span>{order.network}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-300">{order.bundleSize}</td>
                      <td className="px-6 py-4 tracking-wider">{order.phone.substring(0, 3)}***{order.phone.substring(order.phone.length - 3)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                          ${order.status.toLowerCase() === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                            order.status.toLowerCase() === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground">
                        {format(new Date(order.createdAt), 'MMM d, yyyy HH:mm')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}