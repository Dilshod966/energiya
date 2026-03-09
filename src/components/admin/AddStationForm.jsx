import { useState, useEffect, use } from "react";
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
import AddModal from "./AddModal";
import {
  getUstachilik,
  getNimstansiyalar,
  getLiniyalar,
  API,
  getTransformatorlar, // Axios instance
} from "../../services/api";

export default function AddStationForm() {
  const { setusernomi, usernomi } = useStation();
  const [modalOpen, setmodalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ustachilik");
  const typeMapping = {
    ustachilik: 1,
    nimstansiya: 2,
    liniya: 3,
    transformator: 4,
  };
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
  // --- LOGIN HOLATLARI ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authForm, setAuthForm] = useState({ username: "", password: "" });
  const [authError, setAuthError] = useState("");

  const [stations, setStations] = useState([]);

  const loadCurrentTabData = async () => {
    try {
      let res;
      // activeTab qiymatiga qarab tegishli API chaqiriladi
      if (activeTab === "ustachilik") res = await getUstachilik();
      else if (activeTab === "nimstansiya")
        res = await getNimstansiyalar("all");
      else if (activeTab === "liniya") res = await getLiniyalar("all");
      else if (activeTab === "transformator")
        res = await getTransformatorlar("all");

      setStations(res.data);
    } catch (err) {
      console.error("Xatolik:", err);
    }
  };
  useEffect(() => {
    if (usernomi === "Admin") {
      setIsAuthenticated(true);
    }
    if (isAuthenticated) {
      loadCurrentTabData();
    }
  }, [usernomi, activeTab, isAuthenticated]);

  const handleDelete = async (id) => {
    // 1. Foydalanuvchidan tasdiqlash so'rash
    if (!window.confirm("Ushbu ma'lumotni o'chirishga aminmisiz?")) return;

    try {
      // 2. Backendga DELETE so'rovi yuborish
      // activeTab orqali endpoint dinamik aniqlanadi (ustachilik, nimstansiya, va h.k.)
      const response = await fetch(
        `http://localhost:5000/api/${activeTab}/${id}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        // 3. MUHIM: setData emas, setStations ishlatamiz!
        setStations((prevStations) =>
          prevStations.filter((item) => item.id !== id),
        );

      } else {
        // Server xatolik qaytarsa (masalan 404 yoki 500)
        const errorData = await response.json();
        alert(
          "Xatolik: " + (errorData.error || "O'chirishda xatolik yuz berdi"),
        );
      }
    } catch (error) {
      // Tarmoq xatosi yoki server o'chiq bo'lsa
      console.error("O'chirishda xatolik:", error);
      alert(
        "Server bilan bog'lanishda xatolik yuz berdi. Backend ishlayotganini tekshiring.",
      );
    }
  };
  // Loginni tekshirish
  const handleLogin = (e) => {
    e.preventDefault();

    // Login: admin, Parol: 12345 (O'zingiz xohlaganga o'zgartiring)
    if (authForm.username === "admin" && authForm.password === "12345") {
      const now = new Date().getTime();
      const expiryTime = now + 1 * 60 * 60 * 1000; // 1 soat (millisekundda)
      setIsAuthenticated(true);
      setusernomi("Admin");
      localStorage.setItem("admin_auth", JSON.stringify(expiryTime));
      setAuthError("");
      setAuthForm({ username: "", password: "" });
    } else {
      setAuthError("Login yoki parol noto'g'ri!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    setusernomi(null);
    window.location.href = "/";
  };

  // --- 1. LOGIN OYNASI ---
  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#070d18] p-6 min-h-screen">
        <div className="w-full max-w-sm bg-[#0a0f1a] border border-white/5 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-500/10 mb-4 text-blue-500">
              <Lock size={28} />
            </div>
            <h2 className="text-xl font-bold text-white">Xavfsiz Kirish</h2>
            <p className="text-slate-500 text-sm mt-1">
              Davom etish uchun autentifikatsiya zarur
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                Foydalanuvchi
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-3 text-slate-600"
                />
                <input
                  type="text"
                  className="w-full bg-[#0f1829] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50"
                  placeholder="login..."
                  value={authForm.username}
                  autoComplete="off"
                  onChange={(e) =>
                    setAuthForm({ ...authForm, username: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">
                Maxfiy Kod
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-3 text-slate-600"
                />
                <input
                  type="password"
                  className="w-full bg-[#0f1829] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50"
                  placeholder="parol..."
                  value={authForm.password}
                  autoComplete="off"
                  onChange={(e) =>
                    setAuthForm({ ...authForm, password: e.target.value })
                  }
                />
              </div>
            </div>

            {authError && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 p-2.5 rounded-lg border border-red-400/20">
                <AlertCircle size={14} /> {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              Tizimga Kirish
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- 2. ASOSIY FORMA ---
  return (
    <div className="flex w-full h-full bg-[#0a0f1a] text-slate-300 font-sans overflow-hidden">
      {/* --- SIDEBAR --- */}
      {/* h-full va overflow-hidden sidebar o'zidan tashqariga chiqib ketmasligini ta'minlaydi */}
      <aside className="w-72 border-r border-white/5 bg-[#0a0f1a] flex flex-col shrink-0 h-full overflow-hidden">
        {/* Header - Shrink-0 orqali tepada qotiramiz */}
        <div className="p-8 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-6 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
            <h2 className="text-white font-black tracking-tighter uppercase text-lg leading-none">
              Admin Panel
            </h2>
          </div>
        </div>

        {/* Nav - flex-grow va overflow-y-auto faqat menyu qismini skroll qiladi */}
        <nav className="flex-grow p-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[13px] font-semibold transition-all duration-300 group
                ${
                  activeTab === item.id
                    ? "bg-blue-600/10 text-blue-400 ring-1 ring-blue-500/20 shadow-inner"
                    : "text-slate-500 hover:bg-white/5 hover:text-slate-200"
                }`}
            >
              <item.icon
                size={18}
                className={`${activeTab === item.id ? "text-blue-400" : "text-slate-600"} transition-colors`}
              />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Tugma qismi - mt-auto va shrink-0 uni doim eng pastga mixlab qo'yadi */}
        <div className="mt-auto p-4 border-t border-white/5 bg-black/40 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium text-red-500/70 hover:bg-red-500/10 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
          >
            <LogOut size={18} />
            Tizimdan chiqish
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto p-10 bg-[#070d18] bg-gradient-to-b from-[#0f172a]/20 to-transparent">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
              {tabTitles[activeTab] || "Ma'lumotlar jadvali"}
            </h1>
            <p className="text-slate-500 text-sm">
              Barcha ma'lumotlarni tahrirlash va boshqarish paneli.
            </p>
          </div>
          <button
            onClick={() => {
              setmodalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl text-[13px] font-bold transition-all shadow-xl shadow-blue-600/20 active:scale-95 shrink-0"
          >
            <Plus size={18} /> Qo'shish
          </button>
          <AddModal
            isOpen={modalOpen}
            type={typeMapping[activeTab]} // Liniya sahifasida bo'lsangiz 3, Nimstansiyada 2 va h.k.
            onClose={() => setmodalOpen(false)}
            refreshData={() => loadCurrentTabData()} // Sahifadagi ma'lumotlarni qayta yuklovchi funksiya
          />
        </div>

        {/* --- DYNAMIC TABLE --- */}
        <div className="bg-[#1e293b]/20 rounded-[1rem] border border-white/5 overflow-hidden shadow-2xl backdrop-blur-md">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.2em] text-slate-500 bg-[#0f172a]/80 border-b border-white/5">
                {stations.length > 0 &&
                  Object.keys(stations[0])
                    .filter((key) => key !== "id" && key !== "parentId") // Yashirin maydonlarni o'chiramiz
                    .map((key, idx) => (
                      <th
                        key={idx}
                        className="px-8 py-5 font-bold text-slate-400 text-xs uppercase"
                      >
                        {/* Key nomini chiroyli qilish, masalan: name -> Nomi */}
                        {key === "name"
                          ? "Nomi"
                          : key === "usta"
                            ? "Mas'ul"
                            : key === "quvvat"
                              ? "Quvvati"
                              : key}
                      </th>
                    ))}
                <th className="px-8 py-5 text-right font-bold">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stations.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-white/[0.03] transition-colors group border-b border-white/[0.02]"
                >
                  {Object.entries(row)
                    // id va parentId ni jadvalda ko'rsatmaymiz, faqat ma'lumotlarni chiqaramiz
                    .filter(([key]) => key !== "id" && key !== "parentId")
                    .map(([key, val], i) => (
                      <td
                        key={key} // i o'rniga key ishlatish yaxshiroq
                        className={`px-8 py-5 text-sm ${
                          i === 0
                            ? "text-white font-extrabold"
                            : "text-slate-400"
                        }`}
                      >
                        {/* Ma'lumot null bo'lsa bo'sh joy ko'rsatish */}
                        {val !== null ? val : "-"}
                      </td>
                    ))}

                  {/* Amallar tugmalari */}
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                      <button
                        onClick={() => handleEdit(row)} // Tahrirlash funksiyasi
                        className="px-4 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-[11px] font-bold border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all"
                      >
                        Tahrirlash
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)} // O'chirish funksiyasi
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
          {stations.length === 0 && (
            <div className="p-20 text-center text-slate-600 italic">
              Ma'lumotlar mavjud emas...
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
