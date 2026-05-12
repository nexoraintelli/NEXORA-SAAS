// js/nexoraNextActionEngine.js

export function gerarProximaMelhorAcaoNexora({
  c1 = {},
  c2 = {},
  c3 = {},
  systemsAnalysis = {},
  alerts = [],
  synthesis = {}
} = {}) {
  const normalizedAlerts = Array.isArray(alerts) ? alerts : [];

  const criticalAlerts = normalizedAlerts.filter(alert => alert.level === "Crítico");
  const warningAlerts = normalizedAlerts.filter(alert => alert.level === "Atenção");

  const mostCriticalSystem =
    systemsAnalysis?.mostCriticalSystem ||
    getMostCriticalSystemFromList(systemsAnalysis?.systemsList) ||
    null;

  const rootCause =
    synthesis?.causa_raiz_consolidada ||
    synthesis?.causa_raiz ||
    synthesis?.diagnostico_principal ||
    "";

  const context = {
    c1,
    c2,
    c3,
    systemsAnalysis,
    alerts: normalizedAlerts,
    criticalAlerts,
    warningAlerts,
    mostCriticalSystem,
    rootCause
  };

  const action =
    actionByCriticalSystem(context) ||
    actionByCriticalAlert(context) ||
    actionByScores(context) ||
    fallbackAction(context);

  return {
    ...action,
    source: {
      primary_system: getSystemLabel(mostCriticalSystem),
      critical_alerts: criticalAlerts.map(alert => alert.title).slice(0, 5),
      root_cause: rootCause || null
    }
  };
}

/* =========================
   DECISÃO POR SISTEMA CRÍTICO
========================= */

function actionByCriticalSystem(context) {
  const system = context.mostCriticalSystem;
  const key = normalize(system?.key || system?.name || system?.label);

  if (!system) return null;

  if (key.includes("unit") || key.includes("economics") || key.includes("economia")) {
    return {
      title: "Validar rentabilidade antes de escalar o produto",
      priority_area: "Unit Economics",
      timeframe: "7 dias",
      reason:
        system.reason ||
        "A leitura sistêmica indica risco econômico. Crescimento sem margem pode aumentar receita enquanto reduz lucro.",
      action:
        "Recalcule margem, break-even ACOS, taxas, CPC e preço mínimo saudável antes de aumentar investimento em PPC ou promoções.",
      expected_result:
        "Entender se o produto pode crescer de forma sustentável ou se precisa de ajuste de preço, custo ou mídia antes da escala."
    };
  }

  if (key.includes("market") || key.includes("forces") || key.includes("forca") || key.includes("força")) {
    return {
      title: "Reavaliar a força dominante do mercado antes de insistir na escala",
      priority_area: "Market Forces",
      timeframe: "7 dias",
      reason:
        system.reason ||
        "O mercado pode estar sendo dominado por preço, reviews, marca ou diferenciação, e o produto precisa jogar a competição correta.",
      action:
        "Compare o produto com os principais concorrentes e ajuste o posicionamento de acordo com a força dominante: preço, reviews, marca ou diferenciação.",
      expected_result:
        "Evitar otimizações aleatórias e alinhar a oferta à dinâmica real de compra da categoria."
    };
  }

  if (key.includes("category") || key.includes("competition") || key.includes("competicao") || key.includes("competição")) {
    return {
      title: "Corrigir o posicionamento competitivo antes de aumentar exposição",
      priority_area: "Category Competition",
      timeframe: "7 a 14 dias",
      reason:
        system.reason ||
        "O produto pode estar competindo contra players com vantagem de preço, reviews, autoridade ou proposta mais clara.",
      action:
        "Mapeie preço relativo, barreira de reviews, densidade competitiva e quadrante do produto. Ajuste oferta, preço ou diferenciação antes de ampliar tráfego.",
      expected_result:
        "Reduzir desalinhamento competitivo e aumentar a chance de conversão dentro da realidade da categoria."
    };
  }

  if (key.includes("algorithm") || key.includes("algoritmo") || key.includes("amazon")) {
    return {
      title: "Melhorar sinais de conversão antes de buscar mais ranking",
      priority_area: "Amazon Algorithm",
      timeframe: "7 dias",
      reason:
        system.reason ||
        "A Amazon tende a favorecer produtos com maior probabilidade de compra. Se CTR, CVR ou sales velocity estão fracos, o algoritmo pode reduzir entrega.",
      action:
        "Priorize CTR, CVR, relevância do título, indexação, oferta e consistência de vendas antes de tentar ganhar mais visibilidade orgânica.",
      expected_result:
        "Fortalecer os sinais que ajudam o produto a receber mais entrega e melhorar sua eficiência no funil Amazon."
    };
  }

  if (key.includes("operation") || key.includes("operational") || key.includes("operacao") || key.includes("operação")) {
    return {
      title: "Resolver travas operacionais antes de investir em aquisição",
      priority_area: "Operational Structure",
      timeframe: "Imediato",
      reason:
        system.reason ||
        "Mesmo um produto com boa página pode travar se houver problema de estoque, Buy Box, fulfillment, prazo ou disponibilidade.",
      action:
        "Verifique Buy Box, estoque, fulfillment, Prime/FBA, prazo de entrega e estabilidade operacional antes de aumentar tráfego ou campanhas.",
      expected_result:
        "Evitar desperdício de mídia em um produto que não consegue sustentar compra por limitações operacionais."
    };
  }

  return null;
}

/* =========================
   DECISÃO POR ALERTA CRÍTICO
========================= */

function actionByCriticalAlert(context) {
  const alerts = context.criticalAlerts || [];
  if (!alerts.length) return null;

  const titles = alerts.map(alert => normalize(`${alert.area} ${alert.title}`));

  if (titles.some(text => text.includes("cvr") || text.includes("conversao") || text.includes("conversão"))) {
    return {
      title: "Corrigir conversão antes de aumentar tráfego",
      priority_area: "Conversão",
      timeframe: "7 dias",
      reason:
        "Há alerta crítico de conversão. O produto pode estar recebendo cliques, mas não está transformando tráfego em vendas com eficiência suficiente.",
      action:
        "Revise proposta de valor, imagem principal, imagens secundárias, prova social, objeções, diferenciação e coerência entre preço e benefício antes de aumentar PPC.",
      expected_result:
        "Aumentar a capacidade da página de converter o tráfego existente antes de comprar mais tráfego."
    };
  }

  if (titles.some(text => text.includes("ctr") || text.includes("atracao") || text.includes("atração"))) {
    return {
      title: "Aumentar atratividade antes de buscar mais impressões",
      priority_area: "Atração",
      timeframe: "7 dias",
      reason:
        "Há alerta de atração. O produto pode estar aparecendo, mas não está gerando clique suficiente para alimentar o funil.",
      action:
        "Revisar imagem principal, título, preço percebido, contraste visual e benefício visível na busca antes de ampliar campanhas.",
      expected_result:
        "Melhorar a taxa de clique e reduzir desperdício de exposição."
    };
  }

  if (titles.some(text => text.includes("acos") || text.includes("margem") || text.includes("economics"))) {
    return {
      title: "Proteger margem antes de escalar mídia",
      priority_area: "Unit Economics",
      timeframe: "Imediato",
      reason:
        "Há alerta crítico econômico. O produto pode estar vendendo com baixa eficiência ou até prejuízo após mídia.",
      action:
        "Calcule break-even ACOS, margem pós-taxas, CPC médio e limite de investimento antes de aumentar orçamento.",
      expected_result:
        "Evitar crescimento sem lucro e criar uma régua clara para decisões de PPC."
    };
  }

  if (titles.some(text => text.includes("buy box") || text.includes("estoque") || text.includes("operational"))) {
    return {
      title: "Corrigir operação antes de otimizar marketing",
      priority_area: "Operational Structure",
      timeframe: "Imediato",
      reason:
        "Há alerta operacional crítico. Problemas de estoque, Buy Box ou fulfillment podem impedir que a performance melhore mesmo com boa página.",
      action:
        "Resolver disponibilidade, Buy Box, estoque, fulfillment e prazo de entrega antes de aumentar mídia ou alterar estratégia de conteúdo.",
      expected_result:
        "Garantir que o produto esteja apto a converter antes de receber mais tráfego."
    };
  }

  return null;
}

/* =========================
   DECISÃO POR SCORES
========================= */

function actionByScores(context) {
  const c1Score = toNumber(context.c1.score_geral || context.c1.score_final || context.c1.performance_score);
  const c2Score = toNumber(context.c2.score_pagina || context.c2.listing_quality_score);
  const c3Score = toNumber(context.c3.score_mercado || context.c3.market_position_score);

  const scores = [
    { area: "Performance", score: c1Score },
    { area: "Página", score: c2Score },
    { area: "Mercado", score: c3Score }
  ].filter(item => item.score > 0);

  if (!scores.length) return null;

  const weakest = scores.sort((a, b) => a.score - b.score)[0];

  if (weakest.area === "Página") {
    return {
      title: "Fortalecer a página antes de escalar o produto",
      priority_area: "Listing Quality",
      timeframe: "7 dias",
      reason:
        `O Cérebro 2 apresenta o score mais baixo (${weakest.score}/100), indicando que a página pode estar limitando clique, confiança ou conversão.`,
      action:
        "Revisar imagem principal, clareza da oferta, diferenciação, prova social, objeções e argumentos de valor.",
      expected_result:
        "Aumentar a capacidade da página de sustentar compra antes de ampliar tráfego."
    };
  }

  if (weakest.area === "Mercado") {
    return {
      title: "Revisar posicionamento competitivo antes de investir mais",
      priority_area: "Market Position",
      timeframe: "7 a 14 dias",
      reason:
        `O Cérebro 3 apresenta o score mais baixo (${weakest.score}/100), indicando possível desalinhamento com a dinâmica da categoria.`,
      action:
        "Comparar preço, reviews, promessa, visual e força dominante dos concorrentes. Ajustar quadrante competitivo antes de buscar escala.",
      expected_result:
        "Competir na guerra correta e evitar desperdício de mídia em um posicionamento frágil."
    };
  }

  if (weakest.area === "Performance") {
    return {
      title: "Corrigir o gargalo de performance antes de avançar",
      priority_area: "Performance",
      timeframe: "7 dias",
      reason:
        `O Cérebro 1 apresenta o score mais baixo (${weakest.score}/100), indicando fragilidade nas métricas principais do funil.`,
      action:
        "Identificar se o bloqueio está em CTR, CVR, ACOS, TACOS, margem, estoque ou Buy Box e corrigir o pilar mais crítico.",
      expected_result:
        "Melhorar o fundamento da performance antes de investir em expansão."
    };
  }

  return null;
}

/* =========================
   FALLBACK
========================= */

function fallbackAction(context) {
  return {
    title: "Priorizar a causa raiz antes de escalar o produto",
    priority_area: "Estratégia",
    timeframe: "7 dias",
    reason:
      context.rootCause ||
      "A Nexora identificou que o produto precisa corrigir o bloqueio principal antes de aumentar mídia, preço ou expansão.",
    action:
      "Use a causa raiz consolidada, os alertas e os 5 Sistemas para corrigir o principal gargalo antes de ampliar investimento.",
    expected_result:
      "Evitar ações soltas e direcionar o seller para a primeira correção com maior impacto provável."
  };
}

/* =========================
   HELPERS
========================= */

function getMostCriticalSystemFromList(systemsList) {
  if (!Array.isArray(systemsList) || !systemsList.length) return null;

  const critical = systemsList.find(system => system.status === "Crítico");
  if (critical) return critical;

  return [...systemsList].sort((a, b) => toNumber(a.score) - toNumber(b.score))[0] || null;
}

function getSystemLabel(system) {
  if (!system) return null;
  return system.label || system.name || system.key || null;
}

function toNumber(value) {
  if (value === undefined || value === null || value === "") return 0;

  const number = Number(String(value).replace("%", "").replace(",", "."));

  return Number.isFinite(number) ? number : 0;
}

function normalize(value) {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
