import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { getNimstansiyalar, API } from "../../../services/api";
import { X, Ruler, Zap, Plus, Shield, GitBranch, Trash2 } from "lucide-react";

const emptyBolim = () => ({
  hisob: "tet",
  ishga_tushirilgan_yili: "",
  simlar:       [{ sim_turi: "", sim_uzunligi: "" }],
  izolyatorlar: [{ turi: "", soni: "" }],
  traverslar:   [{ turi: "", soni: "" }],
  tb_oddiy: "", tb_bir_tirgakli: "", tb_ikki_tirgakli: "",
  yg_oddiy: "", yg_bir_tirgakli: "", yg_ikki_tirgakli: "",
});

const initialFormState = {
  parentId: "",
  fider: "",
  inventar_raqami: "",
  kuchlanishi: "",
  jami_uzunligi: "",
  bolimlar: [emptyBolim()],
};

export default function LiniyaModal({ isOpen, onClose, refreshData, editData = null }) {
  const [nimstansiyalar, setNimstansiyalar] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  // Uzunlik hisoblash
  const uzunliklar = (() => {
    let jami = 0, tet = 0, istemol = 0;
    formData.bolimlar.forEach((b) => {
      const km = (b.simlar || []).reduce((s, sim) => s + (parseFloat(sim.sim_uzunligi) || 0), 0);
      jami += km;
      if (b.hisob === "tet") tet += km;
      else istemol += km;
    });
    return { jami: jami.toFixed(2), tet: tet.toFixed(2), istemol: istemol.toFixed(2) };
  })();

  // jami_uzunligi auto-hisobi (barcha bo'limlar, barcha simlar)
  useEffect(() => {
    const total = formData.bolimlar.reduce((sum, b) =>
      sum + (b.simlar || []).reduce((s, sim) => s + (parseFloat(sim.sim_uzunligi) || 0), 0)
    , 0);
    setFormData((prev) => ({ ...prev, jami_uzunligi: total.toFixed(2) }));
  }, [formData.bolimlar]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      try {
        const psRes = await getNimstansiyalar("all");
        setNimstansiyalar(psRes.data || []);

        if (editData) {
          let bolimlar = editData.bolimlar;
          if (typeof bolimlar === "string") {
            try { bolimlar = JSON.parse(bolimlar); } catch { bolimlar = [emptyBolim()]; }
          }
          setFormData({
            parentId: editData.parentId ?? "",
            hisob: editData.hisob ?? "tet",
            fider: editData.fider ?? "",
            inventar_raqami: editData.inventar_raqami ?? "",
            kuchlanishi: editData.kuchlanishi ?? "",
            jami_uzunligi: editData.jami_uzunligi ?? "",
            bolimlar: Array.isArray(bolimlar) && bolimlar.length ? bolimlar : [emptyBolim()],
          });
        } else {
          setFormData(initialFormState);
        }
      } catch (err) {
        console.error("Ma'lumot yuklashda xatolik:", err);
      }
    };
    fetchData();
  }, [isOpen, editData]);

  const handleTopChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBolimChange = (idx, field, value) => {
    setFormData((prev) => {
      const updated = prev.bolimlar.map((b, i) =>
        i === idx ? { ...b, [field]: value } : b
      );
      return { ...prev, bolimlar: updated };
    });
  };

  // Bolim ichidagi array itemlarini o'zgartirish
  const handleArrayChange = (bolimIdx, arrayKey, itemIdx, field, value) => {
    setFormData((prev) => {
      const bolimlar = prev.bolimlar.map((b, i) => {
        if (i !== bolimIdx) return b;
        const arr = b[arrayKey].map((item, j) =>
          j === itemIdx ? { ...item, [field]: value } : item
        );
        return { ...b, [arrayKey]: arr };
      });
      return { ...prev, bolimlar };
    });
  };

  // Bolim ichidagi arrayga yangi element qo'shish
  const addArrayItem = (bolimIdx, arrayKey) => {
    const empty = arrayKey === "simlar"
      ? { sim_turi: "", sim_uzunligi: "" }
      : { turi: "", soni: "" };
    setFormData((prev) => {
      const bolimlar = prev.bolimlar.map((b, i) =>
        i === bolimIdx ? { ...b, [arrayKey]: [...b[arrayKey], empty] } : b
      );
      return { ...prev, bolimlar };
    });
  };

  const addBolim = () => {
    setFormData((prev) => ({ ...prev, bolimlar: [...prev.bolimlar, emptyBolim()] }));
  };

  const removeBolim = (idx) => {
    setFormData((prev) => ({
      ...prev,
      bolimlar: prev.bolimlar.filter((_, i) => i !== idx),
    }));
  };

  const onSubmit = async (e) => {
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

              {/* ── Header ── */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h3 className="text-2xl font-bold text-amber-500 flex items-center gap-3">
                  <Zap className="fill-amber-500" size={24} />
                  {isEdit ? "Liniyani Tahrirlash" : "Yangi Liniya Qo'shish"}
                </h3>
              </div>

              {/* ── Nimstansiya ── */}
              <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                <label className="block text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2 ml-1">
                  Tegishli Nimstansiya (PS)
                </label>
                <select
                  required
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleTopChange}
                  className="w-full p-3 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 ring-amber-500"
                >
                  <option value="">-- Nimstansiyani tanlang --</option>
                  {nimstansiyalar.map((ps) => (
                    <option key={ps.id} value={ps.id}>{ps.name}</option>
                  ))}
                </select>
              </div>

              {/* ── Asosiy ma'lumotlar ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  name="inventar_raqami"
                  value={formData.inventar_raqami}
                  onChange={handleTopChange}
                  className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none focus:border-amber-500"
                  placeholder="Inventar raqami"
                />
                <input
                  name="fider"
                  value={formData.fider}
                  onChange={handleTopChange}
                  className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none focus:border-amber-500"
                  placeholder="Fider nomi"
                />
                <input
                  name="kuchlanishi"
                  value={formData.kuchlanishi}
                  onChange={handleTopChange}
                  className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-white outline-none focus:border-amber-500"
                  placeholder="Kuchlanishi (kV)"
                />
              </div>

              {/* Jami uzunlik kartochkasi */}
              <div className="flex items-center gap-3 p-4 bg-slate-800/40 rounded-2xl border border-amber-500/20">
                <div className="flex-1 text-center">
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Jami uzunlik</div>
                  <div className="text-amber-400 font-black text-lg">{uzunliklar.jami} <span className="text-xs font-normal">km</span></div>
                </div>
                <div className="w-[1px] h-10 bg-slate-700"></div>
                <div className="flex-1 text-center">
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">TET</div>
                  <div className="text-blue-400 font-black text-lg">{uzunliklar.tet} <span className="text-xs font-normal">km</span></div>
                </div>
                <div className="w-[1px] h-10 bg-slate-700"></div>
                <div className="flex-1 text-center">
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">Iste'molchi</div>
                  <div className="text-orange-400 font-black text-lg">{uzunliklar.istemol} <span className="text-xs font-normal">km</span></div>
                </div>
              </div>

              {/* ── Bo'limlar ── */}
              <div className="space-y-6">
                <AnimatePresence>
                  {formData.bolimlar.map((bolim, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className="border border-slate-700 rounded-[1.5rem] overflow-hidden"
                    >
                      {/* Bo'lim header */}
                      <div className="flex items-center justify-between px-5 py-3 bg-slate-800/60 border-b border-slate-700">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Bo'lim {idx + 1}
                        </span>
                        <div className="flex items-center gap-3">
                          {/* Ishga tushirilgan yili */}
                          <select
                            value={bolim.ishga_tushirilgan_yili}
                            onChange={(e) => handleBolimChange(idx, "ishga_tushirilgan_yili", e.target.value)}
                            className="w-20 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-amber-500 transition-all appearance-none cursor-pointer"
                          >
                            <option value="">Yil</option>
                            {Array.from({ length: 2026 - 1990 + 1 }, (_, i) => 2026 - i).map((y) => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                          {/* Hisob tugmalari */}
                          <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-700">
                            {["tet", "istemol"].map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => handleBolimChange(idx, "hisob", t)}
                                className={`px-3 py-1 rounded-md text-[10px] font-black transition-all duration-200 ${
                                  bolim.hisob === t
                                    ? t === "tet"
                                      ? "bg-blue-600 text-white shadow"
                                      : "bg-orange-600 text-white shadow"
                                    : "text-slate-500 hover:text-slate-300"
                                }`}
                              >
                                {t === "tet" ? "TET" : "ISTE'MOLCHI"}
                              </button>
                            ))}
                          </div>
                          {formData.bolimlar.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeBolim(idx)}
                              className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="p-5 space-y-4">
                        {/* Simlar | Izolyatorlar | Traverslar */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                          {/* SIMLAR */}
                          <div className="p-4 bg-slate-800/40 rounded-2xl border border-blue-500/20">
                            <h4 className="text-blue-400 text-[11px] font-bold uppercase flex items-center justify-between tracking-widest mb-3">
                              <span className="flex items-center gap-2"><Ruler size={13} /> Simlar</span>
                              {(() => { const t = bolim.simlar.reduce((s, i) => s + (parseFloat(i.sim_uzunligi) || 0), 0); return t > 0 ? <span className="text-white text-[13px] font-black bg-blue-500/20 px-2 py-0.5 rounded-lg border border-blue-500/30">Jami: <span className="text-blue-400">{t.toFixed(2)} km</span></span> : null; })()}
                            </h4>
                            <div className="space-y-3">
                              {bolim.simlar.map((sim, sIdx) => (
                                <div key={sIdx} className="grid grid-cols-2 gap-2">
                                  <div>
                                    {sIdx === 0 && <label className="text-[9px] text-slate-500 ml-1 uppercase">Sim turi</label>}
                                    <input
                                      value={sim.sim_turi}
                                      onChange={(e) => handleArrayChange(idx, "simlar", sIdx, "sim_turi", e.target.value)}
                                      placeholder="Masalan:"
                                      className="w-full mt-1 p-2.5 bg-slate-900 rounded-xl text-sm border border-slate-700 text-white outline-none focus:ring-1 ring-blue-500 transition-all"
                                    />
                                  </div>
                                  <div>
                                    {sIdx === 0 && <label className="text-[9px] text-slate-500 ml-1 uppercase">Uzunlik (km)</label>}
                                    <input
                                      value={sim.sim_uzunligi}
                                      onChange={(e) => handleArrayChange(idx, "simlar", sIdx, "sim_uzunligi", e.target.value)}
                                      placeholder="Masalan:"
                                      className="w-full mt-1 p-2.5 bg-slate-900 rounded-xl text-sm border border-slate-700 text-white outline-none focus:ring-1 ring-blue-500 transition-all"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="relative mt-3 flex justify-center items-center">
                              <div className="absolute w-full h-[1px] bg-slate-700/50"></div>
                              <button type="button" onClick={() => addArrayItem(idx, "simlar")}
                                className="relative bg-slate-900 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white w-7 h-7 rounded-full flex items-center justify-center transition-all z-10">
                                <Plus size={14} strokeWidth={3} />
                              </button>
                            </div>
                          </div>

                          {/* IZOLYATORLAR */}
                          <div className="p-4 bg-slate-800/40 rounded-2xl border border-emerald-500/20">
                            <h4 className="text-emerald-400 text-[11px] font-bold uppercase flex items-center justify-between tracking-widest mb-3">
                              <span className="flex items-center gap-2"><Shield size={13} /> Izolyatorlar</span>
                              {(() => { const t = bolim.izolyatorlar.reduce((s, i) => s + (parseInt(i.soni) || 0), 0); return t > 0 ? <span className="text-white text-[13px] font-black bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/30">Jami: <span className="text-emerald-400">{t}</span></span> : null; })()}
                            </h4>
                            <div className="space-y-3">
                              {bolim.izolyatorlar.map((izol, iIdx) => (
                                <div key={iIdx} className="grid grid-cols-2 gap-2">
                                  <div>
                                    {iIdx === 0 && <label className="text-[9px] text-slate-500 ml-1 uppercase">Turi</label>}
                                    <input
                                      value={izol.turi}
                                      onChange={(e) => handleArrayChange(idx, "izolyatorlar", iIdx, "turi", e.target.value)}
                                      placeholder="Masalan:"
                                      className="w-full mt-1 p-2.5 bg-slate-900 rounded-xl text-sm border border-slate-700 text-white outline-none focus:ring-1 ring-emerald-500 transition-all"
                                    />
                                  </div>
                                  <div>
                                    {iIdx === 0 && <label className="text-[9px] text-slate-500 ml-1 uppercase">Soni (dona)</label>}
                                    <input
                                      type="number"
                                      value={izol.soni}
                                      onChange={(e) => handleArrayChange(idx, "izolyatorlar", iIdx, "soni", e.target.value)}
                                      placeholder="0"
                                      className="w-full mt-1 p-2.5 bg-slate-900 rounded-xl text-sm border border-slate-700 text-white outline-none focus:ring-1 ring-emerald-500 transition-all"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="relative mt-3 flex justify-center items-center">
                              <div className="absolute w-full h-[1px] bg-slate-700/50"></div>
                              <button type="button" onClick={() => addArrayItem(idx, "izolyatorlar")}
                                className="relative bg-slate-900 border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white w-7 h-7 rounded-full flex items-center justify-center transition-all z-10">
                                <Plus size={14} strokeWidth={3} />
                              </button>
                            </div>
                          </div>

                          {/* TRAVERSLAR */}
                          <div className="p-4 bg-slate-800/40 rounded-2xl border border-violet-500/20">
                            <h4 className="text-violet-400 text-[11px] font-bold uppercase flex items-center justify-between tracking-widest mb-3">
                              <span className="flex items-center gap-2"><GitBranch size={13} /> Traverslar</span>
                              {(() => { const t = bolim.traverslar.reduce((s, i) => s + (parseInt(i.soni) || 0), 0); return t > 0 ? <span className="text-white text-[13px] font-black bg-violet-500/20 px-2 py-0.5 rounded-lg border border-violet-500/30">Jami: <span className="text-violet-400">{t}</span></span> : null; })()}
                            </h4>
                            <div className="space-y-3">
                              {bolim.traverslar.map((trav, tIdx) => (
                                <div key={tIdx} className="grid grid-cols-2 gap-2">
                                  <div>
                                    {tIdx === 0 && <label className="text-[9px] text-slate-500 ml-1 uppercase">Turi</label>}
                                    <input
                                      value={trav.turi}
                                      onChange={(e) => handleArrayChange(idx, "traverslar", tIdx, "turi", e.target.value)}
                                      placeholder="Masalan:"
                                      className="w-full mt-1 p-2.5 bg-slate-900 rounded-xl text-sm border border-slate-700 text-white outline-none focus:ring-1 ring-violet-500 transition-all"
                                    />
                                  </div>
                                  <div>
                                    {tIdx === 0 && <label className="text-[9px] text-slate-500 ml-1 uppercase">Soni (dona)</label>}
                                    <input
                                      type="number"
                                      value={trav.soni}
                                      onChange={(e) => handleArrayChange(idx, "traverslar", tIdx, "soni", e.target.value)}
                                      placeholder="0"
                                      className="w-full mt-1 p-2.5 bg-slate-900 rounded-xl text-sm border border-slate-700 text-white outline-none focus:ring-1 ring-violet-500 transition-all"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="relative mt-3 flex justify-center items-center">
                              <div className="absolute w-full h-[1px] bg-slate-700/50"></div>
                              <button type="button" onClick={() => addArrayItem(idx, "traverslar")}
                                className="relative bg-slate-900 border border-violet-500 text-violet-500 hover:bg-violet-500 hover:text-white w-7 h-7 rounded-full flex items-center justify-center transition-all z-10">
                                <Plus size={14} strokeWidth={3} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Tayanchlar */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Temir-beton */}
                          <div className="space-y-2">
                            <h4 className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest ml-1">
                              Temir-beton tayanchlar
                            </h4>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                ["tb_oddiy", "Oddiy"],
                                ["tb_bir_tirgakli", "1-tirgak"],
                                ["tb_ikki_tirgakli", "2-tirgak"],
                              ].map(([field, label]) => (
                                <input
                                  key={field}
                                  type="number"
                                  placeholder={label}
                                  value={bolim[field]}
                                  onChange={(e) => handleBolimChange(idx, field, e.target.value)}
                                  className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-white text-center text-sm outline-none focus:border-emerald-500"
                                />
                              ))}
                            </div>
                          </div>

                          {/* Yog'och */}
                          <div className="space-y-2">
                            <h4 className="text-orange-400 text-[10px] font-bold uppercase tracking-widest ml-1">
                              Yog'och tayanchlar
                            </h4>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                ["yg_oddiy", "Oddiy"],
                                ["yg_bir_tirgakli", "1-tirgak"],
                                ["yg_ikki_tirgakli", "2-tirgak"],
                              ].map(([field, label]) => (
                                <input
                                  key={field}
                                  type="number"
                                  placeholder={label}
                                  value={bolim[field]}
                                  onChange={(e) => handleBolimChange(idx, field, e.target.value)}
                                  className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-white text-center text-sm outline-none focus:border-orange-500"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* + Yangi bo'lim qo'shish */}
                <div className="relative flex justify-center items-center py-2">
                  <div className="absolute w-full h-[1px] bg-slate-700/50"></div>
                  <button
                    type="button"
                    onClick={addBolim}
                    className="relative bg-slate-900 border border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-90 z-10"
                    title="Yangi bo'lim qo'shish"
                  >
                    <Plus size={18} strokeWidth={3} />
                  </button>
                </div>
              </div>

              {/* ── Tugmalar ── */}
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
