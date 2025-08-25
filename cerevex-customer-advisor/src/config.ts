// Central place to read environment variables for the extension
// Plasmo: variables without prefix may not be exposed to all runtime contexts.
// Use PLASMO_PUBLIC_ prefix for values needed in UI components.

const PUBLIC = process.env.PLASMO_PUBLIC_ANALYSIS_API_URL
const PRIVATE = process.env.ANALYSIS_API_URL

export const ANALYSIS_API_URL = PUBLIC || PRIVATE || 'http://localhost:8000'
export const THIRD_PARTY_WEB_URL = (process.env.PLASMO_PUBLIC_THIRD_PARTY_WEB_URL || '').replace(/\/$/, '')
export const THIRD_PARTY_API_URL = (process.env.PLASMO_PUBLIC_THIRD_PARTY_API_URL || '').replace(/\/$/, '')
export const ENTERPRISE_API_URL = (process.env.PLASMO_PUBLIC_ENTERPRISE_API_URL || '').replace(/\/$/, '')

if (!PUBLIC && !PRIVATE) {
  // eslint-disable-next-line no-console
  console.warn('[cerevex] ANALYSIS_API_URL not set in .env (try PLASMO_PUBLIC_ANALYSIS_API_URL=...), fallback to http://localhost:8000')
} else {
  // eslint-disable-next-line no-console
  console.log('[cerevex] Using ANALYSIS_API_URL =', ANALYSIS_API_URL)
}

if (!process.env.PLASMO_PUBLIC_THIRD_PARTY_WEB_URL) {
  console.warn('[cerevex] PLASMO_PUBLIC_THIRD_PARTY_WEB_URL not set - domain detection will fail')
}
if (!process.env.PLASMO_PUBLIC_THIRD_PARTY_API_URL) {
  console.warn('[cerevex] PLASMO_PUBLIC_THIRD_PARTY_API_URL not set - cannot fetch product comments')
}
if (!process.env.PLASMO_PUBLIC_ENTERPRISE_API_URL) {
  console.warn('[cerevex] PLASMO_PUBLIC_ENTERPRISE_API_URL not set - cannot check product support status')
}