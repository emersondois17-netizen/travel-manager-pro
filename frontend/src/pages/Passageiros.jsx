import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plane, BedDouble, MapPin, CalendarDays, CheckCircle2, RefreshCw, MessageSquare, Trash2 } from 'lucide-react';

const formatarData = (dataIso) => {
    if (!dataIso) return '--/--/----';
    const [ano, mes, dia] = dataIso.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
};

const Passageiros = () => {
    const [hoteis, setHoteis] = useState([]);
    const [voos, setVoos] = useState([]);
    const [abaAtiva, setAbaAtiva] = useState('aereo');
    const [loading, setLoading] = useState(true);
    const [sincronizandoId, setSincronizandoId] = useState(null);

    const fetchTudo = async () => {
        try {
            const [resH, resV] = await Promise.all([api.get('/hoteis'), api.get('/voos')]);
            const agora = new Date();
            const vinteQuatroHorasAtras = new Date(agora.getTime() - (24 * 60 * 60 * 1000));

            setHoteis(resH.data.filter(h => new Date(h.checkOut) >= vinteQuatroHorasAtras));
            setVoos(resV.data.filter(v => !(v.statusMonitoramento === 'Pousado' && new Date(v.dataEmbarque) < vinteQuatroHorasAtras)));
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetchTudo(); }, []);

    // FUNÇÃO CORRIGIDA PARA O WHATSAPP
    const handleEnviarResumo = (op) => {
        const isVoo = !!op.origem; // Identifica se é voo pelos campos existentes
        const nomeParaMensagem = op.passageiro || op.hospede || "Passageiro";
        
        let mensagem = `*Olá, ${nomeParaMensagem}!* %0A%0A`;
        
        if (isVoo) {
            mensagem += `✈️ *RESUMO DO SEU VOO* %0A`;
            mensagem += `📍 Trecho: ${op.origem} ➔ ${op.destino} %0A`;
            mensagem += `🏢 Cia: ${op.ciaAerea} ${op.numeroVoo || ''} %0A`;
            mensagem += `📅 Data: ${new Date(op.dataEmbarque).toLocaleString('pt-BR')} %0A`;
            mensagem += `🔑 Localizador: *${op.localizador}* %0A%0A`;
        } else {
            mensagem += `🏨 *RESUMO DA SUA HOSPEDAGEM* %0A`;
            mensagem += `📍 Hotel: ${op.hotel} %0A`;
            mensagem += `📅 Check-in: ${formatarData(op.checkIn)} %0A`;
            mensagem += `📅 Check-out: ${formatarData(op.checkOut)} %0A`;
            mensagem += `🔑 Localizador: *${op.localizador}* %0A%0A`;
        }

        mensagem += `Boa viagem! Desejamos uma excelente experiência. %0A_TravelManager Pro_`;
        
        window.open(`https://wa.me/?text=${mensagem}`, '_blank');
    };

    const handleSincronizar = async (id) => {
        setSincronizandoId(id);
        try {
            await api.get(`/voos/${id}/sincronizar`);
            fetchTudo();
        } catch (e) { 
            alert(e.response?.data?.error || 'Erro ao sincronizar.'); 
        } finally { 
            setSincronizandoId(null); 
        }
    };

    const handleExcluirVoo = async (id) => {
        if (!window.confirm("Remover este voo do painel?")) return;
        await api.delete(`/voos/${id}`);
        fetchTudo();
    };

    const getStatusStyle = (status) => {
        const s = status?.toUpperCase();
        if (s === 'CANCELADO') return 'bg-rose-100 text-rose-700 border-rose-200';
        if (s === 'EM VOO' || s === 'ACTIVE') return 'bg-blue-100 text-blue-700 border-blue-200 animate-pulse';
        if (s === 'POUSADO' || s === 'LANDED') return 'bg-slate-100 text-slate-600 border-slate-200';
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'; // Default para Confirmado/Scheduled
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Operações Ativas</h1>
                <p className="text-slate-500 font-medium">Controle de embarques e monitoramento.</p>
            </header>

            <div className="flex gap-4 mb-8 border-b">
                <button onClick={() => setAbaAtiva('aereo')} className={`pb-4 px-6 font-bold transition ${abaAtiva === 'aereo' ? 'border-b-4 border-blue-600 text-blue-600' : 'text-slate-400'}`}>
                    <Plane className="inline mr-2" size={20} /> Aéreo ({voos.length})
                </button>
                <button onClick={() => setAbaAtiva('hotel')} className={`pb-4 px-6 font-bold transition ${abaAtiva === 'hotel' ? 'border-b-4 border-indigo-600 text-indigo-600' : 'text-slate-400'}`}>
                    <BedDouble className="inline mr-2" size={20} /> Hotelaria ({hoteis.length})
                </button>
            </div>

            {loading ? <div className="text-center p-20 text-slate-400">Carregando painel...</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {abaAtiva === 'aereo' ? voos.map(v => (
                        <div key={v._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black bg-blue-600 px-2 py-0.5 rounded uppercase">{v.ciaAerea}</span>
                                    <span className="text-[10px] font-mono text-slate-400 mt-1">{v.numeroVoo || 'VOO'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-blue-400">{v.localizador}</span>
                                    <button onClick={() => handleExcluirVoo(v._id)} className="text-slate-500 hover:text-rose-400 transition"><Trash2 size={14}/></button>
                                </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="text-center">
                                        <h4 className="text-2xl font-black text-slate-800">{v.origem}</h4>
                                        <p className="text-[10px] text-slate-400 uppercase">Origem</p>
                                    </div>
                                    <div className="flex-1 border-t-2 border-dashed border-slate-100 mx-4 relative">
                                        <Plane className="text-blue-500 absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-1" size={24} />
                                    </div>
                                    <div className="text-center">
                                        <h4 className="text-2xl font-black text-slate-800">{v.destino}</h4>
                                        <p className="text-[10px] text-slate-400 uppercase">Destino</p>
                                    </div>
                                </div>
                                <div className="space-y-3 mb-6 flex-1">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium"><CalendarDays size={16} className="text-blue-500" /> {new Date(v.dataEmbarque).toLocaleString('pt-BR')}</div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800"><CheckCircle2 size={16} className="text-emerald-500" /> {v.passageiro}</div>
                                </div>
                                <div className={`mb-4 text-center py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(v.statusMonitoramento)}`}>
                                    STATUS: {v.statusMonitoramento || 'CONFIRMADO'}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => handleSincronizar(v._id)} disabled={sincronizandoId === v._id} className="flex items-center justify-center gap-2 bg-slate-100 text-slate-600 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-200">
                                        <RefreshCw size={14} className={sincronizandoId === v._id ? 'animate-spin' : ''} /> Status
                                    </button>
                                    <button onClick={() => handleEnviarResumo(v)} className="flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-200 transition">
                                        <MessageSquare size={14} /> Resumo
                                    </button>
                                </div>
                            </div>
                        </div>
                    )) : hoteis.map(h => (
                        <div key={h._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 bg-indigo-900 text-white flex justify-between items-center">
                                <span className="text-xs font-bold">{h.hotel}</span>
                                <span className="text-xs font-mono text-indigo-300 uppercase">{h.localizador}</span>
                            </div>
                            <div className="p-5">
                                <div className="flex items-start gap-3 mb-6">
                                    <div className="bg-indigo-50 p-2 rounded-lg"><MapPin className="text-indigo-600" size={20} /></div>
                                    <div><p className="font-bold text-slate-800 leading-tight">{h.hotel}</p><p className="text-xs text-slate-500 font-medium">{h.cidade}</p></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6">
                                    <div><p className="text-[10px] text-slate-400 uppercase font-black">In</p><p className="text-sm font-bold text-slate-700">{formatarData(h.checkIn)}</p></div>
                                    <div><p className="text-[10px] text-slate-400 uppercase font-black">Out</p><p className="text-sm font-bold text-slate-700">{formatarData(h.checkOut)}</p></div>
                                </div>
                                <button onClick={() => handleEnviarResumo(h)} className="w-full flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 py-3 rounded-xl text-xs font-bold hover:bg-emerald-200">
                                    <MessageSquare size={16} /> Enviar Resumo WhatsApp
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Passageiros;