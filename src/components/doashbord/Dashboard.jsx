
import { LayoutDashboard, Zap, Radio, Database, Download, Plus, Bell } from 'lucide-react';
import DrillDownTable from './DrillDown';
function Dashboard() {
  const stats = [
    {
      id: 1,
      title: "BO'LIMLAR",
      value: "3",
      sub: "Jami ustachilik bo'limlari",
      icon: <LayoutDashboard size={24} />,
      bg: "bg-[#1e293b] text-white border border-slate-700",
    },
    {
      id: 2,
      title: "NIMSTANSIYALAR",
      value: "12",
      sub: "Jami nim stansiyalar",
      icon: <Zap size={24} />,
      bg: "bg-[#1e293b] text-white border border-slate-700",
    },
    {
      id: 3,
      title: "HL-10 KV UZUNLIK",
      value: "450",
      sub: "km • jami magistral",
      icon: <Radio size={24} />,
      bg: "bg-[#1e293b] text-white border border-slate-700",
    },
    {
      id: 4,
      title: "TRANSFORMATORLAR",
      value: "86",
      sub: "TET + iste'molchi",
      icon: <Database size={24} />,
      bg: "bg-[#1e293b] text-white border border-slate-700",
    },
  ];

  const tableData = [
    {
      id: 1,
      name: "1-sonli ustachilik bo'limi",
      usta: "Eshmuradov Nodir",
      ns: 16,
      hl: 94,
      hl_tet: 61,
      hl_ist: 33,
      tr: 54,
      tr_tet: 21,
      tr_ist: 33,
    },
    {
      id: 2,
      name: "2-sonli ustachilik bo'limi",
      usta: "Jumaniyozov Faxriddin",
      ns: 18,
      hl: 102,
      hl_tet: 70,
      hl_ist: 32,
      tr: 58,
      tr_tet: 24,
      tr_ist: 34,
    },
    {
      id: 3,
      name: "3-sonli ustachilik bo'limi",
      usta: "Sadullayev Abror",
      ns: 14,
      hl: 88,
      hl_tet: 55,
      hl_ist: 33,
      tr: 50,
      tr_tet: 18,
      tr_ist: 32,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 pb-20 font-sans w-full flex-1 overflow-y-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <LayoutDashboard className="text-white fill-current" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">
              DashBoard 
            </h1>
            <p className="text-xs text-slate-400">Monitoring Tizimi</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2  hover:bg-[#218346] px-4 py-2 rounded-lg transition text-sm border border-slate-700 bg-[#217346]">
            <Download size={18} /> Eksport
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition text-sm font-semibold text-white">
            <Plus size={18} /> Qo'shish
          </button>
          
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className={`${stat.bg} p-6 rounded-2xl shadow-lg flex items-start justify-between`}
          >
            <div>
              <p className="text-[10px] font-bold opacity-70 mb-1 tracking-widest">
                {stat.title}
              </p>
              <h2 className="text-3xl font-black mb-1">{stat.value}</h2>
              <p className="text-[11px] opacity-60">{stat.sub}</p>
            </div>
            <div
              className={`p-3 rounded-xl "bg-slate-750/50"}`}
            >
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Section */}
      <div className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-slate-800/30">
          <h3 className="text-lg font-semibold text-white">
            Hududiy Bo'limlar Statistikasi
          </h3>
          <p className="text-sm text-slate-400">
            Yangiariq tuman elektr ta'minoti korxonasi
          </p>
        </div>

        <DrillDownTable/>
      </div>
    </div>
  );
}

export default Dashboard;
