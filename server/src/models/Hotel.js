const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente', // Referência ao Model de Cliente
        required: true
    },
    hotel: { type: String, required: true },
    cidade: { type: String, required: true },
    localizador: { type: String, required: true, uppercase: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    status: { type: String, default: 'Confirmada' }
}, { timestamps: true });

module.exports = mongoose.model('Hotel', hotelSchema);