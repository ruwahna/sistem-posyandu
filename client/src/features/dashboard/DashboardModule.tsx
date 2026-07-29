"use client";

import { useState, useEffect } from "react";
import { dashboardApi, DashboardSummary } from "../../lib/api";
import Modal from "../../components/Modal";
import {
  ArrowUpRight,
  SlidersHorizontal,
  Download,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  Search,
  Baby,
  Heart,
  X,
  UserCheck2
} from "lucide-react";

interface DashboardModuleProps {
  searchQuery: string;
  onNavigate: (menu: string) => void;
  posyanduId: string;
}

interface Kunjungan {
  id: string;
  nama: string;
  tipe: "Balita" | "Lansia";
  detail: string;
  status: string;
  statusType: "success" | "warning" | "info";
  waktu: string;
}

// Mock patients list for selection inside modal
interface Pasien {
  id: string;
  nama: string;
  tipe: "Balita" | "Lansia";
  detailInfo: string; // "12 Bulan" or "RT 02"
}

const mockPasiens: Pasien[] = [
  { id: "b1", nama: "Andi Pratama", tipe: "Balita", detailInfo: "Usia 12 Bulan, Ibu: Siti" },
  { id: "b2", nama: "Citra Lestari", tipe: "Balita", detailInfo: "Usia 24 Bulan, Ibu: Endah" },
  { id: "b3", nama: "Aisyah Putri", tipe: "Balita", detailInfo: "Usia 6 Bulan, Ibu: Aminah" },
  { id: "b4", nama: "Budi Raharjo", tipe: "Balita", detailInfo: "Usia 47 Bulan, Ibu: Purwati" },
  { id: "l1", nama: "Mbah Karto", tipe: "Lansia", detailInfo: "RT 02 / RW 02, Dusun Karanggayam" },
  { id: "l2", nama: "Mbah Sumi", tipe: "Lansia", detailInfo: "RT 03 / RW 02, Dusun Karanggayam" },
  { id: "l3", nama: "Budi Santoso", tipe: "Lansia", detailInfo: "RT 01 / RW 02, Dusun Karanggayam" },
  { id: "l4", nama: "Mbah Harjo", tipe: "Lansia", detailInfo: "RT 01 / RW 02, Dusun Karanggayam" },
];

export default function DashboardModule({ searchQuery, onNavigate, posyanduId }: DashboardModuleProps) {
  const [activeTab, setActiveTab] = useState<"Semua" | "Balita" | "Lansia">("Semua");

  // ── API state ──────────────────────────────────────────────
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);

  useEffect(() => {
    setIsSummaryLoading(true);
    dashboardApi
      .getSummary(posyanduId)
      .then((res) => {
        if (res.success) setSummary(res.data);
      })
      .catch(console.error)
      .finally(() => setIsSummaryLoading(false));
  }, [posyanduId]);

  // Build kunjungan list from API data (recent pemeriksaan)
  const apiKunjungans: Kunjungan[] = [
    ...(summary?.pemeriksaanTerbaru.balita ?? []).map((p, i) => ({
      id: `b-${p.id ?? i}`,
      nama: p.balita.nama,
      tipe: "Balita" as const,
      detail: p.statusBbU ?? "-",
      status: "Selesai Periksa",
      statusType: "success" as const,
      waktu: new Date(p.tanggalPeriksa).toLocaleDateString("id-ID"),
    })),
    ...(summary?.pemeriksaanTerbaru.lansia ?? []).map((p, i) => ({
      id: `l-${p.id ?? i}`,
      nama: p.lansia.nama,
      tipe: "Lansia" as const,
      detail: `${p.tekananDarahSistol}/${p.tekananDarahDiastol} mmHg`,
      status: "Selesai Periksa",
      statusType: "success" as const,
      waktu: new Date(p.tanggalPeriksa).toLocaleDateString("id-ID"),
    })),
  ].sort(() => Math.random() - 0.5); // merge both lists

  // Real-time additions from quick-exam modal go here
  const [localKunjungans, setLocalKunjungans] = useState<Kunjungan[]>([]);
  const kunjungans = [...localKunjungans, ...apiKunjungans];

  // Modal State
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [selectedPasien, setSelectedPasien] = useState<Pasien | null>(null);

  // Form Fields - Common
  const [examDate, setExamDate] = useState("2026-07-28");
  const [examBB, setExamBB] = useState("");
  const [examTB, setExamTB] = useState("");

  // Form Fields - Balita
  const [examLK, setExamLK] = useState("");
  const [examBBU, setExamBBU] = useState("Normal");
  const [examTBU, setExamTBU] = useState("Normal");
  const [examBBTB, setExamBBTB] = useState("Normal");
  const [examVitA, setExamVitA] = useState(false);

  // Form Fields - Lansia
  const [examSistol, setExamSistol] = useState("");
  const [examDiastol, setExamDiastol] = useState("");
  const [examGds, setExamGds] = useState("");
  const [examLp, setExamLp] = useState("");

  // Warning & Success State
  const [modalError, setModalError] = useState("");
  const [modalWarning, setModalWarning] = useState("");
  const [toastSuccess, setToastSuccess] = useState("");

  // Filter Kunjungan
  const filteredKunjungan = kunjungans.filter((k) => {
    const matchesSearch = k.nama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "Semua" || k.tipe === activeTab;
    return matchesSearch && matchesTab;
  });

  // Filter Pasien in Modal
  const filteredPasiens = mockPasiens.filter((p) =>
    p.nama.toLowerCase().includes(modalSearch.toLowerCase())
  );

  // Warning Check
  const checkWarnings = (bbVal: string, sistolVal: string) => {
    setModalWarning("");
    if (!selectedPasien) return;

    const bb = parseFloat(bbVal);
    const sistol = parseInt(sistolVal);

    if (selectedPasien.tipe === "Balita" && bb > 25) {
      setModalWarning("Apakah Berat Badan (>25 kg) sudah sesuai untuk balita ini? Cek kembali.");
    } else if (selectedPasien.tipe === "Lansia" && sistol > 200) {
      setModalWarning("Tekanan darah sistol >200 mmHg sangat tinggi. Mohon rujuk lansia ke puskesmas.");
    }
  };

  // Submit Quick Exam
  const handleQuickExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");

    if (!selectedPasien) return;

    const bb = parseFloat(examBB);
    const tb = parseFloat(examTB);

    if (isNaN(bb) || bb <= 0 || isNaN(tb) || tb <= 0) {
      setModalError("Berat Badan dan Tinggi Badan wajib diisi angka positif.");
      return;
    }

    if (selectedPasien.tipe === "Lansia") {
      const sis = parseInt(examSistol);
      const dia = parseInt(examDiastol);
      const gds = parseInt(examGds);
      const lp = parseInt(examLp);

      if (isNaN(sis) || isNaN(dia) || isNaN(gds) || isNaN(lp)) {
        setModalError("Kolom tekanan darah, GDS, dan lingkar perut wajib diisi.");
        return;
      }
    }

    // Add locally to dashboard table (optimistic update)
    const timeNow = new Date();
    const timeStr = `${String(timeNow.getHours()).padStart(2, "0")}:${String(timeNow.getMinutes()).padStart(2, "0")} WIB`;
    const newKunjungan: Kunjungan = {
      id: `quick-${Date.now()}`,
      nama: selectedPasien.nama,
      tipe: selectedPasien.tipe,
      detail: selectedPasien.tipe === "Balita" ? "Baru di-input" : "-",
      status: "Selesai Periksa",
      statusType: "success",
      waktu: timeStr,
    };

    setLocalKunjungans((prev) => [newKunjungan, ...prev]);
    setToastSuccess(`Pemeriksaan untuk ${selectedPasien.nama} berhasil dicatat.`);
    
    // Close & Reset
    setIsOpenModal(false);
    setSelectedPasien(null);
    setModalSearch("");
    setExamBB("");
    setExamTB("");
    setExamLK("");
    setExamSistol("");
    setExamDiastol("");
    setExamGds("");
    setExamLp("");
    setModalWarning("");

    setTimeout(() => setToastSuccess(""), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Toast Success Alert */}
      {toastSuccess && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-green-50 text-trend-successText border border-green-150 rounded-card shadow-lg flex items-center gap-2.5">
          <UserCheck2 className="w-5 h-5 text-green-600 shrink-0" />
          <span className="text-xs font-bold">{toastSuccess}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-hairline pb-6">
        <div>
          <span className="inline-block px-2.5 py-0.5 bg-teal-50 text-saas-primary rounded-pill text-[11px] font-semibold tracking-wide uppercase mb-1">
            Ringkasan Real-Time
          </span>
          <h2 className="text-3xl font-normal text-saas-dark tracking-tight">Dashboard Overview</h2>
          <p className="text-sm text-saas-muted mt-1 font-normal">
            Pantau pertumbuhan anak dan kondisi kesehatan lansia secara terpusat.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpenModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-saas-primary hover:bg-saas-primary-active text-white text-xs font-semibold rounded-pill transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Catat Pemeriksaan
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-hairline rounded-pill bg-white text-xs font-semibold text-saas-dark hover:bg-surface-soft transition-all">
            <Download className="w-3.5 h-3.5 text-saas-muted" /> Export Data
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards Grid — Unified Coinbase Feature Card Layout with Unique Brand Palettes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Toska / Mint (Total Balita) */}
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-card p-6 relative overflow-hidden flex flex-col justify-between h-44 shadow-soft-card group text-white">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
          <button 
            onClick={() => onNavigate("Balita")}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/30 transition-colors z-10"
          >
            <ArrowUpRight className="w-4 h-4 text-white" />
          </button>
          
          <div>
            <span className="text-[11px] uppercase tracking-wider text-white/80 font-medium">Total Balita</span>
            <h3 className="text-3xl font-mono font-medium mt-1">
              {isSummaryLoading ? "…" : `${summary?.totalBalita ?? 0}`}
            </h3>
            <span className="text-xs text-white/70 font-sans">Anak Terdaftar</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-white/90 z-10">
            <span className="px-2.5 py-0.5 rounded-pill bg-white/20 text-white text-[10px] font-mono">LIVE</span>
            <span>Update Hari Ini</span>
          </div>
        </div>

        {/* Card 2: Royal Blue / Indigo (Total Lansia) */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-card p-6 relative overflow-hidden flex flex-col justify-between h-44 shadow-soft-card group text-white">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
          <button 
            onClick={() => onNavigate("Lansia")}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/30 transition-colors z-10"
          >
            <ArrowUpRight className="w-4 h-4 text-white" />
          </button>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-white/80 font-medium">Total Lansia</span>
            <h3 className="text-3xl font-mono font-medium mt-1">
              {isSummaryLoading ? "…" : `${summary?.totalLansia ?? 0}`}
            </h3>
            <span className="text-xs text-white/70 font-sans">Jiwa Terdaftar</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-white/90 z-10">
            <span className="px-2.5 py-0.5 rounded-pill bg-white/20 text-white text-[10px] font-mono">TERPANTAU</span>
            <span>Pemeriksaan Rutin</span>
          </div>
        </div>

        {/* Card 3: Rose / Crimson (Balita Gizi Kurang) */}
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-card p-6 relative overflow-hidden flex flex-col justify-between h-44 shadow-soft-card group text-white">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
          <button 
            onClick={() => onNavigate("Balita")}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/30 transition-colors z-10"
          >
            <AlertCircle className="w-4 h-4 text-white" />
          </button>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-white/80 font-medium">Perhatian Gizi</span>
            <h3 className="text-3xl font-mono font-medium mt-1">
              {isSummaryLoading ? "…" : `${(summary?.statusGizi?.bbU?.["Kurang"] ?? 0) + (summary?.statusGizi?.bbU?.["Sangat Kurang"] ?? 0)}`}
            </h3>
            <span className="text-xs text-white/70 font-sans">Balita Kurang Gizi</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-white/90 z-10">
            <span className="px-2.5 py-0.5 rounded-pill bg-white/20 text-white text-[10px] font-mono">PRIORITAS</span>
            <span>Perlu Pendampingan</span>
          </div>
        </div>

        {/* Card 4: Coinbase Dark Ink / Slate (Lansia Hipertensi) */}
        <div className="bg-gradient-to-br from-slate-900 to-surface-dark rounded-card p-6 relative overflow-hidden flex flex-col justify-between h-44 shadow-elevated group text-white border border-white/10">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-amber-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
          <button 
            onClick={() => onNavigate("Lansia")}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-10"
          >
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
          </button>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-saas-muted-soft font-medium">Kesehatan Lansia</span>
            <h3 className="text-3xl font-mono font-medium mt-1 text-white">
              {isSummaryLoading ? "…" : `${summary?.lansiaHtDm?.totalHt ?? 0}`}
            </h3>
            <span className="text-xs text-saas-muted-soft font-sans">Riwayat Hipertensi</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-amber-300 z-10">
            <span className="px-2.5 py-0.5 rounded-pill bg-amber-500/20 text-amber-300 text-[10px] font-mono font-semibold">MONITORING</span>
            <span className="text-saas-muted-soft">Kontrol Berkala</span>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tren Status Gizi Balita (Bar Chart) */}
        <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-saas-dark">Tren Status Gizi Balita</h3>
              <p className="text-xs text-saas-muted mt-0.5">Distribusi hasil pemeriksaan bulanan 2026</p>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1">
              <button className="text-xs px-3 py-1.5 rounded-md font-bold bg-white text-saas-dark shadow-sm">
                Bulanan
              </button>
              <button className="text-xs px-3 py-1.5 rounded-md font-bold text-saas-muted hover:text-saas-dark">
                Tahunan
              </button>
            </div>
          </div>

          <div className="h-64 flex flex-col justify-between">
            <div className="flex-1 flex items-end justify-between px-4 pb-2 border-b border-gray-100 relative">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-full border-t border-dashed border-gray-100/80"></div>
                ))}
              </div>

              {[
                { bln: "Jan", val: 82, val2: 12 },
                { bln: "Feb", val: 85, val2: 10 },
                { bln: "Mar", val: 90, val2: 8 },
                { bln: "Apr", val: 78, val2: 15 },
                { bln: "Mei", val: 95, val2: 3 },
                { bln: "Jun", val: 88, val2: 9 },
                { bln: "Jul", val: 92, val2: 6 },
              ].map((data, index) => (
                <div key={index} className="flex flex-col items-center gap-2 z-10 w-8 group">
                  <div className="w-full flex justify-center gap-0.5 items-end h-48 relative">
                    <div className="absolute -top-10 bg-saas-dark text-white text-[10px] py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none z-20">
                      Normal: {data.val}% | Kurang: {data.val2}%
                    </div>
                    <div
                      style={{ height: `${data.val * 0.45}%` }}
                      className="w-3 bg-saas-primary rounded-t-full transition-all duration-700 hover:opacity-85"
                    ></div>
                    <div
                      style={{ height: `${data.val2 * 0.45}%` }}
                      className="w-3 bg-trend-dangerText/80 rounded-t-full transition-all duration-700 hover:opacity-85"
                    ></div>
                  </div>
                  <span className="text-[10px] text-saas-muted font-semibold">{data.bln}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 mt-4 px-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-saas-primary"></span>
                <span className="text-xs text-saas-muted font-medium">Balita Gizi Normal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-trend-dangerText/80"></span>
                <span className="text-xs text-saas-muted font-medium">Balita Gizi Kurang</span>
              </div>
            </div>
          </div>
        </div>

        {/* Aktivitas Kunjungan (Donut Chart) */}
        <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-saas-dark">Aktivitas Kunjungan</h3>
              <p className="text-xs text-saas-muted mt-0.5">Tingkat partisipasi kader & posyandu</p>
            </div>
            <button className="text-saas-muted hover:text-saas-dark transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#F3F4F6"
                  strokeWidth="10"
                  strokeDasharray="251.2"
                  strokeDashoffset="62.8"
                  strokeLinecap="round"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#14B8A6"
                  strokeWidth="10"
                  strokeDasharray="251.2"
                  strokeDashoffset="110"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-2xl font-black text-saas-dark leading-none">78%</span>
                <span className="text-[10px] text-saas-muted font-bold uppercase tracking-wider mt-1">Selesai</span>
              </div>
            </div>

            <div className="w-full space-y-3 mt-6">
              {[
                { label: "Balita Selesai Periksa", count: "45 Anak", color: "bg-saas-primary" },
                { label: "Lansia Selesai Periksa", count: "23 Lansia", color: "bg-green-500" },
                { label: "Belum Mengisi Data", count: "12 Orang", color: "bg-yellow-400" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs border-b border-gray-50 pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                    <span className="text-saas-muted font-semibold">{item.label}</span>
                  </div>
                  <span className="font-bold text-saas-dark">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kunjungan Terakhir Table */}
        <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h3 className="font-bold text-base text-saas-dark">Riwayat Antrean & Kunjungan Hari Ini</h3>
              <p className="text-xs text-saas-muted mt-0.5">Daftar pemeriksaan pelayanan posyandu terkini</p>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1 border border-gray-100/50">
              {(["Semua", "Balita", "Lansia"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs px-3.5 py-1.5 rounded-md font-bold transition-all ${
                    activeTab === tab 
                      ? "bg-white text-saas-primary shadow-sm" 
                      : "text-saas-muted hover:text-saas-dark"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-saas-muted uppercase tracking-wider">
                  <th className="pb-3 text-left">Nama</th>
                  <th className="pb-3">Kategori</th>
                  <th className="pb-3">Keterangan</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Jam Periksa</th>
                </tr>
              </thead>
              <tbody>
                {filteredKunjungan.length > 0 ? (
                  filteredKunjungan.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40 transition-colors text-sm">
                      <td className="py-4 font-bold text-saas-dark">{item.nama}</td>
                      <td className="py-4 text-saas-muted font-medium">{item.tipe}</td>
                      <td className="py-4 text-saas-muted font-medium">{item.detail}</td>
                      <td className="py-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                            item.statusType === "success"
                              ? "bg-trend-successBg text-trend-successText"
                              : item.statusType === "warning"
                              ? "bg-trend-dangerBg text-trend-dangerText"
                              : "bg-blue-50 text-saas-primary"
                          }`}
                        >
                          {item.statusType === "success" && <CheckCircle2 className="w-3 h-3" />}
                          {item.statusType === "warning" && <AlertCircle className="w-3 h-3" />}
                          {item.statusType === "info" && <Clock className="w-3 h-3" />}
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 text-right text-saas-muted font-semibold">{item.waktu}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-saas-muted font-medium">
                      Tidak menemukan data kunjungan yang cocok
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Distribusi RT/RW */}
        <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-saas-dark">Distribusi Kehadiran RT/RW</h3>
              <p className="text-xs text-saas-muted mt-0.5">Tingkat kehadiran per wilayah</p>
            </div>
            <button className="text-saas-muted hover:text-saas-dark transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {[
              { region: "RT 01 / RW 02", percent: 84, color: "bg-saas-primary" },
              { region: "RT 02 / RW 02", percent: 72, color: "bg-green-500" },
              { region: "RT 03 / RW 02", percent: 65, color: "bg-indigo-500" },
              { region: "RT 04 / RW 02", percent: 48, color: "bg-yellow-400" },
              { region: "RT 05 / RW 02", percent: 30, color: "bg-red-400" },
            ].map((row, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-saas-dark font-bold">{row.region}</span>
                  <span className="text-saas-muted font-bold">{row.percent}%</span>
                </div>
                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100/20">
                  <div style={{ width: `${row.percent}%` }} className={`h-full rounded-full ${row.color}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE MODAL: QUICK EXAMINATION INPUT */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isOpenModal}
        onClose={() => {
          setIsOpenModal(false);
          setSelectedPasien(null);
          setModalSearch("");
        }}
        title="Catat Pemeriksaan Cepat"
        description="Input rekam medis bulanan langsung tanpa membuka detail profil."
        type="modal"
      >
        {!selectedPasien ? (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ketik nama balita atau lansia..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                  />
                  <Search className="absolute left-3.5 top-3 text-saas-muted w-4 h-4" />
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {filteredPasiens.length > 0 ? (
                    filteredPasiens.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPasien(p)}
                        className="w-full text-left p-3 border border-gray-100 hover:border-saas-primary/30 hover:bg-gray-50/50 rounded-xl flex items-center justify-between text-xs transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            p.tipe === "Balita" ? "bg-teal-50 text-saas-primary" : "bg-red-50 text-red-500"
                          }`}>
                            {p.tipe === "Balita" ? <Baby className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-saas-dark group-hover:text-saas-primary transition-colors">{p.nama}</p>
                            <p className="text-[10px] text-saas-muted font-semibold mt-0.5">{p.detailInfo}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-saas-muted group-hover:text-saas-primary transition-colors">Pilih & Lanjut →</span>
                      </button>
                    ))
                  ) : (
                    <p className="text-center text-xs text-saas-muted py-6 font-semibold">Nama warga tidak ditemukan.</p>
                  )}
                </div>
              </div>
            ) : (
              // Step 2: Show Form based on Patient Type
              <form onSubmit={handleQuickExamSubmit} className="space-y-4">
                {modalError && (
                  <div className="p-3 bg-red-50 text-trend-dangerText border border-red-100 rounded-lg text-xs font-bold flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {modalError}
                  </div>
                )}
                {modalWarning && (
                  <div className="p-3 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded-lg text-xs font-semibold flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {modalWarning}
                  </div>
                )}

                {/* Selected patient preview box */}
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-saas-dark">Mencatat data untuk:</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      selectedPasien.tipe === "Balita" ? "bg-teal-50 text-saas-primary" : "bg-red-50 text-red-500"
                    }`}>
                      {selectedPasien.nama} ({selectedPasien.tipe})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPasien(null);
                      setModalWarning("");
                      setModalError("");
                    }}
                    className="text-xs text-saas-primary font-bold hover:underline"
                  >
                    Ganti
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-50 pt-3">
                  {/* Tanggal */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-saas-muted uppercase">Tanggal Periksa</label>
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                    />
                  </div>

                  {/* BB */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-saas-muted uppercase">Berat Badan (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Cth: 8.5"
                      value={examBB}
                      onChange={(e) => {
                        setExamBB(e.target.value);
                        checkWarnings(e.target.value, examSistol);
                      }}
                      className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                    />
                  </div>

                  {/* TB */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-saas-muted uppercase">Tinggi Badan (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Cth: 72"
                      value={examTB}
                      onChange={(e) => setExamTB(e.target.value)}
                      className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                    />
                  </div>
                </div>

                {/* Balita Specific Inputs */}
                {selectedPasien.tipe === "Balita" && (
                  <div className="space-y-4 border-t border-gray-50 pt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Lingkar Kepala */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-saas-muted uppercase">Lingkar Kepala (cm)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Opsional, cth: 44"
                          value={examLK}
                          onChange={(e) => setExamLK(e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                        />
                      </div>

                      {/* Vit A */}
                      <div className="flex items-center pb-2 pl-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={examVitA}
                            onChange={(e) => setExamVitA(e.target.checked)}
                            className="w-4.5 h-4.5 text-saas-primary focus:ring-saas-primary/30"
                          />
                          <span className="text-xs font-bold text-saas-dark">Pemberian Vitamin A</span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                      {/* WHO Statuses */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-saas-muted uppercase">Status BB/U</label>
                        <select
                          value={examBBU}
                          onChange={(e) => setExamBBU(e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                        >
                          <option value="Normal">Normal</option>
                          <option value="Kurang">Kurang</option>
                          <option value="Sangat Kurang">Sangat Kurang</option>
                          <option value="Lebih">Lebih</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-saas-muted uppercase">Status TB/U</label>
                        <select
                          value={examTBU}
                          onChange={(e) => setExamTBU(e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                        >
                          <option value="Normal">Normal</option>
                          <option value="Pendek">Pendek</option>
                          <option value="Sangat Pendek">Sangat Pendek</option>
                          <option value="Tinggi">Tinggi</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-saas-muted uppercase">Status BB/TB</label>
                        <select
                          value={examBBTB}
                          onChange={(e) => setExamBBTB(e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                        >
                          <option value="Normal">Normal</option>
                          <option value="Kurus">Kurus</option>
                          <option value="Sangat Kurus">Sangat Kurus</option>
                          <option value="Gemuk">Gemuk</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lansia Specific Inputs */}
                {selectedPasien.tipe === "Lansia" && (
                  <div className="space-y-4 border-t border-gray-50 pt-3">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Sistol */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-saas-muted uppercase">Sistol (mmHg)</label>
                        <input
                          type="number"
                          placeholder="TD atas, cth: 130"
                          value={examSistol}
                          onChange={(e) => {
                            setExamSistol(e.target.value);
                            checkWarnings(examBB, e.target.value);
                          }}
                          className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                        />
                      </div>

                      {/* Diastol */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-saas-muted uppercase">Diastol (mmHg)</label>
                        <input
                          type="number"
                          placeholder="TD bawah, cth: 85"
                          value={examDiastol}
                          onChange={(e) => setExamDiastol(e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* GDS */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-saas-muted uppercase">Gula Darah (GDS - mg/dL)</label>
                        <input
                          type="number"
                          placeholder="Cth: 120"
                          value={examGds}
                          onChange={(e) => setExamGds(e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                        />
                      </div>

                      {/* Lingkar Perut */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-saas-muted uppercase">Lingkar Perut (cm)</label>
                        <input
                          type="number"
                          placeholder="Cth: 90"
                          value={examLp}
                          onChange={(e) => setExamLp(e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-gray-50 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPasien(null);
                      setModalError("");
                      setModalWarning("");
                    }}
                    className="px-4 py-2 border border-gray-200 text-saas-dark text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-lg shadow-md shadow-teal-500/10 transition-colors"
                  >
                    Simpan Hasil Pemeriksaan
                  </button>
                </div>
              </form>
            )}
      </Modal>
    </div>
  );
}
