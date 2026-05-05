const mongoose = require('mongoose');

const vooSchema = new mongoose.Schema({
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
    passageiro: { type: String, required: true },
    ciaAerea: { type: String, required: true },
    localizador: { type: String, required: true, uppercase: true },
    numeroVoo: { type: String }, // Ex: LA3456
    origem: { type: String, required: true, uppercase: true },
    destino: { type: String, required: true, uppercase: true },
    dataEmbarque: { type: Date, required: true },
    internacional: { type: Boolean, default: false }, // NOVO
    statusMonitoramento: { type: String, default: 'scheduled' } // scheduled, cancelled, delayed
}, { timestamps: true });

module.exports = mongoose.model('Voo', vooSchema);