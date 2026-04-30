// NEXORA · CÉREBRO 2 ENGINE
// Análise profunda de página, atratividade, SEO, comunicação, confiança e conversão

export function analisarPaginaBase(data, c1 = null) {
  const d = normalizarDados(data);
  const contexto = normalizarC1(c1);

  const scores = calcularScoresPagina(d, contexto);
  const scoreGeral = calcularScoreGeral(scores);
  const status = classificarStatus(scoreGeral);

  const problemaPrincipal = identificarProblemaPrincipal(scores, d, contexto);
  const gapPrincipal = identificarGapPrincipal(scores, d, contexto, problemaPrincipal);
  const diagnostico = gerarDiagnosticoExecutivo(d, contexto, scores, scoreGeral, status, problemaPrincipal, gapPrincipal);
  const impacto = gerarImpacto(problemaPrincipal, contexto, scores);
  const prioridades = gerarPrioridades(scores, d, contexto, problemaPrincipal);

  return {
    score_pagina: scoreGeral,
    status,
    scores,

    problema_principal: problemaPrincipal,
    gap_principal: gapPrincipal,
    diagnostico_executivo: diagnostico,
    diagnostico,
    impacto,

    prioridades,
    gaps: gerarGaps(scores, d, contexto),

    leitura: {
      imagem: gerarLeituraImagem(d, scores, contexto),
      titulo_seo: gerarLeituraTituloSEO(d, scores, contexto),
      comunicacao: gerarLeituraComunicacao(d, scores, contexto),
      confianca: gerarLeituraConfianca(d, scores, contexto),
      oferta: gerarLeituraOferta(d, scores, contexto)
    }
  };
}

function normalizarDados(data) {
  return {
    title: texto(data.title || data.titulo),
    keyword: texto(data.keyword || data.palavra_chave),
    mainBenefit: texto(data.mainBenefit || data.beneficio_principal),
    bullets: texto(data.bullets || data.argumentos),
    differentials: texto(data.differentials || data.diferenciais),
    objections: texto(data.objections || data.objecoes),
    description: texto(data.description || data.descricao),

    reviews: num(data.reviews),
    rating: num(data.rating),
    price: num(data.price || data.preco),

    imageClarity: data.imageClarity || data.imagem_clara || "",
    oneSecondUnderstanding: data.oneSecondUnderstanding || data.entende_1s || "",
    benefitVisible: data.benefitVisible || data.beneficio_visivel || "",
    competitiveContrast: data.competitiveContrast || data.contraste_competitivo || "",
    visualPerception: data.visualPerception || data.percepcao_visual || "",

    titleQuality: data.titleQuality || data.qualidade_titulo || "",
    seoQuality: data.seoQuality || data.qualidade_seo || "",
    titleClarity: data.titleClarity || data.clareza_titulo || "",

    communicationQuality: data.communicationQuality || data.qualidade_comunicacao || "",
    differentiationQuality: data.differentiationQuality || data.qualidade_diferenciacao || "",
    objectionCoverage: data.objectionCoverage || data.cobre_objecoes || "",

    hasAplus: bool(data.hasAplus),
    hasVideo: bool(data.hasVideo),
    hasCoupon: bool(data.hasCoupon),
    hasSocialImages: bool(data.hasSocialImages || data.hasUserImages),

    trustLevel: data.trustLevel || data.nivel_confianca || "",
    offerAlignment: data.offerAlignment || data.alinhamento_oferta || ""
  };
}

function normalizarC1(c1) {
  return {
    category: c1?.category || c1?.cat || "",
    subcategory: c1?.subcategory || c1?.sub || "",
    ctr: num(c1?.ctr),
    cvr: num(c1?.cvr),
    acos: num(c1?.acos),
    tacos: num(c1?.tacos),
    rootCause: c1?.root_cause || c1?.problema_raiz || "",
    c1Score: num(c1?.score_geral),
    c1Status: c1?.status || "",
    c1Scores: c1?.scores || {}
  };
}

function calcularScoresPagina(d, c1) {
  return {
    atratividade_visual: scoreAtratividadeVisual(d, c1),
    titulo_seo: scoreTituloSEO(d, c1),
    comunicacao_valor: scoreComunicacaoValor(d, c1),
    confianca: scoreConfianca(d, c1),
    diferenciacao: scoreDiferenciacao(d, c1),
    oferta: scoreOferta(d, c1),

    ctr_readiness: scoreCTRReadiness(d, c1),
    cvr_readiness: scoreCVRReadiness(d, c1)
  };
}

function scoreAtratividadeVisual(d, c1) {
  let score = 100;

  if (d.imageClarity === "Fraca") score -= 30;
  if (d.imageClarity === "Média") score -= 14;

  if (d.oneSecondUnderstanding === "Não") score -= 24;
  if (d.oneSecondUnderstanding === "Parcial") score -= 12;

  if (d.benefitVisible === "Não") score -= 20;
  if (d.benefitVisible === "Parcial") score -= 10;

  if (d.competitiveContrast === "Baixo") score -= 18;
  if (d.competitiveContrast === "Médio") score -= 8;

  if (d.visualPerception === "Genérica") score -= 18;
  if (d.visualPerception === "Pouco premium") score -= 10;

  if (c1?.c1Scores?.atracao < 65 || String(c1?.rootCause || "").includes("Atração")) {
    score -= 8;
  }

  return clamp(score);
}

function scoreTituloSEO(d, c1) {
  let score = 100;

  if (d.title.length < 50) score -= 22;
  else if (d.title.length < 90) score -= 10;

  if (!d.keyword) score -= 18;
  if (!d.mainBenefit) score -= 12;

  if (d.titleQuality === "Genérico") score -= 20;
  if (d.titleQuality === "Poluído") score -= 18;
  if (d.titleQuality === "Fraco em SEO") score -= 18;

  if (d.seoQuality === "Fraco") score -= 22;
  if (d.seoQuality === "Médio") score -= 10;

  if (d.titleClarity === "Confuso") score -= 20;
  if (d.titleClarity === "Parcial") score -= 10;

  return clamp(score);
}

function scoreComunicacaoValor(d, c1) {
  let score = 100;

  if (d.bullets.length < 120) score -= 24;
  else if (d.bullets.length < 220) score -= 10;

  if (!d.mainBenefit) score -= 12;
  if (!d.objections) score -= 10;

  if (d.communicationQuality === "Só características") score -= 24;
  if (d.communicationQuality === "Confusa") score -= 22;
  if (d.communicationQuality === "Fraca") score -= 18;
  if (d.communicationQuality === "Convincente") score += 4;

  if (d.objectionCoverage === "Não cobre") score -= 18;
  if (d.objectionCoverage === "Cobre parcialmente") score -= 8;

  if (c1?.c1Scores?.conversao < 65 || String(c1?.rootCause || "").includes("Conversão")) {
    score -= 8;
  }

  return clamp(score);
}

function scoreConfianca(d, c1) {
  let score = 100;

  if (d.reviews <= 0) score -= 28;
  else if (d.reviews < 10) score -= 22;
  else if (d.reviews < 50) score -= 12;

  if (d.rating > 0 && d.rating < 4.0) score -= 24;
  else if (d.rating > 0 && d.rating < 4.3) score -= 12;

  if (!d.hasAplus) score -= 8;
  if (!d.hasVideo) score -= 8;
  if (!d.hasSocialImages) score -= 8;

  if (d.trustLevel === "Baixa") score -= 24;
  if (d.trustLevel === "Média") score -= 10;

  return clamp(score);
}

function scoreDiferenciacao(d, c1) {
  let score = 100;

  if (!d.differentials || d.differentials.length < 40) score -= 24;

  if (d.differentiationQuality === "Fraca") score -= 26;
  if (d.differentiationQuality === "Média") score -= 12;
  if (d.differentiationQuality === "Commodity") score -= 30;
  if (d.differentiationQuality === "Forte") score += 5;

  if (d.visualPerception === "Genérica") score -= 10;
  if (d.communicationQuality === "Só características") score -= 10;

  return clamp(score);
}

function scoreOferta(d, c1) {
  let score = 100;

  if (d.offerAlignment === "Desalinhada") score -= 28;
  if (d.offerAlignment === "Parcial") score -= 12;

  if (!d.hasCoupon) score -= 4;

  if (d.price <= 0) score -= 8;

  if (c1?.rootCause?.includes("Rentabilidade") && d.offerAlignment !== "Alinhada") {
    score -= 8;
  }

  return clamp(score);
}

function scoreCTRReadiness(d, c1) {
  const score =
    scoreAtratividadeVisual(d, c1) * 0.45 +
    scoreTituloSEO(d, c1) * 0.35 +
    scoreOferta(d, c1) * 0.20;

  return clamp(score);
}

function scoreCVRReadiness(d, c1) {
  const score =
    scoreComunicacaoValor(d, c1) * 0.35 +
    scoreConfianca(d, c1) * 0.30 +
    scoreDiferenciacao(d, c1) * 0.20 +
    scoreOferta(d, c1) * 0.15;

  return clamp(score);
}

function calcularScoreGeral(scores) {
  const score =
    scores.atratividade_visual * 0.18 +
    scores.titulo_seo * 0.16 +
    scores.comunicacao_valor * 0.22 +
    scores.confianca * 0.18 +
    scores.diferenciacao * 0.16 +
    scores.oferta * 0.10;

  return clamp(score);
}

function identificarProblemaPrincipal(scores, d, c1) {
  if (scores.atratividade_visual < 55 && c1?.ctr > 0 && c1?.ctr < 0.6) {
    return "A página não sustenta atração: imagem e apresentação visual não geram clique suficiente";
  }

  if (scores.comunicacao_valor < 55 && c1?.cvr > 0) {
    return "Comunicação fraca: a página não transforma interesse em decisão de compra";
  }

  if (scores.confianca < 55) {
    return "Confiança insuficiente: prova social e elementos de segurança não sustentam a conversão";
  }

  if (scores.diferenciacao < 55) {
    return "Diferenciação fraca: o produto parece substituível frente à concorrência";
  }

  if (scores.titulo_seo < 55) {
    return "Título e SEO frágeis: a página não comunica intenção, keyword e benefício com clareza";
  }

  if (scores.oferta < 55) {
    return "Oferta desalinhada: preço, percepção de valor e incentivo não estão bem equilibrados";
  }

  if (scores.ctr_readiness < scores.cvr_readiness) {
    return "A página tem maior risco de atração do que de conversão";
  }

  if (scores.cvr_readiness < scores.ctr_readiness) {
    return "A página tem maior risco de conversão do que de atração";
  }

  return "Página funcional, mas com oportunidade de otimização estratégica";
}

function identificarGapPrincipal(scores, d, c1, problema) {
  if (problema.includes("atração")) {
    return "O principal gap está no primeiro contato visual: antes de vender, a página precisa fazer o cliente escolher o clique. Se imagem, título e oferta não se destacam, o produto perde a disputa ainda no resultado de busca.";
  }

  if (problema.includes("Comunicação")) {
    return "O principal gap está na clareza da proposta de valor. A página pode até explicar o produto, mas ainda não convence com força suficiente por que ele deve ser escolhido agora.";
  }

  if (problema.includes("Confiança")) {
    return "O principal gap está na segurança percebida. Reviews, rating, vídeo, A+ e prova visual precisam reduzir risco e aumentar confiança antes da compra.";
  }

  if (problema.includes("Diferenciação")) {
    return "O principal gap está na percepção de valor. Se o produto parece parecido com todos os outros, o cliente tende a comparar por preço ou reviews.";
  }

  if (problema.includes("Título")) {
    return "O principal gap está no alinhamento entre busca, clareza e benefício. Um título fraco reduz relevância percebida e pode afetar clique, SEO e conversão.";
  }

  if (problema.includes("Oferta")) {
    return "O principal gap está na relação entre preço e valor percebido. A página precisa justificar o preço ou tornar a oferta mais atrativa.";
  }

  return "O gap não está concentrado em um único ponto. A página precisa de ajustes coordenados em atratividade, confiança e comunicação.";
}

function gerarDiagnosticoExecutivo(d, c1, scores, score, status, problema, gap) {
  return `
O Cérebro 2 avaliou a página do produto com foco em atratividade, SEO, comunicação, confiança, diferenciação e oferta.

Score da página: ${score}/100.
Status: ${status}.

Problema principal identificado:
${problema}

Gap principal:
${gap}

Leitura conectada ao Cérebro 1:
${gerarLeituraContextoC1(c1)}

Leitura de imagem e atratividade:
${gerarLeituraImagem(d, scores, c1)}

Leitura de título e SEO:
${gerarLeituraTituloSEO(d, scores, c1)}

Leitura de comunicação e valor:
${gerarLeituraComunicacao(d, scores, c1)}

Leitura de confiança:
${gerarLeituraConfianca(d, scores, c1)}

Leitura de oferta:
${gerarLeituraOferta(d, scores, c1)}

Interpretação estratégica:
Na Amazon, a página não é apenas uma vitrine. Ela é o ponto onde o algoritmo observa se o tráfego recebido gera clique, permanência, confiança e compra. Quando a página falha em comunicar valor, reduzir objeções ou diferenciar o produto, o seller pode acabar tentando resolver o problema com mídia, quando na verdade o bloqueio está na própria estrutura da oferta.

A prioridade do Cérebro 2 é entender se a página confirma ou contradiz a hipótese do Cérebro 1. Se o Cérebro 1 apontou conversão e a página mostra falhas de confiança, comunicação ou diferenciação, a causa raiz ganha força. Se o Cérebro 1 apontou atração e a imagem/título estão fracos, o problema começa antes do clique.
`.trim();
}

function gerarLeituraContextoC1(c1) {
  if (!c1 || !c1.rootCause) {
    return "O Cérebro 1 não trouxe contexto suficiente. A análise da página foi feita de forma independente.";
  }

  return `O Cérebro 1 indicou como causa raiz inicial: ${c1.rootCause}. Isso significa que a página precisa ser avaliada não apenas pela aparência, mas pela capacidade de explicar esse bloqueio de performance.`;
}

function gerarLeituraImagem(d, scores, c1) {
  if (scores.atratividade_visual < 55) {
    return "A atratividade visual está crítica. A imagem principal provavelmente não comunica o produto, benefício ou diferencial rápido o suficiente para disputar clique em um ambiente competitivo.";
  }

  if (scores.atratividade_visual < 75) {
    return "A imagem principal possui pontos de atenção. Ela pode estar clara, mas ainda não parece forte o bastante para gerar vantagem competitiva no resultado de busca.";
  }

  return "A atratividade visual parece saudável. A imagem principal tende a sustentar a primeira camada de clique, desde que preço e título estejam coerentes.";
}

function gerarLeituraTituloSEO(d, scores, c1) {
  if (scores.titulo_seo < 55) {
    return "O título e SEO estão frágeis. Isso pode prejudicar tanto a indexação quanto a clareza para o cliente. Um título fraco reduz relevância e pode afetar CTR.";
  }

  if (scores.titulo_seo < 75) {
    return "O título tem base funcional, mas ainda pode melhorar em clareza, keyword principal e comunicação de benefício.";
  }

  return "O título e SEO parecem bem estruturados. A página tende a comunicar bem intenção de busca e proposta principal.";
}

function gerarLeituraComunicacao(d, scores, c1) {
  if (scores.comunicacao_valor < 55) {
    return "A comunicação de valor está fraca. A página pode estar descrevendo o produto, mas não está convencendo o cliente de forma clara, emocional e racional.";
  }

  if (scores.comunicacao_valor < 75) {
    return "A comunicação possui boa base, mas ainda pode melhorar ao transformar características em benefícios, responder objeções e reforçar diferenciais.";
  }

  return "A comunicação de valor está saudável. A página tende a explicar bem o que o produto entrega e por que vale a escolha.";
}

function gerarLeituraConfianca(d, scores, c1) {
  if (scores.confianca < 55) {
    return "A confiança percebida está baixa. Reviews, rating, vídeo, A+ ou prova visual podem não ser suficientes para reduzir risco de compra.";
  }

  if (scores.confianca < 75) {
    return "A confiança está em nível intermediário. A página não está necessariamente fraca, mas ainda pode reforçar segurança e prova social.";
  }

  return "A confiança está saudável. A página tem sinais suficientes para apoiar decisão de compra, desde que oferta e diferenciação estejam coerentes.";
}

function gerarLeituraOferta(d, scores, c1) {
  if (scores.oferta < 55) {
    return "A oferta parece desalinhada. O preço, incentivo ou valor percebido não estão suficientemente equilibrados para facilitar a decisão.";
  }

  if (scores.oferta < 75) {
    return "A oferta é aceitável, mas ainda pode ganhar força com cupom, melhor ancoragem de valor ou diferenciação mais evidente.";
  }

  return "A oferta parece coerente com a proposta de valor apresentada.";
}

function gerarImpacto(problema, c1, scores) {
  if (problema.includes("atração")) {
    return "O impacto principal é perda de clique. Mesmo que a página tenha bons elementos internos, o produto pode não receber tráfego suficiente para provar conversão.";
  }

  if (problema.includes("Comunicação") || problema.includes("conversão")) {
    return "O impacto principal é desperdício de tráfego. O cliente chega na página, mas não recebe argumentos suficientes para avançar até a compra.";
  }

  if (problema.includes("Confiança")) {
    return "O impacto principal é fricção na decisão. O cliente pode até se interessar, mas hesita por falta de segurança, prova social ou validação.";
  }

  if (problema.includes("Diferenciação")) {
    return "O impacto principal é comparação por preço. Sem diferenciação, o produto perde margem e depende mais de desconto ou mídia.";
  }

  return "O impacto principal é perda de eficiência. A página pode até funcionar, mas não extrai todo o potencial do tráfego recebido.";
}

function gerarPrioridades(scores, d, c1, problema) {
  const list = [];

  if (scores.atratividade_visual < 75) {
    list.push({
      prioridade: "URGENTE",
      titulo: "Reforçar imagem principal e primeira impressão",
      detalhe: "Ajustar clareza visual, benefício, contraste competitivo e percepção de valor no primeiro contato.",
      impacto: "Aumenta chance de clique e melhora leitura de CTR"
    });
  }

  if (scores.comunicacao_valor < 75) {
    list.push({
      prioridade: "IMPORTANTE",
      titulo: "Reestruturar bullets para vender benefício",
      detalhe: "Transformar características em benefícios, responder objeções e deixar a promessa mais clara.",
      impacto: "Melhora conversão e eficiência de tráfego"
    });
  }

  if (scores.confianca < 75) {
    list.push({
      prioridade: "IMPORTANTE",
      titulo: "Fortalecer prova social e confiança",
      detalhe: "Trabalhar reviews, rating, vídeo, A+, fotos de uso e elementos que reduzam risco percebido.",
      impacto: "Reduz fricção e aumenta segurança de compra"
    });
  }

  if (scores.diferenciacao < 75) {
    list.push({
      prioridade: "ESTRATÉGICO",
      titulo: "Evidenciar diferenciais competitivos",
      detalhe: "Deixar claro por que o produto deve ser escolhido em vez de opções parecidas.",
      impacto: "Evita competição apenas por preço"
    });
  }

  if (scores.titulo_seo < 75) {
    list.push({
      prioridade: "ESTRATÉGICO",
      titulo: "Melhorar título e alinhamento com busca",
      detalhe: "Revisar keyword principal, clareza do produto e benefício central.",
      impacto: "Melhora relevância, CTR e potencial orgânico"
    });
  }

  if (list.length === 0) {
    list.push({
      prioridade: "ESTRATÉGICO",
      titulo: "Otimizar página para escala",
      detalhe: "A página possui boa base. O próximo passo é testar melhorias incrementais em imagem, oferta e comunicação.",
      impacto: "Gera ganhos marginais sem ruptura estrutural"
    });
  }

  return list.slice(0, 5);
}

function gerarGaps(scores, d, c1) {
  const gaps = [];

  if (scores.atratividade_visual < 65) {
    gaps.push({
      nivel: "ALTO",
      descricao: "A imagem e a apresentação visual podem estar limitando o clique."
    });
  }

  if (scores.comunicacao_valor < 65) {
    gaps.push({
      nivel: "CRÍTICO",
      descricao: "A comunicação de valor não sustenta conversão com força suficiente."
    });
  }

  if (scores.confianca < 65) {
    gaps.push({
      nivel: "ALTO",
      descricao: "A página precisa reforçar confiança e prova social."
    });
  }

  if (scores.diferenciacao < 65) {
    gaps.push({
      nivel: "ALTO",
      descricao: "O produto não está suficientemente diferenciado."
    });
  }

  return gaps;
}

function classificarStatus(score) {
  if (score < 40) return "Crítico";
  if (score < 60) return "Em risco";
  if (score < 75) return "Em atenção";
  if (score < 90) return "Saudável";
  return "Forte";
}

function bool(value) {
  if (value === true || value === "true" || value === "Sim") return true;
  if (value === false || value === "false" || value === "Não") return false;
  return false;
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
