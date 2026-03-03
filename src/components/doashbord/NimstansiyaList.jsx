import { useParams, useNavigate } from "react-router-dom";
import { database } from "../data";

export default function NimstansiyaList() {
  const { uId } = useParams();
  const navigate = useNavigate();
  const data = database.nimstansiya.filter((n) => n.parentId === Number(uId));

  return (
    <>
      <thead>
        <tr className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-900/50">
          <th className="px-6 py-4 font-medium">Tegishli Transformator</th>
          <th className="px-6 py-4 text-center font-medium">novi quysaq buladi</th>
          <th className="px-6 py-4 text-right font-medium">Liniyalar soni</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800">
      {data.map((item) => (
        <tr
          key={item.id}
          onClick={() => navigate(`${item.id}`)}
          className="cursor-pointer transition-all duration-200 
           hover:bg-slate-700/30 
           hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] 
           border-b border-slate-800/50"
        >
          <td className="px-6 py-4 text-white">{item.name}</td>
          <td className="px-6 py-4 text-center text-slate-400 text-xs italic">
            Nimstansiya
          </td>
          <td className="px-6 py-4 text-right text-emerald-400 font-mono">
            {item.quvvat}
          </td>
        </tr>
      ))}
      </tbody>
    </>
  );
}
