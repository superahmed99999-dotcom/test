import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import IssueCard from "@/components/IssueCard";
import { toast } from "sonner";

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  const { data: userIssues = [], refetch } = trpc.issues.getByUser.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const deleteIssueMutation = trpc.issues.delete.useMutation();

  const handleDelete = async (issueId: number) => {
    if (!confirm("Are you sure you want to delete this issue?")) return;

    try {
      await deleteIssueMutation.mutateAsync(issueId);
      toast.success("Issue deleted successfully");
      refetch();
    } catch (error) {
      console.error("Failed to delete issue:", error);
      toast.error("Failed to delete issue");
    }
  };

  const stats = {
    total: userIssues.length,
    open: userIssues.filter((i) => i.status === "open").length,
    inProgress: userIssues.filter((i) => i.status === "in-progress").length,
    resolved: userIssues.filter((i) => i.status === "resolved").length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">My Dashboard</h1>
              <p className="text-slate-600 mt-2">
                Track all the issues you've reported and their status.
              </p>
            </div>
            <Link href="/submit">
              <Button className="gap-2 whitespace-nowrap">
                <Plus className="h-4 w-4" />
                Report New Issue
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="border-none bg-white">
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 font-medium">Total Issues</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</p>
            </CardContent>
          </Card>

          <Card className="border-none bg-white">
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 font-medium">Open</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.open}</p>
            </CardContent>
          </Card>

          <Card className="border-none bg-white">
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 font-medium">In Progress</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">{stats.inProgress}</p>
            </CardContent>
          </Card>

          <Card className="border-none bg-white">
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 font-medium">Resolved</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.resolved}</p>
            </CardContent>
          </Card>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Your Issues</h2>

          {userIssues.length > 0 ? (
            <div className="space-y-4">
              {userIssues.map((issue) => (
                <div key={issue.id} className="relative">
                  <IssueCard issue={issue} />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Link href={`/issues/${issue.id}`}>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Edit2 className="h-3 w-3" />
                        View
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(issue.id)}
                      disabled={deleteIssueMutation.isPending}
                      className="gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-none bg-white">
              <CardContent className="p-12 text-center">
                <div className="text-slate-400 mb-4">
                  <svg
                    className="h-16 w-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No issues reported yet
                </h3>
                <p className="text-slate-600 mb-6">
                  Start by reporting your first civic issue to help improve your community.
                </p>
                <Link href="/submit">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Report Your First Issue
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
