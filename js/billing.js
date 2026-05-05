import { sb } from "./supabaseClient.js";
import { requireAuth } from "./auth.js";

export const NEXORA_PLANS = {
  teste: {
    order_type: "subscription",
    plan_name: "teste",
    plan_label: "Teste",
    amount: 0,
    diagnostics_included: 1,
    products_included: 1
  },
  solo: {
    order_type: "subscription",
    plan_name: "solo",
    plan_label: "Solo",
    amount: 49,
    diagnostics_included: 5,
    products_included: 3
  },
  consultor: {
    order_type: "subscription",
    plan_name: "consultor",
    plan_label: "Consultor",
    amount: 97,
    diagnostics_included: 15,
    products_included: 10
  },
  pro: {
    order_type: "subscription",
    plan_name: "pro",
    plan_label: "Pro",
    amount: 197,
    diagnostics_included: 40,
    products_included: 25
  },
  agencia: {
    order_type: "subscription",
    plan_name: "agencia",
    plan_label: "Agência",
    amount: 397,
    diagnostics_included: 100,
    products_included: 60
  },
  agencia_plus: {
    order_type: "subscription",
    plan_name: "agencia_plus",
    plan_label: "Agência Plus",
    amount: 697,
    diagnostics_included: 250,
    products_included: 150
  },
  extra_10: {
    order_type: "credits",
    plan_name: "extra_10",
    plan_label: "Extra 10",
    amount: 47,
    diagnostics_included: 10,
    products_included: 0
  },
  extra_25: {
    order_type: "credits",
    plan_name: "extra_25",
    plan_label: "Extra 25",
    amount: 97,
    diagnostics_included: 25,
    products_included: 0
  },
  extra_100: {
    order_type: "credits",
    plan_name: "extra_100",
    plan_label: "Extra 100",
    amount: 297,
    diagnostics_included: 100,
    products_included: 0
  }
};

export async function createPaymentOrder(planKey) {
  const user = await requireAuth();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const selectedPlan = NEXORA_PLANS[String(planKey || "").toLowerCase()];

  if (!selectedPlan) {
    throw new Error("Plano ou pacote inválido.");
  }

  const { data, error } = await sb
    .from("payment_orders")
    .insert({
      user_id: user.id,
      order_type: selectedPlan.order_type,
      plan_name: selectedPlan.plan_name,
      plan_label: selectedPlan.plan_label,
      amount: selectedPlan.amount,
      diagnostics_included: selectedPlan.diagnostics_included,
      products_included: selectedPlan.products_included,
      status: "pending",
      provider: "manual"
    })
    .select("*")
    .single();

  if (error) {
    console.error("Erro ao criar pedido de pagamento:", error);
    throw error;
  }

  return data;
}

export async function listPaymentOrders(limit = 10) {
  const user = await requireAuth();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { data, error } = await sb
    .from("payment_orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Erro ao listar pedidos:", error);
    throw error;
  }

  return data || [];
}

export function formatCurrencyBRL(value) {
  const number = Number(value || 0);

  return number.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}
