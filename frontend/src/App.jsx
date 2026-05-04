import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, PlaneTakeoff, BedDouble, Ticket } from 'lucide-react';
import Clientes from './pages/Clientes';
import Passageiros from './pages/Passageiros';
import Hotelaria from './pages/Hotelaria';
import Aereo from './pages/Aereo'; // Importamos a nova página

const SidebarLink = ({ to, icon: Icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 p-3 rounded-lg font-medium transition-colors mb-2 ${
        isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={20} />
      {children}
    </Link>
  );
};

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-slate-50 font-sans">
        
        <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10">
          <div className="p-6 flex items-center gap-3 mb-6 border-b border-slate-800">
            <PlaneTakeoff className="text-blue-400" size={32} />
            <div>
              <h1 className="text-xl font-bold tracking-tight">TravelManager</h1>
              <p className="text-blue-400 text-xs font-bold tracking-widest uppercase">Pro</p>
            </div>
          </div>
          
          <nav className="flex-1 px-4">
            <SidebarLink to="/" icon={LayoutDashboard}>Dashboard</SidebarLink>
            <SidebarLink to="/clientes" icon={Users}>Clientes (CRM)</SidebarLink>
            <SidebarLink to="/passageiros" icon={PlaneTakeoff}>Em Viagem</SidebarLink>
            <SidebarLink to="/aereo" icon={Ticket}>Aéreo</SidebarLink> {/* Novo Link */}
            <SidebarLink to="/hotelaria" icon={BedDouble}>Hotelaria</SidebarLink>
          </nav>
          
          <div className="p-4 border-t border-slate-800 text-center text-xs text-slate-500">
            v1.0.0 &copy; 2026 E.S
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<div className="p-8 text-2xl font-bold text-slate-400">Dashboard em construção...</div>} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/passageiros" element={<Passageiros />} />
            <Route path="/aereo" element={<Aereo />} /> {/* Nova Rota */}
            <Route path="/hotelaria" element={<Hotelaria />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;