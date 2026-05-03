/**
 * @file Cliente.js
 * @description Schema para cadastro de passageiros/clientes.
 * @author Emerson Sousa
 */

const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true
    },
    cpf: {
        type: String,
        unique: true,
        required: [true, 'CPF é obrigatório']
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    telefone: String,
    empresa: String // Útil para o seu novo contexto na VOLL
}, { timestamps: true });

module.exports = mongoose.model('Cliente', clienteSchema);