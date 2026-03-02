import { useNavigate } from 'react-router-dom';
import { database } from '../data';

export default function UstachilikList() {
  const navigate = useNavigate();
  return (
    <>
      {database.ustachilik.map(item => (
        <tr key={item.id} onClick={() => navigate(`${item.id}`)} className="cursor-pointer transition-all duration-200 
           hover:bg-slate-700/30 
           hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] 
           border-b border-slate-800/50">
          <td className="px-6 py-4 text-white">{item.name}</td>
          <td className="px-6 py-4 text-center text-slate-400 text-xs italic">{item.usta}</td>
          <td className="px-6 py-4 text-right text-blue-400 font-mono">{item.ns} NS</td>
        </tr>
      ))}
    </>
  );
}