"use client";

import { useState, useEffect } from "react";
import { formatTanggalIndonesia, formatTanggalInput } from "../../lib/dateUtils";
import Modal from "../../components/Modal";
import { riwayatApi, ItemRiwayat, balitaApi, lansiaApi } from "@/lib/api";
import {
  hitungStatusBbU,
  hitungStatusTbU,
  hitungStatusBbTb,
  convertStatusBbUToCode,
  convertStatusTbUToCode,
  convertStatusBbTbToCode,
} from "../../lib/zScoreCalculator";
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
  LineChart as LineChartIcon,
  Edit2,
  Trash2,
  Eye
} from "lucide-react";
import ActionMenu from "@/components/ActionMenu";
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

export default function RiwayatModule({ posyanduId }: RiwayatModuleProps) {
  const [logs, setLogs] = useState<ItemRiwayat[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"semua" | "Balita" | "Lansia">("semua");
  const [statusFilter, setStatusFilter] = useState<"semua" | "success" | "warning">("semua");

  // Tab mode: "tabel" vs "grafik" vs "rekapan"
  const [viewMode, setViewMode] = useState<"tabel" | "grafik" | "rekapan">("tabel");

  // Filter Periode untuk Rekapan
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");
  const [filterMonth, setFilterMonth] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());

  // Rekapan data
  const [rekapanBalita, setRekapanBalita] = useState<RekapanBalita | null>(null);
  const [rekapanLansia, setRekapanLansia] = useState<RekapanLansia | null>(null);
  const [rekapanLoading, setRekapanLoading] = useState(false);

  // Modal Edit & Delete State
  const [selectedLog, setSelectedLog] = useState<ItemRiwayat | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Form Fields - Balita
  const [bDate, setBDate] = useState("");
  const [bBB, setBBB] = useState("");
  const [bTB, setBTB] = useState("");
  const [bLK, setBLK] = useState("");
  const [bLiLA, setBLiLA] = useState("");
  const [bBBU, setBBBU] = useState<any>("Normal");
  const [bTBU, setBTBU] = useState<any>("Normal");
  const [bBBTB, setBBBTB] = useState<any>("Normal");
  const [bKms, setBKms] = useState("N (Naik)");
  const [bVitA, setBVitA] = useState(false);
  const [bAsi, setBAsi] = useState(false);
  const [bCacing, setBCacing] = useState(false);
  const [bImunisasi, setBImunisasi] = useState("");

  // Form Fields - Lansia
  const [lDate, setLDate] = useState("");
  const [lBB, setLBB] = useState("");
  const [lTB, setLTB] = useState("");
  const [lSistol, setLSistol] = useState("");
  const [lDiastol, setLDiastol] = useState("");
  const [lGds, setLGds] = useState("");
  const [lLp, setLLp] = useState("");
  const [lKol, setLKol] = useState("");
  const [lUrat, setLUrat] = useState("");
  const [lKeluhan, setLKeluhan] = useState("");
  const [lTindakan, setLTindakan] = useState("");

  // Open Edit Modal
  const openEditModal = (log: ItemRiwayat) => {
    setSelectedLog(log);
    setFormError("");
    if (log.tipe === "Balita") {
      setBDate(formatTanggalInput(log.tanggal));
      setBBB(log.beratBadan ? String(log.beratBadan) : "");
      setBTB(log.tinggiBadan ? String(log.tinggiBadan) : "");
      setBLK(log.lingkarKepala ? String(log.lingkarKepala) : "");
      setBLiLA(log.lingkarLengan ? String(log.lingkarLengan) : "");
      setBBBU((log.statusBbU as any) || "Normal");
      setBTBU((log.statusTbU as any) || "Normal");
      setBBBTB((log.statusBbTb as any) || "Normal");
      setBKms(log.statusKms || "N (Naik)");
      setBVitA(Boolean(log.vitaminA));
      setBAsi(Boolean(log.asiEksklusif));
      setBCacing(Boolean(log.obatCacing));
      setBImunisasi(log.statusImunisasi || "");
    } else {
      setLDate(formatTanggalInput(log.tanggal));
      setLBB(log.beratBadan ? String(log.beratBadan) : "");
      setLTB(log.tinggiBadan ? String(log.tinggiBadan) : "");
      setLSistol(log.tekananDarahSistol ? String(log.tekananDarahSistol) : "");
      setLDiastol(log.tekananDarahDiastol ? String(log.tekananDarahDiastol) : "");
      setLGds(log.gulaDarahSewaktu ? String(log.gulaDarahSewaktu) : "");
      setLLp(log.lingkarPerut ? String(log.lingkarPerut) : "");
      setLKol(log.kolesterol ? String(log.kolesterol) : "");
      setLUrat(log.asamUrat ? String(log.asamUrat) : "");
      setLKeluhan(log.keluhan || "");
      setLTindakan(log.tindakan || "");
    }
    setIsEditModalOpen(true);
  };

  // Open Delete Modal
  const openDeleteModal = (log: ItemRiwayat) => {
    setSelectedLog(log);
    setIsDeleteModalOpen(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLog) return;
    setFormError("");
    setSaving(true);
    try {
      if (selectedLog.tipe === "Balita") {
        const bb = parseFloat(bBB);
        const tb = parseFloat(bTB);
        if (isNaN(bb) || bb <= 0 || isNaN(tb) || tb <= 0) {
          setFormError("Berat Badan dan Tinggi Badan harus diisi angka positif yang valid.");
          setSaving(false);
          return;
        }
        const pasienId = selectedLog.pasienId || selectedLog.id;
        await balitaApi.updatePemeriksaan(posyanduId, pasienId, selectedLog.id, {
          tanggalPeriksa: bDate,
          beratBadan: bb,
          tinggiBadan: tb,
          lingkarKepala: bLK ? parseFloat(bLK) : undefined,
          lingkarLengan: bLiLA ? parseFloat(bLiLA) : undefined,
          statusBbU: convertStatusBbUToCode(bBBU),
          statusTbU: convertStatusTbUToCode(bTBU),
          statusBbTb: convertStatusBbTbToCode(bBBTB),
          statusKms: bKms,
          vitaminA: bVitA,
          asiEksklusif: bAsi,
          obatCacing: bCacing,
          statusImunisasi: bImunisasi || undefined,
        } as any);
      } else {
        const bb = parseFloat(lBB);
        const tb = parseFloat(lTB);
        const sistol = parseInt(lSistol);
        const diastol = parseInt(lDiastol);
        const gds = parseFloat(lGds);
        const lp = parseFloat(lLp);
        if (isNaN(bb) || bb <= 0 || isNaN(tb) || tb <= 0 || isNaN(sistol) || isNaN(diastol) || isNaN(gds) || isNaN(lp)) {
          setFormError("Mohon isi semua data pemeriksaan lansia dengan angka positif yang valid.");
          setSaving(false);
          return;
        }
        const pasienId = selectedLog.pasienId || selectedLog.id;
        await lansiaApi.updatePemeriksaan(posyanduId, pasienId, selectedLog.id, {
          tanggalPeriksa: lDate,
          beratBadan: bb,
          tinggiBadan: tb,
          tekananDarahSistol: sistol,
          tekananDarahDiastol: diastol,
          gulaDarahSewaktu: gds,
          lingkarPerut: lp,
          kolesterol: lKol ? parseFloat(lKol) : undefined,
          asamUrat: lUrat ? parseFloat(lUrat) : undefined,
          keluhan: lKeluhan || undefined,
          tindakan: lTindakan || undefined,
        } as any);
      }
      fetchRiwayat();
      window.dispatchEvent(new Event("pemeriksaanSaved"));
      setIsEditModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "Gagal mengedit data pemeriksaan.");
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete Submit
  const handleDeleteSubmit = async () => {
    if (!selectedLog) return;
    setSaving(true);
    try {
      const pasienId = selectedLog.pasienId || selectedLog.id;
      if (selectedLog.tipe === "Balita") {
        await balitaApi.deletePemeriksaan(posyanduId, pasienId, selectedLog.id);
      } else {
        await lansiaApi.deletePemeriksaan(posyanduId, pasienId, selectedLog.id);
      }
      fetchRiwayat();
      window.dispatchEvent(new Event("pemeriksaanSaved"));
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Gagal menghapus riwayat periksa.");
    } finally {
      setSaving(false);
    }
  };

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

  // Handler Export PDF
  const handleExportPdf = async () => {
    try {
      setExportingPdf(true);
      await riwayatApi.downloadPdf(posyanduId, {
        tipe: typeFilter,
        search: query,
        status: statusFilter,
      });
    } catch (err) {
      console.error("Gagal export PDF:", err);
    } finally {
      setExportingPdf(false);
    }
  };

  // Hitung Rekapan Balita & Lansia berdasarkan filter
  const calculateRekapan = () => {
    setRekapanLoading(true);

    const balitaLogs = logs.filter((l) => l.tipe === "Balita");
    const lansiaLogs = logs.filter((l) => l.tipe === "Lansia");

    // BALITA REKAPAN
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

    // LANSIA REKAPAN
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

    setRekapanLoading(false);
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-saas-dark tracking-tight">Riwayat Pemeriksaan Bulanan</h2>
          <p className="text-xs sm:text-sm text-saas-muted mt-0.5">
            Data terpadu perkembangan kesehatan Balita & Lansia beserta statistik grafik bulanan.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          {/* Switch Mode Tabel / Grafik / Rekapan */}
          <div className="bg-gray-100 p-1 rounded-xl flex gap-1 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setViewMode("tabel")}
              className={`flex-1 sm:flex-none justify-center px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === "tabel"
                  ? "bg-white text-saas-dark shadow-sm"
                  : "text-saas-muted hover:text-saas-dark"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" /> Tabel Riwayat
            </button>
            <button
              onClick={() => setViewMode("grafik")}
              className={`flex-1 sm:flex-none justify-center px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === "grafik"
                  ? "bg-white text-saas-dark shadow-sm"
                  : "text-saas-muted hover:text-saas-dark"
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5 shrink-0" /> Grafik Trend
            </button>
            <button
              onClick={() => {
                setViewMode("rekapan");
                calculateRekapan();
              }}
              className={`flex-1 sm:flex-none justify-center px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                viewMode === "rekapan"
                  ? "bg-white text-saas-dark shadow-sm"
                  : "text-saas-muted hover:text-saas-dark"
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5 shrink-0" /> Laporan Rekapan
            </button>
          </div>

          <button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-input shadow-md shadow-red-600/10 transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {exportingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            ) : (
              <Download className="w-4 h-4 shrink-0" />
            )}
            Cetak PDF (.pdf)
          </button>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2.5 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-all disabled:opacity-50 whitespace-nowrap"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            ) : (
              <Download className="w-4 h-4 shrink-0" />
            )}
            Export Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white p-4 sm:p-6 rounded-card border border-gray-100/50 shadow-soft-card space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full lg:w-80">
            <input
              type="text"
              placeholder="Cari nama warga atau parameter..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 border border-gray-100 rounded-input text-sm text-saas-dark placeholder-saas-muted/70 focus:outline-none focus:border-saas-primary/50 focus:bg-white transition-all"
            />
            <Search className="absolute left-3.5 top-3 text-saas-muted/80 w-4 h-4" />
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4">
            {/* Tipe filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-saas-muted shrink-0">Kategori:</span>
              <div className="flex gap-1 w-full sm:w-auto overflow-x-auto pb-0.5">
                {(["semua", "Balita", "Lansia"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap shrink-0 ${
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-saas-muted shrink-0">Kondisi Hasil:</span>
              <div className="flex gap-1 w-full sm:w-auto overflow-x-auto pb-0.5">
                {[
                  { label: "Semua", val: "semua" },
                  { label: "Normal / Sehat", val: "success" },
                  { label: "Perlu Perhatian / Rawan", val: "warning" },
                ].map((s) => (
                  <button
                    key={s.val}
                    onClick={() => setStatusFilter(s.val as any)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap shrink-0 ${
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

      {/* VIEW: LAPORAN REKAPAN */}
      {viewMode === "rekapan" && (
        <div className="space-y-6">
          {/* Filter Periode Card */}
          <div className="bg-white p-4 sm:p-6 rounded-card border border-gray-100/50 shadow-soft-card space-y-4">
            <h3 className="text-base font-bold text-saas-dark">Filter Periode Laporan Rekapan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Tahun */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted uppercase">Tahun</label>
                <input
                  type="number"
                  min="2020"
                  max={new Date().getFullYear()}
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                />
              </div>

              {/* Bulan (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted uppercase">Bulan (Opsional)</label>
                <select
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                >
                  <option value="">Semua Bulan</option>
                  <option value="01">Januari</option>
                  <option value="02">Februari</option>
                  <option value="03">Maret</option>
                  <option value="04">April</option>
                  <option value="05">Mei</option>
                  <option value="06">Juni</option>
                  <option value="07">Juli</option>
                  <option value="08">Agustus</option>
                  <option value="09">September</option>
                  <option value="10">Oktober</option>
                  <option value="11">November</option>
                  <option value="12">Desember</option>
                </select>
              </div>

              {/* Tanggal Mulai */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted uppercase">Dari Tanggal (Opsional)</label>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                />
              </div>

              {/* Tanggal Akhir */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted uppercase">Sampai Tanggal (Opsional)</label>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
              <button
                onClick={calculateRekapan}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-all"
              >
                <LineChartIcon className="w-4 h-4" />
                Hitung Rekapan
              </button>
              <button
                onClick={async () => {
                  try {
                    setExportingPdf(true);
                    const bulan = filterMonth ? filterMonth : undefined;
                    await riwayatApi.downloadPdf(posyanduId, {
                      tipe: "semua",
                      bulan,
                      tahun: filterYear,
                    });
                  } catch (err) {
                    console.error("Gagal export PDF rekapan:", err);
                  } finally {
                    setExportingPdf(false);
                  }
                }}
                disabled={exportingPdf}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-input shadow-md shadow-red-600/10 transition-all disabled:opacity-50"
              >
                {exportingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Cetak Laporan PDF
              </button>
            </div>
          </div>

          {/* Rekapan Balita */}
          {rekapanLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-saas-primary animate-spin" />
            </div>
          ) : rekapanBalita ? (
            <div className="bg-white p-4 sm:p-6 rounded-card border border-gray-100/50 shadow-soft-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-saas-dark flex items-center gap-2">
                    <Baby className="w-5 h-5 text-saas-primary" />
                    Rekapan Data Balita - Periode {rekapanBalita.periode}
                  </h3>
                  <p className="text-xs text-saas-muted mt-0.5">
                    Ringkasan status gizi dan pelayanan imunisasi balita.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl">
                  <p className="text-xs text-saas-muted font-bold">Total Pemeriksaan</p>
                  <p className="text-2xl font-bold text-saas-primary">{rekapanBalita.totalPemeriksaan}</p>
                  <p className="text-[10px] text-saas-muted mt-1">{rekapanBalita.totalAnak} anak unik</p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-xs text-saas-muted font-bold">BB/U Normal</p>
                  <p className="text-2xl font-bold text-blue-600">{rekapanBalita.statusBbU.normal}</p>
                  <p className="text-[10px] text-saas-muted mt-1">
                    {((rekapanBalita.statusBbU.normal / rekapanBalita.totalPemeriksaan) * 100).toFixed(0)}%
                  </p>
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
                  <p className="text-xs text-saas-muted font-bold">BB Kurang</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {rekapanBalita.statusBbU.kurang + rekapanBalita.statusBbU.sangatKurang}
                  </p>
                  <p className="text-[10px] text-saas-muted mt-1">
                    {(
                      ((rekapanBalita.statusBbU.kurang + rekapanBalita.statusBbU.sangatKurang) /
                        rekapanBalita.totalPemeriksaan) *
                      100
                    ).toFixed(0)}
                    %
                  </p>
                </div>

                <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-xs text-saas-muted font-bold">Gizi Buruk</p>
                  <p className="text-2xl font-bold text-red-600">{rekapanBalita.statusBbTb.sangatKurang}</p>
                  <p className="text-[10px] text-saas-muted mt-1">
                    {((rekapanBalita.statusBbTb.sangatKurang / rekapanBalita.totalPemeriksaan) * 100).toFixed(0)}%
                  </p>
                </div>

                <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
                  <p className="text-xs text-saas-muted font-bold">Vitamin A</p>
                  <p className="text-2xl font-bold text-green-600">{rekapanBalita.vitaminA}</p>
                  <p className="text-[10px] text-saas-muted mt-1">
                    {((rekapanBalita.vitaminA / rekapanBalita.totalPemeriksaan) * 100).toFixed(0)}%
                  </p>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
                  <p className="text-xs text-saas-muted font-bold">ASI Eksklusif</p>
                  <p className="text-2xl font-bold text-purple-600">{rekapanBalita.asiEksklusif}</p>
                  <p className="text-[10px] text-saas-muted mt-1">
                    {((rekapanBalita.asiEksklusif / rekapanBalita.totalPemeriksaan) * 100).toFixed(0)}%
                  </p>
                </div>

                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <p className="text-xs text-saas-muted font-bold">Imunisasi Lengkap</p>
                  <p className="text-2xl font-bold text-indigo-600">{rekapanBalita.imunisasiLengkap}</p>
                  <p className="text-[10px] text-saas-muted mt-1">
                    {((rekapanBalita.imunisasiLengkap / rekapanBalita.totalPemeriksaan) * 100).toFixed(0)}%
                  </p>
                </div>

                <div className="p-3 bg-pink-50 border border-pink-100 rounded-xl">
                  <p className="text-xs text-saas-muted font-bold">TB/U Normal</p>
                  <p className="text-2xl font-bold text-pink-600">{rekapanBalita.statusTbU.normal}</p>
                  <p className="text-[10px] text-saas-muted mt-1">
                    {((rekapanBalita.statusTbU.normal / rekapanBalita.totalPemeriksaan) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Detail Table for Balita */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-saas-dark mb-3">Ringkasan Status Gizi Balita</h4>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs font-bold text-saas-muted uppercase">
                        <th className="pb-2 px-2">Kategori Status</th>
                        <th className="pb-2 px-2 text-center">Jumlah</th>
                        <th className="pb-2 px-2 text-center">Persentase</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 px-2 font-bold text-saas-dark">BB/U - Normal</td>
                        <td className="py-2 px-2 text-center">{rekapanBalita.statusBbU.normal}</td>
                        <td className="py-2 px-2 text-center font-bold text-blue-600">
                          {((rekapanBalita.statusBbU.normal / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)}%
                        </td>
                      </tr>
                      <tr className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 px-2 font-bold text-saas-dark">BB/U - Kurang</td>
                        <td className="py-2 px-2 text-center">{rekapanBalita.statusBbU.kurang}</td>
                        <td className="py-2 px-2 text-center font-bold text-yellow-600">
                          {((rekapanBalita.statusBbU.kurang / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)}%
                        </td>
                      </tr>
                      <tr className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 px-2 font-bold text-saas-dark">BB/U - Sangat Kurang</td>
                        <td className="py-2 px-2 text-center">{rekapanBalita.statusBbU.sangatKurang}</td>
                        <td className="py-2 px-2 text-center font-bold text-orange-600">
                          {((rekapanBalita.statusBbU.sangatKurang / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)}%
                        </td>
                      </tr>
                      <tr className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 px-2 font-bold text-saas-dark">BB/U - Lebih / Obesitas</td>
                        <td className="py-2 px-2 text-center">{rekapanBalita.statusBbU.lebih}</td>
                        <td className="py-2 px-2 text-center font-bold text-red-600">
                          {((rekapanBalita.statusBbU.lebih / rekapanBalita.totalPemeriksaan) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}

          {/* Rekapan Lansia */}
          {rekapanLoading ? null : rekapanLansia ? (
            <div className="bg-white p-4 sm:p-6 rounded-card border border-gray-100/50 shadow-soft-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-saas-dark flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Rekapan Data Lansia - Periode {rekapanLansia.periode}
                  </h3>
                  <p className="text-xs text-saas-muted mt-0.5">
                    Ringkasan status kesehatan lansia dengan fokus Hipertensi & Diabetes.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-xs text-saas-muted font-bold">Total Pemeriksaan</p>
                  <p className="text-2xl font-bold text-red-600">{rekapanLansia.totalPemeriksaan}</p>
                  <p className="text-[10px] text-saas-muted mt-1">{rekapanLansia.totalOrang} orang unik</p>
                </div>

                <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
                  <p className="text-xs text-saas-muted font-bold">Sehat & Normal</p>
                  <p className="text-2xl font-bold text-green-600">
                    {
                      rekapanLansia.totalPemeriksaan -
                      rekapanLansia.statusHipertensi -
                      rekapanLansia.statusGdsTinggi +
                      rekapanLansia.statusHipertensiDanGds
                    }
                  </p>
                  <p className="text-[10px] text-saas-muted mt-1">
                    {(
                      (
                        (rekapanLansia.totalPemeriksaan -
                          rekapanLansia.statusHipertensi -
                          rekapanLansia.statusGdsTinggi +
                          rekapanLansia.statusHipertensiDanGds) /
                        rekapanLansia.totalPemeriksaan
                      ) *
                      100
                    ).toFixed(0)}
                    %
                  </p>
                </div>

                <div className="p-3 bg-orange-50 border border-orange-100 rounded-xl">
                  <p className="text-xs text-saas-muted font-bold">Hipertensi</p>
                  <p className="text-2xl font-bold text-orange-600">{rekapanLansia.statusHipertensi}</p>
                  <p className="text-[10px] text-saas-muted mt-1">
                    {((rekapanLansia.statusHipertensi / rekapanLansia.totalPemeriksaan) * 100).toFixed(0)}%
                  </p>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
                  <p className="text-xs text-saas-muted font-bold">GDS Tinggi</p>
                  <p className="text-2xl font-bold text-purple-600">{rekapanLansia.statusGdsTinggi}</p>
                  <p className="text-[10px] text-saas-muted mt-1">
                    {((rekapanLansia.statusGdsTinggi / rekapanLansia.totalPemeriksaan) * 100).toFixed(0)}%
                  </p>
                </div>

                <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                  <p className="text-xs text-saas-muted font-bold">Hipertensi & GDS</p>
                  <p className="text-2xl font-bold text-red-700">{rekapanLansia.statusHipertensiDanGds}</p>
                  <p className="text-[10px] text-saas-muted mt-1">
                    {((rekapanLansia.statusHipertensiDanGds / rekapanLansia.totalPemeriksaan) * 100).toFixed(0)}%
                  </p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <p className="text-xs text-saas-muted font-bold">Rata-rata BB</p>
                  <p className="text-2xl font-bold text-blue-600">{rekapanLansia.rataRataBb.toFixed(1)}</p>
                  <p className="text-[10px] text-saas-muted mt-1">kg</p>
                </div>

                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <p className="text-xs text-saas-muted font-bold">Rata-rata TB</p>
                  <p className="text-2xl font-bold text-indigo-600">{rekapanLansia.rataRataTb.toFixed(1)}</p>
                  <p className="text-[10px] text-saas-muted mt-1">cm</p>
                </div>

                <div className="p-3 bg-pink-50 border border-pink-100 rounded-xl">
                  <p className="text-xs text-saas-muted font-bold">Rata-rata GDS</p>
                  <p className="text-2xl font-bold text-pink-600">{rekapanLansia.rataRataGds.toFixed(0)}</p>
                  <p className="text-[10px] text-saas-muted mt-1">mg/dL</p>
                </div>
              </div>

              {/* Detail Table for Lansia */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-saas-dark mb-3">Ringkasan Status Kesehatan Lansia</h4>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs font-bold text-saas-muted uppercase">
                        <th className="pb-2 px-2">Indikator Kesehatan</th>
                        <th className="pb-2 px-2 text-center">Kasus</th>
                        <th className="pb-2 px-2 text-center">Persentase</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 px-2 font-bold text-saas-dark">Sehat & Normal</td>
                        <td className="py-2 px-2 text-center">
                          {
                            rekapanLansia.totalPemeriksaan -
                            rekapanLansia.statusHipertensi -
                            rekapanLansia.statusGdsTinggi +
                            rekapanLansia.statusHipertensiDanGds
                          }
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-green-600">
                          {(
                            (
                              (rekapanLansia.totalPemeriksaan -
                                rekapanLansia.statusHipertensi -
                                rekapanLansia.statusGdsTinggi +
                                rekapanLansia.statusHipertensiDanGds) /
                              rekapanLansia.totalPemeriksaan
                            ) *
                            100
                          ).toFixed(1)}
                          %
                        </td>
                      </tr>
                      <tr className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 px-2 font-bold text-saas-dark">Hipertensi Saja</td>
                        <td className="py-2 px-2 text-center">
                          {rekapanLansia.statusHipertensi - rekapanLansia.statusHipertensiDanGds}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-orange-600">
                          {(
                            ((rekapanLansia.statusHipertensi - rekapanLansia.statusHipertensiDanGds) /
                              rekapanLansia.totalPemeriksaan) *
                            100
                          ).toFixed(1)}
                          %
                        </td>
                      </tr>
                      <tr className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 px-2 font-bold text-saas-dark">GDS Tinggi Saja</td>
                        <td className="py-2 px-2 text-center">
                          {rekapanLansia.statusGdsTinggi - rekapanLansia.statusHipertensiDanGds}
                        </td>
                        <td className="py-2 px-2 text-center font-bold text-purple-600">
                          {(
                            ((rekapanLansia.statusGdsTinggi - rekapanLansia.statusHipertensiDanGds) /
                              rekapanLansia.totalPemeriksaan) *
                            100
                          ).toFixed(1)}
                          %
                        </td>
                      </tr>
                      <tr className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 px-2 font-bold text-saas-dark">Hipertensi & GDS Tinggi</td>
                        <td className="py-2 px-2 text-center">{rekapanLansia.statusHipertensiDanGds}</td>
                        <td className="py-2 px-2 text-center font-bold text-red-700">
                          {((rekapanLansia.statusHipertensiDanGds / rekapanLansia.totalPemeriksaan) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rata-rata Vital Signs */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-saas-dark mb-3">Rata-rata Parameter Vital</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                    <p className="text-xs text-saas-muted font-bold">Berat Badan Rata-rata</p>
                    <p className="text-xl font-bold text-saas-dark">{rekapanLansia.rataRataBb.toFixed(2)} kg</p>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                    <p className="text-xs text-saas-muted font-bold">Tinggi Badan Rata-rata</p>
                    <p className="text-xl font-bold text-saas-dark">{rekapanLansia.rataRataTb.toFixed(2)} cm</p>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                    <p className="text-xs text-saas-muted font-bold">Sistol Rata-rata</p>
                    <p className="text-xl font-bold text-saas-dark">{rekapanLansia.rataRataSistol.toFixed(0)} mmHg</p>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                    <p className="text-xs text-saas-muted font-bold">Diastol Rata-rata</p>
                    <p className="text-xl font-bold text-saas-dark">{rekapanLansia.rataRataDiastol.toFixed(0)} mmHg</p>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg col-span-2 sm:col-span-1">
                    <p className="text-xs text-saas-muted font-bold">GDS Rata-rata</p>
                    <p className="text-xl font-bold text-saas-dark">{rekapanLansia.rataRataGds.toFixed(2)} mg/dL</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {!rekapanBalita && !rekapanLansia && !rekapanLoading && (
            <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-12 text-center">
              <p className="text-sm text-saas-muted font-medium">Klik "Hitung Rekapan" untuk melihat ringkasan data pemeriksaan.</p>
            </div>
          )}
        </div>
      )}

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
        <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-4 sm:p-6 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Loader2 className="w-7 h-7 text-saas-primary animate-spin" />
              <p className="text-xs text-saas-muted font-medium">Memuat data riwayat...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold text-saas-muted uppercase tracking-wider">
                    <th className="pb-3 px-3 whitespace-nowrap">Tanggal Periksa</th>
                    <th className="pb-3 px-3 whitespace-nowrap">Nama Lengkap</th>
                    <th className="pb-3 px-3 whitespace-nowrap">Kategori</th>
                    <th className="pb-3 px-3 whitespace-nowrap">Parameter Fisik & Medis</th>
                    <th className="pb-3 px-3 whitespace-nowrap">Kondisi Hasil</th>
                    <th className="pb-3 px-3 whitespace-nowrap">Petugas</th>
                    <th className="pb-3 px-3 text-right whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40 transition-colors text-sm"
                      >
                        <td className="py-4 px-3 font-bold text-saas-dark whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-saas-muted shrink-0" />
                            {formatTanggalIndonesia(log.tanggal)}
                          </div>
                        </td>
                        <td className="py-4 px-3 font-bold text-saas-dark whitespace-nowrap">{log.nama}</td>
                        <td className="py-4 px-3 font-semibold text-saas-muted whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {log.tipe === "Balita" ? (
                              <Baby className="w-3.5 h-3.5 text-saas-primary shrink-0" />
                            ) : (
                              <Heart className="w-3.5 h-3.5 text-red-500 shrink-0" />
                            )}
                            {log.tipe}
                          </div>
                        </td>
                        <td className="py-4 px-3 text-xs font-semibold text-saas-dark/95 leading-normal max-w-xs truncate whitespace-nowrap">
                          {log.parameter}
                        </td>
                        <td className="py-4 px-3 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                              log.statusType === "success"
                                ? "bg-trend-successBg text-trend-successText"
                                : log.statusType === "warning"
                                ? "bg-trend-dangerBg text-trend-dangerText"
                                : "bg-blue-50 text-saas-primary"
                            }`}
                          >
                            {log.statusType === "success" && <CheckCircle2 className="w-3 h-3 shrink-0" />}
                            {log.statusType === "warning" && <AlertCircle className="w-3 h-3 shrink-0" />}
                            {log.statusType === "info" && <Clock className="w-3 h-3 shrink-0" />}
                            {log.status}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-xs text-saas-muted font-bold whitespace-nowrap">{log.petugas}</td>
                        <td className="py-4 px-3 text-right whitespace-nowrap">
                          <ActionMenu
                            items={[
                              {
                                label: "Lihat Detail",
                                icon: <Eye className="w-4 h-4" />,
                                onClick: () => {
                                  openEditModal(log);
                                }
                              },
                              {
                                label: "Edit",
                                icon: <Edit2 className="w-4 h-4" />,
                                onClick: () => openEditModal(log)
                              },
                              {
                                label: "Hapus",
                                icon: <Trash2 className="w-4 h-4" />,
                                variant: "danger",
                                onClick: () => openDeleteModal(log)
                              }
                            ]}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-saas-muted font-medium whitespace-nowrap">
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

      {/* MODAL EDIT PEMERIKSAAN (BALITA / LANSIA) */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Riwayat Periksa - ${selectedLog?.nama || ""}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 text-trend-dangerText border border-red-100 rounded-lg text-xs font-bold flex gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
            </div>
          )}

          {selectedLog?.tipe === "Balita" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-saas-muted">Tanggal Periksa</label>
                  <input
                    type="date"
                    required
                    value={bDate}
                    onChange={(e) => setBDate(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-saas-muted">Berat Badan (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={bBB}
                    onChange={(e) => setBBB(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-saas-muted">Tinggi Badan (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={bTB}
                    onChange={(e) => setBTB(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-saas-muted">Lingkar Kepala (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bLK}
                    onChange={(e) => setBLK(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-saas-muted">LiLA (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bLiLA}
                    onChange={(e) => setBLiLA(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <label className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-150 rounded text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bVitA}
                    onChange={(e) => setBVitA(e.target.checked)}
                    className="w-4 h-4 text-saas-primary rounded"
                  />
                  Vitamin A
                </label>
                <label className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-150 rounded text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bAsi}
                    onChange={(e) => setBAsi(e.target.checked)}
                    className="w-4 h-4 text-saas-primary rounded"
                  />
                  ASI Eksklusif
                </label>
                <label className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-150 rounded text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bCacing}
                    onChange={(e) => setBCacing(e.target.checked)}
                    className="w-4 h-4 text-saas-primary rounded"
                  />
                  Obat Cacing
                </label>
                <div>
                  <input
                    type="text"
                    placeholder="Imunisasi..."
                    value={bImunisasi}
                    onChange={(e) => setBImunisasi(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-saas-muted">Tanggal Periksa</label>
                  <input
                    type="date"
                    required
                    value={lDate}
                    onChange={(e) => setLDate(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-saas-muted">Berat Badan (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={lBB}
                    onChange={(e) => setLBB(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-saas-muted">Tinggi Badan (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={lTB}
                    onChange={(e) => setLTB(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-saas-muted">Sistol (mmHg)</label>
                  <input
                    type="number"
                    required
                    value={lSistol}
                    onChange={(e) => setLSistol(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-saas-muted">Diastol (mmHg)</label>
                  <input
                    type="number"
                    required
                    value={lDiastol}
                    onChange={(e) => setLDiastol(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-saas-muted">GDS (mg/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={lGds}
                    onChange={(e) => setLGds(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-saas-muted">Lingkar Perut (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={lLp}
                    onChange={(e) => setLLp(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-saas-muted">Kolesterol (mg/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={lKol}
                    onChange={(e) => setLKol(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-saas-muted">Asam Urat (mg/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={lUrat}
                    onChange={(e) => setLUrat(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-saas-muted">Keluhan</label>
                  <textarea
                    rows={2}
                    value={lKeluhan}
                    onChange={(e) => setLKeluhan(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-saas-muted">Tindakan</label>
                  <textarea
                    rows={2}
                    value={lTindakan}
                    onChange={(e) => setLTindakan(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border border-hairline rounded-pill text-xs font-semibold text-saas-dark hover:bg-surface-soft"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-saas-primary text-white rounded-pill text-xs font-semibold hover:bg-saas-primary-active disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL KONFIRMASI HAPUS PEMERIKSAAN */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Record Riwayat Periksa"
      >
        <div className="space-y-4">
          <p className="text-sm text-saas-dark font-medium">
            Apakah Anda yakin ingin menghapus catatan riwayat pemeriksaan untuk{" "}
            <span className="font-bold text-trend-dangerText">{selectedLog?.nama}</span>?
          </p>
          <p className="text-xs text-saas-muted">
            Catatan pemeriksaan ini akan terhapus secara permanen dari sistem Posyandu.
          </p>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-hairline rounded-pill text-xs font-semibold text-saas-dark hover:bg-surface-soft"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDeleteSubmit}
              disabled={saving}
              className="px-4 py-2 bg-trend-dangerText text-white rounded-pill text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? "Menghapus..." : "Ya, Hapus Record"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
