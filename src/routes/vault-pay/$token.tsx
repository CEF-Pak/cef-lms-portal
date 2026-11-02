import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  fetchVaultPaySummary,
  startVaultPayCheckout,
  type VaultPaySummary,
} from "@/api/vaultPay";
import { VaultPayHeader } from "@/components/vault-pay/VaultPayHeader";
import { VaultPayMethodPicker } from "@/components/vault-pay/VaultPayMethodPicker";
import { Spinner } from "@/components/ui/spinner";

export const Route = createFileRoute("/vault-pay/$token")({
  component: VaultPayCheckoutPage,
});

function VaultPayCheckoutPage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<VaultPaySummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState("");
  const [faysalFormUrl, setFaysalFormUrl] = useState("");
  const [faysalFields, setFaysalFields] = useState<Record<string, string> | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchVaultPaySummary(token);
        if (cancelled) return;
        setSummary(data);
        if (data.payment_methods.includes("meezan_bank")) setMethod("meezan_bank");
        else if (data.payment_methods.includes("faysal_bank")) setMethod("faysal_bank");
        if (data.paid) {
          navigate({ to: "/vault-pay/$token/success", params: { token } });
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  const onPay = async () => {
    if (!method || paying) return;
    setPaying(true);
    setError(null);
    try {
      const result = await startVaultPayCheckout(token, method);
      if (method === "meezan_bank") {
        const url = result.meezan_payment_flow_redirect_url as string;
        if (!url) throw new Error("Missing Meezan redirect URL");
        window.location.href = url;
        return;
      }
      if (method === "faysal_bank") {
        const action = result["frontend_form-action_url"] as string;
        const fields = result.form_required_parameters_values as Record<
          string,
          string | boolean | number
        >;
        if (!action || !fields) throw new Error("Missing Faysal form data");
        const normalized: Record<string, string> = {};
        for (const [k, v] of Object.entries(fields)) {
          normalized[k] = String(v);
        }
        // Override return URLs to this dashboard origin
        normalized.SUCCESS_URL = `${window.location.origin}/vault-pay/${token}/faysal/success`;
        normalized.FAILURE_URL = `${window.location.origin}/vault-pay/${token}/faysal/failed`;
        normalized.CANCEL_URL = normalized.FAILURE_URL;
        setFaysalFormUrl(action);
        setFaysalFields(normalized);
        return;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <VaultPayHeader />
      <main className="mx-auto max-w-lg px-4 py-8">
        <div className="rounded-lg border border-[#e9edf4] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#0a3a75]">Checkout</h2>
          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

          {summary && summary.status !== "open" && !summary.paid && (
            <p className="mt-4 text-sm text-slate-600">
              This payment link is {summary.status}. Please ask CEF for a new link.
            </p>
          )}

          {summary && summary.status === "open" && (
            <>
              <div className="mt-4 space-y-2 border-b border-[#e9edf4] pb-4 text-sm">
                {summary.holder_name && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Customer</span>
                    <span className="font-medium text-slate-800">{summary.holder_name}</span>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <span className="text-slate-500">Amount</span>
                  <span className="text-lg font-semibold text-[#013370]">
                    {summary.currency} {Number(summary.amount ?? 0).toLocaleString()}
                  </span>
                </div>
                {(summary.period_start || summary.period_end) && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Coverage</span>
                    <span className="text-slate-800">
                      {[summary.period_start, summary.period_end].filter(Boolean).join(" → ")}
                    </span>
                  </div>
                )}
              </div>

              <VaultPayMethodPicker
                methods={summary.payment_methods}
                value={method}
                onChange={setMethod}
              />

              <button
                type="button"
                disabled={!method || paying}
                onClick={onPay}
                className="mt-6 w-full rounded-md bg-[#013370] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {paying ? "Redirecting…" : "Continue to payment"}
              </button>
            </>
          )}
        </div>
      </main>

      {faysalFields && faysalFormUrl && (
        <form
          action={faysalFormUrl}
          method="POST"
          id="vaultFaysalPaymentForm"
          ref={(formEl) => {
            if (formEl) setTimeout(() => formEl.submit(), 50);
          }}
        >
          {Object.entries(faysalFields).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
        </form>
      )}
    </div>
  );
}
