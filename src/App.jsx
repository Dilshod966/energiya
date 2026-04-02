import { StationProvider, useStation } from "./context/StationContext";
import Topbar from "./components/layout/Topbar";
import MapView from "./components/map/MapView";
import Sidebar from "./components/sidebar/Sidebar";
import AddStationForm from "./components/admin/AddStationForm";
import Dashboard from "./components/doashbord/Dashboard";
import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";


// ─── Global styles (Leaflet overrides + scrollbar) ────────────────────────────
const DARK_STYLES = `
  .leaflet-container { background: #070d18 !important; }
  .leaflet-control-zoom {
    border: 1px solid rgba(255,255,255,0.1) !important;
    background: #0a0f1a !important; border-radius: 10px !important; overflow: hidden;
  }
  .leaflet-control-zoom a {
    background: #0a0f1a !important; color: #94a3b8 !important;
    border-color: rgba(255,255,255,0.1) !important;
  }
  .leaflet-control-zoom a:hover { background: #0f1829 !important; color: white !important; }
`;
const LIGHT_STYLES = `
  .leaflet-container { background: #e8f0f8 !important; }
  .leaflet-control-zoom {
    border: 1px solid rgba(15,23,42,0.12) !important;
    background: #ffffff !important; border-radius: 10px !important; overflow: hidden;
  }
  .leaflet-control-zoom a {
    background: #ffffff !important; color: #475569 !important;
    border-color: rgba(15,23,42,0.1) !important;
  }
  .leaflet-control-zoom a:hover { background: #f1f5f9 !important; color: #0f172a !important; }
`;
const COMMON_STYLES = `
  .leaflet-popup-content-wrapper {
    background: transparent !important; border: none !important;
    box-shadow: none !important; padding: 0 !important;
  }
  .leaflet-popup-content { margin: 0 !important; }
  .leaflet-popup-tip-container { display: none !important; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,0.5); }
`;

// ─── Inner layout — reads from StationContext ─────────────────────────────────
function AppLayout() {
  const { view, sidebarOpen, setusernomi, theme } = useStation();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("app_theme", theme);
  }, [theme]);

  useEffect(() => {
    const checkAuth = () => {
      const data = localStorage.getItem("admin_auth");

      if (data) {
        const auth = JSON.parse(data);
        const now = new Date().getTime();

        // Vaqtni tekshiramiz
        if (now > auth) {
          // VAQT TUGAGAN: Tozalash va Logout
          localStorage.removeItem("admin_auth");
          setusernomi("User");
          // Agar foydalanuvchi admin sahifasida bo'lsa, uni bosh sahifaga otib yuboramiz
          if (window.location.pathname.startsWith("/admin")) {
            window.location.href = "/";
          }
        } else {
          // VAQT BOR: Login holatini saqlab qolamiz
          setusernomi("Admin");
        }
      }
    };

    checkAuth();

    // Foydalanuvchi saytda turganda ham har 30 sekundda tekshirib turish
    const timer = setInterval(checkAuth, 30000);
    return () => clearInterval(timer);
  }, [setusernomi]);

  return (
    <div
      className="h-screen flex flex-col bg-[#070d18] text-white overflow-hidden transition-colors duration-300"
      style={{ fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}
    >
      <style>{COMMON_STYLES}{theme === "dark" ? DARK_STYLES : LIGHT_STYLES}</style>

      {/* ① Top navigation bar */}
      <Topbar />

      <div className="flex-1 flex overflow-hidden relative">
        <Routes>
          {/* Asosiy sahifa (Dashboard) */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard/*" element={<Dashboard />} />

          {/* Xarita sahifasi */}
          <Route
            path="/map"
            element={
              <>
                <MapView />
                {/* Sidebar faqat xarita sahifasida va sidebarOpen bo'lsa chiqadi */}
                {sidebarOpen && <Sidebar />}
              </>
            }
          />

          {/* Admin / Stansiya qo'shish sahifasi */}
          <Route
            path="/admin"
            element={<AddStationForm />}
          />

          {/* Agar foydalanuvchi noto'g'ri manzilga kirsa, bosh sahifaga yuboramiz */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}

// ─── Root export — wraps everything with the global Context Provider ───────────
export default function App() {
  return (
    <StationProvider>
      <AppLayout />
    </StationProvider>
  );
}
