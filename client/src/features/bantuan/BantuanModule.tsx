"use client";

import { useState } from "react";
import {
  User,
  HelpCircle,
  Search,
  BookOpen,
  ShieldAlert,
  Users,
  PhoneCall,
  FileText,
  ArrowLeft,
  HelpCircle as InfoIcon,
  ListTodo,
  Table as TableIcon,
  Scale,
  Ruler,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import PageHelmet from "../../components/PageHelmet";
import LansiaIcon from "../../components/LansiaIcon";
import BalitaIcon from "../../components/BalitaIcon";
import { BBU_DATA, TBU_DATA, BBTB_DATA, SDArray } from "../../lib/antropometriData";

interface Guide {
  id: string;
  title: string;
  category: "kader" | "owner";
  description: string;
  icon: any;
  steps: {
    title: string;
    text: string;
    badge?: string;
  }[];
}

export default function BantuanModule() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGuideId, setActiveGuideId] = useState<string | null>(null);

  // State untuk Tabel Standar Antropometri (Permenkes 2/2020)
  const [tableTab, setTableTab] = useState<"bbu" | "tbu" | "bbtb">("bbu");
  const [tableJk, setTableJk] = useState<"L" | "P">("L");
  const [tableSearch, setTableSearch] = useState("");

  // Kamus Istilah Sederhana (Glossary)
  const glossary = [
    { istilah: "Stunting (Kerdil)", arti: "Kondisi anak yang terlalu pendek dibanding anak seusianya karena kurang gizi dalam waktu yang sangat lama (PB/U atau TB/U < -2 SD)." },
    { istilah: "Wasting (Kurus)", arti: "Kondisi anak yang berat badannya terlalu kurus dibanding tinggi badannya (BB/PB atau BB/TB < -2 SD)." },
    { istilah: "Underweight (BB Kurang)", arti: "Kondisi anak yang berat badannya kurang dibanding usianya (BB/U < -2 SD)." },
    { istilah: "Hipertensi", arti: "Tekanan darah tinggi (sistol di atas 140 atau diastol di atas 90)." },
    { istilah: "Diabetes (Penyakit Gula)", arti: "Kondisi di mana kadar gula dalam darah terlalu tinggi (kencing manis)." },
    { istilah: "Sistol & Diastol", arti: "Angka tensi darah. Sistol adalah angka atas (saat jantung memompa), diastol adalah angka bawah (saat jantung istirahat)." },
  ];

  // Panduan Langkah Demi Langkah (Step-by-Step Guides)
  const guides: Guide[] = [
    {
      id: "g1",
      title: "Mencatat Pemeriksaan Bulanan",
      category: "kader",
      description: "Cara mencatat berat badan, tinggi badan, dan vit A saat pelayanan posyandu berlangsung.",
      icon: FileText,
      steps: [
        { title: "Langkah 1: Masuk Menu Pelayanan", text: "Klik tombol 'Pelayanan' di menu navigasi utama." },
        { title: "Langkah 2: Pilih Halaman Balita / Lansia", text: "Klik tombol Balita atau Lansia di bagian atas untuk berpindah halaman pelayanan." },
        { title: "Langkah 3: Cari Nama Warga & Isi Formulir", text: "Pilih nama warga di panel kiri, lalu masukkan data hasil penimbangan / pemeriksaan medis pada formulir di sebelah kanan." },
        { title: "Langkah 4: Klik Simpan", text: "Periksa kembali angka yang dimasukkan, lalu klik tombol 'Simpan Pemeriksaan'. Data akan langsung terekam.", badge: "Penting" }
      ]
    },
    {
      id: "g2",
      title: "Mendaftarkan Balita Baru",
      category: "kader",
      description: "Cara mendaftarkan anak/bayi yang baru pertama kali datang ke posyandu.",
      icon: BalitaIcon,
      steps: [
        { title: "Langkah 1: Klik Tombol Balita Baru", text: "Buka menu 'Pelayanan', lalu klik tombol '+ Balita Baru' di sudut kanan atas halaman." },
        { title: "Langkah 2: Isi Nama & Tanggal Lahir", text: "Masukkan Nama Lengkap anak, NIK (jika ada di kartu keluarga), dan Tanggal Lahir (sistem akan menghitung usianya secara otomatis)." },
        { title: "Langkah 3: Masukkan Nama Ibu", text: "Masukkan nama lengkap ibu kandung untuk mencocokkan identitas anak." },
        { title: "Langkah 4: Klik Daftar & Pilih", text: "Klik tombol 'Daftarkan & Pilih'. Anak baru akan otomatis tersimpan ke daftar warga dan formulir rekam medisnya langsung terbuka untuk diisi." }
      ]
    },
    {
      id: "g3",
      title: "Mendaftarkan Lansia Baru",
      category: "kader",
      description: "Cara mendaftarkan warga lansia baru di lingkungan posyandu.",
      icon: LansiaIcon,
      steps: [
        { title: "Langkah 1: Klik Tombol Lansia Baru", text: "Buka menu 'Pelayanan', lalu klik tombol '+ Lansia Baru' di sudut kanan atas halaman." },
        { title: "Langkah 2: Isi NIK & BPJS", text: "Ketik NIK 16 digit sesuai KTP lansia dan nomor kartu BPJS (jika ada)." },
        { title: "Langkah 3: Pilih Tingkat Kemandirian", text: "Pilih status kemandirian lansia (Kategori A: Mandiri, B: Bantuan Sebagian, C: Tergantung Total)." },
        { title: "Langkah 4: Klik Daftar", text: "Klik tombol 'Daftarkan & Pilih' untuk menyimpan. Lansia tersebut langsung terdaftar sebagai peserta aktif posyandu." }
      ]
    },
    {
      id: "g4",
      title: "Mengoreksi / Mengubah Salah Ketik Data",
      category: "kader",
      description: "Cara membetulkan data pemeriksaan warga jika kader tidak sengaja salah menginput angka.",
      icon: ShieldAlert,
      steps: [
        { title: "Langkah 1: Buka Data Warga", text: "Klik menu 'Balita' atau 'Lansia' di sebelah kiri, cari nama warga yang datanya salah." },
        { title: "Langkah 2: Buka Profil Detail", text: "Klik tombol abu-abu 'Detail Data' di sebelah kanan nama warga tersebut." },
        { title: "Langkah 3: Lihat Tabel Riwayat", text: "Gulir layar ke bawah. Di sana terdapat tabel berisi seluruh hasil pemeriksaan dari bulan ke bulan." },
        { title: "Langkah 4: Klik Edit/Hapus", text: "Klik tombol edit di samping baris bulan yang salah ketik (atau segera hubungi kader Owner jika Anda tidak memiliki hak menghapus data)." }
      ]
    },
    {
      id: "g5",
      title: "Mendaftarkan Kader / Anggota Baru",
      category: "owner",
      description: "Panduan untuk kader Owner dalam mengundang kader pembantu baru.",
      icon: Users,
      steps: [
        { title: "Langkah 1: Buka Manajemen Akun", text: "Klik menu 'Manajemen Akun' di sidebar kiri (khusus akun berstatus Owner)." },
        { title: "Langkah 2: Klik Buat Akun", text: "Klik tombol 'Buat Akun Kader Baru' di kanan atas." },
        { title: "Langkah 3: Buat Username & Password", text: "Masukkan Nama Lengkap, Email, Kata Sandi awal (misal: 123456), dan tentukan perannya (Anggota/Owner)." },
        { title: "Langkah 4: Bagikan Akses", text: "Klik Simpan. Berikan email dan kata sandi tersebut kepada kader baru agar mereka bisa langsung masuk ke sistem." }
      ]
    }
  ];

  // Filter guides based on search query
  const filteredGuides = guides.filter((g) =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedGuide = guides.find((g) => g.id === activeGuideId);

  // Helper untuk filter data tabel antropometri
  const getTableRows = () => {
    if (tableTab === "bbu") {
      const data = BBU_DATA[tableJk];
      return Object.entries(data).map(([umur, sds]) => ({
        label: `${umur} Bulan`,
        valNum: parseInt(umur, 10),
        sds
      })).filter(row => !tableSearch || row.label.toLowerCase().includes(tableSearch.toLowerCase()) || row.valNum.toString().includes(tableSearch));
    } else if (tableTab === "tbu") {
      const data = TBU_DATA[tableJk];
      return Object.entries(data).map(([umur, sds]) => ({
        label: parseInt(umur, 10) <= 24 ? `${umur} Bulan (PB)` : `${umur} Bulan (TB)`,
        valNum: parseInt(umur, 10),
        sds
      })).filter(row => !tableSearch || row.label.toLowerCase().includes(tableSearch.toLowerCase()) || row.valNum.toString().includes(tableSearch));
    } else {
      const data = BBTB_DATA[tableJk];
      return data.map(item => ({
        label: `${item.tb} cm`,
        valNum: item.tb,
        sds: item.sds
      })).filter(row => !tableSearch || row.label.toLowerCase().includes(tableSearch.toLowerCase()) || row.valNum.toString().includes(tableSearch));
    }
  };

  const tableRows = getTableRows();

  return (
    <div className="space-y-8 pb-10">
      <PageHelmet
        title="Pusat Bantuan & Dokumen"
        description="Panduan penggunaan sistem posyandu, FAQ, tabel standar Permenkes 2/2020, dan kontak dukungan teknis."
      />
      {/* View Detail Panduan */}
      {selectedGuide ? (
        <div className="space-y-6 max-w-3xl">
          <button
            onClick={() => setActiveGuideId(null)}
            className="flex items-center gap-1.5 text-xs font-bold text-saas-primary hover:underline transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Pusat Bantuan
          </button>

          <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-saas-primary/10 flex items-center justify-center text-saas-primary">
                <selectedGuide.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-saas-dark">{selectedGuide.title}</h3>
                <p className="text-xs text-saas-muted mt-0.5">{selectedGuide.description}</p>
              </div>
            </div>

            {/* Steps Container */}
            <div className="space-y-4 pt-4 border-t border-gray-50">
              {selectedGuide.steps.map((step, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-gray-50 border border-gray-100/55 rounded-xl text-xs">
                  <div className="w-8 h-8 rounded-full bg-saas-primary/15 flex items-center justify-center text-saas-primary font-black shrink-0">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-saas-dark">{step.title}</h4>
                      {step.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-bold text-[9px]">
                          {step.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-saas-muted font-semibold leading-relaxed">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-50 flex justify-end">
              <button
                onClick={() => setActiveGuideId(null)}
                className="px-5 py-2.5 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-colors"
              >
                Sudah Paham, Kembali
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Main Help View
        <div className="space-y-8">
          {/* Search Box */}
          <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-4">
            <div className="max-w-xl space-y-2">
              <h3 className="font-extrabold text-base text-saas-dark">Ada kendala apa hari ini?</h3>
              <p className="text-xs text-saas-muted leading-normal">
                Pilih topik di bawah atau ketik kata kunci kendala Anda untuk panduan langkah demi langkah yang mudah dipahami.
              </p>
            </div>
            
            <div className="relative max-w-xl">
              <input
                type="text"
                placeholder="Cari kendala, misal: salah ketik, daftar balita..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50 focus:bg-white transition-all"
              />
              <Search className="absolute left-4 top-3.5 text-saas-muted w-4.5 h-4.5" />
            </div>
          </div>

          {/* Quick Action Guides Grid */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-saas-dark">Pilih Panduan Sesuai Kebutuhan Anda</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide) => {
                const Icon = guide.icon;
                return (
                  <button
                    key={guide.id}
                    onClick={() => setActiveGuideId(guide.id)}
                    className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-5 text-left flex gap-4 hover:border-saas-primary/35 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-saas-primary/10 text-saas-primary flex items-center justify-center shrink-0 group-hover:bg-saas-primary group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-xs text-saas-dark group-hover:text-saas-primary transition-colors">
                        {guide.title}
                      </h4>
                      <p className="text-[11px] text-saas-muted leading-normal font-semibold">
                        {guide.description}
                      </p>
                      <span className="text-[10px] text-saas-primary font-bold inline-block pt-1.5 group-hover:underline">
                        Lihat Langkah →
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TABEL STANDAR ANTROPOMETRI ANAK (PERMENKES NO. 2 TAHUN 2020) */}
          <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-saas-primary flex items-center justify-center">
                  <TableIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-saas-dark flex items-center gap-2">
                    Tabel Standar Antropometri Anak
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-100 text-teal-800 rounded-full">
                      Permenkes No. 2 Th 2020
                    </span>
                  </h3>
                  <p className="text-xs text-saas-muted mt-0.5">
                    Standar Rujukan Resmi Kementerian Kesehatan RI untuk penilaian Z-Score pertumbuhan balita.
                  </p>
                </div>
              </div>

              {/* Selector Jenis Kelamin */}
              <div className="flex items-center bg-gray-100/90 p-1 rounded-xl shrink-0 gap-1 border border-gray-200/50">
                <button
                  onClick={() => setTableJk("L")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-2 ${
                    tableJk === "L"
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                      : "text-saas-muted hover:text-saas-dark hover:bg-gray-200/50"
                  }`}
                >
                  <div className="w-5.5 h-5.5 rounded-md bg-white p-1 flex items-center justify-center shadow-xs shrink-0">
                    <img src="/baby.svg" alt="Laki-laki" className="w-4 h-4 object-contain" />
                  </div>
                  Laki-laki
                </button>
                <button
                  onClick={() => setTableJk("P")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-2 ${
                    tableJk === "P"
                      ? "bg-pink-600 text-white shadow-sm shadow-pink-500/25"
                      : "text-saas-muted hover:text-saas-dark hover:bg-gray-200/50"
                  }`}
                >
                  <div className="w-5.5 h-5.5 rounded-md bg-white p-1 flex items-center justify-center shadow-xs shrink-0">
                    <img src="/girl.svg" alt="Perempuan" className="w-4 h-4 object-contain" />
                  </div>
                  Perempuan
                </button>
              </div>
            </div>

            {/* Tab Indeks Standard & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setTableTab("bbu")}
                  className={`px-4 py-2 rounded-input text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    tableTab === "bbu"
                      ? "bg-teal-50 border border-teal-200 text-saas-primary font-black"
                      : "bg-gray-50 border border-gray-100 text-saas-muted hover:bg-gray-100"
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" /> BB / U (Berat Badan / Umur)
                </button>
                <button
                  onClick={() => setTableTab("tbu")}
                  className={`px-4 py-2 rounded-input text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    tableTab === "tbu"
                      ? "bg-teal-50 border border-teal-200 text-saas-primary font-black"
                      : "bg-gray-50 border border-gray-100 text-saas-muted hover:bg-gray-100"
                  }`}
                >
                  <Ruler className="w-3.5 h-3.5" /> PB / U & TB / U (Panjang-Tinggi / Umur)
                </button>
                <button
                  onClick={() => setTableTab("bbtb")}
                  className={`px-4 py-2 rounded-input text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    tableTab === "bbtb"
                      ? "bg-teal-50 border border-teal-200 text-saas-primary font-black"
                      : "bg-gray-50 border border-gray-100 text-saas-muted hover:bg-gray-100"
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" /> BB / PB & BB / TB (Berat / Tinggi)
                </button>
              </div>

              <div className="relative w-full sm:w-48">
                <input
                  type="text"
                  placeholder={tableTab === "bbtb" ? "Cari tinggi (cm)..." : "Cari umur (bulan)..."}
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary"
                />
                <Search className="absolute left-2.5 top-2 text-saas-muted w-3.5 h-3.5" />
              </div>
            </div>

            {/* Keterangan Kategori Kemenkes */}
            <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-xs space-y-1.5">
              <p className="font-extrabold text-blue-900 flex items-center gap-1.5">
                <InfoIcon className="w-4 h-4 text-blue-600 shrink-0" />
                Penjelasan Kategori Permenkes No. 2 Tahun 2020 untuk {tableTab.toUpperCase()}:
              </p>
              {tableTab === "bbu" && (
                <p className="text-blue-800 text-[11px] font-semibold leading-relaxed pl-5">
                  • <strong>&lt; -3 SD</strong>: Berat Badan Sangat Kurang | <strong>-3 SD s.d. &lt; -2 SD</strong>: Berat Badan Kurang | <strong>-2 SD s.d. +1 SD</strong>: Berat Badan Normal | <strong>&gt; +1 SD</strong>: Risiko Berat Badan Lebih
                </p>
              )}
              {tableTab === "tbu" && (
                <p className="text-blue-800 text-[11px] font-semibold leading-relaxed pl-5">
                  • <strong>&lt; -3 SD</strong>: Sangat Pendek (Severely Stunted) | <strong>-3 SD s.d. &lt; -2 SD</strong>: Pendek (Stunted) | <strong>-2 SD s.d. +2 SD</strong>: Normal | <strong>&gt; +2 SD</strong>: Tinggi
                </p>
              )}
              {tableTab === "bbtb" && (
                <p className="text-blue-800 text-[11px] font-semibold leading-relaxed pl-5">
                  • <strong>&lt; -3 SD</strong>: Gizi Buruk (Sangat Kurus) | <strong>-3 SD s.d. &lt; -2 SD</strong>: Gizi Kurang (Kurus) | <strong>-2 SD s.d. +1 SD</strong>: Gizi Baik (Normal) | <strong>&gt; +1 SD</strong>: Gizi Lebih / Obesitas
                </p>
              )}
            </div>

            {/* Tabel Data Standar Antropometri */}
            <div className="overflow-x-auto border border-gray-200 rounded-xl max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 text-saas-dark font-extrabold sticky top-0 border-b border-gray-200 z-10">
                  <tr>
                    <th className="py-2.5 px-4 bg-gray-100">{tableTab === "bbtb" ? "Panjang / Tinggi" : "Umur Balita"}</th>
                    <th className="py-2.5 px-3 text-red-700 bg-red-50/50">-3 SD</th>
                    <th className="py-2.5 px-3 text-orange-700 bg-orange-50/50">-2 SD</th>
                    <th className="py-2.5 px-3 text-yellow-700 bg-yellow-50/50">-1 SD</th>
                    <th className="py-2.5 px-3 text-teal-800 bg-teal-100/60 font-black">Median (0)</th>
                    <th className="py-2.5 px-3 text-emerald-700 bg-emerald-50/50">+1 SD</th>
                    <th className="py-2.5 px-3 text-blue-700 bg-blue-50/50">+2 SD</th>
                    <th className="py-2.5 px-3 text-purple-700 bg-purple-50/50">+3 SD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-semibold text-saas-dark">
                  {tableRows.length > 0 ? (
                    tableRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-teal-50/30 transition-colors">
                        <td className="py-2 px-4 font-bold bg-gray-50/50">{row.label}</td>
                        <td className="py-2 px-3 text-red-600 bg-red-50/20">{row.sds[0]}</td>
                        <td className="py-2 px-3 text-orange-600 bg-orange-50/20">{row.sds[1]}</td>
                        <td className="py-2 px-3 text-yellow-700 bg-yellow-50/20">{row.sds[2]}</td>
                        <td className="py-2 px-3 font-extrabold text-teal-900 bg-teal-50/60">{row.sds[3]}</td>
                        <td className="py-2 px-3 text-emerald-700 bg-emerald-50/20">{row.sds[4]}</td>
                        <td className="py-2 px-3 text-blue-700 bg-blue-50/20">{row.sds[5]}</td>
                        <td className="py-2 px-3 text-purple-700 bg-purple-50/20">{row.sds[6]}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-saas-muted font-medium">
                        Tidak ada data yang cocok dengan pencarian "{tableSearch}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-saas-muted text-right italic font-medium">
              * Satuan BB dalam Kilogram (kg), PB/TB dalam Sentimeter (cm). Sumber: Lampiran Permenkes RI No. 2 Tahun 2020.
            </p>
          </div>

          {/* Alur Kerja Hari-H Pelayanan Posyandu */}
          <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ListTodo className="w-4.5 h-4.5 text-saas-primary" />
              <h3 className="font-extrabold text-sm text-saas-dark">Urutan Kegiatan Pelayanan Posyandu (Hari-H)</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-semibold leading-normal pt-2">
              {[
                { step: "1", title: "Buka Laptop / Tablet", desc: "Buka website PosyanduKita di meja pendaftaran." },
                { step: "2", title: "Cari Nama / Daftar Baru", desc: "Cari nama warga yang datang. Jika warga baru, daftarkan dahulu." },
                { step: "3", title: "Input di Menu Pelayanan", desc: "Pilih nama warga lalu ketik hasil timbangan (BB/TB) bulan ini." },
                { step: "4", title: "Selesai", desc: "Klik Simpan. Data otomatis terekam dan aman di database." },
              ].map((s) => (
                <div key={s.step} className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1 relative">
                  <div className="absolute top-2 right-3 text-[10px] font-black text-saas-primary bg-saas-primary/10 w-5 h-5 rounded-full flex items-center justify-center">
                    {s.step}
                  </div>
                  <p className="font-extrabold text-saas-dark pr-6">{s.title}</p>
                  <p className="text-[11px] text-saas-muted leading-relaxed font-semibold mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Kamus Istilah Sederhana & Kontak */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Kamus Istilah */}
            <div className="lg:col-span-2 bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <InfoIcon className="w-4.5 h-4.5 text-saas-primary" />
                <h3 className="font-extrabold text-sm text-saas-dark">Kamus Istilah Posyandu (Penjelasan Sederhana)</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {glossary.map((g, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
                    <p className="font-extrabold text-saas-dark text-[11px]">{g.istilah}</p>
                    <p className="text-[10px] text-saas-muted leading-normal font-semibold">{g.arti}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Kontak Dukungan */}
            <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4.5 h-4.5 text-saas-primary" />
                <h3 className="font-extrabold text-sm text-saas-dark">Kontak Dukungan Rujukan</h3>
              </div>
              <p className="text-[10px] text-saas-muted font-medium leading-normal">
                Bila ada kendala darurat medis pada balita/lansia saat pemeriksaan, hubungi bidan desa:
              </p>
              
              <div className="space-y-3 pt-1">
                <div className="p-3 bg-teal-50/40 border border-teal-100/35 rounded-xl space-y-0.5">
                  <p className="text-[9px] text-saas-primary font-bold uppercase tracking-wider">Bidan Desa Karanggayam</p>
                  <p className="text-xs font-black text-saas-dark">Bidan Sri Utami, A.Md.Keb</p>
                  <p className="text-xs text-saas-primary font-bold hover:underline cursor-pointer pt-1">
                    📞 +62 812-3456-7890 (WA)
                  </p>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-0.5">
                  <p className="text-[9px] text-saas-muted font-bold uppercase tracking-wider">Hotline Puskesmas</p>
                  <p className="text-xs font-black text-saas-dark">Hotline Karanggayam</p>
                  <p className="text-xs text-saas-primary font-bold hover:underline cursor-pointer pt-1">
                    📞 (0287) 123-456
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
