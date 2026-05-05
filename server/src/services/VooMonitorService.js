/**
 * @file VooMonitorService.js
 * @description Integração real com a API Aviationstack.
 */
class VooMonitorService {
    async buscarStatusVoo(vooCode) {
        try {
            const apiKey = process.env.AVIATION_STACK_KEY;
            if (!apiKey) {
                console.error("❌ AVIATION_STACK_KEY não encontrada no .env");
                return null;
            }

            // Remove espaços extras do código do voo (ex: "G3 1234" vira "G31234")
            const formattedCode = vooCode.replace(/\s+/g, '');
            const url = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${formattedCode}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data && data.data && data.data.length > 0) {
                const info = data.data[0];
                return {
                    status: info.flight_status, // scheduled, active, landed, cancelled
                    aeroporto: info.departure.airport,
                    portao: info.departure.gate,
                    atraso: info.departure.delay,
                    estimado: info.departure.estimated
                };
            }
            return null;
        } catch (error) {
            console.error("❌ Erro na API Aviationstack:", error.message);
            return null;
        }
    }
}

module.exports = new VooMonitorService();