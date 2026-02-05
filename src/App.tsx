 import { Toaster } from "@/components/ui/toaster";
 import { Toaster as Sonner } from "@/components/ui/sonner";
 import { TooltipProvider } from "@/components/ui/tooltip";
 import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
 import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
 import { AuthProvider, useAuth } from "@/hooks/useAuth";
 import Index from "./pages/Index";
 import Auth from "./pages/Auth";
 import Dashboard from "./pages/Dashboard";
 import NewScan from "./pages/NewScan";
 import ScanResult from "./pages/ScanResult";
 import History from "./pages/History";
 import NotFound from "./pages/NotFound";
 
 const queryClient = new QueryClient();
 
 function ProtectedRoute({ children }: { children: React.ReactNode }) {
   const { user, loading } = useAuth();
 
   if (loading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-background">
         <div className="text-center">
           <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
           <p className="text-muted-foreground">Loading...</p>
         </div>
       </div>
     );
   }
 
   if (!user) {
     return <Navigate to="/auth" replace />;
   }
 
   return <>{children}</>;
 }
 
 const App = () => (
   <QueryClientProvider client={queryClient}>
     <AuthProvider>
       <TooltipProvider>
         <Toaster />
         <Sonner />
         <BrowserRouter>
           <Routes>
             <Route path="/" element={<Index />} />
             <Route path="/auth" element={<Auth />} />
             <Route
               path="/dashboard"
               element={
                 <ProtectedRoute>
                   <Dashboard />
                 </ProtectedRoute>
               }
             />
             <Route
               path="/dashboard/scan"
               element={
                 <ProtectedRoute>
                   <NewScan />
                 </ProtectedRoute>
               }
             />
             <Route
               path="/dashboard/scan/:id"
               element={
                 <ProtectedRoute>
                   <ScanResult />
                 </ProtectedRoute>
               }
             />
             <Route
               path="/dashboard/history"
               element={
                 <ProtectedRoute>
                   <History />
                 </ProtectedRoute>
               }
             />
             <Route path="*" element={<NotFound />} />
           </Routes>
         </BrowserRouter>
       </TooltipProvider>
     </AuthProvider>
   </QueryClientProvider>
 );
 
 export default App;
