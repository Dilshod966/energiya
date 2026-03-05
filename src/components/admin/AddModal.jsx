import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  getUstachilik,
  getNimstansiyalar,
  getLiniyalar,
  API, // Axios instance
} from "../../services/api";

export default function AddModal({ isOpen, onClose, type, refreshData }) {
  const [parentList, setParentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hisob: "Yuridik", // Default holat (masalan, Yuridik/Jismoniy yoki boshqa variantlar)
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({ hisob: "Yuridik" }); // Default qiymat bilan tozalash
      setParentList([]);

      const fetchData = async () => {
        setLoading(true);
        try {
          if (type === 2) {
            const res = await getUstachilik();
            setParentList(res.data);
          } else if (type === 3) {
            const res = await getNimstansiyalar("all");
            setParentList(res.data);
          } else if (type === 4) {
            const res = await getLiniyalar("all");
            setParentList(res.data);
          }
        } catch (err) {
          console.error("Ma'lumot yuklashda xato:", err);
        }
        setLoading(false);
      };

      fetchData();
    }
  }, [isOpen, type]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Radio button tanlanganda ishlaydi
  const handleTypeSelect = (value) => {
    setFormData({ ...formData, tur: value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // 1. Validatsiya: parentId 0 yoki bo'sh bo'lmasligi kerak (Type 1 dan tashqari)
    if (type !== 1 && (!formData.parentId || formData.parentId === "0")) {
      alert("Iltimos, tegishli ota elementni tanlang!");
      return;
    }

    // 2. Ma'lumotlarni tayyorlash
    const prepareData = () => {
      const base = {
        name: formData.name,
        // Bazadagi 'hisob' ustuni uchun: tet yoki istemol
        hisob: formData.tur === "Yuridik" ? "tet" : "istemol",
        parentId: type !== 1 ? Number(formData.parentId) : null,
        // MUHIM: Backend 'turi' ustunini barcha jadvallarda talab qilayotgan bo'lishi mumkin
        turi: formData.turi || "Standart",
      };

      switch (type) {
        case 1: // Ustachilik
          return { name: formData.name, usta: formData.usta };
        case 2: // Nimstansiya
          return { ...base, quvvat: formData.quvvat };
        case 3: // Liniya
          return { ...base, uzunlik: formData.uzunligi }; // Bazada 'uzunlik', inputda 'uzunligi'
        case 4: // Transformator
          return {
            ...base,
            quvvat: formData.quvvat,
            holat: formData.holat || "Ishchi",
          };
        default:
          return base;
      }
    };

    const urls = {
      1: "/ustachilik",
      2: "/nimstansiya",
      3: "/liniya",
      4: "/transformator",
    };

    try {
      const dataToSend = prepareData();
      console.log("Yuborilayotgan yakuniy ma'lumot:", dataToSend);

      const response = await API.post(urls[type], dataToSend);

      if (response.status === 200 || response.status === 201) {
        onClose();
        if (refreshData) refreshData();
        alert("Muvaffaqiyatli saqlandi!");
      }
    } catch (err) {
      console.error("Xatolik tafsiloti:", err.response?.data);
      // Backenddan kelgan aniq xatoni ko'rsatish
      const serverError = err.response?.data?.error || "Serverda xatolik";
      alert(`Xato: ${serverError}`);
    }
  };
  // Radio-tugmalar komponenti
  const RadioToggle = () => (
    <div className="flex p-1 bg-slate-800 rounded-2xl mb-4 border border-slate-700">
      <button
        type="button"
        onClick={() => handleTypeSelect("Yuridik")}
        className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
          formData.hisob === "Yuridik"
            ? "bg-blue-600 text-white shadow-lg"
            : "text-slate-400 hover:text-white"
        }`}
      >
        TET hisobida
      </button>
      <button
        type="button"
        onClick={() => handleTypeSelect("Jismoniy")}
        className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
          formData.hisob === "Jismoniy"
            ? "bg-blue-600 text-white shadow-lg"
            : "text-slate-400 hover:text-white"
        }`}
      >
        Istemolchi hisobida
      </button>
    </div>
  );

  const renderForm = () => {
    if (loading)
      return (
        <div className="text-blue-400 text-center p-10 font-medium">
          Ma'lumotlar yuklanmoqda...
        </div>
      );

    return (
      <div className="space-y-4">
        {/* Sarlavhalar */}
        {type === 1 && (
          <h3 className="text-xl font-bold text-blue-500 mb-2">
            Ustachilik qo'shish
          </h3>
        )}
        {type === 2 && (
          <h3 className="text-xl font-bold text-blue-500 mb-2">
            Nimstansiya qo'shish
          </h3>
        )}
        {type === 3 && (
          <h3 className="text-xl font-bold text-blue-500 mb-2">
            Liniya qo'shish
          </h3>
        )}
        {type === 4 && (
          <h3 className="text-xl font-bold text-blue-500 mb-2">
            Transformator qo'shish
          </h3>
        )}

        {/* Ustachilikdan boshqa hamma joyda Radio chiqadi */}
        {type !== 1 && <RadioToggle />}

        {/* Dynamic Selectlar */}
        {type !== 1 && (
          <select
            name="parentId"
            onChange={handleInputChange}
            className="w-full p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 ring-blue-500/50"
          >
            <option value="">
              Tegishli{" "}
              {type === 2
                ? "Ustachilik"
                : type === 3
                  ? "Nimstansiya"
                  : "Liniya"}{" "}
              tanlang
            </option>
            {parentList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        )}

        {/* Umumiy inputlar */}
        <input
          name="name"
          onChange={handleInputChange}
          type="text"
          placeholder="Nomi"
          className="w-full p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 ring-blue-500/50"
        />

        {type === 1 && (
          <input
            name="usta"
            onChange={handleInputChange}
            type="text"
            placeholder="Usta ismi"
            className="w-full p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 ring-blue-500/50"
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          {type === 2 && (
            <>
              <input
                name="turi"
                onChange={handleInputChange}
                type="text"
                placeholder="Turi (kV)"
                className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 ring-blue-500/50"
              />
              <input
                name="quvvat"
                onChange={handleInputChange}
                type="text"
                placeholder="Quvvati"
                className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 ring-blue-500/50"
              />
            </>
          )}
          {type === 3 && (
            <>
              <input
                name="turi"
                onChange={handleInputChange}
                type="text"
                placeholder="Turi"
                className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 ring-blue-500/50"
              />
              <input
                name="uzunlik"
                onChange={handleInputChange}
                type="text"
                placeholder="Uzunligi (km)"
                className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 ring-blue-500/50"
              />
            </>
          )}
          {type === 4 && (
            <>
              <input
                name="quvvat"
                onChange={handleInputChange}
                type="text"
                placeholder="Quvvati"
                className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 ring-blue-500/50"
              />
              <select
                name="holat"
                onChange={handleInputChange}
                className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none"
              >
                <option value="Ishchi">Ishchi</option>
                <option value="Nosoz">Nosoz</option>
              </select>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            className="relative w-full max-w-lg bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl"
          >
            <form onSubmit={onSubmit}>
              {renderForm()}
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 bg-slate-800 text-slate-300 rounded-2xl hover:bg-slate-700 transition-all font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 shadow-xl shadow-blue-900/40 transition-all font-semibold"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
