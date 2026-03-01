import { useParams, useNavigate } from 'react-router-dom';
import { database } from '../data';

export default function LiniyaList() {
  const { uId, nId } = useParams();
  const navigate = useNavigate();
  const data = database.liniya.filter(l => l.parentId === Number(nId));

  return (
    <>
      {data.map(item => (
        <tr key={item.id} onClick={() => navigate(`${item.id}`)} className="cursor-pointer hover:bg-slate-800/50 transition border-b border-slate-800/50">
          <td className="px-6 py-4 font-bold text-white">{item.name}</td>
          <td className="px-6 py-4 text-center text-slate-400 text-xs italic">Havo Tarmog'i</td>
          <td className="px-6 py-4 text-right text-amber-400 font-mono">{item.uzunlik}</td>
        </tr>
      ))}
    </>
  );
}