import { sb } from "./supabaseClient.js";
import { requireAuth } from "./auth.js";

const DEFAULT_FREE_PLAN = {
  plan_name: "free",
  plan_status: "active",
  diagnostic_limit: 1,
  product_limit: 1,
  diagnostics_used: 0,
  is_admin: false,
  unlimited_access: false
};

export async function getCurrentUserPlan() {
  const user = await requireAuth();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { data, error } = await sb
    .from("user_plans")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar plano do usuário:", error);
    throw error;
  }

  if (data) {
    return data;
  }

  return await createDefaultUserPlan(user.id);
}

export async function createDefaultUserPlan(userId) {
  const { data, error } = await sb
    .from("user_plans")
    .insert({
      user_id: userId,
      ...DEFAULT_FREE_PLAN,
      current_period_end: getNextMonthISO()
    })
    .select("*")
    .single();

  if (error) {
    console.error("Erro ao criar plano gratuito:", error);
    throw error;
  }

  return data;
}

export async function canCreateDiagnostic() {
  const plan = await getCurrentUserPlan();

  if (!plan) {
    return {
      allowed: false,
      reason: "Plano não encontrado.",
      plan: null
    };
  }

  if (plan.plan_status !== "active" && plan.plan_status !== "trial") {
    return {
      allowed: false,
      reason: "Seu plano não está ativo.",
      plan
    };
  }

  if (plan.is_admin || plan.unlimited_access) {
    return {
      allowed: true,
      reason: "Acesso ilimitado.",
      plan
    };
  }

  const used = Number(plan.diagnostics_used || 0);
  const limit = Number(plan.diagnostic_limit || 0);

  if (used >= limit) {
    return {
      allowed: false,
      reason: "Você atingiu o limite de diagnósticos do seu plano.",
      plan
    };
  }

  return {
    allowed: true,
    reason: "Diagnóstico permitido.",
    plan
  };
}

export async function incrementDiagnosticUsage() {
  const plan = await getCurrentUserPlan();

  if (!plan) {
    throw new Error("Plano não encontrado.");
  }

  if (plan.is_admin || plan.unlimited_access) {
    return plan;
  }

  const nextUsed = Number(plan.diagnostics_used || 0) + 1;

  const { data, error } = await sb
    .from("user_plans")
    .update({
      diagnostics_used: nextUsed,
      updated_at: new Date().toISOString()
    })
    .eq("id", plan.id)
    .select("*")
    .single();

  if (error) {
    console.error("Erro ao atualizar uso de diagnóstico:", error);
    throw error;
  }

  return data;
}

export function getRemainingDiagnostics(plan) {
  if (!plan) return 0;

  if (plan.is_admin || plan.unlimited_access) {
    return "Ilimitado";
  }

  const limit = Number(plan.diagnostic_limit || 0);
  const used = Number(plan.diagnostics_used || 0);

  return Math.max(0, limit - used);
}

export function formatPlanName(planName) {
  const map = {
    free: "Teste",
    solo: "Solo",
    consultor: "Consultor",
    pro: "Pro",
    agencia: "Agência",
    agencia_plus: "Agência Plus",
    admin: "Admin"
  };

  return map[String(planName || "").toLowerCase()] || "Teste";
}

function getNextMonthISO() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString();
}
