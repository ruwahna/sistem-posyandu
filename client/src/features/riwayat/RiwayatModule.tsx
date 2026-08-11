"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  Baby,
  Heart,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Loader2,
  TrendingUp,
  FileSpreadsheet,
  LineChart as LineChartIcon
} from "lucide-react";
import { riwayatApi, ItemRiwayat } from "@/lib/api";
import PageHelmet from "@/components/PageHelmet";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

interface RiwayatModuleProps {
  posyanduId: string;
}

export default function RiwayatModule({ posyanduId }: RiwayatModuleProps) {
  const [logs, setLogs] = useState<ItemRiwayat[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"semua" | "Balita" | "Lansia">("semua");
  const [statusFilter, setStatusFilter] = useState<"semua" | "success" | "warning">("semua");

  // Tab mode: "tabel" vs "grafik"
  const [viewMode, setViewMode] = useState<"tabel" | "grafik">("tabel");

  // Load data riwayat dari backend API
  const fetchRiwayat = async () => {
    try {
      setLoading(true);
      const res = await riwayatApi.getAll(posyanduId, {
        tipe: typeFilter,
        search: query,
        status: statusFilter,
      });
      if (res.success) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data riwayat:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, [posyanduId, typeFilter, statusFilter]);

  // Debounced search submit
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRiwayat();
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Listen for pemeriksaanSaved event from Balita/Lansia modules
  useEffect(() => {
    const handlePemeriksaanSaved = () => {
      fetchRiwayat();
    };
    window.addEventListener("pemeriksaanSaved", handlePemeriksaanSaved);
    return () => window.removeEventListener("pemeriksaanSaved", handlePemeriksaanSaved);
  }, []);

  // Handler Export Excel
  const handleExport = async () => {
    try {
      setExporting(true);
      await riwayatApi.downloadExcel(posyanduId, {
        tipe: typeFilter,
        search: query,
        status: statusFilter,
      });
    } catch (err) {
      console.error("Gagal export excel:", err);
    } finally {
      setExporting(false);
    }
  };

  // Olah data untuk Grafik Trend Pertumbuhan / Pemeriksaan (Agregasi Tanggal)
  const chartData = (() => {
    const dateMap: Record<string, { tanggal: string; balita: number; lansia: number; warning: number }> = {};

    logs.forEach((log) => {
      if (!dateMap[log.tanggal]) {
        dateMap[log.tanggal] = { tanggal: log.tanggal, balita: 0, lansia: 0, warning: 0 };
      }
      if (log.tipe === "Balita") dateMap[log.tanggal].balita += 1;
      if (log.tipe === "Lansia") dateMap[log.tanggal].lansia += 1;
      if (log.statusType === "warning") dateMap[log.tanggal].warning += 1;
    });

    return Object.values(dateMap).sort(
      (a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()
    );
  })();

  return (
    <div className="space-y-6">
      <PageHelmet
        title="Riwayat & Laporan"
        description="Laporan riwayat pemeriksaan bulanan terpadu dengan fitur cetak Excel dan PDF."
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-saas-dark tracking-tight">Riwayat Pemeriksaan Bulanan</h2>
          <p className="text-sm text-saas-muted mt-0.5">
            Data terpadu perkembangan kesehatan Balita & Lansia beserta statistik grafik bulanan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Switch Mode Tabel / Grafik */}
          <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setViewMode("tabel")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "tabel"
                  ? "bg-white text-saas-dark shadow-sm"
                  : "text-saas-muted hover:text-saas-dark"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Tabel Riwayat
            </button>
            <button
              onClick={() => setViewMode("grafik")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === "grafik"
                  ? "bg-white text-saas-dark shadow-sm"
                  : "text-saas-muted hover:text-saas-dark"
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" /> Grafik Trend
            </button>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-all disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white p-6 rounded-card border border-gray-100/50 shadow-soft-card space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Cari nama warga atau parameter..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 border border-gray-100 rounded-input text-sm text-saas-dark placeholder-saas-muted/70 focus:outline-none focus:border-saas-primary/50 focus:bg-white transition-all"
            />
            <Search className="absolute left-3.5 top-3 text-saas-muted/80 w-4 h-4" />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Tipe filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-saas-muted">Kategori:</span>
              <div className="flex gap-1">
                {(["semua", "Balita", "Lansia"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                      typeFilter === t
                        ? "bg-saas-primary/10 text-saas-primary border border-saas-primary/20"
                        : "bg-gray-50 text-saas-muted hover:text-saas-dark border border-transparent"
                    }`}
                  >
                    {t === "semua" ? "Semua" : t}
                  </button>
                ))}
              </div>
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-saas-muted">Kondisi Hasil:</span>
              <div className="flex gap-1">
                {[
                  { label: "Semua", val: "semua" },
                  { label: "Normal / Sehat", val: "success" },
                  { label: "Perlu Perhatian / Rawan", val: "warning" },
                ].map((s) => (
                  <button
                    key={s.val}
                    onClick={() => setStatusFilter(s.val as any)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                      statusFilter === s.val
                        ? "bg-saas-primary/10 text-saas-primary border border-saas-primary/20"
                        : "bg-gray-50 text-saas-muted hover:text-saas-dark border border-transparent"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW: GRAFIK TREND */}
      {viewMode === "grafik" && (
        <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-saas-dark flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-saas-primary" /> Trend Jumlah Pemeriksaan & Temuan Risiko
              </h3>
              <p className="text-xs text-saas-muted mt-0.5">
                Grafik pergerakan jumlah kunjungan Balita, Lansia, serta temuan gizi/penyakit rawan dari waktu ke waktu.
              </p>
            </div>
          </div>

          <div className="h-80 w-full pt-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="tanggal" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFF",
                      borderRadius: "12px",
                      border: "1px solid #E5E7EB",
                      fontSize: "12px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="balita"
                    name="Pemeriksaan Balita"
                    stroke="#0D9488"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="lansia"
                    name="Pemeriksaan Lansia"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="warning"
                    name="Kasus Rawan / Rujukan"
                    stroke="#EF4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-saas-muted">
                Belum ada data grafik untuk ditampilkan.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: TABEL RIWAYAT */}
      {viewMode === "tabel" && (
        <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Loader2 className="w-7 h-7 text-saas-primary animate-spin" />
              <p className="text-xs text-saas-muted font-medium">Memuat data riwayat...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold text-saas-muted uppercase tracking-wider">
                    <th className="pb-3">Tanggal Periksa</th>
                    <th className="pb-3">Nama Lengkap</th>
                    <th className="pb-3">Kategori</th>
                    <th className="pb-3">Parameter Fisik & Medis</th>
                    <th className="pb-3">Kondisi Hasil</th>
                    <th className="pb-3">Petugas</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40 transition-colors text-sm"
                      >
                        <td className="py-4 font-bold text-saas-dark">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-saas-muted" />
                            {log.tanggal}
                          </div>
                        </td>
                        <td className="py-4 font-bold text-saas-dark">{log.nama}</td>
                        <td className="py-4 font-semibold text-saas-muted flex items-center gap-1.5 mt-2">
                          {log.tipe === "Balita" ? (
                            <Baby className="w-3.5 h-3.5 text-saas-primary" />
                          ) : (
                            <Heart className="w-3.5 h-3.5 text-red-500" />
                          )}
                          {log.tipe}
                        </td>
                        <td className="py-4 text-xs font-semibold text-saas-dark/95 leading-normal max-w-xs truncate">
                          {log.parameter}
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                              log.statusType === "success"
                                ? "bg-trend-successBg text-trend-successText"
                                : log.statusType === "warning"
                                ? "bg-trend-dangerBg text-trend-dangerText"
                                : "bg-blue-50 text-saas-primary"
                            }`}
                          >
                            {log.statusType === "success" && <CheckCircle2 className="w-3 h-3" />}
                            {log.statusType === "warning" && <AlertCircle className="w-3 h-3" />}
                            {log.statusType === "info" && <Clock className="w-3 h-3" />}
                            {log.status}
                          </span>
                        </td>
                        <td className="py-4 text-xs text-saas-muted font-bold">{log.petugas}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-saas-muted font-medium">
                        Tidak ada catatan riwayat pemeriksaan yang cocok.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
