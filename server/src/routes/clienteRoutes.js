/**
 * @file clienteRoutes.js
 * @description Rotas para gestão de passageiros e clientes.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // Armazena o arquivo temporariamente na memória (buffer)
const ClienteController = require('../controllers/ClienteController');

// Rota para extrair dados do documento com IA (PDF, JPG, PNG)
router.post('/extrair', upload.single('file'), ClienteController.extrairDocumento);

// Rota para cadastrar novo cliente (Ajustado para o nome correto do método: criar)
router.post('/', ClienteController.criar);

// Rota para listar todos os clientes (Ajustado para o nome correto do método: listar)
router.get('/', ClienteController.listar);

// Rotas de Edição e Exclusão
router.put('/:id', ClienteController.atualizar);
router.delete('/:id', ClienteController.deletar);

module.exports = router;