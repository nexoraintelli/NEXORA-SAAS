// NEXORA · SYNTHESIS ENGINE
// Síntese estratégica final cruzando Cérebro 1, Cérebro 2 e Cérebro 3

export function gerarSinteseFinal(c1 = null, c2 = null, c3 = null) {
  const C1 = normalizarC1(c1);
  const C2 = normalizarC2(c2);
  const C3 = normalizarC3(c3);

  const scores = calcularScoresFinais(C1, C2, C3);
  const scoreFinal = calcularScoreFinal(scores);
  const gravidade = classificarGravidade(scoreFinal, C1, C2, C3);

  const causaRaiz = identificarCausaRaizConsolidada(C1, C2, C3, scores);
  const leituraCruzada = gerarLeituraCruzada(C1, C2, C3, causaRaiz);
  const diagnosticoExecutivo = gerarDiagnosticoExecutivoFinal(C1, C2, C3, scores, scoreFinal, gravidade, causaRaiz, leituraCruzada);
  const gaps = gerarGapsConsolidados(C1, C2, C3, scores, causaRaiz);
  const prioridades = gerarPrioridadesFinais(C1, C2, C3, scores, causaRaiz);
  const planoAcao = gerarPlanoAcao(prioridades, causaRaiz, C1, C2, C3);
  const recomendacao = gerarRecomendacaoEstrategica(C1, C2, C3, scores, causaRaiz, gravidade);
  const resumoCliente = gerarResumoParaCliente(causaRaiz, gravidade, prioridades, recomendacao);

  return {
    score_final: scoreFinal,
    gravidade,
    causa_raiz_consolidada: causaRaiz,

    scores,
    leitura_cruzada: leituraCruzada,
    diagnostico_executivo: diagnosticoExecutivo,
    resumo_cliente: resumoCliente,

    gaps,
    prioridades,
    plano_acao: planoAcao,
    recomendacao,

    leitura_cerebros: {
      cerebro_1: gerarResumoC1(C1),
      cerebro_2: gerarResumoC2(C2),
      cerebro_3: gerarResumoC3(C3)
    },

    matriz_decisao: gerarMatrizDecisao(C1, C2, C3, scores),
    ts: new Date().toISOString()
  };
}

function normalizarC1(c1) {
  const scores = c1?.scores || {};

  return {
    exists: !!c1,
    score: num(c1?.score_geral || c1?.score || c1?.score_final),
    status: txt(c1?.status),
    rootCause: txt(c1?.root_cause || c1?.problema_raiz || c1?.causa_raiz),
    diagnostic: txt(c1?.diagnostico_executivo || c1?.diagnostico || c1?.summary),
    impact: txt(c1?.impacto),
    priorities: arr(c1?.prioridades),
    ctr: num(c1?.ctr),
    cvr: num(c1?.cvr),
    acos: num(c1?.acos),
    tacos: num(c1?.tacos),
    roas: num(c1?.roas),
    scores: {
      atracao: num(scores.atracao),
      conversao: num(scores.conversao),
      ppc: num(scores.ppc),
      rentabilidade: num(scores.rentabilidade),
      operacao: num(scores.operacao)
    }
  };
}

function normalizarC2(c2) {
  const scores = c2?.scores || {};

  return {
    exists: !!c2,
    score: num(c2?.score_pagina || c2?.score),
    status: txt(c2?.status),
    problem: txt(c2?.problema_principal),
    gap: txt(c2?.gap_principal),
    diagnostic: txt(c2?.diagnostico_executivo || c2?.diagnostico),
    impact: txt(c2?.impacto),
    priorities: arr(c2?.prioridades),
    scores: {
      atratividade_visual: num(scores.atratividade_visual),
      titulo_seo: num(scores.titulo_seo),
      comunicacao_valor: num(scores.comunicacao_valor),
      confianca: num(scores.confianca),
      diferenciacao: num(scores.diferenciacao),
      oferta: num(scores.oferta),
      ctr_readiness: num(scores.ctr_readiness),
      cvr_readiness: num(scores.cvr_readiness)
    }
  };
}

function normalizarC3(c3) {
  const scores = c3?.scores || {};

  return {
    exists: !!c3,
    score: num(c3?.score_mercado || c3?.score),
    status: txt(c3?.status),
    dynamic: txt(c3?.dinamica_mercado),
    problem: txt(c3?.problema_principal),
    gap: txt(c3?.gap_principal),
    diagnostic: txt(c3?.diagnostico_executivo || c3?.diagnostico),
    impact: txt(c3?.impacto),
    recommendation: txt(c3?.recomendacao),
    priorities: arr(c3?.prioridades),
    scores: {
      competitividade: num(scores.competitividade),
      preco: num(scores.preco),
      saturacao: num(scores.saturacao),
      barreira_entrada: num(scores.barreira_entrada),
      diferenciacao: num(scores.diferenciacao),
      oportunidade: num(scores.oportunidade),
      risco_preco: txt(scores.risco_preco),
      risco_reviews: txt(scores.risco_reviews),
      risco_saturacao: txt(scores.risco_saturacao),
      risco_marca: txt(scores.risco_marca)
    }
  };
}

function calcularScoresFinais(C1, C2, C3) {
  return {
    performance: C1.score || media([
      C1.scores.atracao,
      C1.scores.conversao,
      C1.scores.ppc,
      C1.scores.rentabilidade,
      C1.scores.operacao
    ]),

    pagina: C2.score || media([
      C2.scores.atratividade_visual,
      C2.scores.titulo_seo,
      C2.scores.comunicacao_valor,
      C2.scores.confianca,
      C2.scores.diferenciacao,
      C2.scores.oferta
    ]),

    mercado: C3.score || media([
      C3.scores.competitividade,
      C3.scores.preco,
      C3.scores.saturacao,
      C3.scores.barreira_entrada,
      C3.scores.diferenciacao,
      C3.scores.oportunidade
    ]),

    atracao_total: media([
      C1.scores.atracao,
      C2.scores.atratividade_visual,
      C2.scores.titulo_seo,
      C2.scores.ctr_readiness
    ]),

    conversao_total: media([
      C1.scores.conversao,
      C2.scores.comunicacao_valor,
      C2.scores.confianca,
      C2.scores.cvr_readiness
    ]),

    rentabilidade_total: media([
      C1.scores.ppc,
      C1.scores.rentabilidade,
      C3.scores.preco
    ]),

    competitividade_total: media([
      C3.scores.competitividade,
      C3.scores.saturacao,
      C3.scores.barreira_entrada,
      C3.scores.oportunidade
    ]),

    diferenciacao_total: media([
      C2.scores.diferenciacao,
      C3.scores.diferenciacao,
      C2.scores.oferta
    ])
  };
}

function calcularScoreFinal(scores) {
  const score =
    scores.performance * 0.30 +
    scores.pagina * 0.28 +
    scores.mercado * 0.22 +
    scores.diferenciacao_total * 0.10 +
    scores.rentabilidade_total * 0.10;

  return clamp(score);
}

function classificarGravidade(scoreFinal, C1, C2, C3) {
  const sinaisCriticos = [
    C1.score && C1.score < 50,
    C2.score && C2.score < 50,
    C3.score && C3.score < 50,
    C1.scores.conversao && C1.scores.conversao < 55,
    C2.scores.cvr_readiness && C2.scores.cvr_readiness < 55,
    C3.scores.oportunidade && C3.scores.oportunidade < 55,
    C3.scores.risco_preco === "ALTO",
    C3.scores.risco_reviews === "ALTO"
  ].filter(Boolean).length;

  if (scoreFinal < 40 || sinaisCriticos >= 4) return "Crítica";
  if (scoreFinal < 60 || sinaisCriticos >= 3) return "Alta";
  if (scoreFinal < 75 || sinaisCriticos >= 2) return "Média";
  return "Controlada";
}

function identificarCausaRaizConsolidada(C1, C2, C3, scores) {
  const c1Root = C1.rootCause.toLowerCase();
  const c2Problem = C2.problem.toLowerCase();
  const c3Dynamic = C3.dynamic.toLowerCase();
  const c3Problem = C3.problem.toLowerCase();

  if (
    (c1Root.includes("convers") || C1.scores.conversao < 60) &&
    (c2Problem.includes("comunica") || c2Problem.includes("confiança") || C2.scores.cvr_readiness < 65) &&
    (C3.scores.risco_reviews === "ALTO" || c3Dynamic.includes("reviews"))
  ) {
    return "Conversão travada por baixa força de página em um mercado com alta exigência de prova social";
  }

  if (
    (c1Root.includes("convers") || C1.scores.conversao < 60) &&
    (C2.scores.comunicacao_valor < 65 || C2.scores.confianca < 65)
  ) {
    return "Conversão travada por comunicação, confiança e percepção de valor insuficientes na página";
  }

  if (
    (c1Root.includes("atra") || C1.scores.atracao < 60) &&
    (C2.scores.atratividade_visual < 65 || C2.scores.titulo_seo < 65) &&
    (C3.scores.competitividade < 65 || C3.scores.saturacao < 65)
  ) {
    return "Atração limitada por baixa força visual em um mercado competitivo";
  }

  if (
    (C1.scores.ppc < 65 || C1.acos > 30 || C1.tacos > 15) &&
    C2.score < 70 &&
    (C3.scores.preco < 65 || C3.scores.risco_preco === "ALTO")
  ) {
    return "Mídia paga ineficiente por combinação de página fraca, preço sensível e mercado competitivo";
  }

  if (
    (C1.tacos > 15 || C1.scores.ppc < 65) &&
    (C2.scores.titulo_seo < 70 || C2.scores.ctr_readiness < 70)
  ) {
    return "Dependência de mídia paga causada por baixa força orgânica e baixa eficiência da página";
  }

  if (
    C3.dynamic.includes("Guerra de preço") ||
    C3.scores.risco_preco === "ALTO"
  ) {
    return "Crescimento limitado por pressão de preço e risco de margem";
  }

  if (
    C3.dynamic.includes("Dominância de marca") ||
    C3.scores.risco_marca === "ALTO"
  ) {
    return "Crescimento limitado por dominância de marca e baixa autoridade relativa";
  }

  if (
    scores.diferenciacao_total < 60
  ) {
    return "Produto sem diferenciação clara, gerando comparação direta por preço, reviews ou mídia";
  }

  if (
    scores.performance >= 70 &&
    scores.pagina >= 70 &&
    scores.mercado >= 70
  ) {
    return "Produto com base saudável e oportunidade de escala controlada";
  }

  return "Gargalo multifatorial entre performance, página e mercado";
}

function gerarLeituraCruzada(C1, C2, C3, causaRaiz) {
  return `
A leitura cruzada mostra que o diagnóstico não deve ser interpretado por um único indicador isolado.

O Cérebro 1 apontou a condição de performance: ${C1.rootCause || "sem causa raiz clara registrada"}.
O Cérebro 2 avaliou a capacidade da página de sustentar clique e conversão: ${C2.problem || "sem problema principal registrado"}.
O Cérebro 3 avaliou se o mercado favorece ou dificulta o crescimento: ${C3.dynamic || "sem dinâmica registrada"}.

A causa raiz consolidada da Nexora é:
${causaRaiz}

Isso significa que a prioridade não é simplesmente “mexer em anúncios”, “baixar preço” ou “trocar imagens” de forma isolada. A ação correta depende da ordem dos gargalos: primeiro corrigir o que impede o produto de converter ou competir, depois escalar tráfego com mais segurança.
`.trim();
}

function gerarDiagnosticoExecutivoFinal(C1, C2, C3, scores, scoreFinal, gravidade, causaRaiz, leituraCruzada) {
  return `
A Síntese Final Nexora consolidou os três níveis de análise: performance, página e mercado.

Score final Nexora: ${scoreFinal}/100.
Gravidade: ${gravidade}.

Causa raiz consolidada:
${causaRaiz}

${leituraCruzada}

Leitura de performance:
${gerarResumoC1(C1)}

Leitura da página:
${gerarResumoC2(C2)}

Leitura de mercado:
${gerarResumoC3(C3)}

Conclusão estratégica:
O produto deve ser tratado de acordo com a causa raiz consolidada, e não apenas pelo sintoma mais visível. Quando CTR, CVR, ACOS, página e mercado são analisados em conjunto, fica mais claro se o problema está na atração, na conversão, na mídia, no posicionamento, na oferta ou no ambiente competitivo.

A recomendação da Nexora é seguir a ordem de prioridade indicada na síntese antes de aumentar investimento em mídia ou fazer mudanças isoladas.
`.trim();
}

function gerarGapsConsolidados(C1, C2, C3, scores, causaRaiz) {
  const gaps = [];

  if (scores.conversao_total < 65) {
    gaps.push({
      nivel: scores.conversao_total < 50 ? "CRÍTICO" : "ALTO",
      titulo: "Gap de conversão",
      descricao: "O produto não está transformando o interesse recebido em decisão de compra com força suficiente.",
      origem: "Cérebro 1 + Cérebro 2"
    });
  }

  if (scores.atracao_total < 65) {
    gaps.push({
      nivel: scores.atracao_total < 50 ? "CRÍTICO" : "ALTO",
      titulo: "Gap de atração",
      descricao: "A imagem, título ou primeira percepção não estão fortes o suficiente para disputar clique.",
      origem: "Cérebro 1 + Cérebro 2"
    });
  }

  if (scores.rentabilidade_total < 65) {
    gaps.push({
      nivel: scores.rentabilidade_total < 50 ? "CRÍTICO" : "ALTO",
      titulo: "Gap de rentabilidade",
      descricao: "A relação entre mídia, margem, preço e retorno precisa ser corrigida antes de escalar.",
      origem: "Cérebro 1 + Cérebro 3"
    });
  }

  if (scores.competitividade_total < 65) {
    gaps.push({
      nivel: scores.competitividade_total < 50 ? "CRÍTICO" : "ALTO",
      titulo: "Gap competitivo",
      descricao: "O mercado exige mais autoridade, diferenciação ou vantagem competitiva para o produto crescer.",
      origem: "Cérebro 3"
    });
  }

  if (scores.diferenciacao_total < 65) {
    gaps.push({
      nivel: scores.diferenciacao_total < 50 ? "CRÍTICO" : "ALTO",
      titulo: "Gap de diferenciação",
      descricao: "O produto ainda não apresenta uma razão forte e clara para ser escolhido frente aos concorrentes.",
      origem: "Cérebro 2 + Cérebro 3"
    });
  }

  if (!gaps.length) {
    gaps.push({
      nivel: "CONTROLADO",
      titulo: "Sem gap crítico isolado",
      descricao: "O produto apresenta uma base relativamente saudável. A prioridade é otimização e escala controlada.",
      origem: "Síntese Final"
    });
  }

  return gaps.slice(0, 6);
}

function gerarPrioridadesFinais(C1, C2, C3, scores, causaRaiz) {
  const prioridades = [];

  if (causaRaiz.toLowerCase().includes("conversão")) {
    prioridades.push({
      prioridade: "1",
      titulo: "Corrigir conversão antes de escalar tráfego",
      detalhe: "Reestruturar comunicação, prova social, oferta e argumentos de compra antes de aumentar investimento em anúncios.",
      area: "Página e conversão",
      impacto: "Reduz desperdício de tráfego e melhora CVR"
    });
  }

  if (causaRaiz.toLowerCase().includes("atração")) {
    prioridades.push({
      prioridade: "1",
      titulo: "Melhorar primeira impressão e CTR",
      detalhe: "Revisar imagem principal, título, preço aparente e diferenciação visual no resultado de busca.",
      area: "Atração e tráfego",
      impacto: "Aumenta entrada qualificada de tráfego"
    });
  }

  if (causaRaiz.toLowerCase().includes("mídia") || causaRaiz.toLowerCase().includes("acos") || causaRaiz.toLowerCase().includes("tacos")) {
    prioridades.push({
      prioridade: "1",
      titulo: "Controlar mídia antes de aumentar orçamento",
      detalhe: "Reduzir desperdício, revisar campanhas com baixa conversão e alinhar anúncios com a página corrigida.",
      area: "PPC e rentabilidade",
      impacto: "Melhora ACOS, TACOS e eficiência de investimento"
    });
  }

  if (scores.diferenciacao_total < 70) {
    prioridades.push({
      prioridade: String(prioridades.length + 1),
      titulo: "Construir diferenciação competitiva",
      detalhe: "Definir uma promessa clara, reforçar benefício principal e tornar a oferta menos comparável por preço.",
      area: "Posicionamento",
      impacto: "Reduz competição direta e melhora percepção de valor"
    });
  }

  if (C3.scores.risco_reviews === "ALTO" || C2.scores.confianca < 70) {
    prioridades.push({
      prioridade: String(prioridades.length + 1),
      titulo: "Aumentar confiança e prova social",
      detalhe: "Fortalecer reviews, rating, imagens de uso, A+, vídeo, garantias e elementos de segurança percebida.",
      area: "Confiança",
      impacto: "Reduz objeção e melhora taxa de conversão"
    });
  }

  if (C3.scores.risco_preco === "ALTO" || C3.scores.preco < 70) {
    prioridades.push({
      prioridade: String(prioridades.length + 1),
      titulo: "Reavaliar preço versus valor percebido",
      detalhe: "Comparar preço com concorrentes e ajustar oferta, kit, cupom ou comunicação para justificar valor.",
      area: "Oferta e preço",
      impacto: "Reduz resistência de compra e protege margem"
    });
  }

  if (!prioridades.length) {
    prioridades.push({
      prioridade: "1",
      titulo: "Escalar com controle",
      detalhe: "O produto apresenta base saudável. A recomendação é testar aumento gradual de mídia, mantendo monitoramento de CVR, ACOS, TACOS e estoque.",
      area: "Escala",
      impacto: "Aumenta volume com menor risco"
    });
  }

  return prioridades.slice(0, 6).map((p, index) => ({
    ...p,
    prioridade: String(index + 1)
  }));
}

function gerarPlanoAcao(prioridades, causaRaiz, C1, C2, C3) {
  const plano = [];

  plano.push({
    etapa: "Etapa 1",
    titulo: "Corrigir o bloqueio principal",
    descricao: prioridades[0]?.detalhe || "Atuar primeiro na causa raiz consolidada identificada pela Nexora.",
    prazo: "0 a 7 dias",
    objetivo: "Remover o maior gargalo antes de investir mais tráfego."
  });

  if (prioridades[1]) {
    plano.push({
      etapa: "Etapa 2",
      titulo: prioridades[1].titulo,
      descricao: prioridades[1].detalhe,
      prazo: "7 a 14 dias",
      objetivo: prioridades[1].impacto
    });
  }

  if (prioridades[2]) {
    plano.push({
      etapa: "Etapa 3",
      titulo: prioridades[2].titulo,
      descricao: prioridades[2].detalhe,
      prazo: "14 a 21 dias",
      objetivo: prioridades[2].impacto
    });
  }

  plano.push({
    etapa: "Etapa 4",
    titulo: "Validar sinais de recuperação",
    descricao: "Reavaliar CTR, CVR, ACOS, TACOS, ranking, sessões, Buy Box e evolução da página após as mudanças.",
    prazo: "21 a 30 dias",
    objetivo: "Confirmar se as mudanças estão destravando performance real."
  });

  return plano;
}

function gerarRecomendacaoEstrategica(C1, C2, C3, scores, causaRaiz, gravidade) {
  if (gravidade === "Crítica") {
    return "Não escalar investimento agora. O produto precisa de correções estruturais antes de receber mais tráfego. A prioridade é corrigir a causa raiz, validar recuperação de conversão e só depois aumentar mídia.";
  }

  if (gravidade === "Alta") {
    return "Escalar com cautela. O produto possui gargalos relevantes e pode desperdiçar verba se a mídia for aumentada antes de corrigir página, oferta ou posicionamento.";
  }

  if (causaRaiz.toLowerCase().includes("oportunidade")) {
    return "Existe oportunidade de escala controlada. O produto apresenta base saudável, mas ainda deve crescer com monitoramento de margem, estoque, CVR e eficiência de mídia.";
  }

  if (scores.mercado < 60) {
    return "O mercado é uma barreira relevante. A estratégia deve priorizar diferenciação, prova social e oferta antes de buscar crescimento agressivo.";
  }

  return "Prosseguir com ajustes coordenados. A Nexora recomenda corrigir os gaps principais e depois testar crescimento gradual com acompanhamento semanal dos indicadores.";
}

function gerarResumoParaCliente(causaRaiz, gravidade, prioridades, recomendacao) {
  return `
O diagnóstico final mostra que o principal bloqueio é: ${causaRaiz}.

Gravidade: ${gravidade}.

A prioridade número 1 é: ${prioridades[0]?.titulo || "corrigir o principal gargalo identificado"}.

Recomendação:
${recomendacao}
`.trim();
}

function gerarResumoC1(C1) {
  if (!C1.exists) return "Cérebro 1 não encontrado.";

  return `O Cérebro 1 indica score de ${C1.score || "-"}/100 e causa raiz inicial: ${C1.rootCause || "não registrada"}. Essa leitura mostra como o produto está performando em atração, conversão, mídia, rentabilidade e operação.`;
}

function gerarResumoC2(C2) {
  if (!C2.exists) return "Cérebro 2 não encontrado.";

  return `O Cérebro 2 indica score de ${C2.score || "-"}/100 e problema principal: ${C2.problem || "não registrado"}. Essa leitura mostra se a página sustenta clique, confiança, diferenciação e conversão.`;
}

function gerarResumoC3(C3) {
  if (!C3.exists) return "Cérebro 3 não encontrado.";

  return `O Cérebro 3 indica score de ${C3.score || "-"}/100 e dinâmica de mercado: ${C3.dynamic || "não registrada"}. Essa leitura mostra se o mercado permite escala, pressiona preço ou aumenta a barreira competitiva.`;
}

function gerarMatrizDecisao(C1, C2, C3, scores) {
  return [
    {
      eixo: "Performance",
      score: scores.performance,
      leitura: scores.performance < 60 ? "Performance exige correção antes de escala." : "Performance apresenta base administrável."
    },
    {
      eixo: "Página",
      score: scores.pagina,
      leitura: scores.pagina < 60 ? "Página limita conversão e percepção de valor." : "Página possui base funcional."
    },
    {
      eixo: "Mercado",
      score: scores.mercado,
      leitura: scores.mercado < 60 ? "Mercado aumenta dificuldade competitiva." : "Mercado permite atuação estratégica."
    },
    {
      eixo: "Diferenciação",
      score: scores.diferenciacao_total,
      leitura: scores.diferenciacao_total < 60 ? "Produto muito comparável com concorrentes." : "Produto possui algum espaço de diferenciação."
    },
    {
      eixo: "Rentabilidade",
      score: scores.rentabilidade_total,
      leitura: scores.rentabilidade_total < 60 ? "Risco de investimento ineficiente." : "Rentabilidade em nível mais controlado."
    }
  ];
}

function num(v) {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function txt(v) {
  return String(v ?? "").trim();
}

function arr(v) {
  return Array.isArray(v) ? v : [];
}

function media(values) {
  const clean = values.filter(v => Number.isFinite(v) && v > 0);

  if (!clean.length) return 0;

  return clamp(clean.reduce((a, b) => a + b, 0) / clean.length);
}

function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(n || 0)));
}
