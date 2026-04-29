export function detectarCausaRaiz(C1, C2, C3) {
  if (C1?.bb === "Não tenho" || C1?.scores?.ops === "CRÍTICO") return "Operação";
  if (C1?.est === "Zerado") return "Estoque";
  if (C1?.scores?.ctr === "CRÍTICO" && C1?.scores?.cvr !== "CRÍTICO") return "Atração";
  if (C1?.scores?.cvr === "CRÍTICO" && C1?.scores?.ctr !== "CRÍTICO") return "Conversão";
  if (C1?.scores?.ctr === "CRÍTICO" && C1?.scores?.cvr === "CRÍTICO") return "Oferta e posicionamento";
  if (C3?.riscos?.some(r => r.nivel === "CRÍTICO")) return "Pressão competitiva";
  if ((C2?.scores?.confianca || 100) < 50) return "Confiança";
  if (C1?.scores?.acos === "CRÍTICO") return "Rentabilidade";
  return "Otimização e escala";
}
export function calcularScoreReal(C1, C2, C3) {
  return Math.round(scorePerformance(C1)*0.35 + scorePagina(C2)*0.25 + scoreMercado(C3)*0.20 + scoreOperacao(C1)*0.15 + scoreEconomia(C1)*0.05);
}
export function gerarSinteseBase(C1, C2, C3) {
  const causa = detectarCausaRaiz(C1, C2, C3);
  const score = calcularScoreReal(C1, C2, C3);
  return { score_geral: score, confianca: C1 && C2 && C3 ? "ALTA" : C1 ? "MÉDIA" : "BAIXA", problema_raiz: causa, diagnostico_executivo: `Síntese gerada pela lógica Nexora. O principal bloqueio identificado é ${causa}.`, pilares: { atracao: { status: normalize(C1?.scores?.ctr), resumo: `CTR ${C1?.ctr ?? "-"}%` }, conversao: { status: normalize(C1?.scores?.cvr), resumo: `CVR ${C1?.cvr ?? "-"}%` }, mercado: { status: C3?.riscos?.some(r => r.nivel === "CRÍTICO") ? "CRÍTICO" : "ATENÇÃO", resumo: C3?.forca_dominante || "Mercado não analisado" }, operacao: { status: normalize(C1?.scores?.ops), resumo: `${C1?.fba || "-"} · BuyBox ${C1?.bb || "-"}` } }, plano_acao: gerarPlano(causa), veredicto: `Prioridade estratégica: resolver ${causa} antes de escalar investimento.` };
}
function gerarPlano(causa) {
  const map = { Operação: [["URGENTE","Corrigir BuyBox/estoque","Sem base operacional, tráfego e mídia perdem eficiência.","Evita desperdício"],["IMPORTANTE","Validar logística","Revisar FBA, estoque e disponibilidade.","Recupera ranking"],["ESTRATÉGICO","Monitorar operação","Criar rotina de controle operacional.","Reduz risco"]], Atração: [["URGENTE","Melhorar imagem principal","Revisar thumbnail, contraste e diferenciação visual.","Aumenta CTR"],["IMPORTANTE","Revisar título","Tornar benefício e keyword mais claros.","Melhora clique"],["ESTRATÉGICO","Testar oferta","Avaliar cupom, preço percebido e comparação visual.","Aumenta escala"]], Conversão: [["URGENTE","Reestruturar página","Melhorar bullets, imagens e clareza de benefício.","Aumenta CVR"],["IMPORTANTE","Fortalecer confiança","Trabalhar reviews, rating, vídeo e prova social.","Reduz fricção"],["ESTRATÉGICO","Revisar oferta","Alinhar preço, diferenciação e promessa.","Aumenta vendas"]] };
  const selected = map[causa] || [["URGENTE","Validar causa raiz","Revisar performance, página e mercado antes de escalar.","Evita erro estratégico"],["IMPORTANTE","Ajustar pontos fracos","Priorizar os gaps críticos dos cérebros.","Melhora eficiência"],["ESTRATÉGICO","Acompanhar evolução","Reanalisar após mudanças.","Prova resultado"]];
  return selected.map(([prioridade,titulo,detalhe,impacto]) => ({ prioridade, titulo, detalhe, impacto }));
}
function scorePerformance(C1){ if(!C1?.scores)return 50; let s=100; if(C1.scores.ctr==="CRÍTICO")s-=25; else if(C1.scores.ctr==="BAIXO")s-=12; if(C1.scores.cvr==="CRÍTICO")s-=25; else if(C1.scores.cvr==="BAIXO")s-=12; if(C1.scores.acos==="CRÍTICO")s-=15; return clamp(s); }
function scorePagina(C2){ if(!C2?.scores)return 50; const values=Object.values(C2.scores).map(Number).filter(n=>!Number.isNaN(n)); return values.length?clamp(values.reduce((a,b)=>a+b,0)/values.length):50; }
function scoreMercado(C3){ if(!C3)return 50; if(C3.riscos?.some(r=>r.nivel==="CRÍTICO"))return 35; if(C3.riscos?.some(r=>r.nivel==="ALTO"))return 55; return 75; }
function scoreOperacao(C1){ if(C1?.scores?.ops==="CRÍTICO")return 25; if(C1?.scores?.ops==="ATENÇÃO")return 60; return 85; }
function scoreEconomia(C1){ if(Number(C1?.acos||0)>=Number(C1?.mg||999))return 35; return 75; }
function normalize(v){ if(v==="CRÍTICO"||v==="ALTO")return "CRÍTICO"; if(v==="BAIXO"||v==="ATENÇÃO"||v==="ACEITÁVEL")return "ATENÇÃO"; return "OK"; }
function clamp(n){ return Math.max(0,Math.min(100,Math.round(n))); }

