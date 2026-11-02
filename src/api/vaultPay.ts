import { baseUrl } from "@/config/authConfig";

export type VaultPaySummary = {
  token: string;
  status: string;
  expires_at: string | null;
  holder_name: string | null;
  amount: number | null;
  currency: string;
  period_start: string | null;
  period_end: string | null;
  payment_methods: string[];
  include_offline_pack: boolean;
  paid: boolean;
  license_key: string | null;
  license_status: string | null;
  download_token: string | null;
  download_expires_at: string | null;
  offline_pack: {
    status: string;
    error: string | null;
    downloadable: boolean;
  } | null;
};

async function parseJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

export async function fetchVaultPaySummary(token: string): Promise<VaultPaySummary> {
  const res = await fetch(`${baseUrl}vault-pay/${encodeURIComponent(token)}`);
  const data = await parseJson(res);
  return data.data as VaultPaySummary;
}

export async function startVaultPayCheckout(
  token: string,
  paymentMethod: string
): Promise<Record<string, unknown>> {
  const res = await fetch(`${baseUrl}vault-pay/${encodeURIComponent(token)}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      payment_method: paymentMethod,
      dashboard_origin: window.location.origin,
    }),
  });
  const data = await parseJson(res);
  return data.data as Record<string, unknown>;
}

export async function completeVaultPayMeezan(token: string): Promise<{
  result: string;
  message: string;
  data: VaultPaySummary | null;
}> {
  const res = await fetch(
    `${baseUrl}vault-pay/${encodeURIComponent(token)}/meezan-complete`,
    {
      method: "POST",
      headers: { Accept: "application/json" },
    }
  );
  const data = await res.json().catch(() => ({}));
  return {
    result: data.result || (res.ok ? "completed" : "error"),
    message: data.message || "",
    data: data.data ?? null,
  };
}

export function vaultPackDownloadUrl(downloadToken: string): string {
  return `${baseUrl}vault-pay/download/${encodeURIComponent(downloadToken)}`;
}
