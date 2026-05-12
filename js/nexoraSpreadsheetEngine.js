// js/nexoraSpreadsheetEngine.js

export async function processarPlanilhaNexora(file) {
  if (!file) {
    throw new Error("Nenhum arquivo foi selecionado.");
  }

  const extension = getFileExtension(file.name);

  let rows = [];

  if (extension === "csv") {
    rows = await readCsv(file);
  } else if (extension === "xlsx" || extension === "xls") {
    rows = await readXlsx(file);
  } else {
    throw new Error("Formato não suportado. Envie um arquivo CSV, XLSX ou XLS.");
  }

  if (!rows.length) {
    throw new Error("A planilha não possui dados suficientes para leitura.");
  }

  const normalizedRows = normalizeRows(rows);
  const mapped = mapSpreadsheetData(normalizedRows);

  return {
    file_name: file.name,
    rows_count: rows.length,
    detected: mapped.detected,
    calculated: mapped.calculated,
    final_payload: mapped.final_payload,
    warnings: mapped.warnings
  };
}

/* =========================
   LEITURA DE ARQUIVOS
========================= */

function getFileExtension(filename = "") {
  return String(filename).split(".").pop().toLowerCase();
}

async function readCsv(file) {
  const text = await file.text();

  const separator = detectCsvSeparator(text);
  const lines = text
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0], separator);

  return lines.slice(1).map(line => {
    const values = splitCsvLine(line, separator);
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });

    return row;
  });
}

async function readXlsx(file) {
  if (!window.XLSX) {
    throw new Error("Biblioteca XLSX não encontrada. Adicione o script do SheetJS no diagnostico.html antes de usar XLSX.");
  }

  const buffer = await file.arrayBuffer();
  const workbook = window.XLSX.read(buffer, { type: "array" });

  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("A planilha XLSX não possui abas válidas.");
  }

  const sheet = workbook.Sheets[firstSheetName];

  return window.XLSX.utils.sheet_to_json(sheet, {
    defval: "",
    raw: false
  });
}

function detectCsvSeparator(text = "") {
  const firstLine = text.split(/\r?\n/)[0] || "";

  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;

  if (semicolonCount >= commaCount && semicolonCount >= tabCount) return ";";
  if (tabCount >= commaCount && tabCount >= semicolonCount) return "\t";

  return ",";
}

function splitCsvLine(line, separator) {
  const result = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === separator && !insideQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current.trim());

  return result;
}

/* =========================
   NORMALIZAÇÃO
========================= */

function normalizeRows(rows = []) {
  return rows
    .filter(row => row && typeof row === "object")
    .map(row => {
      const normalized = {};

      Object.entries(row).forEach(([key, value]) => {
        normalized[normalizeColumnName(key)] = value;
      });

      return normalized;
    });
}

function normalizeColumnName(value) {
  return String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, "_")
    .toLowerCase();
}

/* =========================
   MAPEAMENTO
========================= */

function mapSpreadsheetData(rows = []) {
  const warnings = [];

  const totals = {
    impressions: findAndSum(rows, COLUMN_MAP.impressions),
    clicks: findAndSum(rows, COLUMN_MAP.clicks),
    sessions: findAndSum(rows, COLUMN_MAP.sessions),
    orders: findAndSum(rows, COLUMN_MAP.orders),
    sales: findAndSum(rows, COLUMN_MAP.sales),
    spend: findAndSum(rows, COLUMN_MAP.spend),
    acos: findAverage(rows, COLUMN_MAP.acos),
    roas: findAverage(rows, COLUMN_MAP.roas),
    ctr: findAverage(rows, COLUMN_MAP.ctr),
    cvr: findAverage(rows, COLUMN_MAP.cvr),
    cpc: findAverage(rows, COLUMN_MAP.cpc),
    tacos: findAverage(rows, COLUMN_MAP.tacos),
    reviews: findLastValid(rows, COLUMN_MAP.reviews),
    rating: findLastValid(rows, COLUMN_MAP.rating),
    price: findLastValid(rows, COLUMN_MAP.price)
  };

  const calculated = calculateMetrics(totals);

  const finalPayload = {
    impressions: valueOrEmpty(totals.impressions),
    clicks: valueOrEmpty(totals.clicks),
    sessions: valueOrEmpty(totals.sessions),
    orders: valueOrEmpty(totals.orders),
    sales: valueOrEmpty(totals.sales),
    spend: valueOrEmpty(totals.spend),

    ctr: valueOrEmpty(totals.ctr || calculated.ctr),
    cvr: valueOrEmpty(totals.cvr || calculated.cvr),
    cpc: valueOrEmpty(totals.cpc || calculated.cpc),
    acos: valueOrEmpty(totals.acos || calculated.acos),
    roas: valueOrEmpty(totals.roas || calculated.roas),
    tacos: valueOrEmpty(totals.tacos || calculated.tacos),

    reviews: valueOrEmpty(totals.reviews),
    rating: valueOrEmpty(totals.rating),
    price: valueOrEmpty(totals.price)
  };

  addWarnings(warnings, totals, calculated);

  return {
    detected: totals,
    calculated,
    final_payload: finalPayload,
    warnings
  };
}

const COLUMN_MAP = {
  impressions: [
    "impressions",
    "impressoes",
    "impressoes_totais",
    "total_impressions",
    "ad_impressions",
    "visualizacoes",
    "visualizacoes_de_anuncio"
  ],

  clicks: [
    "clicks",
    "cliques",
    "ad_clicks",
    "total_clicks"
  ],

  sessions: [
    "sessions",
    "sessoes",
    "sessoes_totais",
    "total_sessions",
    "browser_sessions",
    "mobile_app_sessions"
  ],

  orders: [
    "orders",
    "pedidos",
    "unidades_pedidas",
    "total_order_items",
    "ordered_units",
    "orders_placed",
    "purchases",
    "compras"
  ],

  sales: [
    "sales",
    "vendas",
    "vendas_totais",
    "total_sales",
    "ordered_product_sales",
    "sales_revenue",
    "receita",
    "revenue",
    "7_day_total_sales",
    "14_day_total_sales",
    "7_day_total_sales_",
    "14_day_total_sales_"
  ],

  spend: [
    "spend",
    "gasto",
    "investimento",
    "cost",
    "custo",
    "ad_spend",
    "advertising_cost",
    "total_spend"
  ],

  acos: [
    "acos",
    "advertising_cost_of_sales",
    "advertising_cost_of_sales_acos"
  ],

  roas: [
    "roas",
    "return_on_ad_spend"
  ],

  ctr: [
    "ctr",
    "click_through_rate",
    "taxa_de_cliques",
    "click_thru_rate"
  ],

  cvr: [
    "cvr",
    "conversion_rate",
    "taxa_de_conversao",
    "unit_session_percentage",
    "unit_session_percentage_",
    "order_session_percentage"
  ],

  cpc: [
    "cpc",
    "cost_per_click",
    "custo_por_clique"
  ],

  tacos: [
    "tacos",
    "total_acos",
    "total_advertising_cost_of_sales"
  ],

  reviews: [
    "reviews",
    "review_count",
    "avaliacoes",
    "numero_de_avaliacoes",
    "current_reviews"
  ],

  rating: [
    "rating",
    "stars",
    "avaliacao",
    "nota",
    "current_rating"
  ],

  price: [
    "price",
    "preco",
    "sell_price",
    "current_price",
    "sale_price"
  ]
};

/* =========================
   CÁLCULOS
========================= */

function calculateMetrics(totals) {
  const impressions = toNumber(totals.impressions);
  const clicks = toNumber(totals.clicks);
  const sessions = toNumber(totals.sessions);
  const orders = toNumber(totals.orders);
  const sales = toNumber(totals.sales);
  const spend = toNumber(totals.spend);

  return {
    ctr: impressions > 0 && clicks > 0
      ? round((clicks / impressions) * 100)
      : null,

    cvr: clicks > 0 && orders > 0
      ? round((orders / clicks) * 100)
      : sessions > 0 && orders > 0
        ? round((orders / sessions) * 100)
        : null,

    cpc: clicks > 0 && spend > 0
      ? round(spend / clicks)
      : null,

    acos: sales > 0 && spend > 0
      ? round((spend / sales) * 100)
      : null,

    roas: spend > 0 && sales > 0
      ? round(sales / spend)
      : null,

    tacos: sales > 0 && spend > 0
      ? round((spend / sales) * 100)
      : null
  };
}

function addWarnings(warnings, totals, calculated) {
  if (!totals.impressions) {
    warnings.push("Impressões não foram identificadas na planilha.");
  }

  if (!totals.clicks) {
    warnings.push("Cliques não foram identificados na planilha.");
  }

  if (!totals.sales) {
    warnings.push("Vendas/receita não foram identificadas na planilha.");
  }

  if (!totals.spend) {
    warnings.push("Investimento/gasto de mídia não foi identificado na planilha.");
  }

  if (!totals.ctr && calculated.ctr) {
    warnings.push("CTR não estava na planilha e foi calculado pela Nexora.");
  }

  if (!totals.cvr && calculated.cvr) {
    warnings.push("CVR não estava na planilha e foi calculado pela Nexora.");
  }

  if (!totals.acos && calculated.acos) {
    warnings.push("ACOS não estava na planilha e foi calculado pela Nexora.");
  }

  if (!totals.roas && calculated.roas) {
    warnings.push("ROAS não estava na planilha e foi calculado pela Nexora.");
  }
}

/* =========================
   BUSCA DE COLUNAS
========================= */

function findAndSum(rows, possibleColumns = []) {
  const column = findColumn(rows, possibleColumns);

  if (!column) return null;

  return round(
    rows.reduce((sum, row) => sum + toNumber(row[column]), 0)
  );
}

function findAverage(rows, possibleColumns = []) {
  const column = findColumn(rows, possibleColumns);

  if (!column) return null;

  const values = rows
    .map(row => toNumber(row[column]))
    .filter(value => value > 0);

  if (!values.length) return null;

  return round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function findLastValid(rows, possibleColumns = []) {
  const column = findColumn(rows, possibleColumns);

  if (!column) return null;

  const values = rows
    .map(row => toNumber(row[column]))
    .filter(value => value > 0);

  return values.length ? values[values.length - 1] : null;
}

function findColumn(rows, possibleColumns = []) {
  if (!rows.length) return null;

  const availableColumns = Object.keys(rows[0] || {});

  for (const expected of possibleColumns) {
    const normalizedExpected = normalizeColumnName(expected);

    const exact = availableColumns.find(column => column === normalizedExpected);
    if (exact) return exact;

    const partial = availableColumns.find(column =>
      column.includes(normalizedExpected) ||
      normalizedExpected.includes(column)
    );

    if (partial) return partial;
  }

  return null;
}

/* =========================
   HELPERS
========================= */

function toNumber(value) {
  if (value === undefined || value === null || value === "") return 0;

  let text = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace("R$", "")
    .replace("$", "")
    .replace("%", "");

  if (!text) return 0;

  const hasComma = text.includes(",");
  const hasDot = text.includes(".");

  if (hasComma && hasDot) {
    // Ex: 1.234,56
    if (text.lastIndexOf(",") > text.lastIndexOf(".")) {
      text = text.replace(/\./g, "").replace(",", ".");
    } else {
      // Ex: 1,234.56
      text = text.replace(/,/g, "");
    }
  } else if (hasComma) {
    text = text.replace(",", ".");
  }

  const number = Number(text);

  return Number.isFinite(number) ? number : 0;
}

function round(value, decimals = 2) {
  const number = Number(value);

  if (!Number.isFinite(number)) return null;

  return Number(number.toFixed(decimals));
}

function valueOrEmpty(value) {
  return value === null || value === undefined || value === 0 ? "" : value;
}
