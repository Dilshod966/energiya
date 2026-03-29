import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { getUstachilik, API } from "../../../services/api";
import { X, Zap, LayoutDashboard, Database, Info } from "lucide-react";

export default function NimstansiyaModal({ isOpen, onClose, refreshData, editData = null }) {
  const [ustachiliklar, setUstachiliklar] = useState([]);
  
  const initialFormState = {
    hisob: "tet", // 'tet' yoki 'istemol'
    parentId: "", // Ustachilik bo'limi ID si
    name: "", // Nimstansiya nomi (masalan: PS 110/35/10 kV "Gurlan")
    quvvat: "", // Quvvati (kVA/MVA)
    turi: "", // Nimstansiya turi (masalan: Yopiq, Ochiq, Komplekt)
    izoh: ""
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const ustaRes = await getUstachilik();
          setUstachiliklar(ustaRes.data || []);

          if (editData) {
            setFormData(editData);
          } else {
            setFormData(initialFormState);
          }
        } catch (err) {
          console.error("Ustachilik ma'lumotlarini yuklashda xatolik:", err);
        }
      };
      fetchData();
    }
  }, [isOpen, editData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await API.put(`/nimstansiya/${editData.id}`, formData);
      } else {
        await API.post("/nimstansiya", formData);
      }
      refreshData();
      onClose();
    } catch (err) {
      alert("Saqlashda xatolik yuz berdi!");
    }
  };

  const isEdit = !!editData;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-start pt-24 justify-center p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md custom-scrollbar">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl mb-12"
          >
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Sarlavha va Hisob turi */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-blue-500 flex items-center gap-3">
                    <Zap className="fill-blue-500" size={24} />
                    {isEdit ? "Nimstansiyani Tahrirlash" : "Yangi Nimstansiya"}
                  </h3>
                </div>
                
                <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                  {["tet", "istemol"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, hisob: t })}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all duration-300 ${
                        formData.hisob === t
                          ? ((t === "tet" ? "bg-blue-600" : "bg-orange-600") + "  text-white shadow-lg shadow-blue-900/40")
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {t === "tet" ? "TET" : "ISTE'MOLCHI"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bog'liqlik: Ustachilik bo'limi */}
              <div className="p-5 bg-blue-600/5 rounded-2xl border border-blue-500/10 space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest ml-1">
                  <LayoutDashboard size={14} /> Ustachilik bo'limiga biriktirish
                </label>
                <select
                  required
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 ring-blue-500 transition-all cursor-pointer"
                >
                  <option value="">-- Bo'limni tanlang --</option>
                  {ustachiliklar.map((usta) => (
                    <option key={usta.id} value={usta.id}>
                      {usta.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Texnik ma'lumotlar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Nimstansiya nomi (PS)</label>
                  <input
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500"
                    placeholder="Masalan: PS 110/35/10 kV Gurlan"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Quvvati (kVA/MVA)</label>
                  <div className="relative">
                    <Database className="absolute left-4 top-4 text-slate-500" size={18} />
                    <input
                      name="quvvat"
                      value={formData.quvvat}
                      onChange={handleInputChange}
                      className="w-full p-4 pl-12 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500"
                      placeholder="Quvvati:"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">Turi</label>
                  <select
                    name="turi"
                    value={formData.turi}
                    onChange={handleInputChange}
                    className="w-full p-4 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500"
                  >
                    <option value="">-- Turini tanlang --</option>
                    <option value="Yopiq">Yopiq (ZRU)</option>
                    <option value="Ochiq">Ochiq (ORU)</option>
                    <option value="Komplekt">Komplekt (KTP)</option>
                  </select>
                </div>
              </div>

              {/* Qo'shimcha izoh */}
              {/* <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase ml-1">
                  <Info size={14} /> Qo'shimcha izoh
                </label>
                <textarea
                  name="izoh"
                  rows="3"
                  value={formData.izoh}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none focus:border-blue-500 resize-none"
                  placeholder="Nimstansiya haqida qo'shimcha ma'lumot..."
                ></textarea>
              </div> */}

              {/* Tugmalar */}
              <div className="flex gap-4 pt-6 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-slate-800 text-slate-300 rounded-2xl font-bold hover:bg-slate-700 transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-500 shadow-lg shadow-blue-900/40 transition-all active:scale-95"
                >
                  {isEdit ? "O'zgarishlarni saqlash" : "Nimstansiyani saqlash"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}