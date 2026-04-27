import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Users, AlertTriangle, Eye, EyeOff, BarChart3, TrendingUp, Shield, Loader2, CalendarDays } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const { data: stats, isLoading: statsLoading } = trpc.admin.getStats.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const { data: hiddenIssues, isLoading: hiddenLoading } = trpc.admin.getHiddenIssues.useQuery({}, {
    enabled: !!user && user.role === "admin",
  });

  const { data: allIssues } = trpc.issues.list.useQuery({}, {
    enabled: !!user && user.role === "admin",
  });

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalIssues = stats?.totalIssues ?? 0;
  const todayIssues = stats?.todayIssues ?? 0;
  const totalUsers = stats?.totalUsers ?? 0;
  const openCount = stats?.byStatus?.["open"] ?? 0;
  const inProgressCount = stats?.byStatus?.["in-progress"] ?? 0;
  const resolvedCount = stats?.byStatus?.["resolved"] ?? 0;
  const resolvedRate = totalIssues > 0 ? Math.round((resolvedCount / totalIssues) * 100) : 0;
  const criticalCount = stats?.byRisk?.["critical"] ?? 0;
  const highCount = stats?.byRisk?.["high"] ?? 0;
  const mediumCount = stats?.byRisk?.["medium"] ?? 0;
  const lowCount = stats?.byRisk?.["low"] ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              <Shield className="inline h-8 w-8 mr-2 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Real-time overview of civic issues and platform health</p>
          </div>
          {statsLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-sm animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading stats...
            </div>
          )}
        </div>

        {/* Stats Grid - Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Issues</p>
                  <p className="text-4xl font-bold mt-1">{totalIssues}</p>
                </div>
                <BarChart3 className="h-10 w-10 text-blue-200 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Today's Issues</p>
                  <p className="text-4xl font-bold mt-1">{todayIssues}</p>
                </div>
                <CalendarDays className="h-10 w-10 text-green-200 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Users</p>
                  <p className="text-4xl font-bold mt-1">{totalUsers}</p>
                </div>
                <Users className="h-10 w-10 text-purple-200 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Resolution Rate</p>
                  <p className="text-4xl font-bold mt-1">{resolvedRate}%</p>
                </div>
                <TrendingUp className="h-10 w-10 text-emerald-200 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stage Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Open</p>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{openCount}</p>
              <p className="text-xs text-slate-400 mt-1">{totalIssues > 0 ? Math.round((openCount / totalIssues) * 100) : 0}% of total</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">In Progress</p>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{inProgressCount}</p>
              <p className="text-xs text-slate-400 mt-1">{totalIssues > 0 ? Math.round((inProgressCount / totalIssues) * 100) : 0}% of total</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Resolved</p>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{resolvedCount}</p>
              <p className="text-xs text-slate-400 mt-1">{totalIssues > 0 ? Math.round((resolvedCount / totalIssues) * 100) : 0}% of total</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Level Breakdown */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                AI Risk Level Breakdown
              </CardTitle>
              <CardDescription>Issues categorized by AI-detected risk</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="font-medium text-red-700 dark:text-red-300">Critical</span>
                  <Badge variant="destructive">{criticalCount}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <span className="font-medium text-orange-700 dark:text-orange-300">High</span>
                  <Badge className="bg-orange-500 hover:bg-orange-600">{highCount}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <span className="font-medium text-yellow-700 dark:text-yellow-300">Medium</span>
                  <Badge className="bg-yellow-500 hover:bg-yellow-600">{mediumCount}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <span className="font-medium text-green-700 dark:text-green-300">Low</span>
                  <Badge className="bg-green-500 hover:bg-green-600">{lowCount}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hidden Issues (Live) */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <EyeOff className="w-5 h-5" />
                Hidden Issues
              </CardTitle>
              <CardDescription>Issues flagged and hidden from the public</CardDescription>
            </CardHeader>
            <CardContent>
              {hiddenLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : (hiddenIssues && hiddenIssues.length > 0) ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {hiddenIssues.map((issue: any) => (
                    <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{issue.title}</p>
                        <p className="text-xs text-muted-foreground">{issue.category} - {issue.riskLevel}</p>
                      </div>
                      <Badge variant="outline">{issue.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-400 py-8">No hidden issues</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Issues */}
          <Card className="shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Recent Issues
              </CardTitle>
              <CardDescription>Latest reported civic issues</CardDescription>
            </CardHeader>
            <CardContent>
              {allIssues && allIssues.length > 0 ? (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {allIssues.slice(0, 10).map((issue: any) => (
                    <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{issue.title}</p>
                        <p className="text-xs text-muted-foreground">{issue.address} - {new Date(issue.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant={issue.severity === "high" ? "destructive" : issue.severity === "medium" ? "default" : "secondary"}>
                          {issue.severity}
                        </Badge>
                        <Badge variant="outline">{issue.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-400 py-8">No issues reported yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6 shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Link href="/settings">
                <Button variant="outline" className="w-full justify-start gap-2">
                  ⚙️ Settings
                </Button>
              </Link>
              <Link href="/map">
                <Button variant="outline" className="w-full justify-start gap-2">
                  🗺️ View Map
                </Button>
              </Link>
              <Link href="/submit">
                <Button variant="outline" className="w-full justify-start gap-2">
                  📝 Submit Issue
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full justify-start gap-2">
                  📊 User Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
