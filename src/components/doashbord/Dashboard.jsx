import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Zap, Radio, Database, Download, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useMemo } from "react";

import Breadcrumbs from "./Breadcrumbs";
import UstachilikList from "./UstachilikList";
import NimstansiyaList from "./NimstansiyaList";
import LiniyaList from "./LiniyaList";
import TransformatorList from "./TransformatorList";
import LiniyaViewModal from "./view/LiniyaViewModal";
import TransformatorViewModal from "./view/Transformatorviewmodal";
import StatsModal from "./StatsModal";
import { API } from "../../services/api";

const TYPE_CFG = {
  ustachilik:    { label: "BO'LIM",        bg: "bg-violet-500/10", text: "text-violet-400",  border: "border-violet-500/25"  },
  nimstansiya:   { label: "NIMSTANSIYA",   bg: "bg-blue-500/10",   text: "text-blue-400",    border: "border-blue-500/25"    },
  liniya:        { label: "LINIYA",        bg: "bg-emerald-500/10",text: "text-emerald-400", border: "border-emerald-500/25" },
  transformator: { label: "TRANSFORMATOR", bg: "bg-amber-500/10",  text: "text-amber-400",   border: "border-amber-500/25"   },
};

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedStat, setSelectedStat] = useState(null);

  const [data, setData] = useState({ ustachilik: [], nimstansiya: [], liniya: [], transformator: [] });
  const [loading, setLoading] = useState(true);

  // Qidiruv
  const [searchQuery, setSearchQuery] = useState("");
  const [viewLiniya,  setViewLiniya]  = useState(null);
  const [viewTrans,   setViewTrans]   = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [u, n, l, t] = await Promise.all([
          API.get("/ustachilik"),
          API.get("/nimstansiya/all"),
          API.get("/liniya/all"),
          API.get("/transformator/all"),
        ]);
        setData({ ustachilik: u.data, nimstansiya: n.data, liniya: l.data, transformator: t.data });
      } catch (err) {
        console.error("Ma'lumotlarni yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Qidiruv natijalari
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return null;
    const hit = (vals) => vals.some((v) => String(v ?? "").toLowerCase().includes(q));
    const out = [];
    data.ustachilik.forEach((item) => {
      if (hit([item.name, item.usta])) out.push({ type: "ustachilik", item });
    });
    data.nimstansiya.forEach((item) => {
      if (hit([item.name, item.quvvat, item.parentName])) out.push({ type: "nimstansiya", item });
    });
    data.liniya.forEach((item) => {
      if (hit([item.name, item.inventar_raqami, item.fider, item.parentName])) out.push({ type: "liniya", item });
    });
    data.transformator.forEach((item) => {
      if (hit([item.tp_raqami, item.mahalla, item.kocha_nomi, item.fider, item.inventar_raqami, item.parentName]))
        out.push({ type: "transformator", item });
    });
    return out;
  }, [searchQuery, data]);

  const getTitle = () => {
    const pathnames = location.pathname.split("/").filter((x) => x && x !== "dashboard");
    const titles = ["BO'LIMLAR", "NIMSTANSIYALAR", "LINIYALAR", "TRANSFORMATORLAR"];
    return `${titles[pathnames.length] || "STATISTIKA"} RO'YXATI`;
  };

  const stats = [
    { id: 1, title: "BO'LIMLAR",        statType: "ustachilik",    value: data.ustachilik.length,   sub: "Jami ustachilik bo'limlari", icon: <LayoutDashboard size={24} />, bg: "bg-[#1e293b]" },
    { id: 2, title: "NIMSTANSIYALAR",   statType: "nimstansiya",   value: data.nimstansiya.length,  sub: "Jami nim stansiyalar",       icon: <Zap size={24} />,            bg: "bg-[#1e293b]" },
    { id: 3, title: "HL-10 KV UZUNLIK", statType: "liniya",        value: data.liniya.reduce((s, i) => s + Number(i.jami_uzunligi || 0), 0).toFixed(1), sub: "km • jami magistral", icon: <Radio size={24} />, bg: "bg-[#1e293b]" },
    { id: 4, title: "TRANSFORMATORLAR", statType: "transformator", value: data.transformator.length,sub: "TET + iste'molchi",           icon: <Database size={24} />,       bg: "bg-[#1e293b]" },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 pb-20 font-sans w-full flex-1 overflow-y-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/20">
            <LayoutDashboard className="text-white fill-current" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">Monitoring Tizimi</h1>
            <p className="text-xs text-slate-400">Yangiariq tuman elektr ta'minoti</p>
          </div>
        </div>
        {/* <button className="flex items-center gap-2 bg-[#217346] hover:bg-[#1e663e] px-4 py-2 rounded-lg transition text-sm border border-slate-700 active:scale-95">
          <Download size={18} /> Eksport
        </button> */}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <motion.div key={stat.id} onClick={() => setSelectedStat(stat)} whileHover={{ y: -5 }}
            className={`${stat.bg} p-6 rounded-2xl shadow-lg flex items-start justify-between border border-slate-800 cursor-pointer hover:border-blue-500/50 transition-colors group`}>
            <div>
              <p className="text-[10px] font-bold opacity-70 mb-1 tracking-widest text-slate-400 group-hover:text-blue-400 transition-colors">{stat.title}</p>
              <h2 className="text-3xl font-black mb-1 text-white">{loading ? "..." : stat.value}</h2>
              <p className="text-[11px] opacity-60 text-slate-300">{stat.sub}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">{stat.icon}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Table Container */}
      <div className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <Breadcrumbs />

        {/* Header qatori */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/30 flex flex-wrap gap-3 items-center">
          {/* Sarlavha */}
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider shrink-0">
            {getTitle()}
          </h3>

          {/* Qidiruv satrasi — o'ng tomonga */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Input */}
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kalit so'z..."
                className="bg-slate-800 border border-slate-700/60 text-white text-[11px] rounded-lg pl-8 pr-3 py-1.5 w-44 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 placeholder:text-slate-600 transition-all"
              />
            </div>

            {/* Tozalash */}
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                  onClick={() => setSearchQuery("")}
                  className="flex items-center gap-1 text-[10px] font-bold text-slate-400 border border-slate-700 px-2.5 py-1.5 rounded-lg hover:text-white hover:border-slate-500 transition-all whitespace-nowrap"
                >
                  <X size={11} /> Tozalash
                </motion.button>
              )}
            </AnimatePresence>

            {/* Qidirish badge */}
            <button className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg bg-blue-500/5 hover:bg-blue-500/15 transition-all whitespace-nowrap">
              <Search size={11} />
              Qidirish
              {searchResults !== null && (
                <span className="ml-0.5 bg-blue-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
                  {searchResults.length}
                </span>
              )}
            </button>

            {/* Orqaga */}
            {location.pathname !== "/" && location.pathname !== "/dashboard" && !searchResults && (
              <motion.button whileHover={{ x: -3 }} onClick={() => navigate(-1)}
                className="text-[10px] text-blue-400 border border-blue-400/30 px-3 py-1.5 rounded-lg hover:bg-blue-500/10 transition font-bold whitespace-nowrap">
                ← ORQAGA
              </motion.button>
            )}
          </div>
        </div>

        {/* Kontent: qidiruv natijalari YOKI oddiy jadval */}
        <div className="overflow-x-auto relative scrollbar-hide">
          <AnimatePresence mode="wait">
            {searchResults !== null ? (
              /* ── Qidiruv natijalari ─────────────────── */
              <motion.div key="search-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {searchResults.length === 0 ? (
                  <div className="flex items-center justify-center gap-2 py-14 text-slate-600 italic text-xs">
                    <Search size={14} />
                    "{searchQuery}" bo'yicha hech narsa topilmadi
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-900/50">
                        <th className="px-6 py-4 font-medium w-36">Turi</th>
                        <th className="px-6 py-4 font-medium">Nomi / Raqami</th>
                        <th className="px-6 py-4 font-medium text-center">Qo'shimcha</th>
                        <th className="px-6 py-4 font-medium text-center">Ota-element</th>
                        <th className="px-6 py-4 font-medium text-center">Balans</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {searchResults.map(({ type, item }, idx) => {
                        const cfg = TYPE_CFG[type];
                        const clickable = type === "liniya" || type === "transformator";
                        return (
                          <motion.tr
                            key={`${type}-${item.id}`}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.025 }}
                            onClick={() => {
                              if (type === "liniya")        setViewLiniya(item);
                              if (type === "transformator") setViewTrans(item);
                            }}
                            className={`border-b border-slate-800/50 transition-all duration-150 hover:bg-slate-700/25 ${clickable ? "cursor-pointer" : "cursor-default"}`}
                          >
                            {/* Turi */}
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                {cfg.label}
                              </span>
                            </td>

                            {/* Nomi / Raqami */}
                            <td className="px-6 py-4 text-white font-medium">
                              {type === "ustachilik"    && item.name}
                              {type === "nimstansiya"   && item.name}
                              {type === "liniya"        && (item.name || `${item.fider} ${item.kuchlanishi}`)}
                              {type === "transformator" && (
                                <span>TP <span className="text-amber-400 font-black">{item.tp_raqami}</span></span>
                              )}
                            </td>

                            {/* Qo'shimcha */}
                            <td className="px-6 py-4 text-center text-slate-400 text-xs">
                              {type === "ustachilik"    && (item.usta || "—")}
                              {type === "nimstansiya"   && (item.quvvat ? `${item.quvvat} kVA` : "—")}
                              {type === "liniya"        && (
                                <span className="text-amber-400 font-mono font-bold">{item.jami_uzunligi || 0} km</span>
                              )}
                              {type === "transformator" && (
                                <span className="italic">{[item.mahalla, item.kocha_nomi].filter(Boolean).join(", ") || "—"}</span>
                              )}
                            </td>

                            {/* Ota-element */}
                            <td className="px-6 py-4 text-center text-slate-500 text-xs">
                              {type === "ustachilik"    && `${item.n_jami ?? 0} nimstansiya`}
                              {type === "nimstansiya"   && (item.parentName || "—")}
                              {type === "liniya"        && (item.parentName || "—")}
                              {type === "transformator" && (item.parentName || `Fider: ${item.fider || "—"}`)}
                            </td>

                            {/* Balans */}
                            <td className="px-6 py-4 text-center">
                              {(type === "liniya" || type === "transformator") && item.hisob ? (
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                                  item.hisob === "tet"
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                }`}>
                                  {item.hisob === "tet" ? "TET" : "Iste'mol"}
                                </span>
                              ) : (
                                <span className="text-slate-700">—</span>
                              )}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </motion.div>
            ) : (
              /* ── Oddiy marshrut jadvali ─────────────── */
              <Routes location={location} key={location.pathname}>
                <Route index element={<UstachilikList />} />
                <Route path=":uId" element={<NimstansiyaList />} />
                <Route path=":uId/:nId" element={<LiniyaList />} />
                <Route path=":uId/:nId/:lId" element={<TransformatorList />} />
              </Routes>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* View Modallar (qidiruv natijasidan) */}
      <LiniyaViewModal       isOpen={!!viewLiniya} onClose={() => setViewLiniya(null)} data={viewLiniya} />
      <TransformatorViewModal isOpen={!!viewTrans}  onClose={() => setViewTrans(null)}  data={viewTrans}  />

      {/* Stats Modal */}
      <StatsModal
        isOpen={!!selectedStat}
        onClose={() => setSelectedStat(null)}
        statType={selectedStat?.statType}
        data={data}
      />
    </div>
  );
}
export default Dashboard;
