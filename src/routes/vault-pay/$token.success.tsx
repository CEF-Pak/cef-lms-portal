import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  completeVaultPayMeezan,
  fetchVaultPaySummary,
  vaultPackDownloadUrl,
  type VaultPaySummary,
} from "@/api/vaultPay";
import { VaultPayHeader } from "@/components/vault-pay/VaultPayHeader";
import { Spinner } from "@/components/ui/spinner";
import paymentSvg from "@/assets/payment.svg";

export const Route = createFileRoute("/vault-pay/$token/success")({
  component: VaultPaySuccessPage,
});

function VaultPaySuccessPage() {
  const { token } = Route.useParams();
  const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const fromMeezan = search?.get("meezan") === "1";

  const [summary, setSummary] = useState<VaultPaySummary | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;

    const load = async () => {
      try {
        if (fromMeezan) {
          const result = await completeVaultPayMeezan(token);
          if (cancelled) return;
          if (result.data) setSummary(result.data);
          setMessage(result.message);
          if (result.result === "pending") {
            // keep polling status
          }
        }
        const data = await fetchVaultPaySummary(token);
        if (cancelled) return;
        setSummary(data);
      } catch (e) {
        if (!cancelled) setMessage(e instanceof Error ? e.message : "Could not confirm payment");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    timer = setInterval(async () => {
      try {
        const data = await fetchVaultPaySummary(token);
        if (!cancelled) setSummary(data);
      } catch {
        /* ignore poll errors */
      }
    }, 3000);

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
    };
  }, [token, fromMeezan]);

  if (loading && !summary) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8]">
        <Spinner />
      </div>
    );
  }

  const paid = summary?.paid === true;

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <VaultPayHeader />
      <main className="mx-auto max-w-lg px-4 py-8">
        <div className="rounded-lg border border-[#e9edf4] bg-white p-6 text-center shadow-sm">
          <img src={paymentSvg} alt="" className="mx-auto mb-4 h-24 w-24" />
          <div
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              paid ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
            }`}
          >
            {paid ? "Payment successful" : "Confirming payment…"}
          </div>
          <h2 className="mt-4 text-xl font-semibold text-[#0a3a75]">
            {paid ? "Your vault license is active" : "Waiting for bank confirmation"}
          </h2>
          {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}

          {paid && summary?.license_key && (
            <div className="mt-6 rounded-md bg-[#e9edf4] p-4 text-left">
              <p className="text-xs uppercase text-slate-500">License key</p>
              <p className="mt-1 break-all font-mono text-sm font-semibold text-[#013370]">
                {summary.license_key}
              </p>
              <p className="mt-3 text-xs text-slate-600">
                Open CEF Vault on your registered device and activate with this key (online), or
                import the offline pack below if you need offline activation.
              </p>
            </div>
          )}

          {paid && summary?.include_offline_pack && (
            <div className="mt-6 rounded-md border border-[#e9edf4] p-4 text-left text-sm">
              <p className="font-semibold text-[#0a3a75]">Offline content pack</p>
              {!summary.offline_pack && (
                <p className="mt-1 text-slate-600">
                  Pack was not queued (content may still be preparing). Contact CEF if you need an
                  offline pack.
                </p>
              )}
              {summary.offline_pack?.status === "pending" && (
                <p className="mt-1 text-slate-600">Building your pack… this page refreshes automatically.</p>
              )}
              {summary.offline_pack?.status === "failed" && (
                <p className="mt-1 text-red-700">
                  Pack build failed{summary.offline_pack.error ? `: ${summary.offline_pack.error}` : "."}
                </p>
              )}
              {summary.offline_pack?.downloadable && summary.download_token && (
                <a
                  className="mt-3 inline-flex rounded-md bg-[#8abe41] px-4 py-2 text-sm font-semibold text-white"
                  href={vaultPackDownloadUrl(summary.download_token)}
                >
                  Download offline pack
                </a>
              )}
            </div>
          )}

          {!paid && (
            <Link
              to="/vault-pay/$token"
              params={{ token }}
              className="mt-6 inline-block text-sm text-[#013370] underline"
            >
              Back to checkout
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
