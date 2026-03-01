import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Zap, Radio, Database, Download, Plus } from 'lucide-react';

// Ichki komponentlarni import qilish (Yo'llarni o'z loyihangizga qarab tekshiring)
import Breadcrumbs from './Breadcrumbs';
import UstachilikList from './UstachilikList';
import NimstansiyaList from './NimstansiyaList';
import LiniyaList from './LiniyaList';
import TransformatorList from './TransformatorList';

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const getTitle = () => {
  const pathnames = location.pathname.split('/').filter((x) => x && x !== 'dashboard');
  
  // URL darajasiga qarab stats massividan title'ni olamiz
  // pathnames.length === 0 bo'lsa stats[0] (BO'LIMLAR)
  // pathnames.length === 1 bo'lsa stats[1] (NIMSTANSIYALAR) va h.k.
  const currentStat = stats[pathnames.length];

  if (currentStat) {
    // Title'ni chiroyli formatda chiqarish (masalan: "NIMSTANSIYALAR STATISTIKASI")
    return `${currentStat.title} STATISTIKASI`;
  }

  return "STATISTIKA";
};

  const stats = [
    { id: 1, title: "BO'LIMLAR", value: "3", sub: "Jami ustachilik bo'limlari", icon: <LayoutDashboard size={24} />, bg: "bg-[#1e293b]" },
    { id: 2, title: "NIMSTANSIYALAR", value: "12", sub: "Jami nim stansiyalar", icon: <Zap size={24} />, bg: "bg-[#1e293b]" },
    { id: 3, title: "HL-10 KV UZUNLIK", value: "450", sub: "km • jami magistral", icon: <Radio size={24} />, bg: "bg-[#1e293b]" },
    { id: 4, title: "TRANSFORMATORLAR", value: "86", sub: "TET + iste'molchi", icon: <Database size={24} />, bg: "bg-[#1e293b]" },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 pb-20 font-sans w-full flex-1 overflow-y-auto">
      {/* 1. Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg"><LayoutDashboard className="text-white fill-current" size={24} /></div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">Monitoring Tizimi</h1>
            <p className="text-xs text-slate-400">Yangiariq tuman elektr ta'minoti</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-[#217346] hover:bg-[#1e663e] px-4 py-2 rounded-lg transition text-sm border border-slate-700">
            <Download size={18} /> Eksport
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition text-sm font-semibold text-white">
            <Plus size={18} /> Qo'shish
          </button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.id} className={`${stat.bg} p-6 rounded-2xl shadow-lg flex items-start justify-between border border-slate-800`}>
            <div>
              <p className="text-[10px] font-bold opacity-70 mb-1 tracking-widest">{stat.title}</p>
              <h2 className="text-3xl font-black mb-1 text-white">{stat.value}</h2>
              <p className="text-[11px] opacity-60">{stat.sub}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* 3. Main Table Section */}
      <div className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        {/* Breadcrumbs */}
        <Breadcrumbs />

        {/* Jadval boshqaruv qismi */}
        <div className="p-4 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-white">{getTitle()}</h3>
          {location.pathname !== "/dashboard" && (
            <button 
              onClick={() => navigate(-1)} 
              className="text-[10px] text-blue-400 border border-blue-400/30 px-2 py-1 rounded-md hover:bg-blue-500/10 transition uppercase font-bold"
            >
              ← Orqaga
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-900/50">
                <th className="px-6 py-4 font-medium">Nomi / Ma'lumot</th>
                <th className="px-6 py-4 text-center font-medium">Turi</th>
                <th className="px-6 py-4 text-right font-medium">Hajm / Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <Routes>
                <Route index element={<UstachilikList />} />
                <Route path=":uId" element={<NimstansiyaList />} />
                <Route path=":uId/:nId" element={<LiniyaList />} />
                <Route path=":uId/:nId/:lId" element={<TransformatorList />} />
              </Routes>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;