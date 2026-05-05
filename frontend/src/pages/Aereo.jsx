import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Sparkles, UploadCloud, Ticket, Search, Trash2, Edit } from 'lucide-react';

const Aereo = () => {
    const [voos, setVoos] = useState([]);
    const [busca, setBusca] = useState('');
    const [cpf, setCpf] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchVoos = async () => {
        try {
            const res = await api.get('/voos');
            setVoos(res.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchVoos(); }, []);

    const handleProcessar = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append('cpfCliente', cpf);
        formData.append('file', file);
        try {
            await api.post('/voos/processar', formData);
            setFile(null); setCpf(''); fetchVoos();
        } catch (e) { alert("Erro no processamento."); }
        finally { setLoading(false); }
    };

    const handleExcluir = async (id) => {
        if (!window.confirm("Excluir este bilhete permanentemente?")) return;
        await api.delete(`/voos/${id}`);
        fetchVoos();
    };

    const filtrados = voos.filter(v => 
        v.passageiro?.toLowerCase().includes(busca.toLowerCase()) || 
        v.localizador?.toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Ticket className="text-blue-600" /> Gestão de Passagens
            </h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input className="border p-3 rounded-lg bg-slate-50" placeholder="CPF do Solicitante" value={cpf} onChange={e => setCpf(e.target.value)} />
                    <div className="border-2 border-dashed border-blue-100 p-3 rounded-lg text-center relative cursor-pointer hover:bg-blue-50">
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFile(e.target.files[0])} />
                        <p className="text-sm text-slate-500">{file ? file.name : 'Selecionar PDF do Bilhete'}</p>
                    </div>
                </div>
                <button onClick={handleProcessar} disabled={loading || !file || !cpf} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition">
                    {loading ? 'Extraindo dados...' : 'Processar Bilhete'}
                </button>
            </div>

            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input className="w-full pl-10 pr-4 py-3 border rounded-xl" placeholder="Buscar por nome ou localizador..." value={busca} onChange={e => setBusca(e.target.value)} />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-black">
                        <tr>
                            <th className="p-4">Passageiro</th>
                            <th className="p-4">Voo / Rota</th>
                            <th className="p-4">Localizador</th>
                            <th className="p-4 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {filtrados.map(v => (
                            <tr key={v._id} className="border-t hover:bg-slate-50">
                                <td className="p-4 font-bold text-slate-700">{v.passageiro}</td>
                                <td className="p-4">
                                    <span className="font-bold">{v.numeroVoo || '---'}</span>
                                    <p className="text-xs text-blue-600 font-bold">{v.origem} → {v.destino}</p>
                                </td>
                                <td className="p-4 font-mono font-bold text-slate-500">{v.localizador}</td>
                                <td className="p-4 flex justify-center gap-3">
                                    <button className="text-blue-400 hover:text-blue-600"><Edit size={16}/></button>
                                    <button onClick={() => handleExcluir(v._id)} className="text-rose-300 hover:text-rose-600 transition"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Aereo;