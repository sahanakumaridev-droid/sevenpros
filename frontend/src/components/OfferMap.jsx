import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function OfferMap({ items, onOpen }) {
  const node = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (!node.current || mapRef.current) return undefined;
    const map = L.map(node.current, { scrollWheelZoom: false }).setView([32.8, -117.1], 9);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;
    if (layerRef.current) layerRef.current.remove();
    const layer = L.layerGroup().addTo(map);
    layerRef.current = layer;
    const points = items.filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng));
    points.forEach((item) => {
      const marker = L.circleMarker([item.lat, item.lng], {
        radius: 8,
        color: "#5b21b6",
        weight: 2,
        fillColor: "#7c3aed",
        fillOpacity: 0.95,
      });
      marker.bindPopup(`<strong>${item.name}</strong><br/>${item.city || ""}`);
      marker.on("click", () => onOpen(item));
      marker.addTo(layer);
    });
    if (points.length) {
      map.fitBounds(points.map((item) => [item.lat, item.lng]), { padding: [28, 28], maxZoom: 12 });
    }
    return undefined;
  }, [items, onOpen]);

  return <div ref={node} className="h-[520px] w-full overflow-hidden rounded-2xl border border-[#e7e2f5]" />;
}
