 import { motion } from "framer-motion";
 
 interface RiskGaugeProps {
   score: number;
   size?: "sm" | "md" | "lg";
 }
 
 export function RiskGauge({ score, size = "md" }: RiskGaugeProps) {
   const sizes = {
     sm: { width: 80, stroke: 8, fontSize: "text-lg" },
     md: { width: 120, stroke: 10, fontSize: "text-2xl" },
     lg: { width: 160, stroke: 12, fontSize: "text-4xl" },
   };
 
   const { width, stroke, fontSize } = sizes[size];
   const radius = (width - stroke) / 2;
   const circumference = radius * 2 * Math.PI;
   const offset = circumference - (score / 100) * circumference;
 
   const getColor = () => {
     if (score <= 30) return "hsl(var(--success))";
     if (score <= 70) return "hsl(var(--warning))";
     return "hsl(var(--destructive))";
   };
 
   const getLabel = () => {
     if (score <= 30) return "Low Risk";
     if (score <= 70) return "Medium Risk";
     return "High Risk";
   };
 
   return (
     <div className="relative inline-flex flex-col items-center">
       <svg
         width={width}
         height={width}
         className="-rotate-90"
       >
         {/* Background circle */}
         <circle
           cx={width / 2}
           cy={width / 2}
           r={radius}
           fill="none"
           stroke="hsl(var(--secondary))"
           strokeWidth={stroke}
         />
         {/* Progress circle */}
         <motion.circle
           cx={width / 2}
           cy={width / 2}
           r={radius}
           fill="none"
           stroke={getColor()}
           strokeWidth={stroke}
           strokeLinecap="round"
           strokeDasharray={circumference}
           initial={{ strokeDashoffset: circumference }}
           animate={{ strokeDashoffset: offset }}
           transition={{ duration: 1, ease: "easeOut" }}
         />
       </svg>
       <div className="absolute inset-0 flex flex-col items-center justify-center">
         <motion.span
           initial={{ opacity: 0, scale: 0.5 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5, delay: 0.5 }}
           className={`${fontSize} font-bold`}
           style={{ color: getColor() }}
         >
           {score}
         </motion.span>
       </div>
       <p className="text-xs text-muted-foreground mt-2">{getLabel()}</p>
     </div>
   );
 }