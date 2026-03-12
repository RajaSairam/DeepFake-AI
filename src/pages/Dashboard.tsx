import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Scan, Shield, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentScans } from "@/components/dashboard/RecentScans";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ScanWithResult } from "@/lib/types";
import { dbGetScansByUser } from "@/lib/mockDb";

export default function Dashboard() {
  const { user } = useAuth();
  const [scans, setScans] = useState<ScanWithResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalScans: 0,
    threatsDetected: 0,
    safeContent: 0,
    avgRiskScore: 0,
  });

  useEffect(() => {
    if (!user) return;

    const data = dbGetScansByUser(user.id, 10);
    setScans(data);

    const allResults = data
      .filter((s) => s.scan_results && s.scan_results.length > 0)
      .map((s) => s.scan_results![0]);

    const threats = allResults.filter(
      (r) => r.verdict === "fake" || r.verdict === "suspicious"
    ).length;
    const safe = allResults.filter((r) => r.verdict === "real").length;
    const avgRisk =
      allResults.length > 0
        ? Math.round(
          allResults.reduce((sum, r) => sum + r.risk_score, 0) /
          allResults.length
        )
        : 0;

    setStats({
      totalScans: data.length,
      threatsDetected: threats,
      safeContent: safe,
      avgRiskScore: avgRisk,
    });

    setLoading(false);
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your security overview.
            </p>
          </div>
          <Link to="/dashboard/scan">
            <Button variant="hero">
              <Scan className="w-4 h-4" />
              New Scan
            </Button>
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Scan}
            label="Total Scans"
            value={stats.totalScans}
            variant="default"
          />
          <StatCard
            icon={AlertTriangle}
            label="Threats Detected"
            value={stats.threatsDetected}
            variant="danger"
          />
          <StatCard
            icon={CheckCircle}
            label="Safe Content"
            value={stats.safeContent}
            variant="success"
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Risk Score"
            value={`${stats.avgRiskScore}%`}
            variant={stats.avgRiskScore > 50 ? "warning" : "success"}
          />
        </div>

        {/* Recent scans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div className="glass rounded-xl p-8 text-center">
              <div className="animate-pulse">
                <div className="h-4 bg-secondary rounded w-1/4 mx-auto mb-4" />
                <div className="h-4 bg-secondary rounded w-1/2 mx-auto" />
              </div>
            </div>
          ) : (
            <RecentScans scans={scans} />
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}