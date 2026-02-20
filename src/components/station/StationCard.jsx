import { useStation } from "../../context/StationContext";

/**
 * A single station row rendered inside the sidebar category accordion.
 */
export default function StationCard({ station, categoryColor }) {
  const { selected, setSelected } = useStation();
  const isActive = selected?.id === station.id;

  return (
    <button
      onClick={() => setSelected(station)}
      className={`w-full flex items-start gap-3 px-4 py-3 border-b border-white/5 text-left
        transition-colors hover:bg-white/5 ${isActive ? "bg-white/8" : ""}`}
    >
      {/* Status dot */}
      <div className="flex-shrink-0 mt-1.5">
        <div
          className={`w-2 h-2 rounded-full ${
            station.status === "active"       ? "bg-emerald-400" :
            station.status === "maintenance"  ? "bg-amber-400"   :
                                                "bg-blue-400"
          }`}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200 font-medium leading-tight truncate">
          {station.name}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          {station.voltage} · {station.capacity}
        </p>
      </div>

      {/* Load */}
      <div className="flex-shrink-0 text-right">
        <p className="text-xs font-bold" style={{ color: categoryColor }}>
          {station.load}%
        </p>
        <p className="text-xs text-slate-600">yuklama</p>
      </div>
    </button>
  );
}
