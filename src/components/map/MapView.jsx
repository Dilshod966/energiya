import { useEffect, useRef, useState } from "react";
import { Zap } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import {API} from "../../services/api"; // O'zingizning API axios instance'ingiz

import { useStation } from "../../context/StationContext";
import FlyToStation from "./FlyToStation";
import makeIcon from "./makeIcon";
import StatusBadge from "../ui/StatusBadge";

// Leaflet default icon muammosini tuzatish
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: "", iconUrl: "", shadowUrl: "" });

export default function MapView() {
  const { selected, setSelected, setSidebarOpen } = useStation();
  
  const [stations, setStations] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markerRefs = useRef({});
  const [mapType2, setMapType2] = useState("standard");
  const [loading, setLoading] = useState(true);

  const layers = {
    standard: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    sputnik: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  };

  // 1. Ma'lumotlarni serverdan olish
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        const res = await API.get("/transformator/all");
        setStations(res.data);
      } catch (err) {
        console.error("Xatolik transformatorlarni yuklashda:", err);
      } finally {
        setLoading(false);
        setMapLoaded(true);
      }
    };
    fetchStations();
    setSidebarOpen(true);
  }, [setSidebarOpen]);

  // Kategoriyalar (Legend uchun)
  const MAP_CATEGORIES = [
    { id: 'tet', label: 'TET Balansida', color: '#3b82f6' },
    { id: 'consumer', label: "Iste'molchi", color: '#ea580c' }
  ];

  if (loading || !mapLoaded) {
    return (
      <div className="flex-1 bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-slate-400 text-sm">Xarita yuklanmoqda…</p>
        </div>
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
        {/* Xarita turi tugmalari */}
        <div className="absolute top-3 right-3 z-[1001] flex flex-col gap-2">
          {Object.keys(layers).map((type) => (
            <button
              key={type}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMapType2(type);
              }}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-md border transition-all shadow-lg ${
                mapType2 === type
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-[#0f1829]/90 border-white/10 text-slate-300 hover:bg-slate-800 backdrop-blur-md"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <TileLayer
          url={layers[mapType2]}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {stations.map((station) => {
          // 'hisob' ustuniga qarab rangni belgilash
          const markerColor = station.hisob === "tet" ? "#3b82f6" : "#ea580c";

          return (
            <Marker
              key={station.id}
              position={[station.lat, station.lng]}
              icon={makeIcon(markerColor, "active")}
              ref={(ref) => { markerRefs.current[station.id] = ref; }}
              eventHandlers={{
                click: () => setSelected(station),
              }}
            >
              <Popup className="custom-popup">
                <div
                  className="bg-[#0f1829] rounded-lg p-3 min-w-[200px] cursor-pointer"
                  onClick={() => setSelected(station)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={16} style={{ color: markerColor }} />
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: markerColor }}
                    >
                      {station.hisob === "tet" ? "TET Balansida" : "ISTE'MOLCHI"}
                    </span>
                  </div>

                  <p className="font-bold text-white text-sm uppercase">
                    № {station.tp_raqami}
                  </p>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Liniya: <span className="text-slate-200">{station.parentName || "Noma'lum"}</span>
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Quvvat: <span className="text-slate-200">{station.quvvat} kVA</span>
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                    <StatusBadge status="active" />
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">YUKLAMA</span>
                      <span className="text-xs font-bold" style={{ color: markerColor }}>
                        {station.yuklama || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <FlyToStation station={selected} markerRefs={markerRefs} />
      </MapContainer>

      {/* ── Category Legend ── */}
      <div className="absolute bottom-6 left-4 bg-[#0a0f1a]/90 backdrop-blur-md border border-white/10 rounded-xl p-3 z-10 shadow-2xl">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">
          Kategoriyalar
        </p>
        <div className="space-y-2">
          {MAP_CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-[11px] font-medium text-slate-300">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Status Legend ── */}
      <div className="absolute bottom-6 left-44 bg-[#0a0f1a]/90 backdrop-blur-md border border-white/10 rounded-xl p-3 z-10 shadow-2xl">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">
          Holat
        </p>
        <div className="space-y-1.5">
          {[
            { color: "bg-emerald-400", label: "Faol" },
            { color: "bg-amber-400", label: "Ta'mirlash" },
            { color: "bg-red-500", label: "Qurilish" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="text-[11px] font-medium text-slate-300">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}