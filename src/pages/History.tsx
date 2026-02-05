 import { useEffect, useState } from "react";
 import { motion } from "framer-motion";
 import { format } from "date-fns";
 import { Link } from "react-router-dom";
 import {
   Search,
   Filter,
   Image,
   Video,
   Mic,
   MessageSquare,
   Mail,
   Star,
   Briefcase,
   TrendingUp,
   FileText,
   CheckCircle,
   AlertTriangle,
   XCircle,
   ChevronRight,
 } from "lucide-react";
 import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Badge } from "@/components/ui/badge";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/hooks/useAuth";
 import { ScanWithResult, DetectionType, Verdict } from "@/lib/types";
 
 const typeIcons: Record<DetectionType, React.ElementType> = {
   image: Image,
   video: Video,
   audio: Mic,
   text: MessageSquare,
   email: Mail,
   sms: MessageSquare,
   review: Star,
   investment: TrendingUp,
   job_offer: Briefcase,
   other: FileText,
 };
 
 const verdictConfig: Record<Verdict, { icon: React.ElementType; color: string; bg: string }> = {
   real: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
   suspicious: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
   fake: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
 };
 
 export default function History() {
   const { user } = useAuth();
   const [scans, setScans] = useState<ScanWithResult[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");
   const [typeFilter, setTypeFilter] = useState<string>("all");
   const [verdictFilter, setVerdictFilter] = useState<string>("all");
 
   useEffect(() => {
     const fetchScans = async () => {
       if (!user) return;
 
       const { data, error } = await supabase
         .from("scans")
         .select(`
           *,
           scan_results (*)
         `)
         .eq("user_id", user.id)
         .order("created_at", { ascending: false });
 
       if (error) {
         console.error("Error fetching scans:", error);
       } else {
         setScans(data as ScanWithResult[]);
       }
 
       setLoading(false);
     };
 
     fetchScans();
   }, [user]);
 
   const filteredScans = scans.filter((scan) => {
     const matchesSearch =
       !searchQuery ||
       scan.file_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       scan.text_content?.toLowerCase().includes(searchQuery.toLowerCase());
 
     const matchesType = typeFilter === "all" || scan.detection_type === typeFilter;
 
     const result = scan.scan_results?.[0];
     const matchesVerdict =
       verdictFilter === "all" || (result && result.verdict === verdictFilter);
 
     return matchesSearch && matchesType && matchesVerdict;
   });
 
   return (
     <DashboardLayout>
       <div className="space-y-6">
         {/* Header */}
         <div>
           <h1 className="text-2xl font-bold mb-2">Scan History</h1>
           <p className="text-muted-foreground">
             View and search through all your previous scans.
           </p>
         </div>
 
         {/* Filters */}
         <div className="flex flex-col sm:flex-row gap-4">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
             <Input
               placeholder="Search scans..."
               className="pl-10 bg-secondary border-border"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
           <Select value={typeFilter} onValueChange={setTypeFilter}>
             <SelectTrigger className="w-full sm:w-40 bg-secondary border-border">
               <Filter className="w-4 h-4 mr-2" />
               <SelectValue placeholder="Type" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">All Types</SelectItem>
               <SelectItem value="image">Image</SelectItem>
               <SelectItem value="video">Video</SelectItem>
               <SelectItem value="audio">Audio</SelectItem>
               <SelectItem value="text">Text</SelectItem>
               <SelectItem value="email">Email</SelectItem>
               <SelectItem value="review">Review</SelectItem>
               <SelectItem value="investment">Investment</SelectItem>
               <SelectItem value="job_offer">Job Offer</SelectItem>
             </SelectContent>
           </Select>
           <Select value={verdictFilter} onValueChange={setVerdictFilter}>
             <SelectTrigger className="w-full sm:w-40 bg-secondary border-border">
               <SelectValue placeholder="Verdict" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="all">All Results</SelectItem>
               <SelectItem value="real">Real</SelectItem>
               <SelectItem value="suspicious">Suspicious</SelectItem>
               <SelectItem value="fake">Fake</SelectItem>
             </SelectContent>
           </Select>
         </div>
 
         {/* Results */}
         {loading ? (
           <div className="glass rounded-xl p-8 text-center">
             <div className="animate-pulse">
               <div className="h-4 bg-secondary rounded w-1/4 mx-auto mb-4" />
               <div className="h-4 bg-secondary rounded w-1/2 mx-auto" />
             </div>
           </div>
         ) : filteredScans.length === 0 ? (
           <div className="glass rounded-xl p-8 text-center">
             <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
             <h3 className="text-lg font-semibold mb-2">No scans found</h3>
             <p className="text-muted-foreground mb-4">
               {scans.length === 0
                 ? "You haven't performed any scans yet."
                 : "No scans match your current filters."}
             </p>
             {scans.length === 0 && (
               <Link to="/dashboard/scan">
                 <Button variant="hero">Start Scanning</Button>
               </Link>
             )}
           </div>
         ) : (
           <div className="glass rounded-xl overflow-hidden">
             <div className="divide-y divide-border">
               {filteredScans.map((scan, index) => {
                 const TypeIcon = typeIcons[scan.detection_type];
                 const result = scan.scan_results?.[0];
                 const verdictInfo = result ? verdictConfig[result.verdict] : null;
                 const VerdictIcon = verdictInfo?.icon;
 
                 return (
                   <motion.div
                     key={scan.id}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: index * 0.03 }}
                   >
                     <Link
                       to={`/dashboard/scan/${scan.id}`}
                       className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors"
                     >
                       <div className="p-2 rounded-lg bg-secondary">
                         <TypeIcon className="w-5 h-5 text-primary" />
                       </div>
 
                       <div className="flex-1 min-w-0">
                         <p className="font-medium truncate">
                           {scan.file_name ||
                             scan.detection_type.replace("_", " ").charAt(0).toUpperCase() +
                               scan.detection_type.replace("_", " ").slice(1) +
                               " Scan"}
                         </p>
                         <p className="text-sm text-muted-foreground">
                           {format(new Date(scan.created_at), "MMM d, yyyy h:mm a")}
                         </p>
                       </div>
 
                       {result ? (
                         <div className="flex items-center gap-3">
                           <Badge
                             variant="outline"
                             className={`${verdictInfo?.bg} ${verdictInfo?.color} border-0`}
                           >
                             {VerdictIcon && <VerdictIcon className="w-3 h-3 mr-1" />}
                             {result.verdict.charAt(0).toUpperCase() + result.verdict.slice(1)}
                           </Badge>
                           <span
                             className={`text-sm font-medium ${
                               result.risk_score <= 30
                                 ? "text-success"
                                 : result.risk_score <= 70
                                 ? "text-warning"
                                 : "text-destructive"
                             }`}
                           >
                             {result.risk_score}%
                           </span>
                         </div>
                       ) : (
                         <Badge variant="outline" className="text-muted-foreground">
                           {scan.status === "processing" ? "Analyzing..." : scan.status}
                         </Badge>
                       )}
 
                       <ChevronRight className="w-5 h-5 text-muted-foreground" />
                     </Link>
                   </motion.div>
                 );
               })}
             </div>
           </div>
         )}
       </div>
     </DashboardLayout>
   );
 }