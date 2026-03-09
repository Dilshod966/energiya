import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Zap, Radio, Database, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";

import Breadcrumbs from "./Breadcrumbs";
import UstachilikList from "./UstachilikList";
import NimstansiyaList from "./NimstansiyaList";
import LiniyaList from "./LiniyaList";
import TransformatorList from "./TransformatorList";
import { API } from "../../services/api"; // API instance

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedStat, setSelectedStat] = useState(null);
  const modalRef = useRef(null);

  // Barcha ma'lumotlarni saqlash uchun yagona state
  const [data, setData] = useState({
    ustachilik: [],
    nimstansiya: [],
    liniya: [],
    transformator: []
  });
  const [loading, setLoading] = useState(true);

  // Backenddan barcha ma'lumotlarni bir marta yuklab olish
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [u, n, l, t] = await Promise.all([
          API.get("/ustachilik"),
          API.get("/nimstansiya/all"),
          API.get("/liniya/all"),
          API.get("/transformator/all")
        ]);

        setData({
          ustachilik: u.data,
          nimstansiya: n.data,
          liniya: l.data,
          transformator: t.data
        });
      } catch (err) {
        console.error("Ma'lumotlarni yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const getTitle = () => {
    const pathnames = location.pathname
      .split("/")
      .filter((x) => x && x !== "dashboard");
    const statsTitles = [
      "BO'LIMLAR",
      "NIMSTANSIYALAR",
      "LINIYALAR",
      "TRANSFORMATORLAR",
    ];
    return `${statsTitles[pathnames.length] || "STATISTIKA"} RO'YXATI`;
  };

  // Statistika kartalari endi kelgan 'data' asosida hisoblanadi
  const stats = [
    {
      id: 1,
      title: "BO'LIMLAR",
      value: data.ustachilik.length,
      sub: "Jami ustachilik bo'limlari",
      icon: <LayoutDashboard size={24} />,
      bg: "bg-[#1e293b]",
      detail: data.ustachilik.map(u => `${u.name} — ${u.usta || "Mas'ul biriktirilmagan"}`),
    },
    {
      id: 2,
      title: "NIMSTANSIYALAR",
      value: data.nimstansiya.length,
      sub: "Jami nim stansiyalar",
      icon: <Zap size={24} />,
      bg: "bg-[#1e293b]",
      detail: data.nimstansiya.map(n => `${n.name} (${n.quvvat || "0"} kVA)`),
    },
    {
      id: 3,
      title: "HL-10 KV UZUNLIK",
      // Liniyalar uzunligi yig'indisini hisoblash
      value: data.liniya.reduce((sum, item) => sum + Number(item.uzunlik || 0), 0).toFixed(1),
      sub: "km • jami magistral",
      icon: <Radio size={24} />,
      bg: "bg-[#1e293b]", 
      detail: [`Jami ${data.liniya.length} ta liniya tarmog'i mavjud.`],
    },
    {
      id: 4,
      title: "TRANSFORMATORLAR",
      value: data.transformator.length,
      sub: "TET + iste'molchi",
      icon: <Database size={24} />,
      bg: "bg-[#1e293b]",
      detail: [
        `Ishchi holatda: ${data.transformator.filter(t => t.holat === "Ishchi").length} ta`,
        `Nosoz holatda: ${data.transformator.filter(t => t.holat === "Nosoz").length} ta`,
        `TET hisobida: ${data.transformator.filter(t => t.hisob === "tet").length} ta`
      ],
    },
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
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">
              Monitoring Tizimi
            </h1>
            <p className="text-xs text-slate-400">
              Yangiariq tuman elektr ta'minoti
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-[#217346] hover:bg-[#1e663e] px-4 py-2 rounded-lg transition text-sm border border-slate-700 active:scale-95">
          <Download size={18} /> Eksport
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <motion.div
            key={stat.id}
            layoutId={`card-${stat.id}`}
            onClick={() => setSelectedStat(stat)}
            whileHover={{ y: -5 }}
            className={`${stat.bg} p-6 rounded-2xl shadow-lg flex items-start justify-between border border-slate-800 cursor-pointer hover:border-blue-500/50 transition-colors group`}
          >
            <div>
              <p className="text-[10px] font-bold opacity-70 mb-1 tracking-widest text-slate-400 group-hover:text-blue-400 transition-colors">
                {stat.title}
              </p>
              <h2 className="text-3xl font-black mb-1 text-white">
                {loading ? "..." : stat.value}
              </h2>
              <p className="text-[11px] opacity-60 text-slate-300">
                {stat.sub}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
              {stat.icon}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Table Container */}
      <div className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <Breadcrumbs />
        <div className="p-4 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            {getTitle()}
          </h3>
          {location.pathname !== "/" && location.pathname !== "/dashboard" && (
            <motion.button
              whileHover={{ x: -3 }}
              onClick={() => navigate(-1)}
              className="text-[10px] text-blue-400 border border-blue-400/30 px-3 py-1 rounded-md hover:bg-blue-500/10 transition font-bold"
            >
              ← ORQAGA
            </motion.button>
          )}
        </div>

        <div className="overflow-x-auto relative scrollbar-hide">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route index element={<UstachilikList />} />
              <Route path=":uId" element={<NimstansiyaList />} />
              <Route path=":uId/:nId" element={<LiniyaList />} />
              <Route path=":uId/:nId/:lId" element={<TransformatorList />} />
            </Routes>
          </AnimatePresence>
        </div>
      </div>

      {/* Stat Modal */}
      <AnimatePresence>
        {selectedStat && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStat(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              ref={modalRef}
              layoutId={`card-${selectedStat.id}`}
              className="bg-slate-900 border border-slate-800 w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl z-10 relative text-white"
            >
                <div className="text-center mb-6">
                    <p className="text-xs font-bold text-blue-500 tracking-widest uppercase mb-2">{selectedStat.title}</p>
                    <div className="flex items-center justify-center gap-2">
                        <span className="text-5xl font-black text-white">{selectedStat.value}</span>
                        <span className="text-lg text-slate-500 font-medium lowercase">
                            {selectedStat.id === 3 ? "km" : "ta"}
                        </span>
                    </div>
                </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedStat.detail.length > 0 ? (
                    selectedStat.detail.map((d, i) => (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          key={i}
                          className="text-sm text-slate-300 border-l-2 border-blue-500/50 pl-4 py-2 bg-slate-800/40 rounded-r-xl"
                        >
                          {d}
                        </motion.p>
                      ))
                ) : (
                    <p className="text-slate-500 text-center italic">Ma'lumot topilmadi</p>
                )}
              </div>
              
              <button
                onClick={() => setSelectedStat(null)}
                className="mt-8 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/30 active:scale-95"
              >
                Tushunarli
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default Dashboard;