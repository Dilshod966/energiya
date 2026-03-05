import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";
import { getUstachilik, getNimstansiyalar, getLiniyalar } from "../../services/api";

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const pathnames = pathname.split("/").filter((x) => x && x !== "dashboard");

  // ID-larni aniqlab olamiz
  const uId = pathnames[0];
  const nId = pathnames[1];
  const lId = pathnames[2];

  const [names, setNames] = useState({
    uName: "",
    nName: "",
    lName: ""
  });

  useEffect(() => {
    const fetchBreadcrumbNames = async () => {
      try {
        let currentNames = { uName: "", nName: "", lName: "" };

        // 1. Ustachilik nomini olish
        if (uId) {
          const res = await getUstachilik();
          const found = res.data.find(i => i.id === Number(uId));
          currentNames.uName = found ? found.name : "Yuklanmoqda...";
        }

        // 2. Nimstansiya nomini olish
        if (nId) {
          const res = await getNimstansiyalar(uId);
          const found = res.data.find(i => i.id === Number(nId));
          currentNames.nName = found ? found.name : "Yuklanmoqda...";
        }

        // 3. Liniya nomini olish
        if (lId) {
          const res = await getLiniyalar(nId);
          const found = res.data.find(i => i.id === Number(lId));
          currentNames.lName = found ? found.name : "Yuklanmoqda...";
        }

        setNames(currentNames);
      } catch (err) {
        console.error("Breadcrumb error:", err);
      }
    };

    fetchBreadcrumbNames();
  }, [uId, nId, lId]);

  return (
    <nav className="flex items-center gap-2 px-6 py-3 bg-slate-900/50 border-b border-slate-800 text-[10px] font-bold uppercase tracking-widest overflow-x-auto whitespace-nowrap">
      <Link to="/dashboard" className="flex items-center gap-1 text-slate-500 hover:text-white transition shrink-0">
        <Home size={12} /> BOSH
      </Link>

      {uId && (
        <>
          <ChevronRight size={12} className="text-slate-700 shrink-0" />
          <Link 
            to={`/dashboard/${uId}`} 
            className={`${!nId ? "text-blue-400" : "text-slate-500 hover:text-white"} transition shrink-0`}
          >
            {names.uName || "..."}
          </Link>
        </>
      )}

      {nId && (
        <>
          <ChevronRight size={12} className="text-slate-700 shrink-0" />
          <Link 
            to={`/dashboard/${uId}/${nId}`} 
            className={`${!lId ? "text-blue-400" : "text-slate-500 hover:text-white"} transition shrink-0`}
          >
            {names.nName || "..."}
          </Link>
        </>
      )}

      {lId && (
        <>
          <ChevronRight size={12} className="text-slate-700 shrink-0" />
          <span className="text-blue-400 shrink-0">{names.lName || "..."}</span>
        </>
      )}
    </nav>
  );
}