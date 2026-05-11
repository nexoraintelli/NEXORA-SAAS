// /js/nexoraSystemsEngine.js
// Engine dos 5 Sistemas Nexora
// Objetivo: reconectar a Síntese Final à metodologia original da Nexora:
// Unit Economics, Market Forces, Category Competition, Amazon Algorithm e Operational Structure.

export function analisarCincoSistemas(c1 = {}, c2 = {}, c3 = {}) {
  const unitEconomics = analisarUnitEconomics(c1);
  const marketForces = analisarMarketForces(c1, c3);
  const categoryCompetition = analisarCategoryCompetition(c1, c3);
  const amazonAlgorithm = analisarAmazonAlgorithm(c1, c2);
  const operationalStructure = analisarOperationalStructure(c1);

  const systems = {
    unitEconomics,
    marketForces,
    categoryCompetition,
    amazonAlgorithm,
    operationalStructure
  };

  const systemsList = Object.entries(systems)
    .map(([key, value]) => ({
      key,
      ...value
    }))
    .sort((a, b) => a.score - b.score);

  const mostCriticalSystem = systemsList[0] || null;
  const secondarySystem = systemsList[1] || null;

  const nextBestAction = gerarProximaMelhorAcao({
    mostCriticalSystem,
    secondarySystem,
    c1,
    c2,
    c3
  });

  const strategicReading = gerarLeituraEstrategica({
    mostCriticalSystem,
    secondarySystem,
    systems
  });

  return {
    systems,
    systemsList,
    mostCriticalSystem,
    secondarySystem,
    nextBestAction,
    strategicReading,
    generated_at: new Date().toISOString()
  };
}

/* ============================================================
   SISTEMA 1 — UNIT ECONOMICS
   Pergunta: o produto consegue crescer com lucro?
============================================================ */

function analisarUnitEconomics(c1) {
  const acos = number(c1.acos);
  const tacos = number(c1.tacos);
  const margin = number(c1.margin || c1.mg);
  const roas = number(c1.roas);

  let score = 78;
  const evidences = [];

  if (margin > 0 && acos > margin) {
    score -= 28;
    evidences.push(`ACOS de ${acos}% acima da margem de ${margin}%.`);
  }

  if (margin > 0 && acos > margin * 0.8 && acos <= margin) {
    score -= 14;
    evidences.push(`ACOS próximo do limite da margem.`);
  }

  if (tacos >= 20) {
    score -= 18;
    evidences.push(`TACOS de ${tacos}% indica alta dependência de mídia paga.`);
  } else if (tacos >= 12) {
    score -= 9;
    evidences.push(`TACOS de ${tacos}% exige acompanhamento para evitar dependência de anúncios.`);
  }

  if (roas > 0 && roas < 2) {
    score -= 12;
    evidences.push(`ROAS abaixo de 2 pode indicar baixa eficiência de mídia.`);
  }

  if (!evidences.length) {
    evidences.push("Não há sinais críticos de insustentabilidade econômica com os dados atuais.");
  }

  return buildSystem({
    name: "Unit Economics",
    label: "Unit Economics",
    question: "O produto consegue crescer com lucro?",
    score,
    evidences,
    reason: gerarRazaoUnitEconomics(score, evidences),
    action: gerarAcaoUnitEconomics(score)
  });
}

function gerarRazaoUnitEconomics(score, evidences) {
  if (score < 45) {
    return "A sustentabilidade econômica está em risco. Antes de escalar tráfego, é necessário validar margem, ACOS, TACOS e retorno real da mídia.";
  }

  if (score < 70) {
    return "A economia do produto exige atenção. O produto pode vender, mas precisa provar que consegue crescer sem comprometer margem.";
  }

  return "A estrutura econômica não parece ser o principal bloqueio neste diagnóstico.";
}

function gerarAcaoUnitEconomics(score) {
  if (score < 45) {
    return "Revisar margem, break-even ACOS e eficiência de mídia antes de aumentar investimento em tráfego.";
  }

  if (score < 70) {
    return "Acompanhar ACOS, TACOS e margem para evitar crescimento com baixa rentabilidade.";
  }

  return "Manter controle de margem e mídia enquanto os demais gargalos são corrigidos.";
}

/* ============================================================
   SISTEMA 2 — MARKET FORCES
   Pergunta: qual força domina a categoria?
============================================================ */

function analisarMarketForces(c1, c3) {
  const forceFromC1 = text(c1.force);
  const marketType = text(c3.marketType);
  const pricePressure = text(c3.pricePressure);
  const brandDominance = text(c3.brandDominance);
  const reviewDominance = text(c3.reviewDominance);
  const differentiationSpace = text(c3.differentiationSpace);

  const detectedForces = [];

  if (includesAny(forceFromC1, ["preço", "price"])) detectedForces.push("Preço");
  if (includesAny(forceFromC1, ["review", "reviews"])) detectedForces.push("Reviews");
  if (includesAny(forceFromC1, ["marca", "brand"])) detectedForces.push("Marca");
  if (includesAny(forceFromC1, ["diferenciação", "diferenciacao", "differentiation"])) detectedForces.push("Diferenciação");
  if (includesAny(forceFromC1, ["prime", "fba"])) detectedForces.push("Operação/Prime");

  if (includesAny(marketType, ["guerra de preço", "commodity"])) detectedForces.push("Preço");
  if (includesAny(marketType, ["dominância de reviews", "dominancia de reviews"])) detectedForces.push("Reviews");
  if (includesAny(marketType, ["dominância de marca", "dominancia de marca"])) detectedForces.push("Marca");
  if (includesAny(marketType, ["diferenciação", "diferenciacao"])) detectedForces.push("Diferenciação");

  if (isHigh(pricePressure)) detectedForces.push("Preço");
  if (isHigh(reviewDominance)) detectedForces.push("Reviews");
  if (isHigh(brandDominance)) detectedForces.push("Marca");

  const dominantForce = mostFrequent(detectedForces) || forceFromC1 || marketType || "Não definida";
  const secondaryForce = secondMostFrequent(detectedForces, dominantForce) || "Não definida";

  let score = 72;
  const evidences = [];

  if (dominantForce === "Preço") {
    score -= 18;
    evidences.push("A categoria apresenta sinais de competição sensível a preço.");
  }

  if (dominantForce === "Reviews") {
    score -= 20;
    evidences.push("A categoria apresenta sinais de dominância por autoridade de reviews.");
  }

  if (dominantForce === "Marca") {
    score -= 18;
    evidences.push("A categoria apresenta sinais de dominância por confiança de marca.");
  }

  if (isHigh(pricePressure)) {
    score -= 10;
    evidences.push("Pressão de preço alta aumenta o risco de guerra de margem.");
  }

  if (isHigh(reviewDominance)) {
    score -= 10;
    evidences.push("Dominância de reviews alta aumenta a barreira de conversão.");
  }

  if (isLow(differentiationSpace)) {
    score -= 8;
    evidences.push("Baixo espaço para diferenciação reduz margem de manobra estratégica.");
  }

  if (!evidences.length) {
    evidences.push("As forças de mercado não indicam bloqueio crítico imediato, mas ainda precisam ser monitoradas.");
  }

  return buildSystem({
    name: "Market Forces",
    label: "Market Forces",
    question: "Qual força domina a categoria?",
    score,
    evidences,
    reason: gerarRazaoMarketForces(score, dominantForce, secondaryForce),
    action: gerarAcaoMarketForces(dominantForce),
    extra: {
      dominantForce,
      secondaryForce
    }
  });
}

function gerarRazaoMarketForces(score, dominantForce, secondaryForce) {
  if (score < 45) {
    return `A categoria possui força dominante crítica em ${dominantForce}. Isso significa que o produto precisa competir respeitando a regra real do mercado, e não apenas otimizando métricas isoladas.`;
  }

  if (score < 70) {
    return `A categoria mostra pressão relevante em ${dominantForce}${secondaryForce !== "Não definida" ? `, com influência secundária de ${secondaryForce}` : ""}.`;
  }

  return "As forças de mercado não parecem ser o maior bloqueio neste diagnóstico.";
}

function gerarAcaoMarketForces(dominantForce) {
  const map = {
    "Preço": "Revisar preço percebido, oferta e margem antes de tentar escalar em uma categoria sensível a preço.",
    "Reviews": "Reforçar confiança, prova social, imagens de uso e argumentos de autoridade antes de escalar mídia.",
    "Marca": "Construir sinais de confiança e credibilidade para compensar a força de marcas mais conhecidas.",
    "Diferenciação": "Tornar a diferenciação mais clara na imagem, título, bullets e proposta de valor.",
    "Operação/Prime": "Garantir vantagem operacional, disponibilidade, entrega e Buy Box antes de medir potencial real de escala."
  };

  return map[dominantForce] || "Identificar a força dominante real da categoria antes de definir a próxima ação.";
}

/* ============================================================
   SISTEMA 3 — CATEGORY COMPETITION
   Pergunta: é possível competir aqui?
============================================================ */

function analisarCategoryCompetition(c1, c3) {
  const entryBarrier = text(c3.entryBarrier);
  const competitionLevel = text(c3.competitionLevel);
  const reviewDominance = text(c3.reviewDominance);
  const productPrice = number(c3.productPrice || c1.price || c1.preco);
  const avgCategoryPrice = number(c3.avgCategoryPrice);
  const reviews = number(c1.reviews || c1.rev);
  const competitors = Array.isArray(c3.competitors) ? c3.competitors : [];

  const avgCompetitorReviews = getAverage(
    competitors
      .map(c => number(c.reviews))
      .filter(v => v > 0)
  );

  let score = 74;
  const evidences = [];

  if (isHigh(entryBarrier)) {
    score -= 18;
    evidences.push("Barreira de entrada alta.");
  }

  if (isHigh(competitionLevel)) {
    score -= 14;
    evidences.push("Nível de concorrência alto.");
  }

  if (isHigh(reviewDominance)) {
    score -= 12;
    evidences.push("Dominância de reviews elevada.");
  }

  if (avgCategoryPrice > 0 && productPrice > avgCategoryPrice * 1.15) {
    score -= 12;
    evidences.push("Produto acima do preço médio da categoria.");
  }

  if (avgCompetitorReviews > 0 && reviews > 0 && reviews < avgCompetitorReviews * 0.35) {
    score -= 16;
    evidences.push("Produto com autoridade de reviews bem abaixo dos concorrentes.");
  }

  if (avgCompetitorReviews > 0 && reviews === 0) {
    score -= 14;
    evidences.push("Concorrentes possuem histórico de reviews, mas o produto não apresenta autoridade informada.");
  }

  if (!evidences.length) {
    evidences.push("A competição da categoria não parece inviabilizar o produto neste diagnóstico.");
  }

  return buildSystem({
    name: "Category Competition",
    label: "Category Competition",
    question: "É possível competir aqui com o posicionamento atual?",
    score,
    evidences,
    reason: gerarRazaoCategoryCompetition(score),
    action: gerarAcaoCategoryCompetition(score)
  });
}

function gerarRazaoCategoryCompetition(score) {
  if (score < 45) {
    return "O produto enfrenta desvantagem competitiva relevante. A barreira de preço, reviews, concorrência ou posicionamento pode limitar escala mesmo que a página seja otimizada.";
  }

  if (score < 70) {
    return "A competição da categoria exige atenção. O produto precisa ajustar posicionamento, autoridade ou oferta para competir melhor.";
  }

  return "A competição não parece ser o principal bloqueio, considerando os dados atuais.";
}

function gerarAcaoCategoryCompetition(score) {
  if (score < 45) {
    return "Revisar posicionamento competitivo, preço percebido e prova social antes de escalar mídia paga.";
  }

  if (score < 70) {
    return "Comparar o produto com os concorrentes líderes e corrigir o principal gap competitivo.";
  }

  return "Manter monitoramento competitivo e focar nos demais sistemas mais críticos.";
}

/* ============================================================
   SISTEMA 4 — AMAZON ALGORITHM
   Pergunta: o algoritmo tende a favorecer ou penalizar?
============================================================ */

function analisarAmazonAlgorithm(c1, c2) {
  const ctr = number(c1.ctr);
  const cvr = number(c1.cvr);
  const scorePagina = number(c2.score_pagina);
  const ctrReadiness = number(c2?.scores?.ctr_readiness);
  const cvrReadiness = number(c2?.scores?.cvr_readiness);
  const seoScore = number(c2?.scores?.titulo_seo);

  let score = 76;
  const evidences = [];

  if (ctr > 0 && ctr < 0.5) {
    score -= 16;
    evidences.push("CTR baixo pode limitar atração e entrega.");
  }

  if (cvr > 0 && cvr < 8) {
    score -= 20;
    evidences.push("CVR baixo pode reduzir probabilidade de ganho de visibilidade.");
  }

  if (scorePagina > 0 && scorePagina < 60) {
    score -= 12;
    evidences.push("Score de página baixo pode prejudicar conversão e resposta ao tráfego.");
  }

  if (ctrReadiness > 0 && ctrReadiness < 60) {
    score -= 8;
    evidences.push("CTR-readiness baixo indica fragilidade antes do clique.");
  }

  if (cvrReadiness > 0 && cvrReadiness < 60) {
    score -= 10;
    evidences.push("CVR-readiness baixo indica fragilidade na conversão pós-clique.");
  }

  if (seoScore > 0 && seoScore < 55) {
    score -= 8;
    evidences.push("Título/SEO fraco pode limitar relevância e aderência à busca.");
  }

  if (!evidences.length) {
    evidences.push("Não há sinais críticos de penalização algorítmica com os dados atuais.");
  }

  return buildSystem({
    name: "Amazon Algorithm",
    label: "Amazon Algorithm",
    question: "O algoritmo tende a favorecer ou penalizar esse produto?",
    score,
    evidences,
    reason: gerarRazaoAmazonAlgorithm(score),
    action: gerarAcaoAmazonAlgorithm(score, c1)
  });
}

function gerarRazaoAmazonAlgorithm(score) {
  if (score < 45) {
    return "O produto apresenta sinais que podem limitar a entrega algorítmica, principalmente por baixa atração, baixa conversão ou baixa aderência da página.";
  }

  if (score < 70) {
    return "O algoritmo pode não estar favorecendo o produto de forma plena. Existem sinais de atenção em clique, conversão ou qualidade da página.";
  }

  return "Os sinais algorítmicos não parecem ser o principal bloqueio neste diagnóstico.";
}

function gerarAcaoAmazonAlgorithm(score, c1) {
  const ctr = number(c1.ctr);
  const cvr = number(c1.cvr);

  if (score < 45 && cvr > 0 && cvr < 8) {
    return "Corrigir fatores de conversão da página antes de aumentar tráfego, porque baixa conversão pode limitar visibilidade.";
  }

  if (score < 45 && ctr > 0 && ctr < 0.5) {
    return "Revisar imagem principal, título e preço percebido para melhorar atração antes do clique.";
  }

  if (score < 70) {
    return "Corrigir os sinais mais fracos de CTR, CVR e relevância para melhorar resposta algorítmica.";
  }

  return "Manter monitoramento de CTR, CVR e SEO enquanto os demais gargalos são priorizados.";
}

/* ============================================================
   SISTEMA 5 — OPERATIONAL STRUCTURE
   Pergunta: a operação está travando o produto?
============================================================ */

function analisarOperationalStructure(c1) {
  const fulfillment = text(c1.fulfillment || c1.fba);
  const buybox = text(c1.buybox || c1.bb);
  const stock = text(c1.stock || c1.est);

  let score = 82;
  const evidences = [];

  if (includesAny(fulfillment, ["fbm"])) {
    score -= 10;
    evidences.push("FBM pode reduzir competitividade frente a ofertas Prime/FBA.");
  }

  if (includesAny(buybox, ["não tenho", "nao tenho", "perdi", "sem"])) {
    score -= 28;
    evidences.push("Ausência de Buy Box pode derrubar conversão e vendas.");
  }

  if (includesAny(buybox, ["disputada"])) {
    score -= 14;
    evidences.push("Buy Box disputada pode gerar instabilidade de vendas.");
  }

  if (includesAny(stock, ["baixo"])) {
    score -= 12;
    evidences.push("Estoque baixo pode limitar escala e afetar ranking.");
  }

  if (includesAny(stock, ["zerado", "sem estoque"])) {
    score -= 30;
    evidences.push("Estoque zerado inviabiliza continuidade de vendas e prejudica visibilidade.");
  }

  if (!evidences.length) {
    evidences.push("A operação não parece ser o principal bloqueio com os dados atuais.");
  }

  return buildSystem({
    name: "Operational Structure",
    label: "Operational Structure",
    question: "A operação está ajudando ou travando o produto?",
    score,
    evidences,
    reason: gerarRazaoOperationalStructure(score),
    action: gerarAcaoOperationalStructure(score)
  });
}

function gerarRazaoOperationalStructure(score) {
  if (score < 45) {
    return "A estrutura operacional pode estar distorcendo a leitura de performance. Antes de culpar página ou mídia, é necessário resolver Buy Box, estoque ou fulfillment.";
  }

  if (score < 70) {
    return "Existem sinais operacionais que podem limitar conversão, escala ou estabilidade de vendas.";
  }

  return "A operação não parece ser o principal gargalo deste diagnóstico.";
}

function gerarAcaoOperationalStructure(score) {
  if (score < 45) {
    return "Corrigir Buy Box, estoque ou fulfillment antes de avaliar aumento de tráfego ou mudanças profundas de página.";
  }

  if (score < 70) {
    return "Estabilizar operação para evitar perda de conversão e leitura distorcida das métricas.";
  }

  return "Manter operação estável enquanto os demais sistemas são priorizados.";
}

/* ============================================================
   PRÓXIMA MELHOR AÇÃO
============================================================ */

function gerarProximaMelhorAcao({ mostCriticalSystem, secondarySystem, c1, c2, c3 }) {
  const key = mostCriticalSystem?.key;

  if (key === "unitEconomics") {
    return "Validar margem, break-even ACOS e dependência de mídia antes de escalar tráfego.";
  }

  if (key === "marketForces") {
    const force = mostCriticalSystem?.extra?.dominantForce || c1.force || c3.marketType || "";
    if (includesAny(force, ["review"])) {
      return "Reforçar confiança, prova social e valor percebido antes de aumentar investimento em mídia.";
    }

    if (includesAny(force, ["preço", "price", "commodity", "guerra"])) {
      return "Revisar preço percebido, oferta e margem para competir melhor em um mercado sensível a preço.";
    }

    if (includesAny(force, ["marca", "brand"])) {
      return "Construir sinais de autoridade e confiança para compensar a dominância de marcas fortes.";
    }

    if (includesAny(force, ["diferenciação", "diferenciacao"])) {
      return "Tornar a diferenciação do produto mais clara na imagem, título, bullets e proposta de valor.";
    }

    return "Ajustar a estratégia à força dominante real da categoria antes de escalar o produto.";
  }

  if (key === "categoryCompetition") {
    return "Revisar posicionamento competitivo, preço percebido e prova social antes de escalar mídia paga.";
  }

  if (key === "amazonAlgorithm") {
    const ctr = number(c1.ctr);
    const cvr = number(c1.cvr);

    if (cvr > 0 && cvr < 8) {
      return "Corrigir os fatores de conversão da página antes de aumentar tráfego, porque o CVR pode estar limitando visibilidade.";
    }

    if (ctr > 0 && ctr < 0.5) {
      return "Revisar imagem principal, título e oferta visível para aumentar a atratividade no resultado de busca.";
    }

    return "Melhorar sinais de relevância, atração e conversão para aumentar a probabilidade de entrega pelo algoritmo.";
  }

  if (key === "operationalStructure") {
    return "Resolver Buy Box, estoque ou fulfillment antes de tirar conclusões definitivas sobre página, mídia ou mercado.";
  }

  return "Corrigir o sistema mais crítico identificado antes de escalar mídia ou ampliar investimento.";
}

function gerarLeituraEstrategica({ mostCriticalSystem, secondarySystem, systems }) {
  const primary = mostCriticalSystem?.label || "sistema principal";
  const secondary = secondarySystem?.label || "sistema secundário";

  return `A leitura dos 5 Sistemas Nexora indica que o principal bloqueio está em ${primary}. O sistema secundário em atenção é ${secondary}. Isso significa que a performance do produto não deve ser interpretada apenas por métricas isoladas: é necessário entender se o problema vem de economia, forças de mercado, competição, algoritmo ou operação antes de definir a próxima ação.`;
}

/* ============================================================
   HELPERS
============================================================ */

function buildSystem({ name, label, question, score, evidences, reason, action, extra = {} }) {
  const normalizedScore = clamp(Math.round(score), 0, 100);

  return {
    name,
    label,
    question,
    score: normalizedScore,
    status: getStatus(normalizedScore),
    severity: getSeverity(normalizedScore),
    reason,
    action,
    evidences,
    ...extra
  };
}

function getStatus(score) {
  if (score < 45) return "Crítico";
  if (score < 70) return "Atenção";
  return "Saudável";
}

function getSeverity(score) {
  if (score < 45) return "Alta";
  if (score < 70) return "Média";
  return "Baixa";
}

function number(value) {
  const n = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function text(value) {
  return String(value ?? "").trim();
}

function normalize(value) {
  return text(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function includesAny(value, terms = []) {
  const normalized = normalize(value);
  return terms.some(term => normalized.includes(normalize(term)));
}

function isHigh(value) {
  return includesAny(value, ["alta", "alto", "muitos", "forte", "crítica", "critica"]);
}

function isLow(value) {
  return includesAny(value, ["baixa", "baixo", "fraca", "fraco", "pouco"]);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getAverage(values = []) {
  const clean = values.filter(v => Number.isFinite(v) && v > 0);
  if (!clean.length) return 0;

  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function mostFrequent(items = []) {
  if (!items.length) return "";

  const counts = items.reduce((acc, item) => {
    if (!item) return acc;
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

function secondMostFrequent(items = [], first = "") {
  if (!items.length) return "";

  const counts = items.reduce((acc, item) => {
    if (!item || item === first) return acc;
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}
