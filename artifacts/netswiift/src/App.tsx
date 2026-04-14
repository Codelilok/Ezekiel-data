import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import NetworkPage from "@/pages/NetworkPage";
import OrdersPage from "@/pages/OrdersPage";
import TransactionsPage from "@/pages/TransactionsPage";
import Profile from "@/pages/Profile";
import BulkOrders from "@/pages/BulkOrders";
import Admin from "@/pages/Admin";
import Agent from "@/pages/Agent";
import Blocked from "@/pages/Blocked";
import { seedDummyData } from "@/lib/dummyData";

seedDummyData();

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/mtn"><NetworkPage network="mtn" name="MTN" colorTheme="yellow" /></Route>
      <Route path="/telecel"><NetworkPage network="telecel" name="Telecel" colorTheme="red" /></Route>
      <Route path="/airteltigo"><NetworkPage network="airteltigo" name="AirtelTigo" colorTheme="blue" /></Route>
      <Route path="/orders" component={OrdersPage} />
      <Route path="/history" component={OrdersPage} />
      <Route path="/transactions" component={TransactionsPage} />
      <Route path="/profile" component={Profile} />
      <Route path="/bulk-orders" component={BulkOrders} />
      <Route path="/admin" component={Admin} />
      <Route path="/agent" component={Agent} />
      <Route path="/blocked" component={Blocked} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
        <SonnerToaster position="top-center" theme="dark" richColors closeButton offset={72} toastOptions={{ style: { zIndex: 9999 } }} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
