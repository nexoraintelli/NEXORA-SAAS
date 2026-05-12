// js/nexoraComparisonEngine.js

export function compararDiagnosticosNexora({
  current = {},
  previous = {}
} = {}) {
  if (!current || !previous) {
    return buildEmptyComparison();
  }

  const currentData = normalizeDiagnosticPayload(current);
  const previousData = normalizeDiagnosticPayload(previous);

  const metrics = [
    compareMetric({
      key: "product_health_score",
      label: "Product Health Score",
      previous: previousData.productHealthScore,
      current: currentData.productHealthScore,
      type: "score",
      higherIsBetter: true
    }),
    compareMetric({
      key: "performance_score",
      label: "Performance Score",
      previous: previousData.performanceScore,
      current: currentData.performanceScore,
      type: "score",
      higherIsBetter: true
    }),
    compareMetric({
      key: "listing_quality_score",
      label: "Listing Quality Score",
      previous: previousData.listingQualityScore,
      current: currentData.listingQualityScore,
      type: "score",
      higherIsBetter: true
    }),
    compareMetric({
      key: "market_position_score",
      label: "Market Position Score",
      previous: previousData.marketPositionScore,
      current: currentData.marketPositionScore,
      type: "score",
      higherIsBetter: true
    }),
    compareMetric({
      key: "ctr",
      label: "CTR",
      previous: previousData.ctr,
      current: currentData.ctr,
      type: "percent",
      higherIsBetter: true
    }),
    compareMetric({
      key: "cvr",
      label: "CVR",
      previous: previousData.cvr,
      current: currentData.cvr,
      type: "percent",
      higherIsBetter: true
    }),
    compareMetric({
      key: "acos",
      label: "ACOS",
      previous: previousData.acos,
      current: currentData.acos,
      type: "percent",
      higherIsBetter: false
    }),
    compareMetric({
      key: "tacos",
      label: "TACOS",
      previous: previousData.tacos,
      current: currentData.tacos,
      type: "percent",
      higherIsBetter: false
    }),
    compareMetric({
      key: "reviews",
      label: "Reviews",
      previous: previousData.reviews,
      current: currentData.reviews,
      type: "number",
      higherIsBetter: true
    }),
    compareMetric({
      key: "rating",
      label: "Rating",
      previous: previousData.rating,
      current: currentData.rating,
      type: "rating",
      higherIsBetter: true
    })
  ].filter(Boolean);

  const status = getOverallStatus(metrics);
  const summary = buildSummary(status, metrics);
  const recommendation = buildRecommendation(status, metrics, currentData, previousData);

  return {
    status,
    summary,
    recommendation,
    metrics,
    current_snapshot: currentData,
    previous_snapshot: previousData,
    compared_at: new Date().toISOString()
  };
}

/* =========================
   NORMALIZAÇÃO
========================= */

function normalizeDiagnosticPayload(input = {}) {
  const result =
    input.result_data ||
    input.result ||
    input.synth ||
    input.synthesis ||
    input;

  const source = result.source || {};

  const c1 =
    source.c1 ||
    result.c1 ||
    result.performance ||
    result.brain_1 ||
    {};

  const c2 =
    source.c2 ||
    result.c2 ||
    result.page ||
    result.listing ||
    result.brain_2 ||
    {};

  const c3 =
    source.c3 ||
    result.c3 ||
    result.market ||
    result.brain_3 ||
    {};

  const scores = result.scores || {};

  return {
    productHealthScore: toNumber(
      result.score_final ||
      result.product_health_score ||
      result.score ||
      input.final_score ||
      input.score_final ||
      input.score
    ),

    performanceScore: toNumber(
      scores.performance ||
      c1.score_geral ||
      c1.score_final ||
      c1.performance_score ||
      result.performance_score
    ),

    listingQualityScore: toNumber(
      scores.pagina ||
      c2.score_pagina ||
      c2.listing_quality_score ||
      result.listing_quality_score
    ),

    marketPositionScore: toNumber(
      scores.mercado ||
      c3.score_mercado ||
      c3.market_position_score ||
      result.market_position_score
    ),

    ctr: toNumber(c1.ctr || result.ctr),
    cvr: toNumber(c1.cvr || result.cvr),
    acos: toNumber(c1.acos || result.acos),
    tacos: toNumber(c1.tacos || result.tacos),

    reviews: toNumber(
      c1.reviews ||
      c1.rev ||
      result.reviews ||
      result.current_reviews
    ),

    rating: toNumber(
      c1.rating ||
      result.rating ||
      result.current_rating
    ),

    rootCause:
      result.causa_raiz_consolidada ||
      result.causa_raiz ||
      c1.root_cause ||
      c2.problema_principal ||
      c3.problema_principal ||
      "",

    nextBestAction:
      result.next_best_action ||
      result.nextBestAction ||
      null,

    createdAt:
      input.created_at ||
      result.created_at ||
      result.ts ||
      null
  };
}

/* =========================
   COMPARAÇÃO
========================= */

function compareMetric({
  key,
  label,
  previous,
  current,
  type = "number",
  higherIsBetter = true
}) {
  const prev = toNumber(previous);
  const curr = toNumber(current);

  if (!isValidNumber(prev) && !isValidNumber(curr)) return null;

  const hasPrevious = isValidNumber(prev) && prev > 0;
  const hasCurrent = isValidNumber(curr) && curr > 0;

  if (!hasPrevious && !hasCurrent) return null;

  const delta = hasCurrent && hasPrevious ? curr - prev : null;
  const absDelta = delta === null ? null : Math.abs(delta);

  const stabilityThreshold = getStabilityThreshold(type);

  let direction = "stable";
  let status = "Estável";

  if (delta === null) {
    direction = "unknown";
    status = "Sem base anterior";
  } else if (absDelta <= stabilityThreshold) {
    direction = "stable";
    status = "Estável";
  } else {
    const improved = higherIsBetter ? delta > 0 : delta < 0;
    direction = improved ? "up" : "down";
    status = improved ? "Melhorou" : "Piorou";
  }

  return {
    key,
    label,
    previous: formatValue(prev, type),
    current: formatValue(curr, type),
    delta: delta === null ? "-" : formatDelta(delta, type),
    raw_previous: prev,
    raw_current: curr,
    raw_delta: delta,
    direction,
    status,
    interpretation: interpretMetric(label, status, delta, type, higherIsBetter)
  };
}

function getOverallStatus(metrics = []) {
  const valid = metrics.filter(metric => metric.direction !== "unknown");

  if (!valid.length) return "Sem comparação";

  const improved = valid.filter(metric => metric.status === "Melhorou").length;
  const worsened = valid.filter(metric => metric.status === "Piorou").length;
  const stable = valid.filter(metric => metric.status === "Estável").length;

  const criticalWorsened = valid.some(metric =>
    ["Product Health Score", "CVR", "ACOS", "TACOS"].includes(metric.label) &&
    metric.status === "Piorou"
  );

  if (worsened > improved || criticalWorsened) return "Piorou";
  if (improved > worsened && improved >= stable) return "Melhorou";
  if (improved > worsened) return "Melhorou parcialmente";
  return "Estável";
}

/* =========================
   LEITURA E RECOMENDAÇÃO
========================= */

function buildSummary(status, metrics = []) {
  const improved = metrics.filter(metric => metric.status === "Melhorou");
  const worsened = metrics.filter(metric => metric.status === "Piorou");
  const stable = metrics.filter(metric => metric.status === "Estável");

  const improvedLabels = improved.map(metric => metric.label).slice(0, 3).join(", ");
  const worsenedLabels = worsened.map(metric => metric.label).slice(0, 3).join(", ");

  if (status === "Melhorou") {
    return `O produto apresentou evolução em relação ao diagnóstico anterior, principalmente em ${improvedLabels || "indicadores centrais"}. A leitura sugere avanço, mas ainda exige monitoramento dos pontos que permaneceram estáveis ou frágeis.`;
  }

  if (status === "Piorou") {
    return `O produto piorou em relação ao diagnóstico anterior, com queda ou pressão em ${worsenedLabels || "indicadores relevantes"}. A prioridade deve ser entender se a piora veio de conversão, mídia, mercado ou estrutura operacional.`;
  }

  if (status === "Melhorou parcialmente") {
    return `O produto apresentou melhora parcial: alguns indicadores evoluíram, especialmente ${improvedLabels || "parte do funil"}, mas ainda existem pioras em ${worsenedLabels || "pontos importantes"}.`;
  }

  if (status === "Sem comparação") {
    return "Ainda não há base suficiente para comparar este produto com um diagnóstico anterior.";
  }

  return `O produto permaneceu relativamente estável em relação ao diagnóstico anterior. Foram identificados ${stable.length} indicador(es) sem variação relevante.`;
}

function buildRecommendation(status, metrics = [], currentData = {}, previousData = {}) {
  const worsened = metrics.filter(metric => metric.status === "Piorou");
  const improved = metrics.filter(metric => metric.status === "Melhorou");

  const cvrWorse = worsened.some(metric => metric.key === "cvr");
  const ctrWorse = worsened.some(metric => metric.key === "ctr");
  const acosWorse = worsened.some(metric => metric.key === "acos");
  const tacosWorse = worsened.some(metric => metric.key === "tacos");
  const scoreWorse = worsened.some(metric => metric.key === "product_health_score");

  const ctrImproved = improved.some(metric => metric.key === "ctr");
  const cvrImproved = improved.some(metric => metric.key === "cvr");

  if (cvrWorse) {
    return "Priorizar correção de conversão antes de aumentar tráfego. A queda de CVR indica que o produto pode estar recebendo visitas, mas perdeu força para transformar interesse em compra.";
  }

  if (ctrWorse) {
    return "Revisar imagem principal, título, preço percebido e atratividade na busca. A queda de CTR indica perda de força na entrada do funil.";
  }

  if (acosWorse || tacosWorse) {
    return "Revisar eficiência de mídia e rentabilidade antes de escalar. A piora de ACOS ou TACOS indica maior pressão sobre margem e dependência de tráfego pago.";
  }

  if (scoreWorse) {
    return "Reabrir a causa raiz consolidada e comparar os alertas atuais com o diagnóstico anterior. A queda no Product Health Score indica piora sistêmica.";
  }

  if (ctrImproved && !cvrImproved) {
    return "A atração melhorou, mas a conversão ainda precisa ser validada. O próximo foco deve ser página, proposta de valor, prova social e confiança.";
  }

  if (status === "Melhorou") {
    return "Manter as correções aplicadas e monitorar se a evolução se sustenta nos próximos 7 a 30 dias antes de escalar agressivamente.";
  }

  if (status === "Estável") {
    return "Como o produto ficou estável, a recomendação é testar uma mudança controlada no principal gargalo identificado pela Síntese e medir a resposta no próximo diagnóstico.";
  }

  return currentData.rootCause
    ? `Priorizar a causa raiz atual: ${currentData.rootCause}. A comparação deve orientar a próxima rodada de ação com base no que mudou desde o diagnóstico anterior.`
    : "Usar a comparação para identificar o indicador que mais mudou e priorizar a próxima rodada de otimização.";
}

/* =========================
   FORMATAÇÃO
========================= */

function interpretMetric(label, status, delta, type, higherIsBetter) {
  if (status === "Sem base anterior") {
    return `${label} sem base anterior suficiente para comparação.`;
  }

  if (status === "Estável") {
    return `${label} permaneceu relativamente estável.`;
  }

  if (status === "Melhorou") {
    return higherIsBetter
      ? `${label} evoluiu em relação ao diagnóstico anterior.`
      : `${label} reduziu, o que indica melhora para este indicador.`;
  }

  if (status === "Piorou") {
    return higherIsBetter
      ? `${label} caiu em relação ao diagnóstico anterior.`
      : `${label} aumentou, o que indica piora para este indicador.`;
  }

  return `${label} comparado ao diagnóstico anterior.`;
}

function getStabilityThreshold(type) {
  if (type === "score") return 2;
  if (type === "percent") return 0.1;
  if (type === "rating") return 0.05;
  return 0;
}

function formatValue(value, type) {
  if (!isValidNumber(value)) return "-";

  if (type === "percent") return `${formatNumber(value)}%`;
  if (type === "score") return `${Math.round(value)}/100`;
  if (type === "rating") return formatNumber(value, 1);

  return formatNumber(value, 0);
}

function formatDelta(value, type) {
  if (!isValidNumber(value)) return "-";

  const sign = value > 0 ? "+" : "";

  if (type === "percent") return `${sign}${formatNumber(value)} p.p.`;
  if (type === "score") return `${sign}${Math.round(value)} pts`;
  if (type === "rating") return `${sign}${formatNumber(value, 1)}`;

  return `${sign}${formatNumber(value, 0)}`;
}

function formatNumber(value, decimals = 2) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "-";

  const fixed = Number.isInteger(number)
    ? String(number)
    : number.toFixed(decimals);

  return fixed.replace(".", ",");
}

function toNumber(value) {
  if (value === undefined || value === null || value === "") return 0;

  const number = Number(String(value).replace("%", "").replace(",", "."));

  return Number.isFinite(number) ? number : 0;
}

function isValidNumber(value) {
  return Number.isFinite(Number(value));
}

function buildEmptyComparison() {
  return {
    status: "Sem comparação",
    summary: "Ainda não há diagnóstico anterior suficiente para comparar evolução.",
    recommendation: "Gere pelo menos dois diagnósticos completos para este produto para acompanhar evolução.",
    metrics: [],
    current_snapshot: {},
    previous_snapshot: {},
    compared_at: new Date().toISOString()
  };
}
