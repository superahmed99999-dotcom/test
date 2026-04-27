import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2, RefreshCw, Download } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import * as XLSX from "xlsx";
import { format, subDays, subMonths, isAfter } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  const { data: issues, isLoading: isIssuesLoading, refetch } = trpc.admin.getAllIssues.useQuery(undefined, {
    enabled: !!user && user.role === "admin"
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  const stats = useMemo(() => {
    if (!issues) return { total: 0, solved: 0, inProgress: 0, pending: 0 };
    return {
      total: issues.length,
      solved: issues.filter(i => i.status === "resolved").length,
      inProgress: issues.filter(i => i.status === "in-progress").length,
      pending: issues.filter(i => i.status === "open").length,
    };
  }, [issues]);

  const areaData = useMemo(() => {
    if (!issues) return [];
    const counts: Record<string, number> = {};
    issues.forEach(i => {
      // Use address as area, or a default
      const area = i.address ? i.address.split(',')[0].trim() : "Unknown";
      counts[area] = (counts[area] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // top 5 areas
  }, [issues]);

  const statusData = useMemo(() => {
    return [
      { name: "Solved", value: stats.solved },
      { name: "In Progress", value: stats.inProgress },
      { name: "Pending", value: stats.pending },
    ].filter(d => d.value > 0);
  }, [stats]);

  const handleExport = (timeframe: "daily" | "monthly") => {
    if (!issues) return;

    const now = new Date();
    const cutoffDate = timeframe === "daily" ? subDays(now, 1) : subMonths(now, 1);

    const filteredIssues = issues.filter(i => {
      const issueDate = new Date(i.createdAt);
      return isAfter(issueDate, cutoffDate);
    });

    const exportData = filteredIssues.map(i => ({
      "User Name": i.userName || "Anonymous",
      "User Email": i.userEmail || "N/A",
      "Issue Category": i.category,
      "Issue Details": i.description,
      "Location/Coordinates": `${i.address} (${i.latitude}, ${i.longitude})`,
      "Status": i.status,
      "Date Submitted": format(new Date(i.createdAt), "yyyy-MM-dd HH:mm:ss")
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Issues Report");
    XLSX.writeFile(workbook, `civicpulse_report_${timeframe}_${format(now, "yyyyMMdd")}.xlsx`);
  };

  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage issues, users, and system statistics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()} disabled={isIssuesLoading}>
              {isIssuesLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Sync/Update Data
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleExport("daily")}>Daily Report</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("monthly")}>Monthly Report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Solved Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.solved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">In-Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Charts */}
          <Card>
            <CardHeader>
              <CardTitle>Reports by Geographic Area</CardTitle>
              <CardDescription>Top 5 areas with most reported issues</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {areaData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={areaData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Issue Status Distribution</CardTitle>
              <CardDescription>Breakdown of all issues by current status</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Issue Feed Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Live Issue Feed
            </CardTitle>
            <CardDescription>Real-time feed of all reported community issues</CardDescription>
          </CardHeader>
          <CardContent>
            {isIssuesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : issues && issues.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {issues.map((issue) => (
                  <div key={issue.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-primary">{issue.userName || "Anonymous Reporter"}</span>
                        <Badge variant="outline">{issue.category}</Badge>
                      </div>
                      <p className="font-medium text-sm mb-1">{issue.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{issue.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 min-w-[120px]">
                      <Badge variant={issue.status === 'resolved' ? 'default' : issue.status === 'in-progress' ? 'secondary' : 'destructive'}>
                        {issue.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(issue.createdAt), "MMM d, yyyy HH:mm")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No issues reported yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
