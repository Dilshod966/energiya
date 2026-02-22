import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

import { useStation } from "../../context/StationContext";
import FlyToStation from "./FlyToStation";
import makeIcon from "./makeIcon";
import StatusBadge from "../ui/StatusBadge";

// Fix Leaflet default icon path issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: "", iconUrl: "", shadowUrl: "" });

export default function MapView() {
  const { stations, selected, setSelected, CATEGORIES } = useStation();
  
  // 1. Barcha hooklarni shartlardan (return) tepaga chiqaramiz
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapType2, setMapType2] = useState("standard");

  const layers = {
    standard: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    sputnik: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  };

  useEffect(() => {
    setMapLoaded(true);
  }, []);

  // 2. Shartli return (Loading) hooklardan pastda bo'lishi kerak
  if (!mapLoaded) {
    return (
      <div className="flex-1 bg-[#0a0f1a] flex items-center justify-center">
        <p className="text-slate-400 text-sm">Xarita yuklanmoqda…</p>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      <MapContainer
        center={[41.35, 60.58]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
        zoomControl={false}
      >
        {/* Tugmalar konteyneri - z-[1001] qildik */}
        <div className="absolute top-3 right-3 z-[1001] flex flex-col gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMapType2("standard");
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-all ${
              mapType2 === "standard" 
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
              setMapType2("dark");
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-all ${
              mapType2 === "dark" 
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
              setMapType2("sputnik");
            }}
            className={`px-3 py-1.5 text-xs font-bold rounded-md border transition-all ${
              mapType2 === "sputnik" 
                ? "bg-blue-600 border-blue-500 text-white" 
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Sputnik
          </button>
        </div>

        <TileLayer
          url={layers[mapType2]}
          attribution="&copy; OpenStreetMap &copy; CARTO"
        />

        {stations.map((station) => {
          const cat = CATEGORIES.find((c) => c.id === station.category);
          if (!cat) return null; // Kategoriya topilmasa xatolik bermasligi uchun
          
          return (
            <Marker
              key={station.id}
              position={[station.lat, station.lng]}
              icon={makeIcon(
                station.status === 'active' ? cat.color : (station.status === "maintenance" ? cat.accent[0] : cat.accent[1]), 
                station.status
              )}
              eventHandlers={{ click: () => setSelected(station) }}
            >
              <Popup className="custom-popup">
                <div
                  className="bg-[#0f1829] rounded-lg p-3 min-w-[200px] cursor-pointer"
                  onClick={() => setSelected(station)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <cat.icon size={20} style={{ color: cat.color }} />
                    <span className="text-xs font-bold" style={{ color: cat.color }}>
                      {cat.label}
                    </span>
                  </div>
                  <p className="font-bold text-white text-sm">{station.name}</p>
                  <p className="text-slate-400 text-xs mt-1">
                    {station.voltage} · {station.capacity}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <StatusBadge status={station.status} />
                    <span className="text-xs font-bold" style={{ color: cat.color }}>
                      {station.load}% yuklama
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {selected && <FlyToStation station={selected} />}
      </MapContainer>

      {/* ── Category Legend ── */}
      <div className="absolute bottom-6 left-4 bg-[#0a0f1a]/90 backdrop-blur-sm border border-white/10 rounded-xl p-3 z-10">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
          Kategoriyalar
        </p>
        <div className="space-y-1.5">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="text-xs text-slate-300">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Status Legend ── */}
      <div className="absolute bottom-6 left-48 bg-[#0a0f1a]/90 backdrop-blur-sm border border-white/10 rounded-xl p-3 z-10">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
          Holat
        </p>
        {[
          ["bg-emerald-400", "Faol"],
          ["bg-amber-400",   "Ta'mirlash"],
          ["bg-red-500",    "Qurilish"],
        ].map(([cls, lbl]) => (
          <div key={lbl} className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${cls}`} />
            <span className="text-xs text-slate-300">{lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}