"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Buildings,
  ShieldCheck,
  MagnifyingGlass,
  Funnel,
  CalendarBlank,
  Baby,
  Heart,
  Pulse,
  Heartbeat,
  WarningCircle,
  FileCsv,
  FilePdf,
  Printer,
  CaretRight,
  CaretLeft,
  CaretDoubleLeft,
  CaretDoubleRight,
  CircleNotch,
  CheckCircle,
  SlidersHorizontal,
  Info,
  X,
  User,
  ChartBar,
  Hospital,
  Sparkle,
  SquaresFour,
  Drop,
  Scales
} from "@phosphor-icons/react";
import PageHelmet from "../../components/PageHelmet";
import { publicPuskesmasApi, PublicPemeriksaanItem, PublicPosyanduInfo } from "../../lib/api";

export default function PuskesmasPublicPage() {
  const [data, setData] = useState<PublicPemeriksaanItem[]>([]);
  const [posyandus, setPosyandus] = useState<PublicPosyanduInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Tab State: "Balita" | "Lansia"
  const [activeTab, setActiveTab] = useState<"Balita" | "Lansia">("Balita");

  // Filters state
  const [search, setSearch] = useState<string>("");
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

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [posList, records] = await Promise.all([
        publicPuskesmasApi.getPosyandus(),
        publicPuskesmasApi.getPemeriksaanData({
          posyanduId: selectedPosyandu,
          kategori: activeTab,
          status: selectedStatus,
          search,
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
    setCurrentPage(1);
  }, [activeTab, selectedPosyandu, selectedStatus, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadData();
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

  // Export CSV
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

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-saas-dark font-sans flex flex-col justify-between">
      <PageHelmet
        title={`Portal Pemantauan ${activeTab} — UPTD Puskesmas`}
        description={`Portal pemantauan data kesehatan ${activeTab} wilayah UPTD Puskesmas tanpa data pribadi NIK.`}
      />

      {/* TOP HEADER BRANDING BANNER */}
      <header className="bg-white border-b border-gray-200/80 sticky top-0 z-30 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              activeTab === "Balita" ? "bg-teal-50 border-teal-150 text-saas-primary" : "bg-indigo-50 border-indigo-150 text-indigo-600"
            }`}>
              <Buildings className="w-6 h-6" weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  activeTab === "Balita" ? "bg-teal-50 text-saas-primary border-teal-200/50" : "bg-indigo-50 text-indigo-700 border-indigo-200/50"
                }`}>
                  Portal Puskesmas — Pemantauan {activeTab}
                </span>
              </div>
              <h1 className="text-base font-extrabold text-saas-dark tracking-tight leading-tight mt-0.5">
                Monitoring Pemantauan Pelayanan {activeTab} Wilayah Puskesmas
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-input transition-colors shadow-xs"
              title="Unduh data dalam format Excel / CSV"
            >
              <FileCsv className="w-4.5 h-4.5 text-emerald-700" weight="bold" /> Unduh Tabel Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold rounded-input transition-colors shadow-xs"
              title="Cetak Laporan PDF Resmi UPTD Puskesmas"
            >
              <FilePdf className="w-4.5 h-4.5 text-indigo-700" weight="bold" /> Cetak Dokumen PDF
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-sm transition-all"
            >
              Menu Utama <CaretRight className="w-3.5 h-3.5" weight="bold" />
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow space-y-6 print:hidden">

        {/* PAGE SWITCH TAB BUTTONS (TERPISAH HALAMAN BALITA & LANSIA) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-gray-200/80 shadow-xs w-fit">
            <button
              type="button"
              onClick={() => {
                setActiveTab("Balita");
                setSelectedStatus("semua");
                setActivePreset("semua");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                activeTab === "Balita"
                  ? "bg-saas-primary text-white shadow-md shadow-teal-500/20"
                  : "text-saas-muted hover:text-saas-dark hover:bg-gray-50"
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
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                activeTab === "Lansia"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-saas-muted hover:text-saas-dark hover:bg-gray-50"
              }`}
            >
              <Heartbeat className="w-4 h-4" weight="bold" /> Pemantauan Lansia
            </button>
          </div>

          <span className="text-xs font-semibold text-saas-muted">
            Menampilkan data pemantauan <strong className={activeTab === "Balita" ? "text-saas-primary" : "text-indigo-600"}>{activeTab}</strong>
          </span>
        </div>

        {/* HERO BANNER - SANGAT JELAS & HIGH CONTRAST */}
        <div className="bg-white rounded-card p-6 md:p-8 text-saas-dark border border-gray-200/80 shadow-soft-card relative overflow-hidden">
          <div className="relative z-10 space-y-3 max-w-3xl">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-extrabold border ${
              activeTab === "Balita" ? "bg-teal-50 text-teal-800 border-teal-200/80" : "bg-indigo-50 text-indigo-800 border-indigo-200/80"
            }`}>
              <ShieldCheck className={`w-4 h-4 ${activeTab === "Balita" ? "text-teal-600" : "text-indigo-600"}`} weight="fill" />
              <span>Privasi Terjaga — Pemantauan Kesehatan {activeTab} Tanpa Data Sensitif</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-saas-dark tracking-tight leading-tight">
              Data Rekam Pemantauan Kesehatan {activeTab}
            </h2>
            <p className="text-xs md:text-sm text-saas-muted font-medium leading-relaxed">
              {activeTab === "Balita"
                ? "Didesain khusus untuk Petugas Puskesmas dan Bidan Desa dalam memantau tren gizi anak, deteksi dini stunting (kurang tinggi), pemberian Vitamin A, serta kelengkapan imunisasi balita."
                : "Didesain khusus untuk Petugas Puskesmas dan Pembina Lansia dalam memantau skrining penyakit tidak menular (PTM) seperti hipertensi (tekanan darah tinggi), diabetes (gula darah), asam urat, serta kolesterol."}
            </p>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
            {activeTab === "Balita" ? (
              <Baby className="w-64 h-64 text-saas-primary" weight="duotone" />
            ) : (
              <Heartbeat className="w-64 h-64 text-indigo-600" weight="duotone" />
            )}
          </div>
        </div>

        {/* STATS OVERVIEW CARDS (KHUSUS BALITA / LANSIA) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-card border border-gray-100/80 shadow-soft-card space-y-1">
            <span className="text-[11px] font-bold text-saas-muted uppercase tracking-wider block">
              Total {activeTab} Periksa
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-saas-dark">{totalRecords}</span>
              {activeTab === "Balita" ? (
                <Baby className="w-6 h-6 text-saas-primary shrink-0" weight="bold" />
              ) : (
                <Heartbeat className="w-6 h-6 text-indigo-600 shrink-0" weight="bold" />
              )}
            </div>
            <p className="text-[10px] text-saas-muted font-medium pt-1">Hasil penginputan terkini</p>
          </div>

          {activeTab === "Balita" ? (
            <>
              <div className="bg-white p-4 sm:p-5 rounded-card border border-gray-100/80 shadow-soft-card space-y-1">
                <span className="text-[11px] font-bold text-saas-muted uppercase tracking-wider block">Anak Kurang Tinggi</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-extrabold text-amber-600">{totalStunting}</span>
                  <Baby className="w-6 h-6 text-amber-500 shrink-0" weight="bold" />
                </div>
                <p className="text-[10px] text-saas-muted font-medium pt-1">Kasus Stunting (TB/U)</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-card border border-gray-100/80 shadow-soft-card space-y-1">
                <span className="text-[11px] font-bold text-saas-muted uppercase tracking-wider block">Perlu Rujukan</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-extrabold text-red-600">{totalRujukan}</span>
                  <WarningCircle className="w-6 h-6 text-red-500 shrink-0" weight="bold" />
                </div>
                <p className="text-[10px] text-saas-muted font-medium pt-1">PMT / Tindak Lanjut Medis</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white p-4 sm:p-5 rounded-card border border-gray-100/80 shadow-soft-card space-y-1">
                <span className="text-[11px] font-bold text-saas-muted uppercase tracking-wider block">Tensi Tinggi</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600">{totalHipertensi}</span>
                  <Heartbeat className="w-6 h-6 text-indigo-500 shrink-0" weight="bold" />
                </div>
                <p className="text-[10px] text-saas-muted font-medium pt-1">Hipertensi (Sistol ≥140)</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-card border border-gray-100/80 shadow-soft-card space-y-1">
                <span className="text-[11px] font-bold text-saas-muted uppercase tracking-wider block">Gula Darah Tinggi</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-extrabold text-rose-600">{totalDiabetes}</span>
                  <Drop className="w-6 h-6 text-rose-500 shrink-0" weight="bold" />
                </div>
                <p className="text-[10px] text-saas-muted font-medium pt-1">Diabetes (GDS ≥200)</p>
              </div>
            </>
          )}

          <div className="bg-white p-4 sm:p-5 rounded-card border border-gray-100/80 shadow-soft-card space-y-1">
            <span className="text-[11px] font-bold text-saas-muted uppercase tracking-wider block">Posyandu Aktif</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-saas-dark">{posyandus.length}</span>
              <Buildings className="w-6 h-6 text-saas-primary shrink-0" weight="bold" />
            </div>
            <p className="text-[10px] text-saas-muted font-medium pt-1">Wilayah Binaan Puskesmas</p>
          </div>
        </div>

        {/* USER-FRIENDLY UX FILTER PANEL */}
        <div className="bg-white p-5 rounded-card border border-gray-100/80 shadow-soft-card space-y-5">
          {/* Header Filter & Quick Chips (DENGAN ICON PHOSPHOR LENGKAP) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Funnel className="w-5 h-5 text-saas-primary" weight="bold" />
              <div>
                <h3 className="font-extrabold text-sm text-saas-dark">Pilih Kategori & Cari Nama</h3>
                <p className="text-[11px] text-saas-muted">Gunakan tombol pilihan cepat di kanan untuk memfilter kasus dengan instan.</p>
              </div>
              {activeFilterCount > 0 && (
                <span className="px-2.5 py-0.5 bg-teal-50 text-saas-primary text-[10px] font-extrabold rounded-full border border-teal-200">
                  {activeFilterCount} Filter Aktif
                </span>
              )}
            </div>

            {/* QUICK PRESETS CHIPS (DENGAN PHOSPHOR ICONS, TANPA EMOJI RAW) */}
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-[11px] font-bold text-saas-muted flex items-center gap-1 mr-1">
                <Sparkle className="w-3.5 h-3.5 text-amber-500" weight="fill" /> Pilihan Cepat:
              </span>

              {/* Button 1: Semua Data */}
              <button
                type="button"
                onClick={() => applyPreset("semua")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activePreset === "semua"
                    ? "bg-saas-dark text-white shadow-xs"
                    : "bg-gray-100 text-saas-muted hover:bg-gray-200"
                }`}
              >
                <SquaresFour className="w-3.5 h-3.5" weight="bold" /> Semua Data
              </button>

              {/* Button 2: Perlu Rujukan */}
              <button
                type="button"
                onClick={() => applyPreset("rujukan")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activePreset === "rujukan"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                <WarningCircle className="w-3.5 h-3.5 text-amber-600" weight="bold" /> Perlu Rujukan ({totalRujukan})
              </button>

              {/* Button 3 & 4 Khusus Balita / Lansia */}
              {activeTab === "Balita" ? (
                <>
                  <button
                    type="button"
                    onClick={() => applyPreset("stunting")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activePreset === "stunting"
                        ? "bg-teal-600 text-white shadow-xs"
                        : "bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200"
                    }`}
                  >
                    <Baby className="w-3.5 h-3.5 text-teal-600" weight="bold" /> Anak Kurang Tinggi (Stunting)
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset("gizi")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activePreset === "gizi"
                        ? "bg-amber-600 text-white shadow-xs"
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
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activePreset === "hipertensi"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200"
                    }`}
                  >
                    <Heartbeat className="w-3.5 h-3.5 text-indigo-600" weight="bold" /> Lansia Tensi Tinggi (Hipertensi)
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset("diabetes")}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      activePreset === "diabetes"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
                    }`}
                  >
                    <Drop className="w-3.5 h-3.5 text-rose-600" weight="bold" /> Gula Darah Tinggi (Diabetes)
                  </button>
                </>
              )}
            </div>
          </div>

          {/* MAIN FILTER FORM */}
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              
              {/* Filter 1: Pencarian Nama Warga */}
              <div className="lg:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-saas-muted">Nama {activeTab}</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={`Ketik nama ${activeTab.toLowerCase()}...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary focus:bg-white transition-all"
                  />
                  <MagnifyingGlass className="w-4 h-4 text-saas-muted absolute left-3 top-2.5" weight="bold" />
                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        loadData();
                      }}
                      className="absolute right-2.5 top-2.5 text-saas-muted hover:text-saas-dark"
                    >
                      <X className="w-3.5 h-3.5" weight="bold" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter 2: Posyandu */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-saas-muted">Posyandu Bina</label>
                <select
                  value={selectedPosyandu}
                  onChange={(e) => {
                    setSelectedPosyandu(e.target.value);
                    setActivePreset("custom");
                  }}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary cursor-pointer"
                >
                  <option value="semua">Semua Posyandu</option>
                  {posyandus.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama} ({p.desa})
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 3: Status Medis */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-saas-muted">Status Kesehatan</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setActivePreset("custom");
                  }}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary cursor-pointer"
                >
                  <option value="semua">Semua Status Kesehatan</option>
                  <option value="normal">Status Normal</option>
                  <option value="rujukan">🚨 Perlu Rujukan / Rawan</option>
                  {activeTab === "Balita" ? (
                    <>
                      <option value="stunting">⚠️ Anak Kurang Tinggi (Stunting)</option>
                      <option value="kurang">⚖️ Gizi Kurang (BB/U)</option>
                    </>
                  ) : (
                    <>
                      <option value="hipertensi">🔴 Tensi Tinggi (Hipertensi)</option>
                      <option value="diabetes">🩸 Gula Darah Tinggi (Diabetes)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Filter 4: Search CTA */}
              <div className="space-y-1 flex items-end">
                <button
                  type="submit"
                  className={`w-full py-2 px-3 text-white font-bold text-xs rounded-input shadow-xs transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === "Balita" ? "bg-saas-primary hover:bg-teal-600" : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  <MagnifyingGlass className="w-4 h-4" weight="bold" /> Cari Data
                </button>
              </div>
            </div>

            {/* Date Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100/70">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-[11px] font-bold text-saas-muted flex items-center gap-1 mr-1">
                  <CalendarBlank className="w-3.5 h-3.5 text-saas-primary" weight="bold" /> Tanggal Periksa:
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setActivePreset("custom");
                  }}
                  className="p-1.5 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold"
                />
                <span className="text-xs text-saas-muted">s/d</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setActivePreset("custom");
                  }}
                  className="p-1.5 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold"
                />
              </div>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors self-end sm:self-auto"
                >
                  <X className="w-3.5 h-3.5" weight="bold" /> Bersihkan Filter
                </button>
              )}
            </div>
          </form>
        </div>

        {/* DATA TABLE & PAGINATION */}
        <div className="bg-white rounded-card shadow-soft-card border border-gray-100/80 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-saas-dark">
                Daftar Rekam Pemeriksaan {activeTab}
              </h3>
              <p className="text-xs text-saas-muted mt-0.5">
                Menampilkan data pengukuran fisik medis {activeTab.toLowerCase()} terproteksi tanpa identifikasi NIK.
              </p>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-saas-muted">Tampilkan per lembar:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-saas-dark focus:outline-none"
              >
                <option value={10}>10 Baris</option>
                <option value={25}>25 Baris</option>
                <option value={50}>50 Baris</option>
                <option value={100}>100 Baris</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <CircleNotch className="w-8 h-8 text-saas-primary animate-spin" weight="bold" />
              <p className="text-xs font-bold text-saas-muted">Memuat data pemeriksaan {activeTab.toLowerCase()}...</p>
            </div>
          ) : paginatedData.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-[11px] font-bold text-saas-muted uppercase tracking-wider bg-gray-50/70">
                      <th className="p-3 rounded-l-lg">No</th>
                      <th className="p-3">Tanggal Periksa</th>
                      <th className="p-3">Posyandu & Wilayah</th>
                      <th className="p-3">Nama {activeTab}</th>
                      <th className="p-3">Kelompok Usia</th>
                      <th className="p-3">Hasil Pemeriksaan Medis</th>
                      <th className="p-3">Status Indikator</th>
                      <th className="p-3 rounded-r-lg text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-saas-dark">
                    {paginatedData.map((item, idx) => {
                      const rowNumber = (currentPage - 1) * pageSize + idx + 1;
                      return (
                        <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="p-3 font-bold text-saas-muted">{rowNumber}</td>
                          <td className="p-3 font-semibold text-saas-muted whitespace-nowrap">
                            {item.tanggalPeriksa}
                          </td>
                          <td className="p-3">
                            <p className="font-bold text-saas-dark leading-tight">{item.posyanduNama}</p>
                            <p className="text-[10px] text-saas-muted mt-0.5">{item.wilayah}</p>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-saas-dark">{item.namaWarga}</p>
                              <span className="text-[10px] text-saas-muted font-normal italic">
                                ({item.jenisKelamin === "L" ? "L" : "P"})
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold text-[11px] ${
                              item.kategori === "Balita" ? "bg-teal-50 text-saas-primary border border-teal-200/50" : "bg-indigo-50 text-indigo-700 border border-indigo-200/50"
                            }`}>
                              {item.kategori === "Balita" ? <Baby className="w-3.5 h-3.5" weight="bold" /> : <Heartbeat className="w-3.5 h-3.5" weight="bold" />}
                              {item.usiaInfo}
                            </span>
                          </td>
                          <td className="p-3 space-y-1">
                            <p className="font-semibold text-saas-dark">
                              BB: <span className="font-bold">{item.beratBadan} kg</span> | TB: <span className="font-bold">{item.tinggiBadan} cm</span>
                            </p>
                            {item.kategori === "Balita" ? (
                              <p className="text-[10px] text-saas-muted">
                                {item.lingkarKepala ? `LK: ${item.lingkarKepala}cm ` : ""}
                                {item.vitaminA ? "• Vit A ✓ " : ""}
                                {item.statusImunisasi ? `• Imunisasi: ${item.statusImunisasi}` : ""}
                              </p>
                            ) : (
                              <p className="text-[10px] text-saas-muted font-medium">
                                TD: <span className="font-bold text-saas-dark">{item.tekananDarah}</span> | GDS: <span className="font-bold text-saas-dark">{item.gds} mg/dL</span>
                                {item.kolesterol ? ` | Kol: ${item.kolesterol}` : ""}
                                {item.asamUrat ? ` | Urat: ${item.asamUrat}` : ""}
                              </p>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              item.isPerluRujukan 
                                ? "bg-amber-50 text-amber-700 border border-amber-200" 
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}>
                              {item.statusRingkasan}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedItem(item)}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-saas-primary hover:text-white text-saas-dark text-[11px] font-bold rounded-md transition-all"
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION CONTROLS */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-saas-muted">
                  Menampilkan <strong className="text-saas-dark">{(currentPage - 1) * pageSize + 1}</strong> s/d{" "}
                  <strong className="text-saas-dark">{Math.min(currentPage * pageSize, totalRecords)}</strong> dari{" "}
                  <strong className="text-saas-dark">{totalRecords}</strong> data pemeriksaan {activeTab.toLowerCase()}
                </p>

                <div className="flex items-center gap-1.5 self-center sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-saas-dark rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Lembar Pertama"
                  >
                    <CaretDoubleLeft className="w-3.5 h-3.5" weight="bold" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-saas-dark rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <CaretLeft className="w-3.5 h-3.5" weight="bold" /> Sebelum
                  </button>

                  <span className={`px-3 py-1.5 font-extrabold text-xs rounded-lg border ${
                    activeTab === "Balita" ? "bg-teal-50 text-saas-primary border-teal-200" : "bg-indigo-50 text-indigo-600 border-indigo-200"
                  }`}>
                    Lembar {currentPage} dari {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-saas-dark rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Sesudah <CaretRight className="w-3.5 h-3.5" weight="bold" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-saas-dark rounded-lg text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Lembar Terakhir"
                  >
                    <CaretDoubleRight className="w-3.5 h-3.5" weight="bold" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center space-y-2">
              <Info className="w-8 h-8 text-saas-muted mx-auto" weight="bold" />
              <p className="text-xs font-bold text-saas-dark">Tidak ada data pemeriksaan {activeTab.toLowerCase()} yang sesuai dengan filter.</p>
              <p className="text-[11px] text-saas-muted">Coba ubah kata kunci pencarian atau bersihkan filter di atas.</p>
              <button
                onClick={resetFilters}
                className="mt-2 px-3 py-1.5 bg-gray-100 text-xs font-bold text-saas-dark rounded-input hover:bg-gray-200"
              >
                Bersihkan Semua Filter
              </button>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200/80 py-6 text-center text-xs text-saas-muted print:hidden mt-8">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-bold text-saas-dark">Sistem Informasi Posyandu & Monitoring Puskesmas Terpadu</p>
          <p className="text-[11px]">Halaman pemantauan publik resmi untuk pemangku kepentingan kesehatan daerah.</p>
        </div>
      </footer>

      {/* FORMAL PRINT / PDF DOKUMEN LAPORAN RESMI PUSKESMAS (TAMPIL KHUSUS PRINT) */}
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
        </div>

        {/* EXECUTIF REKAPITULASI */}
        <div className="border border-black p-3 font-sans text-xs space-y-1">
          <p className="font-bold">Ringkasan Statistik Pemantauan {activeTab} Wilayah:</p>
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="border border-gray-400 p-1">Total {activeTab} Periksa: <strong>{totalRecords}</strong></div>
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

      {/* DETAIL MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-card max-w-lg w-full p-6 shadow-xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                  selectedItem.kategori === "Balita" ? "bg-saas-primary" : "bg-indigo-600"
                }`}>
                  {selectedItem.kategori === "Balita" ? <Baby className="w-5 h-5" weight="bold" /> : <Heartbeat className="w-5 h-5" weight="bold" />}
                </span>
                <div>
                  <h3 className="font-extrabold text-sm text-saas-dark">Detail Hasil Pemeriksaan {selectedItem.kategori}</h3>
                  <p className="text-[10px] text-saas-muted">Tanggal Periksa: {selectedItem.tanggalPeriksa}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-saas-muted font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-teal-50/60 border border-teal-150/60 rounded-xl space-y-1">
                <p className="text-[10px] font-bold uppercase text-teal-700">Identitas Warga</p>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-saas-dark text-sm">{selectedItem.namaWarga}</span>
                </div>
                <p className="text-saas-muted text-[11px]">
                  Kategori: <strong className="text-saas-dark">{selectedItem.kategori} ({selectedItem.usiaInfo})</strong> | Kelamin: {selectedItem.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}
                </p>
                <p className="text-saas-muted text-[11px]">
                  Posyandu: <strong className="text-saas-dark">{selectedItem.posyanduNama}</strong> ({selectedItem.wilayah})
                </p>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-3">
                <p className="font-bold text-saas-dark">Hasil Pengukuran Medis:</p>
                <div className="grid grid-cols-2 gap-2 text-saas-dark">
                  <div className="p-2.5 bg-gray-50 rounded-lg">
                    <span className="text-[10px] text-saas-muted block">Berat Badan</span>
                    <span className="font-extrabold text-sm">{selectedItem.beratBadan} kg</span>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-lg">
                    <span className="text-[10px] text-saas-muted block">Tinggi Badan</span>
                    <span className="font-extrabold text-sm">{selectedItem.tinggiBadan} cm</span>
                  </div>

                  {selectedItem.kategori === "Balita" ? (
                    <>
                      <div className="p-2.5 bg-gray-50 rounded-lg">
                        <span className="text-[10px] text-saas-muted block">Status TB/U (Stunting)</span>
                        <span className="font-bold">{selectedItem.statusTbU || "Normal"}</span>
                      </div>
                      <div className="p-2.5 bg-gray-50 rounded-lg">
                        <span className="text-[10px] text-saas-muted block">Status BB/U</span>
                        <span className="font-bold">{selectedItem.statusBbU || "Normal"}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-2.5 bg-gray-50 rounded-lg">
                        <span className="text-[10px] text-saas-muted block">Tekanan Darah</span>
                        <span className="font-bold text-sm">{selectedItem.tekananDarah}</span>
                      </div>
                      <div className="p-2.5 bg-gray-50 rounded-lg">
                        <span className="text-[10px] text-saas-muted block">Gula Darah Sewaktu</span>
                        <span className="font-bold text-sm">{selectedItem.gds} mg/dL</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {selectedItem.tindakanCatatan && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                  <p className="text-[10px] font-bold uppercase text-amber-800">Catatan Medis & Tindakan Rujukan</p>
                  <p className="text-xs text-amber-900 font-semibold">{selectedItem.tindakanCatatan}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 bg-saas-primary text-white font-bold text-xs rounded-input hover:bg-teal-600 transition-colors"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
