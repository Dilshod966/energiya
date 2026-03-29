import { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Plus,
  Zap,
  Radio,
  AlertCircle,
  Database,
  Lock,
  User,
  LogOut,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import { useStation } from "../../context/StationContext";

// Modallarni import qilish
import UstaModal from "./AddContent/UstaModal";
import NimstansiyaModal from "./AddContent/NimstansiyaModal";
import LiniyaModal from "./AddContent/LiniyaModal";
import AddTransformator from "./AddContent/AddTransformator";

import {
  getUstachilik,
  getNimstansiyalar,
  getLiniyalar,
  getTransformatorlar,
} from "../../services/api";

export default function AddStationForm() {
  const { setusernomi, usernomi } = useStation();

  // --- STATES ---
  const [activeTab, setActiveTab] = useState("ustachilik");
  const [isModalOpen, setIsModalOpen] = useState(false); // Barcha modallar uchun yagona state
  const [editData, setEditData] = useState(null);
  const [stations, setStations] = useState([]);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authForm, setAuthForm] = useState({ username: "", password: "" });
  const [authError, setAuthError] = useState("");

  // --- CONFIGURATION ---
  const menuItems = [
    { id: "ustachilik", label: "Ustachilik bo'limlari", icon: LayoutDashboard },
    { id: "nimstansiya", label: "Nimstansiya", icon: Zap },
    { id: "liniya", label: "Liniya", icon: Radio },
    { id: "transformator", label: "Transformator", icon: Database },
  ];

  const tabTitles = {
    ustachilik: "Ustachilik bo'limlari boshqaruvi",
    nimstansiya: "Nimstansiyalar va PS nazorati",
    liniya: "Havo va kabel liniyalari ro'yxati",
    transformator: "Transformator punktlari (TP/SXP)",
  };

  // --- LOGIC ---
  const loadCurrentTabData = async () => {
    try {
      let res;
      if (activeTab === "ustachilik") res = await getUstachilik();
      else if (activeTab === "nimstansiya")
        res = await getNimstansiyalar("all");
      else if (activeTab === "liniya") res = await getLiniyalar("all");
      else if (activeTab === "transformator")
        res = await getTransformatorlar("all");

      if (res?.data) setStations(res.data);
    } catch (err) {
      console.error(`Xatolik (${activeTab}):`, err);
    }
  };

  useEffect(() => {
    if (usernomi === "Admin") setIsAuthenticated(true);
    if (isAuthenticated) loadCurrentTabData();
  }, [usernomi, activeTab, isAuthenticated]);

  const handleOpenModal = (item = null) => {
    setEditData(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditData(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Ushbu ma'lumotni o'chirishga aminmisiz?")) return;
    try {
      const response = await fetch(
        `http://localhost:5000/api/${activeTab}/${id}`,
        {
          method: "DELETE",
        },
      );
      if (response.ok) {
        setStations((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert("O'chirishda xatolik yuz berdi");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // --- DINAMIK MODAL RENDERER ---
  const renderActiveModal = () => {
    if (!isModalOpen) return null;

    const commonProps = {
      isOpen: isModalOpen,
      onClose: handleCloseModal,
      refreshData: loadCurrentTabData,
      editData: editData,
    };

    switch (activeTab) {
      case "ustachilik":
        return <UstaModal {...commonProps} />;
      case "nimstansiya":
        return <NimstansiyaModal {...commonProps} />;
      case "liniya":
        return <LiniyaModal {...commonProps} />;
      case "transformator":
        return <AddTransformator {...commonProps} activeTab={activeTab} />;
      default:
        return null;
    }
  };

  // --- LOGIN HANDLERS ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (authForm.username === "admin" && authForm.password === "12345") {
      setIsAuthenticated(true);
      setusernomi("Admin");
      localStorage.setItem(
        "admin_auth",
        JSON.stringify(new Date().getTime() + 3600000),
      );
    } else {
      setAuthError("Login yoki parol noto'g'ri!");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#070d18] min-h-screen">
        <div className="w-full max-w-sm bg-[#0a0f1a] border border-white/5 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8 text-blue-500">
            <Lock size={40} className="mx-auto mb-2" />
            <h2 className="text-white text-xl font-bold">Admin Kirish</h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Login"
              className="w-full bg-[#0f1829] border border-white/10 rounded-xl p-3 text-white outline-none"
              onChange={(e) =>
                setAuthForm({ ...authForm, username: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Parol"
              className="w-full bg-[#0f1829] border border-white/10 rounded-xl p-3 text-white outline-none"
              onChange={(e) =>
                setAuthForm({ ...authForm, password: e.target.value })
              }
            />
            {authError && (
              <p className="text-red-500 text-xs italic">{authError}</p>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-white font-bold transition-all"
            >
              Kirish
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full bg-[#0a0f1a] text-slate-300 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-72 border-r border-white/5 bg-[#0a0f1a] flex flex-col shrink-0 h-full">
        <div className="p-8 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 bg-blue-600 rounded-full shadow-lg"></div>
            <h2 className="text-white font-black uppercase text-lg">
              Admin Panel
            </h2>
          </div>
        </div>
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[13px] font-semibold transition-all duration-300 
                ${activeTab === item.id ? "bg-blue-600/10 text-blue-400 ring-1 ring-blue-500/20" : "text-slate-500 hover:bg-white/5"}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5 bg-black/40 shrink-0">
          <button
            onClick={() => {
              localStorage.removeItem("admin_auth");
              window.location.href = "/";
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500/70 hover:text-red-500 font-medium transition-all"
          >
            <LogOut size={18} /> Tizimdan chiqish
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-10 bg-[#070d18]">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {tabTitles[activeTab]}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Boshqaruv paneli orqali ma'lumotlarni qo'shish va tahrirlash.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl text-[13px] font-bold shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
          >
            <Plus size={18} /> Qo'shish
          </button>
        </div>

        {/* JADVAL */}
        <div className="bg-[#1e293b]/20 rounded-xl border border-white/5 overflow-hidden shadow-2xl backdrop-blur-md">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-widest text-slate-500 bg-[#0f172a]/80 border-b border-white/5">
                {activeTab === "ustachilik" && (
                  <>
                    <th className="px-8 py-5">Bo'lim Nomi</th>
                    <th className="px-8 py-5">Usta</th>
                  </>
                )}
                {activeTab === "nimstansiya" && (
                  <>
                    <th className="px-8 py-5">Nomi</th>
                    <th className="px-8 py-5 text-center">Quvvati (kVa)</th>
                  </>
                )}
                {activeTab === "liniya" && (
                  <>
                    <th className="px-8 py-5">Nomi</th>
                    <th className="px-8 py-5 text-center">Jami Uzunlik (km)</th>
                    <th className="px-8 py-5 text-center">Tegishli PS</th>
                  </>
                )}
                {activeTab === "transformator" && (
                  <>
                    <th className="px-8 py-5">TP Raqami</th>
                    <th className="px-8 py-5 text-center">Quvvat</th>
                    <th className="px-8 py-5 text-center">Liniya</th>
                  </>
                )}
                <th className="px-8 py-5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stations.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-white/[0.03] transition-colors group"
                >
                  {activeTab === "ustachilik" && (
                    <>
                      <td className="px-8 py-5 text-white font-bold text-sm">
                        {row.name}
                      </td>
                      <td className="px-8 py-5 text-slate-400 text-sm">
                        {row.usta || "-"}
                      </td>
                    </>
                  )}
                  {activeTab === "nimstansiya" && (
                    <>
                      <td className="px-8 py-5 text-white font-bold text-sm">
                        {row.name}
                      </td>
                      <td className="px-8 py-5 text-center italic font-mono text-xs text-blue-400">
                        {row.quvvat} kVa
                      </td>
                    </>
                  )}
                  {activeTab === "liniya" && (
                    <>
                      <td className="px-8 py-5 text-white font-bold text-sm">
                        {row.name}
                      </td>
                      <td className="px-8 py-5 text-center text-amber-400 font-mono font-bold text-sm">
                        {row.jami_uzunligi} km
                      </td>
                      <td className="px-8 py-5 text-center text-slate-500 text-sm italic">
                        {row.parentName || "Birikmagan"}
                      </td>
                    </>
                  )}
                  {activeTab === "transformator" && (
                    <>
                      <td className="px-8 py-5 text-white font-bold text-sm">
                        {row.tp_raqami}
                      </td>
                      <td className="px-8 py-5 text-center text-blue-400 font-mono font-bold text-sm">
                        {row.quvvat}
                      </td>
                      <td className="px-8 py-5 text-center text-slate-500 text-sm italic">
                        {row.parentName || "Liniya yo'q"}
                      </td>
                    </>
                  )}
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={() => handleOpenModal(row)}
                        className="px-4 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-[11px] font-bold border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all"
                      >
                        Tahrirlash
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="px-4 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-[11px] font-bold border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                      >
                        O'chirish
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Dinamik modal bu yerda render qilinadi */}
        {renderActiveModal()}
      </main>
    </div>
  );
}
