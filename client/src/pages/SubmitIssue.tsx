import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertCircle, ArrowLeft, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { MapView } from "@/components/Map";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

const INITIAL_CENTER = { lat: 30.0444, lng: 31.2357 };
const INITIAL_ZOOM = 14;

export default function SubmitIssue() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Roads");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const [isGeocoding, setIsGeocoding] = useState(false);

  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const createIssueMutation = trpc.issues.create.useMutation();

  const categories = ["Roads", "Water", "Electricity", "Sanitation", "Other"];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setImageUrl(data.url);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      setAddress(data.display_name || "Unknown Location");
    } catch (error) {
      console.error("Geocoding error:", error);
      setAddress("Unknown Location");
    } finally {
      setIsGeocoding(false);
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
        imageUrl: imageUrl || undefined,
      });

      toast.success("Issue reported successfully!");
      navigate("/map");
    } catch (error) {
      console.error("Failed to create issue:", error);
      toast.error("Failed to report issue. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header with Glassmorphism */}
      <div className="sticky top-0 z-[1001] bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/map")}
              className="rounded-full hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Report an Issue</h1>
              <p className="text-xs text-slate-500 font-medium">Help us improve your community</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1">
            Step 1: Locate Issue
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: Map and Info */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden ring-1 ring-slate-200">
              <CardContent className="p-0">
                <div className="relative h-[450px] lg:h-[calc(100vh-280px)] min-h-[400px]">
                  <MapView
                    className="w-full h-full"
                    initialCenter={INITIAL_CENTER}
                    initialZoom={INITIAL_ZOOM}
                    onMapReady={handleMapReady}
                    selectedLocation={selectedLocation}
                    onLocationSelect={handleLocationSelect}
                    onLocationFound={(lat, lng) => handleLocationSelect({ lat, lng })}
                  />
                  
                  {/* Floating Overlay for status */}
                  {!selectedLocation && (
                    <div className="absolute inset-x-0 bottom-8 flex justify-center z-[1000] px-4">
                      <div className="bg-slate-900/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
                        <MapPin className="h-5 w-5 text-blue-400" />
                        <span className="text-sm font-medium">Tap on the map to pin the issue location</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Address Information Card */}
            <div className={`transition-all duration-500 transform ${selectedLocation ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
              <Card className="border-none shadow-lg shadow-slate-200/40 rounded-2xl bg-gradient-to-br from-white to-slate-50 ring-1 ring-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-200">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900">Selected Location</h3>
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">
                          Verified
                        </Badge>
                      </div>
                      <p className="text-slate-600 mt-2 text-sm leading-relaxed">{isGeocoding ? "Fetching accurate address..." : (address || "Location selected")}</p>
                      <div className="flex gap-4 mt-3 text-[10px] font-mono text-slate-400">
                        <span>LAT: {selectedLocation?.lat.toFixed(6)}</span>
                        <span>LNG: {selectedLocation?.lng.toFixed(6)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Side: Form Details */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-3xl bg-white ring-1 ring-slate-100 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500" />
              <CardContent className="p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-900">Issue Details</h2>
                  <p className="text-slate-400 text-sm mt-1">Provide information about the problem</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                      Issue Title
                    </label>
                    <Input
                      placeholder="e.g., Street Light Not Working"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="rounded-xl border-slate-200 focus:ring-blue-500 h-12 transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-12 px-4 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                      Severity Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["low", "medium", "high"] as const).map((sev) => (
                        <button
                          key={sev}
                          type="button"
                          onClick={() => setSeverity(sev)}
                          className={`py-3 rounded-xl font-bold text-xs transition-all duration-300 border ${
                            severity === sev
                              ? sev === "low"
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm"
                                : sev === "medium"
                                ? "bg-amber-50 border-amber-200 text-amber-700 shadow-sm"
                                : "bg-rose-50 border-rose-200 text-rose-700 shadow-sm"
                              : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                          }`}
                        >
                          {sev.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                      Evidence Photo
                    </label>
                    <div className="flex flex-col gap-4">
                      {imageUrl ? (
                        <div className="relative group rounded-2xl overflow-hidden border-2 border-blue-100 aspect-video bg-slate-50">
                          <img 
                            src={imageUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                          />
                          <button
                            type="button"
                            onClick={() => setImageUrl("")}
                            className="absolute top-2 right-2 bg-white/90 backdrop-blur shadow-lg p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          >
                            <AlertCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${isUploading ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 hover:bg-blue-50/30 hover:border-blue-300'}`}>
                          {isUploading ? (
                            <div className="flex flex-col items-center gap-2">
                              <div className="h-8 w-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                              <span className="text-xs font-bold text-slate-400">UPLOADING...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Plus className="w-8 h-8 text-blue-500 mb-2" />
                              <p className="text-sm font-bold text-slate-600">Click to upload photo</p>
                              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">PNG, JPG or WEBP (MAX. 5MB)</p>
                            </div>
                          )}
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                      Description
                    </label>
                    <Textarea
                      placeholder="Give us more context about the situation..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="rounded-xl border-slate-200 focus:ring-blue-500 transition-all min-h-[120px] resize-none"
                      required
                    />
                  </div>

                  {!selectedLocation && (
                    <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex gap-4 animate-pulse">
                      <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                      <p className="text-xs text-amber-700 font-medium leading-relaxed">
                        The submit button will be enabled once you select a location on the map.
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={!selectedLocation || createIssueMutation.isPending}
                    className={`w-full h-14 rounded-2xl font-black text-lg shadow-xl transition-all duration-500 ${
                      !selectedLocation 
                      ? "bg-slate-200 text-slate-400" 
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 hover:translate-y-[-2px]"
                    }`}
                  >
                    {createIssueMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        SUBMITTING...
                      </div>
                    ) : "SUBMIT REPORT"}
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
