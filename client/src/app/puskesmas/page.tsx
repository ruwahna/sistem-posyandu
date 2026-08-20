"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Buildings,
  ShieldCheck,
  MagnifyingGlass,
  Funnel,
  Baby,
  Heartbeat,
  WarningCircle,
  FileCsv,
  FilePdf,
  CaretRight,
  CaretLeft,
  CaretDoubleLeft,
  CaretDoubleRight,
  CircleNotch,
  Info,
  X,
  Hospital,
  Sparkle,
  SquaresFour,
  Drop,
  Scales,
  Eye
} from "@phosphor-icons/react";
import PageHelmet from "../../components/PageHelmet";
import LansiaIcon from "../../components/LansiaIcon";
import { Skeleton, PuskesmasTableSkeleton } from "../../components/Skeleton";
import { publicPuskesmasApi, PublicPemeriksaanItem, PublicPosyanduInfo } from "../../lib/api";
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
import {
  TrendingUp,
  TrendingDown,
  Minus,
  LineChart as LineChartIcon
} from "lucide-react";

export default function PuskesmasPublicPage() {
  const [data, setData] = useState<PublicPemeriksaanItem[]>([]);
  const [posyandus, setPosyandus] = useState<PublicPosyanduInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Tab State: "Balita" | "Lansia"
  const [activeTab, setActiveTab] = useState<"Balita" | "Lansia">("Balita");

  // Search & Filter state
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [selectedPosyandu, setSelectedPosyandu] = useState<string>("semua");
  const [selectedStatus, setSelectedStatus] = useState<string>("semua");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Quick Preset State
  const [activePreset, setActivePreset] = useState<string>("semua");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

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

    // Map into friendly format for charts
    return items.map((item) => ({
      ...item,
      tanggal: item.tanggalPeriksa,
      bb: item.beratBadan,
      tb: item.tinggiBadan,
      sistol: item.sistol || (item.tekananDarah ? parseInt(item.tekananDarah.split('/')[0]) : undefined),
      diastol: item.diastol || (item.tekananDarah ? parseInt(item.tekananDarah.split('/')[1]) : undefined),
      gds: item.gds,
    }));
  }, [selectedItem, data]);

  const prevRecord = participantHistory.length > 1 ? participantHistory[participantHistory.length - 2] : null;
  const bbDiff = prevRecord && selectedItem ? Number((selectedItem.beratBadan - prevRecord.beratBadan).toFixed(2)) : 0;
  const tbDiff = prevRecord && selectedItem ? Number((selectedItem.tinggiBadan - prevRecord.tinggiBadan).toFixed(1)) : 0;

  // Handle Escape key and overflow prevention when modal is open
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

  // Debounce search after-typing (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [posList, records] = await Promise.all([
        publicPuskesmasApi.getPosyandus(),
        publicPuskesmasApi.getPemeriksaanData({
          posyanduId: selectedPosyandu,
          kategori: activeTab,
          status: selectedStatus,
          search: debouncedSearch,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        })
      ]);
      setPosyandus(posList);
      setData(records);
    } catch (err) {
      console.error("Gagal memuat data publik puskesmas:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, selectedPosyandu, selectedStatus, startDate, endDate, debouncedSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedPosyandu("semua");
    setSelectedStatus("semua");
    setStartDate("");
    setEndDate("");
    setActivePreset("semua");
    setCurrentPage(1);
  };

  // Quick Preset Handler
  const applyPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    setCurrentPage(1);
    if (presetKey === "semua") {
      setSelectedStatus("semua");
    } else if (presetKey === "rujukan") {
      setSelectedStatus("rujukan");
    } else if (presetKey === "stunting") {
      setSelectedStatus("stunting");
    } else if (presetKey === "gizi") {
      setSelectedStatus("kurang");
    } else if (presetKey === "hipertensi") {
      setSelectedStatus("hipertensi");
    } else if (presetKey === "diabetes") {
      setSelectedStatus("diabetes");
    }
  };

  // Stats calculation
  const totalRecords = data.length;
  const totalRujukan = data.filter(d => d.isPerluRujukan).length;
  const totalStunting = data.filter(d => d.statusRingkasan.toLowerCase().includes("stunting")).length;
  const totalHipertensi = data.filter(d => d.statusRingkasan.toLowerCase().includes("hipertensi")).length;
  const totalDiabetes = data.filter(d => d.statusRingkasan.toLowerCase().includes("diabetes")).length;

  // Pagination calculation
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  // Export CSV (Exports currently filtered data)
  const handleExportCSV = () => {
    if (data.length === 0) return;

    const headers = [
      "No",
      "Tanggal Periksa",
      "Posyandu",
      "Wilayah / Desa",
      "Nama Warga",
      "Kategori",
      "Jenis Kelamin",
      "Usia",
      "Berat Badan (kg)",
      "Tinggi Badan (cm)",
      "Tekanan Darah",
      "GDS (mg/dL)",
      "Status Indikator Kesehatan",
      "Tindakan / Catatan Medis"
    ];

    const rows = data.map((item, index) => [
      index + 1,
      item.tanggalPeriksa,
      `"${item.posyanduNama.replace(/"/g, '""')}"`,
      `"${item.wilayah.replace(/"/g, '""')}"`,
      `"${item.namaWarga.replace(/"/g, '""')}"`,
      item.kategori,
      item.jenisKelamin === "L" ? "Laki-laki" : "Perempuan",
      item.usiaInfo,
      item.beratBadan,
      item.tinggiBadan,
      item.tekananDarah || "-",
      item.gds || "-",
      `"${item.statusRingkasan.replace(/"/g, '""')}"`,
      `"${(item.tindakanCatatan || "-").replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Monitoring_${activeTab}_Puskesmas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF Formal / Print
  const handleExportPDF = () => {
    window.print();
  };

  // Active filters count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    if (selectedPosyandu !== "semua") count++;
    if (selectedStatus !== "semua") count++;
    if (startDate) count++;
    if (endDate) count++;
    return count;
  }, [search, selectedPosyandu, selectedStatus, startDate, endDate]);

  const activePosyanduLabel = useMemo(() => {
    if (selectedPosyandu === "semua") return "Semua Posyandu";
    const found = posyandus.find(p => p.id === selectedPosyandu);
    return found ? `${found.nama} (${found.desa})` : selectedPosyandu;
  }, [selectedPosyandu, posyandus]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col justify-between">
      <PageHelmet
        title={`Portal Pemantauan ${activeTab} — UPTD Puskesmas`}
        description={`Portal pemantauan data kesehatan ${activeTab} wilayah UPTD Puskesmas tanpa data pribadi NIK.`}
      />

      {/* TOP HEADER BRANDING BANNER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
              activeTab === "Balita" ? "bg-teal-50 border-teal-200 text-teal-700" : "bg-indigo-50 border-indigo-200 text-indigo-700"
            }`}>
              <Buildings className="w-5 h-5" weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  activeTab === "Balita" ? "bg-teal-50 text-teal-800 border-teal-200" : "bg-indigo-50 text-indigo-800 border-indigo-200"
                }`}>
                  Portal Puskesmas — Pemantauan {activeTab}
                </span>
              </div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight mt-0.5">
                Monitoring Pemantauan Pelayanan {activeTab} Wilayah Puskesmas
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors"
            >
              Menu Utama <CaretRight className="w-3.5 h-3.5" weight="bold" />
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-grow space-y-5 print:hidden">

        {/* PAGE SWITCH TAB BUTTONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-lg border border-slate-200 w-fit">
            <button
              type="button"
              onClick={() => {
                setActiveTab("Balita");
                setSelectedStatus("semua");
                setActivePreset("semua");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-md font-bold text-xs transition-all ${
                activeTab === "Balita"
                  ? "bg-teal-600 text-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Baby className="w-4 h-4" weight="bold" /> Pemantauan Balita
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("Lansia");
                setSelectedStatus("semua");
                setActivePreset("semua");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-md font-bold text-xs transition-all ${
                activeTab === "Lansia"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <LansiaIcon className="w-4 h-4" /> Pemantauan Lansia
            </button>
          </div>

          <span className="text-xs font-medium text-slate-500">
            Menampilkan data pemantauan <strong className={activeTab === "Balita" ? "text-teal-700" : "text-indigo-700"}>{activeTab}</strong>
          </span>
        </div>

        {/* HERO BANNER - FLAT CLEAN CARD */}
        <div className="bg-white rounded-lg p-5 border border-slate-200 text-slate-800 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-4 h-4 ${activeTab === "Balita" ? "text-teal-600" : "text-indigo-600"}`} weight="fill" />
            <span className="text-xs font-bold text-slate-700">
              Privasi Terjaga — Pemantauan Kesehatan {activeTab} Tanpa Data Sensitif (NIK)
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Data Rekam Pemantauan Kesehatan {activeTab}
          </h2>
          <p className="text-xs text-slate-600 font-normal leading-relaxed">
            {activeTab === "Balita"
              ? "Memantau tren gizi anak, deteksi dini stunting (kurang tinggi), pemberian Vitamin A, serta kelengkapan imunisasi balita di wilayah kerja UPTD Puskesmas."
              : "Memantau skrining penyakit tidak menular (PTM) seperti hipertensi (tekanan darah), gula darah (diabetes), asam urat, serta kolesterol lansia di wilayah kerja UPTD Puskesmas."}
          </p>
        </div>

        {/* STATS OVERVIEW CARDS - FLAT CLEAN */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total {activeTab} Periksa
            </span>
            <div className="flex items-baseline justify-between">
              {isLoading ? (
                <Skeleton variant="rounded" className="h-8 w-16 my-0.5" />
              ) : (
                <span className="text-2xl font-bold text-slate-900">{totalRecords}</span>
              )}
              {activeTab === "Balita" ? (
                <Baby className="w-5 h-5 text-teal-600 shrink-0" weight="bold" />
              ) : (
                <LansiaIcon className="w-5 h-5 shrink-0" />
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Hasil penginputan terkini</p>
          </div>

          {activeTab === "Balita" ? (
            <>
              <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Anak Kurang Tinggi</span>
                <div className="flex items-baseline justify-between">
                  {isLoading ? (
                    <Skeleton variant="rounded" className="h-8 w-14 my-0.5" />
                  ) : (
                    <span className="text-2xl font-bold text-amber-700">{totalStunting}</span>
                  )}
                  <Baby className="w-5 h-5 text-amber-600 shrink-0" weight="bold" />
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Kasus Stunting (TB/U)</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Perlu Rujukan</span>
                <div className="flex items-baseline justify-between">
                  {isLoading ? (
                    <Skeleton variant="rounded" className="h-8 w-14 my-0.5" />
                  ) : (
                    <span className="text-2xl font-bold text-red-700">{totalRujukan}</span>
                  )}
                  <WarningCircle className="w-5 h-5 text-red-600 shrink-0" weight="bold" />
                </div>
                <p className="text-[10px] text-slate-500 font-medium">PMT / Tindak Lanjut Medis</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Tensi Tinggi</span>
                <div className="flex items-baseline justify-between">
                  {isLoading ? (
                    <Skeleton variant="rounded" className="h-8 w-14 my-0.5" />
                  ) : (
                    <span className="text-2xl font-bold text-indigo-700">{totalHipertensi}</span>
                  )}
                  <LansiaIcon className="w-5 h-5 shrink-0" />
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Hipertensi (Sistol ≥140)</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Gula Darah Tinggi</span>
                <div className="flex items-baseline justify-between">
                  {isLoading ? (
                    <Skeleton variant="rounded" className="h-8 w-14 my-0.5" />
                  ) : (
                    <span className="text-2xl font-bold text-rose-700">{totalDiabetes}</span>
                  )}
                  <Drop className="w-5 h-5 text-rose-600 shrink-0" weight="bold" />
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Diabetes (GDS ≥200)</p>
              </div>
            </>
          )}

          <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Posyandu Aktif</span>
            <div className="flex items-baseline justify-between">
              {isLoading ? (
                <Skeleton variant="rounded" className="h-8 w-12 my-0.5" />
              ) : (
                <span className="text-2xl font-bold text-slate-900">{posyandus.length}</span>
              )}
              <Buildings className="w-5 h-5 text-teal-600 shrink-0" weight="bold" />
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Wilayah Binaan Puskesmas</p>
          </div>
        </div>

        {/* INTEGRATED SINGLE FILTER PANEL */}
        <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 space-y-4">
          
          {/* Quick Preset Chips Row inside Filter Panel */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Funnel className="w-4 h-4 text-teal-700" weight="bold" />
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Panel Filter Terpadu</h3>
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-bold rounded border border-teal-200">
                  {activeFilterCount} Filter Aktif
                </span>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-1.5">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mr-1">
                <Sparkle className="w-3.5 h-3.5 text-amber-500" weight="fill" /> Pilihan Cepat:
              </span>

              <button
                type="button"
                onClick={() => applyPreset("semua")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  activePreset === "semua"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <SquaresFour className="w-3.5 h-3.5" weight="bold" /> Semua Data
              </button>

              <button
                type="button"
                onClick={() => applyPreset("rujukan")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  activePreset === "rujukan"
                    ? "bg-amber-700 text-white"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                <WarningCircle className="w-3.5 h-3.5 text-amber-600" weight="bold" /> Perlu Rujukan ({totalRujukan})
              </button>

              {activeTab === "Balita" ? (
                <>
                  <button
                    type="button"
                    onClick={() => applyPreset("stunting")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      activePreset === "stunting"
                        ? "bg-teal-700 text-white"
                        : "bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200"
                    }`}
                  >
                    <Baby className="w-3.5 h-3.5 text-teal-600" weight="bold" /> Stunting (TB/U)
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset("gizi")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      activePreset === "gizi"
                        ? "bg-amber-700 text-white"
                        : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                    }`}
                  >
                    <Scales className="w-3.5 h-3.5 text-amber-600" weight="bold" /> Gizi Kurang
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => applyPreset("hipertensi")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      activePreset === "hipertensi"
                        ? "bg-indigo-700 text-white"
                        : "bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200"
                    }`}
                  >
                    <Heartbeat className="w-3.5 h-3.5 text-indigo-600" weight="bold" /> Hipertensi
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset("diabetes")}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                      activePreset === "diabetes"
                        ? "bg-rose-700 text-white"
                        : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
                    }`}
                  >
                    <Drop className="w-3.5 h-3.5 text-rose-600" weight="bold" /> Diabetes
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Integrated Filter Controls Form */}
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              
              {/* Search input */}
              <div className="lg:col-span-2 space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 block">Pencarian Nama</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={`Ketik nama ${activeTab.toLowerCase()}...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  />
                  <MagnifyingGlass className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" weight="bold" />
                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setDebouncedSearch("");
                        setCurrentPage(1);
                      }}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" weight="bold" />
                    </button>
                  )}
                </div>
              </div>

              {/* Posyandu dropdown */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 block">Posyandu Bina</label>
                <select
                  value={selectedPosyandu}
                  onChange={(e) => {
                    setSelectedPosyandu(e.target.value);
                    setActivePreset("custom");
                  }}
                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="semua">Semua Posyandu</option>
                  {posyandus.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama} ({p.desa})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status dropdown */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 block">Status Kesehatan</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setActivePreset("custom");
                  }}
                  className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="semua">Semua Status</option>
                  <option value="normal">Status Normal</option>
                  <option value="rujukan">Perlu Rujukan</option>
                  {activeTab === "Balita" ? (
                    <>
                      <option value="stunting">Anak Kurang Tinggi (Stunting)</option>
                      <option value="kurang">Gizi Kurang (BB/U)</option>
                    </>
                  ) : (
                    <>
                      <option value="hipertensi">Tensi Tinggi (Hipertensi)</option>
                      <option value="diabetes">Gula Darah Tinggi (Diabetes)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Date Filters */}
              <div className="lg:col-span-2 space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 block">Periode Tanggal Periksa</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setActivePreset("custom");
                    }}
                    className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-xs text-slate-400">s/d</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setActivePreset("custom");
                    }}
                    className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Filter Action Row & Export Buttons Integrated */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              
              {/* Left Side: Export & Print Filtered Reports */}
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-[11px] font-semibold text-slate-500 hidden md:inline">Ekspor Laporan (Terfilter):</span>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  disabled={data.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Unduh data terfilter ke format Excel / CSV"
                >
                  <FileCsv className="w-4 h-4 text-emerald-700" weight="bold" /> Unduh Excel ({data.length})
                </button>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  disabled={data.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-semibold rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Cetak Laporan PDF Resmi sesuai filter"
                >
                  <FilePdf className="w-4 h-4 text-indigo-700" weight="bold" /> Cetak PDF ({data.length})
                </button>
              </div>

              {/* Right Side: Reset Filter Button */}
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors flex items-center gap-1 border border-red-200"
                  >
                    <X className="w-3.5 h-3.5" weight="bold" /> Reset Filter ({activeFilterCount})
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* DATA TABLE & PAGINATION */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Daftar Rekam Pemeriksaan {activeTab}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Menampilkan data pengukuran fisik medis {activeTab.toLowerCase()} tanpa identifikasi NIK.
              </p>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Tampilkan per lembar:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="p-1 bg-slate-50 border border-slate-200 rounded text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value={10}>10 Baris</option>
                <option value={25}>25 Baris</option>
                <option value={50}>50 Baris</option>
                <option value={100}>100 Baris</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <PuskesmasTableSkeleton rows={pageSize > 10 ? 10 : pageSize} />
          ) : paginatedData.length > 0 ? (
            <>
              <div className="overflow-x-auto border border-slate-200 rounded">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                      <th className="p-3">No</th>
                      <th className="p-3">Tanggal</th>
                      <th className="p-3">Posyandu & Wilayah</th>
                      <th className="p-3">Nama {activeTab}</th>
                      <th className="p-3">Kelompok Usia</th>
                      <th className="p-3">Hasil Pemeriksaan Medis</th>
                      <th className="p-3">Status Indikator</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs text-slate-800">
                    {paginatedData.map((item, idx) => {
                      const rowNumber = (currentPage - 1) * pageSize + idx + 1;
                      
                      // Status badge color logic
                      const isNormal = item.statusRingkasan.toLowerCase().includes("normal");
                      const statusBadgeClass = isNormal
                        ? "bg-[#DCFCE7] text-[#15803D] border border-green-200"
                        : item.isPerluRujukan || item.statusRingkasan.toLowerCase().includes("stunting") || item.statusRingkasan.toLowerCase().includes("hipertensi") || item.statusRingkasan.toLowerCase().includes("diabetes")
                        ? "bg-[#FEE2E2] text-[#B91C1C] border border-red-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200";

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-medium text-slate-500">{rowNumber}</td>
                          <td className="p-3 font-medium text-slate-600 whitespace-nowrap">
                            {item.tanggalPeriksa}
                          </td>
                          <td className="p-3">
                            <p className="font-semibold text-slate-900 leading-tight">{item.posyanduNama}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{item.wilayah}</p>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-slate-900">{item.namaWarga}</p>
                              <span className="text-[11px] text-slate-400 font-normal">
                                ({item.jenisKelamin === "L" ? "L" : "P"})
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium text-xs">
                              {item.usiaInfo}
                            </span>
                          </td>
                          <td className="p-3 space-y-0.5">
                            <div className="font-semibold text-slate-900">
                              BB / TB: <span className="font-bold">{item.beratBadan} kg</span> / <span className="font-bold">{item.tinggiBadan} cm</span>
                            </div>
                            {item.kategori === "Balita" ? (
                              <div className="text-[11px] text-slate-500">
                                {item.lingkarKepala ? `LK: ${item.lingkarKepala} cm ` : ""}
                                {item.vitaminA ? " | Vit A ✓ " : ""}
                                {item.statusImunisasi ? ` | Imunisasi: ${item.statusImunisasi}` : ""}
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-500">
                                TD: <span className="font-medium text-slate-700">{item.tekananDarah || "-"}</span> | GDS: <span className="font-medium text-slate-700">{item.gds ? `${item.gds} mg/dL` : "-"}</span>
                                {item.kolesterol ? ` | Kol: ${item.kolesterol}` : ""}
                                {item.asamUrat ? ` | Urat: ${item.asamUrat}` : ""}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusBadgeClass}`}>
                              {item.statusRingkasan}
                            </span>
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedItem(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" weight="bold" /> Detail
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION CONTROLS */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-200">
                <p className="text-xs font-medium text-slate-500">
                  Menampilkan <strong className="text-slate-900">{(currentPage - 1) * pageSize + 1}</strong> s/d{" "}
                  <strong className="text-slate-900">{Math.min(currentPage * pageSize, totalRecords)}</strong> dari{" "}
                  <strong className="text-slate-900">{totalRecords}</strong> data {activeTab.toLowerCase()}
                </p>

                <div className="flex items-center gap-1 self-center sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Lembar Pertama"
                  >
                    <CaretDoubleLeft className="w-3.5 h-3.5" weight="bold" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <CaretLeft className="w-3.5 h-3.5" weight="bold" /> Sebelum
                  </button>

                  <span className="px-3 py-1 font-bold text-xs rounded bg-slate-100 text-slate-800 border border-slate-200">
                    Lembar {currentPage} dari {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Sesudah <CaretRight className="w-3.5 h-3.5" weight="bold" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Lembar Terakhir"
                  >
                    <CaretDoubleRight className="w-3.5 h-3.5" weight="bold" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center space-y-2 border border-dashed border-slate-200 rounded">
              <Info className="w-7 h-7 text-slate-400 mx-auto" weight="bold" />
              <p className="text-xs font-bold text-slate-800">Tidak ada data pemeriksaan {activeTab.toLowerCase()} yang sesuai dengan filter.</p>
              <p className="text-[11px] text-slate-500">Coba ubah kata kunci pencarian atau bersihkan filter di atas.</p>
              <button
                onClick={resetFilters}
                className="mt-2 px-3 py-1.5 bg-slate-100 text-xs font-semibold text-slate-800 rounded hover:bg-slate-200 transition-colors"
              >
                Bersihkan Filter
              </button>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 print:hidden mt-6">
        <div className="max-w-7xl mx-auto px-4 space-y-0.5">
          <p className="font-semibold text-slate-700">Sistem Informasi Posyandu & Monitoring Puskesmas Terpadu</p>
          <p className="text-[11px]">Halaman pemantauan publik resmi untuk pemangku kepentingan kesehatan daerah.</p>
        </div>
      </footer>

      {/* FORMAL PRINT / PDF DOKUMEN LAPORAN RESMI PUSKESMAS */}
      <div className="hidden print:block p-8 bg-white text-black font-serif space-y-6">
        {/* KOP SURAT FORMAL */}
        <div className="border-b-4 border-double border-black pb-4 flex items-center justify-between">
          <div className="w-16 h-16 flex items-center justify-center shrink-0">
            <Hospital className="w-14 h-14 text-black" weight="bold" />
          </div>
          <div className="text-center flex-grow px-4">
            <h2 className="text-lg font-bold uppercase tracking-wide">PEMERINTAH KABUPATEN / KOTA</h2>
            <h1 className="text-xl font-extrabold uppercase tracking-wider">DINAS KESEHATAN — UPTD PUSKESMAS</h1>
            <p className="text-xs italic font-sans">Jl. Raya Kesehatan No. 100, Wilayah Pembinaan Kesehatan Masyarakat</p>
          </div>
          <div className="w-16 h-16 flex items-center justify-center shrink-0">
            <Buildings className="w-14 h-14 text-black" weight="bold" />
          </div>
        </div>

        {/* JUDUL LAPORAN */}
        <div className="text-center space-y-1 pt-2">
          <h3 className="text-base font-bold underline uppercase tracking-wide">
            LAPORAN PEMANTAUAN HASIL PELAYANAN {activeTab.toUpperCase()} POSYANDU
          </h3>
          <p className="text-xs font-sans">Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          {/* Active Filter Indicators on Printed Document */}
          <div className="text-[11px] font-sans italic text-gray-700 space-x-3 pt-1">
            <span>Posyandu: <strong>{activePosyanduLabel}</strong></span>
            {selectedStatus !== "semua" && <span>• Status Filter: <strong>{selectedStatus}</strong></span>}
            {search && <span>• Kata Kunci: <strong>"{search}"</strong></span>}
            {(startDate || endDate) && (
              <span>• Periode: <strong>{startDate || "Awal"} s/d {endDate || "Kini"}</strong></span>
            )}
          </div>
        </div>

        {/* EXECUTIF REKAPITULASI */}
        <div className="border border-black p-3 font-sans text-xs space-y-1">
          <p className="font-bold">Ringkasan Statistik Hasil Filter {activeTab} Wilayah:</p>
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="border border-gray-400 p-1">Total {activeTab} Terfilter: <strong>{totalRecords}</strong></div>
            <div className="border border-gray-400 p-1">
              {activeTab === "Balita" ? `Anak Stunting: ${totalStunting}` : `Tensi Tinggi: ${totalHipertensi}`}
            </div>
            <div className="border border-gray-400 p-1">Perlu Rujukan: <strong>{totalRujukan}</strong></div>
          </div>
        </div>

        {/* TABEL DOKUMEN RESMI */}
        <table className="w-full text-xs border-collapse border border-black font-sans">
          <thead>
            <tr className="bg-gray-100 border-b border-black font-bold text-center">
              <th className="border border-black p-1.5">No</th>
              <th className="border border-black p-1.5">Tanggal</th>
              <th className="border border-black p-1.5">Posyandu & Wilayah</th>
              <th className="border border-black p-1.5">Nama {activeTab}</th>
              <th className="border border-black p-1.5">Usia</th>
              <th className="border border-black p-1.5">Hasil Pengukuran Medis</th>
              <th className="border border-black p-1.5">Status Indikator</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={item.id} className="border-b border-black text-[11px]">
                <td className="border border-black p-1.5 text-center">{idx + 1}</td>
                <td className="border border-black p-1.5 text-center">{item.tanggalPeriksa}</td>
                <td className="border border-black p-1.5">{item.posyanduNama} ({item.wilayah})</td>
                <td className="border border-black p-1.5 font-bold">{item.namaWarga} ({item.jenisKelamin})</td>
                <td className="border border-black p-1.5 text-center">{item.usiaInfo}</td>
                <td className="border border-black p-1.5">
                  BB: {item.beratBadan}kg, TB: {item.tinggiBadan}cm {item.tekananDarah ? `, TD: ${item.tekananDarah}` : ""} {item.gds ? `, GDS: ${item.gds}` : ""}
                </td>
                <td className="border border-black p-1.5 font-bold text-center">{item.statusRingkasan}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* TANDA TANGAN FORMAL PUSKESMAS */}
        <div className="pt-8 flex justify-between font-sans text-xs">
          <div className="text-center space-y-12">
            <p>Mengetahui,<br />Petugas Pembina Posyandu</p>
            <div className="pt-8">
              <p className="font-bold underline">( .................................................... )</p>
              <p>NIP. ...............................................</p>
            </div>
          </div>

          <div className="text-center space-y-12">
            <p>Kepala UPTD Puskesmas Pembantu,<br />Penanggung Jawab Wilayah</p>
            <div className="pt-8">
              <p className="font-bold underline">( .................................................... )</p>
              <p>NIP. ...............................................</p>
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL - GRAFIK PERKEMBANGAN & RIWAYAT LENGKAP */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:hidden animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden cursor-default"
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${
                  selectedItem.kategori === "Balita" ? "bg-teal-600 shadow-teal-500/20" : "bg-indigo-600 shadow-indigo-500/20"
                }`}>
                  {selectedItem.kategori === "Balita" ? <Baby className="w-5 h-5 sm:w-6 sm:h-6" weight="bold" /> : <LansiaIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-tight">
                    Grafik Perkembangan & Riwayat: {selectedItem.namaWarga}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                    Posyandu: <strong className="text-slate-800">{selectedItem.posyanduNama}</strong> ({selectedItem.wilayah}) • Tanggal Terkini: {selectedItem.tanggalPeriksa}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 font-bold text-sm transition-colors shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 pr-3">
              {/* Header Identity Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-teal-50/20 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{selectedItem.namaWarga}</span>
                    <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 font-bold text-[10px] rounded-full">
                      {selectedItem.kategori} ({selectedItem.usiaInfo})
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Jenis Kelamin: <strong>{selectedItem.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Total Rekam Tercatat: <strong className="text-teal-700">{participantHistory.length} Kali Pemeriksaan</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                    selectedItem.statusRingkasan.toLowerCase().includes("normal")
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}>
                    {selectedItem.statusRingkasan}
                  </span>
                </div>
              </div>

              {/* Ringkasan Trend Perkembangan Terakhir */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Ringkasan Trend Perkembangan Terakhir
                </h4>

                {selectedItem.kategori === "Balita" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* BB Trend */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Berat Badan (BB)</span>
                      <p className="text-lg font-bold text-slate-900">{selectedItem.beratBadan} kg</p>
                      {prevRecord ? (
                        <div className="pt-0.5">
                          {bbDiff > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                              <TrendingUp className="w-3 h-3" /> Naik +{bbDiff} kg
                            </span>
                          ) : bbDiff < 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-100/80 px-2 py-0.5 rounded-full">
                              <TrendingDown className="w-3 h-3" /> Turun {bbDiff} kg
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                              <Minus className="w-3 h-3" /> Tetap (0 kg)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-semibold">Pemeriksaan Terkini</span>
                      )}
                    </div>

                    {/* TB Trend */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Tinggi Badan (TB)</span>
                      <p className="text-lg font-bold text-slate-900">{selectedItem.tinggiBadan} cm</p>
                      {prevRecord ? (
                        <div className="pt-0.5">
                          {tbDiff > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                              <TrendingUp className="w-3 h-3" /> Tumbuh +{tbDiff} cm
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                              <Minus className="w-3 h-3" /> Tetap ({tbDiff} cm)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-semibold">Pemeriksaan Terkini</span>
                      )}
                    </div>

                    {/* Status Gizi WHO */}
                    <div className="p-3.5 bg-teal-50/50 border border-teal-200/80 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-teal-700 uppercase">Status Gizi (WHO)</span>
                      <p className="text-xs font-bold text-teal-950 leading-snug">
                        {selectedItem.statusBbU ? `BB/U: ${selectedItem.statusBbU}` : "Normal"}
                      </p>
                      <p className="text-[10px] font-semibold text-teal-800">
                        TB/U: {selectedItem.statusTbU || "Normal"} • BB/TB: {selectedItem.statusBbTb || "Normal"}
                      </p>
                      <p className="text-[10px] text-teal-700">
                        LK: {selectedItem.lingkarKepala ? `${selectedItem.lingkarKepala} cm` : "-"} • Vit A: {selectedItem.vitaminA ? "Ya" : "Tidak"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Tekanan Darah */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Tekanan Darah (TD)</span>
                      <p className="text-lg font-bold text-slate-900">
                        {selectedItem.tekananDarah || (selectedItem.sistol ? `${selectedItem.sistol}/${selectedItem.diastol}` : "-")} <span className="text-xs font-normal">mmHg</span>
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        (selectedItem.sistol || (selectedItem.tekananDarah ? parseInt(selectedItem.tekananDarah.split('/')[0]) : 0)) >= 140
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {(selectedItem.sistol || (selectedItem.tekananDarah ? parseInt(selectedItem.tekananDarah.split('/')[0]) : 0)) >= 140 ? "Hipertensi" : "Normal"}
                      </span>
                    </div>

                    {/* Gula Darah */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Gula Darah (GDS)</span>
                      <p className="text-lg font-bold text-slate-900">
                        {selectedItem.gds ? `${selectedItem.gds} mg/dL` : "-"}
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        (selectedItem.gds || 0) >= 200 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {(selectedItem.gds || 0) >= 200 ? "GDS Tinggi" : "Normal"}
                      </span>
                    </div>

                    {/* Kolesterol & Asam Urat */}
                    <div className="p-3.5 bg-indigo-50/50 border border-indigo-200/80 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-indigo-700 uppercase">Kolesterol & Asam Urat</span>
                      <p className="text-xs font-bold text-indigo-950">
                        Kolesterol: {selectedItem.kolesterol || "-"} • Asam Urat: {selectedItem.asamUrat || "-"}
                      </p>
                      <p className="text-[10px] font-semibold text-indigo-800">
                        IMT: {selectedItem.imt || "-"} • BB: {selectedItem.beratBadan} kg / TB: {selectedItem.tinggiBadan} cm
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Grafik Perkembangan Peserta (Line Chart) */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <LineChartIcon className="w-4 h-4 text-teal-600" />
                    Grafik Perkembangan {selectedItem.kategori === "Balita" ? "Berat & Tinggi Badan" : "Tekanan Darah & Gula Darah"}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                    {participantHistory.length} Titik Data
                  </span>
                </div>

                <div className="h-60 w-full pt-1">
                  {participantHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={participantHistory}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="tanggal" tick={{ fontSize: 11 }} stroke="#64748B" />
                        <YAxis tick={{ fontSize: 11 }} stroke="#64748B" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#FFF",
                            borderRadius: "8px",
                            border: "1px solid #CBD5E1",
                            fontSize: "12px",
                          }}
                        />
                        <Legend />
                        {selectedItem.kategori === "Balita" ? (
                          <>
                            <Line
                              type="monotone"
                              dataKey="bb"
                              name="Berat Badan (kg)"
                              stroke="#0D9488"
                              strokeWidth={3}
                              dot={{ r: 4 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="tb"
                              name="Tinggi Badan (cm)"
                              stroke="#3B82F6"
                              strokeWidth={3}
                              dot={{ r: 4 }}
                            />
                          </>
                        ) : (
                          <>
                            <Line
                              type="monotone"
                              dataKey="sistol"
                              name="TD Sistol (mmHg)"
                              stroke="#EF4444"
                              strokeWidth={3}
                              dot={{ r: 4 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="diastol"
                              name="TD Diastol (mmHg)"
                              stroke="#3B82F6"
                              strokeWidth={2}
                              dot={{ r: 3 }}
                            />
                            <Line
                              type="monotone"
                              dataKey="gds"
                              name="GDS (mg/dL)"
                              stroke="#F59E0B"
                              strokeWidth={2}
                              strokeDasharray="4 4"
                              dot={{ r: 3 }}
                            />
                          </>
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500">
                      Belum ada data grafik historis untuk peserta ini.
                    </div>
                  )}
                </div>
              </div>

              {/* Tabel Histori Lengkap */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Riwayat Histori Pemeriksaan Lengkap ({participantHistory.length})
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/80 border-b border-slate-200 font-bold text-slate-700">
                        <th className="py-2.5 px-3">Tanggal</th>
                        <th className="py-2.5 px-3">Posyandu</th>
                        <th className="py-2.5 px-3">Parameter Ukur</th>
                        <th className="py-2.5 px-3">Status / Indikator</th>
                        <th className="py-2.5 px-3">Catatan / Rujukan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {participantHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-slate-900 whitespace-nowrap">{item.tanggalPeriksa}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-600">{item.posyanduNama}</td>
                          <td className="py-2.5 px-3 text-slate-800">
                            {item.kategori === "Balita" ? (
                              <span>BB: <strong>{item.beratBadan} kg</strong>, TB: <strong>{item.tinggiBadan} cm</strong>{item.lingkarKepala ? `, LK: ${item.lingkarKepala} cm` : ""}</span>
                            ) : (
                              <span>TD: <strong>{item.tekananDarah || `${item.sistol || '-'}/${item.diastol || '-'}`}</strong>{item.gds ? `, GDS: ${item.gds} mg/dL` : ""}{item.kolesterol ? `, Kol: ${item.kolesterol}` : ""}</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-semibold">
                            <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${
                              item.statusRingkasan.toLowerCase().includes("normal")
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                              {item.statusRingkasan}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                            {item.tindakanCatatan || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Catatan Medis & Rujukan */}
              {selectedItem.tindakanCatatan && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                  <p className="text-[10px] font-bold uppercase text-amber-800">Catatan Medis & Tindakan Rujukan</p>
                  <p className="text-xs text-amber-950 font-medium">{selectedItem.tindakanCatatan}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold transition-all shadow-xs"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
