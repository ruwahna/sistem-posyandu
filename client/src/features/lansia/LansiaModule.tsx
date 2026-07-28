"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Heart,
  Calendar,
  User,
  MapPin,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  ChevronRight,
  ClipboardList,
  ShieldCheck,
  BrainCircuit
} from "lucide-react";

// Tipe Data
export interface PemeriksaanLansia {
  id: string;
  tanggalPeriksa: string;
  beratBadan: number; // kg
  tinggiBadan: number; // cm
  tekananDarahSistol: number; // mmHg
  tekananDarahDiastol: number; // mmHg
  gulaDarahSewaktu: number; // mg/dL
  lingkarPerut: number; // cm
}

export interface Lansia {
  id: string;
  nama: string;
  nik: string;
  noBpjs?: string;
  tanggalLahir: string;
  jenisKelamin: "L" | "P";
  rtRw: string;
  alamat: string;
  riwayatHt: boolean; // Hipertensi
  riwayatDm: boolean; // Diabetes
  tingkatKemandirian: "A" | "B" | "C"; // A: Mandiri, B: Bantuan Sebagian, C: Tergantung Total
  gangguanMentalEmosional?: string;
  pemeriksaan: PemeriksaanLansia[];
}

// Initial Mock Data
const initialLansias: Lansia[] = [
  {
    id: "l1",
    nama: "Mbah Karto",
    nik: "3301021203540001",
    noBpjs: "0001827364521",
    tanggalLahir: "1954-03-12", // 72 Tahun pada 2026
    jenisKelamin: "L",
    rtRw: "RT 02 / RW 02",
    alamat: "Desa Karanggayam",
    riwayatHt: true,
    riwayatDm: true,
    tingkatKemandirian: "A",
    gangguanMentalEmosional: "Normal, tidak ada kecemasan berlebih.",
    pemeriksaan: [
      { id: "le1", tanggalPeriksa: "2026-07-10", beratBadan: 58.0, tinggiBadan: 160.0, tekananDarahSistol: 140, tekananDarahDiastol: 90, gulaDarahSewaktu: 180, lingkarPerut: 92 },
      { id: "le2", tanggalPeriksa: "2026-06-10", beratBadan: 58.5, tinggiBadan: 160.0, tekananDarahSistol: 135, tekananDarahDiastol: 85, gulaDarahSewaktu: 195, lingkarPerut: 92.5 },
      { id: "le3", tanggalPeriksa: "2026-05-10", beratBadan: 59.0, tinggiBadan: 160.0, tekananDarahSistol: 145, tekananDarahDiastol: 95, gulaDarahSewaktu: 210, lingkarPerut: 93 },
    ],
  },
  {
    id: "l2",
    nama: "Mbah Sumi",
    nik: "3301024508610003",
    noBpjs: "0001928374561",
    tanggalLahir: "1961-08-25", // 65 Tahun
    jenisKelamin: "P",
    rtRw: "RT 03 / RW 02",
    alamat: "Desa Karanggayam",
    riwayatHt: true,
    riwayatDm: false,
    tingkatKemandirian: "B",
    gangguanMentalEmosional: "Sering mengeluh pusing dan cemas.",
    pemeriksaan: [
      { id: "le4", tanggalPeriksa: "2026-07-10", beratBadan: 52.0, tinggiBadan: 152.0, tekananDarahSistol: 150, tekananDarahDiastol: 95, gulaDarahSewaktu: 110, lingkarPerut: 84 },
      { id: "le5", tanggalPeriksa: "2026-06-10", beratBadan: 52.2, tinggiBadan: 152.0, tekananDarahSistol: 145, tekananDarahDiastol: 90, gulaDarahSewaktu: 115, lingkarPerut: 84.2 },
    ],
  },
  {
    id: "l3",
    nama: "Budi Santoso",
    nik: "3301021901680005",
    noBpjs: undefined,
    tanggalLahir: "1968-01-19", // 58 Tahun
    jenisKelamin: "L",
    rtRw: "RT 01 / RW 02",
    alamat: "Desa Karanggayam",
    riwayatHt: false,
    riwayatDm: false,
    tingkatKemandirian: "A",
    gangguanMentalEmosional: "Sehat, aktif berkebun.",
    pemeriksaan: [
      { id: "le6", tanggalPeriksa: "2026-07-10", beratBadan: 66.5, tinggiBadan: 168.0, tekananDarahSistol: 120, tekananDarahDiastol: 80, gulaDarahSewaktu: 95, lingkarPerut: 88 },
    ],
  },
  {
    id: "l4",
    nama: "Mbah Harjo",
    nik: "3301020412470002",
    noBpjs: "0001229988776",
    tanggalLahir: "1947-12-04", // 78 Tahun
    jenisKelamin: "L",
    rtRw: "RT 01 / RW 02",
    alamat: "Desa Karanggayam",
    riwayatHt: true,
    riwayatDm: true,
    tingkatKemandirian: "C",
    gangguanMentalEmosional: "Memori menurun, pikun ringan.",
    pemeriksaan: [],
  },
];

// Helper Hitung Umur (Tahun)
function calculateAgeInYears(birthDateStr: string, refDateStr: string = "2026-07-28"): number {
  const birth = new Date(birthDateStr);
  const ref = new Date(refDateStr);
  let age = ref.getFullYear() - birth.getFullYear();
  const m = ref.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) {
    age--;
  }
  return age <= 0 ? 0 : age;
}

export default function LansiaModule() {
  const [lansias, setLansias] = useState<Lansia[]>(initialLansias);
  const [view, setView] = useState<"list" | "detail" | "add">("list");
  const [selectedLansiaId, setSelectedLansiaId] = useState<string | null>(null);

  // Search & Filter State
  const [query, setQuery] = useState("");
  const [ageFilter, setAgeFilter] = useState<"semua" | "45-59" | "60-69" | "70+">("semua");
  const [diseaseFilter, setDiseaseFilter] = useState<"semua" | "ht" | "dm">("semua");

  // Form State Tambah Lansia
  const [formNama, setFormNama] = useState("");
  const [formNik, setFormNik] = useState("");
  const [formBpjs, setFormBpjs] = useState("");
  const [formTglLahir, setFormTglLahir] = useState("1960-01-01");
  const [formJk, setFormJk] = useState<"L" | "P">("L");
  const [formRtRw, setFormRtRw] = useState("");
  const [formAlamat, setFormAlamat] = useState("Desa Karanggayam");
  const [formHt, setFormHt] = useState(false);
  const [formDm, setFormDm] = useState(false);
  const [formKemandirian, setFormKemandirian] = useState<"A" | "B" | "C">("A");
  const [formMental, setFormMental] = useState("");
  const [formError, setFormError] = useState("");

  // Form State Tambah Pemeriksaan
  const [examDate, setExamDate] = useState("2026-07-10");
  const [examBB, setExamBB] = useState("");
  const [examTB, setExamTB] = useState("");
  const [examSistol, setExamSistol] = useState("");
  const [examDiastol, setExamDiastol] = useState("");
  const [examGds, setExamGds] = useState("");
  const [examLp, setExamLp] = useState("");
  const [examWarning, setExamWarning] = useState("");
  const [examError, setExamError] = useState("");

  const activeLansia = lansias.find((l) => l.id === selectedLansiaId);

  // Filter List Lansia
  const filteredLansias = lansias.filter((l) => {
    const ageYears = calculateAgeInYears(l.tanggalLahir);
    const matchesSearch = l.nama.toLowerCase().includes(query.toLowerCase()) || 
                          l.nik.includes(query) ||
                          (l.noBpjs && l.noBpjs.includes(query));

    let matchesAge = true;
    if (ageFilter === "45-59") matchesAge = ageYears >= 45 && ageYears <= 59;
    else if (ageFilter === "60-69") matchesAge = ageYears >= 60 && ageYears <= 69;
    else if (ageFilter === "70+") matchesAge = ageYears >= 70;

    let matchesDisease = true;
    if (diseaseFilter === "ht") matchesDisease = l.riwayatHt;
    else if (diseaseFilter === "dm") matchesDisease = l.riwayatDm;

    return matchesSearch && matchesAge && matchesDisease;
  });

  // Handler Submit Tambah Lansia
  const handleAddLansiaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formNama.trim() || !formNik.trim() || !formRtRw.trim() || !formAlamat.trim()) {
      setFormError("Mohon isi nama lengkap, NIK, RT/RW, dan alamat.");
      return;
    }

    if (formNik.length !== 16) {
      setFormError("NIK harus tepat 16 digit angka.");
      return;
    }

    const newLansia: Lansia = {
      id: `l_${Date.now()}`,
      nama: formNama,
      nik: formNik,
      noBpjs: formBpjs || undefined,
      tanggalLahir: formTglLahir,
      jenisKelamin: formJk,
      rtRw: formRtRw,
      alamat: formAlamat,
      riwayatHt: formHt,
      riwayatDm: formDm,
      tingkatKemandirian: formKemandirian,
      gangguanMentalEmosional: formMental || undefined,
      pemeriksaan: [],
    };

    setLansias([newLansia, ...lansias]);
    
    // Reset Form
    setFormNama("");
    setFormNik("");
    setFormBpjs("");
    setFormTglLahir("1960-01-01");
    setFormJk("L");
    setFormRtRw("");
    setFormAlamat("Desa Karanggayam");
    setFormHt(false);
    setFormDm(false);
    setFormKemandirian("A");
    setFormMental("");
    setView("list");
  };

  // Check input values warning
  const handleExamInputCheck = (sistolVal: string, gdsVal: string) => {
    setExamWarning("");
    const sistol = parseInt(sistolVal);
    const gds = parseInt(gdsVal);

    if (sistol > 200) {
      setExamWarning("Tekanan darah sistol di atas 200 mmHg sangat tinggi. Mohon cek kembali inputan atau rujuk lansia ke puskesmas.");
    } else if (gds > 300) {
      setExamWarning("Kadar Gula Darah (GDS) di atas 300 mg/dL sangat tinggi. Mohon cek kembali inputan Ibu.");
    }
  };

  // Handler Submit Tambah Pemeriksaan
  const handleAddExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setExamError("");

    const bb = parseFloat(examBB);
    const tb = parseFloat(examTB);
    const sistol = parseInt(examSistol);
    const diastol = parseInt(examDiastol);
    const gds = parseFloat(examGds);
    const lp = parseFloat(examLp);

    if (isNaN(bb) || bb <= 0 || isNaN(tb) || tb <= 0 || isNaN(sistol) || isNaN(diastol) || isNaN(gds) || isNaN(lp)) {
      setExamError("Mohon isi semua data pemeriksaan dengan angka positif yang valid.");
      return;
    }

    if (!activeLansia) return;

    const newExam: PemeriksaanLansia = {
      id: `le_${Date.now()}`,
      tanggalPeriksa: examDate,
      beratBadan: bb,
      tinggiBadan: tb,
      tekananDarahSistol: sistol,
      tekananDarahDiastol: diastol,
      gulaDarahSewaktu: gds,
      lingkarPerut: lp,
    };

    // Update lansias state
    const updatedLansias = lansias.map((l) => {
      if (l.id === activeLansia.id) {
        return {
          ...l,
          pemeriksaan: [newExam, ...l.pemeriksaan],
        };
      }
      return l;
    });

    setLansias(updatedLansias);

    // Reset Form
    setExamBB("");
    setExamTB("");
    setExamSistol("");
    setExamDiastol("");
    setExamGds("");
    setExamLp("");
    setExamWarning("");
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. VIEW: LIST LANSIA */}
      {/* ========================================================================= */}
      {view === "list" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-saas-dark tracking-tight">Data Lansia</h2>
              <p className="text-sm text-saas-muted mt-0.5">Kelola data kesehatan berkala lansia posyandu.</p>
            </div>
            <button
              onClick={() => setView("add")}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-all"
            >
              <Plus className="w-4 h-4" /> Tambah Lansia Baru
            </button>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-6 rounded-card border border-gray-100/50 shadow-soft-card space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="Cari nama, NIK, atau BPJS..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50/70 border border-gray-100 rounded-input text-sm text-saas-dark placeholder-saas-muted/70 focus:outline-none focus:border-saas-primary/50 focus:bg-white transition-all"
                />
                <Search className="absolute left-3.5 top-2.5 text-saas-muted/80 w-4 h-4" />
              </div>

              {/* Disease Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-saas-muted">Riwayat Penyakit:</span>
                {[
                  { label: "Semua", val: "semua" },
                  { label: "Hipertensi (HT)", val: "ht" },
                  { label: "Diabetes (DM)", val: "dm" },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setDiseaseFilter(item.val as any)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                      diseaseFilter === item.val
                        ? "bg-saas-primary/10 text-saas-primary border border-saas-primary/20"
                        : "bg-gray-50 text-saas-muted hover:text-saas-dark border border-transparent"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Age Filter */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-50">
              <span className="text-xs font-bold text-saas-muted mr-1">Kelompok Umur:</span>
              {[
                { label: "Semua Umur", val: "semua" },
                { label: "45-59 Tahun (Pra-Lansia)", val: "45-59" },
                { label: "60-69 Tahun (Lansia)", val: "60-69" },
                { label: "≥70 Tahun (Lansia Risiko)", val: "70+" },
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
                    <th className="pb-3">Nama Lansia</th>
                    <th className="pb-3">Usia (Tahun)</th>
                    <th className="pb-3">RT/RW</th>
                    <th className="pb-3">Penyakit bawaan</th>
                    <th className="pb-3">Kemandirian</th>
                    <th className="pb-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLansias.length > 0 ? (
                    filteredLansias.map((item) => {
                      const ageYears = calculateAgeInYears(item.tanggalLahir);
                      return (
                        <tr key={item.id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/40 transition-colors text-sm">
                          <td className="py-4">
                            <p className="font-bold text-saas-dark">{item.nama}</p>
                            <p className="text-[11px] text-saas-muted font-medium mt-0.5">NIK: {item.nik}</p>
                          </td>
                          <td className="py-4 font-bold text-saas-dark">{ageYears} Tahun</td>
                          <td className="py-4 text-saas-muted font-semibold">{item.rtRw}</td>
                          <td className="py-4">
                            <div className="flex gap-1.5">
                              {item.riwayatHt && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-trend-dangerText">HT</span>
                              )}
                              {item.riwayatDm && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600">DM</span>
                              )}
                              {!item.riwayatHt && !item.riwayatDm && (
                                <span className="text-xs text-saas-muted font-semibold">-</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                item.tingkatKemandirian === "A"
                                  ? "bg-trend-successBg text-trend-successText"
                                  : item.tingkatKemandirian === "B"
                                  ? "bg-yellow-50 text-yellow-600"
                                  : "bg-trend-dangerBg text-trend-dangerText"
                              }`}
                            >
                              Kategori {item.tingkatKemandirian}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedLansiaId(item.id);
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
                        Tidak ada data lansia yang cocok.
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
      {/* 2. VIEW: DETAIL LANSIA & RIWAYAT PEMERIKSAAN */}
      {/* ========================================================================= */}
      {view === "detail" && activeLansia && (
        <div className="space-y-8">
          {/* Back Button */}
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-2 text-xs font-bold text-saas-muted hover:text-saas-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Lansia
          </button>

          {/* Profile & Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profil Lansia Card */}
            <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 flex flex-col justify-between h-fit space-y-6">
              <div>
                <div className="w-12 h-12 rounded-xl bg-saas-primary/10 flex items-center justify-center text-saas-primary mb-4">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-saas-dark tracking-tight">{activeLansia.nama}</h3>
                <p className="text-xs text-saas-muted font-semibold mt-1">NIK: {activeLansia.nik}</p>
                {activeLansia.noBpjs && (
                  <p className="text-xs text-saas-muted font-semibold mt-0.5">BPJS: {activeLansia.noBpjs}</p>
                )}
              </div>

              {/* Detail Items */}
              <div className="space-y-4 border-t border-gray-50 pt-4 text-sm font-semibold">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4.5 h-4.5 text-saas-muted mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-saas-muted">Tanggal Lahir & Usia</p>
                    <p className="text-saas-dark text-xs mt-0.5">
                      {activeLansia.tanggalLahir} ({calculateAgeInYears(activeLansia.tanggalLahir)} Tahun)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ClipboardList className="w-4.5 h-4.5 text-saas-muted mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-saas-muted">Status Kemandirian</p>
                    <p className="text-saas-dark text-xs mt-0.5">
                      Kategori {activeLansia.tingkatKemandirian} — {
                        activeLansia.tingkatKemandirian === "A" ? "Mandiri Sepenuhnya" :
                        activeLansia.tingkatKemandirian === "B" ? "Bantuan Sebagian" : "Ketergantungan Total"
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4.5 h-4.5 text-saas-muted mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-saas-muted">Riwayat Penyakit</p>
                    <p className="text-saas-dark text-xs mt-0.5">
                      HT: {activeLansia.riwayatHt ? "Ada (Hipertensi)" : "Tidak ada"} | DM: {activeLansia.riwayatDm ? "Ada (Diabetes)" : "Tidak ada"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BrainCircuit className="w-4.5 h-4.5 text-saas-muted mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-saas-muted">Skrining Mental Emosional</p>
                    <p className="text-saas-dark text-xs mt-0.5 leading-snug font-medium italic">
                      "{activeLansia.gangguanMentalEmosional || "Tidak ada catatan khusus"}"
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4.5 h-4.5 text-saas-muted mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-saas-muted">Alamat Rumah</p>
                    <p className="text-saas-dark text-xs mt-0.5 leading-snug">
                      {activeLansia.rtRw}, {activeLansia.alamat}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Pemeriksaan Baru */}
            <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 lg:col-span-2 space-y-6">
              <div>
                <h3 className="font-bold text-base text-saas-dark">Input Pemeriksaan Bulanan Lansia</h3>
                <p className="text-xs text-saas-muted mt-0.5">Masukkan data pengukuran fisik dan skrining gula darah.</p>
              </div>

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
                      placeholder="Contoh: 60"
                      value={examBB}
                      onChange={(e) => setExamBB(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                    />
                  </div>

                  {/* Tinggi Badan */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-saas-muted">Tinggi Badan (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Contoh: 160"
                      value={examTB}
                      onChange={(e) => setExamTB(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 border-t border-gray-50 pt-4">
                  {/* TD Sistol */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-saas-muted">Sistol (mmHg)</label>
                    <input
                      type="number"
                      placeholder="TD atas, cth: 130"
                      value={examSistol}
                      onChange={(e) => {
                        setExamSistol(e.target.value);
                        handleExamInputCheck(e.target.value, examGds);
                      }}
                      className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                    />
                  </div>

                  {/* TD Diastol */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-saas-muted">Diastol (mmHg)</label>
                    <input
                      type="number"
                      placeholder="TD bawah, cth: 85"
                      value={examDiastol}
                      onChange={(e) => setExamDiastol(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                    />
                  </div>

                  {/* Gula Darah Sewaktu */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-saas-muted">GDS (mg/dL)</label>
                    <input
                      type="number"
                      placeholder="Contoh: 120"
                      value={examGds}
                      onChange={(e) => {
                        setExamGds(e.target.value);
                        handleExamInputCheck(examSistol, e.target.value);
                      }}
                      className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                    />
                  </div>

                  {/* Lingkar Perut */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-saas-muted">Lingkar Perut (cm)</label>
                    <input
                      type="number"
                      placeholder="Contoh: 90"
                      value={examLp}
                      onChange={(e) => setExamLp(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                    />
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

          {/* Tabel Riwayat Pemeriksaan Lansia */}
          <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-base text-saas-dark">Riwayat Pemeriksaan Bulanan</h3>
                <p className="text-xs text-saas-muted mt-0.5">Daftar rekaman kesehatan lansia dari bulan ke bulan.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold text-saas-muted uppercase tracking-wider">
                    <th className="pb-3">Tanggal Periksa</th>
                    <th className="pb-3">Berat (kg)</th>
                    <th className="pb-3">Tinggi (cm)</th>
                    <th className="pb-3">Tekanan Darah (Sistol/Diastol)</th>
                    <th className="pb-3">Gula Darah (GDS)</th>
                    <th className="pb-3">Lingkar Perut</th>
                  </tr>
                </thead>
                <tbody>
                  {activeLansia.pemeriksaan.length > 0 ? (
                    activeLansia.pemeriksaan.map((exam) => (
                      <tr key={exam.id} className="border-b border-gray-50 last:border-b-0 text-xs text-saas-dark">
                        <td className="py-4 font-bold">{exam.tanggalPeriksa}</td>
                        <td className="py-4 font-bold">{exam.beratBadan} kg</td>
                        <td className="py-4 font-bold">{exam.tinggiBadan} cm</td>
                        <td className="py-4 font-bold">
                          <span
                            className={`px-2 py-0.5 rounded-full ${
                              exam.tekananDarahSistol >= 140
                                ? "bg-trend-dangerBg text-trend-dangerText"
                                : "bg-trend-successBg text-trend-successText"
                            }`}
                          >
                            {exam.tekananDarahSistol} / {exam.tekananDarahDiastol} mmHg
                          </span>
                        </td>
                        <td className="py-4 font-bold">
                          <span
                            className={`px-2 py-0.5 rounded-full ${
                              exam.gulaDarahSewaktu >= 140
                                ? "bg-orange-50 text-orange-600"
                                : "bg-trend-successBg text-trend-successText"
                            }`}
                          >
                            {exam.gulaDarahSewaktu} mg/dL
                          </span>
                        </td>
                        <td className="py-4 font-bold">{exam.lingkarPerut} cm</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-saas-muted font-medium">
                        Belum ada riwayat pemeriksaan lansia. Silakan input pada form di atas.
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
      {/* 3. VIEW: TAMBAH LANSIA FORM */}
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
            <h3 className="font-bold text-lg text-saas-dark">Daftarkan Lansia Baru</h3>
            <p className="text-xs text-saas-muted mt-0.5">Masukkan profil identitas lansia dan penyakit bawaan awal.</p>
          </div>

          <form onSubmit={handleAddLansiaSubmit} className="space-y-4 pt-4">
            {formError && (
              <div className="p-3 bg-red-50 text-trend-dangerText border border-red-100 rounded-lg text-xs font-bold flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
              </div>
            )}

            {/* Nama */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">Nama Lengkap Lansia</label>
              <input
                type="text"
                placeholder="Contoh: Mbah Harjo"
                value={formNama}
                onChange={(e) => setFormNama(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* NIK */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted">NIK (16 digit wajib)</label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="NIK sesuai KTP"
                  value={formNik}
                  onChange={(e) => setFormNik(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                />
              </div>

              {/* BPJS */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted">No BPJS (Opsional)</label>
                <input
                  type="text"
                  placeholder="Nomor BPJS jika ada"
                  value={formBpjs}
                  onChange={(e) => setFormBpjs(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                />
              </div>
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
                      name="l-jk"
                      checked={formJk === "L"}
                      onChange={() => setFormJk("L")}
                      className="w-4 h-4 text-saas-primary focus:ring-saas-primary/30"
                    />
                    Laki-laki
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-saas-dark cursor-pointer select-none">
                    <input
                      type="radio"
                      name="l-jk"
                      checked={formJk === "P"}
                      onChange={() => setFormJk("P")}
                      className="w-4 h-4 text-saas-primary focus:ring-saas-primary/30"
                    />
                    Perempuan
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-gray-50 pt-4">
              {/* RT / RW */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted">RT / RW</label>
                <input
                  type="text"
                  placeholder="Cth: RT 01 / RW 02"
                  value={formRtRw}
                  onChange={(e) => setFormRtRw(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                />
              </div>

              {/* Status Kemandirian */}
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-saas-muted">Tingkat Kemandirian Aktivitas</label>
                <select
                  value={formKemandirian}
                  onChange={(e) => setFormKemandirian(e.target.value as any)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                >
                  <option value="A">Kategori A (Mandiri Sepenuhnya)</option>
                  <option value="B">Kategori B (Bantuan Sebagian)</option>
                  <option value="C">Kategori C (Tergantung Total)</option>
                </select>
              </div>
            </div>

            {/* Riwayat Penyakit */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">Riwayat Diagnosa Penyakit (HT / DM)</label>
              <div className="flex gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formHt}
                    onChange={(e) => setFormHt(e.target.checked)}
                    className="w-4.5 h-4.5 text-saas-primary border-gray-250 rounded focus:ring-saas-primary/30"
                  />
                  <span className="text-xs font-bold text-saas-dark">Hipertensi (Tekanan Darah Tinggi)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formDm}
                    onChange={(e) => setFormDm(e.target.checked)}
                    className="w-4.5 h-4.5 text-saas-primary border-gray-250 rounded focus:ring-saas-primary/30"
                  />
                  <span className="text-xs font-bold text-saas-dark">Diabetes Melitus (Gula Darah)</span>
                </label>
              </div>
            </div>

            {/* Catatan Mental Emosional */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">Catatan Skrining Mental Emosional (Opsional)</label>
              <input
                type="text"
                placeholder="Misal: Cenderung pikun, sering cemas, dll."
                value={formMental}
                onChange={(e) => setFormMental(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
              />
            </div>

            {/* Alamat */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">Alamat Wilayah / Dusun</label>
              <input
                type="text"
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
                <Plus className="w-3.5 h-3.5" /> Daftarkan Lansia
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
