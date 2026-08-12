"use client";

import { useState, useEffect } from "react";
import {
  Baby,
  Heart,
  Search,
  Plus,
  AlertCircle,
  ChevronRight,
  UserPlus,
  SlidersHorizontal,
  UserCheck2
} from "lucide-react";
import { hitungStatusBbU, hitungStatusTbU, hitungStatusBbTb, hitungIMT } from "../../lib/zScoreCalculator";
import { balitaApi, lansiaApi, Balita, Lansia } from "../../lib/api";

// Reusable Modal Component
import Modal from "../../components/Modal";

// Tipe Data Pasien
interface Pasien {
  id: string;
  nama: string;
  tipe: "Balita" | "Lansia";
  subInfo: string; // Age or RT/RW
  detail1: string; // Mother's name for child, BPJS for senior
  detail2: string; // Address
  tanggalLahir?: string;
  jenisKelamin?: "L" | "P";
}



// Session Log (Today's entered checkups)
interface SessionLog {
  id: string;
  nama: string;
  tipe: "Balita" | "Lansia";
  waktu: string;
  summary: string;
  status: string;
}

// Helper Hitung Usia (Bulan)
function calculateAgeInMonths(birthDateStr: string, refDateStr: string = "2026-07-28"): number {
  const birth = new Date(birthDateStr);
  const ref = new Date(refDateStr);
  let months = (ref.getFullYear() - birth.getFullYear()) * 12;
  months -= birth.getMonth();
  months += ref.getMonth();
  return months <= 0 ? 0 : months;
}

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

interface PelayananModuleProps {
  posyanduId: string;
}

export default function PelayananModule({ posyanduId }: PelayananModuleProps) {
  const [pasiens, setPasiens] = useState<Pasien[]>([]);
  const [query, setQuery] = useState("");
  const [selectedPasien, setSelectedPasien] = useState<Pasien | null>(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<"Semua" | "Balita" | "Lansia">("Semua");

  // Registration Modals Visibility
  const [showAddBalitaModal, setShowAddBalitaModal] = useState(false);
  const [showAddLansiaModal, setShowAddLansiaModal] = useState(false);

  // Form State - Register Balita
  const [bNama, setBNama] = useState("");
  const [bNik, setBNik] = useState("");
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

  // Session Log State
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);

  const fetchPatients = () => {
    Promise.all([
      balitaApi.getAll(posyanduId),
      lansiaApi.getAll(posyanduId)
    ])
      .then(([balitaRes, lansiaRes]) => {
        const balitas: Pasien[] = (balitaRes.data || []).map((b: Balita) => ({
          id: b.id,
          nama: b.nama,
          tipe: "Balita",
          subInfo: `Usia ${b.usiaBulan || calculateAgeInMonths(b.tanggalLahir, "2026-07-28")} Bulan`,
          detail1: b.namaIbu,
          detail2: b.alamat,
          tanggalLahir: b.tanggalLahir,
          jenisKelamin: b.jenisKelamin,
        }));
        const lansias: Pasien[] = (lansiaRes.data || []).map((l: Lansia) => ({
          id: l.id,
          nama: l.nama,
          tipe: "Lansia",
          subInfo: `Usia ${l.usiaTahun || calculateAgeInYears(l.tanggalLahir, "2026-07-28")} Tahun`,
          detail1: `BPJS: ${l.noBpjs || "Tidak Ada"}`,
          detail2: l.alamat,
          tanggalLahir: l.tanggalLahir,
          jenisKelamin: l.jenisKelamin,
        }));
        setPasiens([...balitas, ...lansias]);
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchPatients();
  }, [posyanduId]);

  // Form Fields - Common (Checkup)
  const [examDate, setExamDate] = useState("2026-07-28");
  const [examBB, setExamBB] = useState("");
  const [examTB, setExamTB] = useState("");

  // Form Fields - Balita (Checkup)
  const [examLK, setExamLK] = useState("");
  const [examBBU, setExamBBU] = useState("Normal");
  const [examTBU, setExamTBU] = useState("Normal");
  const [examBBTB, setExamBBTB] = useState("Normal");
  const [examVitA, setExamVitA] = useState(false);
  const [examLiLA, setExamLiLA] = useState("");
  const [examKms, setExamKms] = useState("N");
  const [examAsi, setExamAsi] = useState(false);
  const [examCacing, setExamCacing] = useState(false);
  const [examImunisasi, setExamImunisasi] = useState("");

  // Form Fields - Lansia (Checkup)
  const [examSistol, setExamSistol] = useState("");
  const [examDiastol, setExamDiastol] = useState("");
  const [examGds, setExamGds] = useState("");
  const [examLp, setExamLp] = useState("");
  const [examCholesterol, setExamCholesterol] = useState("");
  const [examUricAcid, setExamUricAcid] = useState("");
  const [examKeluhan, setExamKeluhan] = useState("");
  const [examTindakan, setExamTindakan] = useState("");

  // Otomatisasi Status Gizi Balita (Z-Score)
  useEffect(() => {
    if (!selectedPasien || selectedPasien.tipe !== "Balita" || !selectedPasien.tanggalLahir) return;
    const bb = parseFloat(examBB);
    const tb = parseFloat(examTB);
    const usia = calculateAgeInMonths(selectedPasien.tanggalLahir, examDate);
    const jk = selectedPasien.jenisKelamin || "L";
    if (!isNaN(bb) && bb > 0) {
      setExamBBU(hitungStatusBbU(bb, usia, jk));
    }
    if (!isNaN(tb) && tb > 0) {
      setExamTBU(hitungStatusTbU(tb, usia, jk));
    }
    if (!isNaN(bb) && bb > 0 && !isNaN(tb) && tb > 0) {
      setExamBBTB(hitungStatusBbTb(bb, tb, jk));
    }
  }, [examBB, examTB, examDate, selectedPasien]);

  // Error & Feedback (Checkup)
  const [formError, setFormError] = useState("");
  const [formWarning, setFormWarning] = useState("");
  const [successToast, setSuccessToast] = useState("");

  // Filter Patients
  const filteredPasiens = pasiens.filter((p) => {
    const matchesSearch = p.nama.toLowerCase().includes(query.toLowerCase());
    const matchesType = selectedTypeFilter === "Semua" || p.tipe === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  // Warning Check (Checkup)
  const checkWarnings = (bbVal: string, sistolVal: string, gdsVal: string) => {
    setFormWarning("");
    if (!selectedPasien) return;

    const bb = parseFloat(bbVal);
    const sistol = parseInt(sistolVal);
    const gds = parseInt(gdsVal);

    if (selectedPasien.tipe === "Balita" && bb > 25) {
      setFormWarning("Konfirmasi: Apakah Berat Badan Balita (>25 kg) sudah benar? Mohon cek kembali.");
    } else if (selectedPasien.tipe === "Lansia") {
      if (sistol > 200) {
        setFormWarning("Peringatan: Tekanan darah sistol >200 mmHg sangat tinggi. Mohon lakukan rujukan segera.");
      } else if (gds > 300) {
        setFormWarning("Peringatan: Gula darah GDS >300 mg/dL sangat tinggi. Segera konsultasikan ke Bidan Desa.");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!selectedPasien) return;

    const bb = parseFloat(examBB);
    const tb = parseFloat(examTB);

    if (isNaN(bb) || bb <= 0 || isNaN(tb) || tb <= 0) {
      setFormError("Berat Badan (kg) dan Tinggi Badan (cm) harus diisi dengan angka positif.");
      return;
    }

    let summaryText = `BB: ${bb}kg, TB: ${tb}cm`;
    let statusText = "Selesai (Normal)";

    if (selectedPasien.tipe === "Balita") {
      const lk = examLK ? parseFloat(examLK) : undefined;
      const lila = examLiLA ? parseFloat(examLiLA) : undefined;
      summaryText += `${lk ? `, LK: ${lk}cm` : ""}${lila ? `, LiLA: ${lila}cm` : ""}${examVitA ? ", Vit A" : ""}${examAsi ? ", ASI Eksklusif" : ""}${examCacing ? ", Obat Cacing" : ""}${examImunisasi ? `, Imunisasi: ${examImunisasi}` : ""}`;
      statusText = `Selesai (${examBBU})`;
    } else {
      const sis = parseInt(examSistol);
      const dia = parseInt(examDiastol);
      const gds = parseInt(examGds);
      const lp = parseInt(examLp);
      const kol = examCholesterol ? parseInt(examCholesterol) : undefined;
      const urat = examUricAcid ? parseFloat(examUricAcid) : undefined;

      if (isNaN(sis) || isNaN(dia) || isNaN(gds) || isNaN(lp)) {
        setFormError("Silakan isi data Tekanan Darah, GDS, dan Lingkar Perut lansia secara lengkap.");
        return;
      }
      summaryText += `, TD: ${sis}/${dia}, GDS: ${gds}, LP: ${lp}cm${kol ? `, Kolesterol: ${kol}` : ""}${urat ? `, Asam Urat: ${urat}` : ""}`;
      statusText = sis >= 140 || gds >= 200 || (kol && kol >= 200) ? "Selesai (Rawan)" : "Selesai (Normal)";
    }

    const timeNow = new Date();
    const timeStr = `${String(timeNow.getHours()).padStart(2, "0")}:${String(timeNow.getMinutes()).padStart(2, "0")} WIB`;

    const newLog: SessionLog = {
      id: `s-${Date.now()}`,
      nama: selectedPasien.nama,
      tipe: selectedPasien.tipe,
      waktu: timeStr,
      summary: summaryText,
      status: statusText,
    };

    setSessionLogs([newLog, ...sessionLogs]);
    setSuccessToast(`Pemeriksaan bulanan untuk ${selectedPasien.nama} berhasil disimpan.`);

    setExamBB("");
    setExamTB("");
    setExamLK("");
    setExamSistol("");
    setExamDiastol("");
    setExamGds("");
    setExamLp("");
    setExamLiLA("");
    setExamCholesterol("");
    setExamUricAcid("");
    setExamKeluhan("");
    setExamTindakan("");
    setExamKms("N");
    setExamAsi(false);
    setExamCacing(false);
    setExamImunisasi("");
    setExamBBU("Normal");
    setExamTBU("Normal");
    setExamBBTB("Normal");
    setExamVitA(false);
    setSelectedPasien(null);
    setFormWarning("");

    setTimeout(() => setSuccessToast(""), 4000);
  };

  // Submit Handler (Register Balita)
  const handleRegisterBalita = async (e: React.FormEvent) => {
    e.preventDefault();
    setBError("");

    if (!bNama.trim() || !bNamaIbu.trim() || !bAlamat.trim()) {
      setBError("Mohon lengkapi nama anak, nama ibu, dan alamat.");
      return;
    }

    if (bNik && bNik.length !== 16) {
      setBError("NIK harus tepat 16 digit angka.");
      return;
    }

    try {
      const res = await balitaApi.create(posyanduId, {
        nama: bNama,
        nik: bNik || undefined,
        tanggalLahir: bTglLahir,
        jenisKelamin: bJk,
        namaIbu: bNamaIbu,
        alamat: bAlamat,
      });

      if (res.success && res.data) {
        const ageMonths = calculateAgeInMonths(res.data.tanggalLahir);
        const newPasien: Pasien = {
          id: res.data.id,
          nama: res.data.nama,
          tipe: "Balita",
          subInfo: `Usia ${ageMonths} Bulan`,
          detail1: res.data.namaIbu,
          detail2: res.data.alamat,
          tanggalLahir: res.data.tanggalLahir,
          jenisKelamin: res.data.jenisKelamin,
        };

        setPasiens((prev) => [newPasien, ...prev]);
        setSelectedPasien(newPasien);
        setShowAddBalitaModal(false);
        setSuccessToast(`${bNama} berhasil didaftarkan & dipilih.`);

        setBNama("");
        setBNik("");
        setBTglLahir("2025-01-01");
        setBJk("L");
        setBNamaIbu("");
        setBAlamat("RT 01 / RW 02, Karanggayam");
        setTimeout(() => setSuccessToast(""), 4000);
      }
    } catch (err: any) {
      setBError(err.message || "Gagal mendaftarkan balita.");
    }
  };

  // Submit Handler (Register Lansia)
  const handleRegisterLansia = async (e: React.FormEvent) => {
    e.preventDefault();
    setLError("");

    if (!lNama.trim() || !lNik.trim() || !lRtRw.trim() || !lAlamat.trim()) {
      setLError("Mohon isi nama, NIK, RT/RW, dan alamat.");
      return;
    }

    if (lNik.length !== 16) {
      setLError("NIK harus tepat 16 digit angka.");
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
        const ageYears = calculateAgeInYears(res.data.tanggalLahir);
        const newPasien: Pasien = {
          id: res.data.id,
          nama: res.data.nama,
          tipe: "Lansia",
          subInfo: `Usia ${ageYears} Tahun`,
          detail1: res.data.noBpjs ? `BPJS: ${res.data.noBpjs}` : "BPJS: Tidak Ada",
          detail2: `${res.data.rtRw}, ${res.data.alamat}`,
          tanggalLahir: res.data.tanggalLahir,
          jenisKelamin: res.data.jenisKelamin,
        };

        setPasiens((prev) => [newPasien, ...prev]);
        setSelectedPasien(newPasien);
        setShowAddLansiaModal(false);
        setSuccessToast(`Lansia ${lNama} berhasil didaftarkan & dipilih.`);

        setLNama("");
        setLNik("");
        setLBpjs("");
        setLTglLahir("1960-01-01");
        setLJk("L");
        setLRtRw("");
        setLAlamat("Desa Karanggayam");
        setLHt(false);
        setLDm(false);
        setLKemandirian("A");
        setLMental("");
        setTimeout(() => setSuccessToast(""), 4000);
      }
    } catch (err: any) {
      setLError(err.message || "Gagal mendaftarkan lansia.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-green-50 text-trend-successText border border-green-150 rounded-card shadow-lg flex items-center gap-2.5">
          <UserCheck2 className="w-5 h-5 text-green-600 shrink-0" />
          <span className="text-xs font-bold">{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-saas-dark tracking-tight">Pencatatan Pelayanan Posyandu</h2>
          <p className="text-sm text-saas-muted mt-0.5">Input data penimbangan, tinggi badan, dan skrining medis warga posyandu.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddBalitaModal(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-all"
          >
            <UserPlus className="w-4 h-4" /> + Balita Baru
          </button>
          <button
            onClick={() => setShowAddLansiaModal(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-all"
          >
            <UserPlus className="w-4 h-4" /> + Lansia Baru
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* KOLOM KIRI: Cari & Pilih Warga */}
        <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 flex flex-col h-[600px] space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-saas-dark">Pilih Warga</h3>
            <p className="text-[11px] text-saas-muted leading-normal">Cari nama warga balita atau lansia yang akan dilayani.</p>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Cari nama warga..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50 focus:bg-white transition-all"
            />
            <Search className="absolute left-3 top-2.5 text-saas-muted w-4.5 h-4.5" />
          </div>

          <div className="flex gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100/50">
            {(["Semua", "Balita", "Lansia"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTypeFilter(t)}
                className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-all ${
                  selectedTypeFilter === t
                    ? "bg-white text-saas-primary shadow-sm"
                    : "text-saas-muted hover:text-saas-dark"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2">
            {filteredPasiens.length > 0 ? (
              filteredPasiens.map((p) => {
                const isSelected = selectedPasien?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPasien(p);
                      setFormError("");
                      setFormWarning("");
                    }}
                    className={`w-full text-left p-3 border rounded-xl flex items-center justify-between text-xs transition-all group ${
                      isSelected
                        ? "border-saas-primary bg-saas-primary/5 shadow-sm shadow-teal-500/5"
                        : "border-gray-100 hover:border-saas-primary/30 hover:bg-gray-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? "bg-saas-primary text-white" 
                          : p.tipe === "Balita" ? "bg-teal-50 text-saas-primary" : "bg-red-50 text-red-500"
                      }`}>
                        {p.tipe === "Balita" ? <Baby className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className={`font-bold transition-colors ${
                          isSelected ? "text-saas-primary" : "text-saas-dark group-hover:text-saas-primary"
                        }`}>{p.nama}</p>
                        <p className="text-[10px] text-saas-muted font-semibold mt-0.5">{p.subInfo}</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${
                      isSelected ? "text-saas-primary translate-x-1" : "text-saas-muted group-hover:translate-x-1"
                    }`} />
                  </button>
                );
              })
            ) : (
              <p className="text-center text-xs text-saas-muted py-12 font-medium">Nama warga tidak ditemukan.</p>
            )}
          </div>
        </div>

        {/* KOLOM KANAN: Formulir Input Pemeriksaan */}
        <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 lg:col-span-2 h-[600px] overflow-y-auto flex flex-col justify-between">
          {!selectedPasien ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-saas-muted">
                <SlidersHorizontal className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-saas-dark">Mulai Pencatatan Pemeriksaan</h3>
                <p className="text-xs text-saas-muted mt-1 max-w-sm leading-relaxed">
                  Pilih salah satu warga dari daftar di panel sebelah kiri atau daftarkan warga baru melalui tombol di atas untuk memulai penginputan pemeriksaan.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-saas-muted uppercase tracking-wider">Warga Terpilih</span>
                    <button 
                      onClick={() => setSelectedPasien(null)}
                      className="text-[10px] text-trend-dangerText font-bold hover:underline"
                    >
                      Batal Pilih
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        selectedPasien.tipe === "Balita" ? "bg-teal-100 text-saas-primary" : "bg-red-100 text-red-500"
                      }`}>
                        {selectedPasien.tipe === "Balita" ? <Baby className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-extrabold text-saas-dark text-sm leading-none">{selectedPasien.nama}</p>
                        <p className="text-[10px] text-saas-muted font-bold mt-1">
                          {selectedPasien.subInfo} | {selectedPasien.tipe === "Balita" ? `Ibu: ${selectedPasien.detail1}` : selectedPasien.detail1}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] text-saas-muted">Alamat</p>
                      <p className="text-[11px] text-saas-dark font-semibold mt-0.5 leading-snug">{selectedPasien.detail2}</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                  {formError && (
                    <div className="p-3 bg-red-50 text-trend-dangerText border border-red-100 rounded-lg text-xs font-bold flex gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
                    </div>
                  )}
                  {formWarning && (
                    <div className="p-3 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded-lg text-xs font-semibold flex gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {formWarning}
                    </div>
                  )}

                  <div className={`grid grid-cols-1 ${selectedPasien.tipe === "Lansia" ? "sm:grid-cols-4" : "sm:grid-cols-3"} gap-4`}>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-saas-muted">Tanggal Periksa</label>
                      <input
                        type="date"
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-saas-muted">Berat Badan (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="Contoh: 9.5"
                        value={examBB}
                        onChange={(e) => {
                          setExamBB(e.target.value);
                          checkWarnings(e.target.value, examSistol, examGds);
                        }}
                        className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-saas-muted">Tinggi Badan (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="Contoh: 74.2"
                        value={examTB}
                        onChange={(e) => setExamTB(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                      />
                    </div>

                    {selectedPasien.tipe === "Lansia" && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-teal-600">IMT (Otomatis)</label>
                        <input
                          type="text"
                          disabled
                          value={
                            parseFloat(examBB) > 0 && parseFloat(examTB) > 0
                              ? hitungIMT(parseFloat(examBB), parseFloat(examTB))
                              : "-"
                          }
                          className="w-full p-2.5 bg-teal-50/50 border border-teal-150 rounded-input text-xs font-bold text-teal-700 cursor-not-allowed"
                        />
                      </div>
                    )}
                  </div>

                  {selectedPasien.tipe === "Balita" && (
                    <div className="space-y-4 border-t border-gray-50 pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-saas-muted">Lingkar Kepala (cm)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="Cth: 45"
                            value={examLK}
                            onChange={(e) => setExamLK(e.target.value)}
                            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-saas-muted">Lingkar Lengan (LiLA - cm)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="Cth: 12.5"
                            value={examLiLA}
                            onChange={(e) => setExamLiLA(e.target.value)}
                            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-saas-muted">Status KMS</label>
                          <select
                            value={examKms}
                            onChange={(e) => setExamKms(e.target.value)}
                            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                          >
                            <option value="N">N (Berat Naik)</option>
                            <option value="T">T (Berat Tetap/Turun)</option>
                            <option value="2T">2T (2x Tidak Naik)</option>
                            <option value="B">B (Baru Pertama Kali)</option>
                            <option value="O">O (Bulan Lalu Absen)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-saas-muted">Imunisasi</label>
                          <input
                            type="text"
                            placeholder="Cth: BCG, Polio 1"
                            value={examImunisasi}
                            onChange={(e) => setExamImunisasi(e.target.value)}
                            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center pt-2 pb-2 pl-2">
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

                        <div className="flex items-center pt-2 pb-2 pl-2">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={examAsi}
                              onChange={(e) => setExamAsi(e.target.checked)}
                              className="w-4.5 h-4.5 text-saas-primary focus:ring-saas-primary/30"
                            />
                            <span className="text-xs font-bold text-saas-dark">ASI Eksklusif</span>
                          </label>
                        </div>

                        <div className="flex items-center pt-2 pb-2 pl-2">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={examCacing}
                              onChange={(e) => setExamCacing(e.target.checked)}
                              className="w-4.5 h-4.5 text-saas-primary focus:ring-saas-primary/30"
                            />
                            <span className="text-xs font-bold text-saas-dark">Obat Cacing</span>
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-saas-muted">Status BB/U (Otomatis)</label>
                          <select
                            value={examBBU}
                            disabled
                            className="w-full p-2.5 bg-gray-150 border border-gray-150 rounded-input text-xs font-bold text-saas-dark focus:outline-none cursor-not-allowed"
                          >
                            <option value="Normal">Normal</option>
                            <option value="Kurang">Kurang</option>
                            <option value="Sangat Kurang">Sangat Kurang</option>
                            <option value="Lebih">Lebih</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-saas-muted">Status TB/U (Otomatis)</label>
                          <select
                            value={examTBU}
                            disabled
                            className="w-full p-2.5 bg-gray-150 border border-gray-150 rounded-input text-xs font-bold text-saas-dark focus:outline-none cursor-not-allowed"
                          >
                            <option value="Normal">Normal</option>
                            <option value="Pendek">Pendek</option>
                            <option value="Sangat Pendek">Sangat Pendek</option>
                            <option value="Tinggi">Tinggi</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-saas-muted">Status BB/TB (Otomatis)</label>
                          <select
                            value={examBBTB}
                            disabled
                            className="w-full p-2.5 bg-gray-150 border border-gray-150 rounded-input text-xs font-bold text-saas-dark focus:outline-none cursor-not-allowed"
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

                  {selectedPasien.tipe === "Lansia" && (
                    <div className="space-y-4 border-t border-gray-50 pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-saas-muted">Sistol (mmHg)</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="cth: 120"
                            value={examSistol}
                            onChange={(e) => {
                              setExamSistol(e.target.value);
                              checkWarnings(examBB, e.target.value, examGds);
                            }}
                            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-saas-muted">Diastol (mmHg)</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="cth: 80"
                            value={examDiastol}
                            onChange={(e) => setExamDiastol(e.target.value)}
                            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-saas-muted">GDS (mg/dL)</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="cth: 120"
                            value={examGds}
                            onChange={(e) => {
                              setExamGds(e.target.value);
                              checkWarnings(examBB, examSistol, e.target.value);
                            }}
                            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-saas-muted">Lingkar Perut (cm)</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="cth: 90"
                            value={examLp}
                            onChange={(e) => setExamLp(e.target.value)}
                            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-saas-muted">Kolesterol (mg/dL)</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="cth: 180"
                            value={examCholesterol}
                            onChange={(e) => setExamCholesterol(e.target.value)}
                            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-saas-muted">Asam Urat (mg/dL)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="cth: 6.2"
                            value={examUricAcid}
                            onChange={(e) => setExamUricAcid(e.target.value)}
                            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-saas-muted">Keluhan Saat Ini</label>
                          <textarea
                            placeholder="Tulis keluhan lansia saat ini..."
                            rows={2}
                            value={examKeluhan}
                            onChange={(e) => setExamKeluhan(e.target.value)}
                            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50 resize-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-saas-muted">Tindakan / Rujukan</label>
                          <textarea
                            placeholder="Tulis tindakan medis atau rujukan..."
                            rows={2}
                            value={examTindakan}
                            onChange={(e) => setExamTindakan(e.target.value)}
                            className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 border-t border-gray-50">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Simpan Pemeriksaan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DATA YANG SELESAI HARI INI */}
      <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-saas-dark">Pencatatan Sesi Hari Ini</h3>
            <p className="text-xs text-saas-muted mt-0.5">Daftar warga yang sudah selesai dimasukkan datanya dalam sesi pelayanan ini.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-bold text-saas-muted uppercase tracking-wider">
                <th className="pb-3">Nama</th>
                <th className="pb-3">Kategori</th>
                <th className="pb-3">Hasil Pengukuran</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Jam Input</th>
              </tr>
            </thead>
            <tbody>
              {sessionLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-50 last:border-b-0 text-xs text-saas-dark">
                  <td className="py-3.5 font-bold">{log.nama}</td>
                  <td className="py-3.5 text-saas-muted font-semibold">{log.tipe}</td>
                  <td className="py-3.5 text-saas-muted font-semibold">{log.summary}</td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                      log.status.includes("Normal") 
                        ? "bg-trend-successBg text-trend-successText" 
                        : "bg-trend-dangerBg text-trend-dangerText"
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right font-bold text-saas-muted">{log.waktu}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* REUSABLE DRAWER: DAFTAR BALITA BARU */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showAddBalitaModal}
        onClose={() => {
          setShowAddBalitaModal(false);
          setBError("");
        }}
        title="Daftarkan Balita Baru"
        description="Daftarkan identitas balita baru ke register sebelum mencatat data pemeriksaan bulanan."
        type="drawer"
      >
        <form onSubmit={handleRegisterBalita} className="space-y-4 pt-2 flex flex-col justify-between h-full">
          <div className="space-y-4">
            {bError && (
              <div className="p-3 bg-red-50 text-trend-dangerText border border-red-100 rounded-lg text-xs font-bold flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {bError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">Nama Lengkap Anak</label>
              <input
                type="text"
                placeholder="Contoh: Rafif Athar"
                value={bNama}
                onChange={(e) => setBNama(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">NIK (16 Digit - Opsional)</label>
              <input
                type="text"
                maxLength={16}
                placeholder="330102xxxxxxxxxx"
                value={bNik}
                onChange={(e) => setBNik(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted">Tanggal Lahir</label>
                <input
                  type="date"
                  value={bTglLahir}
                  onChange={(e) => setBTglLahir(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted">Jenis Kelamin</label>
                <div className="flex gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-saas-dark cursor-pointer select-none">
                    <input
                      type="radio"
                      name="b-jk-drawer"
                      checked={bJk === "L"}
                      onChange={() => setBJk("L")}
                      className="w-4 h-4 text-saas-primary focus:ring-saas-primary/30"
                    />
                    Laki-laki
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-saas-dark cursor-pointer select-none">
                    <input
                      type="radio"
                      name="b-jk-drawer"
                      checked={bJk === "P"}
                      onChange={() => setBJk("P")}
                      className="w-4 h-4 text-saas-primary focus:ring-saas-primary/30"
                    />
                    Perempuan
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">Nama Lengkap Ibu Kandung</label>
              <input
                type="text"
                placeholder="Contoh: Ibu Ranti"
                value={bNamaIbu}
                onChange={(e) => setBNamaIbu(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">Alamat Rumah (Jalan / RT / RW)</label>
              <input
                type="text"
                value={bAlamat}
                onChange={(e) => setBAlamat(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-100 mt-8 shrink-0">
            <button
              type="button"
              onClick={() => {
                setShowAddBalitaModal(false);
                setBError("");
              }}
              className="flex-1 py-3 border border-gray-200 text-saas-dark text-xs font-bold rounded-input hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-colors"
            >
              Daftarkan & Pilih
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* REUSABLE DRAWER: DAFTAR LANSIA BARU */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showAddLansiaModal}
        onClose={() => {
          setShowAddLansiaModal(false);
          setLError("");
        }}
        title="Daftarkan Lansia Baru"
        description="Daftarkan identitas lansia baru sebelum melakukan skrining kesehatan berkala."
        type="drawer"
      >
        <form onSubmit={handleRegisterLansia} className="space-y-4 pt-2 flex flex-col justify-between h-full">
          <div className="space-y-4">
            {lError && (
              <div className="p-3 bg-red-50 text-trend-dangerText border border-red-100 rounded-lg text-xs font-bold flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {lError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">Nama Lengkap Lansia</label>
              <input
                type="text"
                placeholder="Contoh: Mbah Joyo"
                value={lNama}
                onChange={(e) => setLNama(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted">NIK (16 digit wajib)</label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="NIK sesuai KTP"
                  value={lNik}
                  onChange={(e) => setLNik(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted">No BPJS (Opsional)</label>
                <input
                  type="text"
                  placeholder="Nomor kartu BPJS"
                  value={lBpjs}
                  onChange={(e) => setLBpjs(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted">Tanggal Lahir</label>
                <input
                  type="date"
                  value={lTglLahir}
                  onChange={(e) => setLTglLahir(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted">Jenis Kelamin</label>
                <div className="flex gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-saas-dark cursor-pointer select-none">
                    <input
                      type="radio"
                      name="l-jk-drawer"
                      checked={lJk === "L"}
                      onChange={() => setLJk("L")}
                      className="w-4 h-4 text-saas-primary focus:ring-saas-primary/30"
                    />
                    Laki-laki
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-saas-dark cursor-pointer select-none">
                    <input
                      type="radio"
                      name="l-jk-drawer"
                      checked={lJk === "P"}
                      onChange={() => setLJk("P")}
                      className="w-4 h-4 text-saas-primary focus:ring-saas-primary/30"
                    />
                    Perempuan
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-gray-50 pt-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-saas-muted">RT / RW</label>
                <input
                  type="text"
                  placeholder="Cth: RT 02 / RW 02"
                  value={lRtRw}
                  onChange={(e) => setLRtRw(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-saas-muted">Status Kemandirian</label>
                <select
                  value={lKemandirian}
                  onChange={(e) => setLKemandirian(e.target.value as any)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                >
                  <option value="A">Kategori A (Mandiri)</option>
                  <option value="B">Kategori B (Bantuan Sebagian)</option>
                  <option value="C">Kategori C (Tergantung Total)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">Penyakit Bawaan (HT / DM)</label>
              <div className="flex gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={lHt}
                    onChange={(e) => setLHt(e.target.checked)}
                    className="w-4.5 h-4.5 text-saas-primary focus:ring-saas-primary/30"
                  />
                  <span className="text-xs font-bold text-saas-dark">Hipertensi</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={lDm}
                    onChange={(e) => setLDm(e.target.checked)}
                    className="w-4.5 h-4.5 text-saas-primary focus:ring-saas-primary/30"
                  />
                  <span className="text-xs font-bold text-saas-dark">Diabetes</span>
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">Catatan Skrining Mental (Opsional)</label>
              <input
                type="text"
                placeholder="Cth: Cenderung pikun"
                value={lMental}
                onChange={(e) => setLMental(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">Alamat Wilayah / Dusun</label>
              <input
                type="text"
                value={lAlamat}
                onChange={(e) => setLAlamat(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-100 mt-8 shrink-0">
            <button
              type="button"
              onClick={() => {
                setShowAddLansiaModal(false);
                setLError("");
              }}
              className="flex-1 py-3 border border-gray-200 text-saas-dark text-xs font-bold rounded-input hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-colors"
            >
              Daftarkan & Pilih
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
