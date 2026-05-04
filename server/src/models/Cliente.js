const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
    // Dados Básicos
    tipo: { type: String, enum: ['PF', 'PJ'], default: 'PF' }, // Pessoa Física ou Jurídica
    nome: { type: String, required: true }, // Nome completo ou Razão Social
    cpf: { type: String, required: true, unique: true }, // Usaremos o mesmo campo para CPF ou CNPJ
    email: { type: String },
    telefone: { type: String },
    empresa: { type: String }, // Vínculo corporativo (Ex: Trabalha na Difratelli Moveis)

    // Dados Específicos PF (Física)
    dataNascimento: { type: Date },
    
    // Dados Internacionais
    passaporte: {
        numero: { type: String, default: '' },
        dataEmissao: { type: Date },
        dataVencimento: { type: Date }
    },

    // Programas de Fidelidade (Um cliente pode ter vários)
    fidelidade: [{
        programa: { type: String }, // Ex: Latam Pass, Smiles, Azul Fidelidade
        numero: { type: String }
    }],

    // Informações Críticas / VIP
    observacoes: { type: String, default: '' } // Ex: "Alergia a glúten", "Prefere corredor", "Diretor VIP"

}, { timestamps: true });

module.exports = mongoose.model('Cliente', clienteSchema);