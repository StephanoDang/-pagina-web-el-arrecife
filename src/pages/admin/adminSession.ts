export const ADMIN_SESSION_KEY = 'el-arrecife:admin-session:v1'
const DEMO_USERNAME = 'admin'
const DEMO_PASSWORD = 'arrecife2026'

export function authenticateDemoCredentials(username: string, password: string) {
  return username === DEMO_USERNAME && password === DEMO_PASSWORD
}

type SessionStorageProvider = () => Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export function hasAdminSession(getStorage: SessionStorageProvider = () => window.sessionStorage) {
  try {
    return getStorage().getItem(ADMIN_SESSION_KEY) === 'active'
  } catch {
    return false
  }
}

export function startAdminSession(username: string, password: string, getStorage: SessionStorageProvider = () => window.sessionStorage) {
  if (!authenticateDemoCredentials(username, password)) return false
  try {
    getStorage().setItem(ADMIN_SESSION_KEY, 'active')
    return true
  } catch {
    return false
  }
}

export function endAdminSession(getStorage: SessionStorageProvider = () => window.sessionStorage) {
  try {
    getStorage().removeItem(ADMIN_SESSION_KEY)
  } catch {
    // In-memory auth state should still be cleared when browser storage is unavailable.
  }
}
