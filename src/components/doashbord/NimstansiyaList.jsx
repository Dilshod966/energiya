import { useParams, useNavigate } from 'react-router-dom';
import { database } from '../data';

export default function NimstansiyaList() {
  const { uId } = useParams();
  const navigate = useNavigate();
  const data = database.nimstansiya.filter(n => n.parentId === Number(uId));

  return (
    <>
      {data.map(item => (
        <tr key={item.id} onClick={() => navigate(`${item.id}`)} className="cursor-pointer hover:bg-slate-800/50 transition border-b border-slate-800/50">
          <td className="px-6 py-4 font-bold text-white">{item.name}</td>
          <td className="px-6 py-4 text-center text-slate-400 text-xs italic">Nimstansiya</td>
          <td className="px-6 py-4 text-right text-emerald-400 font-mono">{item.quvvat}</td>
        </tr>
      ))}
    </>
  );
}