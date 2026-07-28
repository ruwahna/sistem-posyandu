"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Baby,
  Calendar,
  User,
  MapPin,
  Heart,
  Activity,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Trash2,
  ChevronRight
} from "lucide-react";

// Tipe Data
export interface PemeriksaanBalita {
  id: string;
  tanggalPeriksa: string;
  usiaBulan: number;
  beratBadan: number; // kg
  tinggiBadan: number; // cm
  lingkarKepala?: number; // cm
  statusBBU: "Sangat Kurang" | "Kurang" | "Normal" | "Lebih";
  statusTBU: "Sangat Pendek" | "Pendek" | "Normal" | "Tinggi";
  statusBBTB: "Sangat Kurus" | "Kurus" | "Normal" | "Gemuk";
  vitaminA: boolean;
}

export interface Balita {
  id: string;
  nama: string;
  nik?: string;
  tanggalLahir: string;
  jenisKelamin: "L" | "P";
  namaIbu: string;
  alamat: string;
  pemeriksaan: PemeriksaanBalita[];
}

// Initial Mock Data
const initialBalitas: Balita[] = [
  {
    id: "b1",
    nama: "Andi Pratama",
    nik: "3301021207250001",
    tanggalLahir: "2025-07-12", // 12 Bulan pada Juli 2026
    jenisKelamin: "L",
    namaIbu: "Siti Rahmawati",
    alamat: "RT 01 / RW 02, Desa Karanggayam",
    pemeriksaan: [
      { id: "e1", tanggalPeriksa: "2026-07-10", usiaBulan: 12, beratBadan: 9.5, tinggiBadan: 74.2, lingkarKepala: 45.2, statusBBU: "Normal", statusTBU: "Normal", statusBBTB: "Normal", vitaminA: true },
      { id: "e2", tanggalPeriksa: "2026-06-10", usiaBulan: 11, beratBadan: 9.1, tinggiBadan: 73.0, lingkarKepala: 44.8, statusBBU: "Normal", statusTBU: "Normal", statusBBTB: "Normal", vitaminA: false },
      { id: "e3", tanggalPeriksa: "2026-05-10", usiaBulan: 10, beratBadan: 8.6, tinggiBadan: 71.5, lingkarKepala: 44.2, statusBBU: "Kurang", statusTBU: "Normal", statusBBTB: "Normal", vitaminA: false },
    ],
  },
  {
    id: "b2",
    nama: "Citra Lestari",
    nik: "3301024507240003",
    tanggalLahir: "2024-07-24", // 24 Bulan
    jenisKelamin: "P",
    namaIbu: "Endah Lestari",
    alamat: "RT 02 / RW 02, Desa Karanggayam",
    pemeriksaan: [
      { id: "e4", tanggalPeriksa: "2026-07-10", usiaBulan: 24, beratBadan: 11.8, tinggiBadan: 86.5, lingkarKepala: 48.0, statusBBU: "Normal", statusTBU: "Normal", statusBBTB: "Normal", vitaminA: true },
      { id: "e5", tanggalPeriksa: "2026-06-10", usiaBulan: 23, beratBadan: 11.4, tinggiBadan: 85.0, lingkarKepala: 47.6, statusBBU: "Normal", statusTBU: "Normal", statusBBTB: "Normal", vitaminA: false },
    ],
  },
  {
    id: "b3",
    nama: "Aisyah Putri",
    nik: "3301025801260002",
    tanggalLahir: "2026-01-28", // 6 Bulan
    jenisKelamin: "P",
    namaIbu: "Aminah Purwati",
    alamat: "RT 03 / RW 02, Desa Karanggayam",
    pemeriksaan: [
      { id: "e6", tanggalPeriksa: "2026-07-10", usiaBulan: 6, beratBadan: 7.2, tinggiBadan: 64.0, lingkarKepala: 42.5, statusBBU: "Normal", statusTBU: "Normal", statusBBTB: "Normal", vitaminA: true },
    ],
  },
  {
    id: "b4",
    nama: "Budi Raharjo",
    nik: "3301021908220005",
    tanggalLahir: "2022-08-19", // 47 Bulan
    jenisKelamin: "L",
    namaIbu: "Purwati Ningsih",
    alamat: "RT 01 / RW 02, Desa Karanggayam",
    pemeriksaan: [
      { id: "e7", tanggalPeriksa: "2026-07-10", usiaBulan: 47, beratBadan: 13.5, tinggiBadan: 98.2, lingkarKepala: 50.1, statusBBU: "Normal", statusTBU: "Normal", statusBBTB: "Kurus", vitaminA: false },
    ],
  },
];

// Helper Hitung Usia (Bulan)
function calculateAgeInMonths(birthDateStr: string, refDateStr: string = "2026-07-28"): number {
  const birth = new Date(birthDateStr);
  const ref = new Date(refDateStr);
  let months = (ref.getFullYear() - birth.getFullYear()) * 12;
  months -= birth.getMonth();
  months += ref.getMonth();
  return months <= 0 ? 0 : months;
}

export default function BalitaModule() {
  const [balitas, setBalitas] = useState<Balita[]>(initialBalitas);
  const [view, setView] = useState<"list" | "detail" | "add">("list");
  const [selectedBalitaId, setSelectedBalitaId] = useState<string | null>(null);
  
  // Search & Filter State
  const [query, setQuery] = useState("");
  const [ageFilter, setAgeFilter] = useState<"semua" | "0-6" | "7-12" | "13-24" | "25-60">("semua");

  // Form State Tambah Balita
  const [formNama, setFormNama] = useState("");
  const [formNik, setFormNik] = useState("");
  const [formTglLahir, setFormTglLahir] = useState("2025-01-01");
  const [formJk, setFormJk] = useState<"L" | "P">("L");
  const [formNamaIbu, setFormNamaIbu] = useState("");
  const [formAlamat, setFormAlamat] = useState("");
  const [formError, setFormError] = useState("");

  // Form State Tambah Pemeriksaan
  const [examDate, setExamDate] = useState("2026-07-10");
  const [examBB, setExamBB] = useState("");
  const [examTB, setExamTB] = useState("");
  const [examLK, setExamLK] = useState("");
  const [examBBU, setExamBBU] = useState<PemeriksaanBalita["statusBBU"]>("Normal");
  const [examTBU, setExamTBU] = useState<PemeriksaanBalita["statusTBU"]>("Normal");
  const [examBBTB, setExamBBTB] = useState<PemeriksaanBalita["statusBBTB"]>("Normal");
  const [examVitA, setExamVitA] = useState(false);
  const [examWarning, setExamWarning] = useState("");
  const [examError, setExamError] = useState("");

  const activeBalita = balitas.find((b) => b.id === selectedBalitaId);

  // Filter List Balita
  const filteredBalitas = balitas.filter((b) => {
    const ageMonths = calculateAgeInMonths(b.tanggalLahir);
    const matchesSearch = b.nama.toLowerCase().includes(query.toLowerCase()) || 
                          (b.nik && b.nik.includes(query)) ||
                          b.namaIbu.toLowerCase().includes(query.toLowerCase());
    
    let matchesAge = true;
    if (ageFilter === "0-6") matchesAge = ageMonths >= 0 && ageMonths <= 6;
    else if (ageFilter === "7-12") matchesAge = ageMonths >= 7 && ageMonths <= 12;
    else if (ageFilter === "13-24") matchesAge = ageMonths >= 13 && ageMonths <= 24;
    else if (ageFilter === "25-60") matchesAge = ageMonths >= 25 && ageMonths <= 60;

    return matchesSearch && matchesAge;
  });

  // Handler Submit Tambah Balita
  const handleAddBalitaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formNama.trim() || !formNamaIbu.trim() || !formAlamat.trim()) {
      setFormError("Mohon isi nama lengkap, nama ibu, dan alamat.");
      return;
    }

    if (formNik && formNik.length !== 16) {
      setFormError("Format NIK salah. NIK harus berjumlah 16 digit angka.");
      return;
    }

    const newBalita: Balita = {
      id: `b_${Date.now()}`,
      nama: formNama,
      nik: formNik || undefined,
      tanggalLahir: formTglLahir,
      jenisKelamin: formJk,
      namaIbu: formNamaIbu,
      alamat: formAlamat,
      pemeriksaan: [],
    };

    setBalitas([newBalita, ...balitas]);
    // Reset Form
    setFormNama("");
    setFormNik("");
    setFormTglLahir("2025-01-01");
    setFormJk("L");
    setFormNamaIbu("");
    setFormAlamat("");
    setView("list");
  };

  // Handler Real-time Warning untuk input Pemeriksaan (Manusiawi)
  const handleExamInputCheck = (bbVal: string, tbVal: string) => {
    setExamWarning("");
    if (!activeBalita) return;

    const bb = parseFloat(bbVal);
    const tb = parseFloat(tbVal);
    const usia = calculateAgeInMonths(activeBalita.tanggalLahir, examDate);

    // Warning BB tidak masuk akal untuk bayi
    if (bb > 25 && usia < 18) {
      setExamWarning(`Apakah Berat Badan (${bb} kg) sudah benar untuk anak usia ${usia} bulan? Mohon cek kembali inputan Ibu.`);
    }
    // Warning TB tidak masuk akal
    else if (tb > 120 && usia < 24) {
      setExamWarning(`Apakah Tinggi Badan (${tb} cm) sudah benar untuk anak usia ${usia} bulan? Mohon cek kembali inputan Ibu.`);
    }
  };

  // Handler Submit Tambah Pemeriksaan
  const handleAddExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setExamError("");

    const bb = parseFloat(examBB);
    const tb = parseFloat(examTB);
    const lk = examLK ? parseFloat(examLK) : undefined;

    if (isNaN(bb) || bb <= 0 || isNaN(tb) || tb <= 0) {
      setExamError("Berat Badan dan Tinggi Badan harus diisi dengan angka positif.");
      return;
    }

    if (!activeBalita) return;

    const newExam: PemeriksaanBalita = {
      id: `e_${Date.now()}`,
      tanggalPeriksa: examDate,
      usiaBulan: calculateAgeInMonths(activeBalita.tanggalLahir, examDate),
      beratBadan: bb,
      tinggiBadan: tb,
      lingkarKepala: lk,
      statusBBU: examBBU,
      statusTBU: examTBU,
      statusBBTB: examBBTB,
      vitaminA: examVitA,
    };

    // Update state balitas
    const updatedBalitas = balitas.map((b) => {
      if (b.id === activeBalita.id) {
        return {
          ...b,
          pemeriksaan: [newExam, ...b.pemeriksaan],
        };
      }
      return b;
    });

    setBalitas(updatedBalitas);
    // Reset Form Pemeriksaan
    setExamBB("");
    setExamTB("");
    setExamLK("");
    setExamBBU("Normal");
    setExamTBU("Normal");
    setExamBBTB("Normal");
    setExamVitA(false);
    setExamWarning("");
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. VIEW: LIST BALITA */}
      {/* ========================================================================= */}
      {view === "list" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-saas-dark tracking-tight">Data Balita</h2>
              <p className="text-sm text-saas-muted mt-0.5">Kelola identitas dan riwayat tumbuh kembang anak.</p>
            </div>
            <button
              onClick={() => setView("add")}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-all"
            >
              <Plus className="w-4 h-4" /> Tambah Balita Baru
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-card border border-gray-100/50 shadow-soft-card">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Cari nama, NIK, atau nama ibu..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50/70 border border-gray-100 rounded-input text-sm text-saas-dark placeholder-saas-muted/70 focus:outline-none focus:border-saas-primary/50 focus:bg-white transition-all"
              />
              <Search className="absolute left-3.5 top-2.5 text-saas-muted/80 w-4 h-4" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-saas-muted mr-1">Filter Usia:</span>
              {[
                { label: "Semua Usia", val: "semua" },
                { label: "0-6 Bulan", val: "0-6" },
                { label: "7-12 Bulan", val: "7-12" },
                { label: "13-24 Bulan", val: "13-24" },
                { label: "25-60 Bulan", val: "25-60" },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => setAgeFilter(item.val as any)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                    ageFilter === item.val
                      ? "bg-saas-primary/10 text-saas-primary border border-saas-primary/20"
                      : "bg-gray-50 text-saas-muted hover:text-saas-dark border border-transparent"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold text-saas-muted uppercase tracking-wider">
                    <th className="pb-3">Nama Lengkap</th>
                    <th className="pb-3">Usia (Bulan)</th>
                    <th className="pb-3">Jenis Kelamin</th>
                    <th className="pb-3">Nama Ibu</th>
                    <th className="pb-3">Status Gizi (BB/U)</th>
                    <th className="pb-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBalitas.length > 0 ? (
                    filteredBalitas.map((item) => {
                      const ageMonths = calculateAgeInMonths(item.tanggalLahir);
                      const latestExam = item.pemeriksaan[0]; // Teratas/terbaru
                      return (
                        <tr key={item.id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40 transition-colors text-sm">
                          <td className="py-4">
                            <p className="font-bold text-saas-dark">{item.nama}</p>
                            <p className="text-[11px] text-saas-muted font-medium mt-0.5">NIK: {item.nik || "-"}</p>
                          </td>
                          <td className="py-4 font-bold text-saas-dark">{ageMonths} Bulan</td>
                          <td className="py-4 font-semibold text-saas-muted">{item.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"}</td>
                          <td className="py-4 text-saas-muted font-semibold">{item.namaIbu}</td>
                          <td className="py-4">
                            {latestExam ? (
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                                  latestExam.statusBBU === "Normal"
                                    ? "bg-trend-successBg text-trend-successText"
                                    : latestExam.statusBBU === "Kurang" || latestExam.statusBBU === "Sangat Kurang"
                                    ? "bg-trend-dangerBg text-trend-dangerText"
                                    : "bg-blue-50 text-saas-primary"
                                }`}
                              >
                                {latestExam.statusBBU === "Normal" ? (
                                  <CheckCircle2 className="w-3 h-3" />
                                ) : (
                                  <AlertCircle className="w-3 h-3" />
                                )}
                                {latestExam.statusBBU}
                              </span>
                            ) : (
                              <span className="text-xs text-saas-muted italic">Belum periksa</span>
                            )}
                          </td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedBalitaId(item.id);
                                setView("detail");
                              }}
                              className="px-3 py-1.5 bg-gray-50 hover:bg-saas-primary/10 hover:text-saas-primary border border-gray-100 rounded-input text-xs font-bold text-saas-dark transition-all inline-flex items-center gap-1"
                            >
                              Detail Data <ChevronRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-saas-muted font-medium">
                        Tidak ada data balita yang cocok.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VIEW: DETAIL BALITA & RIWAYAT BULANAN */}
      {/* ========================================================================= */}
      {view === "detail" && activeBalita && (
        <div className="space-y-8">
          {/* Back Action Header */}
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-2 text-xs font-bold text-saas-muted hover:text-saas-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Balita
          </button>

          {/* Profile Card & Input Pemeriksaan Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profil Balita */}
            <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 flex flex-col justify-between h-fit space-y-6">
              <div>
                <div className="w-12 h-12 rounded-xl bg-saas-primary/10 flex items-center justify-center text-saas-primary mb-4">
                  <Baby className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-saas-dark tracking-tight">{activeBalita.nama}</h3>
                <p className="text-xs text-saas-muted font-semibold mt-1">NIK: {activeBalita.nik || "Tidak terdaftar"}</p>
              </div>

              <div className="space-y-4 border-t border-gray-50 pt-4 text-sm font-semibold">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4.5 h-4.5 text-saas-muted mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-saas-muted">Tanggal Lahir & Usia</p>
                    <p className="text-saas-dark text-xs mt-0.5">
                      {activeBalita.tanggalLahir} ({calculateAgeInMonths(activeBalita.tanggalLahir)} Bulan)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-4.5 h-4.5 text-saas-muted mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-saas-muted">Nama Ibu</p>
                    <p className="text-saas-dark text-xs mt-0.5">{activeBalita.namaIbu}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4.5 h-4.5 text-saas-muted mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-saas-muted">Alamat Rumah</p>
                    <p className="text-saas-dark text-xs mt-0.5 leading-snug">{activeBalita.alamat}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Pemeriksaan Baru Bulan Ini */}
            <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 lg:col-span-2 space-y-6">
              <div>
                <h3 className="font-bold text-base text-saas-dark">Input Hasil Pemeriksaan Bulan Ini</h3>
                <p className="text-xs text-saas-muted mt-0.5">Masukkan data pengukuran BB, TB, LK, dan vitamin.</p>
              </div>

              {/* Form Input */}
              <form onSubmit={handleAddExamSubmit} className="space-y-4">
                {examError && (
                  <div className="p-3 bg-red-50 text-trend-dangerText border border-red-100 rounded-lg text-xs font-bold flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {examError}
                  </div>
                )}
                {examWarning && (
                  <div className="p-3 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded-lg text-xs font-semibold flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {examWarning}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Tanggal */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-saas-muted">Tanggal Periksa</label>
                    <input
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                    />
                  </div>

                  {/* Berat Badan */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-saas-muted">Berat Badan (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Contoh: 8.5"
                      value={examBB}
                      onChange={(e) => {
                        setExamBB(e.target.value);
                        handleExamInputCheck(e.target.value, examTB);
                      }}
                      className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                    />
                  </div>

                  {/* Tinggi Badan */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-saas-muted">Tinggi Badan (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Contoh: 72.4"
                      value={examTB}
                      onChange={(e) => {
                        setExamTB(e.target.value);
                        handleExamInputCheck(examBB, e.target.value);
                      }}
                      className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Lingkar Kepala */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-saas-muted">Lingkar Kepala (cm - opsional)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Contoh: 44.5"
                      value={examLK}
                      onChange={(e) => setExamLK(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                    />
                  </div>

                  {/* Vitamin A */}
                  <div className="space-y-1.5 flex flex-col justify-end pb-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={examVitA}
                        onChange={(e) => setExamVitA(e.target.checked)}
                        className="w-4.5 h-4.5 text-saas-primary border-gray-250 rounded focus:ring-saas-primary/30"
                      />
                      <span className="text-xs font-bold text-saas-dark">Pemberian Vitamin A</span>
                    </label>
                  </div>
                </div>

                {/* Dropdown Penetapan Status Gizi (WHO Kategori) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-50 pt-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-saas-muted">Status Berat/Usia (BB/U)</label>
                    <select
                      value={examBBU}
                      onChange={(e) => setExamBBU(e.target.value as any)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Kurang">Kurang</option>
                      <option value="Sangat Kurang">Sangat Kurang</option>
                      <option value="Lebih">Lebih</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-saas-muted">Status Tinggi/Usia (TB/U)</label>
                    <select
                      value={examTBU}
                      onChange={(e) => setExamTBU(e.target.value as any)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Pendek">Pendek</option>
                      <option value="Sangat Pendek">Sangat Pendek</option>
                      <option value="Tinggi">Tinggi</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-saas-muted">Status Berat/Tinggi (BB/TB)</label>
                    <select
                      value={examBBTB}
                      onChange={(e) => setExamBBTB(e.target.value as any)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Kurus">Kurus</option>
                      <option value="Sangat Kurus">Sangat Kurus</option>
                      <option value="Gemuk">Gemuk</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Simpan Hasil Periksa
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Tabel Riwayat Pemeriksaan Bulanan */}
          <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-base text-saas-dark">Riwayat Perkembangan Bulanan</h3>
                <p className="text-xs text-saas-muted mt-0.5">Catatan riwayat kesehatan yang sudah tersimpan sebelumnya.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold text-saas-muted uppercase tracking-wider">
                    <th className="pb-3">Tanggal Periksa</th>
                    <th className="pb-3">Usia Bulan</th>
                    <th className="pb-3">Berat (kg)</th>
                    <th className="pb-3">Tinggi (cm)</th>
                    <th className="pb-3">Lingkar Kepala</th>
                    <th className="pb-3">Status BB/U</th>
                    <th className="pb-3">Status TB/U</th>
                    <th className="pb-3">Status BB/TB</th>
                    <th className="pb-3">Vit A</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBalita.pemeriksaan.length > 0 ? (
                    activeBalita.pemeriksaan.map((exam) => (
                      <tr key={exam.id} className="border-b border-gray-50 last:border-b-0 text-xs text-saas-dark">
                        <td className="py-4 font-bold">{exam.tanggalPeriksa}</td>
                        <td className="py-4 font-semibold">{exam.usiaBulan} Bulan</td>
                        <td className="py-4 font-bold">{exam.beratBadan} kg</td>
                        <td className="py-4 font-bold">{exam.tinggiBadan} cm</td>
                        <td className="py-4 text-saas-muted">{exam.lingkarKepala ? `${exam.lingkarKepala} cm` : "-"}</td>
                        <td className="py-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold ${
                              exam.statusBBU === "Normal"
                                ? "bg-trend-successBg text-trend-successText"
                                : "bg-trend-dangerBg text-trend-dangerText"
                            }`}
                          >
                            {exam.statusBBU}
                          </span>
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold ${
                              exam.statusTBU === "Normal"
                                ? "bg-trend-successBg text-trend-successText"
                                : "bg-trend-dangerBg text-trend-dangerText"
                            }`}
                          >
                            {exam.statusTBU}
                          </span>
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold ${
                              exam.statusBBTB === "Normal"
                                ? "bg-trend-successBg text-trend-successText"
                                : "bg-trend-dangerBg text-trend-dangerText"
                            }`}
                          >
                            {exam.statusBBTB}
                          </span>
                        </td>
                        <td className="py-4 font-semibold text-saas-muted">{exam.vitaminA ? "Diberikan" : "Tidak"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-xs text-saas-muted font-medium">
                        Belum ada riwayat pemeriksaan. Silakan input pada form di atas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VIEW: TAMBAH BALITA FORM */}
      {/* ========================================================================= */}
      {view === "add" && (
        <div className="space-y-6 max-w-xl mx-auto bg-white p-6 rounded-card shadow-soft-card border border-gray-100/70">
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-2 text-xs font-bold text-saas-muted hover:text-saas-dark transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Batal & Kembali
          </button>

          <div>
            <h3 className="font-bold text-lg text-saas-dark">Daftarkan Balita Baru</h3>
            <p className="text-xs text-saas-muted mt-0.5">Masukkan data identitas anak yang akan didaftarkan di Posyandu.</p>
          </div>

          <form onSubmit={handleAddBalitaSubmit} className="space-y-4 pt-4">
            {formError && (
              <div className="p-3 bg-red-50 text-trend-dangerText border border-red-100 rounded-lg text-xs font-bold flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
              </div>
            )}

            {/* Nama */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">Nama Lengkap Anak</label>
              <input
                type="text"
                placeholder="Contoh: Muhammad Rafif"
                value={formNama}
                onChange={(e) => setFormNama(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
              />
            </div>

            {/* NIK */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">Nomor Induk Kependudukan (NIK - 16 digit, opsional)</label>
              <input
                type="text"
                maxLength={16}
                placeholder="Contoh: 330102xxxxxxxxxx"
                value={formNik}
                onChange={(e) => setFormNik(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Tanggal Lahir */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted">Tanggal Lahir</label>
                <input
                  type="date"
                  value={formTglLahir}
                  onChange={(e) => setFormTglLahir(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                />
              </div>

              {/* Jenis Kelamin */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted">Jenis Kelamin</label>
                <div className="flex gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-saas-dark cursor-pointer select-none">
                    <input
                      type="radio"
                      name="jk"
                      checked={formJk === "L"}
                      onChange={() => setFormJk("L")}
                      className="w-4 h-4 text-saas-primary focus:ring-saas-primary/30"
                    />
                    Laki-laki
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-saas-dark cursor-pointer select-none">
                    <input
                      type="radio"
                      name="jk"
                      checked={formJk === "P"}
                      onChange={() => setFormJk("P")}
                      className="w-4 h-4 text-saas-primary focus:ring-saas-primary/30"
                    />
                    Perempuan
                  </label>
                </div>
              </div>
            </div>

            {/* Nama Ibu */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">Nama Lengkap Ibu Kandung</label>
              <input
                type="text"
                placeholder="Contoh: Ibu Siti"
                value={formNamaIbu}
                onChange={(e) => setFormNamaIbu(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
              />
            </div>

            {/* Alamat */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">Alamat Rumah (RT/RW/Desa)</label>
              <textarea
                rows={2}
                placeholder="Contoh: RT 01 / RW 02, Desa Karanggayam"
                value={formAlamat}
                onChange={(e) => setFormAlamat(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Daftarkan Anak
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
