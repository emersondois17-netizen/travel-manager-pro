const Voo = require('../models/Voo');
const Hotel = require('../models/Hotel');
const Cliente = require('../models/Cliente');

class DashboardController {
    async getStats(req, res) {
        try {
            const totalVoos = await Voo.countDocuments();
            const totalHoteis = await Hotel.countDocuments();
            const totalClientes = await Cliente.countDocuments();

            // Pega as top 5 companhias aéreas para o gráfico de pizza
            const statsAereo = await Voo.aggregate([
                { $group: { _id: "$ciaAerea", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]);

            // Formata para o Recharts
            const graficoPizza = statsAereo.map(item => ({ 
                name: item._id || 'Outras', 
                value: item.count 
            }));

            // Exemplo de dados para o gráfico de linha (mock enquanto não temos muitos meses)
            const graficoLinha = [
                { name: 'Jan', vendas: 4 },
                { name: 'Fev', vendas: 7 },
                { name: 'Mar', vendas: totalVoos + totalHoteis }
            ];

            return res.json({
                cards: { totalVoos, totalHoteis, totalClientes },
                graficoPizza,
                graficoLinha
            });
        } catch (error) {
            console.error("Erro no Dashboard:", error);
            return res.status(500).json({ error: 'Erro ao processar dashboard' });
        }
    }
}

module.exports = new DashboardController();