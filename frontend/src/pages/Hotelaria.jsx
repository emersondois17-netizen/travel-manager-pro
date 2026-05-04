import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Sparkles, UploadCloud, BedDouble } from 'lucide-react';

const Hotelaria = () => {
    const [cpf, setCpf] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [reservas, setReservas] = useState([]);

    // Helper para corrigir o bug de fuso horário do JavaScript
const formatarData = (dataIso) => {
    if (!dataIso) return '--/--/----';
    // Pega apenas a parte da data (YYYY-MM-DD) ignorando as horas e o Timezone
    const [ano, mes, dia] = dataIso.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
};

    // Função para buscar as reservas no banco de dados
    const fetchReservas = async () => {
        try {
            const response = await api.get('/hoteis');
            setReservas(response.data);
        } catch (error) {
            console.error('Erro ao buscar reservas', error);
        }
    };

    // Executa a busca assim que a página carrega
    useEffect(() => {
        fetchReservas();
    }, []);

    const handleProcess = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append('cpfCliente', cpf);
        formData.append('file', file);

        try {
            await api.post('/hoteis/processar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Voucher processado com sucesso!');
            setFile(null);
            setCpf('');
            fetchReservas(); // Atualiza a tabela com o novo dado extraído
        } catch (error) {
            alert(error.response?.data?.error || 'Erro na extração.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <BedDouble /> Gestão de Hotelaria
            </h1>
            
            {/* Área de Upload */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 max-w-3xl mb-8">
                <h2 className="text-lg font-semibold text-slate-700 mb-4">Importação de Voucher</h2>
                <input 
                    className="w-full border p-3 rounded-lg mb-4 bg-slate-50"
                    placeholder="CPF do Passageiro (Ex: 00011122233)"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                />

                <div className="border-2 border-dashed border-blue-200 p-8 rounded-xl text-center mb-4 hover:bg-blue-50 transition cursor-pointer relative">
                    <input 
                        type="file" 
                        id="pdf-upload" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                    <UploadCloud className="mx-auto text-blue-400 mb-2" size={40} />
                    <span className="text-slate-600 font-medium block">
                        {file ? `✅ Arquivo: ${file.name}` : 'Arraste ou clique para selecionar o PDF'}
                    </span>
                </div>

                <button 
                    onClick={handleProcess}
                    disabled={loading || !file || !cpf}
                    className={`w-full text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2 transition ${
                        loading || !file || !cpf ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    {loading ? 'Extraindo dados com Gemini...' : <><Sparkles size={20}/> Processar Documento</>}
                </button>
            </div>

            {/* Tabela de Resultados */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-5xl">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-700">Últimas Reservas Processadas</h2>
                </div>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-100 text-slate-600 text-sm">
                            <th className="p-4 border-b font-medium">Hóspede</th>
                            <th className="p-4 border-b font-medium">Solicitante</th>
                            <th className="p-4 border-b font-medium">Hotel</th>
                            <th className="p-4 border-b font-medium">Localizador</th>
                            <th className="p-4 border-b font-medium">Check-in / Out</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservas.map((reserva) => (
                            <tr key={reserva._id} className="hover:bg-slate-50 border-b text-sm">
                                <td className="p-4 font-bold text-slate-800">{reserva.hospede}</td>
                                <td className="p-4 text-slate-500 text-xs">{reserva.cliente?.nome || 'N/A'}</td>
                                <td className="p-4 text-slate-600">
                                    <span className="font-medium text-slate-800">{reserva.hotel}</span> <br/>
                                    <span className="text-xs text-slate-400">{reserva.cidade}</span>
                                </td>
                                <td className="p-4">
                                    <span className="bg-blue-100 text-blue-700 py-1 px-2 rounded font-mono text-xs font-bold">{reserva.localizador}</span>
                                </td>
                                <td className="p-4 text-slate-600 text-xs">
                                    <span className="text-emerald-600 font-medium">In:</span> {formatarData(reserva.checkIn)} <br/>
                                    <span className="text-rose-600 font-medium">Out:</span> {formatarData(reserva.checkOut)}
                                </td>
                            </tr>
                        ))}
                        {reservas.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-slate-500">Nenhuma reserva processada ainda.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Hotelaria;