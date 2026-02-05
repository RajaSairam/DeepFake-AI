 import { motion } from "framer-motion";
 import { Shield, Scan, AlertTriangle, CheckCircle } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Link } from "react-router-dom";
 
 export function Hero() {
   return (
     <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero cyber-grid">
       {/* Animated background glow */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <motion.div
           className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
           style={{ background: "var(--gradient-glow)" }}
           animate={{
             scale: [1, 1.2, 1],
             opacity: [0.3, 0.5, 0.3],
           }}
           transition={{
             duration: 4,
             repeat: Infinity,
             ease: "easeInOut",
           }}
         />
         <motion.div
           className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full"
           style={{ background: "var(--gradient-glow)" }}
           animate={{
             scale: [1.2, 1, 1.2],
             opacity: [0.3, 0.5, 0.3],
           }}
           transition={{
             duration: 4,
             repeat: Infinity,
             ease: "easeInOut",
             delay: 2,
           }}
         />
       </div>
 
       <div className="container mx-auto px-6 relative z-10">
         <div className="max-w-4xl mx-auto text-center">
           {/* Badge */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
             className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
           >
             <Shield className="w-4 h-4 text-primary" />
             <span className="text-sm text-muted-foreground">
               AI-Powered Fraud Protection
             </span>
           </motion.div>
 
           {/* Main heading */}
           <motion.h1
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.1 }}
             className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
           >
             Detect{" "}
             <span className="text-gradient glow-text">Deepfakes</span>
             <br />& Online{" "}
             <span className="text-gradient glow-text">Scams</span>
           </motion.h1>
 
           {/* Subtitle */}
           <motion.p
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.2 }}
             className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
           >
             Upload images, videos, audio, or text. Our advanced AI analyzes content 
             in seconds to protect you from fraud, phishing, and manipulated media.
           </motion.p>
 
           {/* CTA Buttons */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.3 }}
             className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
           >
             <Link to="/auth">
               <Button variant="hero" size="xl" className="w-full sm:w-auto">
                 <Scan className="w-5 h-5" />
                 Start Scanning Free
               </Button>
             </Link>
             <Link to="/auth">
               <Button variant="glass" size="xl" className="w-full sm:w-auto">
                 Sign In
               </Button>
             </Link>
           </motion.div>
 
           {/* Stats */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5, delay: 0.4 }}
             className="grid grid-cols-2 md:grid-cols-4 gap-6"
           >
             {[
               { icon: Scan, value: "10M+", label: "Scans Completed" },
               { icon: AlertTriangle, value: "500K+", label: "Threats Detected" },
               { icon: CheckCircle, value: "99.2%", label: "Accuracy Rate" },
               { icon: Shield, value: "24/7", label: "Protection" },
             ].map((stat, index) => (
               <div
                 key={index}
                 className="glass rounded-xl p-4 text-center hover:border-primary/50 transition-colors"
               >
                 <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                 <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                 <div className="text-sm text-muted-foreground">{stat.label}</div>
               </div>
             ))}
           </motion.div>
         </div>
       </div>
 
       {/* Bottom gradient fade */}
       <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
     </section>
   );
 }