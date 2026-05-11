// /js/nexoraAI.js
// Camada oficial de IA da Nexora Intelligence
// Objetivo: centralizar chamadas de IA, aplicar timeout, retry, JSON seguro e fallback.

const DEFAULT_ENDPOINTS = [
  "/api/chat",
  "/api/chat.js",
  "../api/chat",
  "../api/chat.js"
];

const DEFAULT_TIMEOUT = 45000;

export async function analisarSinteseComIA({
  c1 = {},
  c2 = {},
  c3 = {},
  systemsAnalysis = {},
  baseSynthesis = {},
  product = {}
}) {
  const prompt = criarPromptSintese({
    c1,
    c2,
    c3,
    systemsAnalysis,
    baseSynthesis,
    product
  });

  const response = await chamarNexoraAI({
    task: "synth",
    prompt,
    model: "gemini-2.5-flash-lite",
    maxTokens: 2800,
    responseMimeType: "application/json",
    timeoutMs: 45000
  });

  if (!response.ok) {
    return {
      ok: false,
      ia_usada: false,
      error: response.error || "A IA Nexora não respondeu.",
      fallback_reason: response.message || "A análise base da Nexora será mantida."
    };
  }

  const parsed = parseJsonSeguro(response.text);

  if (!parsed) {
    return {
      ok: false,
      ia_usada: false,
      error: "A IA respondeu, mas não retornou JSON utilizável.",
      fallback_reason: "A análise base da Nexora será mantida."
    };
  }

  return {
    ok: true,
    ia_usada: true,
    ...normalizarRespostaSintese(parsed, systemsAnalysis)
  };
}

export async function chamarNexoraAI({
  task = "default",
  prompt = "",
  model = "gemini-2.5-flash-lite",
  maxTokens = 2200,
  responseMimeType = "application/json",
  timeoutMs = DEFAULT_TIMEOUT,
  temperature = 0.2
}) {
  if (!prompt || !String(prompt).trim()) {
    return {
      ok: false,
      error: "empty_prompt",
      message: "Nenhum prompt foi enviado para a IA Nexora."
    };
  }

  let lastError = null;

  for (const endpoint of DEFAULT_ENDPOINTS) {
    const firstTry = await chamarEndpoint({
      endpoint,
      task,
      prompt,
      model,
      maxTokens,
      responseMimeType,
      timeoutMs,
      temperature
    });

    if (firstTry.ok) return firstTry;

    lastError = firstTry;

    const shouldRetry =
      firstTry.status === 408 ||
      firstTry.status === 429 ||
      firstTry.status === 500 ||
      firstTry.status === 502 ||
      firstTry.status === 503 ||
      firstTry.status === 504;

    if (shouldRetry) {
      await wait(900);

      const secondTry = await chamarEndpoint({
        endpoint,
        task,
        prompt,
        model: "gemini-2.0-flash",
        maxTokens: Math.min(maxTokens, 1800),
        responseMimeType,
        timeoutMs: Math.min(timeoutMs, 35000),
        temperature
      });

      if (secondTry.ok) return secondTry;

      lastError = secondTry;
    }
  }

  return {
    ok: false,
    error: lastError?.error || "ai_unavailable",
    status: lastError?.status || 0,
    message: lastError?.message || "Nenhum endpoint de IA respondeu corretamente."
  };
}

async function chamarEndpoint({
  endpoint,
  task,
  prompt,
  model,
  maxTokens,
  responseMimeType,
  timeoutMs,
  temperature
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        task,
        model,
        maxTokens,
        max_tokens: maxTokens,
        responseMimeType,
        temperature,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    clearTimeout(timeout);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: data?.error_type || "http_error",
        message: data?.message || `Endpoint ${endpoint} retornou ${response.status}`,
        raw: data
      };
    }

    const text =
      data?.text ||
      data?.content ||
      data?.response ||
      data?.reply ||
      data?.message ||
      data?.result ||
      data?.output ||
      "";

    if (!text) {
      return {
        ok: false,
        status: 502,
        error: "empty_ai_response",
        message: "A IA respondeu, mas sem texto utilizável.",
        raw: data
      };
    }

    return {
      ok: true,
      endpoint,
      provider: data?.provider || "unknown",
      model: data?.model || model,
      task,
      text,
      raw: data
    };
  } catch (error) {
    clearTimeout(timeout);

    return {
      ok: false,
      status: error?.name === "AbortError" ? 408 : 500,
      error: error?.name === "AbortError" ? "timeout" : "network_error",
      message:
        error?.name === "AbortError"
          ? "A IA demorou demais para responder."
          : "Falha ao chamar a camada de IA.",
      raw: error
    };
  }
}

function criarPromptSintese({
  c1,
  c2,
  c3,
  systemsAnalysis,
  baseSynthesis,
  product
}) {
  return `
Você é a IA Nexora Intelligence, uma camada consultiva especializada em diagnóstico sistêmico de produtos na Amazon.

A Nexora não analisa apenas métricas. Ela cruza cinco sistemas que controlam a performance de um produto:

1. Unit Economics
2. Market Forces
3. Category Competition
4. Amazon Algorithm
5. Operational Structure

Sua função é complementar a engine lógica da Nexora, sem substituir as regras do sistema.

REGRAS OBRIGATÓRIAS:
- Não invente dados.
- Não contradiga os dados recebidos.
- Não escreva em markdown.
- Não retorne código.
- Não retorne explicações fora do JSON.
- Não use aspas duplas dentro dos textos.
- Retorne SOMENTE JSON válido.
- Seja consultiva, objetiva e prática.
- A próxima melhor ação precisa ser uma ação real para o seller executar.
- Não transforme a próxima ação em frase comercial sobre a Nexora.
- Se algum dado estiver ausente, diga que a leitura é limitada pelos dados disponíveis.

PRODUTO:
${JSON.stringify(product, null, 2)}

CÉREBRO 1:
${JSON.stringify(c1, null, 2)}

CÉREBRO 2:
${JSON.stringify(c2, null, 2)}

CÉREBRO 3:
${JSON.stringify(c3, null, 2)}

ANÁLISE DOS 5 SISTEMAS NEXORA:
${JSON.stringify(systemsAnalysis, null, 2)}

SÍNTESE BASE DA ENGINE NEXORA:
${JSON.stringify(baseSynthesis, null, 2)}

Retorne exatamente este JSON:

{
  "leitura_executiva": "leitura consultiva em 4 a 6 parágrafos curtos, conectando performance, página, mercado e os 5 sistemas",
  "risco_estrategico": "risco real de não corrigir a causa raiz, explicando impacto em conversão, mídia, margem, ranking ou competitividade",
  "sistema_mais_critico": "nome do sistema mais crítico",
  "sistema_secundario": "nome do sistema secundário",
  "proxima_melhor_acao": {
    "titulo": "ação principal prática que deve ser tomada agora",
    "detalhe": "explicação objetiva do porquê essa ação vem primeiro"
  },
  "prioridades": [
    {
      "prioridade": "1",
      "area": "área afetada",
      "titulo": "ação prioritária",
      "detalhe": "explicação prática",
      "impacto": "impacto esperado"
    },
    {
      "prioridade": "2",
      "area": "área afetada",
      "titulo": "ação prioritária",
      "detalhe": "explicação prática",
      "impacto": "impacto esperado"
    },
    {
      "prioridade": "3",
      "area": "área afetada",
      "titulo": "ação prioritária",
      "detalhe": "explicação prática",
      "impacto": "impacto esperado"
    }
  ],
  "plano_acao": [
    {
      "etapa": "Etapa 1",
      "prazo": "0-7 dias",
      "titulo": "ação prática",
      "descricao": "descrição da ação",
      "objetivo": "objetivo da etapa"
    },
    {
      "etapa": "Etapa 2",
      "prazo": "7-14 dias",
      "titulo": "ação prática",
      "descricao": "descrição da ação",
      "objetivo": "objetivo da etapa"
    },
    {
      "etapa": "Etapa 3",
      "prazo": "14-30 dias",
      "titulo": "ação prática",
      "descricao": "descrição da ação",
      "objetivo": "objetivo da etapa"
    }
  ]
}
`.trim();
}

function normalizarRespostaSintese(parsed, systemsAnalysis = {}) {
  const mostCritical =
    systemsAnalysis?.mostCriticalSystem?.label ||
    systemsAnalysis?.mostCriticalSystem?.name ||
    "";

  const secondary =
    systemsAnalysis?.secondarySystem?.label ||
    systemsAnalysis?.secondarySystem?.name ||
    "";

  const fallbackAction = systemsAnalysis?.nextBestAction || "";

  return {
    leitura_executiva: cleanText(parsed.leitura_executiva),
    risco_estrategico: cleanText(parsed.risco_estrategico),
    sistema_mais_critico: cleanText(parsed.sistema_mais_critico || mostCritical),
    sistema_secundario: cleanText(parsed.sistema_secundario || secondary),
    proxima_melhor_acao: {
      titulo: cleanText(
        parsed?.proxima_melhor_acao?.titulo ||
          fallbackAction ||
          "Priorizar o sistema mais crítico antes de escalar o produto"
      ),
      detalhe: cleanText(
        parsed?.proxima_melhor_acao?.detalhe ||
          "A próxima ação deve atacar o bloqueio que mais conecta performance, página e mercado."
      )
    },
    prioridades: Array.isArray(parsed.prioridades) ? parsed.prioridades : [],
    plano_acao: Array.isArray(parsed.plano_acao) ? parsed.plano_acao : []
  };
}

export function parseJsonSeguro(raw) {
  if (!raw) return null;
  if (typeof raw === "object") return raw;

  let clean = String(raw)
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(clean);
  } catch (error) {}

  const firstBrace = clean.indexOf("{");
  const lastBrace = clean.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const jsonCandidate = clean.slice(firstBrace, lastBrace + 1);

    try {
      return JSON.parse(jsonCandidate);
    } catch (error) {
      console.warn("JSON da IA Nexora inválido:", error, jsonCandidate);
    }
  }

  return null;
}

function cleanText(value) {
  return String(value || "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .replace(/\{|\}/g, "")
    .replace(/"\w+"\s*:/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
