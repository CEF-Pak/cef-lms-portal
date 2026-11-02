import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./index.css";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { useAuth } from "./api/useAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setAuthCookie, getAuthCookie, isLikelySanctumToken } from "./lib/auth-cookie";
import {
	applyPortalHashUserDetails,
	clearPortalProfileLocalStorage,
} from "./lib/portal-hash-handoff";

const queryClient = new QueryClient();

// Accept token from URL (e.g. redirect from cef-online-academy login popup) or from shared cookie
let didRedirectFromHash = false;
if (typeof window !== "undefined") {
	const hash = window.location.hash.slice(1);
	if (hash) {
		const params = new URLSearchParams(hash);
		const token = params.get("token");
		const role = params.get("role");
		const checkout = params.get("checkout");
		// Only accept token that looks like a Sanctum API token (not e.g. user id "6118")
		const validToken = token && token.length >= 20 && !/^\d+$/.test(token.trim());
		if (validToken && role) {
			clearPortalProfileLocalStorage();
			localStorage.setItem("token", token);
			localStorage.setItem("role", role);
			setAuthCookie(token, role);
			applyPortalHashUserDetails(params);
			// If landing on /billing with checkout=1 (e.g. after signup from academy), stay on billing and keep hash so billing page opens checkout sidebar
			if (window.location.pathname === "/billing" && checkout) {
				window.history.replaceState(null, "", "/billing#checkout=1");
			} else {
				window.history.replaceState(null, "", window.location.pathname + window.location.search);
				window.location.href = role === "2" ? "/tutor" : "/";
				didRedirectFromHash = true;
			}
		}
	}
	// If no token in URL, sync from shared cookie: always prefer a valid cookie token over whatever is in localStorage (covers stale tokens from previous sessions)
	if (!didRedirectFromHash) {
		const auth = getAuthCookie();
		if (auth?.token && auth?.role && isLikelySanctumToken(auth.token)) {
			const currentToken = localStorage.getItem("token");
			if (currentToken !== auth.token) {
				clearPortalProfileLocalStorage();
				localStorage.setItem("token", auth.token);
				localStorage.setItem("role", auth.role);
			}
		}
	}
}

// Create a new router instance
const router = createRouter({ 
	routeTree, 
	context: { 
		authentication: { token: null, role: null } // Default authentication context
	} 
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

// Auth Provider Component
function AuthProvider() {
	const auth = useAuth();
	return <RouterProvider router={router} context={{ authentication: auth }} />;
}

// Render the app (skip if we just redirected from token-in-URL handoff)
if (!didRedirectFromHash) {
	ReactDOM.createRoot(document.getElementById("root")!).render(
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<AuthProvider />
			</QueryClientProvider>
		</StrictMode>
	);
}
