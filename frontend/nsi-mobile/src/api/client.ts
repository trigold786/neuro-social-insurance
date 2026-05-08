import { useAuthStore } from '../stores/authStore'

const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1'

function handleAuthError() {
  const { logout, isAuthenticated } = useAuthStore.getState()
  if (isAuthenticated()) {
    logout()
    window.location.href = '/login'
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const { accessToken } = useAuthStore.getState()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options?.headers as Record<string, string>) || {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  }

  const resp = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (resp.status === 401) {
    handleAuthError()
    throw new Error('登录已过期，请重新登录')
  }

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: resp.statusText }))
    throw new Error(err.detail || resp.statusText)
  }

  return resp.json()
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  del: <T>(path: string, body?: unknown) => request<T>(path, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined }),
}

export const authApi = {
  sendCode: (target: string, channel: string, purpose: string) =>
    api.post('/auth/send-code', { target, channel, purpose }),
  loginSms: (phone: string, code: string) =>
    api.post('/auth/login/sms', { phone, code }),
  loginPassword: (target: string, password: string, channel: string) =>
    api.post('/auth/login/password', { target, password, channel }),
  register: (target: string, channel: string, code: string, password?: string) =>
    api.post('/auth/register', { target, channel, code, password }),
  changePassword: (newPassword: string, code: string, channel: string, target: string, oldPassword?: string) =>
    api.post('/auth/change-password', { new_password: newPassword, code, channel, target, old_password: oldPassword }),
  forgotPassword: (target: string, channel: string, code: string, newPassword: string) =>
    api.post('/auth/forgot-password', { target, channel, code, new_password: newPassword }),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refresh_token: refreshToken }),
  me: () => api.get('/users/me'),
  bindPhone: (phone: string, code: string) =>
    api.post('/users/me/bind-phone', { phone, code }),
  bindEmail: (email: string, code: string) =>
    api.post('/users/me/bind-email', { email, code }),
  updateProfile: (data: { email?: string; real_name?: string }) =>
    api.patch('/users/me', data),
  exportData: () => api.get('/users/me/export'),
  deleteData: (categories: string[], channel: string, target: string, code: string) =>
    api.del('/users/me/data', { categories, channel, target, code }),
  requestDeletion: (channel: string, target: string, code: string, reason?: string) =>
    api.post('/users/me/delete-request', { channel, target, code, reason }),
  cancelDeletion: () =>
    api.post('/users/me/delete-cancel', {}),
}

export const policyApi = {
  list: (regionCode: string, status?: string) =>
    api.get(`/policy-hub/policies?region_code=${encodeURIComponent(regionCode)}${status ? `&status=${encodeURIComponent(status)}` : ''}`),
  get: (policyId: string) => api.get(`/policy-hub/policies/${policyId}`),
}

export const calcApi = {
  sandbox: (params: unknown) => api.post('/calc/sandbox', params),
  deepPlan: (params: unknown) => api.post('/calc/deep-plan', params),
  tax: (params: unknown) => api.post('/calc/tax', params),
}

export const profileApi = {
  create: (data: unknown) => api.post('/profiles', data),
  me: () => api.get('/profiles/me'),
  patch: (data: unknown) => api.patch('/profiles/me', data),
}

export const scenarioApi = {
  list: (page = 1, pageSize = 20, bookmarkedOnly = false) =>
    api.get(`/scenarios?page=${page}&page_size=${pageSize}${bookmarkedOnly ? '&bookmarked_only=true' : ''}`),
  get: (scenarioId: string) => api.get(`/scenarios/${scenarioId}`),
  create: (data: { name: string; description?: string; input_params: unknown; results: unknown[]; tags?: string[] }) =>
    api.post('/scenarios', data),
  update: (scenarioId: string, data: { name?: string; description?: string; is_bookmarked?: boolean; tags?: string[] }) =>
    api.patch(`/scenarios/${scenarioId}`, data),
  delete: (scenarioId: string) => api.del(`/scenarios/${scenarioId}`),
}

export const reportApi = {
  create: (data: unknown) => api.post('/reports', data),
  status: (taskId: string) => api.get(`/reports/${taskId}`),
}

export const configApi = {
  get: (key: string) => api.get(`/configs/${encodeURIComponent(key)}`),
}
