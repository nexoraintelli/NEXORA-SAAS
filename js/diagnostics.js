import { sb } from "./supabaseClient.js";
import { getCurrentUser } from "./auth.js";

export async function createDiagnostic({ clientId = null, productId = null } = {}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Usuário não autenticado.");

  const { data, error } = await sb
    .from("diagnostics")
    .insert({ user_id: user.id, client_id: clientId, product_id: productId, status: "draft" })
    .select()
    .single();

  if (error) throw error;
  localStorage.setItem("nx_diagnostic_id", data.id);
  return data;
}

export function getDiagnosticId() {
  return localStorage.getItem("nx_diagnostic_id");
}

export async function saveBrainResult({ diagnosticId, brainCode, brainName, score, resultData }) {
  if (!diagnosticId) throw new Error("diagnostic_id ausente.");
  const { data, error } = await sb
    .from("brain_results")
    .upsert({ diagnostic_id: diagnosticId, brain_code: brainCode, brain_name: brainName, score, result_data: resultData }, { onConflict: "diagnostic_id,brain_code" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateDiagnostic(id, payload) {
  const { data, error } = await sb.from("diagnostics").update(payload).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

