/**
 * @file HotelController.js
 * @description Controller for processing vouchers and managing hotel data.
 * @author Emerson Sousa
 */

const Hotel = require('../models/Hotel');
const Cliente = require('../models/Cliente');
const IAExtracaoService = require('../services/IAExtracaoService');

class HotelController {
    // Método 1: Processar o PDF via IA e salvar
    async processarVoucher(req, res) {
        try {
            const { cpfCliente } = req.body;

            // Validação de segurança para garantir que o arquivo chegou via Multer
            if (!req.file) {
                return res.status(400).json({ error: 'Nenhum arquivo PDF foi enviado.' });
            }

            // Verifica se o passageiro existe no banco
            const cliente = await Cliente.findOne({ cpf: cpfCliente });
            if (!cliente) {
                return res.status(404).json({ error: 'Cliente não encontrado. Cadastre-o primeiro.' });
            }

            // Envia o arquivo direto para a IA com a abordagem HTTP Bypass
            const dadosIA = await IAExtracaoService.extrairDadosHotelDoPdf(
                req.file.buffer, 
                req.file.mimetype
            );

            // Salva a reserva no MongoDB vinculada ao cliente
            const novaReserva = await Hotel.create({
                cliente: cliente._id,
                hospede: dadosIA.hospede || 'Não identificado', // Salva o nome do passageiro real
                hotel: dadosIA.hotelName,
                cidade: dadosIA.city,
                localizador: dadosIA.locator,
                checkIn: dadosIA.checkIn,
                checkOut: dadosIA.checkOut
            });

            return res.status(201).json(novaReserva);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao processar o arquivo com a IA.' });
        }
    }

    // Método 2: Listar as reservas de um cliente (O que estava faltando e causou o erro)
    async listarPorCliente(req, res) {
        try {
            const reservas = await Hotel.find({ cliente: req.params.clienteId });
            return res.json(reservas);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar reservas do cliente.' });
        }
    }

    // Método 3: Listar todas as reservas para o Dashboard
    async listarTodos(req, res) {
        try {
            // O .populate('cliente') traz os dados do passageiro junto com a reserva
            const reservas = await Hotel.find()
                .populate('cliente', 'nome cpf')
                .sort({ createdAt: -1 }); // Traz as mais recentes primeiro
            return res.json(reservas);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar todas as reservas.' });
        }
    }

    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const hotelAtualizado = await Hotel.findByIdAndUpdate(id, req.body, { new: true });
            if (!hotelAtualizado) return res.status(404).json({ error: 'Reserva não encontrada.' });
            return res.json(hotelAtualizado);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar hotel.' });
        }
    }

    async excluir(req, res) {
        try {
            const { id } = req.params;
            const hotelExcluido = await Hotel.findByIdAndDelete(id);
            if (!hotelExcluido) return res.status(404).json({ error: 'Reserva não encontrada.' });
            return res.json({ message: 'Reserva excluída com sucesso.' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao excluir reserva.' });
        }
    }

}

module.exports = new HotelController();