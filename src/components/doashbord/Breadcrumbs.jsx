import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { database } from '../data';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x && x !== 'dashboard');

  // ID larni ajratib olamiz
  const uId = pathnames[0]; // birinchi parametr
  const nId = pathnames[1]; // ikkinchi parametr
  const lId = pathnames[2]; // uchinchi parametr

  // Bazadan nomlarni qidiramiz
  const uName = database.ustachilik.find(u => u.id === Number(uId))?.name;
  const nName = database.nimstansiya.find(n => n.id === Number(nId))?.name;
  const lName = database.liniya.find(l => l.id === Number(lId))?.name;

  return (
    <nav className="flex items-center gap-2 px-6 py-3 bg-slate-900/50 border-b border-slate-800 text-[10px] font-bold uppercase tracking-widest overflow-x-auto whitespace-nowrap">
      <Link to="/dashboard" className="flex items-center gap-1 text-slate-500 hover:text-white transition shrink-0">
        <Home size={12} /> BOSH
      </Link>

      {uName && (
        <>
          <ChevronRight size={12} className="text-slate-700 shrink-0" />
          <Link to={`/dashboard/${uId}`} className={`${!nId ? "text-blue-400" : "text-slate-500 hover:text-white"} transition shrink-0`}>
            {uName}
          </Link>
        </>
      )}

      {nName && (
        <>
          <ChevronRight size={12} className="text-slate-700 shrink-0" />
          <Link to={`/dashboard/${uId}/${nId}`} className={`${!lId ? "text-blue-400" : "text-slate-500 hover:text-white"} transition shrink-0`}>
            {nName}
          </Link>
        </>
      )}

      {lName && (
        <>
          <ChevronRight size={12} className="text-slate-700 shrink-0" />
          <span className="text-blue-400 shrink-0">{lName}</span>
        </>
      )}
    </nav>
  );
};

export default Breadcrumbs;