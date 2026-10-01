import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Compass, MapPin, Navigation, Crosshair } from "lucide-react";

// Default coordinates for Philippine cities
export const PHILIPPINE_CITY_COORDS = {
  "Quezon City": [14.6507, 121.0494],
  "Manila": [14.5995, 120.9842],
  "Makati": [14.5547, 121.0244],
  "Taguig (BGC)": [14.5484, 121.0504],
  "Pasig": [14.5764, 121.0851],
  "Mandaluyong": [14.5794, 121.0359],
  "San Juan": [14.6019, 121.0355],
  "Parañaque": [14.4793, 121.0198],
  "Pasay": [14.5378, 120.9993],
  "Caloocan": [14.6495, 120.9822],
  "Cebu City": [10.3157, 123.8854],
  "Davao City": [7.1907, 125.4553],
  "Baguio": [16.4023, 120.5960],
  "Other": [14.5995, 120.9842],
};

// Create custom branded pin marker
function createBrandedPinIcon(title = "Property Location") {
  return L.divIcon({
    className: "mobin-custom-pin-marker",
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: grab;">
        <div style="
          background: #555100;
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(40, 21, 7, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            background: #ffffff;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
        <div style="
          width: 10px;
          height: 4px;
          background: rgba(0,0,0,0.25);
          border-radius: 50%;
          margin-top: 3px;
          filter: blur(1px);
        "></div>
      </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 38],
    popupAnchor: [0, -38],
  });
}

export default function PropertyMapPicker({
  city = "Quezon City",
  latitude,
  longitude,
  onLocationChange,
  propertyName = "",
  exactAddress = "",
}) {
  const mapElementRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const isFirstRender = useRef(true);

  const [isLocating, setIsLocating] = useState(false);
  const [currentCoords, setCurrentCoords] = useState({
    lat: Number(latitude) || PHILIPPINE_CITY_COORDS[city]?.[0] || 14.6507,
    lng: Number(longitude) || PHILIPPINE_CITY_COORDS[city]?.[1] || 121.0494,
  });

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapElementRef.current || mapInstanceRef.current) return;

    const initialLat = Number(latitude) || PHILIPPINE_CITY_COORDS[city]?.[0] || 14.6507;
    const initialLng = Number(longitude) || PHILIPPINE_CITY_COORDS[city]?.[1] || 121.0494;

    const map = L.map(mapElementRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      zoomControl: true,
      attributionControl: false,
    });
    mapInstanceRef.current = map;

    // OpenStreetMap standard tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Draggable Pin Marker
    const marker = L.marker([initialLat, initialLng], {
      draggable: true,
      icon: createBrandedPinIcon(propertyName),
    }).addTo(map);
    markerRef.current = marker;

    if (propertyName) {
      marker.bindPopup(`<b>${propertyName}</b><br/><span style="font-size:11px;color:#666">Drag pin to reposition</span>`);
    }

    // Handle Marker Drag
    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      const updatedLat = Number(pos.lat.toFixed(6));
      const updatedLng = Number(pos.lng.toFixed(6));
      setCurrentCoords({ lat: updatedLat, lng: updatedLng });
      if (onLocationChange) onLocationChange(updatedLat, updatedLng);
    });

    // Handle Map Click to place pin
    map.on("click", (e) => {
      const updatedLat = Number(e.latlng.lat.toFixed(6));
      const updatedLng = Number(e.latlng.lng.toFixed(6));
      marker.setLatLng([updatedLat, updatedLng]);
      setCurrentCoords({ lat: updatedLat, lng: updatedLng });
      if (onLocationChange) onLocationChange(updatedLat, updatedLng);
    });

    // Invalidate size to ensure full tile rendering after container layout
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Center map when City dropdown changes (unless initial render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const cityCoords = PHILIPPINE_CITY_COORDS[city];
    if (cityCoords && mapInstanceRef.current && markerRef.current) {
      const [newLat, newLng] = cityCoords;
      mapInstanceRef.current.flyTo([newLat, newLng], 14, { duration: 1 });
      markerRef.current.setLatLng([newLat, newLng]);
      setCurrentCoords({ lat: newLat, lng: newLng });
      if (onLocationChange) onLocationChange(newLat, newLng);
    }
  }, [city]);

  // 3. Keep marker synced if parent changes coordinates externally
  useEffect(() => {
    if (
      latitude &&
      longitude &&
      markerRef.current &&
      (Math.abs(markerRef.current.getLatLng().lat - latitude) > 0.0001 ||
        Math.abs(markerRef.current.getLatLng().lng - longitude) > 0.0001)
    ) {
      const lat = Number(latitude);
      const lng = Number(longitude);
      markerRef.current.setLatLng([lat, lng]);
      setCurrentCoords({ lat, lng });
      mapInstanceRef.current?.panTo([lat, lng]);
    }
  }, [latitude, longitude]);

  // 4. Pinpoint via Browser GPS Geolocation
  const handlePinpointGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const userLat = Number(pos.coords.latitude.toFixed(6));
        const userLng = Number(pos.coords.longitude.toFixed(6));

        setCurrentCoords({ lat: userLat, lng: userLng });
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([userLat, userLng], 16, { duration: 1.2 });
          markerRef.current.setLatLng([userLat, userLng]);
          markerRef.current.bindPopup("<b>📍 Current GPS Location</b>").openPopup();
        }
        if (onLocationChange) onLocationChange(userLat, userLng);
      },
      (err) => {
        setIsLocating(false);
        console.warn("Geolocation warning:", err);
        // Fallback to city coordinates
        const fallback = PHILIPPINE_CITY_COORDS[city] || [14.6507, 121.0494];
        if (mapInstanceRef.current) mapInstanceRef.current.flyTo(fallback, 15);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="map-mockup-frame" style={{ position: "relative", overflow: "hidden" }}>
      {/* Header Bar */}
      <div className="map-mockup-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>📍 Interactive Location Pin</span>
        <span style={{ fontSize: "11px", opacity: 0.85 }}>Drag pin or click map</span>
      </div>

      {/* Address display strip */}
      <div className="map-mockup-search" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", background: "#ffffff", padding: "8px 12px", borderBottom: "1px solid #e0d7cf" }}>
        <MapPin size={14} color="#555100" style={{ flexShrink: 0 }} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, fontWeight: 500 }}>
          {exactAddress ? `${exactAddress}, ${city}` : `Pinned in ${city}`}
        </span>
      </div>

      {/* Leaflet Live Map Viewport */}
      <div
        ref={mapElementRef}
        style={{
          width: "100%",
          height: "230px",
          background: "#f4ece2",
          zIndex: 1,
        }}
      />

      {/* GPS Location Button Floating on Bottom-Right */}
      <button
        type="button"
        className="btn-locate-me"
        onClick={handlePinpointGPS}
        disabled={isLocating}
        title="Center map on your physical GPS location"
        style={{
          position: "absolute",
          bottom: "40px",
          right: "12px",
          zIndex: 400,
          background: "#ffffff",
          border: "1px solid #cfc6bd",
          borderRadius: "8px",
          padding: "6px 12px",
          fontSize: "11.5px",
          fontWeight: 700,
          color: "#281507",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
        }}
      >
        <Crosshair size={13} color="#555100" />
        <span>{isLocating ? "Locating..." : "Use My GPS"}</span>
      </button>

      {/* Live Coordinates Footer */}
      <div
        style={{
          background: "#fbf7f2",
          borderTop: "1px solid #eee1d3",
          padding: "6px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "11px",
          color: "#6b5e52",
        }}
      >
        <span>
          Coordinates: <strong style={{ color: "#555100", fontFamily: "monospace" }}>{currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}</strong>
        </span>
        <span style={{ color: "#8a7e72" }}>OpenStreetMap (Free)</span>
      </div>
    </div>
  );
}
