/**
 * Typed API client for Sistem Posyandu.
 * All requests automatically attach the JWT token from localStorage.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

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

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  message?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'DANGER' | 'WARNING' | 'SUCCESS' | 'INFO';
  createdAt: string;
  isRead: boolean;
  category?: 'balita' | 'lansia' | 'system';
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
  lingkarLengan?: number;
  statusBbU: string;
  statusTbU: string;
  statusBbTb: string;
  statusKms?: string;
  vitaminA: boolean;
  asiEksklusif?: boolean;
  obatCacing?: boolean;
  statusImunisasi?: string;
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
  kolesterol?: number;
  asamUrat?: number;
  keluhan?: string;
  tindakan?: string;
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

  loginWithGoogle: (idToken: string) =>
    request<ApiResponse<LoginResponse>>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
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

  forgotPassword: (email: string) =>
    request<ApiResponse<null>>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyResetToken: (token: string) =>
    request<ApiResponse<{ valid: boolean }>>(`/api/auth/verify-reset-token/${token}`),

  resetPassword: (token: string, newPassword: string) =>
    request<ApiResponse<null>>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),

  updateProfile: (data: { nama: string; email: string; password?: string }) =>
    request<ApiResponse<KaderInfo>>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export interface TrenGiziItem {
  periodKey: string;
  label: string;
  total: number;
  normal: number;
  kurang: number;
  sangatKurang: number;
  lebih: number;
  stunting: number;
  pctNormal: number;
  pctKurang: number;
  avgZScoreBBU: number;
  avgZScoreTBU: number;
}

export interface DistribusiKehadiran {
  rtRw: string;
  total: number;
  hadir: number;
  persentase: number;
}

export const dashboardApi = {
  getSummary: (posyanduId: string) =>
    request<ApiResponse<DashboardSummary>>(`/api/dashboard/${posyanduId}`),
  getTrenGizi: (posyanduId: string, period: 'bulanan' | 'tahunan' = 'bulanan') =>
    request<ApiResponse<TrenGiziItem[]>>(`/api/dashboard/${posyanduId}/tren-gizi?period=${period}`),
  getDistribusiKehadiran: (posyanduId: string) =>
    request<ApiResponse<DistribusiKehadiran[]>>(`/api/dashboard/${posyanduId}/distribusi-kehadiran`),
};

// ─────────────────────────────────────────────────────────────
// POSYANDU API
// ─────────────────────────────────────────────────────────────

export const posyanduApi = {
  getById: (id: string) =>
    request<ApiResponse<{ id: string; nama: string; desa: string; kecamatan: string; alamat: string }>>(`/api/posyandu/${id}`),
  update: (id: string, data: { nama?: string; desa?: string; kecamatan?: string; alamat?: string }) =>
    request<ApiResponse<{ id: string; nama: string; desa: string; kecamatan: string; alamat: string }>>(`/api/posyandu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ─────────────────────────────────────────────────────────────
// BALITA API
// ─────────────────────────────────────────────────────────────

export const balitaApi = {
  getAll: (posyanduId: string, params?: { search?: string; kelompokUsia?: string; page?: number; limit?: number }) => {
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          cleanParams[k] = String(v);
        }
      });
    }
    const q = new URLSearchParams(cleanParams).toString();
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

  updatePemeriksaan: (posyanduId: string, balitaId: string, id: string, data: Partial<Omit<PemeriksaanBalita, 'id'>>) =>
    request<ApiResponse<PemeriksaanBalita>>(`/api/posyandu/${posyanduId}/balita/${balitaId}/pemeriksaan/${id}`, {
      method: 'PATCH',
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
  getAll: (posyanduId: string, params?: { search?: string; kelompokUmur?: string; ht?: string; dm?: string; page?: number; limit?: number }) => {
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          cleanParams[k] = String(v);
        }
      });
    }
    const q = new URLSearchParams(cleanParams).toString();
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

  updatePemeriksaan: (posyanduId: string, lansiaId: string, id: string, data: Partial<Omit<PemeriksaanLansia, 'id'>>) =>
    request<ApiResponse<PemeriksaanLansia>>(`/api/posyandu/${posyanduId}/lansia/${lansiaId}/pemeriksaan/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deletePemeriksaan: (posyanduId: string, lansiaId: string, id: string) =>
    request<ApiResponse<null>>(`/api/posyandu/${posyanduId}/lansia/${lansiaId}/pemeriksaan/${id}`, {
      method: 'DELETE',
    }),
};

// ─────────────────────────────────────────────────────────────
// RIWAYAT API
// ─────────────────────────────────────────────────────────────

export interface ItemRiwayat {
  id: string;
  pasienId?: string;
  nama: string;
  tipe: 'Balita' | 'Lansia';
  tanggal: string;
  petugas: string;
  parameter: string;
  status: string;
  statusType: 'success' | 'warning' | 'info';
  tanggalLahir?: string;
  jenisKelamin?: string;
  beratBadan?: number;
  tinggiBadan?: number;
  lingkarKepala?: number;
  lingkarLengan?: number;
  statusBbU?: string;
  statusTbU?: string;
  statusBbTb?: string;
  statusKms?: string;
  vitaminA?: boolean;
  asiEksklusif?: boolean;
  obatCacing?: boolean;
  statusImunisasi?: string;
  tekananDarahSistol?: number;
  tekananDarahDiastol?: number;
  gulaDarahSewaktu?: number;
  kolesterol?: number;
  asamUrat?: number;
  lingkarPerut?: number;
  keluhan?: string;
  tindakan?: string;
}

export const riwayatApi = {
  getAll: (
    posyanduId: string,
    params?: { tipe?: string; search?: string; status?: string; bulan?: string; tahun?: string }
  ) => {
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v && v !== 'semua') cleanParams[k] = v;
      });
    }
    const q = new URLSearchParams(cleanParams).toString();
    return request<ApiResponse<ItemRiwayat[]>>(`/api/posyandu/${posyanduId}/riwayat${q ? `?${q}` : ''}`);
  },

  downloadExcel: async (
    posyanduId: string,
    params?: { tipe?: string; search?: string; status?: string; bulan?: string; tahun?: string }
  ) => {
    const token = getToken();
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v && v !== 'semua') cleanParams[k] = v;
      });
    }
    const q = new URLSearchParams(cleanParams).toString();
    const res = await fetch(`${BASE_URL}/api/posyandu/${posyanduId}/export${q ? `?${q}` : ''}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) throw new Error('Gagal mengunduh file Excel');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Posyandu_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  downloadPdf: async (
    posyanduId: string,
    params?: { tipe?: string; search?: string; status?: string; bulan?: string; tahun?: string }
  ) => {
    const token = getToken();
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v && v !== 'semua') cleanParams[k] = v;
      });
    }
    const q = new URLSearchParams(cleanParams).toString();
    const res = await fetch(`${BASE_URL}/api/posyandu/${posyanduId}/export-pdf${q ? `?${q}` : ''}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) throw new Error('Gagal mengunduh file PDF');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Posyandu_${new Date().toISOString().slice(0, 10)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};

// ─────────────────────────────────────────────────────────────
// API: NOTIFICATIONS
// ─────────────────────────────────────────────────────────────
export const notificationApi = {
  getNotifications: async (posyanduId: string): Promise<{ notifications: AppNotification[]; unreadCount: number }> => {
    const res = await request<ApiResponse<{ notifications: AppNotification[]; unreadCount: number }>>(
      `/api/posyandu/${posyanduId}/notifications`
    );
    return res.data;
  },

  markAsRead: async (posyanduId: string, notificationIds: string[]): Promise<void> => {
    await request<ApiResponse<null>>(`/api/posyandu/${posyanduId}/notifications/read`, {
      method: 'POST',
      body: JSON.stringify({ notificationIds }),
    });
  },
};

// ─────────────────────────────────────────────────────────────
// API: KADER MANAGEMENT
// ─────────────────────────────────────────────────────────────

export interface KaderMember {
  id: string;
  nama: string;
  email: string;
  role: 'OWNER' | 'KADER';
  isActive: boolean;
  createdAt: string;
}

export const kaderApi = {
  getAll: (posyanduId: string) =>
    request<ApiResponse<KaderMember[]>>(`/api/posyandu/${posyanduId}/kader`),

  create: (posyanduId: string, data: { nama: string; email: string; password: string; role: 'OWNER' | 'KADER' }) =>
    request<ApiResponse<KaderMember>>(`/api/posyandu/${posyanduId}/kader`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateRole: (posyanduId: string, kaderId: string, role: 'OWNER' | 'KADER') =>
    request<ApiResponse<KaderMember>>(`/api/posyandu/${posyanduId}/kader/${kaderId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  toggleStatus: (posyanduId: string, kaderId: string, isActive: boolean) =>
    request<ApiResponse<KaderMember>>(`/api/posyandu/${posyanduId}/kader/${kaderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),

  delete: (posyanduId: string, kaderId: string) =>
    request<ApiResponse<null>>(`/api/posyandu/${posyanduId}/kader/${kaderId}`, {
      method: 'DELETE',
    }),
};

// ─────────────────────────────────────────────────────────────
// API: OWNER / SYSTEM SECURITY & BACKUP
// ─────────────────────────────────────────────────────────────

export interface AuditLogItem {
  id: string;
  posyanduId?: string;
  kaderId?: string;
  kaderNama?: string;
  action: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export const ownerApi = {
  getAuditLogs: (posyanduId: string) =>
    request<ApiResponse<AuditLogItem[]>>(`/api/owner/audit-logs/${posyanduId}`),

  backupDataUrl: (posyanduId: string) => `/api/owner/backup/${posyanduId}`,

  resetData: (posyanduId: string, data: { confirmText: string; password: string }) =>
    request<ApiResponse<{ message: string }>>(`/api/owner/reset-data/${posyanduId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};


