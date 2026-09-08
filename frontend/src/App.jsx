import React, { useState, useEffect } from 'react';
import FarmerDashboard from './components/FarmerDashboard';
import EnvironmentalDashboard from './components/EnvironmentalDashboard';
import ResultsDashboard from './components/ResultsDashboard';
import AuthModal from './components/AuthModal';
import AlertsPanel from './components/AlertsPanel';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'env', 'analytics'
  const [farmer, setFarmer] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState(1);

  useEffect(() => {
    // Load stored farmer token if present
    const name = localStorage.getItem('farmer_name');
    const id = localStorage.getItem('farmer_id');
    if (name && id) {
      setFarmer({ name, farmer_id: id });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('farmer_token');
    localStorage.removeItem('farmer_name');
    localStorage.removeItem('farmer_id');
    setFarmer(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Header Navbar */}
      <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40 px-4 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-2xl shadow-lg shadow-emerald-900/40">
              🌾
            </div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent tracking-tight">
                Chennai AgroSmart
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                AI Advisory & Pilot Telemetry Engine
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🗺️ GIS & Advisory
            </button>
            <button
              onClick={() => setActiveTab('env')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'env'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🌤️ Environmental Telemetry
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📊 Pilot Results & Impact
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-amber-400 transition relative"
              title="Active Alerts"
            >
              🔔
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {farmer ? (
              <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                <span className="text-emerald-400 font-bold">👨‍🌾 {farmer.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-400 ml-2 font-bold"
                  title="Logout"
                >
                  🚪
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-900/30"
              >
                🔑 Farmer Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-around mt-3 pt-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-1 px-2 rounded-md ${activeTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            🗺️ GIS Advisory
          </button>
          <button
            onClick={() => setActiveTab('env')}
            className={`py-1 px-2 rounded-md ${activeTab === 'env' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            🌤️ Environment
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-1 px-2 rounded-md ${activeTab === 'analytics' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
          >
            📊 Analytics
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {activeTab === 'dashboard' && (
          <FarmerDashboard farmerId={farmer ? farmer.farmer_id : 1} />
        )}
        {activeTab === 'env' && (
          <EnvironmentalDashboard fieldId={selectedFieldId} />
        )}
        {activeTab === 'analytics' && (
          <ResultsDashboard />
        )}
      </main>

      {/* Slide-over Alert Drawer */}
      {showAlerts && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end p-4">
          <AlertsPanel fieldId={selectedFieldId} onClose={() => setShowAlerts(false)} />
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(userData) => setFarmer({ name: userData.name, farmer_id: userData.farmer_id })}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        Chennai AgroSmart © 2026 • AI-Driven Precision Agriculture • Chennai, Tamil Nadu
      </footer>
    </div>
  );
}

