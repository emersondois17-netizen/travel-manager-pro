import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { PlaneTakeoff, MapPin, CalendarDays, BedDouble, Plane } from 'lucide-react';

const formatarData = (dataIso) => {
    if (!dataIso) return '--/--/----';
    const [ano, mes, dia] = dataIso.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
};

const Passageiros = () => {
    const [operacoes, setOperacoes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTodasOperacoes = async () => {
            try {
                // Dispara as duas requisições ao mesmo tempo (muito mais rápido!)
                const [resHoteis, resVoos] = await Promise.all([
                    api.get('/hoteis'),
                    api.get('/voos')
                ]);

                // Padroniza os dados dos Hotéis
                const hoteisFormatados = resHoteis.data.map(h => ({
                    ...h,
                    tipoOperacao: 'HOTEL',
                    dataComparacao: new Date(h.checkIn),
                    tituloPrincipal: h.hotel,
                    subtitulo: h.cidade,
                    nomeViajante: h.hospede
                }));

                // Padroniza os dados dos Voos
                const voosFormatados = resVoos.data.map(v => ({
                    ...v,
                    tipoOperacao: 'VOO',
                    dataComparacao: new Date(v.dataEmbarque),
                    tituloPrincipal: `${v.ciaAerea} (${v.origem} ➔ ${v.destino})`,
                    subtitulo: 'Voo / Trecho',
                    nomeViajante: v.passageiro
                }));

                // Junta tudo em um único array e ordena pela data mais próxima
                const tudoJunto = [...hoteisFormatados, ...voosFormatados].sort((a, b) => a.dataComparacao - b.dataComparacao);

                setOperacoes(tudoJunto);
            } catch (error) {
                console.error('Erro ao buscar operações de viagem', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTodasOperacoes();
    }, []);

    const calcularStatus = (dataBase) => {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); 
        
        const dataComparacao = new Date(dataBase);
        dataComparacao.setHours(0, 0, 0, 0);

        if (hoje < dataComparacao) return { label: 'Em Breve', color: 'bg-amber-100 text-amber-800 border-amber-200' };
        if (hoje.getTime() === dataComparacao.getTime()) return { label: 'Em Viagem', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse' };
        return { label: 'Concluída', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                <PlaneTakeoff /> Passageiros em Operação
            </h1>
            <p className="text-slate-500 mb-8">Painel unificado de voos e hotéis ativos no momento.</p>

            {loading ? (
                <div className="text-center p-12 text-slate-500 font-medium animate-pulse">Carregando painel de operações da agência...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {operacoes.map((op) => {
                        const status = calcularStatus(op.dataComparacao);
                        const isVoo = op.tipoOperacao === 'VOO';
                        
                        return (
                            <div key={op._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
                                {/* Cabeçalho com o Status e o ícone Dinâmico */}
                                <div className={`p-4 border-b flex justify-between items-start ${status.label === 'Em Viagem' ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg text-white ${isVoo ? 'bg-blue-600' : 'bg-indigo-600'}`}>
                                            {isVoo ? <Plane size={20} /> : <BedDouble size={20} />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-sm">{op.nomeViajante}</h3>
                                            <span className="text-xs text-slate-500 uppercase font-semibold">Via {op.cliente?.nome || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${status.color}`}>
                                        {status.label}
                                    </span>
                                </div>
                                
                                {/* Corpo do Card */}
                                <div className="p-4 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="text-slate-400 mt-1" size={16} />
                                        <div>
                                            <p className="font-bold text-slate-700 text-sm">{op.tituloPrincipal}</p>
                                            <p className="text-xs text-slate-500">{op.subtitulo}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <CalendarDays className="text-slate-400 mt-1" size={16} />
                                        <div className="text-sm">
                                            {isVoo ? (
                                                <p className="text-slate-600"><span className="font-medium text-emerald-600">Embarque:</span> {new Date(op.dataEmbarque).toLocaleString('pt-BR').substring(0, 16)}</p>
                                            ) : (
                                                <>
                                                    <p className="text-slate-600"><span className="font-medium text-emerald-600">In:</span> {formatarData(op.checkIn)}</p>
                                                    <p className="text-slate-600"><span className="font-medium text-rose-600">Out:</span> {formatarData(op.checkOut)}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-slate-50 p-2 rounded flex justify-between items-center border border-slate-100">
                                        <span className="text-xs font-semibold text-slate-500">Localizador</span>
                                        <span className="font-mono text-xs font-bold text-slate-800">{op.localizador}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    {operacoes.length === 0 && (
                        <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                            Nenhuma operação ativa no sistema.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Passageiros;