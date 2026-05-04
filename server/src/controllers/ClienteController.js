/**
 * @file ClienteController.js
 * @description Controller para gestão e cadastro de clientes (PF/PJ).
 */

const Cliente = require('../models/Cliente');
const IAExtracaoService = require('../services/IAExtracaoService');

class ClienteController {
    
    // Método para a IA ler o documento e devolver os dados (NÃO salva no banco ainda)
    async extrairDocumento(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Nenhum documento foi enviado.' });
            }

            const dadosDocumento = await IAExtracaoService.extrairDadosDocumento(
                req.file.buffer,
                req.file.mimetype // Aceita PDF, JPG, PNG...
            );

            // Devolve os dados extraídos para o Front-end preencher o formulário
            return res.json(dadosDocumento);

        } catch (error) {
            return res.status(500).json({ error: 'Erro ao processar documento com IA.' });
        }
    }

    // Criar Cliente (Salvar no Banco)
    async criar(req, res) {
        try {
            const cliente = await Cliente.create(req.body);
            return res.status(201).json(cliente);
        } catch (error) {
            // Tratamento de erro caso o CPF/CNPJ já exista no banco
            if (error.code === 11000) {
                return res.status(400).json({ error: 'CPF ou CNPJ já cadastrado no sistema.' });
            }
            return res.status(500).json({ error: 'Erro ao salvar cliente.' });
        }
    }

    // Listar todos os clientes
    async listar(req, res) {
        try {
            const clientes = await Cliente.find().sort({ nome: 1 });
            return res.json(clientes);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar clientes.' });
        }
    }

    // Atualizar Cliente (Editar)
    async atualizar(req, res) {
        try {
            const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado.' });
            return res.json(cliente);
        } catch (error) {
            // Tratamento caso tente mudar para um CPF que já existe
            if (error.code === 11000) return res.status(400).json({ error: 'Este CPF/CNPJ já pertence a outro cadastro.' });
            return res.status(500).json({ error: 'Erro ao atualizar cliente.' });
        }
    }

    // Deletar Cliente
    async deletar(req, res) {
        try {
            const cliente = await Cliente.findByIdAndDelete(req.params.id);
            if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado.' });
            return res.json({ message: 'Cliente removido com sucesso.' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao deletar cliente.' });
        }
    }
}

module.exports = new ClienteController();