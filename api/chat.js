export const config = { runtime: "edge" };

const ALLOWED_MODELS = new Set(["claude-sonnet-4-6", "claude-sonnet-4-20250514"]);
const TIMEOUT_BY_TASK = { c1: 25000, c2: 55000, c3: 40000, synth: 45000, default: 30000 };
const TOKEN_BY_TASK = { c1: 1400, c2: 1800, c3: 1800, synth: 2500, default: 1500 };

export default async function handler(req) {
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error_type: "method", message: "Método não permitido." }, 405, corsHeaders);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY não configurada.");
    return json({ ok: false, error_type: "config", message: "A camada avançada não está disponível. A análise pode ser gerada com lógica Nexora." }, 500, corsHeaders);
  }

  try {
    const body = await req.json();
    const task = body.task || "default";
    const requestedModel = body.model || "claude-sonnet-4-6";
    const model = ALLOWED_MODELS.has(requestedModel) ? requestedModel : "claude-sonnet-4-6";
    const maxTokens = Math.min(Number(body.max_tokens || TOKEN_BY_TASK[task] || TOKEN_BY_TASK.default), TOKEN_BY_TASK[task] || TOKEN_BY_TASK.default);
    const safeBody = { model, max_tokens: maxTokens, messages: Array.isArray(body.messages) ? body.messages : [] };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_BY_TASK[task] || TIMEOUT_BY_TASK.default);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(safeBody),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const raw = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Erro Anthropic:", raw);
      return json({ ok: false, error_type: "anthropic", message: "A camada avançada não respondeu corretamente. Use a lógica Nexora como fallback." }, response.status, corsHeaders);
    }

    const text = raw?.content?.map(c => c.text || "").join("") || raw?.text || "";
    return json({ ok: true, text, raw }, 200, corsHeaders);
  } catch (err) {
    const isTimeout = err.name === "AbortError";
    console.error("Erro /api/chat:", err);
    return json({ ok: false, error_type: isTimeout ? "timeout" : "server", message: isTimeout ? "A camada avançada demorou demais. Gere a análise com lógica Nexora." : "A camada avançada falhou. Gere a análise com lógica Nexora." }, isTimeout ? 408 : 500, corsHeaders);
  }
}
function json(payload, status, headers) { return new Response(JSON.stringify(payload), { status, headers }); }

