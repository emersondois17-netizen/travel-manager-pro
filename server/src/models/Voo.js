const mongoose = require('mongoose');

const vooSchema = new mongoose.Schema({
    // Relacionamento com o dono da reserva (A Empresa ou PF que solicitou)
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    // Passageiro que vai embarcar (Pode ser diferente do cliente)
    passageiro: { type: String, required: true },
    
    // Dados do Voo
    ciaAerea: { type: String, required: true },
    localizador: { type: String, required: true, uppercase: true },
    origem: { type: String, required: true, uppercase: true }, // Ex: GRU
    destino: { type: String, required: true, uppercase: true }, // Ex: JFK
    
    // Datas críticas
    dataEmbarque: { type: Date, required: true },
    dataDesembarque: { type: Date }, // Opcional, útil para voos longos
    
    status: { type: String, default: 'Confirmado' }
}, { timestamps: true });

module.exports = mongoose.model('Voo', vooSchema);