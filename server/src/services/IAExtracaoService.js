/**
 * @file IAExtracaoService.js
 * @description Service to extract data from PDFs using Gemini REST API natively.
 */

class IAExtracaoService {
    
    // MÉTODO 1: Extração de Vouchers de Hotel (Mantido)
    async extrairDadosHotelDoPdf(pdfBuffer, mimeType = "application/pdf") {
        try {
            console.log("☁️ Enviando PDF do Hotel via Requisição HTTP Direta...");
            const prompt = `
            Aja como um extrator de dados LITERAL de vouchers de turismo.
            Analise o documento PDF em anexo e extraia os dados exatamente como estão impressos.
            Retorne APENAS um objeto JSON válido com os campos: hospede, hotelName, city, locator, checkIn (YYYY-MM-DD), checkOut (YYYY-MM-DD).`;
            const base64Data = pdfBuffer.toString("base64");
            const apiKey = process.env.GEMINI_API_KEY;
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
            const requestBody = { contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType, data: base64Data } }] }] };
            const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(requestBody) });
            const data = await response.json();
            let responseText = data.candidates[0].content.parts[0].text.replace(/```json/gi, '').replace(/```/g, '').trim();
            return JSON.parse(responseText);
        } catch (error) { throw new Error('Falha na extração de hotel.'); }
    }

    // MÉTODO 2: Extração de Documentos (Mantido)
    async extrairDadosDocumento(buffer, mimeType) {
        try {
            const prompt = `Extraia dados de documentos de identidade. Retorne JSON com: tipo, nome, cpf, dataNascimento, passaporteNumero.`;
            const base64Data = buffer.toString("base64");
            const apiKey = process.env.GEMINI_API_KEY;
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
            const requestBody = { contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType, data: base64Data } }] }] };
            const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(requestBody) });
            const data = await response.json();
            let responseText = data.candidates[0].content.parts[0].text.replace(/```json/gi, '').replace(/```/g, '').trim();
            return JSON.parse(responseText);
        } catch (error) { throw new Error('Falha ao processar documento.'); }
    }

    // MÉTODO 3: Extração de Bilhetes Aéreos (ATUALIZADO)
    async extrairDadosVoo(buffer, mimeType) {
        try {
            console.log("☁️ Enviando Bilhete Aéreo para a IA...");
            const prompt = `
            Aja como um perito em extração de dados de passagens aéreas.
            Analise o documento PDF em anexo.
            
            Retorne APENAS um objeto JSON válido com os seguintes campos:
            - passageiro: Nome do viajante.
            - ciaAerea: Nome da companhia (Ex: LATAM, GOL).
            - numeroVoo: O número do voo (Ex: LA3456, G31234). Procure por "Voo" ou "Flight".
            - localizador: Código de reserva (6 caracteres).
            - origem: Sigla IATA 3 letras (Ex: GRU).
            - destino: Sigla IATA 3 letras (Ex: JFK).
            - dataEmbarque: Data e hora em ISO 8601 (Ex: 2026-03-20T19:45:00.000Z).
            
            REGRAS RÍGIDAS: Retorne APENAS o JSON.`;

            const base64Data = buffer.toString("base64");
            const apiKey = process.env.GEMINI_API_KEY;
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

            const requestBody = {
                contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType, data: base64Data } }] }],
                generationConfig: { temperature: 0.1 }
            };

            const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(requestBody) });
            const data = await response.json();
            let responseText = data.candidates[0].content.parts[0].text.replace(/```json/gi, '').replace(/```/g, '').trim();
            const cleanJson = responseText.substring(responseText.indexOf("{"), responseText.lastIndexOf("}") + 1);

            console.log("✅ Bilhete lido com sucesso!");
            return JSON.parse(cleanJson);
        } catch (error) {
            console.error('❌ Erro na extração aéreo:', error);
            throw new Error('Falha ao processar o bilhete aéreo.');
        }
    }
}

module.exports = new IAExtracaoService();