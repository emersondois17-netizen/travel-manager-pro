import React, { useState } from 'react';
import api from '../services/api';
import { Sparkles, FileText, UploadCloud } from 'lucide-react';

const Hotelaria = () => {
    const [cpf, setCpf] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

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
        } catch (error) {
            alert(error.response?.data?.error || 'Erro na extração.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Importação de Voucher</h1>
            <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-2xl">
                <input 
                    className="w-full border p-3 rounded-lg mb-4"
                    placeholder="CPF do Passageiro"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                />

                <div className="border-2 border-dashed border-blue-200 p-10 rounded-xl text-center mb-6 hover:bg-blue-50 transition">
                    <input 
                        type="file" 
                        id="pdf-upload" 
                        hidden 
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                    <label htmlFor="pdf-upload" className="cursor-pointer">
                        <UploadCloud className="mx-auto text-blue-400 mb-3" size={48} />
                        <span className="text-slate-600 block">
                            {file ? `Arquivo: ${file.name}` : 'Clique para selecionar o PDF do Voucher'}
                        </span>
                    </label>
                </div>

                <button 
                    onClick={handleProcess}
                    disabled={loading || !file || !cpf}
                    className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                    {loading ? 'Extraindo dados com IA...' : <><Sparkles size={20}/> Processar PDF</>}
                </button>
            </div>
        </div>
    );
};

export default Hotelaria;