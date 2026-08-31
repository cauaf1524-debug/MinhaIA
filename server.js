require("dotenv").config();

const express = require("express");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

// Memória da conversa
const historico = [];

app.post("/api/chat", async (req, res) => {
  const pergunta = String(req.body?.pergunta || "").trim();

  if (!pergunta) {
    return res.status(400).json({
      resposta: "Digite uma pergunta.",
      explicacao: ""
    });
  }

  try {
    historico.push({
      role: "user",
      parts: [{ text: pergunta }]
    });

    const resultado = await ai.models.generateContent({
      model: "gemini-3.6-flash",

      contents: historico,

      config: {
        systemInstruction: `
Você é a Minha IA, um assistente inteligente em português do Brasil.

REGRAS:

1. Responda primeiro de forma direta e clara.
2. Depois explique a resposta.
3. A resposta deve ser adequada à pergunta.
4. Seja natural e converse normalmente.
5. Não diga que você é o Gemini.
6. Não invente informações.
7. Quando a pergunta for matemática, dê primeiro o resultado e depois mostre como chegou nele.
8. Quando a pergunta pedir uma explicação, dê uma resposta curta primeiro e depois aprofunde.
9. Mantenha o contexto das mensagens anteriores.

Retorne SOMENTE um JSON neste formato:

{
  "resposta": "resposta direta",
  "explicacao": "explicação detalhada"
}
        `,

        responseMimeType: "application/json"
      }
    });

    const texto = resultado.text;

    let dados;

    try {
      dados = JSON.parse(texto);
    } catch {
      dados = {
        resposta: texto,
        explicacao: "Resposta gerada pela IA."
      };
    }

    historico.push({
      role: "model",
      parts: [{ text: texto }]
    });

    return res.json({
      resposta: dados.resposta || "Não consegui gerar uma resposta.",
      explicacao: dados.explicacao || ""
    });

  } catch (erro) {

    console.error("Erro ao consultar o Gemini:", erro);

    return res.status(500).json({
      resposta: "Não consegui responder agora.",
      explicacao: "Ocorreu um erro ao consultar o modelo de IA."
    });
  }
});
app.get('/', (req, res) => {
  res.send(`
    <h1>MinhaIA está funcionando! 🤖</h1>
    <p>Servidor online com sucesso.</p>
  `);
});
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Minha IA rodando na porta ${PORT}`);
});

