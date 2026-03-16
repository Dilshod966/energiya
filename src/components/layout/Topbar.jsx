import {
  Zap,
  Layers,
  Plus,
  Bell,
  Menu,
  X,
  LayoutDashboard,
  Flag,
  User,
  Settings,
} from "lucide-react";
import { useStation } from "../../context/StationContext";
import logo from "./logo2.png";

import { Link, NavLink, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "map", icon: Layers, label: "Xarita" },
  { id: "admin", icon: Settings, label: "Settings" },
];

export default function Topbar() {
  const { sidebarOpen, setSidebarOpen, view, setView, usernomi } = useStation();
  const navigate = useNavigate();
  return (
    <header className="h-14 bg-[#0a0f1a] relative z-[10000] border-b border-white/5 flex items-center justify-between py-4 px-6 flex-shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="Logo" width={"40px"} />
        <div>
          <span className="text-white font-bold text-sm tracking-wide">
            ELEKTROSET
          </span>
          <span className="text-slate-500 text-xs ml-2">Yangiariq tumani</span>
        </div>
      </div>

      {/* Nav tabs */}
      <nav className="flex items-center gap-1 bg-[#0f1829] rounded-lg p-1 border border-white/5">
        {NAV_ITEMS
          // Agar Admin bo'lmasa, massivni oxirgi elementisiz qirqib olamiz
          .filter((_, index) =>
            usernomi === "Admin" ? true : index !== NAV_ITEMS.length - 1,
          )
          .map((item) => (
            <NavLink
              key={item.id}
              to={`/${item.id}`}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
        ${isActive ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`
              }
              onClick={() => {
                if (item.id !== "map") {
                  setSidebarOpen(false);
                }
              }}
            >
              <item.icon size={13} />
              {item.label}
            </NavLink>
          ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors relative">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>
        <button
          onDoubleClick={() => {
            navigate("/admin");
          }}
          className="h-8 px-3 rounded-lg flex items-center gap-2 text-slate-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent"
        >
          <span className="text-[11px] font-medium tracking-wider">
            {usernomi}
          </span>
          <User size={15} />
        </button>
        {/* <button
          onClick={() => setSidebarOpen((p) => (view === "map" ? !p : p))}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          {sidebarOpen ? <X size={15} /> : <Menu size={15} />}
        </button> */}
      </div>
    </header>
  );
}
