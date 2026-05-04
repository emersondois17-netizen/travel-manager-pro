const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente', // Este é o solicitante (quem paga/organiza)
        required: true
    },
    hospede: { type: String, required: true }, // NOVO CAMPO: Quem vai viajar
    hotel: { type: String, required: true },
    cidade: { type: String, required: true },
    localizador: { type: String, required: true, uppercase: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    status: { type: String, default: 'Confirmada' }
}, { timestamps: true });

module.exports = mongoose.model('Hotel', hotelSchema);