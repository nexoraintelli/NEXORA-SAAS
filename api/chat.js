export const config = { runtime: "edge" };

const DEFAULT_MODEL = "claude-sonnet-4-6";

const ALLOWED_MODELS = new Set([
  "claude-sonnet-4-6",
  "claude-sonnet-4-20250514"
]);

const TIMEOUT_BY_TASK = {
  c1: 30000,
  c2: 55000,
  c3: 45000,
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

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return json({
      ok: false,
      error_type: "config",
      message: "ANTHROPIC_API_KEY não configurada no Vercel."
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

    const max_tokens = Math.min(
      Number.isFinite(requestedTokens) ? requestedTokens : tokenLimit,
      tokenLimit
    );

    const messages = normalizeMessages(body);

    if (!messages.length) {
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

    const anthropicPayload = {
      model,
      max_tokens,
      messages
    };

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(anthropicPayload),
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
      console.error("Erro Anthropic:", {
        status: response.status,
        raw
      });

      return json({
        ok: false,
        error_type: "anthropic",
        status: response.status,
        message: extractAnthropicError(raw) || "A camada de IA não respondeu corretamente.",
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
      provider: "anthropic",
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

function normalizeMessages(body) {
  if (Array.isArray(body.messages) && body.messages.length) {
    return body.messages
      .filter(msg => msg && msg.content)
      .map(msg => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: String(msg.content)
      }));
  }

  if (body.prompt) {
    return [
      {
        role: "user",
        content: String(body.prompt)
      }
    ];
  }

  if (body.text) {
    return [
      {
        role: "user",
        content: String(body.text)
      }
    ];
  }

  return [];
}

function extractText(raw) {
  if (!raw) return "";

  if (typeof raw.text === "string") return raw.text;

  if (Array.isArray(raw.content)) {
    return raw.content
      .map(item => {
        if (typeof item === "string") return item;
        if (item?.type === "text" && item?.text) return item.text;
        if (item?.text) return item.text;
        return "";
      })
      .join("")
      .trim();
  }

  if (typeof raw.content === "string") return raw.content;
  if (typeof raw.message === "string") return raw.message;
  if (typeof raw.response === "string") return raw.response;
  if (typeof raw.output === "string") return raw.output;

  return "";
}

function extractAnthropicError(raw) {
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
