// js/nexoraAlertsEngine.js

export function gerarAlertasNexora({
  c1 = {},
  c2 = {},
  c3 = {},
  systemsAnalysis = {},
  synthesis = {}
} = {}) {
  const alerts = [];

  alerts.push(...gerarAlertasPerformance(c1));
  alerts.push(...gerarAlertasPagina(c2));
  alerts.push(...gerarAlertasMercado(c3));
  alerts.push(...gerarAlertasSistemas(systemsAnalysis));
  alerts.push(...gerarAlertasSintese(synthesis));

  return ordenarAlertas(removerDuplicados(alerts));
}

/* =========================
   CÉREBRO 1 · PERFORMANCE
========================= */

function gerarAlertasPerformance(c1) {
  const alerts = [];

  const ctr = toNumber(c1.ctr);
  const cvr = toNumber(c1.cvr);
  const acos = toNumber(c1.acos);
  const tacos = toNumber(c1.tacos);
  const margin = toNumber(c1.margin ?? c1.mg);
  const reviews = toNumber(c1.reviews ?? c1.rev);
  const rating = toNumber(c1.rating);
  const buybox = normalize(c1.buybox ?? c1.bb);
  const stock = normalize(c1.stock ?? c1.est);
  const fulfillment = normalize(c1.fulfillment ?? c1.fba);

  if (ctr > 0 && ctr < 0.45) {
    alerts.push({
      level: "Crítico",
      area: "Atração",
      title: "CTR abaixo do nível saudável",
      evidence: `CTR atual de ${formatPercent(ctr)} indica baixa capacidade de gerar clique a partir das impressões.`,
      impact: "O produto pode estar recebendo exposição, mas não está atraindo cliques suficientes para alimentar o funil de venda.",
      action: "Revisar imagem principal, preço percebido, título e contraste competitivo antes de aumentar investimento em mídia."
    });
  } else if (ctr >= 0.45 && ctr < 0.7) {
    alerts.push({
      level: "Atenção",
      area: "Atração",
      title: "CTR em zona de atenção",
      evidence: `CTR atual de ${formatPercent(ctr)} sugere que a atratividade ainda pode limitar o crescimento.`,
      impact: "A performance pode ficar dependente de volume de impressão, sem eficiência suficiente no clique.",
      action: "Melhorar atratividade visual, clareza de benefício e competitividade da oferta."
    });
  }

  if (cvr > 0 && cvr < 7) {
    alerts.push({
      level: "Crítico",
      area: "Conversão",
      title: "CVR crítico",
      evidence: `CVR atual de ${formatPercent(cvr)} indica baixa conversão após o clique.`,
      impact: "O produto pode desperdiçar tráfego pago e orgânico, reduzindo eficiência de mídia e sinais positivos para o algoritmo.",
      action: "Priorizar confiança, prova social, clareza da oferta, diferenciação e coerência entre preço e valor percebido."
    });
  } else if (cvr >= 7 && cvr < 10) {
    alerts.push({
      level: "Atenção",
      area: "Conversão",
      title: "CVR abaixo do ideal",
      evidence: `CVR atual de ${formatPercent(cvr)} ainda mostra espaço relevante de melhoria.`,
      impact: "A página pode estar convertendo abaixo do potencial, limitando escala e eficiência de campanhas.",
      action: "Reforçar argumentos de compra, imagens secundárias, objeções, reviews e proposta de valor."
    });
  }

  if (acos > 0 && margin > 0 && acos > margin) {
    alerts.push({
      level: "Crítico",
      area: "Unit Economics",
      title: "ACOS acima da margem",
      evidence: `ACOS de ${formatPercent(acos)} está acima da margem informada de ${formatPercent(margin)}.`,
      impact: "O produto pode estar vendendo com prejuízo direto em mídia, mesmo que gere receita.",
      action: "Rever break-even ACOS, estrutura de campanhas, preço, margem e eficiência antes de escalar investimento."
    });
  } else if (acos >= 35) {
    alerts.push({
      level: "Atenção",
      area: "PPC",
      title: "ACOS elevado",
      evidence: `ACOS atual de ${formatPercent(acos)} indica pressão sobre eficiência de mídia.`,
      impact: "A escala pode ficar cara e reduzir margem se a conversão e a oferta não sustentarem o investimento.",
      action: "Revisar termos, bids, estrutura de campanha e qualidade da página antes de aumentar verba."
    });
  }

  if (tacos >= 18) {
    alerts.push({
      level: "Atenção",
      area: "Dependência de mídia",
      title: "TACOS alto",
      evidence: `TACOS atual de ${formatPercent(tacos)} sugere dependência relevante de mídia paga.`,
      impact: "O produto pode estar crescendo de forma dependente de anúncios, sem força orgânica proporcional.",
      action: "Acompanhar ranking orgânico, conversão, share de tráfego pago e eficiência por campanha."
    });
  }

  if (reviews > 0 && reviews < 30) {
    alerts.push({
      level: "Atenção",
      area: "Prova social",
      title: "Baixa densidade de reviews",
      evidence: `Produto possui ${reviews} reviews, o que pode ser insuficiente em categorias com barreira de autoridade.`,
      impact: "A baixa prova social pode reduzir confiança, CVR e capacidade de competir contra players estabelecidos.",
      action: "Reforçar confiança na página, diferenciação, garantia, imagens de uso e estratégia de construção de reviews."
    });
  }

  if (rating > 0 && rating < 4.1) {
    alerts.push({
      level: "Crítico",
      area: "Confiança",
      title: "Rating abaixo do nível seguro",
      evidence: `Rating atual de ${rating} pode gerar fricção de compra.`,
      impact: "Mesmo com tráfego e boa página, uma nota baixa pode reduzir conversão e aumentar o custo de aquisição.",
      action: "Investigar causas de insatisfação, revisar qualidade, expectativa criada na página e principais reclamações."
    });
  }

  if (buybox.includes("nao") || buybox.includes("não")) {
    alerts.push({
      level: "Crítico",
      area: "Operational Structure",
      title: "Produto sem Buy Box",
      evidence: "O diagnóstico indica ausência de Buy Box.",
      impact: "Sem Buy Box, a capacidade de conversão e entrega do produto pode cair drasticamente.",
      action: "Resolver preço, disponibilidade, seller health, fulfillment e competitividade da oferta antes de investir em tráfego."
    });
  }

  if (stock.includes("zerado") || stock.includes("baixo")) {
    alerts.push({
      level: stock.includes("zerado") ? "Crítico" : "Atenção",
      area: "Operational Structure",
      title: stock.includes("zerado") ? "Estoque zerado" : "Estoque baixo",
      evidence: `Status de estoque informado: ${c1.stock || c1.est}.`,
      impact: "Problemas de estoque podem reduzir entrega, ranking, conversão e continuidade de vendas.",
      action: "Priorizar reposição, disponibilidade e planejamento antes de ampliar mídia ou tráfego."
    });
  }

  if (fulfillment.includes("fbm")) {
    alerts.push({
      level: "Atenção",
      area: "Operational Structure",
      title: "Fulfillment pode limitar competitividade",
      evidence: "Produto informado como FBM.",
      impact: "Em categorias com forte presença Prime/FBA, o FBM pode reduzir percepção de conveniência e conversão.",
      action: "Avaliar viabilidade de FBA/Prime ou compensar com preço, prazo e comunicação clara."
    });
  }

  return alerts;
}

/* =========================
   CÉREBRO 2 · LISTING
========================= */

function gerarAlertasPagina(c2) {
  const alerts = [];

  const scorePagina = toNumber(c2.score_pagina);
  const scores = c2.scores || {};

  const confianca = toNumber(scores.confianca);
  const diferenciacao = toNumber(scores.diferenciacao);
  const ctrReadiness = toNumber(scores.ctr_readiness);
  const cvrReadiness = toNumber(scores.cvr_readiness);

  if (scorePagina > 0 && scorePagina < 50) {
    alerts.push({
      level: "Crítico",
      area: "Listing Quality",
      title: "Listing Quality Score crítico",
      evidence: `Score de página de ${scorePagina}/100 indica fragilidade relevante na página.`,
      impact: "A página pode não sustentar clique, conversão ou percepção de valor suficiente para escalar.",
      action: "Priorizar imagem principal, clareza de oferta, diferenciação, prova social e argumentos de compra."
    });
  }

  if (ctrReadiness > 0 && ctrReadiness < 55) {
    alerts.push({
      level: "Atenção",
      area: "CTR-readiness",
      title: "Página pouco preparada para gerar clique",
      evidence: `CTR-readiness de ${ctrReadiness}/100.`,
      impact: "A imagem, título ou preço percebido podem não competir bem na página de busca.",
      action: "Revisar thumbnail, contraste visual, benefício principal, título e competitividade da oferta."
    });
  }

  if (cvrReadiness > 0 && cvrReadiness < 55) {
    alerts.push({
      level: "Crítico",
      area: "CVR-readiness",
      title: "Página pouco preparada para converter",
      evidence: `CVR-readiness de ${cvrReadiness}/100.`,
      impact: "O produto pode atrair cliques, mas perder vendas por falta de clareza, confiança ou sustentação de valor.",
      action: "Reforçar prova social, diferenciação, objeções, imagens secundárias, A+ e promessa principal."
    });
  }

  if (confianca > 0 && confianca < 55) {
    alerts.push({
      level: "Atenção",
      area: "Confiança",
      title: "Confiança percebida baixa",
      evidence: `Score de confiança de ${confianca}/100.`,
      impact: "Baixa confiança pode reduzir conversão, principalmente em produtos com preço acima da média ou poucos reviews.",
      action: "Melhorar prova social, qualidade visual, descrição, garantias, uso real e consistência da marca."
    });
  }

  if (diferenciacao > 0 && diferenciacao < 55) {
    alerts.push({
      level: "Atenção",
      area: "Diferenciação",
      title: "Diferenciação fraca",
      evidence: `Score de diferenciação de ${diferenciacao}/100.`,
      impact: "O produto pode ser percebido como commodity e competir mais por preço do que por valor.",
      action: "Explicitar diferenciais, comparar benefícios, reforçar proposta única e melhorar comunicação visual."
    });
  }

  if (normalize(c2.visualPerception).includes("generica") || normalize(c2.visualPerception).includes("genérica")) {
    alerts.push({
      level: "Atenção",
      area: "Imagem",
      title: "Percepção visual genérica",
      evidence: "A percepção visual foi marcada como genérica.",
      impact: "Uma apresentação genérica reduz diferenciação e dificulta competir contra players similares.",
      action: "Rever imagem principal, estilo visual, ângulo do produto e comunicação do benefício principal."
    });
  }

  return alerts;
}

/* =========================
   CÉREBRO 3 · MERCADO
========================= */

function gerarAlertasMercado(c3) {
  const alerts = [];

  const scoreMercado = toNumber(c3.score_mercado);
  const avgPrice = toNumber(c3.avgCategoryPrice);
  const productPrice = toNumber(c3.productPrice);
  const scores = c3.scores || {};

  const barreira = toNumber(scores.barreira_entrada);
  const oportunidade = toNumber(scores.oportunidade);

  const competition = normalize(c3.competitionLevel);
  const marketType = normalize(c3.marketType);
  const pricePressure = normalize(c3.pricePressure);
  const entryBarrier = normalize(c3.entryBarrier);
  const reviewDominance = normalize(c3.reviewDominance);
  const differentiationSpace = normalize(c3.differentiationSpace);

  if (scoreMercado > 0 && scoreMercado < 50) {
    alerts.push({
      level: "Crítico",
      area: "Market Position",
      title: "Market Position Score crítico",
      evidence: `Score de mercado de ${scoreMercado}/100 indica desalinhamento competitivo relevante.`,
      impact: "O produto pode estar competindo em uma dinâmica de mercado desfavorável ou com posicionamento pouco sustentável.",
      action: "Reavaliar preço relativo, reviews, força dos concorrentes, diferenciação e quadrante competitivo."
    });
  }

  if (avgPrice > 0 && productPrice > avgPrice * 1.2) {
    alerts.push({
      level: "Atenção",
      area: "Preço",
      title: "Preço acima da média da categoria",
      evidence: `Preço do produto está acima da média informada da categoria.`,
      impact: "Preço acima da média exige página forte, diferenciação clara e confiança suficiente para sustentar conversão.",
      action: "Validar se a página justifica o premium ou ajustar preço/oferta para reduzir fricção."
    });
  }

  if (competition.includes("alta") && (entryBarrier.includes("alta") || reviewDominance.includes("alta"))) {
    alerts.push({
      level: "Crítico",
      area: "Category Competition",
      title: "Barreira competitiva alta",
      evidence: "Concorrência alta combinada com barreira de entrada ou dominância de reviews elevada.",
      impact: "O produto pode ter dificuldade de ganhar tração rápida, especialmente se tiver pouca autoridade ou diferenciação.",
      action: "Evitar competir frontalmente; buscar nicho, diferenciação, oferta mais clara ou estratégia de entrada gradual."
    });
  }

  if (marketType.includes("guerra de preco") || pricePressure.includes("alta")) {
    alerts.push({
      level: "Atenção",
      area: "Market Forces",
      title: "Mercado pressionado por preço",
      evidence: "O mercado apresenta guerra ou pressão alta de preço.",
      impact: "A margem pode ficar comprimida e o produto pode depender de preço agressivo para converter.",
      action: "Validar margem, break-even ACOS, diferenciação e elasticidade de preço antes de escalar."
    });
  }

  if (differentiationSpace.includes("baixo")) {
    alerts.push({
      level: "Atenção",
      area: "Diferenciação",
      title: "Baixo espaço para diferenciação",
      evidence: "O espaço para diferenciação foi classificado como baixo.",
      impact: "O produto pode ser forçado a competir por preço, review ou marca, reduzindo margem estratégica.",
      action: "Buscar microposicionamento, bundle, benefício específico ou comunicação mais clara de uso."
    });
  }

  if (barreira > 0 && barreira < 50) {
    alerts.push({
      level: "Atenção",
      area: "Barreira de entrada",
      title: "Barreira de entrada desfavorável",
      evidence: `Score de barreira de entrada de ${barreira}/100.`,
      impact: "A categoria pode exigir mais autoridade, reviews ou vantagem comercial para competir.",
      action: "Planejar entrada com foco em prova social, oferta, diferenciação e controle de mídia."
    });
  }

  if (oportunidade > 0 && oportunidade < 45) {
    alerts.push({
      level: "Crítico",
      area: "Oportunidade",
      title: "Baixa oportunidade de escala",
      evidence: `Score de oportunidade de ${oportunidade}/100.`,
      impact: "O mercado pode não oferecer espaço suficiente para crescimento sustentável no curto prazo.",
      action: "Reavaliar posicionamento, nicho, preço, diferenciação ou até a viabilidade estratégica do produto."
    });
  }

  return alerts;
}

/* =========================
   5 SISTEMAS NEXORA
========================= */

function gerarAlertasSistemas(systemsAnalysis) {
  const alerts = [];

  const systems = Array.isArray(systemsAnalysis?.systemsList)
    ? systemsAnalysis.systemsList
    : [];

  systems.forEach(system => {
    if (!system) return;

    if (system.status === "Crítico") {
      alerts.push({
        level: "Crítico",
        area: system.label || system.name || "Sistema Nexora",
        title: `${system.label || system.name} em estado crítico`,
        evidence: system.reason || "A leitura dos 5 Sistemas identificou este pilar como crítico.",
        impact: "Esse sistema pode estar travando a performance do produto e deve ser tratado antes de escalar.",
        action: system.action || "Priorizar correção deste sistema antes de ampliar investimento ou expansão."
      });
    }
  });

  return alerts;
}

/* =========================
   SÍNTESE
========================= */

function gerarAlertasSintese(synthesis) {
  const alerts = [];

  const scoreFinal = toNumber(synthesis.score_final);
  const gravidade = normalize(synthesis.gravidade);

  if (scoreFinal > 0 && scoreFinal < 50) {
    alerts.push({
      level: "Crítico",
      area: "Product Health",
      title: "Product Health Score crítico",
      evidence: `Score final de ${scoreFinal}/100.`,
      impact: "O produto apresenta risco estratégico relevante e pode não estar pronto para escala.",
      action: "Corrigir a causa raiz consolidada e os sistemas críticos antes de aumentar investimento."
    });
  }

  if (gravidade.includes("critica") || gravidade.includes("crítica")) {
    alerts.push({
      level: "Crítico",
      area: "Gravidade",
      title: "Gravidade crítica na síntese",
      evidence: "A síntese classificou a gravidade do diagnóstico como crítica.",
      impact: "Existe risco de agir no sintoma errado ou escalar um produto com bloqueios estruturais.",
      action: "Priorizar a próxima melhor ação indicada pela Nexora antes de qualquer escala."
    });
  }

  return alerts;
}

/* =========================
   HELPERS
========================= */

function ordenarAlertas(alerts) {
  const order = {
    "Crítico": 1,
    "Atenção": 2,
    "Informativo": 3
  };

  return [...alerts].sort((a, b) => {
    return (order[a.level] || 99) - (order[b.level] || 99);
  });
}

function removerDuplicados(alerts) {
  const seen = new Set();

  return alerts.filter(alert => {
    const key = `${alert.level}-${alert.area}-${alert.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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

function formatPercent(value) {
  const number = toNumber(value);
  return `${String(Number.isInteger(number) ? number : number.toFixed(2)).replace(".", ",")}%`;
}
