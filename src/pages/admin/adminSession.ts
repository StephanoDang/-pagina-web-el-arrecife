export const ADMIN_SESSION_KEY = 'el-arrecife:admin-session:v1'

export function hasAdminSession() {
  try {
    return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === 'active'
  } catch {
    return false
  }
}
