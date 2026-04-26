import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ThumbsUp, Calendar, User, AlertCircle, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { MapView } from "@/components/Map";
import StatusBadge from "@/components/StatusBadge";
import CategoryBadge from "@/components/CategoryBadge";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function IssueDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const { data: issue, isLoading } = trpc.issues.getById.useQuery(Number(id));
  const upvoteMutation = trpc.issues.upvote.useMutation();

  const handleUpvote = async () => {
    if (!issue || hasUpvoted) return;

    if (!isAuthenticated) {
      toast.error("Please log in to upvote this issue");
      return;
    }

    try {
      await upvoteMutation.mutateAsync(issue.id);
      setHasUpvoted(true);
      toast.success("Vote recorded!");
    } catch (error: any) {
      console.error("Failed to upvote:", error);
      const errorMessage = error?.message || "Failed to upvote. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleMapReady = (map: any) => {
    if (issue) {
      const position: [number, number] = [parseFloat(issue.latitude), parseFloat(issue.longitude)];
      map.setView(position, 15);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading issue details...</p>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 font-medium mb-4">Issue not found</p>
          <Button onClick={() => navigate("/map")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Map
          </Button>
        </div>
      </div>
    );
  }

  const severityColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-amber-100 text-amber-800",
    high: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/map")}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Map
          </Button>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                {issue.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={issue.status} />
                <CategoryBadge category={issue.category} />
                <Badge className={severityColors[issue.severity as keyof typeof severityColors]}>
                  {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)} Severity
                </Badge>
              </div>
            </div>
            <Button
              onClick={handleUpvote}
              disabled={hasUpvoted || upvoteMutation.isPending}
              className="gap-2 whitespace-nowrap"
            >
              <ThumbsUp className="h-4 w-4" />
              Upvote ({issue.upvotes + (hasUpvoted ? 1 : 0)})
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            <Card className="border-none bg-white">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Description</h2>
                <p className="text-slate-600 leading-relaxed">{issue.description}</p>
              </CardContent>
            </Card>

            {/* Map */}
            <Card className="border-none bg-white overflow-hidden">
              <CardContent className="p-0">
                <MapView
                  className="w-full h-96"
                  initialCenter={{ lat: parseFloat(issue.latitude), lng: parseFloat(issue.longitude) }}
                  initialZoom={15}
                  onMapReady={handleMapReady}
                  issues={[issue]}
                />
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="border-none bg-white">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Location</h2>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-900">{issue.address}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Coordinates: {issue.latitude}, {issue.longitude}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details Card */}
            <Card className="border-none bg-white">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Details</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </p>
                    <p className="mt-1">
                      <StatusBadge status={issue.status} />
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Category
                    </p>
                    <p className="mt-1">
                      <CategoryBadge category={issue.category} />
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Severity
                    </p>
                    <p className="mt-1">
                      <Badge className={severityColors[issue.severity as keyof typeof severityColors]}>
                        {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Upvotes
                    </p>
                    <p className="mt-1 text-2xl font-bold text-primary">
                      {issue.upvotes + (hasUpvoted ? 1 : 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Card */}
            <Card className="border-none bg-white">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Timeline</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      Reported
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {new Date(issue.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      Last Updated
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {new Date(issue.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
