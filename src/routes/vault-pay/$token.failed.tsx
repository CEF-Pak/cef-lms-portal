import { createFileRoute, Link } from "@tanstack/react-router";
import { VaultPayHeader } from "@/components/vault-pay/VaultPayHeader";

export const Route = createFileRoute("/vault-pay/$token/failed")({
  component: VaultPayFailedPage,
});

function VaultPayFailedPage() {
  const { token } = Route.useParams();

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <VaultPayHeader />
      <main className="mx-auto max-w-lg px-4 py-8">
        <div className="rounded-lg border border-[#e9edf4] bg-white p-6 text-center shadow-sm">
          <div className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
            Payment failed
          </div>
          <h2 className="mt-4 text-xl font-semibold text-[#0a3a75]">Payment was not completed</h2>
          <p className="mt-2 text-sm text-slate-600">
            You can try again with the same payment link, or contact CEF support.
          </p>
          <Link
            to="/vault-pay/$token"
            params={{ token }}
            className="mt-6 inline-flex rounded-md bg-[#013370] px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </Link>
        </div>
      </main>
    </div>
  );
}
