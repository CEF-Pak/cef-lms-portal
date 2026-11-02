import { AuthContext } from "@/api/useAuth";
import { createRootRouteWithContext, Outlet, useRouterState } from "@tanstack/react-router";
import Navbar from "@/components/common/navbar";

type RouterContext = {
  authentication: AuthContext;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});

function RootLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isVaultPay = pathname.startsWith("/vault-pay");

  return (
    <>
      {!isVaultPay && <Navbar />}
      <Outlet />
    </>
  );
}
