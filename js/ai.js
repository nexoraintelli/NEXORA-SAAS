export async function callAI({ messages, maxTokens = 1800, task = "c1" }) {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        task,
        max_tokens: maxTokens,
        messages
      })
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      return {
        ok: false,
        text: "",
        error: data.message || "IA indisponível."
      };
    }

    return data;
  } catch (error) {
    return {
      ok: false,
      text: "",
      error: "IA indisponível."
    };
  }
}
