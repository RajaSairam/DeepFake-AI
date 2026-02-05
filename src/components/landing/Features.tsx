 import { motion } from "framer-motion";
 import {
   Image,
   Video,
   Mic,
   MessageSquare,
   Mail,
   Star,
   Briefcase,
   TrendingUp,
   Shield,
 } from "lucide-react";
 
 const features = [
   {
     icon: Image,
     title: "Deepfake Images",
     description: "Detect AI-generated or manipulated images using advanced CNN analysis",
     color: "from-cyan-500 to-blue-500",
   },
   {
     icon: Video,
     title: "Fake Videos",
     description: "Frame-by-frame analysis to identify deepfake videos and synthetic media",
     color: "from-blue-500 to-purple-500",
   },
   {
     icon: Mic,
     title: "Voice Cloning",
     description: "Spectrogram analysis to detect cloned voices and audio manipulation",
     color: "from-purple-500 to-pink-500",
   },
   {
     icon: MessageSquare,
     title: "SMS & WhatsApp Scams",
     description: "NLP-powered detection of phishing messages and social engineering",
     color: "from-pink-500 to-red-500",
   },
   {
     icon: Mail,
     title: "Email Phishing",
     description: "Identify spoofed emails, malicious links, and impersonation attempts",
     color: "from-red-500 to-orange-500",
   },
   {
     icon: Star,
     title: "Fake Reviews",
     description: "Spot artificial reviews and manipulated ratings with pattern analysis",
     color: "from-orange-500 to-yellow-500",
   },
   {
     icon: TrendingUp,
     title: "Investment Scams",
     description: "Detect Ponzi schemes, pump-and-dump, and financial fraud indicators",
     color: "from-yellow-500 to-green-500",
   },
   {
     icon: Briefcase,
     title: "Fake Job Offers",
     description: "Identify fraudulent job postings and employment scams",
     color: "from-green-500 to-cyan-500",
   },
 ];
 
 export function Features() {
   return (
     <section className="py-24 bg-background relative">
       <div className="container mx-auto px-6">
         {/* Section header */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.5 }}
           className="text-center mb-16"
         >
           <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
             <Shield className="w-4 h-4 text-primary" />
             <span className="text-sm text-muted-foreground">
               Comprehensive Protection
             </span>
           </div>
           <h2 className="text-3xl md:text-5xl font-bold mb-4">
             Detect <span className="text-gradient">Every Type</span> of Fraud
           </h2>
           <p className="text-muted-foreground max-w-2xl mx-auto">
             Our AI-powered system analyzes multiple content types to provide 
             comprehensive protection against digital fraud and manipulation.
           </p>
         </motion.div>
 
         {/* Features grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {features.map((feature, index) => (
             <motion.div
               key={feature.title}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5, delay: index * 0.1 }}
               className="group relative"
             >
               <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300"
                 style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}
               />
               <div className="relative glass rounded-2xl p-6 h-full hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                 <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4`}>
                   <feature.icon className="w-6 h-6 text-white" />
                 </div>
                 <h3 className="text-lg font-semibold mb-2 text-foreground">
                   {feature.title}
                 </h3>
                 <p className="text-sm text-muted-foreground">
                   {feature.description}
                 </p>
               </div>
             </motion.div>
           ))}
         </div>
       </div>
     </section>
   );
 }