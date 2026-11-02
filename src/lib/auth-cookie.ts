/**
 * Shared auth cookie for unified login (cef-online-academy and cef-dashboard).
 * Domain from env so both apps (e.g. subdomains) can read it.
 */

const COOKIE_NAME = 'cef_auth'
const MAX_AGE_DAYS = 7

/** Sanctum tokens are long strings; reject short numeric values that are likely user id. */
export function isLikelySanctumToken(value: string | null | undefined): boolean {
  if (!value || typeof value !== 'string') return false
  const t = value.trim()
  if (t.length < 20) return false
  if (/^\d+$/.test(t)) return false
  return true
}

function normalizeCookieDomain(raw: string): string {
  const s = raw.trim()
  if (!s) return ''
  try {
    if (/^https?:\/\//i.test(s)) {
      const hostname = new URL(s).hostname
      if (!hostname) return ''
      if (hostname === 'localhost') return 'localhost'
      return hostname.startsWith('.') ? hostname : `.${hostname}`
    }
    if (s === 'localhost') return 'localhost'
    return s.startsWith('.') ? s : `.${s}`
  } catch {
    return ''
  }
}

function currentHostMatchesDomain(cookieDomain: string): boolean {
  if (typeof window === 'undefined' || !cookieDomain) return false
  const hostname = window.location.hostname
  const base = cookieDomain.startsWith('.') ? cookieDomain.slice(1) : cookieDomain
  return hostname === base || hostname.endsWith(`.${base}`)
}

function getViteAuthDomainRaw(): string {
  try {
    const domain = import.meta.env.VITE_CEF_AUTH_DOMAIN
    if (typeof domain === 'string' && domain.trim()) return domain.trim()
  } catch {
    // ignore
  }
  return ''
}

/**
 * Cookie Domain= for the current page. `localhost` always uses domain=localhost (ignores production env).
 */
function getAuthDomain(): string {
  if (typeof window === 'undefined') return ''

  if (window.location.hostname === 'localhost') {
    return 'localhost'
  }
  if (window.location.hostname === '127.0.0.1') {
    return ''
  }

  const raw = getViteAuthDomainRaw()
  if (raw) {
    const normalized = normalizeCookieDomain(raw)
    if (normalized && currentHostMatchesDomain(normalized)) {
      return normalized
    }
  }
  return ''
}

function parseCookiePair(encoded: string): { token: string; role: string } | null {
  try {
    const decoded = decodeURIComponent(encoded)
    const parts = decoded.split('|').map((s) => s?.trim() ?? '')
    let token: string
    let role: string
    if (parts.length >= 3) {
      token = `${parts[0]}|${parts[1]}`
      role = parts[2]
    } else if (parts.length === 2) {
      token = parts[0]
      role = parts[1]
    } else {
      return null
    }
    if (token && role) return { token, role }
  } catch {
    // ignore
  }
  return null
}

function getAllRawCefAuthValues(): string[] {
  if (typeof document === 'undefined') return []
  const out: string[] = []
  const prefix = `${COOKIE_NAME}=`
  for (const part of document.cookie.split(';')) {
    const p = part.trim()
    if (p.startsWith(prefix)) {
      out.push(p.slice(prefix.length))
    }
  }
  return out
}

function scoreAuth(parsed: { token: string; role: string }): number {
  let s = parsed.token.length
  if (isLikelySanctumToken(parsed.token)) s += 1_000_000
  return s
}

function expireCefAuthCookieVariants(): void {
  if (typeof document === 'undefined') return

  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`

  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; domain=localhost`

  const raw = getViteAuthDomainRaw()
  if (raw) {
    const n = normalizeCookieDomain(raw)
    if (n && n !== 'localhost' && typeof window !== 'undefined' && currentHostMatchesDomain(n)) {
      document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; domain=${n}`
    }
  }
}

/**
 * Set auth cookie (token + role) so academy navbar shows "Dashboard" when logged in.
 * Call after successful login in dashboard.
 */
export function setAuthCookie(token: string, role: string): void {
  if (typeof document === 'undefined') return
  if (!isLikelySanctumToken(token)) return

  expireCefAuthCookieVariants()

  const domain = getAuthDomain()
  const value = encodeURIComponent(`${token}|${role}`)
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60
  const secure = typeof window !== 'undefined' && window.location?.protocol === 'https:'
  let cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`
  if (domain) cookie += `; domain=${domain}`
  if (secure) cookie += '; Secure'
  document.cookie = cookie
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cef-auth-cookie-updated'))
  }
}

/**
 * Read auth cookie. If duplicate cef_auth cookies exist, prefers a valid Sanctum-shaped token.
 */
export function getAuthCookie(): { token: string; role: string } | null {
  if (typeof document === 'undefined') return null
  const rawValues = getAllRawCefAuthValues()
  if (rawValues.length === 0) return null

  let best: { token: string; role: string } | null = null
  let bestScore = -1
  for (const raw of rawValues) {
    const parsed = parseCookiePair(raw)
    if (!parsed) continue
    const sc = scoreAuth(parsed)
    if (sc > bestScore) {
      bestScore = sc
      best = parsed
    }
  }
  return best
}

/**
 * Clear auth cookie (e.g. on logout) so academy navbar reverts to "Student Login" + "Book a Demo".
 */
export function clearAuthCookie(): void {
  expireCefAuthCookieVariants()
}
