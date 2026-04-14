import React from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useGetDashboardStats, useListOrders } from "@workspace/api-client-react";
import { format } from "date-fns";
import { 
  Home, User, Globe, Package, CreditCard, Clock, 
  Menu, Bell, CheckCircle, Wifi, Zap, 
  ChevronRight, LogOut, Activity
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: recentOrders, isLoading: ordersLoading } = useListOrders({ limit: 5 });

  const NETWORKS = [
    { id: 'mtn', name: 'MTN', color: 'bg-yellow-500', gradient: 'from-yellow-400 to-yellow-600' },
    { id: 'telecel', name: 'Telecel', color: 'bg-red-500', gradient: 'from-red-400 to-red-600' },
    { id: 'airteltigo', name: 'AirtelTigo', color: 'bg-blue-500', gradient: 'from-blue-400 to-blue-600' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-4">
      <div className="flex items-center gap-2 px-6 mb-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-purple-600 text-white">
          <Zap className="h-5 w-5 fill-current" />
        </div>
        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text text-transparent">
          NetSwift
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-1">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-teal-500/20 to-purple-500/20 text-teal-400 font-medium">
          <Home className="w-5 h-5" />
          Dashboard
        </Link>
        <Link href="/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
          <Package className="w-5 h-5" />
          Orders
        </Link>
        <Link href="/transactions" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
          <CreditCard className="w-5 h-5" />
          Transactions
        </Link>
        <Link href="/history" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
          <Clock className="w-5 h-5" />
          History
        </Link>

        <div className="pt-6 pb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Networks
        </div>
        {NETWORKS.map(net => (
          <Link key={net.id} href={`/${net.id}`} className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
            <div className={`w-3 h-3 rounded-full ${net.color}`}></div>
            {net.name}
          </Link>
        ))}
      </div>

      <div className="px-4 mt-auto">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-red-400 hover:bg-red-400/10">
          <LogOut className="w-5 h-5 mr-3" />
          Log out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-background/40 backdrop-blur-xl fixed inset-y-0 left-0 z-10">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
          <div className="flex items-center justify-between h-16 px-4 md:px-8">
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0 border-r border-white/10 bg-background/95 backdrop-blur-xl">
                  <SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle></SheetHeader>
                  <SidebarContent />
                </SheetContent>
              </Sheet>
              
              <div>
                <h1 className="font-semibold text-lg text-foreground hidden sm:block">Dashboard</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                <Bell className="w-5 h-5" />
              </Button>
              <Avatar className="h-9 w-9 border border-white/10">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>AL</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 space-y-8 overflow-y-auto pb-24">
          
          {/* Welcome */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Welcome back, Alex</h2>
            <p className="text-muted-foreground">Here's your activity overview</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statsLoading ? (
              Array(4).fill(0).map((_, i) => (
                <Card key={i} className="border-white/5 bg-white/5 backdrop-blur-lg">
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-24 mb-4 bg-white/10" />
                    <Skeleton className="h-8 w-32 bg-white/10" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <>
                <Card className="border-teal-500/20 bg-teal-500/5 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-sm font-medium text-muted-foreground">Wallet Balance</p>
                      <CreditCard className="w-5 h-5 text-teal-400" />
                    </div>
                    <p className="text-2xl font-bold text-white mb-4">GHS {stats?.walletBalance?.toFixed(2) || '0.00'}</p>
                    <Button size="sm" className="w-full bg-teal-500/20 text-teal-400 hover:bg-teal-500/30 border border-teal-500/30">
                      Deposit Funds
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-purple-500/20 bg-purple-500/5 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-sm font-medium text-muted-foreground">Orders Today</p>
                      <Package className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{stats?.ordersToday || 0}</p>
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-sm font-medium text-muted-foreground">GB Sold Today</p>
                      <Wifi className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{stats?.gbSoldToday || 0} GB</p>
                  </CardContent>
                </Card>

                <Card className="border-green-500/20 bg-green-500/5 backdrop-blur-xl">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{stats?.successRate || 0}%</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/mtn">
              <Card className="group cursor-pointer border-white/5 bg-background/50 hover:bg-white/5 transition-all hover:border-teal-500/30 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
                  <div className="p-3 rounded-full bg-teal-500/10 text-teal-400 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-sm">Bulk Orders</span>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/orders">
              <Card className="group cursor-pointer border-white/5 bg-background/50 hover:bg-white/5 transition-all hover:border-purple-500/30 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
                  <div className="p-3 rounded-full bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                    <Package className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-sm">All Orders</span>
                </CardContent>
              </Card>
            </Link>

            <Link href="/transactions">
              <Card className="group cursor-pointer border-white/5 bg-background/50 hover:bg-white/5 transition-all hover:border-blue-500/30 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
                  <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-sm">Transactions</span>
                </CardContent>
              </Card>
            </Link>

            <Link href="/history">
              <Card className="group cursor-pointer border-white/5 bg-background/50 hover:bg-white/5 transition-all hover:border-amber-500/30 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
                  <div className="p-3 rounded-full bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-sm">History</span>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Place an Order */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Place an Order</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {NETWORKS.map(net => (
                <Link key={net.id} href={`/${net.id}`}>
                  <Card className="group cursor-pointer border-white/5 bg-background/40 hover:bg-white/5 transition-all duration-300 overflow-hidden">
                    <CardContent className="p-6 relative">
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${net.gradient} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity -translate-y-1/2 translate-x-1/2`}></div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full ${net.color} flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform`}>
                            {net.name[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-white">{net.name}</h4>
                            <p className="text-sm text-muted-foreground flex items-center mt-1">
                              Buy Data <ChevronRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Recent Orders</h3>
              <Link href="/history" className="text-sm text-teal-400 hover:text-teal-300 flex items-center font-medium">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <Card className="border-white/5 bg-background/40 backdrop-blur-md overflow-hidden">
              <div className="divide-y divide-white/5">
                {ordersLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24 bg-white/10" />
                          <Skeleton className="h-3 w-16 bg-white/10" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
                    </div>
                  ))
                ) : recentOrders?.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No orders yet</p>
                  </div>
                ) : (
                  recentOrders?.map(order => (
                    <div key={order.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm
                          ${order.network.toLowerCase() === 'mtn' ? 'bg-yellow-500' : 
                            order.network.toLowerCase() === 'telecel' ? 'bg-red-500' : 'bg-blue-500'}`}
                        >
                          {order.network.substring(0, 1)}
                        </div>
                        <div>
                          <p className="font-mono text-sm text-white">{order.orderId}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span className="font-medium text-gray-300">{order.bundleSize}</span>
                            <span>•</span>
                            <span>{format(new Date(order.createdAt), 'MMM d, h:mm a')}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                          ${order.status.toLowerCase() === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                            order.status.toLowerCase() === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}