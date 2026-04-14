import React, { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Layers, PlusCircle } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import IssueCard from "@/components/IssueCard";
import { MapView } from "@/components/Map";
import type { Issue } from "@shared/types";

export default function MapPage() {
  const { data: issues = [] } = trpc.issues.list.useQuery({});
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "in-progress" | "resolved">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || issue.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = Array.from(new Set(issues.map((i) => i.category)));

  const getMarkerColor = (status: string) => {
    switch (status) {
      case "open":
        return "#3b82f6"; // blue
      case "in-progress":
        return "#f59e0b"; // amber
      case "resolved":
        return "#10b981"; // green
      default:
        return "#6b7280"; // gray
    }
  };

  const handleMapReady = useCallback((map: google.maps.Map) => {
    // Create markers for all filtered issues
    filteredIssues.forEach((issue) => {
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: parseFloat(issue.latitude), lng: parseFloat(issue.longitude) },
        title: issue.title,
      });

      // Add click listener to marker
      marker.addListener("click", () => {
        setSelectedIssue(issue);
      });
    });

    // Fit bounds to show all markers
    if (filteredIssues.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      filteredIssues.forEach((issue) => {
        bounds.extend(new google.maps.LatLng(parseFloat(issue.latitude), parseFloat(issue.longitude)));
      });
      map.fitBounds(bounds);
    }
  }, [filteredIssues]);

  return (
    <div className="relative flex flex-col md:flex-row overflow-hidden h-[calc(100vh-4rem)]">
      {/* Sidebar / Filter Panel */}
      <div className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 z-10 flex flex-col h-[40vh] md:h-full">
        <div className="p-4 border-b border-slate-200 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full bg-slate-50 border-none focus-visible:ring-2"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="flex-1 px-3 py-2 text-xs font-bold rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 px-3 py-2 text-xs font-bold rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-1">
            Nearby Issues ({filteredIssues.length})
          </h3>
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                className="cursor-pointer"
              >
                <IssueCard issue={issue} isSelected={selectedIssue?.id === issue.id} />
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-500 text-sm">No issues found</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <Link href="/submit">
            <Button className="w-full gap-2 rounded-full font-bold shadow-lg shadow-primary/20">
              <PlusCircle className="h-4 w-4" />
              Report Issue Here
            </Button>
          </Link>
        </div>
      </div>

      {/* Map Implementation */}
      <div className="flex-1 relative">
        <MapView
          className="w-full h-full"
          initialCenter={filteredIssues.length > 0 ? { lat: parseFloat(filteredIssues[0].latitude), lng: parseFloat(filteredIssues[0].longitude) } : { lat: 40.7128, lng: -74.0060 }}
          initialZoom={14}
          onMapReady={handleMapReady}
        />

        {/* Issue Info Popup */}
        {selectedIssue && (
          <div className="absolute bottom-4 left-4 md:left-auto md:right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm border border-slate-200 z-20">
            <h3 className="font-bold text-slate-900 mb-2">{selectedIssue.title}</h3>
            <p className="text-sm text-slate-600 mb-3 line-clamp-2">{selectedIssue.description}</p>
            <Link href={`/issues/${selectedIssue.id}`}>
              <Button size="sm" className="w-full rounded-full">
                View Details
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
