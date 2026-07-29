/**
 * Typed API client for Sistem Posyandu.
 * All requests automatically attach the JWT token from localStorage.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ─────────────────────────────────────────────────────────────
// TOKEN MANAGEMENT
// ─────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('posyandu_token');
}

export function setToken(token: string): void {
  localStorage.setItem('posyandu_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('posyandu_token');
}

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface KaderInfo {
  id: string;
  nama: string;
  email: string;
  role: 'OWNER' | 'KADER';
  posyandu: { id: string; nama: string };
}

export interface LoginResponse {
  token: string;
  kader: KaderInfo;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface DashboardSummary {
  totalBalita: number;
  totalLansia: number;
  statusGizi: {
    bbU: Record<string, number>;
    tbU: Record<string, number>;
    bbTb: Record<string, number>;
  };
  lansiaHtDm: { totalHt: number; totalDm: number; totalHtDm: number };
  pemeriksaanTerbaru: {
    balita: Array<{
      id: string;
      tanggalPeriksa: string;
      beratBadan: number;
      tinggiBadan: number;
      statusBbU: string;
      balita: { nama: string; tanggalLahir: string };
    }>;
    lansia: Array<{
      id: string;
      tanggalPeriksa: string;
      beratBadan: number;
      tekananDarahSistol: number;
      tekananDarahDiastol: number;
      lansia: { nama: string; tanggalLahir: string };
    }>;
  };
}

export interface Balita {
  id: string;
  nama: string;
  nik?: string;
  tanggalLahir: string;
  jenisKelamin: 'L' | 'P';
  namaIbu: string;
  alamat: string;
  usiaBulan?: number;
  pemeriksaans?: PemeriksaanBalita[];
}

export interface PemeriksaanBalita {
  id: string;
  tanggalPeriksa: string;
  usiaBulan: number;
  beratBadan: number;
  tinggiBadan: number;
  lingkarKepala?: number;
  statusBbU: string;
  statusTbU: string;
  statusBbTb: string;
  vitaminA: boolean;
}

export interface Lansia {
  id: string;
  nama: string;
  nik: string;
  noBpjs?: string;
  tanggalLahir: string;
  jenisKelamin: 'L' | 'P';
  rtRw: string;
  alamat: string;
  riwayatHt: boolean;
  riwayatDm: boolean;
  tingkatKemandirian: 'A' | 'B' | 'C';
  gangguanMentalEmosional?: string;
  usiaTahun?: number;
  pemeriksaans?: PemeriksaanLansia[];
}

export interface PemeriksaanLansia {
  id: string;
  tanggalPeriksa: string;
  beratBadan: number;
  tinggiBadan: number;
  tekananDarahSistol: number;
  tekananDarahDiastol: number;
  gulaDarahSewaktu: number;
  lingkarPerut: number;
}

// ─────────────────────────────────────────────────────────────
// HTTP HELPER
// ─────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || `Request failed: ${res.status}`);
  }

  return json;
}

// ─────────────────────────────────────────────────────────────
// AUTH API
// ─────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    request<ApiResponse<LoginResponse>>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  registerPosyandu: (data: {
    namaPosyandu: string;
    desa: string;
    kecamatan: string;
    alamat: string;
    namaKader: string;
    email: string;
    password: string;
  }) =>
    request<ApiResponse<LoginResponse>>('/api/auth/register-posyandu', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () =>
    request<ApiResponse<KaderInfo & { posyandu: { id: string; nama: string; desa: string; kecamatan: string } }>>('/api/auth/me'),
};

// ─────────────────────────────────────────────────────────────
// DASHBOARD API
// ─────────────────────────────────────────────────────────────

export const dashboardApi = {
  getSummary: (posyanduId: string) =>
    request<ApiResponse<DashboardSummary>>(`/api/dashboard/${posyanduId}`),
};

// ─────────────────────────────────────────────────────────────
// BALITA API
// ─────────────────────────────────────────────────────────────

export const balitaApi = {
  getAll: (posyanduId: string, params?: { search?: string; kelompokUsia?: string }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<ApiResponse<Balita[]>>(`/api/posyandu/${posyanduId}/balita${q ? `?${q}` : ''}`);
  },

  getById: (posyanduId: string, id: string) =>
    request<ApiResponse<Balita & { usiaBulan: number; kelompokUsia: string }>>(`/api/posyandu/${posyanduId}/balita/${id}`),

  create: (posyanduId: string, data: Omit<Balita, 'id' | 'pemeriksaans' | 'usiaBulan'>) =>
    request<ApiResponse<Balita>>(`/api/posyandu/${posyanduId}/balita`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (posyanduId: string, id: string, data: Partial<Omit<Balita, 'id' | 'pemeriksaans'>>) =>
    request<ApiResponse<Balita>>(`/api/posyandu/${posyanduId}/balita/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (posyanduId: string, id: string) =>
    request<ApiResponse<null>>(`/api/posyandu/${posyanduId}/balita/${id}`, { method: 'DELETE' }),

  getPemeriksaan: (posyanduId: string, balitaId: string) =>
    request<ApiResponse<PemeriksaanBalita[]>>(`/api/posyandu/${posyanduId}/balita/${balitaId}/pemeriksaan`),

  createPemeriksaan: (posyanduId: string, balitaId: string, data: Omit<PemeriksaanBalita, 'id'>) =>
    request<ApiResponse<PemeriksaanBalita>>(`/api/posyandu/${posyanduId}/balita/${balitaId}/pemeriksaan`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deletePemeriksaan: (posyanduId: string, balitaId: string, id: string) =>
    request<ApiResponse<null>>(`/api/posyandu/${posyanduId}/balita/${balitaId}/pemeriksaan/${id}`, {
      method: 'DELETE',
    }),
};

// ─────────────────────────────────────────────────────────────
// LANSIA API
// ─────────────────────────────────────────────────────────────

export const lansiaApi = {
  getAll: (posyanduId: string, params?: { search?: string; kelompokUmur?: string; ht?: string; dm?: string }) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<ApiResponse<Lansia[]>>(`/api/posyandu/${posyanduId}/lansia${q ? `?${q}` : ''}`);
  },

  getById: (posyanduId: string, id: string) =>
    request<ApiResponse<Lansia & { usiaTahun: number; kelompokUmur: string }>>(`/api/posyandu/${posyanduId}/lansia/${id}`),

  create: (posyanduId: string, data: Omit<Lansia, 'id' | 'pemeriksaans' | 'usiaTahun'>) =>
    request<ApiResponse<Lansia>>(`/api/posyandu/${posyanduId}/lansia`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (posyanduId: string, id: string, data: Partial<Omit<Lansia, 'id' | 'pemeriksaans'>>) =>
    request<ApiResponse<Lansia>>(`/api/posyandu/${posyanduId}/lansia/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (posyanduId: string, id: string) =>
    request<ApiResponse<null>>(`/api/posyandu/${posyanduId}/lansia/${id}`, { method: 'DELETE' }),

  getPemeriksaan: (posyanduId: string, lansiaId: string) =>
    request<ApiResponse<PemeriksaanLansia[]>>(`/api/posyandu/${posyanduId}/lansia/${lansiaId}/pemeriksaan`),

  createPemeriksaan: (posyanduId: string, lansiaId: string, data: Omit<PemeriksaanLansia, 'id'>) =>
    request<ApiResponse<PemeriksaanLansia>>(`/api/posyandu/${posyanduId}/lansia/${lansiaId}/pemeriksaan`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deletePemeriksaan: (posyanduId: string, lansiaId: string, id: string) =>
    request<ApiResponse<null>>(`/api/posyandu/${posyanduId}/lansia/${lansiaId}/pemeriksaan/${id}`, {
      method: 'DELETE',
    }),
};
