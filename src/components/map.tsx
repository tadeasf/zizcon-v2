"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface IconDefault extends L.Icon {
  _getIconUrl?: string;
}

// Workaround for Leaflet marker icons with Next.js
const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as IconDefault)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  });
};

// Coordinates for Nad Zlíchovem 255, 152 00 Praha 5
const OFFICE_POSITION: [number, number] = [50.0478831, 14.4079331];

export function Map() {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  return (
    <MapContainer 
      center={OFFICE_POSITION} 
      zoom={16} 
      scrollWheelZoom={false}
      style={{ height: "400px", width: "100%" }}
      className="rounded-lg border"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={OFFICE_POSITION} icon={icon}>
        <Popup>
          <div className="p-2">
            <h3 className="font-medium mb-2">Zizcon Office</h3>
            <p className="text-sm">
              Nad Zlíchovem 255<br />
              152 00 Praha 5
            </p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
} 