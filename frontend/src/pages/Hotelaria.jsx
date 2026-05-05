import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { UploadCloud, Sparkles, BedDouble, Search, Trash2, Edit } from 'lucide-react';

const formatarData = (dataIso) => {
    if (!dataIso) return '--/--/----';
    const [ano, mes, dia] = dataIso.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
};

const Hotelaria = () => {
    const [cpf, setCpf] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [hoteis, setHoteis] = useState([]);
    const [busca, setBusca] = useState('');
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [hotelEditando, setHotelEditando] = useState(null);

    const fetchHoteis = async () => {
        try {
            const response = await api.get('/hoteis');
            setHoteis(response.data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => { fetchHoteis(); }, []);

    const handleProcess = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append('cpfCliente', cpf);
        formData.append('file', file);
        try {
            await api.post('/hoteis/processar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Voucher processado!');
            setFile(null); setCpf(''); fetchHoteis();
        } catch (error) { alert('Erro na extração.'); } finally { setLoading(false); }
    };

    const handleExcluir = async (id) => {
        if (!window.confirm("Deseja excluir esta reserva de hotel?")) return;
        try {
            await api.delete(`/hoteis/${id}`);
            fetchHoteis();
        } catch (e) { alert("Erro ao excluir."); }
    };

    const handleSalvarEdicao = async () => {
        try {
            await api.put(`/hoteis/${hotelEditando._id}`, hotelEditando);
            alert("Reserva atualizada!");
            setIsEditModalOpen(false);
            fetchHoteis();
        } catch (e) { alert("Erro ao atualizar."); }
    };

    const hoteisFiltrados = hoteis.filter(h => 
        h.hospede?.toLowerCase().includes(busca.toLowerCase()) ||
        h.hotel?.toLowerCase().includes(busca.toLowerCase()) ||
        h.localizador?.toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <BedDouble className="text-blue-600" /> Gestão de Hotelaria
            </h1>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                <h2 className="text-lg font-semibold text-slate-700 mb-4">Importação de Voucher</h2>
                <input className="w-full border p-3 rounded-lg mb-4 bg-slate-50" placeholder="CPF do Passageiro" value={cpf} onChange={(e) => setCpf(e.target.value)} />
                <div className="border-2 border-dashed border-blue-200 p-8 rounded-xl text-center relative mb-4 cursor-pointer">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFile(e.target.files[0])} />
                    <UploadCloud className="mx-auto text-blue-400 mb-2" size={40} />
                    <p className="text-slate-500">{file ? file.name : 'Selecionar PDF'}</p>
                </div>
                <button onClick={handleProcess} disabled={loading || !file || !cpf} className="w-full bg-blue-700 text-white p-3 rounded-lg font-bold">
                    {loading ? 'Processando...' : 'Processar Documento'}
                </button>
            </div>

            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" placeholder="Buscar..." className="w-full pl-10 pr-4 py-3 border rounded-xl" value={busca} onChange={(e) => setBusca(e.target.value)} />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
                        <tr>
                            <th className="p-4">Hóspede</th>
                            <th className="p-4">Hotel</th>
                            <th className="p-4">Localizador</th>
                            <th className="p-4 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {hoteisFiltrados.map((h) => (
                            <tr key={h._id} className="border-t hover:bg-slate-50">
                                <td className="p-4 font-bold">{h.hospede}</td>
                                <td className="p-4">{h.hotel}</td>
                                <td className="p-4 font-mono text-xs">{h.localizador}</td>
                                <td className="p-4 flex justify-center gap-3">
                                    <button onClick={() => { setHotelEditando({...h}); setIsEditModalOpen(true); }} className="text-blue-500 hover:text-blue-700"><Edit size={18}/></button>
                                    <button onClick={() => handleExcluir(h._id)} className="text-rose-500 hover:text-rose-700"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Editar Hospedagem</h2>
                        <div className="space-y-4">
                            <input className="w-full border p-2 rounded" placeholder="Hóspede" value={hotelEditando.hospede} onChange={(e) => setHotelEditando({...hotelEditando, hospede: e.target.value})} />
                            <input className="w-full border p-2 rounded" placeholder="Hotel" value={hotelEditando.hotel} onChange={(e) => setHotelEditando({...hotelEditando, hotel: e.target.value})} />
                            <input className="w-full border p-2 rounded" placeholder="Localizador" value={hotelEditando.localizador} onChange={(e) => setHotelEditando({...hotelEditando, localizador: e.target.value.toUpperCase()})} />
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button onClick={handleSalvarEdicao} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold">Salvar</button>
                            <button onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-2 rounded font-bold">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Hotelaria;