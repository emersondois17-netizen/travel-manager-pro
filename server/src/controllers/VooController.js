const Voo = require('../models/Voo');
const Cliente = require('../models/Cliente');
const IAExtracaoService = require('../services/IAExtracaoService');

class VooController {
    // Processar PDF da passagem
    async processarBilhete(req, res) {
        try {
            const { cpfCliente } = req.body;

            if (!req.file) return res.status(400).json({ error: 'Nenhum bilhete enviado.' });

            const cliente = await Cliente.findOne({ cpf: cpfCliente });
            if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado. Cadastre-o primeiro.' });

            console.log("✈️ Processando bilhete via IA...");
            const dadosIA = await IAExtracaoService.extrairDadosVoo(req.file.buffer, req.file.mimetype);
            
            // LOG IMPORTANTE: Vai mostrar o que a IA conseguiu ler do PDF do BRT
            console.log("🧠 Dados retornados pela IA:", dadosIA);

            // Salva no Banco de Dados
            const novoVoo = await Voo.create({
                cliente: cliente._id,
                passageiro: dadosIA.passageiro || 'Não Extraído',
                ciaAerea: dadosIA.ciaAerea || 'Não Identificada',
                localizador: dadosIA.localizador || 'N/A',
                origem: dadosIA.origem || 'N/A',
                destino: dadosIA.destino || 'N/A',
                dataEmbarque: dadosIA.dataEmbarque || new Date() // Previne erro do banco se a IA não achar a data
            });

            console.log("✅ Voo salvo com sucesso no banco!");
            return res.status(201).json(novoVoo);
        } catch (error) {
            // LOG DE ERRO MELHORADO: Vai gritar no seu terminal do VS Code o motivo real
            console.error("❌ ERRO GRAVE NO CONTROLADOR DE VOO:", error);
            return res.status(500).json({ error: 'Erro ao processar o bilhete aéreo. Veja o terminal.' });
        }
    }

    // Listar Voos (Usado para a aba "Em Viagem")
    async listar(req, res) {
        try {
            // Traz os voos junto com os dados de quem pagou/solicitou (Relacionamento)
            const voos = await Voo.find().populate('cliente', 'nome cpf tipo').sort({ dataEmbarque: 1 });
            return res.json(voos);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar voos.' });
        }
    }
}

module.exports = new VooController();