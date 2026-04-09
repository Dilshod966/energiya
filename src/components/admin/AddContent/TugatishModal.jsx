import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Upload, FileText, ImageIcon, CheckCircle2, Clock } from "lucide-react";

export default function TugatishModal({ isOpen, onClose, ish, onSuccess }) {
  const [ishMatni, setIshMatni] = useState("");
  const [tugashKun, setTugashKun] = useState("");
  const [tugashSoat, setTugashSoat] = useState("");
  const [hozirgiVaqt, setHozirgiVaqt] = useState(false);
  const [farmoyishRasmlar, setFarmoyishRasmlar] = useState([]);
  const [ishRasmlar, setIshRasmlar] = useState([]);
  const [loading, setLoading] = useState(false);

  const farmoyishRef = useRef(null);
  const ishRasmRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setIshMatni("");
    setTugashKun("");
    setTugashSoat("");
    setHozirgiVaqt(false);
    setFarmoyishRasmlar([]);
    setIshRasmlar([]);
  }, [isOpen]);

  const addFiles = (files, setter) => {
    const newFiles = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).slice(2),
    }));
    setter((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id, setter) => {
    setter((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const toggleHozirgiVaqt = (checked) => {
    setHozirgiVaqt(checked);
    if (checked) {
      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const d = String(now.getDate()).padStart(2, "0");
      setTugashKun(`${y}-${m}-${d}`);
      setTugashSoat(now.toTimeString().slice(0, 5));
    } else {
      setTugashKun("");
      setTugashSoat("");
    }
  };

  const handleSubmit = async () => {
    if (!ishMatni.trim()) {
      alert("Qilingan ishlar matnini kiriting!");
      return;
    }
    if (!tugashKun || !tugashSoat) {
      alert("Tugash vaqtini kiriting!");
      return;
    }
    if (farmoyishRasmlar.length === 0) {
      alert("Kamida 1 ta Naryad / Farmoyish rasmi yuklang!");
      return;
    }
    if (ishRasmlar.length === 0) {
      alert("Kamida 1 ta qilingan ish rasmi yuklang!");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("ish_matni", ishMatni);
      formData.append("status", "Tugallandi");
      formData.append("tugash_kun", tugashKun);
      formData.append("tugash_soat", tugashSoat);
      formData.append("tur", ish.tur || "");
      formData.append("ob_id", ish.ob_id || "");
      formData.append("ob_nomi", ish.ob_nomi || "");
      formData.append("naryad_raqami", ish.naryad_raqami || "");
      formData.append("boshlanish_kun", ish.boshlanish_kun || ish.ish_kun || "");
      formData.append("boshlanish_soat", ish.boshlanish_soat || ish.ish_soat || "");
      formData.append("ishchilar", JSON.stringify(ish.ishchilar || []));

      farmoyishRasmlar.forEach(({ file }) =>
        formData.append("farmoyish_rasmlar", file)
      );
      ishRasmlar.forEach(({ file }) =>
        formData.append("ish_rasmlar", file)
      );

      const res = await fetch(
        `http://localhost:5000/api/ish/${ish.id}/tugatish`,
        { method: "POST", body: formData }
      );
      if (!res.ok) throw new Error(await res.text());
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Tugatish xato:", err);
      alert("Xatolik yuz berdi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---- Rasm preview bloki ----
  const PreviewList = ({ list, onRemove }) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {list.map(({ id, preview }) => (
        <div key={id} className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
          <img src={preview} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onRemove(id)}
            className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/70 hover:bg-red-500 rounded-full flex items-center justify-center transition-all"
          >
            <X size={9} className="text-white" />
          </button>
        </div>
      ))}
    </div>
  );

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
            className="relative w-full max-w-lg bg-[#0a0f1a] border border-white/10 rounded-2xl shadow-2xl z-10 overflow-hidden"
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-[#0f1829]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-600/20 rounded-xl flex items-center justify-center">
                  <CheckCircle2 size={15} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Ishni tugatish</h3>
                  {ish?.ob_nomi && (
                    <p className="text-slate-500 text-[11px] mt-0.5 truncate max-w-[260px]">
                      {ish.ob_nomi}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[78vh] overflow-y-auto">
              {/* Qilingan ishlar matni */}
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <FileText size={10} />
                  Qilingan ishlar matni
                </label>
                <textarea
                  value={ishMatni}
                  onChange={(e) => setIshMatni(e.target.value)}
                  placeholder="Bajarilgan ishlar haqida batafsil yozing..."
                  rows={4}
                  className="w-full bg-[#0f1829] border border-white/10 rounded-xl px-3.5 py-3 text-[13px] text-white placeholder:text-slate-600 outline-none focus:border-emerald-500/40 transition-all resize-none"
                />
              </div>

              {/* Tugash vaqti */}
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Clock size={10} />
                  Tugash vaqti
                  <span className="text-red-500 font-black">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={tugashKun}
                    onChange={(e) => { setTugashKun(e.target.value); setHozirgiVaqt(false); }}
                    className="w-full bg-[#0f1829] border border-white/10 rounded-xl px-3.5 py-2.5 text-[13px] text-white outline-none focus:border-emerald-500/40 transition-all"
                  />
                  <input
                    type="time"
                    value={tugashSoat}
                    onChange={(e) => { setTugashSoat(e.target.value); setHozirgiVaqt(false); }}
                    className="w-full bg-[#0f1829] border border-white/10 rounded-xl px-3.5 py-2.5 text-[13px] text-white outline-none focus:border-emerald-500/40 transition-all"
                  />
                </div>
                {/* Hozirgi vaqt checkbox */}
                <label className="flex items-center gap-2.5 mt-2.5 cursor-pointer w-fit group">
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={hozirgiVaqt}
                    onChange={(e) => toggleHozirgiVaqt(e.target.checked)}
                  />
                  <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center flex-shrink-0 ${
                    hozirgiVaqt
                      ? "bg-emerald-600 border-emerald-500"
                      : "bg-[#0f1829] border-white/20 group-hover:border-emerald-500/60"
                  }`}>
                    {hozirgiVaqt && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className={`text-[11px] transition-colors select-none ${
                    hozirgiVaqt ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-400"
                  }`}>
                    Hozirgi vaqtni qabul qilish
                  </span>
                </label>
              </div>

              {/* Naryad / Farmoyish rasmi */}
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <ImageIcon size={10} />
                  Naryad / Farmoyish rasmlari
                  <span className="text-red-500 font-black">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => farmoyishRef.current?.click()}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed text-[12px] font-semibold transition-all ${
                    farmoyishRasmlar.length > 0
                      ? "border-emerald-500/40 text-emerald-400 hover:border-emerald-500/60"
                      : "border-red-500/30 text-red-400/70 hover:border-red-500/50 hover:text-red-400"
                  }`}
                >
                  <Upload size={13} />
                  Rasm tanlash
                </button>
                <input
                  ref={farmoyishRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files, setFarmoyishRasmlar)}
                />
                {farmoyishRasmlar.length > 0 && (
                  <PreviewList
                    list={farmoyishRasmlar}
                    onRemove={(id) => removeFile(id, setFarmoyishRasmlar)}
                  />
                )}
              </div>

              {/* Ish rasmlari */}
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <ImageIcon size={10} />
                  Qilingan ish rasmlari
                  <span className="text-red-500 font-black">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => ishRasmRef.current?.click()}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed text-[12px] font-semibold transition-all ${
                    ishRasmlar.length > 0
                      ? "border-emerald-500/40 text-emerald-400 hover:border-emerald-500/60"
                      : "border-red-500/30 text-red-400/70 hover:border-red-500/50 hover:text-red-400"
                  }`}
                >
                  <Upload size={13} />
                  Rasm tanlash
                </button>
                <input
                  ref={ishRasmRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files, setIshRasmlar)}
                />
                {ishRasmlar.length > 0 && (
                  <PreviewList
                    list={ishRasmlar}
                    onRemove={(id) => removeFile(id, setIshRasmlar)}
                  />
                )}
              </div>

              {/* Tugmalar */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 text-[13px] font-semibold hover:bg-white/5 transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[13px] font-bold transition-all disabled:opacity-50 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={14} />
                  {loading ? "Saqlanmoqda..." : "Tugatish"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
