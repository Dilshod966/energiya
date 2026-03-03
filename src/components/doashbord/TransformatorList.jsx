import { useParams } from "react-router-dom";
import { database } from "../data";

export default function TransformatorList() {
  const { lId } = useParams();
  const data = database.transformator.filter((t) => t.parentId === Number(lId));

  return (
    <>
      <thead>
        <tr className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-900/50">
          <th className="px-6 py-4 font-medium">Nomi / Ma'lumot</th>
          <th className="px-6 py-4 text-center font-medium">Turi</th>
          <th className="px-6 py-4 text-right font-medium">Hajm / Holat</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800">
      {data.map((item) => (
        <tr
          key={item.id}
          className="border-b cursor-pointer transition-all duration-200 
           hover:bg-slate-700/30 
           hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] 
           border-b border-slate-800/50"
        >
          <td className="px-6 py-4 text-white">{item.name}</td>
          <td className="px-6 py-4 text-center text-slate-400 text-xs italic">
            Transformator
          </td>
          <td className="px-6 py-4 text-right">
            <span
              className={`px-2 py-1 rounded text-[10px] font-bold ${item.holat === "Ishchi" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
            >
              {item.holat}
            </span>
          </td>
        </tr>
      ))}
      </tbody>
    </>
  );
}
