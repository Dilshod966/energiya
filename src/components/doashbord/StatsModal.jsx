import { useState, useMemo, useEffect } from "react";
import { X, Search, FileSpreadsheet, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from "xlsx";

/* ─── Umumiy StatBlock ─────────────────────────────────────────────── */
function StatBlock({ value, label, color, border, km }) {
  return (
    <div className={`flex flex-col items-center w-16 ${border ? "border-x border-slate-700/50" : ""}`}>
      <span className={`${color} font-mono text-[13px] leading-none`}>
        {value ?? 0} {km ? "km" : "ta"}
      </span>
      <span className="text-[10px] uppercase text-slate-500 mt-1">{label}</span>
    </div>
  );
}

/* ─── Select ───────────────────────────────────────────────────────── */
function FilterSelect({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-slate-800 border border-slate-700/60 text-white text-[11px] rounded-lg pl-3 pr-7 py-1.5 focus:outline-none focus:border-blue-500/60 cursor-pointer transition-all min-w-[140px]"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
      <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
    </div>
  );
}

/* ─── Hisob badge ──────────────────────────────────────────────────── */
function HisobBadge({ hisob }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
      hisob === "tet"
        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
        : "bg-orange-500/10 text-orange-400 border-orange-500/20"
    }`}>
      {hisob === "tet" ? "TET" : "Iste'mol"}
    </span>
  );
}

/* ─── Asosiy komponent ─────────────────────────────────────────────── */
export default function StatsModal({ isOpen, onClose, statType, data }) {
  const [nameQ,   setNameQ]   = useState("");
  const [turQ,    setTurQ]    = useState("");
  const [parentQ, setParentQ] = useState("");

  /* Modal yopilganda filterlarni tozalash */
  useEffect(() => {
    if (!isOpen) { setNameQ(""); setTurQ(""); setParentQ(""); }
  }, [isOpen]);

  /* Har bir tur uchun tegishli ro'yxat */
  const rawList = data?.[statType] ?? [];

  /* Nimstansiya uchun parentName ni ustachilikdan olamiz */
  const list = useMemo(() => {
    if (statType === "nimstansiya") {
      return rawList.map((item) => ({
        ...item,
        parentName: (data?.ustachilik ?? []).find((u) => u.id === item.parentId)?.name ?? "—",
      }));
    }
    return rawList;
  }, [rawList, statType, data]);

  /* Ota-element select options */
  const parentOptions = useMemo(() => {
    if (statType === "nimstansiya")   return data?.ustachilik   ?? [];
    if (statType === "liniya")        return data?.nimstansiya  ?? [];
    if (statType === "transformator") return data?.liniya       ?? [];
    return [];
  }, [statType, data]);

  /* Filtr */
  const filtered = useMemo(() => {
    return list.filter((item) => {
      if (nameQ) {
        const val = statType === "transformator" ? item.tp_raqami : item.name;
        if (!String(val ?? "").toLowerCase().includes(nameQ.toLowerCase())) return false;
      }
      if (turQ && (statType === "liniya" || statType === "transformator")) {
        if (item.hisob !== turQ) return false;
      }
      if (parentQ && String(item.parentId) !== String(parentQ)) return false;
      return true;
    });
  }, [list, nameQ, turQ, parentQ, statType]);

  const clearFilters = () => { setNameQ(""); setTurQ(""); setParentQ(""); };
  const hasFilter = nameQ || turQ || parentQ;

  /* Excel eksport */
  const handleExcel = () => {
    let headers = [];
    let rows = [];

    if (statType === "ustachilik") {
      headers = ["Nomi", "Mas'ul", "Nimst. jami", "Nimst. TET", "Nimst. Iste'mol", "Lin. jami (km)", "Lin. TET (km)", "Lin. Iste'mol (km)", "Trans. jami", "Trans. TET", "Trans. Iste'mol"];
      rows = filtered.map((i) => [i.name, i.usta, i.n_jami, i.n_tet, i.n_istemol, i.l_jami, i.l_tet, i.l_istemol, i.t_jami, i.t_tet, i.t_istemol]);
    } else if (statType === "nimstansiya") {
      headers = ["Nomi", "Bo'lim", "Quvvat (kVA)", "Lin. jami (km)", "Lin. TET (km)", "Lin. Iste'mol (km)", "Trans. jami", "Trans. TET", "Trans. Iste'mol"];
      rows = filtered.map((i) => [i.name, i.parentName, i.quvvat, i.jami_uzunlik, i.uzunlik_tet, i.uzunlik_istemol, i.trans_jami, i.trans_tet, i.trans_istemol]);
    } else if (statType === "liniya") {
      headers = ["Nomi", "Inventar", "Uzunlik (km)", "Trans. jami", "Trans. TET", "Trans. Iste'mol", "Balans", "Nimstansiya"];
      rows = filtered.map((i) => [i.name, i.inventar_raqami, i.jami_uzunligi, i.jami_trafo, i.tet_trafo, i.istemol_trafo, i.hisob, i.parentName]);
    } else {
      headers = ["TP Raqami", "Quvvat", "Mahalla", "Ko'cha", "Fider", "Mukammal TP", "Joriy TP", "Balans", "Liniya"];
      rows = filtered.map((i) => [i.tp_raqami, i.quvvat, i.mahalla, i.kocha_nomi, i.fider, i.mukammal_tp, i.joriy_tp, i.hisob, i.parentName]);
    }

    const TITLES = { ustachilik: "Bolimlar", nimstansiya: "Nimstansiyalar", liniya: "Liniyalar", transformator: "Transformatorlar" };
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws["!cols"] = headers.map(() => ({ wch: 18 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, TITLES[statType]);
    XLSX.writeFile(wb, `${TITLES[statType]}.xlsx`);
  };

  const TITLES = {
    ustachilik:    "BO'LIMLAR",
    nimstansiya:   "NIMSTANSIYALAR",
    liniya:        "LINIYALAR",
    transformator: "TRANSFORMATORLAR",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[71] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ scale: 0.96, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 12 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
              style={{ maxHeight: "88vh" }}
            >
              {/* Gradient top line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 rounded-t-[2rem]" />

              {/* ── Header ────────────────────────────────────────── */}
              <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-slate-800 shrink-0">
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-0.5">Ro'yxat</p>
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                    {TITLES[statType]}
                    <span className="text-sm font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                      {filtered.length} ta
                    </span>
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  {/* Excel */}
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={handleExcel}
                    className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs overflow-hidden group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-br from-[#1D6F42] to-[#107C41] rounded-xl" />
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-[#22864e] to-[#13924d] rounded-xl transition-opacity duration-200" />
                    <FileSpreadsheet size={14} className="relative text-white z-10" />
                    <span className="relative text-white z-10 tracking-wider">EXCEL</span>
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

              {/* ── Filter satrasi ────────────────────────────────── */}
              <div className="px-8 py-4 border-b border-slate-800 bg-slate-800/20 flex flex-wrap gap-3 items-center shrink-0">
                {/* Nomi qidiruv */}
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    value={nameQ}
                    onChange={(e) => setNameQ(e.target.value)}
                    placeholder={statType === "transformator" ? "TP raqami..." : "Nomi..."}
                    className="bg-slate-800 border border-slate-700/60 text-white text-[11px] rounded-lg pl-8 pr-3 py-1.5 w-40 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 placeholder:text-slate-600 transition-all"
                  />
                </div>

                {/* Turi: TET / Iste'mol — faqat liniya va transformator uchun */}
                {(statType === "liniya" || statType === "transformator") && (
                  <div className="flex items-center gap-1.5">
                    {["", "tet", "istemol"].map((v) => (
                      <button
                        key={v}
                        onClick={() => setTurQ(v)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                          turQ === v
                            ? v === "" ? "bg-slate-700 text-white border-slate-600"
                              : v === "tet" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                              : "bg-orange-500/20 text-orange-400 border-orange-500/40"
                            : "bg-transparent text-slate-500 border-slate-700/50 hover:border-slate-600 hover:text-slate-300"
                        }`}
                      >
                        {v === "" ? "Barchasi" : v === "tet" ? "TET" : "Iste'mol"}
                      </button>
                    ))}
                  </div>
                )}

                {/* Ota-element select — ustachilikdan tashqari barchasida */}
                {statType !== "ustachilik" && parentOptions.length > 0 && (
                  <FilterSelect
                    value={parentQ}
                    onChange={setParentQ}
                    options={parentOptions}
                    placeholder={
                      statType === "nimstansiya"   ? "— Bo'lim —"       :
                      statType === "liniya"        ? "— Nimstansiya —"  :
                                                    "— Liniya —"
                    }
                  />
                )}

                {/* Tozalash */}
                <AnimatePresence>
                  {hasFilter && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                      onClick={clearFilters}
                      className="text-[10px] font-bold text-slate-400 border border-slate-700 px-3 py-1.5 rounded-lg hover:text-white hover:border-slate-500 transition-all flex items-center gap-1"
                    >
                      <X size={10} /> Tozalash
                    </motion.button>
                  )}
                </AnimatePresence>

                {/* Natija soni */}
                <span className="ml-auto text-[10px] text-slate-500">
                  {filtered.length} / {list.length} ta ko'rsatilmoqda
                </span>
              </div>

              {/* ── Jadval ───────────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto overflow-x-auto custom-scrollbar">
                {filtered.length === 0 ? (
                  <div className="flex items-center justify-center py-16 text-slate-600 italic text-sm gap-2">
                    <Search size={16} />
                    Filtr bo'yicha ma'lumot topilmadi
                  </div>
                ) : (

                  /* ══ USTACHILIK ══════════════════════════════════ */
                  statType === "ustachilik" ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-900/50 sticky top-0 z-10">
                          <th className="px-6 py-4 font-medium">Nomi / Mas'ul</th>
                          <th className="px-6 py-4 text-center font-medium">Nimstansiyalar</th>
                          <th className="px-6 py-4 text-center font-medium">Liniyalar</th>
                          <th className="px-6 py-4 text-center font-medium">Transformatorlar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filtered.map((item, idx) => (
                          <motion.tr key={item.id}
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.025 }}
                            className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-all">
                            <td className="px-6 py-4 text-white font-medium">
                              {item.name}
                              <div className="text-[11px] text-slate-500 mt-0.5">{item.usta}</div>
                            </td>
                            <td className="px-4 py-4 border-r border-slate-700/30">
                              <div className="flex items-center justify-center">
                                <StatBlock value={item.n_jami}   label="Jami"    color="text-white" />
                                <StatBlock value={item.n_tet}    label="TET"     color="text-blue-400"  border />
                                <StatBlock value={item.n_istemol}label="Iste'mol"color="text-amber-400" />
                              </div>
                            </td>
                            <td className="px-4 py-4 border-r border-slate-700/30">
                              <div className="flex items-center justify-center">
                                <StatBlock value={item.l_jami}   label="Jami"    color="text-white"     km />
                                <StatBlock value={item.l_tet}    label="TET"     color="text-blue-400"  border km />
                                <StatBlock value={item.l_istemol}label="Iste'mol"color="text-amber-400" km />
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center">
                                <StatBlock value={item.t_jami}   label="Jami"    color="text-white" />
                                <StatBlock value={item.t_tet}    label="TET"     color="text-blue-400"  border />
                                <StatBlock value={item.t_istemol}label="Iste'mol"color="text-amber-400" />
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>

                  /* ══ NIMSTANSIYA ══════════════════════════════════ */
                  ) : statType === "nimstansiya" ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-900/50 sticky top-0 z-10">
                          <th className="px-6 py-4 font-medium">Nomi</th>
                          <th className="px-6 py-4 text-center font-medium">Bo'lim</th>
                          <th className="px-6 py-4 text-center font-medium">Quvvat</th>
                          <th className="px-6 py-4 text-center font-medium">Liniyalar</th>
                          <th className="px-6 py-4 text-center font-medium">Transformatorlar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filtered.map((item, idx) => (
                          <motion.tr key={item.id}
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.025 }}
                            className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-all">
                            <td className="px-6 py-4 text-white font-medium">{item.name}</td>
                            <td className="px-6 py-4 text-center text-slate-400 text-xs">{item.parentName}</td>
                            <td className="px-6 py-4 text-center text-blue-400 font-mono text-sm">{item.quvvat} kVA</td>
                            <td className="px-4 py-4 border-r border-slate-700/30">
                              <div className="flex items-center justify-center">
                                <StatBlock value={item.jami_uzunlik}   label="Jami"    color="text-white"     km />
                                <StatBlock value={item.uzunlik_tet}    label="TET"     color="text-blue-400"  border km />
                                <StatBlock value={item.uzunlik_istemol}label="Iste'mol"color="text-amber-400" km />
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center">
                                <StatBlock value={item.trans_jami}   label="Jami"    color="text-white" />
                                <StatBlock value={item.trans_tet}    label="TET"     color="text-blue-400"  border />
                                <StatBlock value={item.trans_istemol}label="Iste'mol"color="text-amber-400" />
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>

                  /* ══ LINIYA ══════════════════════════════════════ */
                  ) : statType === "liniya" ? (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-900/50 sticky top-0 z-10">
                          <th className="px-6 py-4 font-medium">Liniya Nomi</th>
                          <th className="px-6 py-4 text-center font-medium">Inventar</th>
                          <th className="px-6 py-4 text-center font-medium">Uzunlik</th>
                          <th className="px-6 py-4 text-center font-medium">Transformatorlar</th>
                          <th className="px-6 py-4 text-center font-medium">Nimstansiya</th>
                          <th className="px-6 py-4 text-center font-medium">Balans</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filtered.map((item, idx) => (
                          <motion.tr key={item.id}
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.025 }}
                            className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-all">
                            <td className="px-6 py-4 text-white font-medium">{item.name}</td>
                            <td className="px-6 py-4 text-center text-slate-400 text-xs italic">{item.inventar_raqami || "—"}</td>
                            <td className="px-6 py-4 text-center text-amber-400 font-mono font-bold">{item.jami_uzunligi || 0} km</td>
                            <td className="px-4 py-4 border-r border-slate-700/30">
                              <div className="flex items-center justify-center">
                                <StatBlock value={item.jami_trafo}   label="Jami"    color="text-white" />
                                <StatBlock value={item.tet_trafo}    label="TET"     color="text-blue-400"  border />
                                <StatBlock value={item.istemol_trafo}label="Iste'mol"color="text-amber-400" />
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center text-slate-400 text-xs">{item.parentName || "—"}</td>
                            <td className="px-6 py-4 text-center"><HisobBadge hisob={item.hisob} /></td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>

                  /* ══ TRANSFORMATOR ════════════════════════════════ */
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-900/50 sticky top-0 z-10">
                          <th className="px-6 py-4 font-medium">TP Raqami</th>
                          <th className="px-6 py-4 text-center font-medium">Quvvati</th>
                          <th className="px-6 py-4 text-center font-medium">Manzili</th>
                          <th className="px-6 py-4 text-center font-medium">Mukammal Tamirlash</th>
                          <th className="px-6 py-4 text-center font-medium">Joriy Tamirlash</th>
                          <th className="px-6 py-4 text-center font-medium">Liniya</th>
                          <th className="px-6 py-4 text-center font-medium">Balans</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filtered.map((item, idx) => (
                          <motion.tr key={item.id}
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.025 }}
                            className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-all">
                            <td className="px-6 py-4 text-white font-medium">
                              TP <span className="text-amber-400 font-black">{item.tp_raqami}</span>
                            </td>
                            <td className="px-6 py-4 text-center text-slate-400 text-xs italic">{item.quvvat || "—"}</td>
                            <td className="px-6 py-4 text-center text-slate-400 text-xs italic">
                              {[item.mahalla, item.kocha_nomi].filter(Boolean).join(", ") || "—"}
                            </td>
                            <td className="px-6 py-4 text-center text-slate-400 text-xs">{item.mukammal_tp || "—"}</td>
                            <td className="px-6 py-4 text-center text-slate-400 text-xs">{item.joriy_tp || "—"}</td>
                            <td className="px-6 py-4 text-center text-slate-400 text-xs">{item.parentName || "—"}</td>
                            <td className="px-6 py-4 text-center"><HisobBadge hisob={item.hisob} /></td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  )
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
