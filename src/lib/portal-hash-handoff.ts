/** Keys cached from /me or hash; clear when a new session token is applied so we never pair a new token with an old user's profile. */
const PROFILE_CACHE_KEYS = [
  "user_name",
  "user_email",
  "user_image",
  "user_phone",
  "user_id",
  "first_name",
  "last_name",
  "gender",
  "country_id",
  "address",
  "postal_code",
  "biography",
] as const;

export function clearPortalProfileLocalStorage(): void {
  if (typeof window === "undefined") return;
  for (const k of PROFILE_CACHE_KEYS) {
    localStorage.removeItem(k);
  }
}

/**
 * Persist profile fields from URL hash (cef-online-academy login redirect) into localStorage
 * so the portal navbar can render before /api/me returns.
 */
export function applyPortalHashUserDetails(params: URLSearchParams): void {
  const setIf = (storageKey: string, paramKey: string) => {
    const v = params.get(paramKey);
    if (v != null && v !== "") localStorage.setItem(storageKey, v);
  };

  setIf("user_name", "user_name");
  setIf("user_email", "user_email");
  setIf("user_image", "user_image");
  setIf("user_id", "user_id");
  setIf("user_phone", "user_phone");
  setIf("first_name", "first_name");
  setIf("last_name", "last_name");
  setIf("gender", "gender");
  setIf("country_id", "country_id");
  setIf("address", "address");
  setIf("postal_code", "postal_code");
  setIf("biography", "biography");
}
