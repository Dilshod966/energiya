// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
const STATUS_MAP = {
  active:       ["bg-emerald-500/20 text-emerald-400 border border-emerald-500/30", "Faol"],
  maintenance:  ["bg-amber-500/20  text-amber-400  border border-amber-500/30",  "Ta'mirlashda"],
  construction: ["bg-[#ff6b6b]   text-[#aa0505]   border border-[#aa0505]",   "Qurilishda"],
};

export default function StatusBadge({ status }) {
  const [cls, label] = STATUS_MAP[status] || STATUS_MAP.active;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>
      {label}
    </span>
  );
}
