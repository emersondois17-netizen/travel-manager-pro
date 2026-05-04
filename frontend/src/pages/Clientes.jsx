import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { UploadCloud, Sparkles, Plus, Trash2, Save, Users, Edit } from 'lucide-react';

const formatarDataParaInput = (dataIso) => {
    if (!dataIso) return '';
    return dataIso.split('T')[0];
};

const Clientes = () => {
    const estadoInicial = {
        tipo: 'PF', nome: '', cpf: '', email: '', telefone: '', empresa: '',
        dataNascimento: '', observacoes: '',
        passaporte: { numero: '', dataEmissao: '', dataVencimento: '' },
        fidelidade: []
    };

    const [formData, setFormData] = useState(estadoInicial);
    const [clientes, setClientes] = useState([]);
    const [loadingIA, setLoadingIA] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const fetchClientes = async () => {
        try {
            const response = await api.get('/clientes');
            setClientes(response.data);
        } catch (error) {
            console.error('Erro ao buscar clientes', error);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('passaporte.')) {
            const campo = name.split('.')[1];
            setFormData(prev => ({
                ...prev, passaporte: { ...prev.passaporte, [campo]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoadingIA(true);
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const response = await api.post('/clientes/extrair', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const dadosIA = response.data;
            
            setFormData(prev => ({
                ...prev,
                tipo: dadosIA.tipo || 'PF',
                nome: dadosIA.nome || prev.nome,
                cpf: dadosIA.cpf || prev.cpf,
                dataNascimento: dadosIA.dataNascimento || prev.dataNascimento,
                passaporte: {
                    numero: dadosIA.passaporteNumero || prev.passaporte.numero,
                    dataEmissao: dadosIA.passaporteEmissao || prev.passaporte.dataEmissao,
                    dataVencimento: dadosIA.passaporteVencimento || prev.passaporte.dataVencimento
                }
            }));
            alert('Documento lido com sucesso! Verifique os dados preenchidos.');
        } catch (error) {
            alert('Erro ao extrair documento: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoadingIA(false);
        }
    };

    const addFidelidade = () => setFormData(prev => ({ ...prev, fidelidade: [...prev.fidelidade, { programa: '', numero: '' }] }));
    const updateFidelidade = (index, campo, valor) => {
        const nova = [...formData.fidelidade];
        nova[index][campo] = valor;
        setFormData(prev => ({ ...prev, fidelidade: nova }));
    };
    const removeFidelidade = (index) => setFormData(prev => ({ ...prev, fidelidade: formData.fidelidade.filter((_, i) => i !== index) }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingSave(true);
        try {
            if (editMode) {
                await api.put(`/clientes/${editId}`, formData);
                alert('Cadastro atualizado com sucesso!');
            } else {
                await api.post('/clientes', formData);
                alert('Cadastro realizado com sucesso!');
            }
            setFormData(estadoInicial);
            setEditMode(false);
            setEditId(null);
            fetchClientes();
        } catch (error) {
            alert(error.response?.data?.error || 'Erro ao salvar o cadastro.');
        } finally {
            setLoadingSave(false);
        }
    };

    const handleEdit = (cliente) => {
        setEditMode(true);
        setEditId(cliente._id);
        const passaporteSeguro = cliente.passaporte || { numero: '', dataEmissao: '', dataVencimento: '' };
        
        setFormData({
            tipo: cliente.tipo || 'PF',
            nome: cliente.nome || '',
            cpf: cliente.cpf || '',
            email: cliente.email || '',
            telefone: cliente.telefone || '',
            empresa: cliente.empresa || '',
            observacoes: cliente.observacoes || '',
            dataNascimento: formatarDataParaInput(cliente.dataNascimento),
            fidelidade: cliente.fidelidade || [],
            passaporte: {
                numero: passaporteSeguro.numero || '',
                dataEmissao: formatarDataParaInput(passaporteSeguro.dataEmissao),
                dataVencimento: formatarDataParaInput(passaporteSeguro.dataVencimento)
            }
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id, nome) => {
        if (window.confirm(`Tem certeza que deseja excluir o cadastro de ${nome}?`)) {
            try {
                await api.delete(`/clientes/${id}`);
                fetchClientes();
            } catch (error) {
                alert('Erro ao excluir cliente.');
            }
        }
    };

    const cancelarEdicao = () => {
        setFormData(estadoInicial);
        setEditMode(false);
        setEditId(null);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Users /> Gestão de Clientes (CRM)
            </h1>

            {!editMode && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 mb-8 text-white shadow-lg">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="flex-1">
                            <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><Sparkles size={24}/> Auto-preenchimento (CNH/CNPJ)</h2>
                            <p className="text-blue-100 text-sm">Otimize o cadastro subindo o documento oficial do cliente ou da empresa.</p>
                        </div>
                        <div className="w-full md:w-1/3">
                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-xl p-4 cursor-pointer hover:bg-blue-800 transition bg-blue-900/30 relative">
                                {loadingIA ? (
                                    <span className="text-white font-bold animate-pulse">Analisando...</span>
                                ) : (
                                    <>
                                        <UploadCloud size={32} className="mb-2 text-blue-200" />
                                        <span className="text-sm font-medium">Selecionar Documento</span>
                                    </>
                                )}
                                <input type="file" className="hidden" onChange={handleFileUpload} disabled={loadingIA || editMode} accept="image/*,application/pdf" />
                            </label>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className={`bg-white p-8 rounded-xl shadow-sm border ${editMode ? 'border-amber-400 shadow-amber-100' : 'border-slate-200'} mb-8`}>
                {editMode && (
                    <div className="bg-amber-100 text-amber-800 p-3 rounded-lg mb-6 font-semibold flex justify-between items-center">
                        <span>⚠️ Editando cadastro de {formData.nome}</span>
                        <button type="button" onClick={cancelarEdicao} className="text-sm underline hover:text-amber-900">Cancelar</button>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-700 mb-4 border-b pb-2">Dados Cadastrais</h3>
                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="tipo" value="PF" checked={formData.tipo === 'PF'} onChange={handleChange} className="text-blue-600" /> Pessoa Física (PF)
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" name="tipo" value="PJ" checked={formData.tipo === 'PJ'} onChange={handleChange} className="text-blue-600" /> Pessoa Jurídica (PJ)
                            </label>
                        </div>

                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium text-slate-600 mb-1">Nome/Razão Social *</label><input required type="text" name="nome" value={formData.nome} onChange={handleChange} className="w-full border p-2 rounded-lg bg-slate-50" /></div>
                            <div><label className="block text-sm font-medium text-slate-600 mb-1">CPF/CNPJ *</label><input required type="text" name="cpf" value={formData.cpf} onChange={handleChange} className="w-full border p-2 rounded-lg bg-slate-50" /></div>
                            {formData.tipo === 'PF' && (<div><label className="block text-sm font-medium text-slate-600 mb-1">Data Nascimento</label><input type="date" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} className="w-full border p-2 rounded-lg bg-slate-50" /></div>)}
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium text-slate-600 mb-1">E-mail</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border p-2 rounded-lg bg-slate-50" /></div>
                                <div><label className="block text-sm font-medium text-slate-600 mb-1">Telefone</label><input type="text" name="telefone" value={formData.telefone} onChange={handleChange} className="w-full border p-2 rounded-lg bg-slate-50" /></div>
                            </div>
                            <div><label className="block text-sm font-medium text-slate-600 mb-1">Empresa Vínculada</label><input type="text" name="empresa" value={formData.empresa} onChange={handleChange} className="w-full border p-2 rounded-lg bg-slate-50" placeholder="Ex: Voll, Speedy" /></div>
                        </div>
                    </div>

                    <div>
                        {formData.tipo === 'PF' && (
                            <>
                                <h3 className="text-lg font-bold text-slate-700 mb-4 border-b pb-2">Passaporte</h3>
                                <div className="space-y-4 mb-6">
                                    <div><label className="block text-sm font-medium text-slate-600 mb-1">Número</label><input type="text" name="passaporte.numero" value={formData.passaporte.numero} onChange={handleChange} className="w-full border p-2 rounded-lg bg-slate-50" /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="block text-sm font-medium text-slate-600 mb-1">Emissão</label><input type="date" name="passaporte.dataEmissao" value={formData.passaporte.dataEmissao} onChange={handleChange} className="w-full border p-2 rounded-lg bg-slate-50" /></div>
                                        <div><label className="block text-sm font-medium text-slate-600 mb-1">Vencimento</label><input type="date" name="passaporte.dataVencimento" value={formData.passaporte.dataVencimento} onChange={handleChange} className="w-full border p-2 rounded-lg bg-slate-50" /></div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="flex justify-between items-center mb-4 border-b pb-2 mt-6">
                            <h3 className="text-lg font-bold text-slate-700">Fidelidade</h3>
                            <button type="button" onClick={addFidelidade} className="text-blue-600 font-bold flex items-center gap-1 text-sm"><Plus size={16} /> Add Cartão</button>
                        </div>
                        
                        {formData.fidelidade.map((item, index) => (
                            <div key={index} className="flex gap-2 mb-3 bg-slate-50 p-2 rounded border">
                                <input type="text" placeholder="Programa" value={item.programa} onChange={(e) => updateFidelidade(index, 'programa', e.target.value)} className="flex-1 border p-2 rounded-md text-sm" />
                                <input type="text" placeholder="Número" value={item.numero} onChange={(e) => updateFidelidade(index, 'numero', e.target.value)} className="flex-1 border p-2 rounded-md text-sm font-mono" />
                                <button type="button" onClick={() => removeFidelidade(index)} className="text-rose-500 hover:bg-rose-100 p-2 rounded"><Trash2 size={18} /></button>
                            </div>
                        ))}

                        <h3 className="text-lg font-bold text-slate-700 mb-4 border-b pb-2 mt-6">Observações / Perfil VIP</h3>
                        <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} className="w-full border p-3 rounded-lg bg-slate-50 h-24 resize-none" placeholder="Ex: Cadeira de rodas, Alergia a glúten..." />
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t flex justify-end">
                    <button type="submit" disabled={loadingSave} className={`px-8 py-3 rounded-lg font-bold text-white flex items-center gap-2 transition ${loadingSave ? 'bg-slate-400' : (editMode ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-600 hover:bg-green-700')}`}>
                        {loadingSave ? 'Processando...' : <><Save size={20}/> {editMode ? 'Atualizar Cadastro' : 'Salvar no Banco Mestre'}</>}
                    </button>
                </div>
            </form>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-slate-700">Banco de Dados de Clientes</h2>
                    <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">{clientes.length} Cadastros</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100 text-slate-600 text-sm">
                                <th className="p-4 border-b font-medium">Nome / Razão Social</th>
                                <th className="p-4 border-b font-medium">Doc (CPF/CNPJ)</th>
                                <th className="p-4 border-b font-medium">Contato</th>
                                <th className="p-4 border-b font-medium text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientes.map((cliente) => (
                                <tr key={cliente._id} className="hover:bg-slate-50 border-b text-sm">
                                    <td className="p-4">
                                        <div className="font-bold text-slate-800">{cliente.nome}</div>
                                        {cliente.empresa && <div className="text-xs text-slate-500 mt-1">🏢 {cliente.empresa}</div>}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${cliente.tipo === 'PJ' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                                            {cliente.tipo}
                                        </span>
                                        <span className="ml-2 font-mono text-slate-600">{cliente.cpf}</span>
                                    </td>
                                    <td className="p-4 text-slate-600 text-xs">
                                        <div>{cliente.email || '-'}</div>
                                        <div>{cliente.telefone || '-'}</div>
                                    </td>
                                    <td className="p-4 text-center space-x-3">
                                        <button onClick={() => handleEdit(cliente)} className="text-amber-500 hover:text-amber-700 transition" title="Editar"><Edit size={18} /></button>
                                        <button onClick={() => handleDelete(cliente._id, cliente.nome)} className="text-rose-500 hover:text-rose-700 transition" title="Excluir"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Clientes;