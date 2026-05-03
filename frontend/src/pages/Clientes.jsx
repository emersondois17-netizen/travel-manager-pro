import React, { useState } from 'react';
import api from '../services/api';
import { UserPlus } from 'lucide-react';

const Clientes = () => {
    const [formData, setFormData] = useState({ nome: '', cpf: '', email: '', empresa: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/clientes', formData);
            alert('Passageiro cadastrado com sucesso!');
            setFormData({ nome: '', cpf: '', email: '', empresa: '' });
        } catch (error) {
            alert('Erro ao cadastrar. Verifique se o CPF já existe.');
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <UserPlus /> Cadastro de Passageiros (VOLL/Speedy)
            </h1>
            <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-2 gap-4 max-w-2xl">
                <input 
                    className="border p-2 rounded"
                    placeholder="Nome Completo"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                />
                <input 
                    className="border p-2 rounded"
                    placeholder="CPF (Apenas números)"
                    value={formData.cpf}
                    onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                />
                <input 
                    className="border p-2 rounded"
                    placeholder="E-mail"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <input 
                    className="border p-2 rounded"
                    placeholder="Empresa/Projeto"
                    value={formData.empresa}
                    onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                />
                <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition col-span-2">
                    Salvar Cliente
                </button>
            </form>
        </div>
    );
};

export default Clientes;