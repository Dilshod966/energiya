import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Plus,
  Zap,
  Radio,
  Database,
  Lock,
  LogOut,
  Wrench,
  Pencil,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  Search,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";
import "leaflet/dist/leaflet.css";
import { useStation } from "../../context/StationContext";

// Modallarni import qilish
import UstaModal from "./AddContent/UstaModal";
import NimstansiyaModal from "./AddContent/NimstansiyaModal";
import LiniyaModal from "./AddContent/LiniyaModal";
import AddTransformator from "./AddContent/AddTransformator";
import QilinganIshlarModal from "./AddContent/QilinganIshlarModal";
import TugatishModal from "./AddContent/TugatishModal";

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

  const [ishlar, setIshlar] = useState([]);
  const [tugatishIsh, setTugatishIsh] = useState(null);
  const [filterSana, setFilterSana] = useState("");
  const [filterHolati, setFilterHolati] = useState("");
  const [filterNaryad, setFilterNaryad] = useState("");

  // Liniya va transformator filterlari
  const [filterNomi, setFilterNomi] = useState("");
  const [filterOta, setFilterOta] = useState("");
  const [filterHisob, setFilterHisob] = useState("");

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authForm, setAuthForm] = useState({ username: "", password: "" });
  const [authError, setAuthError] = useState("");

  // --- CONFIGURATION ---
  const menuItems = [
    { id: "ustachilik", label: "Ustachilik bo'limlari", icon: LayoutDashboard },
    { id: "nimstansiya", label: "Nimstansiya", icon: Zap },
    { id: "liniya", label: "Liniya", icon: Radio },
    { id: "transformator", label: "Transformator", icon: Database },
    { id: "qilinganishlar", label: "Qilingan Ishlar", icon: Wrench },
  ];

  const tabTitles = {
    ustachilik: "Ustachilik bo'limlari boshqaruvi",
    nimstansiya: "Nimstansiyalar va PS nazorati",
    liniya: "Havo va kabel liniyalari ro'yxati",
    transformator: "Transformator punktlari (TP/SXP)",
    qilinganishlar: "Qilingan Ishlar ro'yxati",
  };

  // --- LOGIC ---
  const loadCurrentTabData = async () => {
    try {
      if (activeTab === "qilinganishlar") {
        const r = await fetch("http://localhost:5000/api/ish");
        const data = await r.json();
        setIshlar(Array.isArray(data) ? data : []);
        return;
      }
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

  const handleTugatish = (ish) => {
    setTugatishIsh(ish);
  };

  const handleDeleteIsh = async (id) => {
    if (!window.confirm("Ushbu ishni o'chirishga aminmisiz?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/ish/${id}`, {
        method: "DELETE",
      });
      if (res.ok) setIshlar((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Delete ish error:", err);
    }
  };

  const filteredIshlar = ishlar.filter((i) => {
    const sana = String(i.ish_kun || "").split("T")[0];
    const holat = (i.status || "Jarayonda").toLowerCase();
    const naryad = (i.naryad_raqami || "").toLowerCase();
    if (filterSana && sana !== filterSana) return false;
    if (filterHolati && holat !== filterHolati.toLowerCase()) return false;
    if (filterNaryad && !naryad.includes(filterNaryad.toLowerCase())) return false;
    return true;
  });

  const handleIshlarExcel = () => {
    const data = filteredIshlar.map((i) => {
      const ishchilar = Array.isArray(i.ishchilar)
        ? i.ishchilar.map((w) => `${w.lavozim}: ${w.ism_familiya}`).join(", ")
        : `${i.ism || ""} ${i.familiya || ""}`.trim();
      return {
        "ID": i.id,
        "Tur": i.tur,
        "Ob'ekt nomi": i.ob_nomi,
        "Ishchilar": ishchilar,
        "Naryad / Farmoyish": i.naryad_raqami || "",
        "Holati": i.status || "Jarayonda",
        "Ish kuni": String(i.ish_kun || "").split("T")[0],
        "Soat": String(i.ish_soat || "").slice(0, 5),
        "Qo'shilgan vaqt": i.created_at,
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Qilingan Ishlar");
    XLSX.writeFile(wb, "qilingan_ishlar.xlsx");
  };

  // Liniya / Transformator filter
  const otaOptions = [...new Set(stations.map((s) => s.parentName).filter(Boolean))].sort();

  const filteredStations = stations.filter((s) => {
    if (activeTab === "liniya") {
      if (filterNomi && !(s.name || "").toLowerCase().includes(filterNomi.toLowerCase())) return false;
      if (filterOta && s.parentName !== filterOta) return false;
    } else if (activeTab === "transformator") {
      if (filterNomi && !(s.tp_raqami || "").toLowerCase().includes(filterNomi.toLowerCase())) return false;
      if (filterOta && s.parentName !== filterOta) return false;
      if (filterHisob && (s.hisob || "") !== filterHisob) return false;
    }
    return true;
  });

  const formatIshDate = (d) => {
    if (!d) return "";
    const s = String(d).split("T")[0];
    const parts = s.split("-");
    if (parts.length !== 3) return s;
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  };

  useEffect(() => {
    if (usernomi === "Admin") setIsAuthenticated(true);
    if (isAuthenticated) loadCurrentTabData();
    setFilterNomi("");
    setFilterOta("");
    setFilterHisob("");
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
      case "qilinganishlar":
        return <QilinganIshlarModal {...commonProps} />;
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
          <div className="flex gap-3">
            {activeTab === "qilinganishlar" && (
              <button
                onClick={handleIshlarExcel}
                className="flex items-center gap-2 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 px-5 py-3 rounded-2xl text-[13px] font-bold active:scale-95 transition-all"
              >
                <FileSpreadsheet size={16} /> Excel
              </button>
            )}
            <button
              onClick={() => handleOpenModal()}
              className={`flex items-center gap-2 text-white px-6 py-3 rounded-2xl text-[13px] font-bold shadow-xl active:scale-95 transition-all ${
                activeTab === "qilinganishlar"
                  ? "bg-violet-600 hover:bg-violet-500 shadow-violet-600/20"
                  : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20"
              }`}
            >
              <Plus size={18} /> Qo'shish
            </button>
          </div>
        </div>

        {/* JADVAL yoki CHAT KO'RINISH */}
        {activeTab === "qilinganishlar" ? (
          <div className="space-y-4">
            {/* FILTERLAR */}
            <div className="flex flex-wrap gap-3 p-4 bg-[#0f1829] border border-white/5 rounded-2xl">
              <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                <label className="text-[9px] uppercase tracking-widest text-slate-500">Sana bo'yicha</label>
                <input
                  type="date"
                  value={filterSana}
                  onChange={(e) => setFilterSana(e.target.value)}
                  className="bg-[#070d18] border border-white/10 rounded-xl px-3 py-2 text-[12px] text-white outline-none focus:border-violet-500/40 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
                <label className="text-[9px] uppercase tracking-widest text-slate-500">Holati</label>
                <select
                  value={filterHolati}
                  onChange={(e) => setFilterHolati(e.target.value)}
                  className="bg-[#070d18] border border-white/10 rounded-xl px-3 py-2 text-[12px] text-white outline-none focus:border-violet-500/40 transition-all"
                >
                  <option value="">Barchasi</option>
                  <option value="Jarayonda">Jarayonda</option>
                  <option value="Tugallandi">Tugallandi</option>
                </select>
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                <label className="text-[9px] uppercase tracking-widest text-slate-500">Naryad / Farmoyish</label>
                <input
                  type="text"
                  value={filterNaryad}
                  onChange={(e) => setFilterNaryad(e.target.value)}
                  placeholder="Raqam yoki nom..."
                  className="bg-[#070d18] border border-white/10 rounded-xl px-3 py-2 text-[12px] text-white placeholder:text-slate-600 outline-none focus:border-violet-500/40 transition-all"
                />
              </div>
              {(filterSana || filterHolati || filterNaryad) && (
                <div className="flex flex-col gap-1 justify-end">
                  <label className="text-[9px] uppercase tracking-widest text-slate-500 opacity-0">x</label>
                  <button
                    onClick={() => { setFilterSana(""); setFilterHolati(""); setFilterNaryad(""); }}
                    className="px-4 py-2 rounded-xl text-[11px] font-semibold text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all"
                  >
                    Tozalash
                  </button>
                </div>
              )}
            </div>

            {/* ISHLAR RO'YXATI */}
            {filteredIshlar.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-600">
                <Wrench size={40} className="mb-4 opacity-30" />
                <p className="text-sm">Hech qanday ish topilmadi</p>
              </div>
            ) : (
              filteredIshlar.map((ish) => {
                const isLiniya = ish.tur === "liniya";
                const status = ish.status || "Jarayonda";
                const statusStyle =
                  status === "Tugallandi"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20";

                const ishchilar = Array.isArray(ish.ishchilar) && ish.ishchilar.length > 0
                  ? ish.ishchilar
                  : ish.ism || ish.familiya
                  ? [{ lavozim: "", ism_familiya: `${ish.ism || ""} ${ish.familiya || ""}`.trim() }]
                  : [];

                return (
                  <div
                    key={ish.id}
                    className="flex gap-0 rounded-2xl bg-[#0f1829] border border-white/5 hover:border-white/10 overflow-hidden transition-all duration-200"
                  >
                    {/* Left color stripe */}
                    <div className={`w-1 flex-shrink-0 ${isLiniya ? "bg-amber-500" : "bg-blue-500"}`} />
                    {/* Content */}
                    <div className="flex-1 min-w-0 px-5 py-4">
                      {/* Top: tur badge + ob'ekt nomi + status */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0 ${
                          isLiniya
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}>
                          {isLiniya ? "Liniya" : "Transformator"}
                        </span>
                        <span className="text-white font-bold text-[13px] truncate flex-1">
                          {ish.ob_nomi}
                        </span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border flex-shrink-0 ${statusStyle}`}>
                          {status}
                        </span>
                      </div>
                      {/* Naryad */}
                      {ish.naryad_raqami && (
                        <p className="text-slate-400 text-[11px] mb-2 font-mono">
                          📋 {ish.naryad_raqami}
                        </p>
                      )}
                      {/* Ishchilar */}
                      {ishchilar.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {ishchilar.map((w, idx) => (
                            <span key={idx} className="text-[11px] text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-lg px-2.5 py-0.5">
                              {w.lavozim ? <><span className="text-violet-500">{w.lavozim}</span> · {w.ism_familiya}</> : w.ism_familiya}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Bottom: sana/soat + amallar */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        {/* Boshlanish va tugash vaqti */}
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Boshlanish */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-slate-600 uppercase tracking-wider">Boshlandi</span>
                            <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded-md">
                              {formatIshDate(ish.boshlanish_kun || ish.ish_kun)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono bg-white/5 px-2 py-0.5 rounded-md">
                              {String(ish.boshlanish_soat || ish.ish_soat || "").slice(0, 5)}
                            </span>
                          </div>
                          <span className="text-slate-700">→</span>
                          {/* Tugash */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-slate-600 uppercase tracking-wider">Tugadi</span>
                            {ish.tugash_kun ? (
                              <>
                                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                  {formatIshDate(ish.tugash_kun)}
                                </span>
                                <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                  {String(ish.tugash_soat || "").slice(0, 5)}
                                </span>
                              </>
                            ) : (
                              <span className="text-[10px] text-slate-600 font-mono bg-white/5 px-2 py-0.5 rounded-md italic">
                                —
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Amallar tugmalari */}
                        <div className="flex items-center gap-1.5">
                          {status !== "Tugallandi" && (
                            <button
                              onClick={() => handleOpenModal(ish)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white text-[11px] font-semibold transition-all"
                            >
                              <Pencil size={11} /> Tahrirlash
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteIsh(ish.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white text-[11px] font-semibold transition-all"
                          >
                            <Trash2 size={11} /> O'chirish
                          </button>
                          {status === "Jarayonda" && (
                            <button
                              onClick={() => handleTugatish(ish)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white text-[11px] font-semibold transition-all"
                            >
                              <CheckCircle2 size={11} /> Tugatish
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-4">
          {/* ── Liniya / Transformator filterlari ── */}
          {(activeTab === "liniya" || activeTab === "transformator") && (
            <div className="flex flex-wrap gap-3 p-4 bg-[#0f1829] border border-white/5 rounded-2xl">
              {/* Nomi qidiruv */}
              <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
                <label className="text-[9px] uppercase tracking-widest text-slate-500">
                  {activeTab === "liniya" ? "Liniya nomi" : "TP raqami"}
                </label>
                <div className="relative">
                  <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    value={filterNomi}
                    onChange={(e) => setFilterNomi(e.target.value)}
                    placeholder={activeTab === "liniya" ? "Nomi bo'yicha..." : "TP raqami bo'yicha..."}
                    className="w-full bg-[#070d18] border border-white/10 rounded-xl pl-8 pr-4 py-2 text-[12px] text-white placeholder:text-slate-600 outline-none focus:border-blue-500/40 transition-all"
                  />
                  {filterNomi && (
                    <button onClick={() => setFilterNomi("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                      <X size={11} />
                    </button>
                  )}
                </div>
              </div>

              {/* Ota select */}
              <div className="flex flex-col gap-1 w-auto">
                <label className="text-[9px] uppercase tracking-widest text-slate-500">
                  {activeTab === "liniya" ? "Nimstansiya (ota)" : "Liniya (ota)"}
                </label>
                <select
                  value={filterOta}
                  onChange={(e) => setFilterOta(e.target.value)}
                  className="bg-[#070d18] border border-white/10 rounded-xl px-3 py-2 text-[12px] text-white outline-none focus:border-blue-500/40 transition-all"
                >
                  <option value="">— tanlang —</option>
                  {otaOptions.map((ota) => (
                    <option key={ota} value={ota}>{ota}</option>
                  ))}
                </select>
              </div>

              {/* TET / ISTE'MOL — faqat transformator tabida */}
              {activeTab === "transformator" && (
                <div className="flex flex-col gap-1 min-w-[160px]">
                  <label className="text-[9px] uppercase tracking-widest text-slate-500">Hisob turi</label>
                  <div className="flex gap-1.5">
                    {[
                      { val: "tet",     label: "TET",      cls: filterHisob === "tet"     ? "bg-blue-500/15 border-blue-500/40 text-blue-400"     : "border-white/10 text-slate-400 hover:border-blue-500/30 hover:text-blue-400" },
                      { val: "istemol", label: "Iste'mol", cls: filterHisob === "istemol" ? "bg-amber-500/15 border-amber-500/40 text-amber-400" : "border-white/10 text-slate-400 hover:border-amber-500/30 hover:text-amber-400" },
                    ].map(({ val, label, cls }) => (
                      <button
                        key={val}
                        onClick={() => setFilterHisob(filterHisob === val ? "" : val)}
                        className={`px-4 py-2 rounded-xl border text-[11px] font-semibold transition-all ${cls}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tozalash */}
              {(filterNomi || filterOta || filterHisob) && (
                <div className="flex flex-col gap-1 justify-end">
                  <label className="text-[9px] uppercase tracking-widest text-slate-500 opacity-0">x</label>
                  <button
                    onClick={() => { setFilterNomi(""); setFilterOta(""); setFilterHisob(""); }}
                    className="px-4 py-2 rounded-xl text-[11px] font-semibold text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all flex items-center gap-1.5"
                  >
                    <X size={11} /> Tozalash
                  </button>
                </div>
              )}

              {/* Natija soni */}
              {(filterNomi || filterOta || filterHisob) && (
                <div className="w-full">
                  <p className="text-[10px] text-slate-500">
                    {filteredStations.length} ta natija
                  </p>
                </div>
              )}
            </div>
          )}

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
                {filteredStations.map((row) => (
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
          </div>
        )}
        {/* Dinamik modal bu yerda render qilinadi */}
        {renderActiveModal()}
        <TugatishModal
          isOpen={!!tugatishIsh}
          ish={tugatishIsh}
          onClose={() => setTugatishIsh(null)}
          onSuccess={() => {
            loadCurrentTabData();
            setTugatishIsh(null);
          }}
        />
      </main>
    </div>
  );
}
