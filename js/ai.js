export async function callAI({ messages, maxTokens = 1200, task = "default" }) {
  const res = await fetch("/api/chat.js", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ task, max_tokens: maxTokens, messages }) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) return { ok: false, text: "", error: data.message || "A camada avançada não respondeu." };
  return data;
}
export function parseJsonSafe(raw) {
  const clean = String(raw || "").replace(/```json/g, "").replace(/```/g, "").trim();
  try { return JSON.parse(clean); } catch {}
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try { return JSON.parse(clean.slice(start, end + 1).replace(/,\s*}/g, "}").replace(/,\s*]/g, "]")); } catch { return null; }
}

