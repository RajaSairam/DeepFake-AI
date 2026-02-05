 import { ReactNode } from "react";
 import { motion } from "framer-motion";
 import { LucideIcon } from "lucide-react";
 
 interface StatCardProps {
   icon: LucideIcon;
   label: string;
   value: string | number;
   trend?: {
     value: number;
     isPositive: boolean;
   };
   variant?: "default" | "success" | "warning" | "danger";
 }
 
 export function StatCard({ icon: Icon, label, value, trend, variant = "default" }: StatCardProps) {
   const variants = {
     default: "from-primary/20 to-primary/5",
     success: "from-success/20 to-success/5",
     warning: "from-warning/20 to-warning/5",
     danger: "from-destructive/20 to-destructive/5",
   };
 
   const iconVariants = {
     default: "text-primary",
     success: "text-success",
     warning: "text-warning",
     danger: "text-destructive",
   };
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       className="glass rounded-xl p-6 hover:border-primary/30 transition-all duration-300"
     >
       <div className="flex items-start justify-between">
         <div
           className={`p-3 rounded-xl bg-gradient-to-br ${variants[variant]}`}
         >
           <Icon className={`w-6 h-6 ${iconVariants[variant]}`} />
         </div>
         {trend && (
           <span
             className={`text-sm font-medium ${
               trend.isPositive ? "text-success" : "text-destructive"
             }`}
           >
             {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
           </span>
         )}
       </div>
       <div className="mt-4">
         <h3 className="text-2xl font-bold">{value}</h3>
         <p className="text-sm text-muted-foreground">{label}</p>
       </div>
     </motion.div>
   );
 }