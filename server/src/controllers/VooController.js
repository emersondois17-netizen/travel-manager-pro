const Voo = require('../models/Voo');
const Cliente = require('../models/Cliente');
const VooMonitorService = require('../services/VooMonitorService');
const IAExtracaoService = require('../services/IAExtracaoService');

class VooController {
    async processarBilhete(req, res) {
        try {
            const { cpfCliente } = req.body;
            if (!req.file) return res.status(400).json({ error: 'Nenhum bilhete enviado.' });

            const cliente = await Cliente.findOne({ cpf: cpfCliente });
            if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado.' });

            const dadosIA = await IAExtracaoService.extrairDadosVoo(req.file.buffer, req.file.mimetype);

            const novoVoo = await Voo.create({
                cliente: cliente._id,
                passageiro: dadosIA.passageiro,
                ciaAerea: dadosIA.ciaAerea,
                localizador: dadosIA.localizador,
                origem: dadosIA.origem,
                destino: dadosIA.destino,
                dataEmbarque: dadosIA.dataEmbarque,
                numeroVoo: dadosIA.numeroVoo || '',
                statusMonitoramento: 'Confirmado' // Status inicial padrão
            });

            return res.status(201).json(novoVoo);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Erro ao processar bilhete.' });
        }
    }

    async listar(req, res) {
        try {
            const voos = await Voo.find().populate('cliente', 'nome').sort({ dataEmbarque: 1 });
            return res.json(voos);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar voos.' });
        }
    }

    async sincronizarStatus(req, res) {
        try {
            const voo = await Voo.findById(req.params.id);
            if (!voo) return res.status(404).json({ error: 'Voo não encontrado.' });

            const identificador = voo.numeroVoo || voo.localizador;
            const dadosAPI = await VooMonitorService.buscarStatusVoo(identificador);
            
            if (dadosAPI) {
                // Mapeamento de status da Aviationstack para termos em Português
                const mapaStatus = {
                    'scheduled': 'Confirmado',
                    'active': 'Em Voo',
                    'landed': 'Pousado',
                    'cancelled': 'Cancelado',
                    'incident': 'Atrasado',
                    'diverted': 'Alternado'
                };

                voo.statusMonitoramento = mapaStatus[dadosAPI.status] || dadosAPI.status;
                await voo.save();
                return res.json(voo); // Retorna o voo completo atualizado
            }
            
            return res.status(404).json({ error: 'Sem dados novos da Cia Aérea.' });
        } catch (error) {
            return res.status(500).json({ error: 'Falha na sincronização.' });
        }
    }

    async atualizar(req, res) {
        try {
            const voo = await Voo.findByIdAndUpdate(req.params.id, req.body, { new: true });
            return res.json(voo);
        } catch (e) { return res.status(500).json({ error: 'Erro ao atualizar.' }); }
    }

    async excluir(req, res) {
        try {
            await Voo.findByIdAndDelete(req.params.id);
            return res.json({ message: 'Excluído' });
        } catch (e) { return res.status(500).json({ error: 'Erro ao excluir.' }); }
    }
}

module.exports = new VooController();