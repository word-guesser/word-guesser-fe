import type { Room } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function getToken(): string | null {
  return localStorage.getItem('wg_token');
}

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { skipAuth = false, ...init } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (res.status === 401) {
    localStorage.removeItem('wg_token');
    window.location.href = '/login';
    throw new Error('Phiên đăng nhập hết hạn.');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `Lỗi ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ── Auth ────────────────────────────────────────────────────────────
export const api = {
  auth: {
    me: () => request<{ id: string; email: string; displayName: string; avatar?: string }>('/auth/me'),
    googleUrl: () => `${BASE_URL}/auth/google`,
  },

  // ── Rooms ────────────────────────────────────────────────────────
  rooms: {
    create: () =>
      request<{ room: Room }>('/rooms', { method: 'POST' }),

    join: (code: string) =>
      request<{ room: Room }>('/rooms/join', {
        method: 'POST',
        body: JSON.stringify({ code }),
      }),

    get: (id: string) =>
      request<{ room: Room }>(`/rooms/${id}`),

    leave: (id: string) =>
      request<{ message: string }>(`/rooms/${id}/leave`, { method: 'DELETE' }),
  },

  // ── Words ────────────────────────────────────────────────────────
  words: {
    categories: () => request('/words/categories'),
    list: (params?: { categoryId?: string; page?: number }) => {
      const qs = new URLSearchParams(params as Record<string, string>).toString();
      return request(`/words${qs ? `?${qs}` : ''}`);
    },
    generate: (categoryName: string) =>
      request('/words/generate', {
        method: 'POST',
        body: JSON.stringify({ categoryName }),
      }),
  },
};
