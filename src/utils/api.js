const API_BASE =
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:4000')
const STORAGE_KEY = 'henryme-session'

const getApiOrigin = () =>
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost'

const resolveApiBase = () => {
  if (API_BASE.startsWith('http')) return API_BASE
  return new URL(API_BASE, getApiOrigin()).toString()
}

const getAuthToken = () => {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return parsed?.token || null
  } catch {
    return null
  }
}

const buildUrl = (path, query) => {
  const url = path.startsWith('http') ? new URL(path) : new URL(path, resolveApiBase())
  if (query && typeof query === 'object') {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }
  return url.toString()
}

const request = async (path, options = {}) => {
  const token = getAuthToken()
  const headers = {
    ...options.headers,
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(buildUrl(path, options.query), {
    method: options.method || 'GET',
    headers,
    body: options.body instanceof FormData ? options.body : options.body,
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message = data?.error || data?.message || response.statusText || 'Request failed'
    throw new Error(message)
  }

  return data
}

export const apiGet = (path, query) => request(path, { method: 'GET', query })
export const apiPost = (path, body) => request(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) })
export const apiPut = (path, body) => request(path, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) })
export const apiPatch = (path, body) => request(path, { method: 'PATCH', body: body instanceof FormData ? body : JSON.stringify(body) })
export const apiDelete = (path) => request(path, { method: 'DELETE' })
