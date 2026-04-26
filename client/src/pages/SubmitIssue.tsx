import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertCircle, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { MapView } from "@/components/Map";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

export default function SubmitIssue() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Roads");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");

  const createIssueMutation = trpc.issues.create.useMutation();

  const categories = ["Roads", "Water", "Electricity", "Sanitation", "Other"];

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      setAddress(data.display_name || "Unknown Location");
    } catch (error) {
      console.error("Geocoding error:", error);
      setAddress("Unknown Location");
    }
  };

  const handleLocationSelect = useCallback(async (location: { lat: number; lng: number }) => {
    setSelectedLocation(location);
    await reverseGeocode(location.lat, location.lng);
  }, []);

  const handleMapReady = useCallback((map: any) => {
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          if (map.setView) {
            map.setView([userLocation.lat, userLocation.lng], 14);
          }
          
          // Auto-select user's location
          handleLocationSelect(userLocation);
        },
        (error) => {
          console.warn("Geolocation error:", error);
        }
      );
    }
  }, [handleLocationSelect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please log in to report an issue");
      return;
    }

    if (!selectedLocation) {
      toast.error("Please select a location on the map");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    try {
      await createIssueMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        category,
        severity,
        address: address.trim() || "Unknown Location",
        latitude: selectedLocation.lat.toString(),
        longitude: selectedLocation.lng.toString(),
      });

      toast.success("Issue reported successfully!");
      navigate("/map");
    } catch (error) {
      console.error("Failed to create issue:", error);
      toast.error("Failed to report issue. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/map")}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Report an Issue</h1>
          <p className="text-slate-600 mt-2">
            Help us improve your community by reporting civic issues. Click on the map to select a location.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="md:col-span-2">
            <Card className="border-none bg-white overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <MapView
                    className="w-full h-96"
                    initialCenter={{ lat: 40.7128, lng: -74.0060 }}
                    initialZoom={14}
                    onMapReady={handleMapReady}
                    selectedLocation={selectedLocation}
                    onLocationSelect={handleLocationSelect}
                  />
                  <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 border border-slate-200">
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedLocation
                        ? `📍 Location Selected: ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`
                        : "Click on the map to select a location"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedLocation && address && (
              <Card className="border-none bg-white mt-4">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-900">Selected Address</p>
                      <p className="text-sm text-slate-600 mt-1">{address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Form Section */}
          <div>
            <Card className="border-none bg-white sticky top-20">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Issue Details</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-900 block mb-2">
                      Title *
                    </label>
                    <Input
                      placeholder="e.g., Large pothole on Main St"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900 block mb-2">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900 block mb-2">
                      Severity *
                    </label>
                    <div className="flex gap-2">
                      {(["low", "medium", "high"] as const).map((sev) => (
                        <button
                          key={sev}
                          type="button"
                          onClick={() => setSeverity(sev)}
                          className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-colors ${
                            severity === sev
                              ? sev === "low"
                                ? "bg-green-100 text-green-800"
                                : sev === "medium"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {sev.charAt(0).toUpperCase() + sev.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-900 block mb-2">
                      Description *
                    </label>
                    <Textarea
                      placeholder="Describe the issue in detail..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  {!selectedLocation && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800">
                        Please select a location on the map to continue.
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={!selectedLocation || createIssueMutation.isPending}
                    className="w-full"
                  >
                    {createIssueMutation.isPending ? "Submitting..." : "Report Issue"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
