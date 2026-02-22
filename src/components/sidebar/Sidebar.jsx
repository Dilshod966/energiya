import { useState } from "react";
import { Search } from "lucide-react";

import { useStation }        from "../../context/StationContext";
import StationDetail         from "../station/StationDetail";
import CategoryAccordion     from "./CategoryAccordion";

export default function Sidebar() {
  const { stations, selected, setSelected, CATEGORIES } = useStation();
  const [search, setSearch] = useState("");

  const filtered = stations.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  // Summary counts
  const counts = {
    total:        stations.length,
    active:       stations.filter((s) => s.status === "active").length,
    maintenance:  stations.filter((s) => s.status === "maintenance").length,
    construction: stations.filter((s) => s.status === "construction").length,
  };

  return (
    <aside className="w-80 bg-[#0a0f1a] border-l border-white/5 flex flex-col h-full">
      {/* ── If a station is selected, show full detail ── */}
      {selected ? (
        <StationDetail station={selected} onClose={() => setSelected(null)} />
      ) : (
        <>
          {/* Search */}
          <div className="p-4 border-b border-white/5">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                className="w-full bg-[#0f1829] border border-white/10 rounded-lg pl-8 pr-3 py-2.5
                  text-sm text-white placeholder-slate-500
                  focus:outline-none focus:border-blue-500/50 transition-colors"
                placeholder="Stansiya qidirish…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-2 p-4 border-b border-white/5">
            {[
              { label: "Jami",      value: counts.total,        color: "text-white"       },
              { label: "Faol",      value: counts.active,       color: "text-emerald-400" },
              { label: "Ta'mirlash",value: counts.maintenance,  color: "text-amber-400"   },
              { label: "Qurilish",  value: counts.construction, color: "text-[#aa0505]"    },
            ].map((s) => (
              <div key={s.label} className="bg-[#0f1829] rounded-lg p-3 border border-white/5">
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-slate-500 text-xs">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Category accordions */}
          <div className="flex-1 overflow-y-auto">
            {CATEGORIES.map((cat) => (
              <CategoryAccordion
                key={cat.id}
                category={cat}
                stations={filtered.filter((s) => s.category === cat.id)}
              />
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
