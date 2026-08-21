"use client";

import { useState, useEffect } from "react";
import { riwayatApi, ItemRiwayat } from "@/lib/api";
import {
  Download,
  Loader2,
  RotateCcw,
} from "lucide-react";
import PageHelmet from "@/components/PageHelmet";

interface LaporanModuleProps {
  posyanduId: string;
}

interface RekapanBalita {
  periode: string;
  totalPemeriksaan: number;
  totalAnak: number;
  statusBbU: { normal: number; kurang: number; sangatKurang: number; lebih: number };
  statusTbU: { normal: number; pendek: number; sangatPendek: number };
  statusBbTb: { normal: number; kurang: number; sangatKurang: number; lebih: number };
  vitaminA: number;
  imunisasiLengkap: number;
  asiEksklusif: number;
}

interface RekapanLansia {
  periode: string;
  totalPemeriksaan: number;
  totalOrang: number;
  statusHipertensi: number;
  statusGdsTinggi: number;
  statusHipertensiDanGds: number;
  rataRataBb: number;
  rataRataTb: number;
  rataRataSistol: number;
  rataRataDiastol: number;
  rataRataGds: number;
}

export default function LaporanModule({ posyanduId }: LaporanModuleProps) {
  const [logs, setLogs] = useState<ItemRiwayat[]>([]);
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [filterCategory, setFilterCategory] = useState<"semua" | "Balita" | "Lansia">("Balita");
  const [filterFromDate, setFilterFromDate] = useState<string>("");
  const [filterToDate, setFilterToDate] = useState<string>("");
  const [rekapanBalita, setRekapanBalita] = useState<RekapanBalita | null>(null);
  const [rekapanLansia, setRekapanLansia] = useState<RekapanLansia | null>(null);
  const [rekapanLoading, setRekapanLoading] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [searchBalita, setSearchBalita] = useState<string>("");
  const [searchLansia, setSearchLansia] = useState<string>("");

  const fetchRiwayat = async () => {
    try {
      setRekapanLoading(true);
      const res = await riwayatApi.getAll(posyanduId, {
        tipe: "semua",
        bulan: filterMonth,
        tahun: filterYear,
      });
      if (res.success) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data riwayat:", err);
    } finally {
      setRekapanLoading(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setExportingPdf(true);
      await riwayatApi.downloadPdf(posyanduId, {
        tipe: filterCategory === "semua" ? undefined : filterCategory,
        bulan: filterMonth,
        tahun: filterYear,
      });
    } catch (err) {
      console.error("Gagal export PDF:", err);
      alert("Gagal mengunduh PDF. Silakan coba lagi.");
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      await riwayatApi.downloadExcel(posyanduId, {
        tipe: filterCategory === "semua" ? undefined : filterCategory,
        bulan: filterMonth,
        tahun: filterYear,
      });
    } catch (err) {
      console.error("Gagal export Excel:", err);
      alert("Gagal mengunduh Excel. Silakan coba lagi.");
    } finally {
      setExportingExcel(false);
    }
  };

  const calculateRekapan = () => {
    let balitaLogs: ItemRiwayat[] = [];
    let lansiaLogs: ItemRiwayat[] = [];

    if (filterCategory === "semua" || filterCategory === "Balita") {
      balitaLogs = logs.filter((l) => l.tipe === "Balita");
    }
    if (filterCategory === "semua" || filterCategory === "Lansia") {
      lansiaLogs = logs.filter((l) => l.tipe === "Lansia");
    }

    if (balitaLogs.length > 0) {
      const rekapanB: RekapanBalita = {
        periode: filterMonth ? `${filterMonth}/${filterYear}` : filterYear,
        totalPemeriksaan: balitaLogs.length,
        totalAnak: new Set(balitaLogs.map((l) => l.pasienId)).size,
        statusBbU: {
          normal: balitaLogs.filter((l) => l.statusBbU === "N").length,
          kurang: balitaLogs.filter((l) => l.statusBbU === "K").length,
          sangatKurang: balitaLogs.filter((l) => l.statusBbU === "SK").length,
          lebih: balitaLogs.filter((l) => l.statusBbU === "L").length,
        },
        statusTbU: {
          normal: balitaLogs.filter((l) => l.statusTbU === "N").length,
          pendek: balitaLogs.filter((l) => l.statusTbU === "P").length,
          sangatPendek: balitaLogs.filter((l) => l.statusTbU === "SP").length,
        },
        statusBbTb: {
          normal: balitaLogs.filter((l) => l.statusBbTb === "N").length,
          kurang: balitaLogs.filter((l) => l.statusBbTb === "K").length,
          sangatKurang: balitaLogs.filter((l) => l.statusBbTb === "SK").length,
          lebih: balitaLogs.filter((l) => l.statusBbTb === "L" || l.statusBbTb === "G").length,
        },
        vitaminA: balitaLogs.filter((l) => l.vitaminA).length,
        imunisasiLengkap: balitaLogs.filter((l) => l.statusImunisasi && l.statusImunisasi !== "").length,
        asiEksklusif: balitaLogs.filter((l) => l.asiEksklusif).length,
      };
      setRekapanBalita(rekapanB);
    } else {
      setRekapanBalita(null);
    }

    if (lansiaLogs.length > 0) {
      const rekapanL: RekapanLansia = {
        periode: filterMonth ? `${filterMonth}/${filterYear}` : filterYear,
        totalPemeriksaan: lansiaLogs.length,
        totalOrang: new Set(lansiaLogs.map((l) => l.pasienId)).size,
        statusHipertensi: lansiaLogs.filter(
          (l) => l.tekananDarahSistol! >= 140 || l.tekananDarahDiastol! >= 90
        ).length,
        statusGdsTinggi: lansiaLogs.filter((l) => l.gulaDarahSewaktu! >= 200).length,
        statusHipertensiDanGds: lansiaLogs.filter(
          (l) =>
            (l.tekananDarahSistol! >= 140 || l.tekananDarahDiastol! >= 90) &&
            l.gulaDarahSewaktu! >= 200
        ).length,
        rataRataBb:
          lansiaLogs.reduce((sum, l) => sum + (l.beratBadan || 0), 0) / lansiaLogs.length,
        rataRataTb:
          lansiaLogs.reduce((sum, l) => sum + (l.tinggiBadan || 0), 0) / lansiaLogs.length,
        rataRataSistol:
          lansiaLogs.reduce((sum, l) => sum + (l.tekananDarahSistol || 0), 0) /
          lansiaLogs.length,
        rataRataDiastol:
          lansiaLogs.reduce((sum, l) => sum + (l.tekananDarahDiastol || 0), 0) /
          lansiaLogs.length,
        rataRataGds:
          lansiaLogs.reduce((sum, l) => sum + (l.gulaDarahSewaktu || 0), 0) /
          lansiaLogs.length,
      };
      setRekapanLansia(rekapanL);
    } else {
      setRekapanLansia(null);
    }
  };

  useEffect(() => {
    if (posyanduId) {
      fetchRiwayat();
    }
  }, [posyanduId, filterMonth, filterYear]);

  useEffect(() => {
    if (logs.length > 0) {
      calculateRekapan();
    }
  }, [logs, filterCategory]);

  // Filter data Balita berdasarkan search
  const filteredBalitaLogs = logs
    .filter((l) => l.tipe === "Balita")
    .filter((l) => {
      if (!searchBalita) return true;
      const searchLower = searchBalita.toLowerCase();
      return (
        l.nama?.toLowerCase().includes(searchLower) ||
        l.petugas?.toLowerCase().includes(searchLower)
      );
    });

  // Filter data Lansia berdasarkan search
  const filteredLansiaLogs = logs
    .filter((l) => l.tipe === "Lansia")
    .filter((l) => {
      if (!searchLansia) return true;
      const searchLower = searchLansia.toLowerCase();
      return (
        l.nama?.toLowerCase().includes(searchLower) ||
        l.petugas?.toLowerCase().includes(searchLower)
      );
    });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <PageHelmet
        title="Laporan Rekapan"
        description="Laporan rekapitulasi pemeriksaan bulanan untuk Balita dan Lansia dengan filter periode."
      />
      
      {/* Header dengan Tombol Export */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Laporan Rekapan</h2>
          <p className="text-sm text-gray-600 mt-1">
            Laporan rekap data pemeriksaan untuk keperluan penulisan berdasarkan kegiatan di periode dan halaman.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportPdf}
            disabled={exportingPdf || logs.length === 0}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-1 min-w-[90px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="leading-tight">
              {exportingPdf ? "Mengunduh..." : (
                <>
                  Cetak PDF<br />(.pdf)
                </>
              )}
            </span>
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exportingExcel || logs.length === 0}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-1 min-w-[90px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="leading-tight">
              {exportingExcel ? "Mengunduh..." : (
                <>
                  Export Excel<br />(.xlsx)
                </>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Filter Controls dengan Layout Baru */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm mb-6">
        {/* Baris 1: Jenis Laporan dan Periode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* 1. Jenis Laporan */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              1. Jenis Laporan
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterCategory("Balita")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filterCategory === "Balita"
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Balita
              </button>
              <button
                onClick={() => setFilterCategory("Lansia")}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filterCategory === "Lansia"
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Lansia
              </button>
            </div>
          </div>

          {/* 2. Periode - Bulan */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              2. Periode
            </label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-white"
            >
              <option value="">Bulan</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                  {new Date(2000, i).toLocaleString("id-ID", { month: "long" })}
                </option>
              ))}
            </select>
          </div>

          {/* Periode - Tahun */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 opacity-0">
              Tahun
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-white"
            >
              <option value="">Tahun</option>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Dari Tanggal */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Dari Tanggal (Opsional)
            </label>
            <input
              type="date"
              value={filterFromDate}
              onChange={(e) => setFilterFromDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-white"
            />
          </div>

          {/* Sampai Tanggal */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Sampai Tanggal (Opsional)
            </label>
            <input
              type="date"
              value={filterToDate}
              onChange={(e) => setFilterToDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-white"
            />
          </div>
        </div>

        {/* Baris 2: Filter Kategori dan Tombol */}
        <div className="flex flex-wrap items-end gap-3">
          {/* 3. Filter Kategori */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              3. Filter Kategori (Opsional)
            </label>
            <select
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-white"
            >
              <option value="">Semua Kategori</option>
            </select>
          </div>

          {/* Tombol Hitung Rekapan */}
          <button
            onClick={fetchRiwayat}
            disabled={rekapanLoading}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          >
            {rekapanLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Hitung Rekapan
              </>
            )}
          </button>

          {/* Tombol Reset Filter */}
          <button
            onClick={() => {
              setFilterMonth("");
              setFilterYear(new Date().getFullYear().toString());
              setFilterCategory("Balita");
              setFilterFromDate("");
              setFilterToDate("");
            }}
            className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-300 transition-colors flex items-center gap-2 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Filter
          </button>
        </div>
      </div>

      {/* Ringkasan Rekapan Balita */}
      {(filterCategory === "Balita" || filterCategory === "semua") && rekapanBalita && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-xl font-bold text-gray-900">Ringkasan Rekapan Balita</h3>
            <p className="text-xs text-gray-600 mt-1">
              Periode: 01 Agustus 2026 - 31 Agustus 2026
            </p>
          </div>

          {/* Baris 1 - Status Utama (5 kartu) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
            {/* Total Pemeriksaan */}
            <div className="bg-teal-50/50 border border-teal-100 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Total Pemeriksaan
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-0.5">
                    {rekapanBalita.totalPemeriksaan}
                  </div>
                  <div className="text-xs text-teal-700 font-medium">
                    100% dari total
                  </div>
                </div>
                <div className="ml-2">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Gizi Normal */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Gizi Normal
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-0.5">
                    {rekapanBalita.statusBbTb.normal}
                  </div>
                  <div className="text-xs text-blue-700 font-medium">
                    {((rekapanBalita.statusBbTb.normal / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="ml-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Gizi Kurang */}
            <div className="bg-yellow-50/50 border border-yellow-100 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Gizi Kurang
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-0.5">
                    {rekapanBalita.statusBbTb.kurang}
                  </div>
                  <div className="text-xs text-yellow-700 font-medium">
                    {((rekapanBalita.statusBbTb.kurang / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="ml-2">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Gizi Buruk */}
            <div className="bg-red-50/50 border border-red-100 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Gizi Buruk
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-0.5">
                    {rekapanBalita.statusBbTb.sangatKurang}
                  </div>
                  <div className="text-xs text-red-700 font-medium">
                    {((rekapanBalita.statusBbTb.sangatKurang / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="ml-2">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Perlu Perhatian / Rawat Inap */}
            <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Perlu Perhatian / Rawat
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-0.5">
                    {rekapanBalita.statusBbTb.sangatKurang + rekapanBalita.statusBbTb.kurang}
                  </div>
                  <div className="text-xs text-purple-700 font-medium">
                    {(((rekapanBalita.statusBbTb.sangatKurang + rekapanBalita.statusBbTb.kurang) / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="ml-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Baris 2 - Parameter Pemeriksaan (6 kartu) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* BB/U Normal */}
            <div className="bg-teal-50/50 border border-teal-100 rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-1.5">
                    BB/U Normal
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">
                    {rekapanBalita.statusBbU.normal}
                  </div>
                  <div className="text-xs text-teal-700 font-medium">
                    {((rekapanBalita.statusBbU.normal / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="ml-1.5">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* BB/U Kurang */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-1.5">
                    BB/U Kurang
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">
                    {rekapanBalita.statusBbU.kurang}
                  </div>
                  <div className="text-xs text-blue-700 font-medium">
                    {((rekapanBalita.statusBbU.kurang / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="ml-1.5">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* BB/U Sangat Kurang */}
            <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-1.5">
                    BB/U Sangat Kurang
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">
                    {rekapanBalita.statusBbU.sangatKurang}
                  </div>
                  <div className="text-xs text-orange-700 font-medium">
                    {((rekapanBalita.statusBbU.sangatKurang / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="ml-1.5">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Imunisasi Lengkap */}
            <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-1.5">
                    Imunisasi Lengkap
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">
                    {rekapanBalita.imunisasiLengkap}
                  </div>
                  <div className="text-xs text-purple-700 font-medium">
                    {((rekapanBalita.imunisasiLengkap / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="ml-1.5">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 002.288-4.042 1.087 1.087 0 00-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 01-.98-.314l-.295-.295a1.125 1.125 0 010-1.591l.13-.132a1.125 1.125 0 011.3-.21l.603.302a.809.809 0 001.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 001.528-1.732l.146-.292M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.716.607 5.18 1.64" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Vitamin A (Diberikan) */}
            <div className="bg-red-50/50 border border-red-100 rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-1.5">
                    Vitamin A (Diberikan)
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">
                    {rekapanBalita.vitaminA}
                  </div>
                  <div className="text-xs text-red-700 font-medium">
                    {((rekapanBalita.vitaminA / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="ml-1.5">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* ASI Eksklusif */}
            <div className="bg-green-50/50 border border-green-100 rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-1.5">
                    ASI Eksklusif
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">
                    {rekapanBalita.asiEksklusif}
                  </div>
                  <div className="text-xs text-green-700 font-medium">
                    {((rekapanBalita.asiEksklusif / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="ml-1.5">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Data Pemeriksaan Table */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-gray-900">
                Detail Data Pemeriksaan
              </h4>
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-600">
                  Tampilkan 
                  <select className="mx-1 px-2 py-1 border border-gray-300 rounded text-xs">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                    <option>100</option>
                  </select>
                  data
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari nama balita..."
                    value={searchBalita}
                    onChange={(e) => setSearchBalita(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  />
                  <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">No</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">Nama Balita</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">Tanggal Periksa</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">Usia</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">BB (kg)</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">TB (cm)</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">BB/U</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">TB/U</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">Gizi</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">Imunisasi</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">Vit A</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">ASI Eksklusif</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">Petugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBalitaLogs
                    .slice(0, 10)
                    .map((log, idx) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5 text-gray-900">{idx + 1}</td>
                        <td className="px-3 py-2.5 text-gray-900 font-medium">{log.nama || "-"}</td>
                        <td className="px-3 py-2.5 text-gray-700">{log.tanggal || "-"}</td>
                        <td className="px-3 py-2.5 text-gray-700">{log.beratBadan ? `${Math.floor(log.beratBadan / 12)} thn ${log.beratBadan % 12} bln` : "-"}</td>
                        <td className="px-3 py-2.5 text-gray-700">{log.beratBadan || "-"}</td>
                        <td className="px-3 py-2.5 text-gray-700">{log.tinggiBadan || "-"}</td>
                        <td className="px-3 py-2.5 text-gray-700">
                          {log.statusBbU === "N" ? "Normal" :
                           log.statusBbU === "K" ? "Kurang" :
                           log.statusBbU === "SK" ? "Sangat Kurang" :
                           log.statusBbU === "L" ? "Lebih" : "-"}
                        </td>
                        <td className="px-3 py-2.5 text-gray-700">
                          {log.statusTbU === "N" ? "Normal" :
                           log.statusTbU === "P" ? "Pendek" :
                           log.statusTbU === "SP" ? "Sangat Pendek" : "-"}
                        </td>
                        <td className="px-3 py-2.5 text-gray-700">
                          {log.statusBbTb === "N" ? "Normal" :
                           log.statusBbTb === "K" ? "Gizi Kurang" :
                           log.statusBbTb === "SK" ? "Gizi Buruk" :
                           log.statusBbTb === "G" ? "Gizi Lebih" :
                           log.statusBbTb === "L" ? "Lebih" : "-"}
                        </td>
                        <td className="px-3 py-2.5 text-gray-700">{log.statusImunisasi || "-"}</td>
                        <td className="px-3 py-2.5 text-gray-700">{log.vitaminA ? "Ya" : "Tidak"}</td>
                        <td className="px-3 py-2.5 text-gray-700">{log.asiEksklusif ? "Ya" : "Tidak"}</td>
                        <td className="px-3 py-2.5 text-gray-700">{log.petugas || "-"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-xs text-gray-600">
                Menampilkan 1 - {Math.min(10, filteredBalitaLogs.length)} dari {filteredBalitaLogs.length} data
              </div>
              <div className="flex items-center gap-1">
                {filteredBalitaLogs.length > 10 ? (
                  <>
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded bg-teal-600 text-white font-medium text-sm">
                      1
                    </button>
                    {Math.ceil(filteredBalitaLogs.length / 10) > 1 && (
                      <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-sm">
                        2
                      </button>
                    )}
                    {Math.ceil(filteredBalitaLogs.length / 10) > 2 && (
                      <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-sm">
                        3
                      </button>
                    )}
                    {Math.ceil(filteredBalitaLogs.length / 10) > 4 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                    {Math.ceil(filteredBalitaLogs.length / 10) > 3 && (
                      <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-sm">
                        {Math.ceil(filteredBalitaLogs.length / 10)}
                      </button>
                    )}
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <button className="w-8 h-8 flex items-center justify-center rounded bg-teal-600 text-white font-medium text-sm">
                    1
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Ringkasan Rekapan Lansia */}
      {(filterCategory === "Lansia" || filterCategory === "semua") && rekapanLansia && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mt-6">
          <div className="mb-5">
            <h3 className="text-xl font-bold text-gray-900">Ringkasan Rekapan Lansia</h3>
            <p className="text-xs text-gray-600 mt-1">
              Periode: 01 Agustus 2026 - 31 Agustus 2026
            </p>
          </div>

          {/* Baris 1 - Status Utama (5 kartu) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
            {/* Total Pemeriksaan */}
            <div className="bg-teal-50/50 border border-teal-100 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Total Pemeriksaan
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-0.5">
                    {rekapanLansia.totalPemeriksaan}
                  </div>
                  <div className="text-xs text-teal-700 font-medium">
                    100% dari total
                  </div>
                </div>
                <div className="ml-2">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Tekanan Darah Normal */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Tekanan Darah Normal
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-0.5">
                    {rekapanLansia.totalPemeriksaan - rekapanLansia.statusHipertensi}
                  </div>
                  <div className="text-xs text-blue-700 font-medium">
                    {(((rekapanLansia.totalPemeriksaan - rekapanLansia.statusHipertensi) / rekapanLansia.totalPemeriksaan) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="ml-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Tekanan Darah Tinggi */}
            <div className="bg-yellow-50/50 border border-yellow-100 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Tekanan Darah Tinggi
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-0.5">
                    {rekapanLansia.statusHipertensi}
                  </div>
                  <div className="text-xs text-yellow-700 font-medium">
                    {((rekapanLansia.statusHipertensi / rekapanLansia.totalPemeriksaan) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="ml-2">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Tekanan Darah Rendah */}
            <div className="bg-red-50/50 border border-red-100 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Tekanan Darah Rendah
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-0.5">
                    0
                  </div>
                  <div className="text-xs text-red-700 font-medium">
                    0%
                  </div>
                </div>
                <div className="ml-2">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Perlu Perhatian / Rawat Inap */}
            <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Perlu Perhatian / Rawat
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-0.5">
                    {rekapanLansia.statusHipertensiDanGds}
                  </div>
                  <div className="text-xs text-purple-700 font-medium">
                    {((rekapanLansia.statusHipertensiDanGds / rekapanLansia.totalPemeriksaan) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="ml-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Baris 2 - Parameter Pemeriksaan (6 kartu) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-4">
            {/* IMT Normal */}
            <div className="bg-teal-50/50 border border-teal-100 rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-1.5">
                    IMT Normal
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">
                    {Math.round(rekapanLansia.totalPemeriksaan * 0.625)}
                  </div>
                  <div className="text-xs text-teal-700 font-medium">
                    62.5%
                  </div>
                </div>
                <div className="ml-1.5">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* IMT Kurang */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-1.5">
                    IMT Kurang
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">
                    {Math.round(rekapanLansia.totalPemeriksaan * 0.083)}
                  </div>
                  <div className="text-xs text-blue-700 font-medium">
                    8.3%
                  </div>
                </div>
                <div className="ml-1.5">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* IMT Berlebih / Obesitas */}
            <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-1.5">
                    IMT Berlebih / Obesitas
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">
                    {Math.round(rekapanLansia.totalPemeriksaan * 0.292)}
                  </div>
                  <div className="text-xs text-orange-700 font-medium">
                    29.2%
                  </div>
                </div>
                <div className="ml-1.5">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Gula Darah Normal */}
            <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-1.5">
                    Gula Darah Normal
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">
                    {rekapanLansia.totalPemeriksaan - rekapanLansia.statusGdsTinggi}
                  </div>
                  <div className="text-xs text-purple-700 font-medium">
                    {(((rekapanLansia.totalPemeriksaan - rekapanLansia.statusGdsTinggi) / rekapanLansia.totalPemeriksaan) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="ml-1.5">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Kolesterol Normal */}
            <div className="bg-pink-50/50 border border-pink-100 rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-1.5">
                    Kolesterol Normal
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">
                    {Math.round(rekapanLansia.totalPemeriksaan * 0.733)}
                  </div>
                  <div className="text-xs text-pink-700 font-medium">
                    73.3%
                  </div>
                </div>
                <div className="ml-1.5">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Pemeriksaan Lengkap */}
            <div className="bg-green-50/50 border border-green-100 rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-1.5">
                    Pemeriksaan Lengkap
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">
                    {Math.round(rekapanLansia.totalPemeriksaan * 0.875)}
                  </div>
                  <div className="text-xs text-green-700 font-medium">
                    87.5%
                  </div>
                </div>
                <div className="ml-1.5">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Data Pemeriksaan Table */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-gray-900">
                Detail Data Pemeriksaan
              </h4>
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-600">
                  Tampilkan 
                  <select className="mx-1 px-2 py-1 border border-gray-300 rounded text-xs">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                    <option>100</option>
                  </select>
                  data
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari nama lansia..."
                    value={searchLansia}
                    onChange={(e) => setSearchLansia(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  />
                  <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">No</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">Nama Lansia</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">Tanggal Periksa</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">Usia</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">Jenis Kelamin</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">BB (kg)</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">TB (cm)</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">IMT</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">Tekanan Darah</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">Gula Darah</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">Kolesterol</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">Status</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-700">Petugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLansiaLogs
                    .slice(0, 10)
                    .map((log, idx) => {
                      const sistol = log.tekananDarahSistol || 0;
                      const diastol = log.tekananDarahDiastol || 0;
                      const gds = log.gulaDarahSewaktu || 0;
                      const isHipertensi = sistol >= 140 || diastol >= 90;
                      const isGdsTinggi = gds >= 200;
                      
                      let statusText = "Normal";
                      
                      if (isHipertensi && isGdsTinggi) {
                        statusText = "Hipertensi & GDS Tinggi";
                      } else if (isHipertensi) {
                        statusText = "Hipertensi";
                      } else if (isGdsTinggi) {
                        statusText = "GDS Tinggi";
                      }

                      // Hitung usia dalam tahun
                      let usiaTahun = "-";
                      if (log.tanggalLahir) {
                        const lahir = new Date(log.tanggalLahir);
                        const sekarang = new Date();
                        usiaTahun = Math.floor((sekarang.getTime() - lahir.getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toString();
                      }

                      // Hitung IMT
                      let imt = "-";
                      if (log.beratBadan && log.tinggiBadan) {
                        const tinggiMeter = log.tinggiBadan / 100;
                        imt = (log.beratBadan / (tinggiMeter * tinggiMeter)).toFixed(1);
                      }

                      // Format Tekanan Darah
                      const tekananDarah = `${sistol}/${diastol}`;

                      return (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2.5 text-gray-900">{idx + 1}</td>
                          <td className="px-3 py-2.5 text-gray-900 font-medium">{log.nama || "-"}</td>
                          <td className="px-3 py-2.5 text-gray-700">{log.tanggal || "-"}</td>
                          <td className="px-3 py-2.5 text-gray-700">{usiaTahun} th</td>
                          <td className="px-3 py-2.5 text-gray-700">{log.jenisKelamin === "L" ? "Laki-laki" : log.jenisKelamin === "P" ? "Perempuan" : "-"}</td>
                          <td className="px-3 py-2.5 text-gray-700">{log.beratBadan || "-"}</td>
                          <td className="px-3 py-2.5 text-gray-700">{log.tinggiBadan || "-"}</td>
                          <td className="px-3 py-2.5 text-gray-700">{imt}</td>
                          <td className="px-3 py-2.5 text-gray-700">{tekananDarah}</td>
                          <td className="px-3 py-2.5 text-gray-700">{gds}</td>
                          <td className="px-3 py-2.5 text-gray-700">{log.kolesterol || "-"}</td>
                          <td className="px-3 py-2.5 text-gray-700">
                            {statusText}
                          </td>
                          <td className="px-3 py-2.5 text-gray-700">{log.petugas || "-"}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-xs text-gray-600">
                Menampilkan 1 - {Math.min(10, filteredLansiaLogs.length)} dari {filteredLansiaLogs.length} data
              </div>
              <div className="flex items-center gap-1">
                {filteredLansiaLogs.length > 10 ? (
                  <>
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded bg-teal-600 text-white font-medium text-sm">
                      1
                    </button>
                    {Math.ceil(filteredLansiaLogs.length / 10) > 1 && (
                      <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-sm">
                        2
                      </button>
                    )}
                    {Math.ceil(filteredLansiaLogs.length / 10) > 2 && (
                      <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-sm">
                        3
                      </button>
                    )}
                    {Math.ceil(filteredLansiaLogs.length / 10) > 4 && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                    {Math.ceil(filteredLansiaLogs.length / 10) > 3 && (
                      <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-sm">
                        {Math.ceil(filteredLansiaLogs.length / 10)}
                      </button>
                    )}
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50 text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <button className="w-8 h-8 flex items-center justify-center rounded bg-teal-600 text-white font-medium text-sm">
                    1
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
