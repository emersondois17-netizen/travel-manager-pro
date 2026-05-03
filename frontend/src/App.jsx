import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Clientes from './pages/Clientes';
import Hotelaria from './pages/Hotelaria'; // Criaremos este em seguida
import { LayoutDashboard, Users, PlaneTakeoff } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Barra Lateral (Sidebar) */}
        <nav className="w-64 bg-slate-900 text-white p-6">
          <div className="flex items-center gap-2 mb-10 text-blue-400 font-bold text-xl">
            <PlaneTakeoff size={28} />
            <span>TravelManager Pro</span>
          </div>
          
          <ul className="space-y-4">
            <li>
              <Link to="/" className="flex items-center gap-3 hover:text-blue-400 transition">
                <LayoutDashboard size={20} /> Dashboard
              </Link>
            </li>
            <li>
              <Link to="/clientes" className="flex items-center gap-3 hover:text-blue-400 transition">
                <Users size={20} /> Passageiros
              </Link>
            </li>
          </ul>
        </nav>

        {/* Conteúdo Principal */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Hotelaria />} />
            <Route path="/clientes" element={<Clientes />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;