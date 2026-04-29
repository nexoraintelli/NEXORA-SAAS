export function scoreCTR(value, benchmark) {
  if (!benchmark || benchmark <= 0) return value < 0.3 ? "CRÍTICO" : value < 0.8 ? "BAIXO" : "OK";
  const ratio = value / benchmark;
  if (ratio < 0.7) return "CRÍTICO";
  if (ratio < 0.95) return "BAIXO";
  if (ratio <= 1.2) return "OK";
  return "FORTE";
}
export function scoreCVR(value, benchmark) {
  if (!benchmark || benchmark <= 0) return value < 5 ? "CRÍTICO" : value < 10 ? "BAIXO" : "OK";
  const ratio = value / benchmark;
  if (ratio < 0.75) return "CRÍTICO";
  if (ratio < 0.95) return "BAIXO";
  return "OK";
}
export function scoreACOS(value, benchmark) {
  if (!benchmark || benchmark <= 0) return value > 35 ? "CRÍTICO" : value > 25 ? "ATENÇÃO" : "OK";
  const ratio = value / benchmark;
  if (ratio > 1.3) return "CRÍTICO";
  if (ratio > 1.05) return "ATENÇÃO";
  return "OK";
}
export function scoreTACOS(value) {
  if (value > 15) return "ALTO";
  if (value > 8) return "ATENÇÃO";
  return "SAUDÁVEL";
}
export function scoreOps({ buybox, stock, fulfillment }) {
  if (buybox === "Não tenho" || stock === "Zerado") return "CRÍTICO";
  if (buybox === "Disputada" || stock === "Baixo" || fulfillment === "FBM") return "ATENÇÃO";
  return "OK";
}
export function identificarCausaRaizC1(scores, data) {
  if (data.buybox === "Não tenho") return "Operação: BuyBox perdida";
  if (data.stock === "Zerado") return "Operação: estoque zerado";
  if (scores.ctr === "CRÍTICO" && scores.cvr !== "CRÍTICO") return "Atração";
  if (scores.cvr === "CRÍTICO" && scores.ctr !== "CRÍTICO") return "Conversão";
  if (scores.ctr === "CRÍTICO" && scores.cvr === "CRÍTICO") return "Oferta e posicionamento";
  if (scores.acos === "CRÍTICO") return "Rentabilidade de mídia";
  if (scores.tacos === "ALTO") return "Dependência de mídia paga";
  return "Escala e otimização";
}
export function gerarDiagnosticoBaseC1(data, benchmark) {
  const scores = {
    ctr: scoreCTR(data.ctr, benchmark.ctr),
    cvr: scoreCVR(data.cvr, benchmark.cvr),
    acos: scoreACOS(data.acos, benchmark.acos),
    tacos: scoreTACOS(data.tacos),
    ops: scoreOps(data)
  };
  const rootCause = identificarCausaRaizC1(scores, data);
  return { scores, root_cause: rootCause, summary: `Diagnóstico gerado pela lógica Nexora. A causa raiz provável é: ${rootCause}.`, priorities: buildPriorities(scores) };
}
function buildPriorities(scores) {
  const list = [];
  if (scores.ops === "CRÍTICO") list.push("Corrigir operação antes de escalar tráfego.");
  if (scores.ctr === "CRÍTICO") list.push("Revisar imagem principal, título e atratividade no resultado de busca.");
  if (scores.cvr === "CRÍTICO") list.push("Revisar página, oferta, prova social e percepção de valor.");
  if (scores.acos === "CRÍTICO") list.push("Controlar mídia antes de aumentar investimento.");
  if (scores.tacos === "ALTO") list.push("Reduzir dependência de anúncios trabalhando SEO e conversão orgânica.");
  return list.length ? list.slice(0, 4) : ["Métricas dentro de padrão aceitável. Avaliar oportunidades de escala."];
}

