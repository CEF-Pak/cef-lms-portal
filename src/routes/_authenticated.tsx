import { createFileRoute, redirect } from '@tanstack/react-router'
import { frontendUrl } from '@/config/authConfig'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location }) => {
    // Prefer router context, but fall back to localStorage (hash handoff / cookie sync can lag one tick vs default router context).
    const token =
      context.authentication?.token ??
      (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    const role =
      context.authentication?.role ??
      (typeof window !== "undefined" ? localStorage.getItem("role") : null);

    const path = location.pathname;

    if (!token) {
      const marketing = frontendUrl.trim();
      if ((path === "/" || path === "") && marketing) {
        throw redirect({ href: marketing });
      }
      throw redirect({ to: "/login" });
    }
    
    // If user is a student (role 3)
    if (role === "3") {
      // Allow access to student routes
      if (path.startsWith("/tutor")) {
        throw redirect({ to: "/" });
      }
    }
    // If user is a tutor (role 2)
    else if (role === "2") {
      // Allow access to tutor routes
      if (!path.startsWith("/tutor")) {
        throw redirect({ to: "/tutor" });
      }
    }
    // If role is neither 2 nor 3, redirect to login
    else {
      throw redirect({ to: "/login" });
    }
  },
})
