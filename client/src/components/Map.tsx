import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";
import type { Issue } from "@shared/types";

// Fix for default marker icons in Leaflet with Webpack/Vite
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIconRetina from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for different statuses
const createStatusIcon = (color: string) => {
  return new L.DivIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
};

const statusIcons = {
  open: createStatusIcon("#3b82f6"), // blue
  "in-progress": createStatusIcon("#f59e0b"), // amber
  resolved: createStatusIcon("#10b981"), // green
  default: createStatusIcon("#6b7280"), // gray
};

interface MapEventsProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  onMapReady?: (map: L.Map) => void;
}

function MapEvents({ onLocationSelect, onMapReady }: MapEventsProps) {
  const map = useMap();

  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });

  return null;
}

// Component to update map center/zoom when props change
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

interface MapViewProps {
  className?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  onMapReady?: (map: any) => void; // Keep for compatibility
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  issues?: Issue[];
  selectedLocation?: { lat: number; lng: number } | null;
  onIssueClick?: (issue: Issue) => void;
}

export function MapView({
  className,
  initialCenter = { lat: 37.7749, lng: -122.4194 },
  initialZoom = 12,
  onMapReady,
  onLocationSelect,
  issues = [],
  selectedLocation,
  onIssueClick,
}: MapViewProps) {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  return (
    <div className={cn("w-full h-[500px] rounded-lg overflow-hidden border border-slate-200 shadow-sm", className)}>
      <MapContainer
        center={[initialCenter.lat, initialCenter.lng]}
        zoom={initialZoom}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEvents 
          onLocationSelect={onLocationSelect} 
          onMapReady={(map) => {
            setMapInstance(map);
            if (onMapReady) onMapReady(map);
          }} 
        />

        <MapUpdater center={[initialCenter.lat, initialCenter.lng]} zoom={initialZoom} />

        {/* Render markers for issues */}
        {issues.map((issue) => (
          <Marker
            key={issue.id}
            position={[parseFloat(issue.latitude), parseFloat(issue.longitude)]}
            icon={statusIcons[issue.status as keyof typeof statusIcons] || statusIcons.default}
            eventHandlers={{
              click: () => {
                if (onIssueClick) onIssueClick(issue);
              },
            }}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-sm">{issue.title}</h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{issue.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render marker for selected location (Submit Issue) */}
        {selectedLocation && (
          <Marker 
            position={[selectedLocation.lat, selectedLocation.lng]} 
            icon={DefaultIcon}
          />
        )}
      </MapContainer>
    </div>
  );
}
