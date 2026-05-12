// js/nexoraSynthesisStructureEngine.js

export function estruturarSinteseNexora({
  c1 = {},
  c2 = {},
  c3 = {},
  systemsAnalysis = {},
  alerts = [],
  nextBestAction = {},
  synthesis = {}
} = {}) {
  const normalizedAlerts = Array.isArray(alerts) ? alerts : [];

  const criticalAlerts = normalizedAlerts.filter(alert => alert.level === "Crítico");
  const warningAlerts = normalizedAlerts.filter(alert => alert.level === "Atenção");

  const mostCriticalSystem =
    systemsAnalysis?.mostCriticalSystem ||
    getMostCriticalSystemFromList(systemsAnalysis?.systemsList) ||
    null;

  const secondarySystem =
    systemsAnalysis?.secondarySystem ||
    getSecondarySystemFromList(systemsAnalysis?.systemsList, mostCriticalSystem) ||
    null;

  const mainDiagnosis = gerarDiagnosticoPrincipal({
    c1,
    c2,
    c3,
    synthesis,
    mostCriticalSystem,
    criticalAlerts
  });

  const rootCause = gerarCausaRaiz({
    c1,
    c2,
    c3,
    synthesis,
    mostCriticalSystem,
    criticalAlerts
  });

  const evidences = gerarEvidencias({
    c1,
    c2,
    c3,
    systemsAnalysis,
    alerts: normalizedAlerts,
    mostCriticalSystem,
    secondarySystem
  });

  const strategicRisk = gerarRiscoEstrategico({
    rootCause,
    mostCriticalSystem,
    secondarySystem,
    criticalAlerts,
    synthesis
  });

  const commercialImpact = gerarImpactoComercial({
    c1,
    c2,
    c3,
    rootCause,
    criticalAlerts,
    warningAlerts
  });

  const sevenDayPlan = gerarPlano7Dias({
    nextBestAction,
    rootCause,
    criticalAlerts,
    mostCriticalSystem
  });

  const thirtyDayPlan = gerarPlano30Dias({
    nextBestAction,
    rootCause,
    mostCriticalSystem,
    secondarySystem,
    c1,
    c2,
    c3
  });

  return {
    diagnostico_principal: mainDiagnosis,
    causa_raiz: rootCause,
    evidencias: evidences,
    risco_estrategico: strategicRisk,
    impacto_comercial: commercialImpact,
    proxima_melhor_acao: normalizeNextAction(nextBestAction),
    plano_7_dias: sevenDayPlan,
    plano_30_dias: thirtyDayPlan,
    leitura_sistemica: {
      sistema_mais_critico: getSystemLabel(mostCriticalSystem),
      sistema_secundario: getSystemLabel(secondarySystem),
      leitura:
        systemsAnalysis?.strategicReading ||
        "A Nexora cruzou performance, página e mercado para identificar o sistema que mais limita a performance atual do produto."
    },
    resumo_operacional: gerarResumoOperacional({
      c1,
      c2,
      c3,
      synthesis,
      criticalAlerts,
      warningAlerts
    })
  };
}

/* =========================
   DIAGNÓSTICO PRINCIPAL
========================= */

function gerarDiagnosticoPrincipal({
  c1,
  c2,
  c3,
  synthesis,
  mostCriticalSystem,
  criticalAlerts
}) {
  const fromSynthesis =
    clean(synthesis?.diagnostico_principal) ||
    clean(synthesis?.diagnostico_executivo) ||
    "";

  if (fromSynthesis && fromSynthesis.length < 260) {
    return fromSynthesis;
  }

  const criticalArea = criticalAlerts?.[0]?.area || "";
  const systemLabel = getSystemLabel(mostCriticalSystem);

  if (criticalArea) {
    return `O produto apresenta um bloqueio principal em ${criticalArea}, com impacto direto na capacidade de transformar exposição em crescimento sustentável.`;
  }

  if (systemLabel) {
    return `O principal bloqueio do produto está conectado ao sistema ${systemLabel}, indicando que a performance não deve ser analisada apenas por métrica isolada.`;
  }

  const weakest = getWeakestBrain(c1, c2, c3);

  if (weakest) {
    return `A leitura consolidada indica que o ponto mais frágil está em ${weakest.label}, exigindo correção antes de ampliar investimento ou buscar escala.`;
  }

  return "A Síntese identificou que o produto precisa corrigir o principal gargalo estrutural antes de avançar para escala, expansão ou aumento de mídia.";
}

/* =========================
   CAUSA RAIZ
========================= */

function gerarCausaRaiz({
  c1,
  c2,
  c3,
  synthesis,
  mostCriticalSystem,
  criticalAlerts
}) {
  const direct =
    clean(synthesis?.causa_raiz_consolidada) ||
    clean(synthesis?.causa_raiz) ||
    clean(c1?.root_cause) ||
    clean(c2?.problema_principal) ||
    clean(c3?.problema_principal);

  if (direct) return direct;

  const systemLabel = getSystemLabel(mostCriticalSystem);
  const alertTitle = criticalAlerts?.[0]?.title;

  if (alertTitle && systemLabel) {
    return `${alertTitle} conectado ao sistema ${systemLabel}.`;
  }

  if (alertTitle) {
    return alertTitle;
  }

  if (systemLabel) {
    return `O sistema ${systemLabel} concentra o principal bloqueio do produto.`;
  }

  return "A causa raiz está na combinação entre performance, página, mercado e estrutura competitiva, exigindo correção antes de escalar.";
}

/* =========================
   EVIDÊNCIAS
========================= */

function gerarEvidencias({
  c1,
  c2,
  c3,
  systemsAnalysis,
  alerts,
  mostCriticalSystem,
  secondarySystem
}) {
  const evidences = [];

  addEvidence(evidences, "Performance", gerarEvidenciaPerformance(c1));
  addEvidence(evidences, "Página", gerarEvidenciaPagina(c2));
  addEvidence(evidences, "Mercado", gerarEvidenciaMercado(c3));

  if (mostCriticalSystem) {
    addEvidence(
      evidences,
      "5 Sistemas",
      `${getSystemLabel(mostCriticalSystem)} foi identificado como sistema mais crítico. ${mostCriticalSystem.reason || ""}`
    );
  }

  if (secondarySystem) {
    addEvidence(
      evidences,
      "Sistema secundário",
      `${getSystemLabel(secondarySystem)} aparece como influência secundária. ${secondarySystem.reason || ""}`
    );
  }

  const criticalAlerts = Array.isArray(alerts)
    ? alerts.filter(alert => alert.level === "Crítico").slice(0, 3)
    : [];

  criticalAlerts.forEach(alert => {
    addEvidence(
      evidences,
      alert.area || "Alerta crítico",
      `${alert.title || "Alerta crítico"}: ${alert.evidence || alert.impact || ""}`
    );
  });

  const strategicReading = systemsAnalysis?.strategicReading;
  if (strategicReading) {
    addEvidence(evidences, "Leitura sistêmica", strategicReading);
  }

  return evidences.slice(0, 8);
}

function gerarEvidenciaPerformance(c1) {
  const parts = [];

  const ctr = formatPercent(c1?.ctr);
  const cvr = formatPercent(c1?.cvr);
  const acos = formatPercent(c1?.acos);
  const tacos = formatPercent(c1?.tacos);

  if (ctr !== "-") parts.push(`CTR ${ctr}`);
  if (cvr !== "-") parts.push(`CVR ${cvr}`);
  if (acos !== "-") parts.push(`ACOS ${acos}`);
  if (tacos !== "-") parts.push(`TACOS ${tacos}`);

  const score = c1?.score_geral || c1?.score_final || c1?.performance_score;
  if (score) parts.push(`Performance Score ${score}/100`);

  return parts.length
    ? `Indicadores principais do Cérebro 1: ${parts.join(", ")}.`
    : "";
}

function gerarEvidenciaPagina(c2) {
  const parts = [];

  const score = c2?.score_pagina || c2?.listing_quality_score;
  if (score) parts.push(`Listing Quality Score ${score}/100`);

  if (c2?.problema_principal) parts.push(`problema principal: ${c2.problema_principal}`);
  if (c2?.gap_principal) parts.push(`gap principal: ${c2.gap_principal}`);

  return parts.length
    ? `Leitura do Cérebro 2: ${parts.join(", ")}.`
    : "";
}

function gerarEvidenciaMercado(c3) {
  const parts = [];

  const score = c3?.score_mercado || c3?.market_position_score;
  if (score) parts.push(`Market Position Score ${score}/100`);

  if (c3?.dinamica_mercado) parts.push(`dinâmica: ${c3.dinamica_mercado}`);
  if (c3?.problema_principal) parts.push(`problema: ${c3.problema_principal}`);
  if (c3?.forca_dominante || c3?.dominantForce) {
    parts.push(`força dominante: ${c3.forca_dominante || c3.dominantForce}`);
  }

  return parts.length
    ? `Leitura do Cérebro 3: ${parts.join(", ")}.`
    : "";
}

function addEvidence(list, source, text) {
  const cleanText = clean(text);
  if (!cleanText) return;

  list.push({
    origem: source,
    evidência: cleanText
  });
}

/* =========================
   RISCO E IMPACTO
========================= */

function gerarRiscoEstrategico({
  rootCause,
  mostCriticalSystem,
  secondarySystem,
  criticalAlerts,
  synthesis
}) {
  const existing =
    clean(synthesis?.risco_estrategico) ||
    clean(synthesis?.risco_ia) ||
    clean(synthesis?.risco_de_nao_corrigir);

  if (existing && existing.length > 120) return existing;

  const critical = getSystemLabel(mostCriticalSystem) || "sistema principal";
  const secondary = getSystemLabel(secondarySystem) || "sistema secundário";
  const alertText = criticalAlerts?.length
    ? ` Além disso, há ${criticalAlerts.length} alerta(s) crítico(s) indicando risco imediato.`
    : "";

  return `Se a causa raiz não for corrigida, o produto pode continuar consumindo tráfego sem gerar evolução proporcional em vendas, ranking ou rentabilidade. A leitura sistêmica indica que o bloqueio principal está em ${critical}, com influência de ${secondary}.${alertText} Escalar mídia, preço ou expansão sem corrigir esse ponto pode aumentar desperdício, reduzir margem e manter o produto preso ao mesmo gargalo.`;
}

function gerarImpactoComercial({
  c1,
  c2,
  c3,
  rootCause,
  criticalAlerts,
  warningAlerts
}) {
  const cvr = toNumber(c1?.cvr);
  const acos = toNumber(c1?.acos);
  const margin = toNumber(c1?.margin || c1?.mg);
  const pageScore = toNumber(c2?.score_pagina);
  const marketScore = toNumber(c3?.score_mercado);

  if (acos > 0 && margin > 0 && acos > margin) {
    return "O impacto comercial mais sensível é o risco de crescimento sem lucro: o produto pode gerar vendas, mas operar com margem pressionada ou prejuízo pós-mídia.";
  }

  if (cvr > 0 && cvr < 7) {
    return "O impacto comercial está na perda de eficiência do tráfego: o produto pode receber cliques, mas converter abaixo do necessário para sustentar mídia, ranking e crescimento orgânico.";
  }

  if (pageScore > 0 && pageScore < 55) {
    return "O impacto comercial está na baixa sustentação de valor percebido: a página pode limitar confiança, diferenciação e decisão de compra.";
  }

  if (marketScore > 0 && marketScore < 55) {
    return "O impacto comercial está no desalinhamento competitivo: o produto pode estar tentando competir em uma dinâmica de mercado desfavorável.";
  }

  if (criticalAlerts.length || warningAlerts.length) {
    return `O impacto comercial está concentrado nos sinais de risco detectados pela Nexora: ${criticalAlerts.length} crítico(s) e ${warningAlerts.length} de atenção.`;
  }

  return `O impacto comercial está ligado à causa raiz identificada: ${rootCause}. A prioridade é corrigir esse bloqueio para aumentar previsibilidade de crescimento.`;
}

/* =========================
   PLANOS
========================= */

function gerarPlano7Dias({
  nextBestAction,
  rootCause,
  criticalAlerts,
  mostCriticalSystem
}) {
  const action = normalizeNextAction(nextBestAction);
  const systemLabel = getSystemLabel(mostCriticalSystem) || "sistema crítico";

  return [
    {
      dia: "Dia 1",
      titulo: "Confirmar a causa raiz e alinhar prioridade",
      descricao: `Validar se ${rootCause} é o bloqueio mais importante do produto e confirmar se a primeira ação deve focar ${action.priority_area || systemLabel}.`
    },
    {
      dia: "Dias 2-3",
      titulo: "Corrigir o primeiro gargalo",
      descricao: action.action || "Executar a ação prioritária indicada pela Nexora antes de ampliar investimento ou tráfego."
    },
    {
      dia: "Dias 4-5",
      titulo: "Ajustar evidências e sinais críticos",
      descricao: criticalAlerts.length
        ? `Atacar os principais alertas críticos: ${criticalAlerts.map(alert => alert.title).slice(0, 3).join(", ")}.`
        : "Revisar os sinais de performance, página e mercado que sustentam a causa raiz."
    },
    {
      dia: "Dias 6-7",
      titulo: "Monitorar impacto inicial",
      descricao: "Acompanhar CTR, CVR, ACOS, TACOS, reviews, rating e comportamento de conversão para validar se a correção começou a reduzir o gargalo."
    }
  ];
}

function gerarPlano30Dias({
  nextBestAction,
  rootCause,
  mostCriticalSystem,
  secondarySystem,
  c1,
  c2,
  c3
}) {
  const action = normalizeNextAction(nextBestAction);
  const critical = getSystemLabel(mostCriticalSystem) || "sistema principal";
  const secondary = getSystemLabel(secondarySystem) || "sistema secundário";

  return [
    {
      periodo: "Semana 1",
      titulo: "Corrigir o bloqueio principal",
      descricao: action.action || `Corrigir ${rootCause} antes de ampliar investimento em mídia ou expansão.`
    },
    {
      periodo: "Semana 2",
      titulo: "Reforçar o sistema secundário",
      descricao: `Atuar no sistema ${secondary}, que influencia a performance mesmo não sendo o bloqueio principal.`
    },
    {
      periodo: "Semana 3",
      titulo: "Validar resposta do funil",
      descricao: "Comparar evolução de CTR, CVR, ACOS, TACOS e scores para entender se o produto respondeu positivamente às correções."
    },
    {
      periodo: "Semana 4",
      titulo: "Decidir escala, reposicionamento ou nova rodada de ajustes",
      descricao: `Com base na evolução do funil e do sistema ${critical}, decidir se o produto está pronto para escalar com controle ou se precisa de reposicionamento adicional.`
    }
  ];
}

/* =========================
   RESUMO OPERACIONAL
========================= */

function gerarResumoOperacional({
  c1,
  c2,
  c3,
  synthesis,
  criticalAlerts,
  warningAlerts
}) {
  const score =
    synthesis?.score_final ||
    synthesis?.product_health_score ||
    "-";

  const root =
    synthesis?.causa_raiz_consolidada ||
    synthesis?.causa_raiz ||
    c1?.root_cause ||
    c2?.problema_principal ||
    c3?.problema_principal ||
    "causa raiz não identificada";

  return {
    product_health_score: score,
    causa_raiz: root,
    alertas_criticos: criticalAlerts.length,
    alertas_atencao: warningAlerts.length,
    leitura:
      `O produto apresenta Product Health Score ${score}/100, com causa raiz em ${root}. A Nexora identificou ${criticalAlerts.length} alerta(s) crítico(s) e ${warningAlerts.length} ponto(s) de atenção para orientar a próxima rodada de ação.`
  };
}

/* =========================
   HELPERS
========================= */

function normalizeNextAction(action) {
  if (!action) {
    return {
      title: "Priorizar a causa raiz antes de escalar o produto",
      priority_area: "Estratégia",
      timeframe: "7 dias",
      reason: "A decisão foi estruturada a partir da causa raiz consolidada.",
      action: "Corrigir o bloqueio principal antes de ampliar mídia, preço ou expansão.",
      expected_result: "Direcionar o seller para a primeira correção com maior impacto provável."
    };
  }

  if (typeof action === "string") {
    return {
      title: action,
      priority_area: "Estratégia",
      timeframe: "7 dias",
      reason: "A decisão foi estruturada a partir da leitura consolidada.",
      action,
      expected_result: "Direcionar o seller para a primeira correção com maior impacto provável."
    };
  }

  return {
    title: action.title || action.titulo || "Priorizar a causa raiz antes de escalar o produto",
    priority_area: action.priority_area || action.area || "Estratégia",
    timeframe: action.timeframe || action.prazo || "7 dias",
    reason: action.reason || action.motivo || action.detail || action.detalhe || "A ação foi definida a partir da leitura consolidada.",
    action: action.action || action.acao || action.recommendation || action.recomendacao || action.detail || action.detalhe || "Executar a ação prioritária indicada pela Nexora.",
    expected_result: action.expected_result || action.resultado_esperado || action.impacto || "Melhorar a clareza da decisão e reduzir ações dispersas."
  };
}

function getWeakestBrain(c1, c2, c3) {
  const scores = [
    {
      label: "performance",
      score: toNumber(c1?.score_geral || c1?.score_final || c1?.performance_score)
    },
    {
      label: "página",
      score: toNumber(c2?.score_pagina || c2?.listing_quality_score)
    },
    {
      label: "mercado",
      score: toNumber(c3?.score_mercado || c3?.market_position_score)
    }
  ].filter(item => item.score > 0);

  if (!scores.length) return null;

  return scores.sort((a, b) => a.score - b.score)[0];
}

function getMostCriticalSystemFromList(systemsList) {
  if (!Array.isArray(systemsList) || !systemsList.length) return null;

  const critical = systemsList.find(system => system.status === "Crítico");
  if (critical) return critical;

  return [...systemsList].sort((a, b) => toNumber(a.score) - toNumber(b.score))[0] || null;
}

function getSecondarySystemFromList(systemsList, mostCriticalSystem) {
  if (!Array.isArray(systemsList) || !systemsList.length) return null;

  return systemsList.find(system => system !== mostCriticalSystem) || null;
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

function clean(value) {
  return String(value || "").trim();
}

function formatPercent(value) {
  if (value === undefined || value === null || value === "") return "-";

  const number = Number(String(value).replace("%", "").replace(",", "."));

  if (!Number.isFinite(number)) return String(value);

  return `${String(Number.isInteger(number) ? number : number.toFixed(2)).replace(".", ",")}%`;
}
