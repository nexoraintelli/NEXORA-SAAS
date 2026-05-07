// api/mercadopago-webhook.js

const PLANOS_NEXORA = {
  teste: {
    order_type: "subscription",
    plan_name: "teste",
    diagnostic_limit: 1,
    product_limit: 1
  },
  solo: {
    order_type: "subscription",
    plan_name: "solo",
    diagnostic_limit: 5,
    product_limit: 3
  },
  consultor: {
    order_type: "subscription",
    plan_name: "consultor",
    diagnostic_limit: 15,
    product_limit: 10
  },
  pro: {
    order_type: "subscription",
    plan_name: "pro",
    diagnostic_limit: 40,
    product_limit: 25
  },
  agencia: {
    order_type: "subscription",
    plan_name: "agencia",
    diagnostic_limit: 100,
    product_limit: 60
  },
  agencia_plus: {
    order_type: "subscription",
    plan_name: "agencia_plus",
    diagnostic_limit: 250,
    product_limit: 150
  },
  extra_10: {
    order_type: "credits",
    plan_name: "extra_10",
    diagnostics_added: 10
  },
  extra_25: {
    order_type: "credits",
    plan_name: "extra_25",
    diagnostics_added: 25
  },
  extra_100: {
    order_type: "credits",
    plan_name: "extra_100",
    diagnostics_added: 100
  }
};

export default async function handler(req, res) {
  try {
    if (req.method !== "POST" && req.method !== "GET") {
      return res.status(405).json({
        ok: false,
        error: "Método não permitido."
      });
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!accessToken) {
      return res.status(500).json({
        ok: false,
        error: "MERCADO_PAGO_ACCESS_TOKEN não configurado."
      });
    }

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return res.status(500).json({
        ok: false,
        error: "SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados."
      });
    }

    const paymentId =
      req.body?.data?.id ||
      req.body?.id ||
      req.query?.["data.id"] ||
      req.query?.id;

    const topic =
      req.body?.type ||
      req.body?.topic ||
      req.query?.type ||
      req.query?.topic;

    if (!paymentId) {
      return res.status(200).json({
        ok: true,
        message: "Webhook recebido, mas sem paymentId.",
        topic
      });
    }

    const payment = await getMercadoPagoPayment(paymentId, accessToken);

    if (!payment || !payment.id) {
      return res.status(200).json({
        ok: true,
        message: "Pagamento não encontrado no Mercado Pago.",
        paymentId
      });
    }

    const externalReference = payment.external_reference || "";
    const reference = parseExternalReference(externalReference);

    const orderId = reference?.orderId || null;
    const planKey = reference?.planKey || null;
    const userId = reference?.userId || null;

    if (!orderId || !planKey || !userId) {
      return res.status(200).json({
        ok: true,
        message: "Pagamento recebido, mas sem referência completa.",
        paymentId: payment.id,
        externalReference
      });
    }

    const selectedPlan = PLANOS_NEXORA[planKey];

    if (!selectedPlan) {
      return res.status(200).json({
        ok: true,
        message: "Plano não encontrado no mapa da Nexora.",
        planKey
      });
    }

    const paymentStatus = String(payment.status || "").toLowerCase();

    const orders = await supabaseFetch({
      supabaseUrl,
      supabaseServiceRoleKey,
      path: `/rest/v1/payment_orders?id=eq.${encodeURIComponent(orderId)}&select=*`,
      method: "GET"
    });

    const currentOrder = Array.isArray(orders) ? orders[0] : null;

    if (!currentOrder) {
      return res.status(200).json({
        ok: true,
        message: "Pedido não encontrado na Nexora.",
        orderId
      });
    }

    if (currentOrder.status === "paid") {
      return res.status(200).json({
        ok: true,
        message: "Pedido já estava pago. Nenhuma ação duplicada realizada.",
        orderId
      });
    }

    if (paymentStatus !== "approved") {
      await updatePaymentOrder({
        supabaseUrl,
        supabaseServiceRoleKey,
        orderId,
        status: paymentStatus === "rejected" ? "failed" : "pending",
        mercadoPagoPaymentId: String(payment.id),
        mercadoPagoStatus: paymentStatus,
        externalReference
      });

      return res.status(200).json({
        ok: true,
        message: "Pagamento ainda não aprovado.",
        paymentStatus
      });
    }

    await updatePaymentOrder({
      supabaseUrl,
      supabaseServiceRoleKey,
      orderId,
      status: "paid",
      mercadoPagoPaymentId: String(payment.id),
      mercadoPagoStatus: paymentStatus,
      externalReference
    });

    if (selectedPlan.order_type === "subscription") {
      await activateSubscriptionPlan({
        supabaseUrl,
        supabaseServiceRoleKey,
        userId,
        selectedPlan
      });
    }

    if (selectedPlan.order_type === "credits") {
      await addExtraCredits({
        supabaseUrl,
        supabaseServiceRoleKey,
        userId,
        creditsToAdd: Number(selectedPlan.diagnostics_added || 0)
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Pagamento aprovado e plano/créditos atualizados com sucesso.",
      orderId,
      planKey,
      paymentId: payment.id
    });
  } catch (error) {
    console.error("Erro no webhook Mercado Pago:", error);

    return res.status(500).json({
      ok: false,
      error: "Erro interno no webhook.",
      details: error?.message || String(error)
    });
  }
}

async function getMercadoPagoPayment(paymentId, accessToken) {
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error("Erro ao consultar pagamento Mercado Pago:", data);
    return null;
  }

  return data;
}

function parseExternalReference(value) {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

async function updatePaymentOrder({
  supabaseUrl,
  supabaseServiceRoleKey,
  orderId,
  status,
  mercadoPagoPaymentId,
  mercadoPagoStatus,
  externalReference
}) {
  return await supabaseFetch({
    supabaseUrl,
    supabaseServiceRoleKey,
    path: `/rest/v1/payment_orders?id=eq.${encodeURIComponent(orderId)}`,
    method: "PATCH",
    body: {
      status,
      provider: "mercado_pago",
      mercado_pago_payment_id: mercadoPagoPaymentId,
      mercado_pago_status: mercadoPagoStatus,
      mercado_pago_reference: externalReference,
      paid_at: status === "paid" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    }
  });
}

async function activateSubscriptionPlan({
  supabaseUrl,
  supabaseServiceRoleKey,
  userId,
  selectedPlan
}) {
  const existingPlans = await supabaseFetch({
    supabaseUrl,
    supabaseServiceRoleKey,
    path: `/rest/v1/user_plans?user_id=eq.${encodeURIComponent(userId)}&select=*`,
    method: "GET"
  });

  const currentPlan = Array.isArray(existingPlans) ? existingPlans[0] : null;

  const currentPeriodStart = new Date();
  const currentPeriodEnd = new Date();
  currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

  const payload = {
    user_id: userId,
    plan_name: selectedPlan.plan_name,
    plan_status: "active",
    diagnostic_limit: selectedPlan.diagnostic_limit,
    product_limit: selectedPlan.product_limit,
    diagnostics_used: 0,
    current_period_start: currentPeriodStart.toISOString(),
    current_period_end: currentPeriodEnd.toISOString(),
    updated_at: new Date().toISOString()
  };

  if (currentPlan?.id) {
    return await supabaseFetch({
      supabaseUrl,
      supabaseServiceRoleKey,
      path: `/rest/v1/user_plans?id=eq.${encodeURIComponent(currentPlan.id)}`,
      method: "PATCH",
      body: payload
    });
  }

  return await supabaseFetch({
    supabaseUrl,
    supabaseServiceRoleKey,
    path: `/rest/v1/user_plans`,
    method: "POST",
    body: payload
  });
}

async function addExtraCredits({
  supabaseUrl,
  supabaseServiceRoleKey,
  userId,
  creditsToAdd
}) {
  const existingPlans = await supabaseFetch({
    supabaseUrl,
    supabaseServiceRoleKey,
    path: `/rest/v1/user_plans?user_id=eq.${encodeURIComponent(userId)}&select=*`,
    method: "GET"
  });

  const currentPlan = Array.isArray(existingPlans) ? existingPlans[0] : null;

  if (!currentPlan?.id) {
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    return await supabaseFetch({
      supabaseUrl,
      supabaseServiceRoleKey,
      path: `/rest/v1/user_plans`,
      method: "POST",
      body: {
        user_id: userId,
        plan_name: "teste",
        plan_status: "active",
        diagnostic_limit: creditsToAdd,
        product_limit: 1,
        diagnostics_used: 0,
        current_period_start: currentPeriodStart.toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        updated_at: new Date().toISOString()
      }
    });
  }

  const currentLimit = Number(currentPlan.diagnostic_limit || 0);
  const nextLimit = currentLimit + creditsToAdd;

  return await supabaseFetch({
    supabaseUrl,
    supabaseServiceRoleKey,
    path: `/rest/v1/user_plans?id=eq.${encodeURIComponent(currentPlan.id)}`,
    method: "PATCH",
    body: {
      diagnostic_limit: nextLimit,
      updated_at: new Date().toISOString()
    }
  });
}

async function supabaseFetch({
  supabaseUrl,
  supabaseServiceRoleKey,
  path,
  method,
  body
}) {
  const response = await fetch(`${supabaseUrl}${path}`, {
    method,
    headers: {
      apikey: supabaseServiceRoleKey,
      Authorization: `Bearer ${supabaseServiceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    console.error("Erro Supabase REST:", {
      status: response.status,
      data
    });

    throw new Error(
      typeof data === "string"
        ? data
        : data?.message || "Erro ao consultar Supabase."
    );
  }

  return data;
}
