import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Zap,
  Ruler,
  Shield,
  GitBranch,
  FileSpreadsheet,
  Columns,
  Wrench,
} from "lucide-react";
import * as XLSX from "xlsx";

const formatIshDate = (d) => {
  if (!d) return "";
  const s = String(d).split("T")[0];
  const p = s.split("-");
  return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : s;
};

export default function LiniyaViewModal({ isOpen, onClose, data }) {
  const [ishlar, setIshlar] = useState([]);

  // ESC tugmasi
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  // Liniyaga tegishli ishlarni yuklash
  useEffect(() => {
    if (!isOpen || !data?.id) return;
    fetch(`http://localhost:5000/api/ish/filter?tur=liniya&ob_id=${data.id}`)
      .then((r) => r.json())
      .then((d) => setIshlar(Array.isArray(d) ? d : []))
      .catch(() => setIshlar([]));
  }, [isOpen, data?.id]);

  const parseArr = (val, fallback = []) => {
    if (Array.isArray(val)) return val;
    try {
      return JSON.parse(val) || fallback;
    } catch {
      return fallback;
    }
  };

  const handleExport = () => {
    if (!data) return;

    const simlar = parseArr(data.simlar);
    const izolyatorlar = parseArr(data.izolyatorlar);
    const traverslar = parseArr(data.traverslar);

    const rows = [
      ["LINIYA MA'LUMOTLARI", ""],
      ["", ""],
      ["Nomi", data.name],
      ["Inventar raqami", data.inventar_raqami],
      ["Fider", data.fider],
      ["Kuchlanishi", data.kuchlanishi],
      ["Hisob", data.hisob],
      ["Jami uzunligi (km)", data.jami_uzunligi],
      ["Jami izolyator (dona)", data.jami_izolyator],
      ["Jami travers (dona)", data.jami_travers],
      ["", ""],
      ["SIMLAR", ""],
      ["Sim turi", "Uzunligi (km)"],
      ...simlar.map((s) => [s.sim_turi, s.sim_uzunligi]),
      ["", ""],
      ["IZOLYATORLAR", ""],
      ["Turi", "Soni (dona)"],
      ...izolyatorlar.map((i) => [i.turi, i.soni]),
      ["", ""],
      ["TRAVERSLAR", ""],
      ["Turi", "Soni (dona)"],
      ...traverslar.map((t) => [t.turi, t.soni]),
      ["", ""],
      ["TEMIR-BETON TAYANCHLAR", ""],
      ["Oddiy", data.tb_oddiy],
      ["1-tirgakli", data.tb_bir_tirgakli],
      ["2-tirgakli", data.tb_ikki_tirgakli],
      ["", ""],
      ["YOG'OCH TAYANCHLAR", ""],
      ["Oddiy", data.yg_oddiy],
      ["1-tirgakli", data.yg_bir_tirgakli],
      ["2-tirgakli", data.yg_ikki_tirgakli],
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 28 }, { wch: 30 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Liniya");
    XLSX.writeFile(wb, `Liniya_${data.name || data.id}.xlsx`);
  };

  if (!data) return null;

  const simlar = parseArr(data.simlar);
  const izolyatorlar = parseArr(data.izolyatorlar);
  const traverslar = parseArr(data.traverslar);

  const Field = ({ label, value, accent }) => (
    <div className="bg-slate-800/60 rounded-xl px-3 py-2.5 border border-slate-700/50">
      <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">
        {label}
      </p>
      <p className={`text-sm font-semibold ${accent || "text-white"}`}>
        {value ?? <span className="text-slate-600 italic text-xs">—</span>}
      </p>
    </div>
  );

  const ArrayTable = ({
    items,
    col1Key,
    col2Key,
    col1Label,
    col2Label,
    accentColor,
  }) => (
    <div className="rounded-2xl border border-slate-700/60 overflow-hidden">
      <div className="grid grid-cols-2 bg-slate-800/80 px-4 py-2">
        <span
          className={`text-[9px] font-black uppercase tracking-widest ${accentColor}`}
        >
          {col1Label}
        </span>
        <span
          className={`text-[9px] font-black uppercase tracking-widest text-right ${accentColor}`}
        >
          {col2Label}
        </span>
      </div>
      {items.length === 0 ? (
        <div className="px-4 py-3 text-slate-600 text-xs italic text-center">
          Ma'lumot yo'q
        </div>
      ) : (
        items.map((item, i) => (
          <div
            key={i}
            className="grid grid-cols-2 px-4 py-2.5 border-t border-slate-800 hover:bg-slate-800/30 transition-colors"
          >
            <span className="text-white text-sm">{item[col1Key] || "—"}</span>
            <span className={`text-sm font-bold text-right ${accentColor}`}>
              {item[col2Key] || "—"}
            </span>
          </div>
        ))
      )}
    </div>
  );

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[61] flex items-start pt-16 justify-center p-4 overflow-y-auto custom-scrollbar pointer-events-none">
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.97 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl mb-12 pointer-events-auto overflow-hidden"
            >
              {/* Header gradient line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />

              {/* Header */}
              <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Zap
                      size={18}
                      className="text-amber-400 fill-amber-400/30"
                    />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">
                      Liniya
                    </p>
                    <h3 className="text-xl font-black text-white leading-tight">
                      {data.name || (
                        <span className="text-slate-500 italic text-base">
                          Nomsiz liniya
                        </span>
                      )}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Excel tugmasi */}
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={handleExport}
                    className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-br from-[#1D6F42] to-[#107C41] rounded-xl" />
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-[#22864e] to-[#13924d] rounded-xl transition-opacity duration-200" />
                    <span
                      className="absolute inset-0 opacity-10 rounded-xl"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(0deg,transparent,transparent 8px,rgba(255,255,255,0.3) 8px,rgba(255,255,255,0.3) 9px),repeating-linear-gradient(90deg,transparent,transparent 8px,rgba(255,255,255,0.3) 8px,rgba(255,255,255,0.3) 9px)",
                      }}
                    />
                    <FileSpreadsheet
                      size={15}
                      className="relative text-white z-10"
                    />
                    <span className="relative text-white z-10 tracking-wider">
                      EXCEL
                    </span>
                  </motion.button>

                  {/* Yopish */}
                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-8 py-6 space-y-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
                {/* Hisob badge */}
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                      data.hisob === "tet"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                    }`}
                  >
                    {data.hisob === "tet" ? "TET" : "ISTE'MOLCHI"}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase border bg-amber-500/10 text-amber-400 border-amber-500/20">
                    {data.jami_uzunligi || 0} km
                  </span>
                </div>

                {/* Asosiy ma'lumotlar */}
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Columns size={12} /> Asosiy Ma'lumotlar
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Field
                      label="Inventar raqami"
                      value={data.inventar_raqami}
                    />
                    <Field label="Fider" value={data.fider} />
                    <Field
                      label="Kuchlanishi"
                      value={data.kuchlanishi}
                      accent="text-amber-400"
                    />
                    <Field
                      label="Jami uzunligi"
                      value={`${data.jami_uzunligi || 0} km`}
                      accent="text-amber-400"
                    />
                  </div>
                </div>

                <div className="h-px bg-slate-800" />

                {/* Simlar, Izolyatorlar, Traverslar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Simlar */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                      <Ruler size={12} /> Simlar
                    </p>
                    <ArrayTable
                      items={simlar}
                      col1Key="sim_turi"
                      col2Key="sim_uzunligi"
                      col1Label="Turi"
                      col2Label="km"
                      accentColor="text-blue-400"
                    />
                  </div>

                  {/* Izolyatorlar */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                      <Shield size={12} /> Izolyatorlar
                      {data.jami_izolyator ? (
                        <span className="ml-auto text-white font-black text-[11px] bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                          {data.jami_izolyator}
                        </span>
                      ) : null}
                    </p>
                    <ArrayTable
                      items={izolyatorlar}
                      col1Key="turi"
                      col2Key="soni"
                      col1Label="Turi"
                      col2Label="Soni"
                      accentColor="text-emerald-400"
                    />
                  </div>

                  {/* Traverslar */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest flex items-center gap-2">
                      <GitBranch size={12} /> Traverslar
                      {data.jami_travers ? (
                        <span className="ml-auto text-white font-black text-[11px] bg-violet-500/20 px-2 py-0.5 rounded-lg border border-violet-500/30">
                          {data.jami_travers}
                        </span>
                      ) : null}
                    </p>
                    <ArrayTable
                      items={traverslar}
                      col1Key="turi"
                      col2Key="soni"
                      col1Label="Turi"
                      col2Label="Soni"
                      accentColor="text-violet-400"
                    />
                  </div>
                </div>

                <div className="h-px bg-slate-800" />

                {/* Tayanchlar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                      Temir-beton tayanchlar
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <Field label="Oddiy" value={data.tb_oddiy} />
                      <Field label="1-tirgakli" value={data.tb_bir_tirgakli} />
                      <Field label="2-tirgakli" value={data.tb_ikki_tirgakli} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">
                      Yog'och tayanchlar
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <Field label="Oddiy" value={data.yg_oddiy} />
                      <Field label="1-tirgakli" value={data.yg_bir_tirgakli} />
                      <Field label="2-tirgakli" value={data.yg_ikki_tirgakli} />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-slate-800" />

                {/* ── Qilingan Ishlar ────────────────────────────────── */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest flex items-center gap-2">
                    <Wrench size={12} /> Qilingan Ishlar
                    {ishlar.length > 0 && (
                      <span className="ml-1 px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/25 text-[9px] font-black">
                        {ishlar.length}
                      </span>
                    )}
                  </p>

                  {ishlar.length === 0 ? (
                    <div className="flex items-center justify-center py-8 rounded-2xl border border-slate-800 border-dashed">
                      <p className="text-slate-600 text-xs italic">
                        Bu liniya uchun hech qanday ish qayd etilmagan
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {ishlar.map((ish, idx) => (
                        <motion.div
                          key={ish.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="flex gap-0 rounded-2xl bg-slate-800/40 border border-slate-700/40 overflow-hidden hover:border-slate-600/50 transition-all"
                        >
                          {/* Amber stripe (liniya rangi) */}
                          <div className="w-1 flex-shrink-0 bg-amber-500" />

                          <div className="flex-1 px-4 py-3 min-w-0">
                            {/* Worker */}
                            <p className="text-violet-400 text-[11px] font-bold mb-1.5">
                              {ish.ism} {ish.familiya}
                            </p>
                            {/* Ish matni */}
                            <p className="text-slate-300 text-[12px] leading-relaxed whitespace-pre-wrap">
                              {ish.ish_matni}
                            </p>
                            {/* Date + time */}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-[9px] text-slate-500 font-mono bg-slate-800 px-2 py-0.5 rounded-md">
                                {formatIshDate(ish.ish_kun)}
                              </span>
                              <span className="text-slate-700 text-[9px]">•</span>
                              <span className="text-[9px] text-slate-500 font-mono bg-slate-800 px-2 py-0.5 rounded-md">
                                {String(ish.ish_soat || "").slice(0, 5)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
