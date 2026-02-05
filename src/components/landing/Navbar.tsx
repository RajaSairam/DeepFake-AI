 import { useState } from "react";
 import { Link, useNavigate } from "react-router-dom";
 import { motion } from "framer-motion";
 import { Shield, Menu, X, LogIn, UserPlus } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { useAuth } from "@/hooks/useAuth";
 
 export function Navbar() {
   const [isOpen, setIsOpen] = useState(false);
   const { user } = useAuth();
   const navigate = useNavigate();
 
   return (
     <motion.nav
       initial={{ opacity: 0, y: -20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.5 }}
       className="fixed top-0 left-0 right-0 z-50 glass"
     >
       <div className="container mx-auto px-6">
         <div className="flex items-center justify-between h-16">
           {/* Logo */}
           <Link to="/" className="flex items-center gap-2">
             <div className="p-2 rounded-lg gradient-primary">
               <Shield className="w-5 h-5 text-primary-foreground" />
             </div>
             <span className="font-bold text-lg">DeepGuard</span>
           </Link>
 
           {/* Desktop nav */}
           <div className="hidden md:flex items-center gap-8">
             <Link
               to="/"
               className="text-muted-foreground hover:text-foreground transition-colors"
             >
               Home
             </Link>
             <a
               href="#features"
               className="text-muted-foreground hover:text-foreground transition-colors"
             >
               Features
             </a>
             <a
               href="#how-it-works"
               className="text-muted-foreground hover:text-foreground transition-colors"
             >
               How It Works
             </a>
           </div>
 
           {/* Auth buttons */}
           <div className="hidden md:flex items-center gap-3">
             {user ? (
               <Button
                 variant="hero"
                 size="sm"
                 onClick={() => navigate("/dashboard")}
               >
                 Dashboard
               </Button>
             ) : (
               <>
                 <Link to="/auth">
                   <Button variant="ghost" size="sm">
                     <LogIn className="w-4 h-4" />
                     Sign In
                   </Button>
                 </Link>
                 <Link to="/auth?signup=true">
                   <Button variant="hero" size="sm">
                     <UserPlus className="w-4 h-4" />
                     Get Started
                   </Button>
                 </Link>
               </>
             )}
           </div>
 
           {/* Mobile menu button */}
           <button
             className="md:hidden p-2 text-muted-foreground hover:text-foreground"
             onClick={() => setIsOpen(!isOpen)}
           >
             {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
           </button>
         </div>
 
         {/* Mobile menu */}
         {isOpen && (
           <motion.div
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: "auto" }}
             exit={{ opacity: 0, height: 0 }}
             className="md:hidden border-t border-border pb-4"
           >
             <div className="flex flex-col gap-4 pt-4">
               <Link
                 to="/"
                 className="text-muted-foreground hover:text-foreground transition-colors"
                 onClick={() => setIsOpen(false)}
               >
                 Home
               </Link>
               <a
                 href="#features"
                 className="text-muted-foreground hover:text-foreground transition-colors"
                 onClick={() => setIsOpen(false)}
               >
                 Features
               </a>
               <a
                 href="#how-it-works"
                 className="text-muted-foreground hover:text-foreground transition-colors"
                 onClick={() => setIsOpen(false)}
               >
                 How It Works
               </a>
               <div className="flex gap-3 pt-4 border-t border-border">
                 {user ? (
                   <Button
                     variant="hero"
                     className="flex-1"
                     onClick={() => {
                       setIsOpen(false);
                       navigate("/dashboard");
                     }}
                   >
                     Dashboard
                   </Button>
                 ) : (
                   <>
                     <Link to="/auth" className="flex-1">
                       <Button
                         variant="ghost"
                         className="w-full"
                         onClick={() => setIsOpen(false)}
                       >
                         Sign In
                       </Button>
                     </Link>
                     <Link to="/auth?signup=true" className="flex-1">
                       <Button
                         variant="hero"
                         className="w-full"
                         onClick={() => setIsOpen(false)}
                       >
                         Get Started
                       </Button>
                     </Link>
                   </>
                 )}
               </div>
             </div>
           </motion.div>
         )}
       </div>
     </motion.nav>
   );
 }