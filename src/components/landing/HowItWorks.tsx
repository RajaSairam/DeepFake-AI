 import { motion } from "framer-motion";
 import { Upload, Cpu, ShieldCheck, FileText } from "lucide-react";
 
 const steps = [
   {
     icon: Upload,
     step: "01",
     title: "Upload Content",
     description: "Upload images, videos, audio files, or paste text content you want to verify",
   },
   {
     icon: Cpu,
     step: "02",
     title: "AI Analysis",
     description: "Our advanced AI models analyze the content for signs of manipulation or fraud",
   },
   {
     icon: ShieldCheck,
     step: "03",
     title: "Risk Assessment",
     description: "Receive a detailed risk score with confidence levels and threat indicators",
   },
   {
     icon: FileText,
     step: "04",
     title: "Detailed Report",
     description: "Get a comprehensive report explaining exactly what was detected and why",
   },
 ];
 
 export function HowItWorks() {
   return (
     <section className="py-24 gradient-hero relative overflow-hidden">
       {/* Background decoration */}
       <div className="absolute inset-0 cyber-grid opacity-50" />
       
       <div className="container mx-auto px-6 relative z-10">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.5 }}
           className="text-center mb-16"
         >
           <h2 className="text-3xl md:text-5xl font-bold mb-4">
             How It <span className="text-gradient">Works</span>
           </h2>
           <p className="text-muted-foreground max-w-2xl mx-auto">
             Protecting yourself from digital fraud has never been easier. 
             Follow these simple steps to verify any content.
           </p>
         </motion.div>
 
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {steps.map((step, index) => (
             <motion.div
               key={step.step}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5, delay: index * 0.15 }}
               className="relative"
             >
               {/* Connector line */}
               {index < steps.length - 1 && (
                 <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent z-0" />
               )}
               
               <div className="relative glass rounded-2xl p-6 text-center hover:border-primary/30 transition-all duration-300">
                 {/* Step number */}
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                   {step.step}
                 </div>
                 
                 {/* Icon */}
                 <div className="inline-flex p-4 rounded-2xl bg-secondary mb-4 mt-4">
                   <step.icon className="w-8 h-8 text-primary" />
                 </div>
                 
                 <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                 <p className="text-sm text-muted-foreground">{step.description}</p>
               </div>
             </motion.div>
           ))}
         </div>
       </div>
     </section>
   );
 }