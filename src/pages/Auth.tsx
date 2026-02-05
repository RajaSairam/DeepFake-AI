 import { useState, useEffect } from "react";
 import { useNavigate, useSearchParams } from "react-router-dom";
 import { motion } from "framer-motion";
 import { Shield, Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { useToast } from "@/hooks/use-toast";
 import { useAuth } from "@/hooks/useAuth";
 import { z } from "zod";
 
 const authSchema = z.object({
   email: z.string().email("Please enter a valid email address"),
   password: z.string().min(6, "Password must be at least 6 characters"),
   fullName: z.string().min(2, "Name must be at least 2 characters").optional(),
 });
 
 export default function Auth() {
   const [searchParams] = useSearchParams();
   const [isSignUp, setIsSignUp] = useState(searchParams.get("signup") === "true");
   const [showPassword, setShowPassword] = useState(false);
   const [loading, setLoading] = useState(false);
   const [formData, setFormData] = useState({
     email: "",
     password: "",
     fullName: "",
   });
   const [errors, setErrors] = useState<Record<string, string>>({});
 
   const navigate = useNavigate();
   const { toast } = useToast();
   const { user, signUp, signIn } = useAuth();
 
   useEffect(() => {
     if (user) {
       navigate("/dashboard");
     }
   }, [user, navigate]);
 
   const validateForm = () => {
     try {
       if (isSignUp) {
         authSchema.parse(formData);
       } else {
         authSchema.omit({ fullName: true }).parse(formData);
       }
       setErrors({});
       return true;
     } catch (err) {
       if (err instanceof z.ZodError) {
         const newErrors: Record<string, string> = {};
         err.errors.forEach((error) => {
           if (error.path[0]) {
             newErrors[error.path[0] as string] = error.message;
           }
         });
         setErrors(newErrors);
       }
       return false;
     }
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
 
     if (!validateForm()) return;
 
     setLoading(true);
 
     try {
       if (isSignUp) {
         const { error } = await signUp(formData.email, formData.password, formData.fullName);
         if (error) {
           if (error.message.includes("already registered")) {
             toast({
               title: "Account exists",
               description: "This email is already registered. Please sign in instead.",
               variant: "destructive",
             });
           } else {
             toast({
               title: "Sign up failed",
               description: error.message,
               variant: "destructive",
             });
           }
         } else {
           toast({
             title: "Check your email",
             description: "We've sent you a confirmation link. Please verify your email to continue.",
           });
         }
       } else {
         const { error } = await signIn(formData.email, formData.password);
         if (error) {
           toast({
             title: "Sign in failed",
             description: error.message,
             variant: "destructive",
           });
         }
       }
     } catch (err) {
       toast({
         title: "Error",
         description: "An unexpected error occurred. Please try again.",
         variant: "destructive",
       });
     } finally {
       setLoading(false);
     }
   };
 
   return (
     <div className="min-h-screen flex items-center justify-center gradient-hero cyber-grid relative px-4">
       {/* Background effects */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div
           className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full opacity-30"
           style={{ background: "var(--gradient-glow)" }}
         />
       </div>
 
       <motion.div
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ duration: 0.5 }}
         className="w-full max-w-md relative z-10"
       >
         <div className="glass rounded-2xl p-8">
           {/* Header */}
           <div className="text-center mb-8">
             <div className="inline-flex p-3 rounded-xl gradient-primary mb-4">
               <Shield className="w-8 h-8 text-primary-foreground" />
             </div>
             <h1 className="text-2xl font-bold mb-2">
               {isSignUp ? "Create your account" : "Welcome back"}
             </h1>
             <p className="text-muted-foreground">
               {isSignUp
                 ? "Start protecting yourself from digital fraud"
                 : "Sign in to access your dashboard"}
             </p>
           </div>
 
           {/* Form */}
           <form onSubmit={handleSubmit} className="space-y-4">
             {isSignUp && (
               <div className="space-y-2">
                 <Label htmlFor="fullName">Full Name</Label>
                 <div className="relative">
                   <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input
                     id="fullName"
                     type="text"
                     placeholder="John Doe"
                     className="pl-10 bg-secondary border-border"
                     value={formData.fullName}
                     onChange={(e) =>
                       setFormData({ ...formData, fullName: e.target.value })
                     }
                   />
                 </div>
                 {errors.fullName && (
                   <p className="text-sm text-destructive">{errors.fullName}</p>
                 )}
               </div>
             )}
 
             <div className="space-y-2">
               <Label htmlFor="email">Email</Label>
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                 <Input
                   id="email"
                   type="email"
                   placeholder="you@example.com"
                   className="pl-10 bg-secondary border-border"
                   value={formData.email}
                   onChange={(e) =>
                     setFormData({ ...formData, email: e.target.value })
                   }
                 />
               </div>
               {errors.email && (
                 <p className="text-sm text-destructive">{errors.email}</p>
               )}
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="password">Password</Label>
               <div className="relative">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                 <Input
                   id="password"
                   type={showPassword ? "text" : "password"}
                   placeholder="••••••••"
                   className="pl-10 pr-10 bg-secondary border-border"
                   value={formData.password}
                   onChange={(e) =>
                     setFormData({ ...formData, password: e.target.value })
                   }
                 />
                 <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                 >
                   {showPassword ? (
                     <EyeOff className="w-4 h-4" />
                   ) : (
                     <Eye className="w-4 h-4" />
                   )}
                 </button>
               </div>
               {errors.password && (
                 <p className="text-sm text-destructive">{errors.password}</p>
               )}
             </div>
 
             <Button
               type="submit"
               variant="hero"
               size="lg"
               className="w-full"
               disabled={loading}
             >
               {loading ? (
                 <>
                   <Loader2 className="w-4 h-4 animate-spin" />
                   {isSignUp ? "Creating account..." : "Signing in..."}
                 </>
               ) : isSignUp ? (
                 "Create Account"
               ) : (
                 "Sign In"
               )}
             </Button>
           </form>
 
           {/* Toggle */}
           <div className="mt-6 text-center">
             <p className="text-muted-foreground">
               {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
               <button
                 type="button"
                 onClick={() => setIsSignUp(!isSignUp)}
                 className="text-primary hover:underline font-medium"
               >
                 {isSignUp ? "Sign in" : "Sign up"}
               </button>
             </p>
           </div>
         </div>
 
         {/* Back to home */}
         <div className="mt-6 text-center">
           <button
             onClick={() => navigate("/")}
             className="text-muted-foreground hover:text-foreground transition-colors text-sm"
           >
             ← Back to home
           </button>
         </div>
       </motion.div>
     </div>
   );
 }