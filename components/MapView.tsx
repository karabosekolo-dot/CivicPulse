
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CivicIssue, IssueStatus } from '../types';

// Fix for default marker icon in Leaflet + React
// @ts-ignore
import icon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  issues: CivicIssue[];
  onIssueClick: (issue: CivicIssue) => void;
}

const statusColors = {
  [IssueStatus.OPEN]: '#eab308', // yellow-500
  [IssueStatus.INVESTIGATING]: '#3b82f6', // blue-500
  [IssueStatus.IN_PROGRESS]: '#6366f1', // indigo-500
  [IssueStatus.RESOLVED]: '#22c55e', // green-500
  [IssueStatus.CLOSED]: '#64748b', // slate-500
};

// Component to handle map centering when issues change
const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const MapView: React.FC<MapViewProps> = ({ issues, onIssueClick }) => {
  // Default center (San Francisco as per initial issues)
  const defaultCenter: [number, number] = [37.7749, -122.4194];
  
  // Calculate center based on issues if any exist
  const center: [number, number] = issues.length > 0 
    ? [issues[0].location.lat, issues[0].location.lng]
    : defaultCenter;

  return (
    <div className="h-[600px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50 relative z-0">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} zoom={13} />
        {issues.map(issue => (
          <Marker 
            key={issue.id} 
            position={[issue.location.lat, issue.location.lng]}
            eventHandlers={{
              click: () => {
                // We can optionally do something here, 
                // but the Popup button is more explicit
              },
            }}
          >
            <Popup>
              <div className="p-1 max-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: statusColors[issue.status] }}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {issue.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1 leading-tight">{issue.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2 mb-3">{issue.description}</p>
                <button 
                  onClick={() => onIssueClick(issue)}
                  className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-200 z-[1000]">
        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Map Legend</h5>
        <div className="space-y-1.5">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] font-bold text-slate-600">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
