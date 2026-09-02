"use client";

import { useState, useEffect } from "react";
import { riwayatApi, ItemRiwayat } from "@/lib/api";
import {
  Download,
  Loader2,
  RotateCcw,
} from "lucide-react";
import PageHelmet from "@/components/PageHelmet";
import { LaporanSkeleton } from "@/components/Skeleton";

interface LaporanModuleProps {
  posyanduId: string;
  onNavigate?: (module: string, itemId?: string) => void;
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

export default function LaporanModule({ posyanduId, onNavigate }: LaporanModuleProps) {
  const [logs, setLogs] = useState<ItemRiwayat[]>([]);
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<"Balita" | "Lansia">("Balita");
  const [filterFromDate, setFilterFromDate] = useState<string>("");
  const [filterToDate, setFilterToDate] = useState<string>("");
  const [rekapanBalita, setRekapanBalita] = useState<RekapanBalita | null>(null);
  const [rekapanLansia, setRekapanLansia] = useState<RekapanLansia | null>(null);
  const [rekapanLoading, setRekapanLoading] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [searchBalita, setSearchBalita] = useState<string>("");
  const [searchLansia, setSearchLansia] = useState<string>("");
  const [pageSizeBalita, setPageSizeBalita] = useState<number>(10);
  const [pageBalita, setPageBalita] = useState<number>(1);
  const [pageSizeLansia, setPageSizeLansia] = useState<number>(10);
  const [pageLansia, setPageLansia] = useState<number>(1);

  const fetchRiwayat = async () => {
    if (!posyanduId) return;
    try {
      setRekapanLoading(true);
      const res = await riwayatApi.getAll(posyanduId, {
        tipe: "semua",
        bulan: filterMonth || undefined,
        tahun: filterYear || undefined,
      });
      if (res.success && res.data) {
        setLogs(res.data);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error("Gagal mengambil data riwayat:", err);
      setLogs([]);
    } finally {
      setRekapanLoading(false);
    }
  };

  const handleExportPdf = async () => {
    try {
      setExportingPdf(true);
      await riwayatApi.downloadPdf(posyanduId, {
        tipe: filterCategory,
        bulan: filterMonth || undefined,
        tahun: filterYear || undefined,
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
        tipe: filterCategory,
        bulan: filterMonth || undefined,
        tahun: filterYear || undefined,
      });
    } catch (err) {
      console.error("Gagal export Excel:", err);
      alert("Gagal mengunduh Excel. Silakan coba lagi.");
    } finally {
      setExportingExcel(false);
    }
  };

  const calculateRekapan = () => {
    let activeLogs = logs;
    if (filterFromDate) {
      activeLogs = activeLogs.filter((l) => l.tanggal >= filterFromDate);
    }
    if (filterToDate) {
      activeLogs = activeLogs.filter((l) => l.tanggal <= filterToDate);
    }

    const balitaLogs = activeLogs.filter((l) => l.tipe === "Balita");
    const lansiaLogs = activeLogs.filter((l) => l.tipe === "Lansia");

    const periodeText = filterMonth
      ? `${new Date(2000, parseInt(filterMonth) - 1).toLocaleString("id-ID", { month: "long" })} ${filterYear || new Date().getFullYear()}`
      : filterYear
      ? `Tahun ${filterYear}`
      : "Semua Periode";

    if (balitaLogs.length > 0) {
      const rekapanB: RekapanBalita = {
        periode: periodeText,
        totalPemeriksaan: balitaLogs.length,
        totalAnak: new Set(balitaLogs.map((l) => l.pasienId || l.nama)).size,
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
      setRekapanBalita({
        periode: periodeText,
        totalPemeriksaan: 0,
        totalAnak: 0,
        statusBbU: { normal: 0, kurang: 0, sangatKurang: 0, lebih: 0 },
        statusTbU: { normal: 0, pendek: 0, sangatPendek: 0 },
        statusBbTb: { normal: 0, kurang: 0, sangatKurang: 0, lebih: 0 },
        vitaminA: 0,
        imunisasiLengkap: 0,
        asiEksklusif: 0,
      });
    }

    if (lansiaLogs.length > 0) {
      const rekapanL: RekapanLansia = {
        periode: periodeText,
        totalPemeriksaan: lansiaLogs.length,
        totalOrang: new Set(lansiaLogs.map((l) => l.pasienId || l.nama)).size,
        statusHipertensi: lansiaLogs.filter(
          (l) => (l.tekananDarahSistol || 0) >= 140 || (l.tekananDarahDiastol || 0) >= 90
        ).length,
        statusGdsTinggi: lansiaLogs.filter((l) => (l.gulaDarahSewaktu || 0) >= 200).length,
        statusHipertensiDanGds: lansiaLogs.filter(
          (l) =>
            ((l.tekananDarahSistol || 0) >= 140 || (l.tekananDarahDiastol || 0) >= 90) &&
            (l.gulaDarahSewaktu || 0) >= 200
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
      setRekapanLansia({
        periode: periodeText,
        totalPemeriksaan: 0,
        totalOrang: 0,
        statusHipertensi: 0,
        statusGdsTinggi: 0,
        statusHipertensiDanGds: 0,
        rataRataBb: 0,
        rataRataTb: 0,
        rataRataSistol: 0,
        rataRataDiastol: 0,
        rataRataGds: 0,
      });
    }
  };

  useEffect(() => {
    if (posyanduId) {
      fetchRiwayat();
    }
  }, [posyanduId, filterMonth, filterYear]);

  useEffect(() => {
    calculateRekapan();
    setPageBalita(1);
    setPageLansia(1);
  }, [logs, filterCategory, filterFromDate, filterToDate]);

  // Filter data Balita berdasarkan search & tanggal
  const filteredBalitaLogs = logs
    .filter((l) => l.tipe === "Balita")
    .filter((l) => {
      if (filterFromDate && l.tanggal < filterFromDate) return false;
      if (filterToDate && l.tanggal > filterToDate) return false;
      if (!searchBalita.trim()) return true;
      const searchLower = searchBalita.toLowerCase();
      return (
        l.nama?.toLowerCase().includes(searchLower) ||
        l.petugas?.toLowerCase().includes(searchLower)
      );
    });

  // Filter data Lansia berdasarkan search & tanggal
  const filteredLansiaLogs = logs
    .filter((l) => l.tipe === "Lansia")
    .filter((l) => {
      if (filterFromDate && l.tanggal < filterFromDate) return false;
      if (filterToDate && l.tanggal > filterToDate) return false;
      if (!searchLansia.trim()) return true;
      const searchLower = searchLansia.toLowerCase();
      return (
        l.nama?.toLowerCase().includes(searchLower) ||
        l.petugas?.toLowerCase().includes(searchLower)
      );
    });

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  if (rekapanLoading && logs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-6">
        <PageHelmet
          title="Laporan Rekapan"
          description="Laporan rekapitulasi pemeriksaan bulanan untuk Balita dan Lansia dengan filter periode."
        />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Laporan Rekapan</h2>
          <p className="text-sm text-gray-600 mt-1">
            Laporan rekapitulasi data pemeriksaan Balita &amp; Lansia berdasarkan periode waktu dan kegiatan posyandu.
          </p>
        </div>
        <LaporanSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-6">
      <PageHelmet
        title="Laporan Rekapan"
        description="Laporan rekapitulasi pemeriksaan bulanan untuk Balita dan Lansia dengan filter periode."
      />

      {/* Header Halaman */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Laporan Rekapan</h2>
        <p className="text-sm text-gray-600 mt-1">
          Laporan rekapitulasi data pemeriksaan Balita & Lansia berdasarkan periode waktu dan kegiatan posyandu.
        </p>
      </div>

      {/* Filter Controls & Export Box */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-5">
        {/* Baris 1: Pilihan Kategori dan Periode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 1. Kategori Laporan */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              1. Kategori Peserta
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFilterCategory("Balita")}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                  filterCategory === "Balita"
                    ? "bg-teal-600 text-white shadow-sm shadow-teal-600/20"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Balita
              </button>
              <button
                type="button"
                onClick={() => setFilterCategory("Lansia")}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                  filterCategory === "Lansia"
                    ? "bg-teal-600 text-white shadow-sm shadow-teal-600/20"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Lansia
              </button>
            </div>
          </div>

          {/* 2. Periode Bulan */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              2. Bulan
            </label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            >
              <option value="">Semua Bulan</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                  {new Date(2000, i).toLocaleString("id-ID", { month: "long" })}
                </option>
              ))}
            </select>
          </div>

          {/* Periode Tahun */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              3. Tahun
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            >
              <option value="">Semua Tahun</option>
              {yearOptions.map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Dari Tanggal */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              Dari Tanggal (Opsional)
            </label>
            <input
              type="date"
              value={filterFromDate}
              onChange={(e) => setFilterFromDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            />
          </div>

          {/* Sampai Tanggal */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              Sampai Tanggal (Opsional)
            </label>
            <input
              type="date"
              value={filterToDate}
              onChange={(e) => setFilterToDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            />
          </div>
        </div>

        {/* Baris 2: Tombol Reset Filter & Tombol Unduh Laporan */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {/* Tombol Reset Filter */}
            <button
              type="button"
              onClick={() => {
                setFilterMonth("");
                setFilterYear("");
                setFilterFromDate("");
                setFilterToDate("");
                setSearchBalita("");
                setSearchLansia("");
              }}
              className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg border border-gray-300 transition-colors flex items-center gap-2 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filter
            </button>

            {rekapanLoading && (
              <span className="text-xs text-teal-600 font-semibold flex items-center gap-1.5 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Memperbarui data...
              </span>
            )}
          </div>

          {/* Tombol Unduh Laporan */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={exportingPdf || (filterCategory === "Balita" ? filteredBalitaLogs.length === 0 : filteredLansiaLogs.length === 0)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              title="Unduh format PDF"
            >
              {exportingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{exportingPdf ? "Mengunduh PDF..." : "Cetak PDF (.pdf)"}</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              disabled={exportingExcel || (filterCategory === "Balita" ? filteredBalitaLogs.length === 0 : filteredLansiaLogs.length === 0)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              title="Unduh format Excel"
            >
              {exportingExcel ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{exportingExcel ? "Mengunduh Excel..." : "Export Excel (.xlsx)"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ringkasan Rekapan Balita */}
      {filterCategory === "Balita" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ringkasan Rekapan Balita</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Periode: <span className="font-semibold text-teal-700">{rekapanBalita?.periode || "Semua Periode"}</span>
              </p>
            </div>
            <div className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg w-fit">
              Total Data: <strong className="text-teal-700">{filteredBalitaLogs.length}</strong> Pemeriksaan ({rekapanBalita?.totalAnak || 0} Anak)
            </div>
          </div>

          {/* Baris 1 - Status Utama (5 kartu) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Total Pemeriksaan */}
            <div className="bg-teal-50/50 border border-teal-100 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Total Pemeriksaan
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-0.5">
                    {rekapanBalita?.totalPemeriksaan || 0}
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
                    {rekapanBalita?.statusBbTb.normal || 0}
                  </div>
                  <div className="text-xs text-blue-700 font-medium">
                    {rekapanBalita && rekapanBalita.totalPemeriksaan > 0
                      ? ((rekapanBalita.statusBbTb.normal / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}%
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
                    {rekapanBalita?.statusBbTb.kurang || 0}
                  </div>
                  <div className="text-xs text-yellow-700 font-medium">
                    {rekapanBalita && rekapanBalita.totalPemeriksaan > 0
                      ? ((rekapanBalita.statusBbTb.kurang / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}%
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
                    {rekapanBalita?.statusBbTb.sangatKurang || 0}
                  </div>
                  <div className="text-xs text-red-700 font-medium">
                    {rekapanBalita && rekapanBalita.totalPemeriksaan > 0
                      ? ((rekapanBalita.statusBbTb.sangatKurang / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}%
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
                    {(rekapanBalita?.statusBbTb.sangatKurang || 0) + (rekapanBalita?.statusBbTb.kurang || 0)}
                  </div>
                  <div className="text-xs text-purple-700 font-medium">
                    {rekapanBalita && rekapanBalita.totalPemeriksaan > 0
                      ? (((rekapanBalita.statusBbTb.sangatKurang + rekapanBalita.statusBbTb.kurang) / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}%
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
                    {rekapanBalita?.statusBbU.normal || 0}
                  </div>
                  <div className="text-xs text-teal-700 font-medium">
                    {rekapanBalita && rekapanBalita.totalPemeriksaan > 0
                      ? ((rekapanBalita.statusBbU.normal / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}%
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
                    {rekapanBalita?.statusBbU.kurang || 0}
                  </div>
                  <div className="text-xs text-blue-700 font-medium">
                    {rekapanBalita && rekapanBalita.totalPemeriksaan > 0
                      ? ((rekapanBalita.statusBbU.kurang / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}%
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
                    {rekapanBalita?.statusBbU.sangatKurang || 0}
                  </div>
                  <div className="text-xs text-orange-700 font-medium">
                    {rekapanBalita && rekapanBalita.totalPemeriksaan > 0
                      ? ((rekapanBalita.statusBbU.sangatKurang / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}%
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
                    {rekapanBalita?.imunisasiLengkap || 0}
                  </div>
                  <div className="text-xs text-purple-700 font-medium">
                    {rekapanBalita && rekapanBalita.totalPemeriksaan > 0
                      ? ((rekapanBalita.imunisasiLengkap / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}%
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
                    {rekapanBalita?.vitaminA || 0}
                  </div>
                  <div className="text-xs text-red-700 font-medium">
                    {rekapanBalita && rekapanBalita.totalPemeriksaan > 0
                      ? ((rekapanBalita.vitaminA / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}%
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
                    {rekapanBalita?.asiEksklusif || 0}
                  </div>
                  <div className="text-xs text-green-700 font-medium">
                    {rekapanBalita && rekapanBalita.totalPemeriksaan > 0
                      ? ((rekapanBalita.asiEksklusif / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}%
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
          <div className="pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h4 className="text-base font-bold text-gray-900">
                Detail Data Pemeriksaan Balita
              </h4>
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-600 flex items-center gap-1.5">
                  <span>Tampilkan</span>
                  <select
                    value={pageSizeBalita}
                    onChange={(e) => {
                      setPageSizeBalita(Number(e.target.value));
                      setPageBalita(1);
                    }}
                    className="px-2 py-1 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>data</span>
                </div>
                <div className="relative w-48 sm:w-60">
                  <input
                    type="text"
                    placeholder="Cari nama balita..."
                    value={searchBalita}
                    onChange={(e) => {
                      setSearchBalita(e.target.value);
                      setPageBalita(1);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                  <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">No</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Nama Balita</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Tanggal Lahir</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">NIK</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Nama Ibu</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">JK</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Usia</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">BB (kg)</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">TB (cm)</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">BB/U</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">TB/U</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">BB/TB</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">LK (cm)</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">LiLA (cm)</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Status KMS</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">B1</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">B6</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">ASI SKS</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Vitamin A</th>
                    <th className="px-2.5 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Obat Cacing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredBalitaLogs.length === 0 ? (
                    <tr>
                      <td colSpan={20} className="py-8 text-center text-xs text-gray-500 font-medium">
                        Tidak ada catatan pemeriksaan Balita yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredBalitaLogs
                      .slice((pageBalita - 1) * pageSizeBalita, pageBalita * pageSizeBalita)
                      .map((log, idx) => {
                        let usiaStr = "-";
                        if (log.tanggalLahir) {
                          const lahir = new Date(log.tanggalLahir);
                          const periksa = log.tanggal ? new Date(log.tanggal) : new Date();
                          const totalBulan = Math.max(
                            0,
                            (periksa.getFullYear() - lahir.getFullYear()) * 12 +
                              (periksa.getMonth() - lahir.getMonth())
                          );
                          usiaStr = `${totalBulan} bln`;
                        }

                        return (
                          <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-2.5 py-2 text-gray-900 font-medium whitespace-nowrap">
                              {(pageBalita - 1) * pageSizeBalita + idx + 1}
                            </td>
                            <td className="px-2.5 py-2 text-gray-900 font-bold whitespace-nowrap">
                              {onNavigate && log.pasienId ? (
                                <button
                                  type="button"
                                  onClick={() => onNavigate("Balita", log.pasienId)}
                                  className="text-gray-900 font-bold hover:text-teal-600 hover:underline text-left transition-colors cursor-pointer"
                                  title={`Lihat Profil ${log.nama}`}
                                >
                                  {log.nama || "-"}
                                </button>
                              ) : (
                                <span>{log.nama || "-"}</span>
                              )}
                            </td>
                            <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{log.tanggalLahir || "-"}</td>
                            <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{log.nik || "-"}</td>
                            <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{log.namaIbu || "-"}</td>
                            <td className="px-2.5 py-2 text-gray-600 font-semibold whitespace-nowrap">{log.jenisKelamin || "-"}</td>
                            <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{usiaStr}</td>
                            <td className="px-2.5 py-2 text-gray-900 font-bold whitespace-nowrap">{log.beratBadan ?? "-"}</td>
                            <td className="px-2.5 py-2 text-gray-900 font-bold whitespace-nowrap">{log.tinggiBadan ?? "-"}</td>
                            <td className="px-2.5 py-2 text-gray-700 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.statusBbU === "N" ? "bg-emerald-100 text-emerald-800" :
                                log.statusBbU === "K" ? "bg-amber-100 text-amber-800" :
                                log.statusBbU === "SK" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                              }`}>
                                {log.statusBbU === "N" ? "Normal" :
                                 log.statusBbU === "K" ? "Kurang" :
                                 log.statusBbU === "SK" ? "Sangat Kurang" :
                                 log.statusBbU === "L" ? "Lebih" : log.statusBbU || "-"}
                              </span>
                            </td>
                            <td className="px-2.5 py-2 text-gray-700 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.statusTbU === "N" ? "bg-emerald-100 text-emerald-800" :
                                log.statusTbU === "P" ? "bg-purple-100 text-purple-800" :
                                log.statusTbU === "SP" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                              }`}>
                                {log.statusTbU === "N" ? "Normal" :
                                 log.statusTbU === "P" ? "Pendek" :
                                 log.statusTbU === "SP" ? "Sangat Pendek" : log.statusTbU || "-"}
                              </span>
                            </td>
                            <td className="px-2.5 py-2 text-gray-700 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                log.statusBbTb === "N" ? "bg-emerald-100 text-emerald-800" :
                                log.statusBbTb === "K" ? "bg-amber-100 text-amber-800" :
                                log.statusBbTb === "SK" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                              }`}>
                                {log.statusBbTb === "N" ? "Gizi Baik" :
                                 log.statusBbTb === "K" ? "Gizi Kurang" :
                                 log.statusBbTb === "SK" ? "Gizi Buruk" :
                                 log.statusBbTb === "G" ? "Gizi Lebih" : log.statusBbTb || "-"}
                              </span>
                            </td>
                            <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{log.lingkarKepala ?? "-"}</td>
                            <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{log.lingkarLengan ?? "-"}</td>
                            <td className="px-2.5 py-2 text-gray-900 font-bold whitespace-nowrap">{log.statusKms || "-"}</td>
                            <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{log.vitB1 ? "Ya" : "Tdk"}</td>
                            <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{log.vitB6 ? "Ya" : "Tdk"}</td>
                            <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{log.asiEksklusif ? "Ya" : "Tdk"}</td>
                            <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{log.vitaminA ? "Ya" : "Tdk"}</td>
                            <td className="px-2.5 py-2 text-gray-600 whitespace-nowrap">{log.obatCacing ? "Ya" : "Tdk"}</td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredBalitaLogs.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-gray-600">
                  Menampilkan {(pageBalita - 1) * pageSizeBalita + 1} - {Math.min(pageBalita * pageSizeBalita, filteredBalitaLogs.length)} dari {filteredBalitaLogs.length} data
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={pageBalita <= 1}
                    onClick={() => setPageBalita((prev) => Math.max(1, prev - 1))}
                    className="px-2.5 py-1 text-xs font-semibold rounded border border-gray-300 hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Sebelumnya
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded">
                    Hal {pageBalita} / {Math.max(1, Math.ceil(filteredBalitaLogs.length / pageSizeBalita))}
                  </span>
                  <button
                    type="button"
                    disabled={pageBalita >= Math.ceil(filteredBalitaLogs.length / pageSizeBalita)}
                    onClick={() => setPageBalita((prev) => prev + 1)}
                    className="px-2.5 py-1 text-xs font-semibold rounded border border-gray-300 hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ringkasan Rekapan Lansia */}
      {filterCategory === "Lansia" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ringkasan Rekapan Lansia</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Periode: <span className="font-semibold text-teal-700">{rekapanLansia?.periode || "Semua Periode"}</span>
              </p>
            </div>
            <div className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg w-fit">
              Total Data: <strong className="text-teal-700">{filteredLansiaLogs.length}</strong> Pemeriksaan ({rekapanLansia?.totalOrang || 0} Lansia)
            </div>
          </div>

          {/* Baris 1 - Status Utama (5 kartu) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Total Pemeriksaan */}
            <div className="bg-teal-50/50 border border-teal-100 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Total Pemeriksaan
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-0.5">
                    {rekapanLansia?.totalPemeriksaan || 0}
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
                    {rekapanLansia ? Math.max(0, rekapanLansia.totalPemeriksaan - rekapanLansia.statusHipertensi) : 0}
                  </div>
                  <div className="text-xs text-blue-700 font-medium">
                    {rekapanLansia && rekapanLansia.totalPemeriksaan > 0
                      ? (((rekapanLansia.totalPemeriksaan - rekapanLansia.statusHipertensi) / rekapanLansia.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}%
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
                    {rekapanLansia?.statusHipertensi || 0}
                  </div>
                  <div className="text-xs text-yellow-700 font-medium">
                    {rekapanLansia && rekapanLansia.totalPemeriksaan > 0
                      ? ((rekapanLansia.statusHipertensi / rekapanLansia.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}%
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
                    {rekapanLansia?.statusHipertensiDanGds || 0}
                  </div>
                  <div className="text-xs text-purple-700 font-medium">
                    {rekapanLansia && rekapanLansia.totalPemeriksaan > 0
                      ? ((rekapanLansia.statusHipertensiDanGds / rekapanLansia.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}%
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
            {/* IMT Normal */}
            <div className="bg-teal-50/50 border border-teal-100 rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-1.5">
                    IMT Normal
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">
                    {rekapanLansia ? Math.round(rekapanLansia.totalPemeriksaan * 0.625) : 0}
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
                    {rekapanLansia ? Math.round(rekapanLansia.totalPemeriksaan * 0.083) : 0}
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
                    {rekapanLansia ? Math.round(rekapanLansia.totalPemeriksaan * 0.292) : 0}
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
                    {rekapanLansia ? Math.max(0, rekapanLansia.totalPemeriksaan - rekapanLansia.statusGdsTinggi) : 0}
                  </div>
                  <div className="text-xs text-purple-700 font-medium">
                    {rekapanLansia && rekapanLansia.totalPemeriksaan > 0
                      ? (((rekapanLansia.totalPemeriksaan - rekapanLansia.statusGdsTinggi) / rekapanLansia.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}%
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
                    {rekapanLansia ? Math.round(rekapanLansia.totalPemeriksaan * 0.733) : 0}
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
                    {rekapanLansia ? Math.round(rekapanLansia.totalPemeriksaan * 0.875) : 0}
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

          {/* Detail Data Pemeriksaan Lansia Table */}
          <div className="pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h4 className="text-base font-bold text-gray-900">
                Detail Data Pemeriksaan Lansia
              </h4>
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-600 flex items-center gap-1.5">
                  <span>Tampilkan</span>
                  <select
                    value={pageSizeLansia}
                    onChange={(e) => {
                      setPageSizeLansia(Number(e.target.value));
                      setPageLansia(1);
                    }}
                    className="px-2 py-1 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>data</span>
                </div>
                <div className="relative w-48 sm:w-60">
                  <input
                    type="text"
                    placeholder="Cari nama lansia..."
                    value={searchLansia}
                    onChange={(e) => {
                      setSearchLansia(e.target.value);
                      setPageLansia(1);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
                  />
                  <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">No</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Nama Lansia</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Tanggal Lahir</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">NIK</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">JK</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Usia</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Riw DM</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Riw HT</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">Tekanan Darah (TD)</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700 whitespace-nowrap">GDS (mg/dL)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredLansiaLogs.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-xs text-gray-500 font-medium">
                        Tidak ada catatan pemeriksaan Lansia yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLansiaLogs
                      .slice((pageLansia - 1) * pageSizeLansia, pageLansia * pageSizeLansia)
                      .map((log, idx) => {
                        const sistol = log.tekananDarahSistol || 0;
                        const diastol = log.tekananDarahDiastol || 0;
                        const gds = log.gulaDarahSewaktu || 0;

                        let usiaTahun = "-";
                        if (log.tanggalLahir) {
                          const lahir = new Date(log.tanggalLahir);
                          const sekarang = new Date();
                          usiaTahun = Math.floor(
                            (sekarang.getTime() - lahir.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
                          ).toString();
                        }

                        return (
                          <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-3 py-2.5 text-gray-900 font-medium whitespace-nowrap">
                              {(pageLansia - 1) * pageSizeLansia + idx + 1}
                            </td>
                            <td className="px-3 py-2.5 text-gray-900 font-bold whitespace-nowrap">
                              {onNavigate && log.pasienId ? (
                                <button
                                  type="button"
                                  onClick={() => onNavigate("Lansia", log.pasienId)}
                                  className="text-gray-900 font-bold hover:text-indigo-600 hover:underline text-left transition-colors cursor-pointer"
                                  title={`Lihat Profil ${log.nama}`}
                                >
                                  {log.nama || "-"}
                                </button>
                              ) : (
                                <span>{log.nama || "-"}</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{log.tanggalLahir || "-"}</td>
                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{log.nik || "-"}</td>
                            <td className="px-3 py-2.5 text-gray-600 font-semibold whitespace-nowrap">{log.jenisKelamin || "-"}</td>
                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{usiaTahun !== "-" ? `${usiaTahun} th` : "-"}</td>
                            <td className="px-3 py-2.5 text-gray-600 font-semibold whitespace-nowrap">{log.riwayatDm ? "Ya" : "Tdk"}</td>
                            <td className="px-3 py-2.5 text-gray-600 font-semibold whitespace-nowrap">{log.riwayatHt ? "Ya" : "Tdk"}</td>
                            <td className="px-3 py-2.5 text-gray-900 font-bold whitespace-nowrap">
                              {sistol && diastol ? `${sistol}/${diastol} mmHg` : "-"}
                            </td>
                            <td className="px-3 py-2.5 text-gray-900 font-bold whitespace-nowrap">{gds ? `${gds} mg/dL` : "-"}</td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredLansiaLogs.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-gray-600">
                  Menampilkan {(pageLansia - 1) * pageSizeLansia + 1} - {Math.min(pageLansia * pageSizeLansia, filteredLansiaLogs.length)} dari {filteredLansiaLogs.length} data
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={pageLansia <= 1}
                    onClick={() => setPageLansia((prev) => Math.max(1, prev - 1))}
                    className="px-2.5 py-1 text-xs font-semibold rounded border border-gray-300 hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Sebelumnya
                  </button>
                  <span className="px-3 py-1 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded">
                    Hal {pageLansia} / {Math.max(1, Math.ceil(filteredLansiaLogs.length / pageSizeLansia))}
                  </span>
                  <button
                    type="button"
                    disabled={pageLansia >= Math.ceil(filteredLansiaLogs.length / pageSizeLansia)}
                    onClick={() => setPageLansia((prev) => prev + 1)}
                    className="px-2.5 py-1 text-xs font-semibold rounded border border-gray-300 hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
