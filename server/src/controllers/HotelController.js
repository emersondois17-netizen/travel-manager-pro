const Hotel = require('../models/Hotel');
const Cliente = require('../models/Cliente');
const IAExtracaoService = require('../services/IAExtracaoService');
const pdfParse = require('pdf-parse');

class HotelController {
    async processarVoucher(req, res) {
        try {
            const { cpfCliente } = req.body;
            let textoParaIA = req.body.textoExtraido;

            // Se um arquivo foi enviado, extraímos o texto dele
            if (req.file) {
                const data = await pdfParse(req.file.buffer);
                textoParaIA = data.text;
            }

            const cliente = await Cliente.findOne({ cpf: cpfCliente });
            if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado. Cadastre o passageiro primeiro.' });

            const dadosIA = await IAExtracaoService.extrairDadosHotel(textoParaIA);

            const novaReserva = await Hotel.create({
                cliente: cliente._id,
                hotel: dadosIA.hotelName,
                cidade: dadosIA.city,
                localizador: dadosIA.locator,
                checkIn: dadosIA.checkIn,
                checkOut: dadosIA.checkOut
            });

            return res.status(201).json(novaReserva);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao processar o arquivo ou IA.' });
        }
    }
    // ... manter os outros métodos
}

module.exports = new HotelController();