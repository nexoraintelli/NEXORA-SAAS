// api/create-payment.js

const PLANOS_NEXORA = {
  teste: {
    title: "Nexora Intelligence · Plano Teste",
    amount: 0,
    diagnostics: 1,
    products: 1,
    type: "subscription"
  },
  solo: {
    title: "Nexora Intelligence · Plano Solo",
    amount: 49,
    diagnostics: 5,
    products: 3,
    type: "subscription"
  },
  consultor: {
    title: "Nexora Intelligence · Plano Consultor",
    amount: 97,
    diagnostics: 15,
    products: 10,
    type: "subscription"
  },
  pro: {
    title: "Nexora Intelligence · Plano Pro",
    amount: 197,
    diagnostics: 40,
    products: 25,
    type: "subscription"
  },
  agencia: {
    title: "Nexora Intelligence · Plano Agência",
    amount: 397,
    diagnostics: 100,
    products: 60,
    type: "subscription"
  },
  agencia_plus: {
    title: "Nexora Intelligence · Plano Agência Plus",
    amount: 697,
    diagnostics: 250,
    products: 150,
    type: "subscription"
  },
  extra_10: {
    title: "Nexora Intelligence · Extra 10 créditos",
    amount: 47,
    diagnostics: 10,
    products: 0,
    type: "credits"
  },
  extra_25: {
    title: "Nexora Intelligence · Extra 25 créditos",
    amount: 97,
    diagnostics: 25,
    products: 0,
    type: "credits"
  },
  extra_100: {
    title: "Nexora Intelligence · Extra 100 créditos",
    amount: 297,
    diagnostics: 100,
    products: 0,
    type: "credits"
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido."
    });
  }

  try {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return res.status(500).json({
        error: "MERCADO_PAGO_ACCESS_TOKEN não configurado na Vercel."
      });
    }

    const { planKey, orderId, userId, userEmail } = req.body || {};

    if (!planKey) {
      return res.status(400).json({
        error: "planKey é obrigatório."
      });
    }

    const plan = PLANOS_NEXORA[planKey];

    if (!plan) {
      return res.status(400).json({
        error: "Plano ou pacote inválido."
      });
    }

    if (Number(plan.amount) <= 0) {
      return res.status(400).json({
        error: "Plano gratuito não precisa de checkout."
      });
    }

    const siteUrl =
      process.env.NEXORA_SITE_URL ||
      "https://www.nexoraintelligence.com.br";

    const preferencePayload = {
      items: [
        {
          title: plan.title,
          quantity: 1,
          unit_price: Number(plan.amount),
          currency_id: "BRL"
        }
      ],
      payer: userEmail
        ? {
            email: userEmail
          }
        : undefined,
      external_reference: JSON.stringify({
        orderId: orderId || null,
        planKey,
        userId: userId || null,
        type: plan.type
      }),
      back_urls: {
        success: `${siteUrl}/pages/planos.html?payment=success`,
        failure: `${siteUrl}/pages/planos.html?payment=failure`,
        pending: `${siteUrl}/pages/planos.html?payment=pending`
      },
      auto_return: "approved",
      notification_url: `${siteUrl}/api/mercadopago-webhook`
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(preferencePayload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro Mercado Pago:", data);

      return res.status(response.status).json({
        error: "Erro ao criar preferência no Mercado Pago.",
        details: data
      });
    }

    return res.status(200).json({
  id: data.id,
  checkout_url: data.sandbox_init_point || data.init_point,
  sandbox_checkout_url: data.sandbox_init_point,
  production_checkout_url: data.init_point
});
  } catch (error) {
    console.error("Erro em create-payment:", error);

    return res.status(500).json({
      error: "Erro interno ao criar pagamento.",
      details: error?.message || String(error)
    });
  }
}
