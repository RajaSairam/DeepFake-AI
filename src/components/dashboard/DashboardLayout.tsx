import { ReactNode, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  LayoutDashboard,
  Upload,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Upload, label: "New Scan", path: "/dashboard/scan" },
  { icon: History, label: "History", path: "/dashboard/history" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const adminItems = [
  { icon: Users, label: "Admin Panel", path: "/dashboard/admin" },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="flex items-center justify-between h-16 px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="p-2 rounded-lg gradient-primary">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">DeepFake</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 glass border-r border-border transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 mb-8 mt-2">
            <div className="p-2 rounded-lg gradient-primary">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">DeepFake</span>
          </Link>

          {/* Nav items */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}

            {/* Admin section */}
            <div className="pt-4 mt-4 border-t border-border">
              <p className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Admin
              </p>
              {adminItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User section */}
          <div className="border-t border-border pt-4">
            <div className="px-4 py-2">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Free Plan</p>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="p-6"
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}