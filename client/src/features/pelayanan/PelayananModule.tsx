'use client';

import { useState, useEffect, useCallback } from "react";
import {
  Baby,
  Heart,
  Search,
  Plus,
  AlertCircle,
  ChevronRight,
  UserPlus,
  UserCheck2,
  Loader2,
  Calendar,
  Clock,
  User
} from "lucide-react";
import { hitungStatusBbU, hitungStatusTbU, hitungStatusBbTb } from "../../lib/zScoreCalculator";
import { balitaApi, lansiaApi, riwayatApi, Balita, Lansia, ItemRiwayat } from "../../lib/api";

// Reusable Modal Component
import Modal from "../../components/Modal";
import PageHelmet from "../../components/PageHelmet";

// Helper Get Today's Date String (YYYY-MM-DD)
function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper Hitung Usia (Bulan)
function calculateAgeInMonths(birthDateStr: string, refDateStr?: string): number {
  const birth = new Date(birthDateStr);
  const ref = refDateStr ? new Date(refDateStr) : new Date();
  let months = (ref.getFullYear() - birth.getFullYear()) * 12;
  months -= birth.getMonth();
  months += ref.getMonth();
  return months <= 0 ? 0 : months;
}

// Helper Hitung Umur (Tahun)
function calculateAgeInYears(birthDateStr: string, refDateStr?: string): number {
  const birth = new Date(birthDateStr);
  const ref = refDateStr ? new Date(refDateStr) : new Date();
  let age = ref.getFullYear() - birth.getFullYear();
  const m = ref.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) {
    age--;
  }
  return age <= 0 ? 0 : age;
}

interface PelayananModuleProps {
  posyanduId: string;
}

export default function PelayananModule({ posyanduId }: PelayananModuleProps) {
  // Data States
  const [balitas, setBalitas] = useState<Balita[]>([]);
  const [lansias, setLansias] = useState<Lansia[]>([]);
  const [riwayatList, setRiwayatList] = useState<ItemRiwayat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Global Session Date Control
  const [examDate, setExamDate] = useState(getTodayString());

  // Search Filters
  const [searchBalita, setSearchBalita] = useState("");
  const [searchLansia, setSearchLansia] = useState("");

  // Registration Modals Visibility
  const [showAddBalitaModal, setShowAddBalitaModal] = useState(false);
  const [showAddLansiaModal, setShowAddLansiaModal] = useState(false);

  // Form State - Register Balita
  const [bNama, setBNama] = useState("");
  const [bNik, setBNik] = useState("");
  const [bNoHp, setBNoHp] = useState("");
  const [bTglLahir, setBTglLahir] = useState("2025-01-01");
  const [bJk, setBJk] = useState<"L" | "P">("L");
  const [bNamaIbu, setBNamaIbu] = useState("");
  const [bAlamat, setBAlamat] = useState("RT 01 / RW 02, Karanggayam");
  const [bError, setBError] = useState("");

  // Form State - Register Lansia
  const [lNama, setLNama] = useState("");
  const [lNik, setLNik] = useState("");
  const [lBpjs, setLBpjs] = useState("");
  const [lTglLahir, setLTglLahir] = useState("1960-01-01");
  const [lJk, setLJk] = useState<"L" | "P">("L");
  const [lRtRw, setLRtRw] = useState("");
  const [lAlamat, setLAlamat] = useState("Desa Karanggayam");
  const [lHt, setLHt] = useState(false);
  const [lDm, setLDm] = useState(false);
  const [lKemandirian, setLKemandirian] = useState<"A" | "B" | "C">("A");
  const [lMental, setLMental] = useState("");
  const [lError, setLError] = useState("");

  // Form Checkup BALITA (Left Side)
  const [selectedBalitaId, setSelectedBalitaId] = useState("");
  const [bExamBB, setBExamBB] = useState("");
  const [bExamTB, setBExamTB] = useState("");
  const [bExamLK, setBExamLK] = useState("");
  const [bExamLiLA, setBExamLiLA] = useState("");
  const [bExamBBU, setBExamBBU] = useState("Normal");
  const [bExamTBU, setBExamTBU] = useState("Normal");
  const [bExamBBTB, setBExamBBTB] = useState("Normal");
  const [bExamKms, setBExamKms] = useState("N");
  const [bExamVitA, setBExamVitA] = useState(false);
  const [bExamAsi, setBExamAsi] = useState(false);
  const [bExamCacing, setBExamCacing] = useState(false);
  const [bExamImunisasi, setBExamImunisasi] = useState("");
  const [bExamError, setBExamError] = useState("");
  const [isSubmittingBalita, setIsSubmittingBalita] = useState(false);

  // Form Checkup LANSIA (Right Side)
  const [selectedLansiaId, setSelectedLansiaId] = useState("");
  const [lExamBB, setLExamBB] = useState("");
  const [lExamTB, setLExamTB] = useState("");
  const [lExamSistol, setLExamSistol] = useState("");
  const [lExamDiastol, setLExamDiastol] = useState("");
  const [lExamGds, setLExamGds] = useState("");
  const [lExamLp, setLExamLp] = useState("");
  const [lExamCholesterol, setLExamCholesterol] = useState("");
  const [lExamUricAcid, setLExamUricAcid] = useState("");
  const [lExamKeluhan, setLExamKeluhan] = useState("");
  const [lExamTindakan, setLExamTindakan] = useState("");
  const [lExamError, setLExamError] = useState("");
  const [isSubmittingLansia, setIsSubmittingLansia] = useState(false);

  // Toast / Feedback
  const [successToast, setSuccessToast] = useState("");

  // Fetch All Patients and Riwayat
  const fetchData = useCallback(() => {
    setIsLoading(true);
    Promise.all([
      balitaApi.getAll(posyanduId),
      lansiaApi.getAll(posyanduId),
      riwayatApi.getAll(posyanduId)
    ])
      .then(([balitaRes, lansiaRes, riwayatRes]) => {
        if (balitaRes.success) setBalitas(balitaRes.data || []);
        if (lansiaRes.success) setLansias(lansiaRes.data || []);
        if (riwayatRes.success) setRiwayatList(riwayatRes.data || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [posyanduId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Selected Balita Object & Auto Z-Score
  const selectedBalita = balitas.find((b) => b.id === selectedBalitaId);
  useEffect(() => {
    if (!selectedBalita) return;
    const bb = parseFloat(bExamBB);
    const tb = parseFloat(bExamTB);
    const usia = calculateAgeInMonths(selectedBalita.tanggalLahir, examDate);
    const jk = selectedBalita.jenisKelamin || "L";
    if (!isNaN(bb) && bb > 0) {
      setBExamBBU(hitungStatusBbU(bb, usia, jk));
    }
    if (!isNaN(tb) && tb > 0) {
      setBExamTBU(hitungStatusTbU(tb, usia, jk));
    }
    if (!isNaN(bb) && bb > 0 && !isNaN(tb) && tb > 0) {
      setBExamBBTB(hitungStatusBbTb(bb, tb, jk));
    }
  }, [bExamBB, bExamTB, examDate, selectedBalita]);

  // Selected Lansia Object
  const selectedLansia = lansias.find((l) => l.id === selectedLansiaId);

  // Checkups Filtered by Selected Date (examDate)
  const balitaExamsToday = riwayatList.filter(
    (item) => item.tanggal === examDate && item.tipe === "Balita"
  );
  const lansiaExamsToday = riwayatList.filter(
    (item) => item.tanggal === examDate && item.tipe === "Lansia"
  );

  // Helper mapping status enum for API
  function mapStatusBbU(s: string): 'SK' | 'K' | 'N' | 'L' {
    if (s === 'Sangat Kurang' || s === 'SK') return 'SK';
    if (s === 'Kurang' || s === 'K') return 'K';
    if (s === 'Lebih' || s === 'L' || s === 'Risiko Lebih') return 'L';
    return 'N';
  }

  function mapStatusTbU(s: string): 'SP' | 'P' | 'N' | 'T' {
    if (s === 'Sangat Pendek' || s === 'SP') return 'SP';
    if (s === 'Pendek' || s === 'P') return 'P';
    if (s === 'Tinggi' || s === 'T') return 'T';
    return 'N';
  }

  function mapStatusBbTb(s: string): 'SK' | 'K' | 'N' | 'G' {
    if (s === 'Sangat Kurus' || s === 'SK') return 'SK';
    if (s === 'Kurus' || s === 'K') return 'K';
    if (s === 'Gemuk' || s === 'G' || s === 'Obesitas') return 'G';
    return 'N';
  }

  // Handle Submit Checkup BALITA
  const handleSubmitBalitaCheckup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBExamError("");

    if (!selectedBalita) {
      setBExamError("Silakan pilih balita terlebih dahulu.");
      return;
    }

    const bb = parseFloat(bExamBB);
    const tb = parseFloat(bExamTB);

    if (isNaN(bb) || bb <= 0 || isNaN(tb) || tb <= 0) {
      setBExamError("Berat Badan (kg) dan Tinggi Badan (cm) harus diisi dengan angka positif.");
      return;
    }

    setIsSubmittingBalita(true);
    try {
      const lk = bExamLK ? parseFloat(bExamLK) : undefined;
      const lila = bExamLiLA ? parseFloat(bExamLiLA) : undefined;
      const usiaBulan = calculateAgeInMonths(selectedBalita.tanggalLahir, examDate);

      await balitaApi.createPemeriksaan(posyanduId, selectedBalita.id, {
        tanggalPeriksa: examDate,
        usiaBulan,
        beratBadan: bb,
        tinggiBadan: tb,
        lingkarKepala: lk,
        lingkarLengan: lila,
        statusBbU: mapStatusBbU(bExamBBU),
        statusTbU: mapStatusTbU(bExamTBU),
        statusBbTb: mapStatusBbTb(bExamBBTB),
        statusKms: bExamKms || "N",
        vitaminA: bExamVitA,
        asiEksklusif: bExamAsi,
        obatCacing: bExamCacing,
        statusImunisasi: bExamImunisasi || undefined,
      } as any);

      setSuccessToast(`Pemeriksaan Balita (${selectedBalita.nama}) berhasil disimpan!`);
      fetchData();

      // Reset Form Balita
      setBExamBB("");
      setBExamTB("");
      setBExamLK("");
      setBExamLiLA("");
      setBExamImunisasi("");
      setBExamVitA(false);
      setBExamAsi(false);
      setBExamCacing(false);
      setSelectedBalitaId("");

      setTimeout(() => setSuccessToast(""), 3500);
    } catch (err: any) {
      setBExamError(err.message || "Gagal menyimpan pemeriksaan balita.");
    } finally {
      setIsSubmittingBalita(false);
    }
  };

  // Handle Submit Checkup LANSIA
  const handleSubmitLansiaCheckup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLExamError("");

    if (!selectedLansia) {
      setLExamError("Silakan pilih lansia terlebih dahulu.");
      return;
    }

    const bb = parseFloat(lExamBB);
    const tb = parseFloat(lExamTB);
    const sis = parseInt(lExamSistol);
    const dia = parseInt(lExamDiastol);
    const gds = parseInt(lExamGds);
    const lp = parseInt(lExamLp);

    if (isNaN(bb) || bb <= 0 || isNaN(tb) || tb <= 0) {
      setLExamError("Berat Badan (kg) dan Tinggi Badan (cm) harus diisi.");
      return;
    }

    if (isNaN(sis) || isNaN(dia) || isNaN(gds) || isNaN(lp)) {
      setLExamError("Tekanan Darah, GDS, dan Lingkar Perut lansia wajib diisi.");
      return;
    }

    setIsSubmittingLansia(true);
    try {
      const kol = lExamCholesterol ? parseInt(lExamCholesterol) : undefined;
      const urat = lExamUricAcid ? parseFloat(lExamUricAcid) : undefined;

      await lansiaApi.createPemeriksaan(posyanduId, selectedLansia.id, {
        tanggalPeriksa: examDate,
        beratBadan: bb,
        tinggiBadan: tb,
        tekananDarahSistol: sis,
        tekananDarahDiastol: dia,
        gulaDarahSewaktu: gds,
        lingkarPerut: lp,
        kolesterol: kol,
        asamUrat: urat,
        keluhan: lExamKeluhan || undefined,
        tindakan: lExamTindakan || undefined,
      } as any);

      setSuccessToast(`Skrining Lansia (${selectedLansia.nama}) berhasil disimpan!`);
      fetchData();

      // Reset Form Lansia
      setLExamBB("");
      setLExamTB("");
      setLExamSistol("");
      setLExamDiastol("");
      setLExamGds("");
      setLExamLp("");
      setLExamCholesterol("");
      setLExamUricAcid("");
      setLExamKeluhan("");
      setLExamTindakan("");
      setSelectedLansiaId("");

      setTimeout(() => setSuccessToast(""), 3500);
    } catch (err: any) {
      setLExamError(err.message || "Gagal menyimpan skrining lansia.");
    } finally {
      setIsSubmittingLansia(false);
    }
  };

  // Submit Handler Register Balita Modal
  const handleRegisterBalita = async (e: React.FormEvent) => {
    e.preventDefault();
    setBError("");
    if (!bNama.trim() || !bNamaIbu.trim() || !bAlamat.trim()) {
      setBError("Mohon lengkapi nama anak, nama ibu, dan alamat.");
      return;
    }
    try {
      const res = await balitaApi.create(posyanduId, {
        nama: bNama,
        nik: bNik || undefined,
        noHp: bNoHp || undefined,
        tanggalLahir: bTglLahir,
        jenisKelamin: bJk,
        namaIbu: bNamaIbu,
        alamat: bAlamat,
      });
      if (res.success && res.data) {
        fetchData();
        setSelectedBalitaId(res.data.id);
        setShowAddBalitaModal(false);
        setSuccessToast(`${bNama} berhasil didaftarkan & dipilih.`);
        setBNama(""); setBNik(""); setBNoHp(""); setBNamaIbu("");
        setTimeout(() => setSuccessToast(""), 3500);
      }
    } catch (err: any) {
      setBError(err.message || "Gagal mendaftarkan balita.");
    }
  };

  // Submit Handler Register Lansia Modal
  const handleRegisterLansia = async (e: React.FormEvent) => {
    e.preventDefault();
    setLError("");
    if (!lNama.trim() || !lNik.trim() || !lRtRw.trim() || !lAlamat.trim()) {
      setLError("Mohon isi nama, NIK, RT/RW, dan alamat.");
      return;
    }
    try {
      const res = await lansiaApi.create(posyanduId, {
        nama: lNama,
        nik: lNik,
        noBpjs: lBpjs || undefined,
        tanggalLahir: lTglLahir,
        jenisKelamin: lJk,
        rtRw: lRtRw,
        alamat: lAlamat,
        riwayatHt: lHt,
        riwayatDm: lDm,
        tingkatKemandirian: lKemandirian,
        gangguanMentalEmosional: lMental || undefined,
      });
      if (res.success && res.data) {
        fetchData();
        setSelectedLansiaId(res.data.id);
        setShowAddLansiaModal(false);
        setSuccessToast(`Lansia ${lNama} berhasil didaftarkan & dipilih.`);
        setLNama(""); setLNik(""); setLBpjs(""); setLRtRw("");
        setTimeout(() => setSuccessToast(""), 3500);
      }
    } catch (err: any) {
      setLError(err.message || "Gagal mendaftarkan lansia.");
    }
  };

  // Filtered lists for dropdown search
  const filteredBalitaOptions = balitas.filter((b) =>
    b.nama.toLowerCase().includes(searchBalita.toLowerCase()) ||
    (b.nik && b.nik.includes(searchBalita)) ||
    b.namaIbu.toLowerCase().includes(searchBalita.toLowerCase())
  );

  const filteredLansiaOptions = lansias.filter((l) =>
    l.nama.toLowerCase().includes(searchLansia.toLowerCase()) ||
    l.nik.includes(searchLansia)
  );

  return (
    <div className="space-y-6 pb-12">
      <PageHelmet
        title="Pencatatan Pelayanan Posyandu — Balita & Lansia"
        description="Pelayanan penimbangan balita dan skrining lansia secara berdampingan dalam satu tanggal periksa."
      />

      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in duration-200">
          <UserCheck2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold">{successToast}</span>
        </div>
      )}

      {/* HEADER BAR & GLOBAL DATE CONTROLLER */}
      <div className="bg-white rounded-2xl shadow-soft-card border border-gray-100 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-teal-50 text-saas-primary border border-teal-200/60">
              Posyandu In-Session
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-saas-dark tracking-tight mt-1">
            Pencatatan Pelayanan Posyandu
          </h2>
          <p className="text-xs text-saas-muted mt-0.5">
            Pelayanan berdampingan Balita &amp; Lansia.
          </p>
        </div>

        {/* CONTROLLER: Pilihan Tanggal Pemeriksaan & Stat Sesi */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200/80 p-2 px-3.5 rounded-xl shadow-xs">
            <Calendar className="w-4 h-4 text-saas-primary shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] font-extrabold text-saas-muted uppercase tracking-wider leading-none">
                Pilihan Tanggal Pemeriksaan
              </span>
              <input
                type="date"
                value={examDate}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                onChange={(e) => setExamDate(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-saas-dark focus:outline-none cursor-pointer p-0 border-0"
              />
            </div>
            <button
              type="button"
              onClick={() => setExamDate(getTodayString())}
              className="px-2.5 py-1 text-[10px] font-extrabold bg-white text-saas-primary border border-gray-200 rounded-lg hover:bg-teal-50 transition-colors shadow-xs ml-1"
              title="Set ke hari ini"
            >
              Hari Ini
            </button>
          </div>

          {/* Quick Registration Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddBalitaModal(true)}
              className="px-3.5 py-2 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" /> + Balita
            </button>
            <button
              onClick={() => setShowAddLansiaModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" /> + Lansia
            </button>
          </div>
        </div>
      </div>

      {/* SUMMARY BADGES TANGGAL PILIHAN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-teal-500/10 to-teal-500/5 border border-teal-200/60 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-saas-primary text-white flex items-center justify-center shadow-md shadow-teal-500/20">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-teal-900">Total Diperiksa: {balitaExamsToday.length} Balita</p>
              <p className="text-[11px] text-teal-700 mt-0.5">Sesi Tanggal: {examDate}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 border border-indigo-200/60 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-900">Total Diperiksa: {lansiaExamsToday.length} Lansia</p>
              <p className="text-[11px] text-indigo-700 mt-0.5">Sesi Tanggal: {examDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LAYOUT UTAMA: SIDE-BY-SIDE GRID (LEFT: BALITA | RIGHT: LANSIA) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* ───────────────────────────────────────────────────────────────────────── */}
        {/* KOLOM KIRI: PELAYANAN BALITA */}
        {/* ───────────────────────────────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Card Form Checkup Balita */}
          <div className="bg-white rounded-2xl shadow-soft-card border border-teal-150 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-saas-primary flex items-center justify-center border border-teal-100">
                  <Baby className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-saas-dark">Pelayanan Balita</h3>
                  <p className="text-[11px] text-saas-muted">Input penimbangan &amp; gizi balita</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddBalitaModal(true)}
                className="text-xs font-bold text-saas-primary hover:underline flex items-center gap-1"
              >
                + Balita Baru
              </button>
            </div>

            {/* Form Inner Balita */}
            <form onSubmit={handleSubmitBalitaCheckup} className="space-y-4">
              {bExamError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {bExamError}
                </div>
              )}

              {/* 1. Pilih Balita Dropdown */}
              <div>
                <label className="block text-xs font-bold text-saas-dark mb-1">
                  Pilih Balita Yang Diperiksa <span className="text-red-500">*</span>
                </label>
                <div className="space-y-1.5">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari nama balita..."
                      value={searchBalita}
                      onChange={(e) => setSearchBalita(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-saas-primary focus:bg-white"
                    />
                    <Search className="w-3.5 h-3.5 text-saas-muted absolute left-3 top-2.5" />
                  </div>
                  <select
                    value={selectedBalitaId}
                    onChange={(e) => setSelectedBalitaId(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-saas-dark focus:outline-none focus:border-saas-primary"
                    required
                  >
                    <option value="">-- Pilih Nama Balita ({filteredBalitaOptions.length}) --</option>
                    {filteredBalitaOptions.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nama} (Ibu: {b.namaIbu}) — Usia {b.usiaBulan || calculateAgeInMonths(b.tanggalLahir, examDate)} bln
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected Balita Info Banner */}
              {selectedBalita && (
                <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-teal-900">{selectedBalita.nama}</p>
                    <p className="text-[11px] text-teal-700 mt-0.5">
                      Usia {calculateAgeInMonths(selectedBalita.tanggalLahir, examDate)} Bln | Ibu {selectedBalita.namaIbu} | JK: {selectedBalita.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-white text-saas-primary font-bold rounded-full border border-teal-200 text-[10px]">
                    Terpilih
                  </span>
                </div>
              )}

              {/* Pengukuran Fisik Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-saas-muted mb-1">BB (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="8.5"
                    value={bExamBB}
                    onChange={(e) => setBExamBB(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-saas-dark focus:outline-none focus:border-saas-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-saas-muted mb-1">TB (cm) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="74.0"
                    value={bExamTB}
                    onChange={(e) => setBExamTB(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-saas-dark focus:outline-none focus:border-saas-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-saas-muted mb-1">LK (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="44.5"
                    value={bExamLK}
                    onChange={(e) => setBExamLK(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-saas-dark focus:outline-none focus:border-saas-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-saas-muted mb-1">LiLA (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="12.5"
                    value={bExamLiLA}
                    onChange={(e) => setBExamLiLA(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-saas-dark focus:outline-none focus:border-saas-primary"
                  />
                </div>
              </div>

              {/* Status Z-Score Otomatis */}
              <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <div className="text-center">
                  <span className="block text-[9px] font-bold text-saas-muted uppercase">BB/U</span>
                  <span className="text-xs font-extrabold text-saas-primary">{bExamBBU}</span>
                </div>
                <div className="text-center border-x border-gray-200">
                  <span className="block text-[9px] font-bold text-saas-muted uppercase">TB/U</span>
                  <span className="text-xs font-extrabold text-saas-primary">{bExamTBU}</span>
                </div>
                <div className="text-center">
                  <span className="block text-[9px] font-bold text-saas-muted uppercase">BB/TB</span>
                  <span className="text-xs font-extrabold text-saas-primary">{bExamBBTB}</span>
                </div>
              </div>

              {/* Checkbox Vitamin & Imunisasi */}
              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-1.5 text-xs font-bold text-saas-dark cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bExamVitA}
                    onChange={(e) => setBExamVitA(e.target.checked)}
                    className="w-4 h-4 text-saas-primary rounded"
                  />
                  Vit A
                </label>
                <label className="flex items-center gap-1.5 text-xs font-bold text-saas-dark cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bExamAsi}
                    onChange={(e) => setBExamAsi(e.target.checked)}
                    className="w-4 h-4 text-saas-primary rounded"
                  />
                  ASI Ekskl.
                </label>
                <label className="flex items-center gap-1.5 text-xs font-bold text-saas-dark cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bExamCacing}
                    onChange={(e) => setBExamCacing(e.target.checked)}
                    className="w-4 h-4 text-saas-primary rounded"
                  />
                  Obat Cacing
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingBalita}
                  className="px-5 py-2.5 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingBalita ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Simpan Periksa Balita
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* TABEL / DAFTAR BALITA DIPERIKSA TANGGAL INI */}
          <div className="bg-white rounded-2xl shadow-soft-card border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-saas-primary" />
                <h4 className="font-extrabold text-sm text-saas-dark">
                  Daftar Balita Diperiksa ({examDate})
                </h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-saas-primary border border-teal-200">
                {balitaExamsToday.length} Diperiksa
              </span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {balitaExamsToday.length === 0 ? (
                <div className="py-8 text-center text-xs text-saas-muted font-medium">
                  Belum ada pemeriksaan balita pada tanggal ini.
                </div>
              ) : (
                balitaExamsToday.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border rounded-xl bg-gray-50/60 text-xs space-y-1.5 border-gray-100 hover:bg-white transition-all shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-saas-dark text-xs">{item.nama}</p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          item.statusType === "warning"
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-saas-dark/80">{item.parameter}</p>
                    {/* PETUGAS PEMERIKSA INFO */}
                    <div className="flex items-center justify-between text-[10px] text-saas-muted pt-1 border-t border-gray-200/50">
                      <span className="flex items-center gap-1 font-semibold">
                        <User className="w-3 h-3 text-saas-primary" /> Petugas: <strong className="text-saas-dark">{item.petugas || "Kader Posyandu"}</strong>
                      </span>
                      <span className="font-mono">Tgl: {item.tanggal}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>


        {/* ───────────────────────────────────────────────────────────────────────── */}
        {/* KOLOM KANAN: PELAYANAN LANSIA */}
        {/* ───────────────────────────────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Card Form Checkup Lansia */}
          <div className="bg-white rounded-2xl shadow-soft-card border border-indigo-150 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-saas-dark">Pelayanan Lansia</h3>
                  <p className="text-[11px] text-saas-muted">Input tekanan darah &amp; skrining lansia</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddLansiaModal(true)}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                + Lansia Baru
              </button>
            </div>

            {/* Form Inner Lansia */}
            <form onSubmit={handleSubmitLansiaCheckup} className="space-y-4">
              {lExamError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {lExamError}
                </div>
              )}

              {/* 1. Pilih Lansia Dropdown */}
              <div>
                <label className="block text-xs font-bold text-saas-dark mb-1">
                  Pilih Lansia Yang Diperiksa <span className="text-red-500">*</span>
                </label>
                <div className="space-y-1.5">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari nama lansia..."
                      value={searchLansia}
                      onChange={(e) => setSearchLansia(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white"
                    />
                    <Search className="w-3.5 h-3.5 text-saas-muted absolute left-3 top-2.5" />
                  </div>
                  <select
                    value={selectedLansiaId}
                    onChange={(e) => setSelectedLansiaId(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-saas-dark focus:outline-none focus:border-indigo-500"
                    required
                  >
                    <option value="">-- Pilih Nama Lansia ({filteredLansiaOptions.length}) --</option>
                    {filteredLansiaOptions.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.nama} (NIK: {l.nik}) — Usia {l.usiaTahun || calculateAgeInYears(l.tanggalLahir, examDate)} thn
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected Lansia Info Banner */}
              {selectedLansia && (
                <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-indigo-950">{selectedLansia.nama}</p>
                    <p className="text-[11px] text-indigo-800 mt-0.5">
                      Usia {calculateAgeInYears(selectedLansia.tanggalLahir, examDate)} Thn | NIK: {selectedLansia.nik} | {selectedLansia.rtRw}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-white text-indigo-600 font-bold rounded-full border border-indigo-200 text-[10px]">
                    Terpilih
                  </span>
                </div>
              )}

              {/* Pengukuran Fisik & Vital Sign Lansia Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-saas-muted mb-1">BB (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="60.0"
                    value={lExamBB}
                    onChange={(e) => setLExamBB(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-saas-dark focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-saas-muted mb-1">TB (cm) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="160.0"
                    value={lExamTB}
                    onChange={(e) => setLExamTB(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-saas-dark focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-saas-muted mb-1">Sistol *</label>
                  <input
                    type="number"
                    placeholder="120"
                    value={lExamSistol}
                    onChange={(e) => setLExamSistol(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-saas-dark focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-saas-muted mb-1">Diastol *</label>
                  <input
                    type="number"
                    placeholder="80"
                    value={lExamDiastol}
                    onChange={(e) => setLExamDiastol(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-saas-dark focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-saas-muted mb-1">GDS (mg/dL) *</label>
                  <input
                    type="number"
                    placeholder="110"
                    value={lExamGds}
                    onChange={(e) => setLExamGds(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-saas-dark focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-saas-muted mb-1">Lingk Perut (cm)*</label>
                  <input
                    type="number"
                    placeholder="80"
                    value={lExamLp}
                    onChange={(e) => setLExamLp(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-saas-dark focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-saas-muted mb-1">Kolesterol</label>
                  <input
                    type="number"
                    placeholder="180"
                    value={lExamCholesterol}
                    onChange={(e) => setLExamCholesterol(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-saas-dark focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-saas-muted mb-1">Asam Urat</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="5.5"
                    value={lExamUricAcid}
                    onChange={(e) => setLExamUricAcid(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-saas-dark focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-saas-muted mb-1">Keluhan &amp; Catatan Tindakan</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Keluhan (cth: pusing, lemas)"
                    value={lExamKeluhan}
                    onChange={(e) => setLExamKeluhan(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Tindakan / Rujukan"
                    value={lExamTindakan}
                    onChange={(e) => setLExamTindakan(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingLansia}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingLansia ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Simpan Skrining Lansia
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* TABEL / DAFTAR LANSIA DIPERIKSA TANGGAL INI */}
          <div className="bg-white rounded-2xl shadow-soft-card border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h4 className="font-extrabold text-sm text-saas-dark">
                  Daftar Lansia Diperiksa ({examDate})
                </h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">
                {lansiaExamsToday.length} Diperiksa
              </span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {lansiaExamsToday.length === 0 ? (
                <div className="py-8 text-center text-xs text-saas-muted font-medium">
                  Belum ada pemeriksaan lansia pada tanggal ini.
                </div>
              ) : (
                lansiaExamsToday.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border rounded-xl bg-gray-50/60 text-xs space-y-1.5 border-gray-100 hover:bg-white transition-all shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-saas-dark text-xs">{item.nama}</p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          item.statusType === "warning"
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-saas-dark/80">{item.parameter}</p>
                    {/* PETUGAS PEMERIKSA INFO */}
                    <div className="flex items-center justify-between text-[10px] text-saas-muted pt-1 border-t border-gray-200/50">
                      <span className="flex items-center gap-1 font-semibold">
                        <User className="w-3 h-3 text-indigo-600" /> Petugas: <strong className="text-saas-dark">{item.petugas || "Kader Posyandu"}</strong>
                      </span>
                      <span className="font-mono">Tgl: {item.tanggal}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* MODAL REGISTER BALITA BARU */}
      <Modal
        isOpen={showAddBalitaModal}
        onClose={() => setShowAddBalitaModal(false)}
        title="Daftarkan Balita Baru"
      >
        <form onSubmit={handleRegisterBalita} className="space-y-4">
          {bError && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
              {bError}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-saas-dark mb-1">Nama Lengkap Anak *</label>
            <input
              type="text"
              required
              value={bNama}
              onChange={(e) => setBNama(e.target.value)}
              placeholder="Contoh: Muhammad Rafif"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-saas-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-saas-dark mb-1">NIK Anak (16 digit, opsional)</label>
            <input
              type="text"
              maxLength={16}
              value={bNik}
              onChange={(e) => setBNik(e.target.value)}
              placeholder="330102xxxxxxxxxx"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-saas-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-saas-dark mb-1">No. WhatsApp / HP Orang Tua (Opsional)</label>
            <input
              type="text"
              value={bNoHp}
              onChange={(e) => setBNoHp(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-saas-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-saas-dark mb-1">Tanggal Lahir *</label>
              <input
                type="date"
                required
                value={bTglLahir}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                onChange={(e) => setBTglLahir(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-saas-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-saas-dark mb-1">Jenis Kelamin *</label>
              <select
                value={bJk}
                onChange={(e) => setBJk(e.target.value as "L" | "P")}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-saas-primary"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-saas-dark mb-1">Nama Ibu Kandung *</label>
            <input
              type="text"
              required
              value={bNamaIbu}
              onChange={(e) => setBNamaIbu(e.target.value)}
              placeholder="Contoh: Ibu Siti"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-saas-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-saas-dark mb-1">Alamat Rumah *</label>
            <input
              type="text"
              required
              value={bAlamat}
              onChange={(e) => setBAlamat(e.target.value)}
              placeholder="RT 01 / RW 02, Karanggayam"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-saas-primary"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowAddBalitaModal(false)}
              className="px-4 py-2 text-xs font-bold text-saas-muted hover:bg-gray-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-xl shadow-md"
            >
              Daftarkan Balita
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL REGISTER LANSIA BARU */}
      <Modal
        isOpen={showAddLansiaModal}
        onClose={() => setShowAddLansiaModal(false)}
        title="Daftarkan Lansia Baru"
      >
        <form onSubmit={handleRegisterLansia} className="space-y-4">
          {lError && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
              {lError}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-saas-dark mb-1">Nama Lengkap Lansia *</label>
            <input
              type="text"
              required
              value={lNama}
              onChange={(e) => setLNama(e.target.value)}
              placeholder="Contoh: Mbah Joyo"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-saas-dark mb-1">NIK (16 digit) *</label>
              <input
                type="text"
                required
                maxLength={16}
                value={lNik}
                onChange={(e) => setLNik(e.target.value)}
                placeholder="330102xxxxxxxxxx"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-saas-dark mb-1">No. BPJS (opsional)</label>
              <input
                type="text"
                value={lBpjs}
                onChange={(e) => setLBpjs(e.target.value)}
                placeholder="000123456789"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-saas-dark mb-1">Tanggal Lahir *</label>
              <input
                type="date"
                required
                value={lTglLahir}
                onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                onChange={(e) => setLTglLahir(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-saas-dark mb-1">Jenis Kelamin *</label>
              <select
                value={lJk}
                onChange={(e) => setLJk(e.target.value as "L" | "P")}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-saas-dark mb-1">RT / RW *</label>
              <input
                type="text"
                required
                value={lRtRw}
                onChange={(e) => setLRtRw(e.target.value)}
                placeholder="RT 02 / RW 02"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-saas-dark mb-1">Status Kemandirian</label>
              <select
                value={lKemandirian}
                onChange={(e) => setLKemandirian(e.target.value as "A" | "B" | "C")}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="A">Kategori A (Mandiri)</option>
                <option value="B">Kategori B (Bantuan Sebagian)</option>
                <option value="C">Kategori C (Tergantung Total)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-saas-dark mb-1">Alamat Wilayah *</label>
            <input
              type="text"
              required
              value={lAlamat}
              onChange={(e) => setLAlamat(e.target.value)}
              placeholder="Desa Karanggayam"
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowAddLansiaModal(false)}
              className="px-4 py-2 text-xs font-bold text-saas-muted hover:bg-gray-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md"
            >
              Daftarkan Lansia
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
