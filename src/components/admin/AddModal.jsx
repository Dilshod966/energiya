import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  getUstachilik,
  getNimstansiyalar,
  getLiniyalar,
  API,
} from "../../services/api";

export default function AddModal({
  isOpen,
  onClose,
  type,
  refreshData,
  editData,
}) {
  const [parentList, setParentList] = useState([]);
  const [loading, setLoading] = useState(false);

  // State barcha maydonlar bilan
  const [formData, setFormData] = useState({
    name: "",
    hisob: "Yuridik", // Radio tugma uchun
    parentId: "",
    turi: "",
    quvvat: "",
    uzunlik: "",
    usta: "",
    holat: "Ishchi",
  });

  // 1. Ro'yxatni yuklash (Ustachilik, Nimstansiya yoki Liniya)
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoading(true);
        try {
          let res;
          if (type === 2) res = await getUstachilik();
          else if (type === 3) res = await getNimstansiyalar("all");
          else if (type === 4) res = await getLiniyalar("all");

          if (res) {
            setParentList(res.data);
          }
        } catch (err) {
          console.error("Yuklashda xato:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, type]);

  // 2. Tahrirlash ma'lumotlarini formaga joylash
  useEffect(() => {
    if (isOpen && editData) {
      console.log(editData)
      setFormData({
        name: editData.name || "",
        hisob: editData.hisob === "tet" ? "Yuridik" : "Jismoniy",
        // Ma'lumotni stringga o'girish muhim
        parentId:
          editData.parentId !== undefined ? String(editData.parentId) : "",
        turi: editData.turi || "",
        quvvat: editData.quvvat || "",
        uzunlik: editData.uzunlik || "",
        usta: editData.usta || "",
        holat: editData.holat || "Ishchi",
      });
    } else if (isOpen && !editData) {
      // Agar yangi qo'shish bo'lsa formani tozalash
      setFormData({
        name: "",
        hisob: "Yuridik",
        parentId: "",
        turi: "",
        quvvat: "",
        uzunlik: "",
        usta: "",
        holat: "Ishchi",
      });
    }
  }, [isOpen, editData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (value) => {
    setFormData((prev) => ({ ...prev, hisob: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // 1. Tekshiruv: Ustachilikdan boshqa hamma narsada ota element bo'lishi shart
    if (type !== 1 && !formData.parentId) {
      alert("Iltimos, tegishli ota elementni tanlang!");
      return;
    }

    // 2. Backendga yuboriladigan ma'lumotni tayyorlash
    const prepareData = () => {
      const common = {
        name: formData.name,
        turi: formData.turi || "Standart",
        hisob: formData.hisob === "Yuridik" ? "tet" : "istemol",
      };

      switch (type) {
        case 1:
          return { name: formData.name, usta: formData.usta };
        case 2:
          return {
            ...common,
            parentId: Number(formData.parentId),
            quvvat: formData.quvvat,
          };
        case 3:
          return {
            ...common,
            parentId: Number(formData.parentId),
            uzunlik: formData.uzunlik,
          };
        case 4:
          return {
            ...common,
            parentId: Number(formData.parentId),
            quvvat: formData.quvvat,
            holat: formData.holat,
          };
        default:
          return common;
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
      let response;

      // --- ASOSIY O'ZGARISh SHU YERDA ---
      if (editData && editData.id) {
        // Agar editData bo'lsa - tahrirlaymiz (PUT)
        // URL: /api/liniya/5 (masalan)
        response = await API.put(`${urls[type]}/${editData.id}`, dataToSend);
      } else {
        // Agar editData bo'lmasa - yangi qo'shamiz (POST)
        // URL: /api/liniya
        response = await API.post(urls[type], dataToSend);
      }

      if (response.status === 200 || response.status === 201) {
        onClose(); // Modalni yopish
        if (refreshData) refreshData(); // Jadvalni yangilash
      }
    } catch (err) {
      const serverError = err.response?.data?.error || "Serverda xatolik";
      alert(`Xato: ${serverError}`);
    }
  };
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
        Iste'molchi hisobida
      </button>
    </div>
  );

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
            {loading ? (
              <div className="text-blue-400 text-center p-10 font-medium italic">
                Ma'lumotlar yuklanmoqda...
              </div>
            ) : (
              <form onSubmit={onSubmit}>
                <h3 className="text-xl font-bold text-blue-500 mb-6">
                  {type === 1
                    ? "Ustachilik"
                    : type === 2
                      ? "Nimstansiya"
                      : type === 3
                        ? "Liniya"
                        : "Transformator"}{" "}
                  {editData ? "o'zgartirish" : "qo'shish"}
                </h3>

                {type !== 1 && <RadioToggle />}

                <div className="space-y-4">
                  {type !== 1 && (
                    <select
                      name="parentId"
                      // formData.parentId string ekanligiga ishonch hosil qiling
                      value={String(formData.parentId || "")}
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
                        <option key={item.id} value={String(item.id)}>
                          {" "}
                          {/* ID ni string qilamiz */}
                          {item.name}
                        </option>
                      ))}
                    </select>
                  )}

                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    type="text"
                    placeholder="Nomi"
                    className="w-full p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 ring-blue-500/50"
                    required
                  />

                  {type === 1 && (
                    <input
                      name="usta"
                      value={formData.usta}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="Usta ismi"
                      className="w-full p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 ring-blue-500/50"
                    />
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {(type === 2 || type === 4) && (
                      <input
                        name="quvvat"
                        value={formData.quvvat}
                        onChange={handleInputChange}
                        type="text"
                        placeholder="Quvvati"
                        className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 ring-blue-500/50"
                      />
                    )}
                    {(type === 2 || type === 3) && (
                      <input
                        name="turi"
                        value={formData.turi}
                        onChange={handleInputChange}
                        type="text"
                        placeholder="Turi (kV)"
                        className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 ring-blue-500/50"
                      />
                    )}
                    {type === 3 && (
                      <input
                        name="uzunlik"
                        value={formData.uzunlik}
                        onChange={handleInputChange}
                        type="text"
                        placeholder="Uzunligi (km)"
                        className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 ring-blue-500/50"
                      />
                    )}
                    {type === 4 && (
                      <select
                        name="holat"
                        value={formData.holat}
                        onChange={handleInputChange}
                        className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 text-white outline-none"
                      >
                        <option value="Ishchi">Ishchi</option>
                        <option value="Nosoz">Nosoz</option>
                      </select>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3.5 bg-slate-800 text-slate-300 rounded-2xl hover:bg-slate-700 transition-all font-semibold active:scale-95"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 shadow-xl shadow-blue-900/40 transition-all font-semibold active:scale-95"
                  >
                    Saqlash
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
