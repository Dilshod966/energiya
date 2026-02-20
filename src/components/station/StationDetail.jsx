import { X, Calendar, MapPin, Zap, Activity, Gauge } from "lucide-react";
import { useStation } from "../../context/StationContext";
import StatusBadge from "../ui/StatusBadge";
import LoadRing    from "../ui/LoadRing";

export default function StationDetail({ station, onClose }) {
  const { CATEGORIES } = useStation();
  const cat = CATEGORIES.find((c) => c.id === station.category);

  return (
    <div className="flex flex-col h-full">
      {/* ── Header image ── */}
      <div className="relative h-44 flex-shrink-0 overflow-hidden">
        <img
          src={station.image}
          alt={station.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-[#0a0f1a]/40 to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <X size={14} />
        </button>

        <div className="absolute bottom-3 left-4 right-4">
          <div className="flex items-center gap-2 mb-1">
            <cat.icon size={14} style={{ color: cat.color }} />
            <span className="text-xs font-medium" style={{ color: cat.color }}>
              {cat.label}
            </span>
          </div>
          <h2 className="text-white font-bold text-lg leading-tight">{station.name}</h2>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Status + date */}
        <div className="flex items-center justify-between">
          <StatusBadge status={station.status} />
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar size={11} />
            <span>{new Date(station.commissioned).toLocaleDateString("uz-UZ")}</span>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Kuchlanish", value: station.voltage,   icon: Zap,      color: "#f59e0b" },
            { label: "Quvvat",     value: station.capacity,  icon: Activity, color: "#10b981" },
            { label: "Yuklama",    value: `${station.load}%`, icon: Gauge,   color: cat.color },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[#0f1829] rounded-xl p-3 border border-white/5 text-center"
            >
              <s.icon size={14} style={{ color: s.color }} className="mx-auto mb-1" />
              <div className="text-white font-bold text-sm">{s.value}</div>
              <div className="text-slate-500 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Load ring + temperature */}
        <div className="flex items-center justify-around bg-[#0f1829] rounded-xl p-4 border border-white/5">
          <div className="text-center">
            <LoadRing value={station.load} color={cat.color} />
            <p className="text-slate-400 text-xs mt-1">Yuklama</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-[#1e293b] border-4 border-orange-500/30 flex items-center justify-center">
              <div>
                <div className="text-white font-bold text-sm">{station.temp}°</div>
                <div className="text-slate-500 text-xs">C</div>
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-1">Temperatura</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
            Tavsif
          </p>
          <p className="text-slate-300 text-sm leading-relaxed">{station.description}</p>
        </div>

        {/* Technical specs */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
            Texnik Ma'lumotlar
          </p>
          <div className="space-y-2">
            {Object.entries(station.specs).map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-slate-400 text-sm capitalize">{k}</span>
                <span className="text-white text-sm font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Coordinates */}
        <div className="bg-[#0f1829] rounded-xl p-3 border border-white/5">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <MapPin size={11} />
            Koordinatalar
          </div>
          <p className="text-slate-300 text-sm font-mono">
            {station.lat.toFixed(4)}°N, {station.lng.toFixed(4)}°E
          </p>
        </div>
      </div>
    </div>
  );
}
