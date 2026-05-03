/**
 * @file ClienteController.js
 * @description Controller for managing client data.
 * @author Emerson Sousa
 */

const Cliente = require('../models/Cliente');

class ClienteController {
    // Register a new client / passageiro
    async store(req, res) {
        try {
            const cliente = await Cliente.create(req.body);
            return res.status(201).json(cliente);
        } catch (error) {
            return res.status(400).json({ error: 'Erro ao cadastrar cliente. Verifique o CPF.' });
        }
    }

    // List all clients for the dashboard
    async index(req, res) {
        try {
            const clientes = await Cliente.find().sort({ createdAt: -1 });
            return res.json(clientes);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar clientes.' });
        }
    }
}

module.exports = new ClienteController();