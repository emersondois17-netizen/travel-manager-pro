/**
 * @file IAExtracaoService.js
 * @description Service to extract hotel voucher data using Google Gemini AI.
 * @author Emerson Sousa
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class IAExtracaoService {
    async extrairDadosHotel(textoPdf) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            
            const prompt = `
                Extract the following hotel booking information from the text below and return ONLY a JSON object.
                Fields required: hotelName, city, locator, checkIn (YYYY-MM-DD), checkOut (YYYY-MM-DD), guestName.
                
                Text: ${textoPdf}
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Limpa a resposta para garantir que seja um JSON válido
            return JSON.parse(text.replace(/```json|```/g, ""));
        } catch (error) {
            console.error("❌ IA Extraction Error:", error);
            throw new Error("Falha ao processar o voucher com IA.");
        }
    }
}

module.exports = new IAExtracaoService();