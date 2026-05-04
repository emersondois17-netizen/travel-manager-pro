import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Sparkles, UploadCloud, Ticket, Plane } from 'lucide-react';

const formatarDataHora = (dataIso) => {
    if (!dataIso) return '--/--/---- --:--';
    const data = new Date(dataIso);
    return data.toLocaleString('pt-BR', { 
        day: '2-digit', month: '2-digit', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
    });
};

const Aereo = () => {
    const [cpf, setCpf] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [voos, setVoos] = useState([]);

    const fetchVoos = async () => {
        try {
            const response = await api.get('/voos');
            setVoos(response.data);
        } catch (error) {
            console.error('Erro ao buscar voos', error);
        }
    };

    useEffect(() => {
        fetchVoos();
    }, []);

    const handleProcess = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append('cpfCliente', cpf);
        formData.append('file', file);

        try {
            await api.post('/voos/processar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Bilhete aéreo processado com sucesso!');
            setFile(null);
            setCpf('');
            fetchVoos();
        } catch (error) {
            alert(error.response?.data?.error || 'Erro na extração do bilhete.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Ticket className="text-blue-600" /> Gestão de Passagens Aéreas
            </h1>
            
            {/* Área de Upload */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <Plane size={20}/> Importação de Bilhete
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-slate-600 mb-1">CPF do Solicitante/Pagante</label>
                        <input 
                            className="w-full border p-3 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500"
                            placeholder="Ex: 00011122233"
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value)}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-600 mb-1">Arquivo (PDF do Bilhete)</label>
                        <div className="border-2 border-dashed border-blue-200 p-3 rounded-xl text-center hover:bg-blue-50 transition cursor-pointer relative">
                            <input 
                                type="file" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => setFile(e.target.files[0])}
                                accept="application/pdf"
                            />
                            <div className="flex items-center justify-center gap-2 text-slate-600 font-medium">
                                <UploadCloud className="text-blue-400" size={24} />
                                {file ? `✅ ${file.name}` : 'Arraste ou clique para selecionar'}
                            </div>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleProcess}
                    disabled={loading || !file || !cpf}
                    className={`w-full mt-4 text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2 transition ${
                        loading || !file || !cpf ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    {loading ? 'Extraindo dados com IA...' : <><Sparkles size={20}/> Processar Bilhete</>}
                </button>
            </div>

            {/* Tabela de Resultados */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-700">Últimos Voos Processados</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100 text-slate-600 text-sm">
                                <th className="p-4 border-b font-medium">Passageiro</th>
                                <th className="p-4 border-b font-medium">Cia Aérea & Rota</th>
                                <th className="p-4 border-b font-medium">Localizador</th>
                                <th className="p-4 border-b font-medium">Embarque</th>
                            </tr>
                        </thead>
                        <tbody>
                            {voos.map((voo) => (
                                <tr key={voo._id} className="hover:bg-slate-50 border-b text-sm">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{voo.passageiro}</div>
                                        <div className="text-xs text-slate-500">Pagante: {voo.cliente?.nome || 'N/A'}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-bold text-slate-700">{voo.ciaAerea}</span> <br/>
                                        <span className="text-xs font-semibold text-blue-600">{voo.origem} ➔ {voo.destino}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-slate-200 text-slate-800 py-1 px-2 rounded font-mono text-xs font-bold">{voo.localizador}</span>
                                    </td>
                                    <td className="p-4 text-slate-700 font-medium">
                                        {formatarDataHora(voo.dataEmbarque)}
                                    </td>
                                </tr>
                            ))}
                            {voos.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-500">Nenhum bilhete processado ainda.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Aereo;