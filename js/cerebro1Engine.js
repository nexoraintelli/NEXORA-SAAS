// NEXORA · CÉREBRO 1 ENGINE
// Diagnóstico profundo de performance, tráfego, conversão, PPC, rentabilidade e operação

export function gerarDiagnosticoBaseC1(data, benchmark = {}) {
  const bm = normalizarBenchmark(benchmark);
  const d = normalizarDados(data);

  const scores = calcularScores(d, bm);
  const scoreGeral = calcularScoreGeral(scores, d);
  const causaRaiz = identificarCausaRaiz(scores, d, bm);
  const gap = identificarGapPrincipal(scores, d, bm, causaRaiz);
  const diagnostico = gerarDiagnosticoExecutivo(d, bm, scores, causaRaiz, gap, scoreGeral);
  const prioridades = gerarPrioridades(scores, d, bm, causaRaiz);
  const impacto = gerarImpacto(causaRaiz, scores, d);
  const status = classificarStatus(scoreGeral);

  return {
    score_geral: scoreGeral,
    status,
    scores,
    root_cause: causaRaiz,
    gap_principal: gap,
    diagnostico_executivo: diagnostico,
    summary: diagnostico,
    impacto,
    priorities: prioridades,
    prioridades,
    leitura: {
      atracao: gerarLeituraAtracao(d, bm, scores),
      conversao: gerarLeituraConversao(d, bm, scores),
      ppc: gerarLeituraPPC(d, bm, scores),
      operacao: gerarLeituraOperacao(d, scores)
    }
  };
}

function normalizarDados(data) {
  return {
    category: data.category || data.cat || data.categoria || "",
    subcategory: data.subcategory || data.sub || data.subcategoria || "",
    modelo: data.modelo || data.businessModel || "",
    force: data.force || data.forca || "",
    pos: data.pos || data.posicao || "",

    impressions: num(data.impressions || data.imp),
    clicks: num(data.clicks || data.click),
    ctr: num(data.ctr),

    sales: num(data.sales || data.vendas),
    cvr: num(data.cvr),
    reviews: num(data.reviews || data.rev),
    rating: num(data.rating),

    acos: num(data.acos),
    tacos: num(data.tacos),
    margin: num(data.margin || data.margem || data.mg),
    roas: num(data.roas),

    fulfillment: data.fulfillment || data.fba || "",
    buybox: data.buybox || data.bb || "",
    stock: data.stock || data.est || "",
    price: num(data.price || data.preco)
  };
}

function normalizarBenchmark(benchmark) {
  return {
    ctr: num(benchmark.ctr || benchmark.ctr_good || 0.6),
    cvr: num(benchmark.cvr || benchmark.cvr_good || 10),
    acos: num(benchmark.acos || benchmark.acos_target || 25),
    tacos: num(benchmark.tacos || benchmark.tacos_target || 12),
    reviews: num(benchmark.reviews || 100),
    rating: num(benchmark.rating || 4.3)
  };
}

function calcularScores(d, bm) {
  return {
    atracao: scoreAtracao(d, bm),
    conversao: scoreConversao(d, bm),
    ppc: scorePPC(d, bm),
    rentabilidade: scoreRentabilidade(d, bm),
    operacao: scoreOperacao(d),

    ctr: nivelCTR(d.ctr, bm.ctr),
    cvr: nivelCVR(d.cvr, bm.cvr),
    acos: nivelACOS(d.acos, bm.acos),
    tacos: nivelTACOS(d.tacos),
    ops: nivelOperacao(d)
  };
}

function scoreAtracao(d, bm) {
  let score = 100;

  if (d.ctr <= 0) score -= 45;
  else if (d.ctr < bm.ctr * 0.6) score -= 40;
  else if (d.ctr < bm.ctr * 0.85) score -= 24;
  else if (d.ctr < bm.ctr) score -= 12;

  if (d.impressions > 0 && d.clicks === 0) score -= 25;
  if (d.force === "Preço" && d.price <= 0) score -= 8;

  return clamp(score);
}

function scoreConversao(d, bm) {
  let score = 100;

  if (d.cvr <= 0) score -= 45;
  else if (d.cvr < bm.cvr * 0.5) score -= 38;
  else if (d.cvr < bm.cvr * 0.75) score -= 25;
  else if (d.cvr < bm.cvr) score -= 12;

  if (d.reviews < 10) score -= 18;
  else if (d.reviews < 50) score -= 10;

  if (d.rating > 0 && d.rating < 4.0) score -= 20;
  else if (d.rating > 0 && d.rating < 4.3) score -= 10;

  return clamp(score);
}

function scorePPC(d, bm) {
  let score = 100;

  if (d.acos > bm.acos * 1.6) score -= 35;
  else if (d.acos > bm.acos * 1.25) score -= 22;
  else if (d.acos > bm.acos) score -= 10;

  if (d.tacos > 20) score -= 25;
  else if (d.tacos > 12) score -= 14;

  if (d.roas > 0 && d.roas < 2) score -= 15;

  return clamp(score);
}

function scoreRentabilidade(d, bm) {
  let score = 100;

  if (d.margin > 0 && d.acos > d.margin) score -= 40;
  else if (d.margin > 0 && d.acos > d.margin * 0.8) score -= 22;

  if (d.margin > 0 && d.tacos > d.margin * 0.6) score -= 18;

  return clamp(score);
}

function scoreOperacao(d) {
  let score = 100;

  if (d.buybox === "Não tenho") score -= 45;
  else if (d.buybox === "Disputada") score -= 20;

  if (d.stock === "Zerado") score -= 45;
  else if (d.stock === "Baixo") score -= 20;

  if (d.fulfillment === "FBM") score -= 12;

  return clamp(score);
}

function calcularScoreGeral(scores, d) {
  const score =
    scores.atracao * 0.22 +
    scores.conversao * 0.28 +
    scores.ppc * 0.18 +
    scores.rentabilidade * 0.14 +
    scores.operacao * 0.18;

  return clamp(score);
}

function identificarCausaRaiz(scores, d, bm) {
  if (d.buybox === "Não tenho") return "Operação: perda de BuyBox";
  if (d.stock === "Zerado") return "Operação: ruptura de estoque";

  if (scores.atracao < 55 && scores.conversao >= 65) {
    return "Atração: o produto não está recebendo cliques suficientes";
  }

  if (scores.conversao < 55 && scores.atracao >= 65) {
    return "Conversão: a página não está transformando tráfego em vendas";
  }

  if (scores.atracao < 60 && scores.conversao < 60) {
    return "Oferta e posicionamento: o produto não atrai nem converte com força suficiente";
  }

  if (scores.rentabilidade < 55) {
    return "Rentabilidade: mídia acima da margem saudável";
  }

  if (scores.ppc < 55 && scores.conversao < 70) {
    return "Mídia amplificando um problema de conversão";
  }

  if (scores.ppc < 55) {
    return "PPC: investimento pago com baixa eficiência";
  }

  if (scores.operacao < 65) {
    return "Operação: estrutura logística e comercial limitando performance";
  }

  return "Otimização: produto com base funcional, mas com espaço para escala";
}

function identificarGapPrincipal(scores, d, bm, causa) {
  if (causa.includes("BuyBox")) {
    return "O produto perde competitividade antes mesmo da decisão de compra, porque a oferta não domina a BuyBox.";
  }

  if (causa.includes("estoque")) {
    return "A ruptura de estoque impede continuidade de vendas, prejudica ranking e interrompe o aprendizado do algoritmo.";
  }

  if (causa.includes("Atração")) {
    return `O CTR está em ${d.ctr}%, abaixo do benchmark estimado de ${bm.ctr}%. Isso indica baixa capacidade de gerar clique.`;
  }

  if (causa.includes("Conversão")) {
    return `O CVR está em ${d.cvr}%, abaixo do benchmark estimado de ${bm.cvr}%. O tráfego chega, mas a página não convence o suficiente.`;
  }

  if (causa.includes("Rentabilidade")) {
    return `O ACOS de ${d.acos}% está pressionando a margem de ${d.margin || "não informada"}%. O crescimento pago pode estar destruindo lucro.`;
  }

  if (causa.includes("PPC")) {
    return "A mídia paga está consumindo investimento sem retornar proporcionalmente em vendas eficientes.";
  }

  return "O produto não apresenta uma única ruptura crítica, mas precisa de ajustes coordenados para ganhar eficiência.";
}

function gerarDiagnosticoExecutivo(d, bm, scores, causa, gap, score) {
  const status = classificarStatus(score);

  return `
O diagnóstico do Cérebro 1 indica que o produto está em status: ${status}.

A causa raiz mais provável é: ${causa}.

${gap}

Leitura de atração:
${gerarLeituraAtracao(d, bm, scores)}

Leitura de conversão:
${gerarLeituraConversao(d, bm, scores)}

Leitura de PPC e rentabilidade:
${gerarLeituraPPC(d, bm, scores)}

Leitura operacional:
${gerarLeituraOperacao(d, scores)}

Interpretação estratégica:
A performance na Amazon não deve ser lida por uma métrica isolada. CTR mostra se o produto está sendo considerado. CVR mostra se a página convence. ACOS e TACOS mostram se a mídia está saudável ou apenas comprando venda. BuyBox, estoque e fulfillment indicam se a operação sustenta escala.

Neste caso, a prioridade não é simplesmente aumentar investimento. A prioridade é corrigir o bloqueio principal antes de escalar tráfego. Caso contrário, o seller tende a gastar mais em anúncios para compensar um problema estrutural que continua impedindo crescimento orgânico, conversão ou rentabilidade.
`.trim();
}

function gerarLeituraAtracao(d, bm, scores) {
  if (d.impressions > 0 && d.clicks === 0) {
    return "Há impressões, mas praticamente nenhum clique. Isso indica que o produto aparece, porém não gera interesse suficiente para ser considerado.";
  }

  if (d.ctr < bm.ctr * 0.7) {
    return "O CTR está criticamente abaixo do benchmark. Isso sugere problema de atratividade: imagem principal, título, preço percebido ou oferta podem não estar competindo bem no resultado de busca.";
  }

  if (d.ctr < bm.ctr) {
    return "O CTR está abaixo do ideal. O produto recebe exposição, mas ainda não captura cliques com força competitiva.";
  }

  return "A atração está em nível aceitável. O produto consegue gerar clique, então a próxima leitura deve focar conversão, rentabilidade e operação.";
}

function gerarLeituraConversao(d, bm, scores) {
  if (d.cvr < bm.cvr * 0.6) {
    return "A conversão está em nível crítico. Isso indica que o cliente chega na página, mas encontra barreiras para comprar: oferta fraca, baixa confiança, pouca prova social, preço desalinhado ou conteúdo insuficiente.";
  }

  if (d.reviews < 10) {
    return "O produto tem baixa prova social. Mesmo com página boa, poucos reviews reduzem confiança e podem limitar conversão em categorias competitivas.";
  }

  if (d.rating > 0 && d.rating < 4.2) {
    return "O rating médio está abaixo de um patamar saudável. Isso pode gerar fricção de compra e reduzir a taxa de conversão.";
  }

  if (d.cvr < bm.cvr) {
    return "A conversão está abaixo do benchmark, mas não necessariamente quebrada. O foco deve ser melhorar página, prova social e clareza da oferta.";
  }

  return "A conversão está saudável em relação ao benchmark. Se ainda há problema de vendas, a causa pode estar mais ligada a tráfego, operação, mídia ou mercado.";
}

function gerarLeituraPPC(d, bm, scores) {
  if (d.margin > 0 && d.acos > d.margin) {
    return "O ACOS está acima da margem. Isso indica risco direto de vender com prejuízo via mídia paga. Antes de escalar, é necessário reduzir desperdício ou melhorar conversão.";
  }

  if (d.tacos > 18) {
    return "O TACOS alto indica dependência relevante de mídia paga. O produto pode estar comprando vendas em vez de construir eficiência orgânica.";
  }

  if (d.acos > bm.acos * 1.3) {
    return "O ACOS está acima do padrão saudável. A mídia pode estar pagando caro por tráfego que não converte com eficiência suficiente.";
  }

  if (d.roas > 0 && d.roas < 2) {
    return "O ROAS está baixo, indicando retorno fraco da mídia paga em relação ao investimento.";
  }

  return "A leitura de PPC não mostra ruptura crítica. A mídia pode ser trabalhada com otimização, desde que página e operação estejam sustentando a conversão.";
}

function gerarLeituraOperacao(d, scores) {
  if (d.buybox === "Não tenho") {
    return "Sem BuyBox, o produto perde capacidade real de conversão. Esse é um bloqueio operacional prioritário.";
  }

  if (d.stock === "Zerado") {
    return "Estoque zerado interrompe vendas, prejudica ranking e quebra consistência de performance.";
  }

  if (d.stock === "Baixo") {
    return "Estoque baixo representa risco de ruptura. Se houver aumento de tráfego, o produto pode perder ritmo por falta de disponibilidade.";
  }

  if (d.fulfillment === "FBM") {
    return "Fulfillment FBM pode reduzir competitividade em categorias onde Prime/FBA é dominante. Isso impacta confiança, prazo e conversão.";
  }

  return "A operação parece estável. Não há indícios fortes de que logística, estoque ou BuyBox sejam a principal trava neste momento.";
}

function gerarPrioridades(scores, d, bm, causa) {
  const list = [];

  if (d.buybox === "Não tenho") {
    list.push({
      prioridade: "URGENTE",
      titulo: "Recuperar BuyBox",
      detalhe: "Sem BuyBox, qualquer melhoria de tráfego ou página perde impacto comercial.",
      impacto: "Recupera capacidade real de conversão"
    });
  }

  if (d.stock === "Zerado" || d.stock === "Baixo") {
    list.push({
      prioridade: "URGENTE",
      titulo: "Corrigir risco de estoque",
      detalhe: "A operação precisa sustentar vendas contínuas para não prejudicar ranking e performance.",
      impacto: "Evita perda de ritmo e ranking"
    });
  }

  if (scores.atracao < 65) {
    list.push({
      prioridade: "URGENTE",
      titulo: "Aumentar atratividade no resultado de busca",
      detalhe: "Revisar imagem principal, título, preço percebido e oferta para elevar CTR.",
      impacto: "Mais cliques qualificados"
    });
  }

  if (scores.conversao < 65) {
    list.push({
      prioridade: "IMPORTANTE",
      titulo: "Melhorar estrutura de conversão da página",
      detalhe: "Reforçar bullets, imagens, prova social, diferenciação e clareza da promessa.",
      impacto: "Maior CVR e melhor eficiência de mídia"
    });
  }

  if (scores.rentabilidade < 65 || scores.ppc < 65) {
    list.push({
      prioridade: "IMPORTANTE",
      titulo: "Controlar rentabilidade antes de escalar mídia",
      detalhe: "Ajustar campanhas, bids, termos e eficiência antes de aumentar orçamento.",
      impacto: "Reduz desperdício e protege margem"
    });
  }

  if (list.length === 0) {
    list.push({
      prioridade: "ESTRATÉGICO",
      titulo: "Escalar com controle",
      detalhe: "O produto não apresenta ruptura crítica. Priorize testes de escala, SEO e otimização incremental.",
      impacto: "Crescimento com menor risco"
    });
  }

  return list.slice(0, 5);
}

function gerarImpacto(causa, scores, d) {
  if (causa.includes("Atração")) {
    return "Enquanto o produto não gerar clique, a Amazon não recebe sinais suficientes de interesse. Isso limita vendas, aprendizado do algoritmo e crescimento orgânico.";
  }

  if (causa.includes("Conversão")) {
    return "Se o produto recebe tráfego mas não converte, o investimento em mídia tende a ficar caro e o ranking orgânico perde força.";
  }

  if (causa.includes("Rentabilidade") || causa.includes("PPC")) {
    return "O risco principal é crescer comprando vendas sem eficiência, aumentando faturamento sem construir lucro ou sustentabilidade.";
  }

  if (causa.includes("Operação")) {
    return "Problemas operacionais impedem que qualquer melhoria de marketing se transforme em crescimento consistente.";
  }

  return "O impacto principal está na perda de eficiência. O produto pode vender, mas ainda não está estruturado para escalar com segurança.";
}

function nivelCTR(v, bm) {
  if (v < bm * 0.7) return "CRÍTICO";
  if (v < bm) return "BAIXO";
  return "OK";
}

function nivelCVR(v, bm) {
  if (v < bm * 0.6) return "CRÍTICO";
  if (v < bm) return "BAIXO";
  return "OK";
}

function nivelACOS(v, bm) {
  if (v > bm * 1.4) return "CRÍTICO";
  if (v > bm) return "ATENÇÃO";
  return "OK";
}

function nivelTACOS(v) {
  if (v > 18) return "ALTO";
  if (v > 10) return "ATENÇÃO";
  return "SAUDÁVEL";
}

function nivelOperacao(d) {
  if (d.buybox === "Não tenho" || d.stock === "Zerado") return "CRÍTICO";
  if (d.buybox === "Disputada" || d.stock === "Baixo" || d.fulfillment === "FBM") return "ATENÇÃO";
  return "OK";
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

function clamp(n) {
  return Math.max(0, Math.min(100, Math.round(n)));
}
