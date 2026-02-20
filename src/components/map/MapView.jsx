import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

import { useStation } from "../../context/StationContext";
import FlyToStation   from "./FlyToStation";
import makeIcon       from "./makeIcon";
import StatusBadge    from "../ui/StatusBadge";

// Fix Leaflet default icon path issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: "", iconUrl: "", shadowUrl: "" });

export default function MapView() {
  const { stations, selected, setSelected, CATEGORIES } = useStation();
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => { setMapLoaded(true); }, []);

  if (!mapLoaded) {
    return (
      <div className="flex-1 bg-[#0a0f1a] flex items-center justify-center">
        <p className="text-slate-400 text-sm">Xarita yuklanmoqda…</p>
      </div>
    );
  }

  return (
    <div className="flex-1 relative">
      {/* ── Leaflet Map ── */}
      <MapContainer
        center={[41.42, 60.52]}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap &copy; CARTO"
        />

        {stations.map((station) => {
          const cat = CATEGORIES.find((c) => c.id === station.category);
          return (
            <Marker
              key={station.id}
              position={[station.lat, station.lng]}
              icon={makeIcon(cat.color, station.status)}
              eventHandlers={{ click: () => setSelected(station) }}
            >
              <Popup className="custom-popup">
                <div
                  className="bg-[#0f1829] rounded-lg p-3 min-w-[200px] cursor-pointer"
                  onClick={() => setSelected(station)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <cat.icon size={12} style={{ color: cat.color }} />
                    <span className="text-xs" style={{ color: cat.color }}>
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
      <div className="absolute bottom-6 left-44 bg-[#0a0f1a]/90 backdrop-blur-sm border border-white/10 rounded-xl p-3 z-10">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
          Holat
        </p>
        {[
          ["bg-emerald-400", "Faol"],
          ["bg-amber-400",   "Ta'mirlash"],
          ["bg-blue-400",    "Qurilish"],
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
