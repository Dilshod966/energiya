import { useEffect, useState } from "react";
import { Search, Zap, MapPin, ChevronRight, Loader2 } from "lucide-react";
import { API } from "../../services/api"; // API instance yo'lini tekshiring

import { useStation } from "../../context/StationContext";
import StationDetail from "../station/StationDetail";

export default function Sidebar() {
  const { selected, setSelected, stations, setStations } = useStation(); // Context'ga setStations qo'shilgan deb hisoblaymiz
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Backenddan barcha transformatorlarni olish
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const res = await API.get("/transformator/all");
        setStations(res.data); // Ma'lumotni context'ga saqlaymiz (xarita ham yangilanadi)
      } catch (err) {
        console.error("Sidebar yuklashda xato:", err);
      } finally {
        setLoading(false);
      }
    };

    // Agar MapView allaqachon yuklagan bo'lsa, qayta yuklamaslik uchun:
    if (stations.length === 0) {
      fetchAll();
    }
  }, []);

  // 2. Qidiruv bo'yicha filtrlash
  const filtered = (stations || []).filter(
    (s) =>
      s.tp_raqami?.toString().toLowerCase().includes(search.toLowerCase()) ||
      s.mahalla?.toLowerCase().includes(search.toLowerCase()),
  );

  // 3. Statistika (counts)
  const counts = {
    total: stations.length,
    tet: stations.filter((s) => s.hisob === "tet").length,
    ist: stations.filter((s) => s.hisob !== "tet").length,
  };

  return (
    <aside className="w-[400px] bg-[#131c2f] border-l border-white/5 flex flex-col h-full shadow-2xl">
      {selected ? (
        <StationDetail station={selected} onClose={() => setSelected(null)} />
      ) : (
        <>
          {/* Header & Search */}
          <div className="p-4 bg-[#111a2e] border-b border-white/5">
            <h2 className="text-white font-bold mb-3 text-lg px-1">
              Transformatorlar
            </h2>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                className="w-full bg-[#0f1829] border border-white/10 rounded-xl pl-9 pr-3 py-3
                  text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                placeholder="№ TP yoki mahalla…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Loading holati */}
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <Loader2 className="animate-spin mb-2" size={24} />
              <p className="text-xs">Yuklanmoqda...</p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 p-4 bg-[#111a2e]/50 border-b border-white/5">
                {[
                  {
                    label: "Jami",
                    value: counts.total,
                    color: "text-blue-400",
                  },
                  {
                    label: "TET",
                    value: counts.tet,
                    color: "text-emerald-400",
                  },
                  {
                    label: "Ist.",
                    value: counts.ist,
                    color: "text-orange-400",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-[#0f1829] rounded-xl p-2.5 border border-white/5 text-center"
                  >
                    <div className={`text-lg font-black ${s.color}`}>
                      {s.value}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {filtered.map((station) => {
                  const mainColor =
                    station.hisob === "tet" ? "#3b82f6" : "#ea580c";
                  return (
                    <div
                      key={station.id}
                      onClick={() => setSelected(station)}
                      className="group bg-[#111a2e] hover:bg-[#1a253d] border border-white/5 rounded-2xl p-4 cursor-pointer transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5">
                            <Zap size={18} style={{ color: mainColor }} />
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-sm">
                              № {station.tp_raqami}
                            </h3>
                            <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                              <MapPin size={10} />
                              <span className="truncate w-32">
                                {station.mahalla}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight
                          size={14}
                          className="text-slate-600 group-hover:text-white"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </aside>
  );
}
