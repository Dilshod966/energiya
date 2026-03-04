import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Zap, Radio, Database, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useRef, useEffect } from "react";

import Breadcrumbs from "./Breadcrumbs";
import UstachilikList from "./UstachilikList";
import NimstansiyaList from "./NimstansiyaList";
import LiniyaList from "./LiniyaList";
import TransformatorList from "./TransformatorList";

// Animatsiya konfiguratsiyasi


function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedStat, setSelectedStat] = useState(null);
  const modalRef = useRef(null);

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

  const stats = [
    {
      id: 1,
      title: "BO'LIMLAR",
      value: "3",
      sub: "Jami ustachilik bo'limlari",
      icon: <LayoutDashboard size={24} />,
      bg: "bg-[#1e293b]",
      detail: [
        "1-ustachilik Eshmuradov Nodir",
        "2-ustachilik Jumaniyozov Faxriddin",
        "3-ustachilik Sadullayev Abror",
      ],
    },
    {
      id: 2,
      title: "NIMSTANSIYALAR",
      value: "12",
      sub: "Jami nim stansiyalar",
      icon: <Zap size={24} />,
      bg: "bg-[#1e293b]",
      detail: ["Tizimdagi barcha faol nimstansiyalar."],
    },
    {
      id: 3,
      title: "HL-10 KV UZUNLIK",
      value: "450",
      sub: "km • jami magistral",
      icon: <Radio size={24} />,
      bg: "bg-[#1e293b]",
      detail: ["Umumiy tarmoq uzunligi."],
    },
    {
      id: 4,
      title: "TRANSFORMATORLAR",
      value: "86",
      sub: "TET + iste'molchi",
      icon: <Database size={24} />,
      bg: "bg-[#1e293b]",
      detail: ["Barcha turdagi transformatorlar."],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 pb-20 font-sans w-full flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
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
        <button className="flex items-center gap-2 bg-[#217346] hover:bg-[#1e663e] px-4 py-2 rounded-lg transition text-sm border border-slate-700">
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
            className={`${stat.bg} p-6 rounded-2xl shadow-lg flex items-start justify-between border border-slate-800 cursor-pointer hover:border-blue-500/50 transition-colors`}
          >
            <div>
              <p className="text-[10px] font-bold opacity-70 mb-1 tracking-widest text-slate-400">
                {stat.title}
              </p>
              <h2 className="text-3xl font-black mb-1 text-white">
                {stat.value}
              </h2>
              <p className="text-[11px] opacity-60 text-slate-300">
                {stat.sub}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
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
          {location.pathname !== "/" && (
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
              {/* Element ichida table yo'q, u List komponentining o'zida bo'ladi */}
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              ref={modalRef}
              layoutId={`card-${selectedStat.id}`}
              className="bg-[#1e293b] border border-slate-700 w-full max-w-md p-8 rounded-3xl shadow-2xl z-10 relative text-white text-center"
            >
              <p className="flex items-center justify-center gap-3 text-sm font-bold text-blue-400 tracking-tighter uppercase mb-4">
                <span>{selectedStat.title}</span>
                <span className="text-3xl font-black text-white">
                  {selectedStat.value}
                </span>
                <span className="lowercase">
                  {selectedStat.id === 3 ? "km" : "ta"}
                </span>
              </p>
              <div className="space-y-3 text-left">
                {selectedStat.detail.map((d, i) => (
                  <p
                    key={i}
                    className="text-slate-300 italic border-l-4 border-blue-500 pl-4 py-1 bg-slate-800/50 rounded-r-lg"
                  >
                    {d}
                  </p>
                ))}
              </div>
              <button
                onClick={() => setSelectedStat(null)}
                className="mt-8 w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all"
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
