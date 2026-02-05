 import { useEffect, useState } from "react";
 import { useParams, Link } from "react-router-dom";
 import { motion } from "framer-motion";
 import { format } from "date-fns";
 import {
   ArrowLeft,
   CheckCircle,
   AlertTriangle,
   XCircle,
   Shield,
   FileText,
   Image,
   Video,
   Mic,
   MessageSquare,
   Mail,
   Star,
   Briefcase,
   TrendingUp,
 } from "lucide-react";
 import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
 import { RiskGauge } from "@/components/dashboard/RiskGauge";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { supabase } from "@/integrations/supabase/client";
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
 
 const verdictConfig: Record<Verdict, { icon: React.ElementType; color: string; bg: string; label: string }> = {
   real: { icon: CheckCircle, color: "text-success", bg: "bg-success/10", label: "Authentic" },
   suspicious: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", label: "Suspicious" },
   fake: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Fake / Scam" },
 };
 
 export default function ScanResult() {
   const { id } = useParams();
   const [scan, setScan] = useState<ScanWithResult | null>(null);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     const fetchScan = async () => {
       if (!id) return;
 
       const { data, error } = await supabase
         .from("scans")
         .select(`
           *,
           scan_results (*)
         `)
         .eq("id", id)
         .single();
 
       if (error) {
         console.error("Error fetching scan:", error);
       } else {
         setScan(data as ScanWithResult);
       }
 
       setLoading(false);
     };
 
     fetchScan();
   }, [id]);
 
   if (loading) {
     return (
       <DashboardLayout>
         <div className="flex items-center justify-center h-96">
           <div className="animate-pulse text-center">
             <Shield className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse-glow" />
             <p className="text-muted-foreground">Loading results...</p>
           </div>
         </div>
       </DashboardLayout>
     );
   }
 
   if (!scan) {
     return (
       <DashboardLayout>
         <div className="text-center py-16">
           <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
           <h2 className="text-xl font-semibold mb-2">Scan not found</h2>
           <p className="text-muted-foreground mb-4">
             This scan doesn't exist or you don't have access to it.
           </p>
           <Link to="/dashboard">
             <Button variant="outline">Back to Dashboard</Button>
           </Link>
         </div>
       </DashboardLayout>
     );
   }
 
   const result = scan.scan_results?.[0];
   const TypeIcon = typeIcons[scan.detection_type];
   const verdictInfo = result ? verdictConfig[result.verdict] : null;
   const VerdictIcon = verdictInfo?.icon || Shield;
 
   return (
     <DashboardLayout>
       <div className="max-w-4xl mx-auto space-y-8">
         {/* Back button */}
         <Link
           to="/dashboard"
           className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
         >
           <ArrowLeft className="w-4 h-4" />
           Back to Dashboard
         </Link>
 
         {/* Header */}
         <div className="glass rounded-xl p-6">
           <div className="flex items-start justify-between flex-wrap gap-4">
             <div className="flex items-center gap-4">
               <div className="p-3 rounded-xl bg-secondary">
                 <TypeIcon className="w-8 h-8 text-primary" />
               </div>
               <div>
                 <h1 className="text-xl font-bold">
                   {scan.file_name || `${scan.detection_type.replace("_", " ")} Scan`}
                 </h1>
                 <p className="text-sm text-muted-foreground">
                   {format(new Date(scan.created_at), "MMMM d, yyyy 'at' h:mm a")}
                 </p>
               </div>
             </div>
 
             {result && (
               <Badge
                 className={`${verdictInfo?.bg} ${verdictInfo?.color} border-0 text-sm px-4 py-2`}
               >
                 <VerdictIcon className="w-4 h-4 mr-2" />
                 {verdictInfo?.label}
               </Badge>
             )}
           </div>
         </div>
 
         {result ? (
           <>
             {/* Risk Score */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="glass rounded-xl p-8 text-center"
             >
               <h2 className="text-lg font-semibold mb-6">Risk Assessment</h2>
               <div className="flex flex-col items-center">
                 <RiskGauge score={result.risk_score} size="lg" />
                 <div className="mt-6 flex items-center gap-2">
                   <span className="text-muted-foreground">Confidence:</span>
                   <Badge
                     variant="outline"
                     className={
                       result.confidence === "high"
                         ? "text-success"
                         : result.confidence === "medium"
                         ? "text-warning"
                         : "text-muted-foreground"
                     }
                   >
                     {result.confidence.charAt(0).toUpperCase() + result.confidence.slice(1)}
                   </Badge>
                 </div>
               </div>
             </motion.div>
 
             {/* Explanation */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="glass rounded-xl p-6"
             >
               <h2 className="text-lg font-semibold mb-4">Analysis Summary</h2>
               <p className="text-muted-foreground leading-relaxed">
                 {result.explanation}
               </p>
             </motion.div>
 
             {/* Indicators */}
             {result.indicators && result.indicators.length > 0 && (
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="glass rounded-xl p-6"
               >
                 <h2 className="text-lg font-semibold mb-4">Detected Indicators</h2>
                 <ul className="space-y-3">
                   {(result.indicators as string[]).map((indicator: string, index: number) => (
                     <li key={index} className="flex items-start gap-3">
                       <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                       <span className="text-muted-foreground">{indicator}</span>
                     </li>
                   ))}
                 </ul>
               </motion.div>
             )}
 
             {/* AI Analysis */}
             {result.ai_analysis && (
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.3 }}
                 className="glass rounded-xl p-6"
               >
                 <h2 className="text-lg font-semibold mb-4">Detailed AI Analysis</h2>
                 <div className="prose prose-invert max-w-none">
                   <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                     {result.ai_analysis}
                   </p>
                 </div>
               </motion.div>
             )}
           </>
         ) : (
           <div className="glass rounded-xl p-8 text-center">
             <Shield className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse-glow" />
             <h2 className="text-xl font-semibold mb-2">
               {scan.status === "processing" ? "Analyzing..." : "Analysis Failed"}
             </h2>
             <p className="text-muted-foreground">
               {scan.status === "processing"
                 ? "Your content is being analyzed. This may take a moment."
                 : "There was an error analyzing this content. Please try again."}
             </p>
           </div>
         )}
 
         {/* Original content */}
         {scan.text_content && (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4 }}
             className="glass rounded-xl p-6"
           >
             <h2 className="text-lg font-semibold mb-4">Analyzed Content</h2>
             <div className="bg-secondary rounded-lg p-4 max-h-64 overflow-y-auto">
               <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                 {scan.text_content}
               </p>
             </div>
           </motion.div>
         )}
 
         {/* Actions */}
         <div className="flex justify-center gap-4">
           <Link to="/dashboard/scan">
             <Button variant="hero">New Scan</Button>
           </Link>
           <Link to="/dashboard/history">
             <Button variant="outline">View History</Button>
           </Link>
         </div>
       </div>
     </DashboardLayout>
   );
 }