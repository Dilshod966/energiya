// ─── ANIMATED LOAD RING (SVG stroke-dasharray) ────────────────────────────────
export default function LoadRing({ value, color }) {
  const r    = 22;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;

  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      {/* Track */}
      <circle cx="28" cy="28" r={r} fill="none" stroke="#1e293b" strokeWidth="4" />
      {/* Progress */}
      <circle
        cx="28" cy="28" r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 28 28)"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x="28" y="32" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">
        {value}%
      </text>
    </svg>
  );
}
