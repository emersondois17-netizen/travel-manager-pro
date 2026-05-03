/**
 * @file clienteRoutes.js
 * @description Rotas para gestão de passageiros e clientes.
 */

const express = require('express');
const router = express.Router();
const ClienteController = require('../controllers/ClienteController');

// Rota para cadastrar novo cliente
router.post('/', ClienteController.store);

// Rota para listar todos os clientes
router.get('/', ClienteController.index);

module.exports = router;