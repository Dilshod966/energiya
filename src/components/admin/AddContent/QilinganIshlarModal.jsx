import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Wrench, Search, Plus, Trash2 } from "lucide-react";
import { getLiniyalar, getTransformatorlar } from "../../../services/api";

export default function QilinganIshlarModal({ isOpen, onClose, refreshData, editData }) {
  const initForm = {
    tur: "liniya",
    ob_id: "",
    ob_nomi: "",
    ishchilar: [{ lavozim: "", ism_familiya: "" }],
    naryad_raqami: "",
    ish_kun: "",
    ish_soat: "",
    ish_matni: "",
  };
  const [form, setForm] = useState(initForm);
  const [obList, setObList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hozirgiVaqt, setHozirgiVaqt] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    if (editData) {
      const kun = editData.ish_kun
        ? String(editData.ish_kun).split("T")[0]
        : "";
      // Eski format (ism/familiya) bilan moslik
      let ishchilar = editData.ishchilar;
      if (!ishchilar || !Array.isArray(ishchilar) || ishchilar.length === 0) {
        ishchilar = [{ lavozim: editData.lavozim || "", ism_familiya: editData.ism_familiya || (editData.ism && editData.familiya ? `${editData.ism} ${editData.familiya}` : editData.ism || editData.familiya || "") }];
      }
      setForm({
        tur: editData.tur || "liniya",
        ob_id: editData.ob_id || "",
        ob_nomi: editData.ob_nomi || "",
        ishchilar,
        naryad_raqami: editData.naryad_raqami || "",
        ish_kun: kun,
        ish_soat: editData.ish_soat ? String(editData.ish_soat).slice(0, 5) : "",
        ish_matni: editData.ish_matni || "",
      });
      setSearchTerm(editData.ob_nomi || "");
    } else {
      setForm(initForm);
      setSearchTerm("");
    }
    setHozirgiVaqt(false);
  }, [isOpen, editData]);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const res =
          form.tur === "liniya"
            ? await getLiniyalar("all")
            : await getTransformatorlar("all");
        setObList(res?.data || []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [form.tur, isOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = obList.filter((item) => {
    const name =
      form.tur === "liniya" ? item.name || "" : item.tp_raqami || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const selectItem = (item) => {
    const name = form.tur === "liniya" ? item.name : item.tp_raqami;
    setForm((p) => ({ ...p, ob_id: item.id, ob_nomi: name }));
    setSearchTerm(name);
    setShowDropdown(false);
  };

  const updateIshchi = (index, field, value) => {
    setForm((p) => {
      const ishchilar = [...p.ishchilar];
      ishchilar[index] = { ...ishchilar[index], [field]: value };
      return { ...p, ishchilar };
    });
  };

  const addIshchi = () => {
    setForm((p) => ({
      ...p,
      ishchilar: [...p.ishchilar, { lavozim: "", ism_familiya: "" }],
    }));
  };

  const removeIshchi = (index) => {
    setForm((p) => ({
      ...p,
      ishchilar: p.ishchilar.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ishchilarToliq = form.ishchilar.every(
      (i) => i.lavozim.trim() && i.ism_familiya.trim()
    );
    if (
      !form.ob_id ||
      !ishchilarToliq ||
      !form.naryad_raqami.trim() ||
      !form.ish_kun ||
      !form.ish_soat ||
      !form.ish_matni.trim()
    ) {
      alert("Barcha maydonlarni to'ldiring!");
      return;
    }
    setLoading(true);
    try {
      const url = editData
        ? `http://localhost:5000/api/ish/${editData.id}`
        : "http://localhost:5000/api/ish";
      await fetch(url, {
        method: editData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      refreshData();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-lg bg-[#0a0f1a] mt-12 border border-white/10 rounded-2xl shadow-2xl z-10 overflow-hidden"
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-[#0f1829]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-violet-600/20 rounded-xl flex items-center justify-center">
                  <Wrench size={15} className="text-violet-400" />
                </div>
                <h3 className="text-white font-bold text-sm">
                  {editData ? "Ishni tahrirlash" : "Yangi ish qo'shish"}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
              >
                <X size={15} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-5 space-y-4 max-h-[78vh] overflow-y-auto"
            >
              {/* Tur - Radio */}
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 block">
                  Ish qayerda qilindi
                </label>
                <div className="flex gap-2">
                  {[
                    { v: "liniya", l: "Liniya" },
                    { v: "transformator", l: "Transformator" },
                  ].map(({ v, l }) => (
                    <label
                      key={v}
                      className={`flex items-center gap-2.5 flex-1 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                        form.tur === v
                          ? "bg-violet-600/10 border-violet-500/30 text-violet-300"
                          : "border-white/5 text-slate-500 hover:border-white/10"
                      }`}
                    >
                      <input
                        type="radio"
                        name="tur"
                        value={v}
                        checked={form.tur === v}
                        onChange={() => {
                          setForm((p) => ({
                            ...p,
                            tur: v,
                            ob_id: "",
                            ob_nomi: "",
                          }));
                          setSearchTerm("");
                        }}
                        className="hidden"
                      />
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          form.tur === v
                            ? "border-violet-400"
                            : "border-slate-600"
                        }`}
                      >
                        {form.tur === v && (
                          <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                        )}
                      </div>
                      <span className="text-[12px] font-semibold">{l}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Search dropdown */}
              <div className="relative" ref={dropdownRef}>
                <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 block">
                  {form.tur === "liniya"
                    ? "Liniyani tanlang"
                    : "Transformatorni tanlang"}
                </label>
                <div className="relative">
                  <Search
                    size={13}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder={
                      form.tur === "liniya"
                        ? "Liniya nomini yozing..."
                        : "TP raqamini yozing..."
                    }
                    className="w-full bg-[#0f1829] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-white placeholder:text-slate-600 outline-none focus:border-violet-500/40 transition-all"
                  />
                </div>
                <AnimatePresence>
                  {showDropdown && filtered.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute z-30 w-full mt-1.5 bg-[#0a0f1a] border border-white/10 rounded-xl shadow-2xl max-h-44 overflow-y-auto"
                    >
                      {filtered.slice(0, 25).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => selectItem(item)}
                          className="w-full text-left px-4 py-2.5 text-[13px] text-slate-300 hover:bg-violet-600/10 hover:text-violet-300 transition-colors border-b border-white/5 last:border-0"
                        >
                          {form.tur === "liniya" ? item.name : item.tp_raqami}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Ishchilar ro'yxati */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] text-slate-500 uppercase tracking-widest">
                    Ishchilar
                  </label>
                  <button
                    type="button"
                    onClick={addIshchi}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-600/15 border border-violet-500/25 text-violet-400 hover:bg-violet-600/25 transition-all text-[11px] font-semibold"
                  >
                    <Plus size={12} />
                    Qo'shish
                  </button>
                </div>
                <div className="space-y-2">
                  {form.ishchilar.map((ishchi, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-2 gap-2 relative group"
                    >
                      <input
                        type="text"
                        value={ishchi.lavozim}
                        onChange={(e) => updateIshchi(index, "lavozim", e.target.value)}
                        placeholder="Lavozim"
                        className="w-full bg-[#0f1829] border border-white/10 rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-600 outline-none focus:border-violet-500/40 transition-all"
                      />
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={ishchi.ism_familiya}
                          onChange={(e) => updateIshchi(index, "ism_familiya", e.target.value)}
                          placeholder="Ism Familiya"
                          className="flex-1 min-w-0 bg-[#0f1829] border border-white/10 rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-600 outline-none focus:border-violet-500/40 transition-all"
                        />
                        {form.ishchilar.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeIshchi(index)}
                            className="w-9 flex-shrink-0 flex items-center justify-center rounded-xl border border-red-500/20 text-red-500/60 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/40 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Naryad raqami yoki Farmoyish */}
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 block">
                  Naryad raqami yoki Farmoyish
                </label>
                <input
                  type="text"
                  value={form.naryad_raqami}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, naryad_raqami: e.target.value }))
                  }
                  placeholder="Masalan: N-245 yoki Farmoyish №12"
                  className="w-full bg-[#0f1829] border border-white/10 rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-slate-600 outline-none focus:border-violet-500/40 transition-all"
                />
              </div>

              {/* Vaqt */}
              <div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 block">
                      Ish kuni
                    </label>
                    <input
                      type="date"
                      value={form.ish_kun}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, ish_kun: e.target.value }))
                      }
                      className="w-full bg-[#0f1829] border border-white/10 rounded-xl px-3.5 py-2.5 text-[13px] text-white outline-none focus:border-violet-500/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 block">
                      Soat
                    </label>
                    <input
                      type="time"
                      value={form.ish_soat}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, ish_soat: e.target.value }))
                      }
                      className="w-full bg-[#0f1829] border border-white/10 rounded-xl px-3.5 py-2.5 text-[13px] text-white outline-none focus:border-violet-500/40 transition-all"
                    />
                  </div>
                </div>
                {/* Hozirgi vaqt checkbox */}
                <label className="flex items-center gap-2.5 mt-2.5 cursor-pointer w-fit group">
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={hozirgiVaqt}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setHozirgiVaqt(checked);
                      if (checked) {
                        const now = new Date();
                        const kun = now.toLocaleDateString("sv-SE");
                        const soat = now.toTimeString().slice(0, 5);
                        setForm((p) => ({ ...p, ish_kun: kun, ish_soat: soat }));
                      } else {
                        setForm((p) => ({ ...p, ish_kun: "", ish_soat: "" }));
                      }
                    }}
                  />
                  <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center flex-shrink-0 ${
                    hozirgiVaqt
                      ? "bg-violet-600 border-violet-500"
                      : "bg-[#0f1829] border-white/20 group-hover:border-violet-500/60"
                  }`}>
                    {hozirgiVaqt && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className={`text-[11px] transition-colors select-none ${
                    hozirgiVaqt ? "text-violet-400" : "text-slate-500 group-hover:text-slate-400"
                  }`}>
                    Hozirgi kun va vaqtni qo'llash
                  </span>
                </label>
              </div>

              {/* Ish matni */}
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 block">
                  Ish matni
                </label>
                <textarea
                  value={form.ish_matni}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, ish_matni: e.target.value }))
                  }
                  placeholder="Qilingan ish haqida batafsil yozing..."
                  rows={4}
                  className="w-full bg-[#0f1829] border border-white/10 rounded-xl px-3.5 py-3 text-[13px] text-white placeholder:text-slate-600 outline-none focus:border-violet-500/40 transition-all resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-[13px] font-semibold hover:bg-white/5 transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-bold transition-all disabled:opacity-50 shadow-lg shadow-violet-600/20"
                >
                  {loading
                    ? "Saqlanmoqda..."
                    : editData
                    ? "Yangilash"
                    : "Saqlash"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
