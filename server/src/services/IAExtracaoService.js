/**
 * @file IAExtracaoService.js
 * @description Service to extract data from PDFs using Gemini REST API natively.
 */

class IAExtracaoService {
    
    // MÉTODO 1: Extração de Vouchers de Hotel
    async extrairDadosHotelDoPdf(pdfBuffer, mimeType = "application/pdf") {
        try {
            console.log("☁️ Enviando PDF do Hotel via Requisição HTTP Direta...");
            const prompt = `
            Aja como um extrator de dados LITERAL de vouchers de turismo.
            Analise o documento PDF em anexo e extraia os dados exatamente como estão impressos, sem tentar corrigir ortografia ou prever nomes comuns.
            
            Retorne APENAS um objeto JSON válido com os seguintes campos:
            - hospede: Transcreva EXATAMENTE as letras como estão no documento (Ex: se ler DIONIO, NUNCA altere para ANTONIO). Procure por "Room 1", "Guest", etc. Remova títulos (Mr, Mrs, Sr).
            - hotelName: Nome do hotel ou rede.
            - city: Cidade do hotel.
            - locator: Vouchers possuem diferentes fornecedores. Busque por "TBOH Confirmation", "Hotel Confirmation", "Localizador", "Booking Ref", etc. Se o documento contiver mais de um código de confirmação, concatene-os usando uma barra (Exemplo: "NTVNSC / 65143").
            - checkIn: Data de check-in estritamente no formato YYYY-MM-DD.
            - checkOut: Data de check-out estritamente no formato YYYY-MM-DD.
            
            REGRAS RÍGIDAS:
            - Não invente informações. Se não achar, deixe "".
            - Retorne APENAS o JSON.
            `;

            const base64Data = pdfBuffer.toString("base64");
            const apiKey = process.env.GEMINI_API_KEY;
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
            
            const requestBody = {
                contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: mimeType, data: base64Data } }] }],
                generationConfig: { temperature: 0.1 }
            };

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) throw new Error(`Status: ${response.status}`);

            const data = await response.json();
            let responseText = data.candidates[0].content.parts[0].text;
            
            // Limpeza segura do JSON
            responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const cleanJson = responseText.substring(responseText.indexOf("{"), responseText.lastIndexOf("}") + 1);

            console.log("✅ Dados do Hotel Extraídos com Sucesso!");
            return JSON.parse(cleanJson);

        } catch (error) {
            console.error('❌ Detalhe do Erro IA (Hotel):', error);
            throw new Error('Falha na extração de hotel.');
        }
    }

    // MÉTODO 2: Extração de Documentos de Identidade e CNPJ
    async extrairDadosDocumento(buffer, mimeType) {
        try {
            console.log("☁️ Enviando Documento para IA (CNH/Passaporte/CNPJ)...");
            const prompt = `
            Aja como um perito em OCR e análise forense de documentos de identidade (CNH, RG, Passaportes) e documentos empresariais (Cartão CNPJ).
            Analise a imagem ou PDF em anexo e extraia os dados biográficos/cadastrais.
            
            Retorne APENAS um objeto JSON válido com os seguintes campos:
            - tipo: "PF" se for pessoa física (CNH, RG, Passaporte) ou "PJ" se for pessoa jurídica (CNPJ).
            - nome: Nome completo ou Razão Social.
            - cpf: Número do CPF ou CNPJ (apenas os números, sem pontos ou traços).
            - dataNascimento: Data de nascimento formatada estritamente em YYYY-MM-DD. Se for PJ, deixe "".
            - passaporteNumero: Número do passaporte (se houver). Caso não seja um passaporte, deixe "".
            - passaporteEmissao: Data de emissão do passaporte (YYYY-MM-DD). Deixe "" se não houver.
            - passaporteVencimento: Data de validade do passaporte (YYYY-MM-DD). Deixe "" se não houver.
            
            REGRAS RÍGIDAS:
            - Não invente dados. Se o campo não existir, retorne uma string vazia "".
            - Retorne APENAS o JSON.
            `;

            const base64Data = buffer.toString("base64");
            const apiKey = process.env.GEMINI_API_KEY;
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

            const requestBody = {
                contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: mimeType, data: base64Data } }] }],
                generationConfig: { temperature: 0.1 }
            };

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) throw new Error(`Falha na API: ${response.status}`);

            const data = await response.json();
            let responseText = data.candidates[0].content.parts[0].text;
            
            // Limpeza segura do JSON
            responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const cleanJson = responseText.substring(responseText.indexOf("{"), responseText.lastIndexOf("}") + 1);

            console.log("✅ Documento processado com sucesso!");
            return JSON.parse(cleanJson);

        } catch (error) {
            console.error('❌ Erro na extração do documento:', error);
            throw new Error('Falha ao processar o documento via IA.');
        }
    }

    // MÉTODO 3: Extração de Bilhetes Aéreos
    async extrairDadosVoo(buffer, mimeType) {
        try {
            console.log("☁️ Enviando Bilhete Aéreo para a IA...");
            const prompt = `
            Aja como um perito em extração de dados de passagens aéreas (Portal BRT / Maisfly / LATAM / GOL / AZUL / TAP).
            Analise o documento PDF em anexo.
            
            Retorne APENAS um objeto JSON válido com os seguintes campos:
            - passageiro: Nome do viajante. (Ex: "EMERSON SOUSA").
            - ciaAerea: Nome da companhia aérea principal (Ex: LATAM, GOL).
            - localizador: Código de 6 caracteres (Ex: CA25GE). Se houver GDS e Cia, junte com barra (Ex: XWZ123 / LTM456).
            - origem: Sigla IATA de 3 letras do aeroporto de partida (Ex: GRU).
            - destino: Sigla IATA de 3 letras do aeroporto de chegada (Ex: JFK).
            - dataEmbarque: Data e hora do primeiro embarque estritamente em ISO 8601 (Ex: 2026-03-20T19:45:00.000Z).
            
            REGRAS RÍGIDAS:
            - Retorne APENAS o JSON válido.
            - Não inclua blocos de markdown.
            - Se não encontrar um campo, deixe como uma string vazia "".
            `;

            const base64Data = buffer.toString("base64");
            const apiKey = process.env.GEMINI_API_KEY;
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

            const requestBody = {
                contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: mimeType, data: base64Data } }] }],
                generationConfig: { temperature: 0.1 }
            };

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) throw new Error(`Falha na API da IA: ${response.status}`);

            const data = await response.json();
            let responseText = data.candidates[0].content.parts[0].text;
            
            // Limpeza segura do JSON
            responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const cleanJson = responseText.substring(responseText.indexOf("{"), responseText.lastIndexOf("}") + 1);

            console.log("✅ Bilhete Aéreo lido com sucesso!");
            return JSON.parse(cleanJson);

        } catch (error) {
            console.error('❌ Erro na extração aéreo:', error);
            throw new Error('Falha ao processar o bilhete aéreo.');
        }
    }
}

module.exports = new IAExtracaoService();