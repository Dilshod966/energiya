import { useParams, useNavigate } from "react-router-dom";
import { getNimstansiyalar } from "../../services/api";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function NimstansiyaList() {
  const { uId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getNimstansiyalar(uId)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [uId]);

  function StatBlock({ value, label, color, border, km }) {
    return (
      <div
        className={`flex flex-col items-center w-16 ${border ? "border-x border-slate-700/50" : ""}`}
      >
        <span className={`${color} font-mono text-[13px] leading-none`}>
          {value || 0} {km ? "km" : "ta"}
        </span>
        <span className="text-[10px] uppercase text-slate-500 mt-1">
          {label}
        </span>
      </div>
    );
  }

  if (loading)
    return (
      <div className="p-10 text-center text-blue-400 font-mono">
        Yuklanmoqda...
      </div>
    );

  return (
    <div className="w-full overflow-hidden border border-slate-800 rounded-xl bg-slate-900/20">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-900/80">
            <th className="px-6 py-4 font-medium">Tegishli Nimstansiyalar</th>
            <th className="px-6 py-4 text-center font-medium">Quvvati</th>
            <th className="px-6 py-4 text-center font-medium">Liniyalar</th>
            <th className="px-6 py-4 text-center font-medium">
              Transformatorlar
            </th>
            <th className="px-6 py-4 text-center font-medium w-[50px]"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => navigate(`${item.id}`)}
              /* 'group' klassi juda muhim - u ichidagi elementlarga hoverni uzatadi */
              className="group cursor-pointer transition-all duration-300 hover:bg-white/5 border-b border-slate-800/50"
            >
              <td className="px-6 py-4 text-white font-medium">
                <div className="text-sm tracking-wide">{item.name}</div>
                {/* <div className="text-[10px] text-slate-500 mt-0.5 italic lowercase">
                  Liniya uzunligi: {item.jami_uzunlik || 0} km
                </div> */}
              </td>
              <td className="px-6 py-4 text-sm font-normal text-blue-400 text-center">
                {item.quvvat} kVa
              </td>

              {/* LINIYALAR */}
              <td className="px-4 py-4 border-r border-slate-800/30">
                <div className="flex items-center justify-center">
                  <StatBlock
                    value={item.jami_uzunlik}
                    label="Jami"
                    color="text-white"
                    km
                  />
                  <StatBlock
                    value={item.uzunlik_tet}
                    label="TET"
                    color="text-blue-400"
                    border
                    km
                  />
                  <StatBlock
                    value={item.uzunlik_istemol}
                    label="Iste'mol"
                    color="text-amber-400"
                    km
                  />
                </div>
              </td>

              {/* TRANSFORMATORLAR */}
              <td className="px-4 py-4 border-r border-slate-800/30">
                <div className="flex items-center justify-center">
                  <StatBlock
                    value={item.trans_jami}
                    label="Jami"
                    color="text-white"
                  />
                  <StatBlock
                    value={item.trans_tet}
                    label="TET"
                    color="text-blue-400"
                    border
                  />
                  <StatBlock
                    value={item.trans_istemol}
                    label="Iste'mol"
                    color="text-amber-400"
                  />
                </div>
              </td>

              {/* TUGMA - group-hover orqali boshqariladi */}
              <td className="px-6 py-4 text-right">
                <div className="opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // <--- BU JUDA MUHIM: tr ning onClick-ini to'xtatadi
                    }}
                    className="text-[10px] text-blue-400 border border-blue-400/40 px-4 py-2 rounded-md bg-blue-500/5 hover:bg-blue-500/20 font-bold whitespace-nowrap uppercase tracking-tighter"
                  >
                    Batafsil →
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
