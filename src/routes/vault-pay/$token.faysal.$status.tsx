import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/vault-pay/$token/faysal/$status")({
  beforeLoad: ({ params }) => {
    const { token, status } = params;
    if (status === "success") {
      throw redirect({ to: "/vault-pay/$token/success", params: { token } });
    }
    throw redirect({ to: "/vault-pay/$token/failed", params: { token } });
  },
  component: () => null,
});
