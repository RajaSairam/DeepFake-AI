 import { motion } from "framer-motion";
 import { format } from "date-fns";
 import {
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
   Clock,
   Loader2,
 } from "lucide-react";
 import { Badge } from "@/components/ui/badge";
 import { ScanWithResult, DetectionType, DetectionStatus, Verdict } from "@/lib/types";
 import { Link } from "react-router-dom";
 
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
 
 const typeLabels: Record<DetectionType, string> = {
   image: "Image",
   video: "Video",
   audio: "Audio",
   text: "Text",
   email: "Email",
   sms: "SMS",
   review: "Review",
   investment: "Investment",
   job_offer: "Job Offer",
   other: "Other",
 };
 
 const statusConfig: Record<DetectionStatus, { icon: React.ElementType; color: string; label: string }> = {
   pending: { icon: Clock, color: "text-muted-foreground", label: "Pending" },
   processing: { icon: Loader2, color: "text-primary", label: "Processing" },
   completed: { icon: CheckCircle, color: "text-success", label: "Completed" },
   failed: { icon: XCircle, color: "text-destructive", label: "Failed" },
 };
 
 const verdictConfig: Record<Verdict, { icon: React.ElementType; color: string; bg: string }> = {
   real: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
   suspicious: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
   fake: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
 };
 
 interface RecentScansProps {
   scans: ScanWithResult[];
 }
 
 export function RecentScans({ scans }: RecentScansProps) {
   if (scans.length === 0) {
     return (
       <div className="glass rounded-xl p-8 text-center">
         <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
         <h3 className="text-lg font-semibold mb-2">No scans yet</h3>
         <p className="text-muted-foreground mb-4">
           Upload your first file to start detecting threats
         </p>
         <Link
           to="/dashboard/scan"
           className="inline-flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
         >
           Start Scanning
         </Link>
       </div>
     );
   }
 
   return (
     <div className="glass rounded-xl overflow-hidden">
       <div className="p-4 border-b border-border">
         <h3 className="font-semibold">Recent Scans</h3>
       </div>
       <div className="divide-y divide-border">
         {scans.map((scan, index) => {
           const TypeIcon = typeIcons[scan.detection_type];
           const statusInfo = statusConfig[scan.status];
           const StatusIcon = statusInfo.icon;
           const result = scan.scan_results?.[0];
           const verdictInfo = result ? verdictConfig[result.verdict] : null;
           const VerdictIcon = verdictInfo?.icon;
 
           return (
             <motion.div
               key={scan.id}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: index * 0.05 }}
               className="p-4 hover:bg-secondary/30 transition-colors"
             >
               <Link to={`/dashboard/scan/${scan.id}`} className="flex items-center gap-4">
                 <div className="p-2 rounded-lg bg-secondary">
                   <TypeIcon className="w-5 h-5 text-primary" />
                 </div>
 
                 <div className="flex-1 min-w-0">
                   <p className="font-medium truncate">
                     {scan.file_name || typeLabels[scan.detection_type] + " Scan"}
                   </p>
                   <p className="text-sm text-muted-foreground">
                     {format(new Date(scan.created_at), "MMM d, yyyy h:mm a")}
                   </p>
                 </div>
 
                 <div className="flex items-center gap-3">
                   {result ? (
                     <>
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
                     </>
                   ) : (
                     <Badge variant="outline" className={statusInfo.color}>
                       <StatusIcon
                         className={`w-3 h-3 mr-1 ${
                           scan.status === "processing" ? "animate-spin" : ""
                         }`}
                       />
                       {statusInfo.label}
                     </Badge>
                   )}
                 </div>
               </Link>
             </motion.div>
           );
         })}
       </div>
     </div>
   );
 }