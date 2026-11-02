import { Link } from "@tanstack/react-router";

export function VaultPayHeader() {
  return (
    <header className="border-b border-[#e9edf4] bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8abe41]">
            CEF Online Academy
          </p>
          <h1 className="text-lg font-semibold text-[#0a3a75]">Vault license payment</h1>
        </div>
        <Link
          to="/login"
          className="text-sm text-[#013370] underline-offset-2 hover:underline"
        >
          Student login
        </Link>
      </div>
    </header>
  );
}
