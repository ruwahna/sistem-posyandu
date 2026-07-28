"use client";

import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Download,
  Baby,
  Heart,
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  FileSpreadsheet
} from "lucide-react";

interface LogPemeriksaan {
  id: string;
  nama: string;
  tipe: "Balita" | "Lansia";
  tanggal: string;
  petugas: string;
  parameter: string; // Deskripsi singkat pemeriksaan, cth: "BB: 9.5kg, TB: 74cm"
  status: string;
  statusType: "success" | "warning" | "info";
}

const mockLogs: LogPemeriksaan[] = [
  { id: "log-1", nama: "Andi Pratama", tipe: "Balita", tanggal: "2026-07-10", petugas: "Ibu Aminah", parameter: "BB: 9.5 kg, TB: 74.2 cm, LK: 45.2 cm, Vit A", status: "Normal (BB/U)", statusType: "success" },
  { id: "log-2", nama: "Mbah Karto", tipe: "Lansia", tanggal: "2026-07-10", petugas: "Ibu Aminah", parameter: "BB: 58 kg, TB: 160 cm, TD: 140/90 mmHg, GDS: 180", status: "Hipertensi & GDS Tinggi", statusType: "warning" },
  { id: "log-3", nama: "Citra Lestari", tipe: "Balita", tanggal: "2026-07-10", petugas: "Ibu Aminah", parameter: "BB: 11.8 kg, TB: 86.5 cm, LK: 48 cm, Vit A", status: "Normal (BB/U)", statusType: "success" },
  { id: "log-4", nama: "Aisyah Putri", tipe: "Balita", tanggal: "2026-07-10", petugas: "Ibu Aminah", parameter: "BB: 7.2 kg, TB: 64 cm, LK: 42.5 cm, Vit A", status: "Normal (BB/U)", statusType: "success" },
  { id: "log-5", nama: "Budi Santoso", tipe: "Lansia", tanggal: "2026-07-10", petugas: "Ibu Aminah", parameter: "BB: 66.5 kg, TB: 168 cm, TD: 120/80 mmHg, GDS: 95", status: "Sehat & Normal", statusType: "success" },
  { id: "log-6", nama: "Andi Pratama", tipe: "Balita", tanggal: "2026-06-10", petugas: "Ibu Siti", parameter: "BB: 9.1 kg, TB: 73 cm, LK: 44.8 cm", status: "Normal (BB/U)", statusType: "success" },
  { id: "log-7", nama: "Mbah Karto", tipe: "Lansia", tanggal: "2026-06-10", petugas: "Ibu Siti", parameter: "BB: 58.5 kg, TB: 160 cm, TD: 135/85 mmHg, GDS: 195", status: "GDS Tinggi", statusType: "warning" },
  { id: "log-8", nama: "Citra Lestari", tipe: "Balita", tanggal: "2026-06-10", petugas: "Ibu Siti", parameter: "BB: 11.4 kg, TB: 85 cm, LK: 47.6 cm", status: "Normal (BB/U)", statusType: "success" },
  { id: "log-9", nama: "Mbah Sumi", tipe: "Lansia", tanggal: "2026-06-10", petugas: "Ibu Siti", parameter: "BB: 52.2 kg, TB: 152 cm, TD: 145/90 mmHg, GDS: 115", status: "Hipertensi Ringan", statusType: "info" },
];

export default function RiwayatModule() {
  const [logs] = useState<LogPemeriksaan[]>(mockLogs);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"semua" | "Balita" | "Lansia">("semua");
  const [statusFilter, setStatusFilter] = useState<"semua" | "success" | "warning">("semua");

  // Filtering Logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.nama.toLowerCase().includes(query.toLowerCase()) || 
                          log.parameter.toLowerCase().includes(query.toLowerCase()) ||
                          log.petugas.toLowerCase().includes(query.toLowerCase());
    
    const matchesType = typeFilter === "semua" || log.tipe === typeFilter;
    const matchesStatus = statusFilter === "semua" || log.statusType === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-saas-dark tracking-tight">Riwayat Pemeriksaan Bulanan</h2>
          <p className="text-sm text-saas-muted mt-0.5">Semua data rekaman pemeriksaan bulanan yang tercatat di posyandu.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-all">
          <Download className="w-4 h-4" /> Export Seluruh Riwayat (.xlsx)
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-white p-6 rounded-card border border-gray-100/50 shadow-soft-card space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Cari nama warga, parameter, atau kader..."
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
              <span className="text-xs font-bold text-saas-muted">Kondisi Gizi/Kesehatan:</span>
              <div className="flex gap-1">
                {[
                  { label: "Semua", val: "semua" },
                  { label: "Normal / Sehat", val: "success" },
                  { label: "Butuh Rujukan / Rawan", val: "warning" },
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

      {/* Logs Table */}
      <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-saas-muted uppercase tracking-wider">
                <th className="pb-3">Tanggal Periksa</th>
                <th className="pb-3">Nama Lengkap</th>
                <th className="pb-3">Kategori</th>
                <th className="pb-3">Parameter Fisik & Medis</th>
                <th className="pb-3">Kondisi Hasil</th>
                <th className="pb-3">Kader Petugas</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40 transition-colors text-sm">
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
      </div>
    </div>
  );
}
