import { useRef, useState } from "react";
import {
  Bell,
  LayoutDashboard,
  Layers,
  Settings,
  User,
  Moon,
  Sun,
  Check,
  Wrench,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import { useStation } from "../../context/StationContext";
import logo from "./logo2.png";

const NAV_ITEMS = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard"       },
  { id: "map",       icon: Layers,          label: "Xarita"          },
  { id: "ishlar",    icon: Wrench,          label: "Qilingan Ishlar" },
  { id: "admin",     icon: Settings,        label: "Settings"        },
];

const THEME_OPTIONS = [
  { value: "dark",  icon: Moon, label: "Tungi rejim"   },
  { value: "light", icon: Sun,  label: "Kunduzgi rejim" },
];

export default function Topbar() {
  const { setSidebarOpen, usernomi, theme, setTheme } = useStation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  const handleBlur = (e) => {
    if (!dropdownRef.current?.contains(e.relatedTarget)) {
      setDropdownOpen(false);
    }
  };

  const handleThemeSelect = (value) => {
    setTheme(value);
    setDropdownOpen(false);
  };

  return (
    <header className="h-14 bg-[#0a0f1a] relative z-[10000] border-b border-white/5 flex items-center justify-between py-4 px-6 flex-shrink-0 transition-colors duration-300">

      {/* Brand */}
      <div className="flex items-center gap-3">
        <img src={logo} alt="Logo" width="40px" />
        <div>
          <span className="text-white font-bold text-sm tracking-wide">ELEKTROSET</span>
          <span className="text-slate-500 text-xs ml-2">Yangiariq tumani</span>
        </div>
      </div>

      {/* Nav tabs */}
      <nav className="flex items-center gap-1 bg-[#0f1829] rounded-lg p-1 border border-white/5">
        {NAV_ITEMS
          .filter((_, i) => usernomi === "Admin" ? true : i !== NAV_ITEMS.length - 1)
          .map((item) => (
            <NavLink
              key={item.id}
              to={`/${item.id}`}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                 ${isActive ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`
              }
              onClick={() => { if (item.id !== "map") setSidebarOpen(false); }}
            >
              <item.icon size={13} />
              {item.label}
            </NavLink>
          ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-1">

        {/* ── Theme toggle ─────────────────────────────────── */}
        <div className="relative" ref={dropdownRef} onBlur={handleBlur}>
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors overflow-hidden"
            aria-label="Rejimni o'zgartirish"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, scale: 0, opacity: 0 }}
                animate={{ rotate: 0,   scale: 1, opacity: 1 }}
                exit={{    rotate:  90, scale: 0, opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
                className="flex items-center justify-center"
              >
                {theme === "dark" ? <Moon size={15} /> : <Sun size={15} />}
              </motion.span>
            </AnimatePresence>
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: -6 }}
                animate={{ opacity: 1, scale: 1,    y: 0  }}
                exit={{    opacity: 0, scale: 0.92, y: -6 }}
                transition={{ type: "spring", damping: 22, stiffness: 320 }}
                className="absolute right-0 top-10 w-48 bg-[#0a0f1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
              >
                {THEME_OPTIONS.map(({ value, icon: Icon, label }, idx) => (
                  <motion.button
                    key={value}
                    onClick={() => handleThemeSelect(value)}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0  }}
                    transition={{ delay: idx * 0.06 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-[12px] font-medium transition-all border-b border-white/5 last:border-0 ${
                      theme === value
                        ? "bg-blue-600/10 text-blue-400"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{label}</span>
                    {theme === value && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto"
                      >
                        <Check size={12} />
                      </motion.span>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Bell ─────────────────────────────────────────── */}
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors relative">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>

        {/* ── User ─────────────────────────────────────────── */}
        <button
          onDoubleClick={() => navigate("/admin")}
          className="h-8 px-3 rounded-lg flex items-center gap-2 text-slate-400 hover:text-white hover:bg-white/5 transition-colors border border-transparent"
        >
          <span className="text-[11px] font-medium tracking-wider">{usernomi}</span>
          <User size={15} />
        </button>

      </div>
    </header>
  );
}
