import { useParams } from 'react-router-dom';
import { database } from '../data';

export default function TransformatorList() {
  const { lId } = useParams();
  const data = database.transformator.filter(t => t.parentId === Number(lId));

  return (
    <>
      {data.map(item => (
        <tr key={item.id} className="border-b border-slate-800/50">
          <td className="px-6 py-4 font-bold text-white">{item.name}</td>
          <td className="px-6 py-4 text-center text-slate-400 text-xs italic">Transformator</td>
          <td className="px-6 py-4 text-right">
            <span className={`px-2 py-1 rounded text-[10px] font-bold ${item.holat === 'Ishchi' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {item.holat}
            </span>
          </td>
        </tr>
      ))}
    </>
  );
}