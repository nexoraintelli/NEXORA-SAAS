export function analisarPaginaBase(data, c1 = null) {
  let ctr = 70, cvr = 70, diferenciacao = 70, confianca = 70;
  const titulo = String(data.title || "");
  const bullets = String(data.bullets || "");
  const desc = String(data.description || "");
  const reviews = Number(data.reviews || 0);
  const rating = Number(data.rating || 0);
  if (titulo.length < 80) ctr -= 12;
  if (!data.hasMainImage) ctr -= 10;
  if (data.hasCoupon === false) ctr -= 4;
  if (bullets.length < 180) cvr -= 12;
  if (desc.length < 120) cvr -= 8;
  if (reviews < 20) confianca -= 18;
  if (rating > 0 && rating < 4.2) confianca -= 20;
  if (data.hasVideo === false) cvr -= 5;
  if (bullets.length < 120 && desc.length < 120) diferenciacao -= 15;
  if (c1?.scores?.ctr === "CRÍTICO") ctr -= 8;
  if (c1?.scores?.cvr === "CRÍTICO") cvr -= 8;
  const scores = { ctr_readiness: clamp(ctr), cvr_readiness: clamp(cvr), diferenciacao: clamp(diferenciacao), confianca: clamp(confianca) };
  const gaps = [];
  if (scores.ctr_readiness < 60) gaps.push({ nivel: "ALTO", descricao: "A página não sustenta bem a atração no resultado de busca." });
  if (scores.cvr_readiness < 60) gaps.push({ nivel: "CRÍTICO", descricao: "A estrutura de conversão precisa ser reforçada." });
  if (scores.confianca < 60) gaps.push({ nivel: "ALTO", descricao: "Prova social e confiança percebida estão frágeis." });
  const problema_principal = detectarProblema(scores);
  return { scores, problema_principal, diagnostico: `Análise gerada pela lógica Nexora. O principal ponto de atenção é: ${problema_principal}.`, gaps: gaps.slice(0, 3), prioridades: gerarPrioridades(scores) };
}
function detectarProblema(scores) {
  const [key] = Object.entries(scores).sort((a, b) => a[1] - b[1])[0];
  return { ctr_readiness: "Baixa capacidade de atração visual e textual", cvr_readiness: "Baixa capacidade de conversão da página", diferenciacao: "Diferenciação fraca frente à concorrência", confianca: "Confiança e prova social insuficientes" }[key] || "Página precisa de otimização";
}
function gerarPrioridades(scores) {
  const list = [];
  if (scores.ctr_readiness < 60) list.push("Melhorar imagem principal e título.");
  if (scores.cvr_readiness < 60) list.push("Reestruturar bullets e comunicação de valor.");
  if (scores.confianca < 60) list.push("Fortalecer reviews, rating, vídeo e prova social.");
  if (scores.diferenciacao < 60) list.push("Deixar o diferencial do produto mais claro.");
  return list.length ? list.slice(0, 3) : ["Testar melhorias incrementais na página.", "Reforçar diferenciação.", "Acompanhar evolução de CTR e CVR."];
}
function clamp(n) { return Math.max(0, Math.min(100, Math.round(n))); }

