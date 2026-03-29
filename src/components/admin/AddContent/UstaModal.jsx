import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { API } from "../../../services/api";
import { X, User, Briefcase, CheckCircle } from "lucide-react";

export default function UstaModal({ isOpen, onClose, refreshData, editData = null }) {
  const initialFormState = {
    name: "", // Ustachilik bo'limi nomi (masalan: Gurlan tuman elektr ta'minoti)
    usta: "", // Mas'ul usta ismi
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData(editData);
      } else {
        setFormData(initialFormState);
      }
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
        await API.put(`/ustachilik/${editData.id}`, formData);
      } else {
        await API.post("/ustachilik", formData);
      }
      refreshData();
      onClose();
    } catch (err) {
      alert("Ma'lumotni saqlashda xatolik yuz berdi!");
    }
  };

  const isEdit = !!editData;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-lg bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl"
          >
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h3 className="text-2xl font-bold text-emerald-500 flex items-center gap-3">
                  <Briefcase size={24} />
                  {isEdit ? "Bo'limni Tahrirlash" : "Yangi Ustachilik Bo'limi"}
                </h3>
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5">
                {/* Bo'lim nomi */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Bo'lim nomi
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-4 text-slate-600" size={18} />
                    <input
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-4 pl-12 bg-slate-800/50 rounded-2xl border border-slate-700 text-white outline-none focus:ring-2 ring-emerald-500 transition-all placeholder:text-slate-600"
                      placeholder="Bo'lim nomi"
                    />
                  </div>
                </div>

                {/* Usta ismi */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    Mas'ul usta ismi
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-4 text-slate-600" size={18} />
                    <input
                      name="usta"
                      required
                      value={formData.usta}
                      onChange={handleInputChange}
                      className="w-full p-4 pl-12 bg-slate-800/50 rounded-2xl border border-slate-700 text-white outline-none focus:ring-2 ring-emerald-500 transition-all placeholder:text-slate-600"
                      placeholder="F.I.SH."
                    />
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className="flex items-center gap-2 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                <CheckCircle size={14} className="text-emerald-500" />
                <span className="text-[10px] text-emerald-500/80 font-medium italic">
                  Ushbu bo'limga keyinchalik Nimstansiyalar biriktiriladi.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-slate-800 text-slate-300 rounded-2xl font-bold hover:bg-slate-700 transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-500 shadow-lg shadow-emerald-900/40 transition-all active:scale-95"
                >
                  {isEdit ? "Saqlash" : "Bo'limni yaratish"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}