export function analisarMercadoBase({ product, competitors, saturation, c1, c2 }) {
  const valid = (competitors || []).filter(c => Number(c.price) > 0 || Number(c.reviews) > 0);
  const prices = valid.map(c => Number(c.price || 0)).filter(Boolean);
  const reviews = valid.map(c => Number(c.reviews || 0)).filter(Boolean);
  const avgPrice = avg(prices);
  const reviewBarrier = avg(reviews.sort((a, b) => b - a).slice(0, 5));
  const productPrice = Number(product.price || 0);
  const productReviews = Number(product.reviews || 0);
  let risk = "MÉDIO";
  const riscos = [];
  if (reviewBarrier > 0 && productReviews < reviewBarrier * 0.3) { risk = "ALTO"; riscos.push({ nivel: "ALTO", descricao: "Produto com autoridade muito abaixo da barreira média de reviews." }); }
  if (avgPrice > 0 && productPrice > avgPrice * 1.2 && productReviews < reviewBarrier) { risk = "CRÍTICO"; riscos.push({ nivel: "CRÍTICO", descricao: "Preço acima da média sem autoridade proporcional." }); }
  if (saturation === "Muito alta") riscos.push({ nivel: "ALTO", descricao: "Categoria muito saturada aumenta custo de aquisição e exigência de diferenciação." });
  const quadrante = detectarQuadrante(productPrice, avgPrice, productReviews, reviewBarrier);
  const forca = detectarForcaDominante(c1, c2, reviewBarrier);
  return { forca_dominante: forca, forca_explicacao: "Força calculada pela lógica Nexora com base em performance, autoridade e contexto competitivo.", quadrante, quadrante_explicacao: `Produto classificado como ${quadrante} com base em preço e autoridade relativa.`, review_barrier: Math.round(reviewBarrier || 0), preco_medio: Math.round(avgPrice || 0), diagnostico: "Análise de mercado gerada pela lógica Nexora.", riscos: riscos.length ? riscos : [{ nivel: risk, descricao: "Monitorar preço, reviews e diferenciação frente ao mercado." }], gap_competitivo: gerarGap(quadrante), reposicionamento: gerarReposicionamento(quadrante), prioridades: gerarPrioridades(quadrante, riscos) };
}
function detectarQuadrante(price, avgPrice, reviews, reviewBarrier) {
  const highPrice = avgPrice > 0 && price > avgPrice * 1.15;
  const lowPrice = avgPrice > 0 && price < avgPrice * 0.9;
  const highAuthority = reviewBarrier > 0 && reviews >= reviewBarrier * 0.8;
  if (highPrice && highAuthority) return "PREMIUM_BRAND";
  if (!highPrice && highAuthority) return "CATEGORY_LEADER";
  if (lowPrice && !highAuthority) return "PRICE_FIGHTER";
  return "NICHE_PLAYER";
}
function detectarForcaDominante(c1, c2, reviewBarrier) { if (reviewBarrier > 100) return "REVIEWS"; if (c1?.force) return c1.force; if ((c2?.scores?.diferenciacao || 100) < 50) return "DIFERENCIAÇÃO"; return "PREÇO"; }
function gerarGap(q) { return { PREMIUM_BRAND: "Precisa sustentar preço premium com autoridade e diferenciação.", CATEGORY_LEADER: "Possui sinais de autoridade, mas precisa proteger posicionamento.", PRICE_FIGHTER: "Compete por preço, com risco de margem e baixa diferenciação.", NICHE_PLAYER: "Precisa reforçar diferenciação para não competir apenas por preço." }[q] || "Gap competitivo precisa ser aprofundado."; }
function gerarReposicionamento(q) { if (q === "PRICE_FIGHTER") return "Reforçar oferta e diferenciação para escapar da guerra de preço."; if (q === "NICHE_PLAYER") return "Construir narrativa clara de valor e autoridade."; if (q === "PREMIUM_BRAND") return "Fortalecer prova social para justificar preço."; return "Defender liderança com SEO, reviews e conversão."; }
function gerarPrioridades(q, riscos) { const list = riscos.map(r => r.descricao); if (q === "PRICE_FIGHTER") list.push("Evitar competir apenas por desconto."); if (q === "NICHE_PLAYER") list.push("Criar diferencial percebido na página."); return list.slice(0, 3); }
function avg(arr) { return arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 0; }

