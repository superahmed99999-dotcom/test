import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Users, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";

/**
 * Admin Dashboard - Restricted to admin users only
 * Displays management tools for issues, users, and system statistics
 */
export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect non-admins to home
  if (!loading && (!user || user.role !== "admin")) {
    setLocation("/");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage issues, users, and system settings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">856</div>
              <p className="text-xs text-muted-foreground mt-1">+5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Critical Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">42</div>
              <p className="text-xs text-muted-foreground mt-1">Require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">89%</div>
              <p className="text-xs text-muted-foreground mt-1">Resolution rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Critical Issues Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Critical Issues
              </CardTitle>
              <CardDescription>Issues marked as critical and hidden from public view</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Critical Issue #{i}</p>
                      <p className="text-xs text-muted-foreground">Location: Downtown Area</p>
                    </div>
                    <Badge variant="destructive">Critical</Badge>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                View All Critical Issues
              </Button>
            </CardContent>
          </Card>

          {/* Hidden Issues Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <EyeOff className="w-5 h-5" />
                Hidden Issues
              </CardTitle>
              <CardDescription>Issues hidden from public view for security or sensitivity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Hidden Issue #{i}</p>
                      <p className="text-xs text-muted-foreground">Risk Level: High</p>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline">
                Manage Hidden Issues
              </Button>
            </CardContent>
          </Card>

          {/* User Management Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Total Users</span>
                  <span className="font-medium">1,234</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Active This Month</span>
                  <span className="font-medium">856</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Admins</span>
                  <span className="font-medium">12</span>
                </div>
              </div>
              <Button className="w-full" variant="outline">
                Manage Users
              </Button>
            </CardContent>
          </Card>

          {/* Risk Detection Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                AI Risk Detection
              </CardTitle>
              <CardDescription>AI-powered issue risk assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Critical Risk Issues</span>
                  <span className="font-medium text-red-600">42</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>High Risk Issues</span>
                  <span className="font-medium text-orange-600">128</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Medium Risk Issues</span>
                  <span className="font-medium text-yellow-600">356</span>
                </div>
              </div>
              <Button className="w-full" variant="outline">
                View Risk Analysis
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Settings Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>Configure system-wide settings and features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start">
                Email Configuration
              </Button>
              <Button variant="outline" className="justify-start">
                AI Settings
              </Button>
              <Button variant="outline" className="justify-start">
                Notification Rules
              </Button>
              <Button variant="outline" className="justify-start">
                System Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
