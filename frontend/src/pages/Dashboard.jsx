import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';
import { Users, Plane, Hotel, TrendingUp, Award } from 'lucide-react';

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a'];

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await api.get('/dashboard/stats');
                setData(res.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        loadStats();
    }, []);

    if (loading || !data) return <div className="p-10 text-center animate-pulse">Carregando inteligência de dados...</div>;

    return (
        <div className="p-8 bg-slate-50 min-h-screen">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-slate-800">TravelManager Insights</h1>
                <p className="text-slate-500 font-medium text-sm">Performance analítica da sua agência em tempo real.</p>
            </header>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Clientes Ativos', val: data.cards.totalClientes, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
                    { label: 'Voos Emitidos', val: data.cards.totalVoos, icon: Plane, color: 'text-purple-600', bg: 'bg-purple-100' },
                    { label: 'Reservas Hotel', val: data.cards.totalHoteis, icon: Hotel, color: 'text-pink-600', bg: 'bg-pink-100' },
                    { label: 'Taxa Crescimento', val: '+12%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                ].map((card, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className={`p-4 rounded-xl ${card.bg} ${card.color}`}><card.icon size={24} /></div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.label}</p>
                            <h3 className="text-2xl font-black text-slate-800">{card.val}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfico de Evolução */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-500"/> Evolução de Vendas (Mensal)
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer>
                            <LineChart data={data.graficoLinha}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                <Line type="monotone" dataKey="vendas" stroke="#2563eb" strokeWidth={4} dot={{ r: 6, fill: '#2563eb' }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Market Share de Companhias Aéreas */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                        <Award size={20} className="text-purple-500"/> Market Share: Companhias Aéreas
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie 
                                    data={data.graficoPizza} 
                                    innerRadius={70} 
                                    outerRadius={100} 
                                    paddingAngle={5} 
                                    dataKey="value"
                                >
                                    {data.graficoPizza.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;