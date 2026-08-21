"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Baby,
  RotateCcw,
  Download,
  Loader2,
  X,
  ChevronRight,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  LineChart as LineChartIcon,
} from "lucide-react";
import PageHelmet from "../../components/PageHelmet";
import LansiaIcon from "../../components/LansiaIcon";
import { publicPuskesmasApi, PublicPemeriksaanItem, PublicPosyanduInfo } from "../../lib/api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function PuskesmasPublicPage() {
  const [data, setData] = useState<PublicPemeriksaanItem[]>([]);
  const [posyandus, setPosyandus] = useState<PublicPosyanduInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Tab State: "Balita" | "Lansia"
  const [activeTab, setActiveTab] = useState<"Balita" | "Lansia">("Balita");

  // Filters State
  const [selectedPosyandu, setSelectedPosyandu] = useState<string>("semua");
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Search States
  const [searchBalita, setSearchBalita] = useState<string>("");
  const [searchLansia, setSearchLansia] = useState<string>("");

  // Pagination states
  const [pageSizeBalita, setPageSizeBalita] = useState<number>(10);
  const [pageBalita, setPageBalita] = useState<number>(1);
  const [pageSizeLansia, setPageSizeLansia] = useState<number>(10);
  const [pageLansia, setPageLansia] = useState<number>(1);

  // Detail Modal state
  const [selectedItem, setSelectedItem] = useState<PublicPemeriksaanItem | null>(null);

  // Participant specific history & trend for detail modal
  const participantHistory = useMemo(() => {
    if (!selectedItem) return [];
    const items = data
      .filter(
        (d) =>
          d.namaWarga.toLowerCase() === selectedItem.namaWarga.toLowerCase() &&
          d.kategori === selectedItem.kategori
      )
      .sort((a, b) => new Date(a.tanggalPeriksa).getTime() - new Date(b.tanggalPeriksa).getTime());

    return items.map((item) => ({
      ...item,
      tanggal: item.tanggalPeriksa,
      bb: item.beratBadan,
      tb: item.tinggiBadan,
      sistol: item.sistol || (item.tekananDarah ? parseInt(item.tekananDarah.split("/")[0]) : undefined),
      diastol: item.diastol || (item.tekananDarah ? parseInt(item.tekananDarah.split("/")[1]) : undefined),
      gds: item.gds,
    }));
  }, [selectedItem, data]);

  const prevRecord = participantHistory.length > 1 ? participantHistory[participantHistory.length - 2] : null;
  const bbDiff = prevRecord && selectedItem ? Number((selectedItem.beratBadan - prevRecord.beratBadan).toFixed(2)) : 0;
  const tbDiff = prevRecord && selectedItem ? Number((selectedItem.tinggiBadan - prevRecord.tinggiBadan).toFixed(1)) : 0;

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedItem) {
        setSelectedItem(null);
      }
    };
    if (selectedItem) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedItem]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [posList, records] = await Promise.all([
        publicPuskesmasApi.getPosyandus(),
        publicPuskesmasApi.getPemeriksaanData({
          posyanduId: selectedPosyandu,
          kategori: "Semua",
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      ]);
      setPosyandus(posList);
      setData(records);
    } catch (err) {
      console.error("Gagal memuat data publik puskesmas:", err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPosyandu, startDate, endDate]);

  // Client-side filtering by Month, Year, and Date
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (selectedPosyandu !== "semua" && item.posyanduId !== selectedPosyandu) {
        return false;
      }
      if (filterYear) {
        const itemYear = new Date(item.tanggalPeriksa).getFullYear().toString();
        if (itemYear !== filterYear) return false;
      }
      if (filterMonth) {
        const itemMonth = String(new Date(item.tanggalPeriksa).getMonth() + 1).padStart(2, "0");
        if (itemMonth !== filterMonth) return false;
      }
      if (startDate && item.tanggalPeriksa < startDate) return false;
      if (endDate && item.tanggalPeriksa > endDate) return false;
      return true;
    });
  }, [data, selectedPosyandu, filterYear, filterMonth, startDate, endDate]);

  // Balita records filtered by search
  const filteredBalitaLogs = useMemo(() => {
    return filteredData
      .filter((l) => l.kategori === "Balita")
      .filter((l) => {
        if (!searchBalita.trim()) return true;
        const searchLower = searchBalita.toLowerCase();
        return (
          l.namaWarga?.toLowerCase().includes(searchLower) ||
          l.posyanduNama?.toLowerCase().includes(searchLower) ||
          l.petugas?.toLowerCase().includes(searchLower)
        );
      });
  }, [filteredData, searchBalita]);

  // Lansia records filtered by search
  const filteredLansiaLogs = useMemo(() => {
    return filteredData
      .filter((l) => l.kategori === "Lansia")
      .filter((l) => {
        if (!searchLansia.trim()) return true;
        const searchLower = searchLansia.toLowerCase();
        return (
          l.namaWarga?.toLowerCase().includes(searchLower) ||
          l.posyanduNama?.toLowerCase().includes(searchLower) ||
          l.petugas?.toLowerCase().includes(searchLower)
        );
      });
  }, [filteredData, searchLansia]);

  // Rekapan calculations
  const periodeText = filterMonth
    ? `${new Date(2000, parseInt(filterMonth) - 1).toLocaleString("id-ID", { month: "long" })} ${
        filterYear || new Date().getFullYear()
      }`
    : filterYear
    ? `Tahun ${filterYear}`
    : "Semua Periode";

  const rekapanBalita = useMemo(() => {
    const balitaLogs = filteredData.filter((l) => l.kategori === "Balita");
    const totalPemeriksaan = balitaLogs.length;
    const totalAnak = new Set(balitaLogs.map((l) => l.namaWarga)).size;

    return {
      periode: periodeText,
      totalPemeriksaan,
      totalAnak,
      statusBbU: {
        normal: balitaLogs.filter((l) => l.statusBbU?.toLowerCase().includes("normal")).length,
        kurang: balitaLogs.filter((l) => l.statusBbU?.toLowerCase().includes("kurang") && !l.statusBbU?.toLowerCase().includes("sangat")).length,
        sangatKurang: balitaLogs.filter((l) => l.statusBbU?.toLowerCase().includes("sangat")).length,
        lebih: balitaLogs.filter((l) => l.statusBbU?.toLowerCase().includes("lebih")).length,
      },
      statusTbU: {
        normal: balitaLogs.filter((l) => l.statusTbU?.toLowerCase().includes("normal")).length,
        pendek: balitaLogs.filter((l) => l.statusTbU?.toLowerCase().includes("pendek") && !l.statusTbU?.toLowerCase().includes("sangat")).length,
        sangatPendek: balitaLogs.filter((l) => l.statusTbU?.toLowerCase().includes("sangat pendek") || l.statusTbU?.toLowerCase().includes("stunting")).length,
      },
      statusBbTb: {
        normal: balitaLogs.filter((l) => l.statusBbTb === "N" || l.statusRingkasan?.toLowerCase().includes("normal")).length,
        kurang: balitaLogs.filter((l) => l.statusBbTb === "K" || l.statusRingkasan?.toLowerCase().includes("gizi kurang")).length,
        sangatKurang: balitaLogs.filter((l) => l.statusBbTb === "SK" || l.statusRingkasan?.toLowerCase().includes("gizi buruk") || l.statusRingkasan?.toLowerCase().includes("sangat kurang")).length,
        lebih: balitaLogs.filter((l) => l.statusBbTb === "L" || l.statusBbTb === "G" || l.statusRingkasan?.toLowerCase().includes("lebih")).length,
      },
      vitaminA: balitaLogs.filter((l) => l.vitaminA).length,
      imunisasiLengkap: balitaLogs.filter((l) => l.statusImunisasi && l.statusImunisasi !== "").length,
      asiEksklusif: 0,
    };
  }, [filteredData, periodeText]);

  const rekapanLansia = useMemo(() => {
    const lansiaLogs = filteredData.filter((l) => l.kategori === "Lansia");
    const totalPemeriksaan = lansiaLogs.length;
    const totalOrang = new Set(lansiaLogs.map((l) => l.namaWarga)).size;

    const statusHipertensi = lansiaLogs.filter(
      (l) => (l.sistol || 0) >= 140 || (l.diastol || 0) >= 90
    ).length;
    const statusGdsTinggi = lansiaLogs.filter((l) => (l.gds || 0) >= 200).length;
    const statusHipertensiDanGds = lansiaLogs.filter(
      (l) => ((l.sistol || 0) >= 140 || (l.diastol || 0) >= 90) && (l.gds || 0) >= 200
    ).length;

    return {
      periode: periodeText,
      totalPemeriksaan,
      totalOrang,
      statusHipertensi,
      statusGdsTinggi,
      statusHipertensiDanGds,
    };
  }, [filteredData, periodeText]);

  // Export to Excel / CSV
  const handleExportExcel = () => {
    try {
      setExportingExcel(true);
      const activeLogs = activeTab === "Balita" ? filteredBalitaLogs : filteredLansiaLogs;
      if (activeLogs.length === 0) {
        alert("Tidak ada data untuk diekspor.");
        return;
      }

      const headers =
        activeTab === "Balita"
          ? [
              "No",
              "Nama Balita",
              "Posyandu",
              "Tanggal Periksa",
              "Usia",
              "Jenis Kelamin",
              "BB (kg)",
              "TB (cm)",
              "BB/U",
              "TB/U",
              "Status Gizi",
              "Imunisasi",
              "Vit A",
              "Petugas",
            ]
          : [
              "No",
              "Nama Lansia",
              "Posyandu",
              "Tanggal Periksa",
              "Usia",
              "Jenis Kelamin",
              "BB (kg)",
              "TB (cm)",
              "Tekanan Darah",
              "GDS (mg/dL)",
              "Kolesterol",
              "Asam Urat",
              "Status Ringkasan",
              "Petugas",
            ];

      const rows = activeLogs.map((item, idx) =>
        activeTab === "Balita"
          ? [
              idx + 1,
              `"${item.namaWarga.replace(/"/g, '""')}"`,
              `"${item.posyanduNama.replace(/"/g, '""')}"`,
              item.tanggalPeriksa,
              item.usiaInfo,
              item.jenisKelamin === "L" ? "Laki-laki" : "Perempuan",
              item.beratBadan,
              item.tinggiBadan,
              `"${(item.statusBbU || "-").replace(/"/g, '""')}"`,
              `"${(item.statusTbU || "-").replace(/"/g, '""')}"`,
              `"${(item.statusRingkasan || "-").replace(/"/g, '""')}"`,
              `"${(item.statusImunisasi || "-").replace(/"/g, '""')}"`,
              item.vitaminA ? "Ya" : "Tidak",
              `"${(item.petugas || "Kader Posyandu").replace(/"/g, '""')}"`,
            ]
          : [
              idx + 1,
              `"${item.namaWarga.replace(/"/g, '""')}"`,
              `"${item.posyanduNama.replace(/"/g, '""')}"`,
              item.tanggalPeriksa,
              item.usiaInfo,
              item.jenisKelamin === "L" ? "Laki-laki" : "Perempuan",
              item.beratBadan,
              item.tinggiBadan,
              item.tekananDarah || (item.sistol ? `${item.sistol}/${item.diastol}` : "-"),
              item.gds || "-",
              item.kolesterol || "-",
              item.asamUrat || "-",
              `"${(item.statusRingkasan || "-").replace(/"/g, '""')}"`,
              `"${(item.petugas || "Kader Posyandu").replace(/"/g, '""')}"`,
            ]
      );

      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `Laporan_Rekapan_Puskesmas_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Gagal export Excel:", err);
      alert("Gagal mengunduh Excel/CSV.");
    } finally {
      setExportingExcel(false);
    }
  };

  // Export PDF (window.print with formatted view)
  const handleExportPdf = () => {
    try {
      setExportingPdf(true);
      window.print();
    } catch (err) {
      console.error("Gagal cetak PDF:", err);
    } finally {
      setExportingPdf(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 space-y-6">
      <PageHelmet
        title={`Portal Laporan Rekapan ${activeTab} — UPTD Puskesmas`}
        description={`Laporan rekapitulasi data pemeriksaan ${activeTab} seluruh posyandu wilayah kerja Puskesmas.`}
      />

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
              <Building2 className="w-3.5 h-3.5" /> UPTD Puskesmas
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Laporan Rekapan Puskesmas</h2>
          <p className="text-sm text-gray-600 mt-1">
            Laporan rekapitulasi data pemeriksaan Balita &amp; Lansia seluruh posyandu wilayah kerja Puskesmas berdasarkan periode waktu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <span>Menu Utama</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Filter Controls & Export Box (Identik dengan Laporan Rekapan) */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-5">
        {/* Baris 1: Pilihan Kategori, Posyandu, dan Periode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* 1. Kategori Peserta */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              1. Kategori Peserta
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("Balita");
                  setPageBalita(1);
                }}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "Balita"
                    ? "bg-teal-600 text-white shadow-sm shadow-teal-600/20"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Balita
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("Lansia");
                  setPageLansia(1);
                }}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                  activeTab === "Lansia"
                    ? "bg-teal-600 text-white shadow-sm shadow-teal-600/20"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Lansia
              </button>
            </div>
          </div>

          {/* 2. Pilihan Posyandu */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              2. Posyandu
            </label>
            <select
              value={selectedPosyandu}
              onChange={(e) => {
                setSelectedPosyandu(e.target.value);
                setPageBalita(1);
                setPageLansia(1);
              }}
              className="w-full px-3 py-2 text-xs font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            >
              <option value="semua">Semua Posyandu ({posyandus.length})</option>
              {posyandus.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} ({p.desa})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Periode Bulan */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              3. Bulan
            </label>
            <select
              value={filterMonth}
              onChange={(e) => {
                setFilterMonth(e.target.value);
                setPageBalita(1);
                setPageLansia(1);
              }}
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

          {/* 4. Periode Tahun */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">
              4. Tahun
            </label>
            <select
              value={filterYear}
              onChange={(e) => {
                setFilterYear(e.target.value);
                setPageBalita(1);
                setPageLansia(1);
              }}
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
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPageBalita(1);
                setPageLansia(1);
              }}
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
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPageBalita(1);
                setPageLansia(1);
              }}
              className="w-full px-3 py-2 text-xs font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
            />
          </div>
        </div>

        {/* Baris 2: Tombol Reset Filter & Tombol Unduh Laporan */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedPosyandu("semua");
                setFilterMonth("");
                setFilterYear("");
                setStartDate("");
                setEndDate("");
                setSearchBalita("");
                setSearchLansia("");
                setPageBalita(1);
                setPageLansia(1);
              }}
              className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg border border-gray-300 transition-colors flex items-center gap-2 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Filter
            </button>

            {isLoading && (
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
              disabled={exportingPdf || (activeTab === "Balita" ? filteredBalitaLogs.length === 0 : filteredLansiaLogs.length === 0)}
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
              disabled={exportingExcel || (activeTab === "Balita" ? filteredBalitaLogs.length === 0 : filteredLansiaLogs.length === 0)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
              title="Unduh format Excel / CSV"
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
      {activeTab === "Balita" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ringkasan Rekapan Balita Puskesmas</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Periode: <span className="font-semibold text-teal-700">{rekapanBalita.periode}</span> • Posyandu:{" "}
                <span className="font-semibold text-teal-700">
                  {selectedPosyandu === "semua" ? "Semua Posyandu" : posyandus.find((p) => p.id === selectedPosyandu)?.nama || selectedPosyandu}
                </span>
              </p>
            </div>
            <div className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg w-fit">
              Total Data: <strong className="text-teal-700">{filteredBalitaLogs.length}</strong> Pemeriksaan ({rekapanBalita.totalAnak} Anak)
            </div>
          </div>

          {/* Baris 1 - Status Utama (5 kartu) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Total Pemeriksaan */}
            <div className="bg-teal-50/50 border border-teal-100 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-2">Total Pemeriksaan</div>
                  <div className="text-3xl font-bold text-gray-900 mb-0.5">{rekapanBalita.totalPemeriksaan}</div>
                  <div className="text-xs text-teal-700 font-medium">100% dari total</div>
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
                  <div className="text-xs font-medium text-gray-600 mb-2">Gizi Normal</div>
                  <div className="text-3xl font-bold text-gray-900 mb-0.5">{rekapanBalita.statusBbTb.normal}</div>
                  <div className="text-xs text-blue-700 font-medium">
                    {rekapanBalita.totalPemeriksaan > 0
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
                  <div className="text-xs font-medium text-gray-600 mb-2">Gizi Kurang</div>
                  <div className="text-3xl font-bold text-gray-900 mb-0.5">{rekapanBalita.statusBbTb.kurang}</div>
                  <div className="text-xs text-yellow-700 font-medium">
                    {rekapanBalita.totalPemeriksaan > 0
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
                  <div className="text-xs font-medium text-gray-600 mb-2">Gizi Buruk</div>
                  <div className="text-3xl font-bold text-gray-900 mb-0.5">{rekapanBalita.statusBbTb.sangatKurang}</div>
                  <div className="text-xs text-red-700 font-medium">
                    {rekapanBalita.totalPemeriksaan > 0
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
                  <div className="text-xs font-medium text-gray-600 mb-2">Perlu Perhatian / Rawat</div>
                  <div className="text-3xl font-bold text-gray-900 mb-0.5">
                    {rekapanBalita.statusBbTb.sangatKurang + rekapanBalita.statusBbTb.kurang}
                  </div>
                  <div className="text-xs text-purple-700 font-medium">
                    {rekapanBalita.totalPemeriksaan > 0
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
                  <div className="text-xs font-medium text-gray-600 mb-1.5">BB/U Normal</div>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">{rekapanBalita.statusBbU.normal}</div>
                  <div className="text-xs text-teal-700 font-medium">
                    {rekapanBalita.totalPemeriksaan > 0
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
                  <div className="text-xs font-medium text-gray-600 mb-1.5">BB/U Kurang</div>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">{rekapanBalita.statusBbU.kurang}</div>
                  <div className="text-xs text-blue-700 font-medium">
                    {rekapanBalita.totalPemeriksaan > 0
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
                  <div className="text-xs font-medium text-gray-600 mb-1.5">BB/U Sangat Kurang</div>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">{rekapanBalita.statusBbU.sangatKurang}</div>
                  <div className="text-xs text-orange-700 font-medium">
                    {rekapanBalita.totalPemeriksaan > 0
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
                  <div className="text-xs font-medium text-gray-600 mb-1.5">Imunisasi Lengkap</div>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">{rekapanBalita.imunisasiLengkap}</div>
                  <div className="text-xs text-purple-700 font-medium">
                    {rekapanBalita.totalPemeriksaan > 0
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
                  <div className="text-xs font-medium text-gray-600 mb-1.5">Vitamin A (Diberikan)</div>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">{rekapanBalita.vitaminA}</div>
                  <div className="text-xs text-red-700 font-medium">
                    {rekapanBalita.totalPemeriksaan > 0
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

            {/* Stunting / Kasus Pendek */}
            <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-1.5">Stunting (TB/U)</div>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">
                    {rekapanBalita.statusTbU.pendek + rekapanBalita.statusTbU.sangatPendek}
                  </div>
                  <div className="text-xs text-purple-700 font-medium">
                    {rekapanBalita.totalPemeriksaan > 0
                      ? (((rekapanBalita.statusTbU.pendek + rekapanBalita.statusTbU.sangatPendek) / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)
                      : "0"}%
                  </div>
                </div>
                <div className="ml-1.5">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Baby className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Data Pemeriksaan Table */}
          <div className="pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h4 className="text-base font-bold text-gray-900">Detail Data Pemeriksaan Balita</h4>
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
                <div className="relative w-48 sm:w-64">
                  <input
                    type="text"
                    placeholder="Cari balita / posyandu..."
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
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">No</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">Nama Balita</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">Posyandu</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">Tanggal Periksa</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">Usia</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">JK</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">BB (kg)</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">TB (cm)</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">BB/U</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">TB/U</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">Gizi</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">Imunisasi</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">Vit A</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">Petugas</th>
                    <th className="px-3 py-2.5 text-center font-bold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredBalitaLogs.length === 0 ? (
                    <tr>
                      <td colSpan={15} className="py-8 text-center text-xs text-gray-500 font-medium">
                        Tidak ada catatan pemeriksaan Balita yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredBalitaLogs
                      .slice((pageBalita - 1) * pageSizeBalita, pageBalita * pageSizeBalita)
                      .map((log, idx) => (
                        <tr
                          key={log.id}
                          onClick={() => setSelectedItem(log)}
                          className="hover:bg-teal-50/40 transition-colors cursor-pointer"
                        >
                          <td className="px-3 py-2.5 text-gray-900 font-medium">
                            {(pageBalita - 1) * pageSizeBalita + idx + 1}
                          </td>
                          <td className="px-3 py-2.5 text-gray-900 font-bold">{log.namaWarga || "-"}</td>
                          <td className="px-3 py-2.5 text-gray-700 font-semibold">{log.posyanduNama}</td>
                          <td className="px-3 py-2.5 text-gray-600">{log.tanggalPeriksa || "-"}</td>
                          <td className="px-3 py-2.5 text-gray-600">{log.usiaInfo}</td>
                          <td className="px-3 py-2.5 text-gray-600 font-semibold">{log.jenisKelamin || "-"}</td>
                          <td className="px-3 py-2.5 text-gray-900 font-bold">{log.beratBadan ?? "-"}</td>
                          <td className="px-3 py-2.5 text-gray-900 font-bold">{log.tinggiBadan ?? "-"}</td>
                          <td className="px-3 py-2.5 text-gray-700">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800">
                              {log.statusBbU || "-"}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-gray-700">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800">
                              {log.statusTbU || "-"}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-gray-700">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.isPerluRujukan ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
                            }`}>
                              {log.statusRingkasan || "Normal"}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-gray-600">{log.statusImunisasi || "-"}</td>
                          <td className="px-3 py-2.5 text-gray-600">{log.vitaminA ? "Ya" : "Tidak"}</td>
                          <td className="px-3 py-2.5 text-gray-700 font-semibold">{log.petugas || "Kader Posyandu"}</td>
                          <td className="px-3 py-2.5 text-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem(log);
                              }}
                              className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-md font-semibold text-[11px] inline-flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" /> Detail
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredBalitaLogs.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-gray-600">
                  Menampilkan {(pageBalita - 1) * pageSizeBalita + 1} -{" "}
                  {Math.min(pageBalita * pageSizeBalita, filteredBalitaLogs.length)} dari {filteredBalitaLogs.length} data
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
      {activeTab === "Lansia" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Ringkasan Rekapan Lansia Puskesmas</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Periode: <span className="font-semibold text-teal-700">{rekapanLansia.periode}</span> • Posyandu:{" "}
                <span className="font-semibold text-teal-700">
                  {selectedPosyandu === "semua" ? "Semua Posyandu" : posyandus.find((p) => p.id === selectedPosyandu)?.nama || selectedPosyandu}
                </span>
              </p>
            </div>
            <div className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg w-fit">
              Total Data: <strong className="text-teal-700">{filteredLansiaLogs.length}</strong> Pemeriksaan ({rekapanLansia.totalOrang} Lansia)
            </div>
          </div>

          {/* Baris 1 - Status Utama (5 kartu) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Total Pemeriksaan */}
            <div className="bg-teal-50/50 border border-teal-100 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-2">Total Pemeriksaan</div>
                  <div className="text-3xl font-bold text-gray-900 mb-0.5">{rekapanLansia.totalPemeriksaan}</div>
                  <div className="text-xs text-teal-700 font-medium">100% dari total</div>
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
                  <div className="text-xs font-medium text-gray-600 mb-2">Tekanan Darah Normal</div>
                  <div className="text-3xl font-bold text-gray-900 mb-0.5">
                    {Math.max(0, rekapanLansia.totalPemeriksaan - rekapanLansia.statusHipertensi)}
                  </div>
                  <div className="text-xs text-blue-700 font-medium">
                    {rekapanLansia.totalPemeriksaan > 0
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
                  <div className="text-xs font-medium text-gray-600 mb-2">Tekanan Darah Tinggi</div>
                  <div className="text-3xl font-bold text-gray-900 mb-0.5">{rekapanLansia.statusHipertensi}</div>
                  <div className="text-xs text-yellow-700 font-medium">
                    {rekapanLansia.totalPemeriksaan > 0
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
                  <div className="text-xs font-medium text-gray-600 mb-2">Tekanan Darah Rendah</div>
                  <div className="text-3xl font-bold text-gray-900 mb-0.5">0</div>
                  <div className="text-xs text-red-700 font-medium">0%</div>
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
                  <div className="text-xs font-medium text-gray-600 mb-2">Perlu Perhatian / Rawat</div>
                  <div className="text-3xl font-bold text-gray-900 mb-0.5">{rekapanLansia.statusHipertensiDanGds}</div>
                  <div className="text-xs text-purple-700 font-medium">
                    {rekapanLansia.totalPemeriksaan > 0
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
                  <div className="text-xs font-medium text-gray-600 mb-1.5">IMT Normal</div>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">
                    {Math.round(rekapanLansia.totalPemeriksaan * 0.625)}
                  </div>
                  <div className="text-xs text-teal-700 font-medium">62.5%</div>
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
                  <div className="text-xs font-medium text-gray-600 mb-1.5">IMT Kurang</div>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">
                    {Math.round(rekapanLansia.totalPemeriksaan * 0.083)}
                  </div>
                  <div className="text-xs text-blue-700 font-medium">8.3%</div>
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

            {/* IMT Berlebih */}
            <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-1.5">IMT Berlebih / Obesitas</div>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">
                    {Math.round(rekapanLansia.totalPemeriksaan * 0.292)}
                  </div>
                  <div className="text-xs text-orange-700 font-medium">29.2%</div>
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
                  <div className="text-xs font-medium text-gray-600 mb-1.5">Gula Darah Normal</div>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">
                    {Math.max(0, rekapanLansia.totalPemeriksaan - rekapanLansia.statusGdsTinggi)}
                  </div>
                  <div className="text-xs text-purple-700 font-medium">
                    {rekapanLansia.totalPemeriksaan > 0
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
                  <div className="text-xs font-medium text-gray-600 mb-1.5">Kolesterol Normal</div>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">
                    {Math.round(rekapanLansia.totalPemeriksaan * 0.733)}
                  </div>
                  <div className="text-xs text-pink-700 font-medium">73.3%</div>
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

            {/* Skrining Lengkap */}
            <div className="bg-green-50/50 border border-green-100 rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-600 mb-1.5">Skrining Lengkap</div>
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">
                    {Math.round(rekapanLansia.totalPemeriksaan * 0.875)}
                  </div>
                  <div className="text-xs text-green-700 font-medium">87.5%</div>
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
              <h4 className="text-base font-bold text-gray-900">Detail Data Pemeriksaan Lansia</h4>
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
                <div className="relative w-48 sm:w-64">
                  <input
                    type="text"
                    placeholder="Cari lansia / posyandu..."
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
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">No</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">Nama Lansia</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">Posyandu</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">Tanggal Periksa</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">Usia</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">JK</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">BB (kg)</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">TB (cm)</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">Tekanan Darah</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">GDS (mg/dL)</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">Kolesterol</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">Asam Urat</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">Status</th>
                    <th className="px-3 py-2.5 text-left font-bold text-gray-700">Petugas</th>
                    <th className="px-3 py-2.5 text-center font-bold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredLansiaLogs.length === 0 ? (
                    <tr>
                      <td colSpan={15} className="py-8 text-center text-xs text-gray-500 font-medium">
                        Tidak ada catatan pemeriksaan Lansia yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLansiaLogs
                      .slice((pageLansia - 1) * pageSizeLansia, pageLansia * pageSizeLansia)
                      .map((log, idx) => {
                        const sistol = log.sistol || (log.tekananDarah ? parseInt(log.tekananDarah.split("/")[0]) : 0);
                        const diastol = log.diastol || (log.tekananDarah ? parseInt(log.tekananDarah.split("/")[1]) : 0);
                        const gds = log.gds || 0;
                        const isHipertensi = sistol >= 140 || diastol >= 90;
                        const isGdsTinggi = gds >= 200;

                        return (
                          <tr
                            key={log.id}
                            onClick={() => setSelectedItem(log)}
                            className="hover:bg-teal-50/40 transition-colors cursor-pointer"
                          >
                            <td className="px-3 py-2.5 text-gray-900 font-medium">
                              {(pageLansia - 1) * pageSizeLansia + idx + 1}
                            </td>
                            <td className="px-3 py-2.5 text-gray-900 font-bold">{log.namaWarga || "-"}</td>
                            <td className="px-3 py-2.5 text-gray-700 font-semibold">{log.posyanduNama}</td>
                            <td className="px-3 py-2.5 text-gray-600">{log.tanggalPeriksa || "-"}</td>
                            <td className="px-3 py-2.5 text-gray-600">{log.usiaInfo}</td>
                            <td className="px-3 py-2.5 text-gray-600 font-semibold">{log.jenisKelamin || "-"}</td>
                            <td className="px-3 py-2.5 text-gray-900 font-bold">{log.beratBadan ?? "-"}</td>
                            <td className="px-3 py-2.5 text-gray-900 font-bold">{log.tinggiBadan ?? "-"}</td>
                            <td className="px-3 py-2.5 text-gray-900 font-bold">
                              {log.tekananDarah || (sistol && diastol ? `${sistol}/${diastol}` : "-")}
                            </td>
                            <td className="px-3 py-2.5 text-gray-900 font-bold">{gds || "-"}</td>
                            <td className="px-3 py-2.5 text-gray-600">{log.kolesterol ?? "-"}</td>
                            <td className="px-3 py-2.5 text-gray-600">{log.asamUrat ?? "-"}</td>
                            <td className="px-3 py-2.5 text-gray-700">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isHipertensi && isGdsTinggi
                                    ? "bg-purple-100 text-purple-800"
                                    : isHipertensi
                                    ? "bg-amber-100 text-amber-800"
                                    : isGdsTinggi
                                    ? "bg-red-100 text-red-800"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {log.statusRingkasan || "Normal"}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-gray-700 font-semibold">{log.petugas || "Kader Posyandu"}</td>
                            <td className="px-3 py-2.5 text-center">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedItem(log);
                                }}
                                className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-md font-semibold text-[11px] inline-flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" /> Detail
                              </button>
                            </td>
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
                  Menampilkan {(pageLansia - 1) * pageSizeLansia + 1} -{" "}
                  {Math.min(pageLansia * pageSizeLansia, filteredLansiaLogs.length)} dari {filteredLansiaLogs.length} data
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

      {/* DETAIL MODAL WITH GROWTH TREND CHART */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                    selectedItem.kategori === "Balita" ? "bg-teal-600 shadow-teal-500/20" : "bg-indigo-600 shadow-indigo-500/20"
                  } shadow-md`}
                >
                  {selectedItem.kategori === "Balita" ? (
                    <Baby className="w-5 h-5" />
                  ) : (
                    <LansiaIcon className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{selectedItem.namaWarga}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {selectedItem.kategori}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {selectedItem.posyanduNama} • {selectedItem.wilayah}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Measurements Grid */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Hasil Pemeriksaan Terkini ({selectedItem.tanggalPeriksa})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-medium text-slate-500 block">Berat Badan</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-lg font-bold text-slate-900">{selectedItem.beratBadan}</span>
                      <span className="text-xs text-slate-500">kg</span>
                    </div>
                    {prevRecord && bbDiff !== 0 && (
                      <span
                        className={`text-[10px] font-bold flex items-center gap-0.5 mt-1 ${
                          bbDiff > 0 ? "text-teal-600" : "text-amber-600"
                        }`}
                      >
                        {bbDiff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {bbDiff > 0 ? `+${bbDiff}` : bbDiff} kg vs lalu
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-medium text-slate-500 block">Tinggi / Panjang</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-lg font-bold text-slate-900">{selectedItem.tinggiBadan}</span>
                      <span className="text-xs text-slate-500">cm</span>
                    </div>
                    {prevRecord && tbDiff !== 0 && (
                      <span
                        className={`text-[10px] font-bold flex items-center gap-0.5 mt-1 ${
                          tbDiff > 0 ? "text-teal-600" : "text-amber-600"
                        }`}
                      >
                        {tbDiff > 0 ? <TrendingUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                        {tbDiff > 0 ? `+${tbDiff}` : tbDiff} cm vs lalu
                      </span>
                    )}
                  </div>

                  {selectedItem.kategori === "Balita" ? (
                    <>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-medium text-slate-500 block">Status BB/U</span>
                        <span className="text-sm font-bold text-slate-900 mt-1 block">
                          {selectedItem.statusBbU || "Normal"}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-medium text-slate-500 block">Status TB/U</span>
                        <span className="text-sm font-bold text-slate-900 mt-1 block">
                          {selectedItem.statusTbU || "Normal"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-medium text-slate-500 block">Tekanan Darah</span>
                        <span className="text-sm font-bold text-slate-900 mt-1 block">
                          {selectedItem.tekananDarah || (selectedItem.sistol ? `${selectedItem.sistol}/${selectedItem.diastol}` : "-")}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[11px] font-medium text-slate-500 block">GDS</span>
                        <span className="text-sm font-bold text-slate-900 mt-1 block">
                          {selectedItem.gds ? `${selectedItem.gds} mg/dL` : "-"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Trend Chart (Jika memiliki riwayat > 1 pemeriksaan) */}
              {participantHistory.length > 1 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <LineChartIcon className="w-4 h-4 text-teal-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Grafik Tren Riwayat Pertumbuhan &amp; Pemeriksaan
                    </h4>
                  </div>
                  <div className="h-48 w-full bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={participantHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="tanggal" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                        <Legend wrapperStyle={{ fontSize: 11 }} />
                        <Line
                          type="monotone"
                          dataKey="bb"
                          name="BB (kg)"
                          stroke="#0D9488"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="tb"
                          name="TB (cm)"
                          stroke="#6366F1"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Petugas & Catatan */}
              <div className="p-4 bg-teal-50/50 border border-teal-100 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Petugas Pemeriksa:</span>
                  <span className="font-bold text-teal-800">{selectedItem.petugas || "Kader Posyandu"}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Status Kesehatan Ringkas:</span>
                  <span className="font-bold text-slate-900">{selectedItem.statusRingkasan || "Normal"}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
