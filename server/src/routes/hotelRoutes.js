/**
 * @file hotelRoutes.js
 * @description Rotas para processamento de vouchers e gestão de reservas.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // Armazena o arquivo temporariamente na memória (buffer)
const HotelController = require('../controllers/HotelController');

// Rota para processar o voucher com IA e salvar
router.post('/processar', upload.single('voucher'), HotelController.processarVoucher);

// Rota para buscar todas as reservas de um cliente específico
router.get('/cliente/:clienteId', HotelController.listarPorCliente);

module.exports = router;