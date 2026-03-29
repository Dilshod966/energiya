import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { getNimstansiyalar, API } from "../../../services/api";
import { X, Ruler, Zap, Plus, Shield, GitBranch } from "lucide-react";

export default function LiniyaModal({
  isOpen,
  onClose,
  refreshData,
  editData = null,
}) {
  const [nimstansiyalar, setNimstansiyalar] = useState([]);

  const initialFormState = {
    parentId: "", // Nimstansiya ID si
    hisob: "tet",
    name: "", // Liniya nomi
    inventar_raqami: "",
    fider: "",
    kuchlanishi: "",
    jami_uzunligi: "",
    jami_izolyator: "",
    simlar: [{ sim_turi: "", sim_uzunligi: "" }],
    izolyatorlar: [{ turi: "", soni: "" }],
    traverslar: [{ turi: "", soni: "" }],
    jami_travers: "",
    // Temir beton tayanchlar
    tb_oddiy: "",
    tb_bir_tirgakli: "",
    tb_ikki_tirgakli: "",

    // Yog'och tayanchlar
    yg_oddiy: "",
    yg_bir_tirgakli: "",
    yg_ikki_tirgakli: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  // Simlar uzunligini va Izolyatorlar sonini hisoblash
  useEffect(() => {
    // 1. Jami uzunlikni hisoblash (sim_uzunligi massividan)
    const totalLength = formData.simlar?.reduce((sum, item) => {
      return sum + (parseFloat(item.sim_uzunligi) || 0);
    }, 0);

    // 2. Jami izolyatorlar sonini hisoblash (soni massividan)
    const totalIzolyator = formData.izolyatorlar?.reduce((sum, item) => {
      return sum + (parseInt(item.soni) || 0);
    }, 0);

    // 3. Jami traverslar sonini hisoblash
    const totalTravers = formData.traverslar?.reduce((sum, item) => {
      return sum + (parseInt(item.soni) || 0);
    }, 0);

    // State-ni yangilash
    setFormData((prev) => ({
      ...prev,
      jami_uzunligi: totalLength.toFixed(2), // 1.25 kabi formatda
      jami_izolyator: totalIzolyator,
      jami_travers: totalTravers,
    }));
  }, [formData.simlar, formData.izolyatorlar, formData.traverslar]);



useEffect(() => {
  if (isOpen) {
    const fetchData = async () => {
      try {
        const psRes = await getNimstansiyalar("all");
        setNimstansiyalar(psRes.data || []);

        if (editData) {
          setFormData({
            ...editData,
            // Bazadan string kelsa parse qilamiz, array kelsa shundayligicha
            simlar: typeof editData.simlar === "string"
              ? JSON.parse(editData.simlar)
              : editData.simlar || [{ sim_turi: "", sim_uzunligi: "" }],

            izolyatorlar: typeof editData.izolyatorlar === "string"
              ? JSON.parse(editData.izolyatorlar)
              : editData.izolyatorlar || [{ turi: "", soni: "" }],

            traverslar: typeof editData.traverslar === "string"
              ? JSON.parse(editData.traverslar)
              : editData.traverslar || [{ turi: "", soni: "" }],
          });
        } else {
          setFormData(initialFormState);
        }
      } catch (err) {
        console.error("Ma'lumot yuklashda xatolik:", err);
      }
    };
    fetchData();
  }
}, [isOpen, editData]);

  const addSimField = () => {
    setFormData({
      ...formData,
      simlar: [...formData.simlar, { sim_turi: "", sim_uzunligi: "" }],
    });
  };

  // Dinamik inputlardagi qiymatni o'zgartirish
  const handleSimChange = (index, e) => {
    const { name, value } = e.target;
    const newSimlar = [...formData.simlar];
    newSimlar[index][name] = value;
    setFormData({ ...formData, simlar: newSimlar });
  };

  // Yangi izolyator qatori qo'shish
  const addIzolyatorField = () => {
    setFormData({
      ...formData,
      izolyatorlar: [...formData.izolyatorlar, { turi: "", soni: "" }],
    });
  };

  // Izolyator inputlarini o'zgartirish
  const handleIzolyatorChange = (index, e) => {
    const { name, value } = e.target;
    const newIzolyatorlar = [...formData.izolyatorlar];
    newIzolyatorlar[index][name] = value;
    setFormData({ ...formData, izolyatorlar: newIzolyatorlar });
  };

  // Yangi travers qatori qo'shish
  const addTraversField = () => {
    setFormData({
      ...formData,
      traverslar: [...formData.traverslar, { turi: "", soni: "" }],
    });
  };

  // Travers inputlarini o'zgartirish
  const handleTraversChange = (index, e) => {
    const { name, value } = e.target;
    const newTraverslar = [...formData.traverslar];
    newTraverslar[index][name] = value;
    setFormData({ ...formData, traverslar: newTraverslar });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    console.log(formData);
    e.preventDefault();
    try {
      if (editData) {
        await API.put(`/liniya/${editData.id}`, formData);
      } else {
        await API.post("/liniya", formData);
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
        <div className="fixed inset-0 z-[60] flex items-start pt-16 justify-center p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md custom-scrollbar">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl mb-12"
          >
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h3 className="text-2xl font-bold text-amber-500 flex items-center gap-3">
                  <Zap className="fill-amber-500" size={24} />
                  {isEdit ? "Liniyani Tahrirlash" : "Yangi Liniya Qo'shish"}
                </h3>

                <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                  {["tet", "istemol"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, hisob: t })}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all duration-300 ${
                        formData.hisob === t
                          ? (t === "tet" ? "bg-blue-600" : "bg-orange-600") +
                            "  text-white shadow-lg shadow-blue-900/40"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {t === "tet" ? "TET" : "ISTE'MOLCHI"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nimstansiyaga biriktirish */}
              <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                <label className="block text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2 ml-1">
                  Tegishli Nimstansiya (PS)
                </label>
                <select
                  required
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 ring-amber-500"
                >
                  <option value="">-- Nimstansiyani tanlang --</option>
                  {nimstansiyalar.map((ps) => (
                    <option key={ps.id} value={ps.id}>
                      {ps.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Asosiy ma'lumotlar */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr_1fr_1fr]  gap-4">
                <input
                  name="inventar_raqami"
                  value={formData.inventar_raqami}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none focus:border-amber-500"
                  placeholder="Inventar raqami:"
                />
                <input
                  name="fider"
                  value={formData.fider}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none focus:border-amber-500"
                  placeholder="Fider nomi:"
                />

                <input
                  name="kuchlanishi"
                  value={formData.kuchlanishi}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none focus:border-amber-500"
                  placeholder="Kuchlanishi (kV):"
                />
                <input
                  name="jami_uzunligi"
                  value={formData.jami_uzunligi}
                  readOnly
                  onChange={handleInputChange}
                  className="w-full p-3 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl text-amber-400 font-bold outline-none focus:border-amber-500"
                  placeholder="Jami uzunlik:"
                />
              </div>

              {/* Simlar va Izolyatorlar */}
              <div className="w-full grid grid-cols-1 md:grid-cols-3 items-start gap-6">
                <div className="p-6 bg-slate-800/40 rounded-[2rem] border border-slate-700">
                  <h4 className="text-blue-400 text-[11px] font-bold uppercase mb-6 flex items-center gap-2 tracking-widest">
                    <Ruler size={14} /> Simlar
                  </h4>

                  <div className="space-y-4">
                    <AnimatePresence>
                      {formData.simlar?.map((sim, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: -25 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="grid grid-cols-2 gap-4 relative"
                        >
                          <div className="space-y-1">
                            {index === 0 && (
                              <label className="text-[9px] text-slate-500 ml-1 uppercase">
                                Sim turi
                              </label>
                            )}
                            <input
                              name="sim_turi"
                              placeholder="Masalan: AS-16"
                              value={sim.sim_turi}
                              onChange={(e) => handleSimChange(index, e)}
                              className="w-full p-3 bg-slate-900 rounded-xl text-sm border border-slate-700 text-white outline-none focus:ring-1 ring-blue-500 transition-all"
                            />
                          </div>

                          <div className="space-y-1">
                            {index === 0 && (
                              <label className="text-[9px] text-slate-500 ml-1 uppercase">
                                Uzunligi (km)
                              </label>
                            )}
                            <input
                              name="sim_uzunligi"
                              placeholder="Masalan: 1.2"
                              value={sim.sim_uzunligi}
                              onChange={(e) => handleSimChange(index, e)}
                              className="w-full p-3 bg-slate-900 rounded-xl text-sm border border-slate-700 text-white outline-none focus:ring-1 ring-blue-500 transition-all"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="relative mt-2 flex justify-center items-center">
                    <div className="absolute w-full h-[1px] bg-slate-700/50"></div>
                    <button
                      type="button"
                      onClick={addSimField}
                      className="relative bg-slate-900 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.3)] active:scale-90 z-10"
                    >
                      <Plus size={18} strokeWidth={3} />
                    </button>
                  </div>
                </div>
                <div className="p-6 bg-slate-800/40 rounded-[2rem] border border-slate-700">
                  <h4 className="text-emerald-400 text-[11px] font-bold uppercase mb-6  flex items-center justify-between tracking-widest w-full relative">
                    <div className="flex items-center gap-2">
                      <Shield size={14} />
                      <span>Izolyatorlar</span>
                    </div>

                    {formData.jami_izolyator ? (
                      <span className="text-white text-[14px] font-black bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/30 absolute right-0">
                        Jami:{" "}
                        <span className="text-emerald-400">{formData.jami_izolyator}</span>
                      </span>
                    ) : (
                      ""
                    )}
                  </h4>

                  <div className="space-y-4">
                    <AnimatePresence>
                      {formData.izolyatorlar?.map((izol, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: -25 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="grid grid-cols-2 gap-4 relative"
                        >
                          <div className="space-y-1">
                            {index === 0 && (
                              <label className="text-[9px] text-slate-500 ml-1 uppercase">
                                Turi
                              </label>
                            )}
                            <input
                              name="turi"
                              placeholder="Masalan: ShF-20"
                              value={izol.turi}
                              onChange={(e) => handleIzolyatorChange(index, e)}
                              className="w-full p-3 bg-slate-900 rounded-xl text-sm border border-slate-700 text-white outline-none focus:ring-1 ring-emerald-500 transition-all"
                            />
                          </div>

                          <div className="space-y-1">
                            {index === 0 && (
                              <label className="text-[9px] text-slate-500 ml-1 uppercase">
                                Soni (dona)
                              </label>
                            )}
                            <input
                              type="number"
                              name="soni"
                              placeholder="0"
                              value={izol.soni}
                              onChange={(e) => handleIzolyatorChange(index, e)}
                              className="w-full p-3 bg-slate-900 rounded-xl text-sm border border-slate-700 text-white outline-none focus:ring-1 ring-emerald-500 transition-all"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="relative mt-2 flex justify-center items-center">
                    <div className="absolute w-full h-[1px] bg-slate-700/50"></div>
                    <button
                      type="button"
                      onClick={addIzolyatorField}
                      className="relative bg-slate-900 border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-90 z-10"
                    >
                      <Plus size={18} strokeWidth={3} />
                    </button>
                  </div>
                </div>

                {/* Traverslar */}
                <div className="p-6 bg-slate-800/40 rounded-[2rem] border border-slate-700">
                  <h4 className="text-violet-400 text-[11px] font-bold uppercase mb-6 flex items-center justify-between tracking-widest w-full relative">
                    <div className="flex items-center gap-2">
                      <GitBranch size={14} />
                      <span>Traverslar</span>
                    </div>
                    {formData.jami_travers ? (
                      <span className="text-white text-[14px] font-black bg-violet-500/20 px-2 py-0.5 rounded-lg border border-violet-500/30 absolute right-0">
                        Jami:{" "}
                        <span className="text-violet-400">{formData.jami_travers}</span>
                      </span>
                    ) : (
                      ""
                    )}
                  </h4>

                  <div className="space-y-4">
                    <AnimatePresence>
                      {formData.traverslar?.map((trav, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: -25 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="grid grid-cols-2 gap-4 relative"
                        >
                          <div className="space-y-1">
                            {index === 0 && (
                              <label className="text-[9px] text-slate-500 ml-1 uppercase">
                                Turi
                              </label>
                            )}
                            <input
                              name="turi"
                              placeholder="Masalan: T-1"
                              value={trav.turi}
                              onChange={(e) => handleTraversChange(index, e)}
                              className="w-full p-3 bg-slate-900 rounded-xl text-sm border border-slate-700 text-white outline-none focus:ring-1 ring-violet-500 transition-all"
                            />
                          </div>

                          <div className="space-y-1">
                            {index === 0 && (
                              <label className="text-[9px] text-slate-500 ml-1 uppercase">
                                Soni (dona)
                              </label>
                            )}
                            <input
                              type="number"
                              name="soni"
                              placeholder="0"
                              value={trav.soni}
                              onChange={(e) => handleTraversChange(index, e)}
                              className="w-full p-3 bg-slate-900 rounded-xl text-sm border border-slate-700 text-white outline-none focus:ring-1 ring-violet-500 transition-all"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="relative mt-2 flex justify-center items-center">
                    <div className="absolute w-full h-[1px] bg-slate-700/50"></div>
                    <button
                      type="button"
                      onClick={addTraversField}
                      className="relative bg-slate-900 border border-violet-500 text-violet-500 hover:bg-violet-500 hover:text-white w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.3)] active:scale-90 z-10"
                    >
                      <Plus size={18} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              </div>

              {/* TAYANCHLAR (BETON VA YOG'OCH) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Temir Beton */}
                <div className="space-y-3">
                  <h4 className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest ml-1">
                    Temir-beton tayanchlar
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      name="tb_oddiy"
                      placeholder="Oddiy"
                      value={formData.tb_oddiy}
                      onChange={handleInputChange}
                      className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-white text-center text-sm"
                    />
                    <input
                      name="tb_bir_tirgakli"
                      placeholder="1-tirgak"
                      value={formData.tb_bir_tirgakli}
                      onChange={handleInputChange}
                      className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-white text-center text-sm"
                    />
                    <input
                      name="tb_ikki_tirgakli"
                      placeholder="2-tirgak"
                      value={formData.tb_ikki_tirgakli}
                      onChange={handleInputChange}
                      className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-white text-center text-sm"
                    />
                  </div>
                </div>

                {/* Yog'och */}
                <div className="space-y-3">
                  <h4 className="text-orange-400 text-[10px] font-bold uppercase tracking-widest ml-1">
                    Yog'och tayanchlar
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      name="yg_oddiy"
                      placeholder="Oddiy"
                      value={formData.yg_oddiy}
                      onChange={handleInputChange}
                      className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-white text-center text-sm"
                    />
                    <input
                      name="yg_bir_tirgakli"
                      placeholder="1-tirgak"
                      value={formData.yg_bir_tirgakli}
                      onChange={handleInputChange}
                      className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-white text-center text-sm"
                    />
                    <input
                      name="yg_ikki_tirgakli"
                      placeholder="2-tirgak"
                      value={formData.yg_ikki_tirgakli}
                      onChange={handleInputChange}
                      className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-white text-center text-sm"
                    />
                  </div>
                </div>
              </div>

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
                  className="flex-1 py-4 bg-amber-600 text-white rounded-2xl font-bold hover:bg-amber-500 shadow-lg shadow-amber-900/40 transition-all active:scale-95"
                >
                  {isEdit ? "O'zgarishlarni saqlash" : "Liniyani saqlash"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}