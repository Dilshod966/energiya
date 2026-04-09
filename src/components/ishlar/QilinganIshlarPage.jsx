import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench, Search, X, Calendar, Filter,
  CheckCircle2, Clock, ChevronDown,
} from "lucide-react";
import IshDetailModal from "./IshDetailModal";

const formatDate = (d) => {
  if (!d) return "";
  const s = String(d).split("T")[0];
  const p = s.split("-");
  return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : s;
};

const STATUS_CONFIG = {
  Jarayonda:  { color: "bg-amber-500/10 text-amber-400 border-amber-500/25",       icon: Clock,        dot: "bg-amber-400"   },
  Tugallandi: { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25", icon: CheckCircle2, dot: "bg-emerald-400" },
};

const STATS_CONFIG = {
  Jarayonda:  { color: "bg-amber-500/10 text-amber-400 border-amber-500/25",       dot: "bg-amber-400"   },
  Tugallandi: { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25", dot: "bg-emerald-400" },
};

export default function QilinganIshlarPage() {
  const [ishlar, setIshlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIsh, setSelectedIsh] = useState(null);

  // Bugungi sana (YYYY-MM-DD, local time)
  const today = (() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  })();

  // Filterlar
  const [search, setSearch] = useState("");
  const [filterSana, setFilterSana] = useState(today);
  const [filterHolati, setFilterHolati] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/ish")
      .then((r) => r.json())
      .then((data) => setIshlar(Array.isArray(data) ? data : []))
      .catch(() => setIshlar([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = ishlar.filter((ish) => {
    // Qidiruv: usta ismi yoki naryad raqami
    if (search.trim()) {
      const q = search.toLowerCase();
      const naryadMatch = (ish.naryad_raqami || "").toLowerCase().includes(q);
      const ishchilarMatch = Array.isArray(ish.ishchilar)
        ? ish.ishchilar.some(
            (w) =>
              (w.ism_familiya || "").toLowerCase().includes(q) ||
              (w.lavozim || "").toLowerCase().includes(q)
          )
        : (`${ish.ism || ""} ${ish.familiya || ""}`).toLowerCase().includes(q);
      if (!naryadMatch && !ishchilarMatch) return false;
    }
    // Sana
    if (filterSana) {
      const kun = String(ish.boshlanish_kun || ish.ish_kun || "").split("T")[0];
      if (kun !== filterSana) return false;
    }
    // Holat
    if (filterHolati) {
      if ((ish.status || "Jarayonda") !== filterHolati) return false;
    }
    return true;
  });

  const hasFilter = search || filterSana || filterHolati;

  const clearFilters = () => {
    setSearch("");
    setFilterSana("");
    setFilterHolati("");
  };

  // Statistika
  const counts = ishlar.reduce(
    (acc, i) => {
      const s = i.status || "Jarayonda";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#070d18] p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Sarlavha ── */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center">
                <Wrench size={16} className="text-violet-400" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Qilingan Ishlar</h1>
            </div>
            <p className="text-slate-500 text-xs ml-12">Barcha bajarilgan va jarayondagi ishlar ro'yxati</p>
          </div>
          {/* Umumiy statistika */}
          <div className="flex items-center gap-2">
            {Object.entries(STATS_CONFIG).map(([s, cfg]) => (
              <div key={s} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold ${cfg.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {counts[s] || 0} {s}
              </div>
            ))}
          </div>
        </div>

        {/* ── Filterlar ── */}
        <div className="bg-[#0f1829] border border-white/5 rounded-2xl p-4">
          <div className="flex flex-wrap gap-3">
            {/* Qidiruv */}
            <div className="flex-1 min-w-[200px] relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Usta ismi, lavozim yoki naryad raqami..."
                className="w-full bg-[#070d18] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-[12px] text-white placeholder:text-slate-600 outline-none focus:border-violet-500/40 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Sana */}
            <div className="relative min-w-[160px]">
              <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="date"
                value={filterSana}
                onChange={(e) => setFilterSana(e.target.value)}
                className="w-full bg-[#070d18] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-[12px] text-white outline-none focus:border-violet-500/40 transition-all"
              />
            </div>

            {/* Holat */}
            <div className="relative min-w-[160px]">
              <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <select
                value={filterHolati}
                onChange={(e) => setFilterHolati(e.target.value)}
                className="w-full bg-[#070d18] border border-white/10 rounded-xl pl-9 pr-8 py-2 text-[12px] text-white outline-none focus:border-violet-500/40 transition-all appearance-none"
              >
                <option value="">Barcha holat</option>
                <option value="Jarayonda">Jarayonda</option>
                <option value="Tugallandi">Tugallandi</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>

            {/* Tozalash */}
            {hasFilter && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 text-[11px] font-semibold transition-all"
              >
                <X size={12} /> Tozalash
              </button>
            )}
          </div>

          {/* Natija soni */}
          {hasFilter && (
            <p className="text-[10px] text-slate-500 mt-2.5">
              {filtered.length} ta natija topildi
            </p>
          )}
        </div>

        {/* ── Ro'yxat ── */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-600">
            <Wrench size={40} className="mb-4 opacity-20" />
            <p className="text-sm">
              {hasFilter ? "Filtr bo'yicha hech narsa topilmadi" : "Hech qanday ish qayd etilmagan"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((ish, idx) => {
                const isLiniya = ish.tur === "liniya";
                const status = ish.status || "Jarayonda";
                const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG["Jarayonda"];
                const StatusIcon = statusCfg.icon;

                const ishchilar =
                  Array.isArray(ish.ishchilar) && ish.ishchilar.length > 0
                    ? ish.ishchilar
                    : ish.ism || ish.familiya
                    ? [{ lavozim: "", ism_familiya: `${ish.ism || ""} ${ish.familiya || ""}`.trim() }]
                    : [];

                const boshKun  = ish.boshlanish_kun  || ish.ish_kun;
                const boshSoat = ish.boshlanish_soat || ish.ish_soat;

                return (
                  <motion.div
                    key={ish.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ delay: idx * 0.025 }}
                    onClick={() => setSelectedIsh(ish)}
                    className="flex gap-0 rounded-2xl bg-[#0f1829] border border-white/5 hover:border-violet-500/30 hover:bg-[#111827] overflow-hidden transition-all duration-200 cursor-pointer group"
                  >
                    {/* Stripe */}
                    <div className={`w-1 flex-shrink-0 transition-all group-hover:w-1.5 ${isLiniya ? "bg-amber-500" : "bg-blue-500"}`} />

                    <div className="flex-1 min-w-0 px-5 py-4">
                      {/* Yuqori qator */}
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          {/* Tur badge */}
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border flex-shrink-0 ${
                            isLiniya
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          }`}>
                            {isLiniya ? "Liniya" : "Transformator"}
                          </span>
                          {/* Ob'ekt nomi */}
                          <span className="text-white font-bold text-[13px] truncate">
                            {ish.ob_nomi}
                          </span>
                          {/* Naryad */}
                          {ish.naryad_raqami && (
                            <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">
                              📋 {ish.naryad_raqami}
                            </span>
                          )}
                        </div>
                        {/* Status */}
                        <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border flex-shrink-0 ${statusCfg.color}`}>
                          <StatusIcon size={9} />
                          {status}
                        </span>
                      </div>

                      {/* Ishchilar */}
                      {ishchilar.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {ishchilar.map((w, i) => (
                            <span
                              key={i}
                              className="text-[11px] text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-lg px-2.5 py-0.5 flex items-center gap-1"
                            >
                              {w.lavozim && (
                                <>
                                  <span className="text-violet-500 font-semibold">{w.lavozim}</span>
                                  <span className="text-violet-600">·</span>
                                </>
                              )}
                              <span>{w.ism_familiya}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Ish matni */}
                      {ish.ish_matni && (
                        <p className="text-slate-400 text-[12px] leading-relaxed mb-3">
                          {ish.ish_matni}
                        </p>
                      )}

                      {/* Vaqtlar */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] text-slate-600 uppercase tracking-wider">Boshlandi</span>
                        <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded-md">
                          {formatDate(boshKun)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded-md">
                          {String(boshSoat || "").slice(0, 5)}
                        </span>
                        <span className="text-slate-700 text-xs">→</span>
                        <span className="text-[9px] text-slate-600 uppercase tracking-wider">Tugadi</span>
                        {ish.tugash_kun ? (
                          <>
                            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-md">
                              {formatDate(ish.tugash_kun)}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-md">
                              {String(ish.tugash_soat || "").slice(0, 5)}
                            </span>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-600 font-mono bg-white/5 px-2 py-0.5 rounded-md italic">—</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <IshDetailModal
        isOpen={!!selectedIsh}
        ish={selectedIsh}
        onClose={() => setSelectedIsh(null)}
      />
    </div>
  );
}
