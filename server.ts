import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Helper to get GoogleGenAI instance
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Endpoint: Check status
app.get('/api/status', (req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    ok: true,
    geminiConfigured: hasKey,
    environment: process.env.NODE_ENV || 'development',
  });
});

// Endpoint: Parse audio or text transcript into structured RDO via Método Larissa
app.post('/api/gemini/parse-rdo', async (req: Request, res: Response) => {
  try {
    const { relatoTexto, audioBase64, audioMimeType } = req.body;

    if (!relatoTexto && !audioBase64) {
      return res.status(400).json({ error: 'Nenhum relato (texto ou áudio) foi fornecido.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Chave GEMINI_API_KEY não configurada no servidor. Configure a chave para habilitar a IA.',
      });
    }

    const systemInstruction = `Você é o assistente técnico especializado do "RDO Inteligente - Método Larissa" para Engenharia Civil.
Sua função é transformar relatos de canteiro de obras (falados ou digitados) em dados estruturados para o Relatório Diário de Obra (RDO).

CRITÉRIOS E REGRAS ESTRITAS DO MÉTODO LARISSA:
1. Utilize SOMENTE informações fornecidas no relato.
2. Deixe campos ausentes como strings vazias ("") ou listas vazias ([]). NUNCA invente números, nomes, materiais ou equipamentos não ditos.
3. Se houver alguma informação incompleta, contraditória ou com dúvida, liste no campo "requerConfirmacao" com o formato: "Requer confirmação: [motivo]".
4. ATENÇÃO CRÍTICA COM PERCENTUAIS: Nunca interprete o percentual de uma atividade como avanço total da obra! Por exemplo, "concluímos 80%" refere-se exclusivamente à atividade descrita (ex: 80% da concretagem das vigas).
5. Mão de obra: Identifique a função (ex: pedreiro, servente, carpinteiro, armador, eletricista, encarregado) e a quantidade numérica.
6. Equipamentos: Identifique os equipamentos citados e seu status (Operacional, Parado, Em Manutenção).
7. Clima: Registre o clima do período citado (manhã/tarde: Bom, Nublado, Chuvoso, Impraticável).
8. Ocorrências e Paralisações: Extraia atrasos, chuvas, paralisações e qualquer fato relevante.
9. Segurança: Identifique menções a EPIs, DDS, acidentes ou inspeções. Se nada for dito, deixe vazio.`;

    const contents: any[] = [];

    if (audioBase64 && audioMimeType) {
      contents.push({
        inlineData: {
          mimeType: audioMimeType,
          data: audioBase64,
        },
      });
      contents.push(
        `Transcreva o áudio de obra e estruture o RDO seguindo rigorosamente o Método Larissa.`
      );
    } else {
      contents.push(
        `Analise o seguinte relato de canteiro de obras e estruture o preenchimento do RDO segundo o Método Larissa:\n\n"${relatoTexto}"`
      );
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcricaoIdentificada: {
              type: Type.STRING,
              description: 'A transcrição fidedigna do que foi relatado',
            },
            climaManha: {
              type: Type.STRING,
              description: 'Condição do tempo pela manhã (ex: Ensolarado, Nublado, Chuva, Impraticável) ou vazio',
            },
            climaTarde: {
              type: Type.STRING,
              description: 'Condição do tempo à tarde ou vazio',
            },
            observacaoClima: {
              type: Type.STRING,
              description: 'Observações específicas de tempo, ex: chuva das 08h às 09h',
            },
            atividades: {
              type: Type.ARRAY,
              description: 'Lista de atividades realizadas com o percentual executado no dia',
              items: {
                type: Type.OBJECT,
                properties: {
                  descricao: { type: Type.STRING, description: 'Descrição da atividade executada' },
                  percentualExecutado: {
                    type: Type.STRING,
                    description: 'Percentual executado DA ATIVIDADE (ex: "80% da etapa", "100%", etc.)',
                  },
                  localizacao: { type: Type.STRING, description: 'Local ou elemento específico (ex: vigas do 2º pavimento) ou vazio' },
                },
                required: ['descricao'],
              },
            },
            maoDeObra: {
              type: Type.ARRAY,
              description: 'Efetivo no dia',
              items: {
                type: Type.OBJECT,
                properties: {
                  funcao: { type: Type.STRING, description: 'Função (ex: Pedreiro, Servente, Carpinteiro)' },
                  quantidade: { type: Type.INTEGER, description: 'Número de profissionais' },
                },
                required: ['funcao', 'quantidade'],
              },
            },
            equipamentos: {
              type: Type.ARRAY,
              description: 'Equipamentos utilizados ou presentes na obra',
              items: {
                type: Type.OBJECT,
                properties: {
                  nome: { type: Type.STRING },
                  quantidade: { type: Type.INTEGER },
                  status: { type: Type.STRING, description: 'Operacional, Parado, Em Manutenção' },
                },
                required: ['nome'],
              },
            },
            materiais: {
              type: Type.ARRAY,
              description: 'Materiais entregues ou aplicados',
              items: {
                type: Type.OBJECT,
                properties: {
                  descricao: { type: Type.STRING },
                  quantidade: { type: Type.STRING },
                },
                required: ['descricao'],
              },
            },
            ocorrenciasParalisacoes: {
              type: Type.STRING,
              description: 'Ocorrências, interrupções ou paralisações registradas',
            },
            segurancaTrabalho: {
              type: Type.STRING,
              description: 'Registros sobre DDS, EPIs, condições seguras ou incidentes',
            },
            observacoesGerais: {
              type: Type.STRING,
              description: 'Outras anotações técnicas do responsável',
            },
            requerConfirmacao: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Lista de itens ambíguos ou que requerem confirmação do engenheiro',
            },
          },
          required: ['atividades', 'maoDeObra', 'requerConfirmacao'],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsedJson });
  } catch (error: any) {
    console.error('Erro ao processar RDO com Gemini:', error);
    return res.status(500).json({
      error: 'Erro ao processar relato com inteligência artificial.',
      details: error.message || String(error),
    });
  }
});

async function startServer() {
  // If not production, mount Vite dev middlewares
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[RDO Inteligente] Servidor ativo em http://0.0.0.0:${PORT}`);
  });
}

startServer();
