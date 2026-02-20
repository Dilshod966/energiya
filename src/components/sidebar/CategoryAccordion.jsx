import { ChevronRight, ChevronDown } from "lucide-react";
import { useStation } from "../../context/StationContext";
import StationCard    from "../station/StationCard";

export default function CategoryAccordion({ category, stations }) {
  const { expandedCategories, toggleCategory } = useStation();
  const isOpen = !!expandedCategories[category.id];

  return (
    <div>
      {/* ── Accordion header ── */}
      <button
        onClick={() => toggleCategory(category.id)}
        className="w-full flex items-center justify-between px-4 py-3
          hover:bg-white/5 transition-colors border-b border-white/5"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: category.color + "20",
              border: `1px solid ${category.color}30`,
            }}
          >
            <category.icon size={13} style={{ color: category.color }} />
          </div>
          <span className="text-sm font-medium text-slate-200">{category.label}</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ color: category.color, backgroundColor: category.color + "15" }}
          >
            {stations.length}
          </span>
          {isOpen
            ? <ChevronDown  size={12} className="text-slate-500" />
            : <ChevronRight size={12} className="text-slate-500" />
          }
        </div>
      </button>

      {/* ── Station rows ── */}
      {isOpen && stations.map((station) => (
        <StationCard
          key={station.id}
          station={station}
          categoryColor={category.color}
        />
      ))}
    </div>
  );
}
