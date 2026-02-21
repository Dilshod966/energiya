import { Zap, Layers, Plus, Bell, Menu, X } from "lucide-react";
import { useStation } from "../../context/StationContext";
import logo from "./logo2.png"

const NAV_ITEMS = [
  { id: "map",   icon: Layers, label: "Xarita"    },
  { id: "admin", icon: Plus,   label: "Qo'shish"  },
];

export default function Topbar() {
  const { sidebarOpen, setSidebarOpen, view, setView } = useStation();

  return (
    <header className="h-14 bg-[#0a0f1a] border-b border-white/5 flex items-center justify-between px-4 flex-shrink-0">

      {/* Brand */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="Logo" width={"40px"} />
        <div>
          <span className="text-white font-bold text-sm tracking-wide">ELEKTROSET</span>
          <span className="text-slate-500 text-xs ml-2">Yangiariq tumani</span>
        </div>
      </div>

      {/* Nav tabs */}
      <nav className="flex items-center gap-1 bg-[#0f1829] rounded-lg p-1 border border-white/5">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
              ${view === item.id ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            <item.icon size={13} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors relative">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>
        <button
          onClick={() => setSidebarOpen((p) => !p)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          {sidebarOpen ? <X size={15} /> : <Menu size={15} />}
        </button>
      </div>
    </header>
  );
}
