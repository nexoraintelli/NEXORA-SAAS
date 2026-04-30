// NEXORA · CÉREBRO 3 ENGINE
// Análise profunda de mercado, concorrência, preço, saturação, barreira de entrada e dinâmica competitiva

export function analisarMercadoBase(data, c1 = null, c2 = null) {
  const d = normalizarDados(data);
  const contexto = normalizarContexto(c1, c2);

  const scores = calcularScoresMercado(d, contexto);
  const scoreMercado = calcularScoreGeral(scores);
  const status = classificarStatus(scoreMercado);

  const dinamica = identificarDinamicaMercado(d, scores, contexto);
  const problemaPrincipal = identificarProblemaPrincipal(d, scores, contexto, dinamica);
  const gapPrincipal = identificarGapPrincipal(d, scores, contexto, problemaPrincipal, dinamica);
  const diagnostico = gerarDiagnosticoExecutivo(d, contexto, scores, scoreMercado, status, dinamica, problemaPrincipal, gapPrincipal);
  const impacto = gerarImpactoEstrategico(d, contexto, scores, dinamica, problemaPrincipal);
  const prioridades = gerarPrioridades(scores, d, contexto, dinamica, problemaPrincipal);
  const recomendacao = gerarRecomendacaoFinal(scores, d, contexto, dinamica);

  return {
    score_mercado: scoreMercado,
    status,
    scores,

    dinamica_mercado: dinamica,
    problema_principal: problemaPrincipal,
    gap_principal: gapPrincipal,

    diagnostico_executivo: diagnostico,
    diagnostico,
    impacto,
    recomendacao,

    prioridades,
    leitura: {
      preco: gerarLeituraPreco(d, scores, contexto),
      concorrencia: gerarLeituraConcorrencia(d, scores, contexto),
      saturacao: gerarLeituraSaturacao(d, scores, contexto),
      barreira: gerarLeituraBarreira(d, scores, contexto),
      oportunidade: gerarLeituraOportunidade(d, scores, contexto),
      contexto_cerebros: gerarLeituraContextoCerebros(contexto)
    }
  };
}

function normalizarDados(data) {
  return {
    category: texto(data.category || data.categoria),
    subcategory: texto(data.subcategory || data.subcategoria),

    avgCategoryPrice: num(data.avgCategoryPrice || data.preco_medio_categoria),
    productPrice: num(data.productPrice || data.seu_preco || data.price),
    mainCompetitors: num(data.mainCompetitors || data.concorrentes_principais),
    competitorsWithStrongReviews: num(data.competitorsWithStrongReviews || data.concorrentes_fortes_reviews),
    avgCompetitorReviews: num(data.avgCompetitorReviews || data.media_reviews_concorrentes),

    competitionLevel: texto(data.competitionLevel || data.nivel_concorrencia),
    marketType: texto(data.marketType || data.tipo_mercado),
    newCompetitors: texto(data.newCompetitors || data.novos_concorrentes),
    pricePressure: texto(data.pricePressure || data.pressao_preco),
    brandDominance: texto(data.brandDominance || data.dominancia_marca),
    reviewDominance: texto(data.reviewDominance || data.dominancia_reviews),
    differentiationSpace: texto(data.differentiationSpace || data.espaco_diferenciacao),
    entryBarrier: texto(data.entryBarrier || data.barreira_entrada),

    marketObservation: texto(data.marketObservation || data.observacao_mercado)
  };
}

function normalizarContexto(c1, c2) {
  return {
    c1: {
      score: num(c1?.score_geral),
      status: c1?.status || "",
      rootCause: c1?.root_cause || c1?.problema_raiz || "",
      ctr: num(c1?.ctr),
      cvr: num(c1?.cvr),
      acos: num(c1?.acos),
      tacos: num(c1?.tacos),
      scores: c1?.scores || {}
    },
    c2: {
      score: num(c2?.score_pagina),
      status: c2?.status || "",
      problem: c2?.problema_principal || "",
      gap: c2?.gap_principal || "",
      scores: c2?.scores || {}
    }
  };
}

function calcularScoresMercado(d, contexto) {
  return {
    competitividade: scoreCompetitividade(d),
    preco: scorePreco(d, contexto),
    saturacao: scoreSaturacao(d),
    barreira_entrada: scoreBarreiraEntrada(d),
    diferenciacao: scoreEspacoDiferenciacao(d, contexto),
    oportunidade: scoreOportunidade(d, contexto),

    risco_preco: nivelRiscoPreco(d),
    risco_reviews: nivelRiscoReviews(d),
    risco_saturacao: nivelRiscoSaturacao(d),
    risco_marca: nivelRiscoMarca(d)
  };
}

function scoreCompetitividade(d) {
  let score = 100;

  if (d.competitionLevel === "Alta") score -= 28;
  if (d.competitionLevel === "Média") score -= 12;

  if (d.mainCompetitors >= 50) score -= 24;
  else if (d.mainCompetitors >= 25) score -= 15;
  else if (d.mainCompetitors >= 10) score -= 7;

  if (d.competitorsWithStrongReviews >= 15) score -= 20;
  else if (d.competitorsWithStrongReviews >= 8) score -= 12;
  else if (d.competitorsWithStrongReviews >= 4) score -= 6;

  if (d.brandDominance === "Alta") score -= 18;
  if (d.reviewDominance === "Alta") score -= 18;

  return clamp(score);
}

function scorePreco(d, contexto) {
  let score = 100;

  if (d.avgCategoryPrice > 0 && d.productPrice > 0) {
    const ratio = d.productPrice / d.avgCategoryPrice;

    if (ratio >= 1.45) score -= 32;
    else if (ratio >= 1.25) score -= 22;
    else if (ratio >= 1.10) score -= 10;

    if (ratio <= 0.65) score -= 10;
  }

  if (d.pricePressure === "Alta") score -= 25;
  if (d.pricePressure === "Média") score -= 12;

  if (contexto?.c2?.scores?.diferenciacao < 65 && d.productPrice > d.avgCategoryPrice) {
    score -= 10;
  }

  return clamp(score);
}

function scoreSaturacao(d) {
  let score = 100;

  if (d.marketType === "Commodity") score -= 28;
  if (d.marketType === "Guerra de preço") score -= 30;
  if (d.marketType === "Dominância de marca") score -= 22;
  if (d.marketType === "Dominância de reviews") score -= 22;

  if (d.newCompetitors === "Sim, muitos") score -= 20;
  if (d.newCompetitors === "Alguns") score -= 10;

  if (d.mainCompetitors >= 40) score -= 18;

  return clamp(score);
}

function scoreBarreiraEntrada(d) {
  let score = 100;

  if (d.entryBarrier === "Alta") score -= 30;
  if (d.entryBarrier === "Média") score -= 14;

  if (d.reviewDominance === "Alta") score -= 18;
  if (d.brandDominance === "Alta") score -= 18;

  if (d.avgCompetitorReviews >= 1000) score -= 18;
  else if (d.avgCompetitorReviews >= 500) score -= 12;
  else if (d.avgCompetitorReviews >= 150) score -= 6;

  return clamp(score);
}

function scoreEspacoDiferenciacao(d, contexto) {
  let score = 100;

  if (d.differentiationSpace === "Baixo") score -= 34;
  if (d.differentiationSpace === "Médio") score -= 14;

  if (d.marketType === "Commodity") score -= 18;
  if (d.marketType === "Guerra de preço") score -= 16;

  if (contexto?.c2?.scores?.diferenciacao < 65) score -= 12;

  return clamp(score);
}

function scoreOportunidade(d, contexto) {
  let score = 100;

  if (d.differentiationSpace === "Alto") score += 8;
  if (d.competitionLevel === "Baixa") score += 8;
  if (d.entryBarrier === "Baixa") score += 8;

  if (d.marketType === "Nicho") score += 8;
  if (d.marketType === "Diferenciação") score += 6;

  if (d.marketType === "Commodity") score -= 22;
  if (d.marketType === "Guerra de preço") score -= 26;
  if (d.brandDominance === "Alta") score -= 14;
  if (d.reviewDominance === "Alta") score -= 14;

  if (contexto?.c1?.score < 60 && contexto?.c2?.score < 60 && score < 70) {
    score -= 10;
  }

  return clamp(score);
}

function calcularScoreGeral(scores) {
  const score =
    scores.competitividade * 0.22 +
    scores.preco * 0.18 +
    scores.saturacao * 0.18 +
    scores.barreira_entrada * 0.16 +
    scores.diferenciacao * 0.16 +
    scores.oportunidade * 0.10;

  return clamp(score);
}

function identificarDinamicaMercado(d, scores, contexto) {
  if (d.marketType === "Guerra de preço" || d.pricePressure === "Alta") {
    return "Guerra de preço";
  }

  if (d.brandDominance === "Alta") {
    return "Dominância de marca";
  }

  if (d.reviewDominance === "Alta" || d.avgCompetitorReviews >= 800) {
    return "Dominância de reviews";
  }

  if (d.marketType === "Commodity" && d.differentiationSpace === "Baixo") {
    return "Mercado commodity";
  }

  if (d.differentiationSpace === "Alto" && d.competitionLevel !== "Alta") {
    return "Mercado com espaço para diferenciação";
  }

  if (d.marketType === "Nicho") {
    return "Mercado de nicho";
  }

  return "Mercado competitivo moderado";
}

function identificarProblemaPrincipal(d, scores, contexto, dinamica) {
  if (dinamica === "Guerra de preço") {
    return "O mercado pressiona preço e pode reduzir margem antes de permitir escala saudável";
  }

  if (dinamica === "Dominância de marca") {
    return "Marcas fortes concentram confiança e dificultam entrada de produtos menos conhecidos";
  }

  if (dinamica === "Dominância de reviews") {
    return "Concorrentes com alta prova social elevam a barreira de conversão";
  }

  if (scores.diferenciacao < 55) {
    return "O produto não possui espaço claro de diferenciação frente ao mercado";
  }

  if (scores.preco < 55) {
    return "O preço está desalinhado com a percepção média da categoria";
  }

  if (scores.competitividade < 55) {
    return "A intensidade competitiva limita crescimento sem uma vantagem clara";
  }

  if (scores.oportunidade >= 75) {
    return "O mercado tem oportunidade, mas exige execução consistente de página, oferta e mídia";
  }

  return "O mercado não bloqueia completamente, mas exige posicionamento mais preciso";
}

function identificarGapPrincipal(d, scores, contexto, problema, dinamica) {
  if (dinamica === "Guerra de preço") {
    return "O gap principal está entre preço, margem e valor percebido. Se o produto entra em uma categoria de preço agressivo sem diferenciação clara, a escala tende a depender de desconto e mídia.";
  }

  if (dinamica === "Dominância de marca") {
    return "O gap principal está na confiança. O cliente pode preferir marcas conhecidas mesmo quando a oferta alternativa parece boa.";
  }

  if (dinamica === "Dominância de reviews") {
    return "O gap principal está na prova social. Concorrentes com muitos reviews reduzem a percepção de risco, enquanto produtos com menor histórico precisam compensar com conteúdo, oferta ou diferenciação.";
  }

  if (scores.diferenciacao < 55) {
    return "O gap principal está na ausência de uma razão forte para escolha. O produto precisa deixar claro por que deve ser comprado em vez de opções similares.";
  }

  if (scores.preco < 55) {
    return "O gap principal está no desalinhamento de preço. O mercado pode estar sinalizando que a oferta precisa justificar melhor o valor cobrado.";
  }

  return "O gap principal está no alinhamento estratégico. Mercado, página e performance precisam contar a mesma história para o produto escalar.";
}

function gerarDiagnosticoExecutivo(d, contexto, scores, score, status, dinamica, problema, gap) {
  return `
O Cérebro 3 avaliou o contexto competitivo do produto considerando preço, concorrência, saturação, barreira de entrada, dominância de marca/reviews e espaço de diferenciação.

Score de mercado: ${score}/100.
Status: ${status}.
Dinâmica identificada: ${dinamica}.

Problema principal:
${problema}

Gap principal:
${gap}

Conexão com os Cérebros anteriores:
${gerarLeituraContextoCerebros(contexto)}

Leitura de preço:
${gerarLeituraPreco(d, scores, contexto)}

Leitura de concorrência:
${gerarLeituraConcorrencia(d, scores, contexto)}

Leitura de saturação:
${gerarLeituraSaturacao(d, scores, contexto)}

Leitura de barreira de entrada:
${gerarLeituraBarreira(d, scores, contexto)}

Leitura de oportunidade:
${gerarLeituraOportunidade(d, scores, contexto)}

Interpretação estratégica:
O mercado define o quanto uma melhoria interna realmente consegue gerar crescimento. Um produto pode ter página boa e mídia razoável, mas se está em uma categoria dominada por preço, reviews ou marcas fortes, a estratégia precisa ser diferente. Nesse cenário, simplesmente aumentar tráfego pode não resolver o problema.

O papel do Cérebro 3 é identificar se a trava está no mercado, se o mercado agrava os problemas dos Cérebros 1 e 2, ou se existe oportunidade real de escala com ajustes de posicionamento, conteúdo, preço e oferta.
`.trim();
}

function gerarLeituraContextoCerebros(contexto) {
  const c1 = contexto?.c1 || {};
  const c2 = contexto?.c2 || {};

  if (!c1.rootCause && !c2.problem) {
    return "Não há contexto suficiente dos Cérebros 1 e 2. A leitura de mercado foi feita de forma independente.";
  }

  return `O Cérebro 1 apontou: ${c1.rootCause || "sem causa raiz registrada"}. O Cérebro 2 apontou: ${c2.problem || "sem problema de página registrado"}. O Cérebro 3 valida se o mercado reforça ou reduz essa hipótese.`;
}

function gerarLeituraPreco(d, scores, contexto) {
  if (!d.avgCategoryPrice || !d.productPrice) {
    return "Preço médio e preço do produto não foram totalmente informados. A leitura de preço fica limitada.";
  }

  const ratio = d.productPrice / d.avgCategoryPrice;

  if (ratio >= 1.3) {
    return "O produto está significativamente acima do preço médio da categoria. Para sustentar esse preço, a página precisa comunicar diferenciação, confiança e valor superior.";
  }

  if (ratio <= 0.75) {
    return "O produto está abaixo do preço médio. Isso pode ajudar no clique, mas também pode reduzir percepção de qualidade se a marca e a página não sustentarem confiança.";
  }

  return "O preço está relativamente próximo da média de mercado. A competição deve depender mais de diferenciação, página, prova social e oferta do que apenas preço.";
}

function gerarLeituraConcorrencia(d, scores, contexto) {
  if (scores.competitividade < 55) {
    return "A concorrência está pesada. Há muitos competidores ou players com força suficiente para dificultar crescimento sem uma proposta clara.";
  }

  if (scores.competitividade < 75) {
    return "A concorrência é relevante, mas não necessariamente impeditiva. O produto precisa competir com clareza de posicionamento.";
  }

  return "A intensidade competitiva parece administrável. O mercado não apresenta, sozinho, uma barreira crítica de concorrência.";
}

function gerarLeituraSaturacao(d, scores, contexto) {
  if (scores.saturacao < 55) {
    return "O mercado mostra sinais de saturação. Isso significa menor tolerância a ofertas genéricas e maior pressão por preço, reviews ou diferenciação.";
  }

  if (scores.saturacao < 75) {
    return "O mercado tem competição moderada e algum nível de saturação. A execução precisa ser precisa para evitar comparação direta.";
  }

  return "O mercado não parece extremamente saturado. Existe espaço para posicionamento se página, oferta e tráfego forem bem executados.";
}

function gerarLeituraBarreira(d, scores, contexto) {
  if (scores.barreira_entrada < 55) {
    return "A barreira de entrada é alta. O produto precisa compensar falta de histórico, marca ou reviews com uma oferta muito clara e confiável.";
  }

  if (scores.barreira_entrada < 75) {
    return "Existe barreira intermediária. O produto pode competir, mas precisa construir autoridade de forma consistente.";
  }

  return "A barreira de entrada parece administrável. O produto tem condições de competir se a execução for forte.";
}

function gerarLeituraOportunidade(d, scores, contexto) {
  if (scores.oportunidade < 55) {
    return "A oportunidade de escala é limitada no cenário atual. Antes de investir mais, é necessário ajustar posicionamento, diferenciação ou oferta.";
  }

  if (scores.oportunidade < 75) {
    return "Existe oportunidade, mas ela não é automática. O produto precisa corrigir gaps internos para capturar o potencial do mercado.";
  }

  return "Há oportunidade de mercado. Se os problemas de página e performance forem corrigidos, o produto pode ganhar tração.";
}

function gerarImpactoEstrategico(d, contexto, scores, dinamica, problema) {
  if (dinamica === "Guerra de preço") {
    return "O principal impacto é compressão de margem. O seller pode crescer em vendas, mas perder rentabilidade se competir sem diferenciação.";
  }

  if (dinamica === "Dominância de reviews") {
    return "O principal impacto é menor conversão relativa. Concorrentes com prova social forte reduzem o risco percebido e dificultam a escolha do produto analisado.";
  }

  if (dinamica === "Dominância de marca") {
    return "O principal impacto é disputa desigual de confiança. Marcas conhecidas recebem preferência mesmo com ofertas alternativas competitivas.";
  }

  if (scores.diferenciacao < 60) {
    return "O principal impacto é comparação direta. Sem diferenciação, o produto tende a competir por preço, cupom ou mídia.";
  }

  return "O impacto principal está na necessidade de coerência estratégica. Mercado, página e mídia precisam estar alinhados para gerar escala eficiente.";
}

function gerarPrioridades(scores, d, contexto, dinamica, problema) {
  const list = [];

  if (scores.preco < 70) {
    list.push({
      prioridade: "URGENTE",
      titulo: "Reavaliar preço versus valor percebido",
      detalhe: "Comparar o preço do produto com a média e reforçar justificativas de valor se estiver acima da categoria.",
      impacto: "Reduz resistência de compra e melhora competitividade"
    });
  }

  if (scores.diferenciacao < 70) {
    list.push({
      prioridade: "URGENTE",
      titulo: "Construir diferenciação clara contra concorrentes",
      detalhe: "Definir um motivo objetivo para o cliente escolher este produto em vez de opções similares.",
      impacto: "Evita guerra de preço e melhora conversão"
    });
  }

  if (scores.barreira_entrada < 70) {
    list.push({
      prioridade: "IMPORTANTE",
      titulo: "Compensar barreira de reviews ou marca",
      detalhe: "Fortalecer prova social, imagens de uso, autoridade, garantia, A+ e comunicação de confiança.",
      impacto: "Reduz desvantagem frente a concorrentes consolidados"
    });
  }

  if (scores.saturacao < 70) {
    list.push({
      prioridade: "IMPORTANTE",
      titulo: "Evitar posicionamento genérico em mercado saturado",
      detalhe: "Ajustar página, oferta e mensagem para fugir da comparação direta por preço.",
      impacto: "Aumenta chance de preferência e protege margem"
    });
  }

  if (scores.oportunidade >= 75) {
    list.push({
      prioridade: "ESTRATÉGICO",
      titulo: "Escalar com controle após correções internas",
      detalhe: "O mercado permite oportunidade, mas a escala deve vir depois de ajustes de página, oferta e mídia.",
      impacto: "Aumenta chance de crescimento sustentável"
    });
  }

  if (list.length === 0) {
    list.push({
      prioridade: "ESTRATÉGICO",
      titulo: "Ajustar posicionamento antes de aumentar investimento",
      detalhe: "O mercado não impede totalmente, mas exige mais precisão na proposta de valor.",
      impacto: "Melhora eficiência antes da escala"
    });
  }

  return list.slice(0, 5);
}

function gerarRecomendacaoFinal(scores, d, contexto, dinamica) {
  if (scores.oportunidade < 55) {
    return "Não escalar agressivamente agora. Primeiro corrija posicionamento, preço, diferenciação e prova social.";
  }

  if (dinamica === "Guerra de preço") {
    return "Evitar competir apenas por preço. Trabalhar diferenciação, kits, oferta, branding e eficiência de mídia.";
  }

  if (dinamica === "Dominância de reviews") {
    return "Construir confiança antes de escalar. A página precisa compensar a diferença de prova social.";
  }

  if (scores.oportunidade >= 75 && contexto?.c2?.score >= 70) {
    return "Existe espaço para escala controlada, desde que mídia e estoque acompanhem a execução.";
  }

  return "Prosseguir com cautela. O mercado permite atuação, mas exige ajustes coordenados antes de aumentar investimento.";
}

function nivelRiscoPreco(d) {
  if (!d.avgCategoryPrice || !d.productPrice) return "INDEFINIDO";

  const ratio = d.productPrice / d.avgCategoryPrice;

  if (ratio >= 1.3 || d.pricePressure === "Alta") return "ALTO";
  if (ratio >= 1.1 || d.pricePressure === "Média") return "MÉDIO";
  return "BAIXO";
}

function nivelRiscoReviews(d) {
  if (d.reviewDominance === "Alta" || d.avgCompetitorReviews >= 800) return "ALTO";
  if (d.reviewDominance === "Média" || d.avgCompetitorReviews >= 250) return "MÉDIO";
  return "BAIXO";
}

function nivelRiscoSaturacao(d) {
  if (d.marketType === "Commodity" || d.marketType === "Guerra de preço" || d.competitionLevel === "Alta") return "ALTO";
  if (d.competitionLevel === "Média") return "MÉDIO";
  return "BAIXO";
}

function nivelRiscoMarca(d) {
  if (d.brandDominance === "Alta") return "ALTO";
  if (d.brandDominance === "Média") return "MÉDIO";
  return "BAIXO";
}

function classificarStatus(score) {
  if (score < 40) return "Crítico";
  if (score < 60) return "Em risco";
  if (score < 75) return "Em atenção";
  if (score < 90) return "Saudável";
  return "Forte";
}

function num(v) {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function texto(v) {
  return String(v ?? "").trim();
}

function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}
