import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState } from "react";

// Marker ikonkasini to'g'irlash
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Qizil marker uchun CDN manzili (yoki o'zingizning qizil marker rasmingiz)
const redIconUrl = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png";

let RedIcon = L.icon({
  iconUrl: redIconUrl,
  shadowUrl: markerShadow,
  iconSize: [25, 41],    // O'lchami standart bilan bir xil
  iconAnchor: [12, 41],  // Markaziy nuqtasi
  popupAnchor: [1, -34], // Popup chiqish joyi
  shadowSize: [41, 41]   // Soya o'lchami
});

// Barcha markerlarni avtomatik qizil qilish uchun:
L.Marker.prototype.options.icon = RedIcon;
// Xaritada bosilgan joyni olish uchun komponent
function MapPicker({ onSelect }) {
  useMapEvents({
    click(e) {
      // JUDA MUHIM QISM: 
      // Agar bosilgan element 'button' bo'lsa yoki tugmaning ichidagi biror narsa bo'lsa,
      // funksiyani to'xtatamiz.
      if (e.originalEvent.target.closest('button')) {
        return;
      }
      
      // Aks holda koordinatalarni yangilaymiz
      onSelect(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6));
    },
  });
  return null;
}

const MapSection = ({ form, set }) => {
  const [mapType, setMapType] = useState("standard");

  const layers = {
    standard: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    sputnik: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  };

  return (
    <div className="col-span-2 mt-4">
      <div className="h-[450px] w-full rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl relative">
        <MapContainer
          center={[form.lat || 41.35, form.lng || 60.58]}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          {/* Tugmalar konteyneri */}
          <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
            <button
              type="button" // Form submit bo'lib ketmasligi uchun
              onClick={(e) => {
                e.stopPropagation();
                setMapType("standard");
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-all ${
                mapType === "standard" 
                  ? "bg-blue-600 border-blue-500 text-white" 
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Standart
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMapType("dark");
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-all ${
                mapType === "dark" 
                  ? "bg-blue-600 border-blue-500 text-white" 
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Dark
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMapType("sputnik");
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-all ${
                mapType === "sputnik" 
                  ? "bg-blue-600 border-blue-500 text-white" 
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Sputnik
            </button>
          </div>

          <TileLayer url={layers[mapType]} />

          {/* Tanlangan joyda marker ko'rsatish */}
          {form.lat && form.lng && (
            <Marker position={[parseFloat(form.lat), parseFloat(form.lng)]} icon={RedIcon} />
          )}

          {/* Klik hodisasini boshqarish */}
          <MapPicker
            onSelect={(lat, lng) => {
              set("lat", lat);
              set("lng", lng);
            }}
          />
        </MapContainer>
      </div>

      <div className="flex gap-6 mt-3 px-2 text-xs font-mono text-cyan-400">
        <p>Lat: {form.lat || "Tanlanmagan"}</p>
        <p>Lng: {form.lng || "Tanlanmagan"}</p>
      </div>
    </div>
  );
};

export default MapSection;