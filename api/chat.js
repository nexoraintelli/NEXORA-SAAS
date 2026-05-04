export const config = { runtime: "edge" };

const DEFAULT_MODEL = "gemini-2.5-flash";

const ALLOWED_MODELS = new Set([
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash"
]);

const TIMEOUT_BY_TASK = {
  c1: 30000,
  c2: 50000,
  c3: 40000,
  synth: 50000,
  default: 35000
};

const TOKEN_BY_TASK = {
  c1: 1400,
  c2: 1800,
  c3: 1800,
  synth: 2600,
  default: 1500
};

export default async function handler(req) {
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (req.method === "OPTIONS") {
    return json({ ok: true }, 204, corsHeaders);
  }

  if (req.method !== "POST") {
    return json({
      ok: false,
      error_type: "method",
      message: "Método não permitido. Use POST."
    }, 405, corsHeaders);
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return json({
      ok: false,
      error_type: "config",
      message: "GEMINI_API_KEY não configurada no Vercel."
    }, 500, corsHeaders);
  }

  try {
    const body = await req.json().catch(() => ({}));

    const task = body.task || "default";

    const requestedModel = body.model || DEFAULT_MODEL;
    const model = ALLOWED_MODELS.has(requestedModel)
      ? requestedModel
      : DEFAULT_MODEL;

    const tokenLimit = TOKEN_BY_TASK[task] || TOKEN_BY_TASK.default;

    const requestedTokens = Number(
      body.max_tokens ||
      body.maxTokens ||
      tokenLimit
    );

    const maxOutputTokens = Math.min(
      Number.isFinite(requestedTokens) ? requestedTokens : tokenLimit,
      tokenLimit
    );

    const prompt = normalizePrompt(body);

    if (!prompt) {
      return json({
        ok: false,
        error_type: "payload",
        message: "Nenhuma mensagem/prompt foi enviado para a IA."
      }, 400, corsHeaders);
    }

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, TIMEOUT_BY_TASK[task] || TIMEOUT_BY_TASK.default);

    const geminiPayload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: Number.isFinite(Number(body.temperature))
          ? Number(body.temperature)
          : 0.4,
        maxOutputTokens
      }
    };

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify(geminiPayload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    const rawText = await response.text();
    let raw = {};

    try {
      raw = JSON.parse(rawText);
    } catch (error) {
      raw = { raw_text: rawText };
    }

    if (!response.ok) {
      console.error("Erro Gemini:", {
        status: response.status,
        raw
      });

      return json({
        ok: false,
        error_type: "gemini",
        status: response.status,
        message: extractGeminiError(raw) || "A camada de IA Gemini não respondeu corretamente.",
        raw
      }, response.status, corsHeaders);
    }

    const text = extractText(raw);

    if (!text) {
      return json({
        ok: false,
        error_type: "empty",
        message: "A IA respondeu, mas sem texto utilizável.",
        raw
      }, 502, corsHeaders);
    }

    return json({
      ok: true,
      provider: "gemini",
      model,
      task,
      text,
      raw
    }, 200, corsHeaders);

  } catch (err) {
    const isTimeout = err?.name === "AbortError";

    console.error("Erro /api/chat.js:", err);

    return json({
      ok: false,
      error_type: isTimeout ? "timeout" : "server",
      message: isTimeout
        ? "A camada de IA demorou demais para responder."
        : "A camada de IA falhou no servidor."
    }, isTimeout ? 408 : 500, corsHeaders);
  }
}

function normalizePrompt(body) {
  if (Array.isArray(body.messages) && body.messages.length) {
    return body.messages
      .filter(msg => msg && msg.content)
      .map(msg => {
        const role = msg.role === "assistant" ? "Assistente" : "Usuário";
        return `${role}: ${String(msg.content)}`;
      })
      .join("\n\n")
      .trim();
  }

  if (body.prompt) {
    return String(body.prompt).trim();
  }

  if (body.text) {
    return String(body.text).trim();
  }

  return "";
}

function extractText(raw) {
  if (!raw) return "";

  if (typeof raw.text === "string") {
    return raw.text.trim();
  }

  if (Array.isArray(raw.candidates)) {
    return raw.candidates
      .map(candidate => {
        const parts = candidate?.content?.parts || [];

        return parts
          .map(part => part?.text || "")
          .join("");
      })
      .join("")
      .trim();
  }

  if (typeof raw.output === "string") return raw.output.trim();
  if (typeof raw.response === "string") return raw.response.trim();
  if (typeof raw.message === "string") return raw.message.trim();

  return "";
}

function extractGeminiError(raw) {
  return (
    raw?.error?.message ||
    raw?.message ||
    raw?.raw_text ||
    ""
  );
}

function json(payload, status, headers) {
  return new Response(JSON.stringify(payload), {
    status,
    headers
  });
}
