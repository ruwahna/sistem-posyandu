"use client";

import { useState } from "react";
import {
  HelpCircle,
  Search,
  BookOpen,
  ShieldAlert,
  UserCheck2,
  Users,
  Building2,
  PhoneCall,
  ChevronDown,
  ChevronUp,
  Baby,
  Heart,
  FileText,
  ArrowLeft,
  CheckCircle,
  HelpCircle as InfoIcon,
  AlertTriangle,
  UserX,
  ListTodo
} from "lucide-react";
import PageHelmet from "../../components/PageHelmet";

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

  // Kamus Istilah Sederhana (Glossary)
  const glossary = [
    { istilah: "Stunting (Kerdil)", arti: "Kondisi anak yang terlalu pendek dibanding anak seusianya karena kurang gizi dalam waktu yang sangat lama." },
    { istilah: "Wasting (Kurus)", arti: "Kondisi anak yang berat badannya terlalu kurus dibanding tinggi badannya karena kurang gizi mendadak/sakit." },
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
        { title: "Langkah 1: Masuk Menu Pelayanan", text: "Klik tombol bertuliskan 'Pelayanan' di menu sebelah kiri (ikon kertas catatan)." },
        { title: "Langkah 2: Cari Nama Warga", text: "Ketik nama anak atau lansia pada kolom pencarian di sebelah kiri, lalu klik nama warga tersebut." },
        { title: "Langkah 3: Isi Formulir di Kanan", text: "Formulir input akan muncul di sebelah kanan. Masukkan angka Berat Badan (BB) dan Tinggi Badan (TB) sesuai hasil timbangan fisik." },
        { title: "Langkah 4: Klik Simpan", text: "Periksa kembali angka yang dimasukkan. Jika sudah benar, klik tombol hijau/toska 'Simpan Pemeriksaan'. Data akan langsung terekam.", badge: "Penting" }
      ]
    },
    {
      id: "g2",
      title: "Mendaftarkan Balita Baru",
      category: "kader",
      description: "Cara mendaftarkan anak/bayi yang baru pertama kali datang ke posyandu.",
      icon: Baby,
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
      icon: Heart,
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
    },
    {
      id: "g6",
      title: "Menggunakan Kode Undangan Mandiri",
      category: "owner",
      description: "Cara membagikan kode rahasia posyandu untuk kader mendaftar sendiri.",
      icon: Building2,
      steps: [
        { title: "Langkah 1: Salin Kode Undangan", text: "Masuk ke menu 'Manajemen Akun' di sisi kiri, lihat kotak 'Kode Undangan Mandiri' di sebelah kanan." },
        { title: "Langkah 2: Klik Ikon Salin", text: "Klik tombol salin (ikon kertas ganda) di samping kode (misal: SRILESTARI-KADER-99A8)." },
        { title: "Langkah 3: Bagikan ke Kader Baru", text: "Kirim kode tersebut ke WhatsApp kader baru." },
        { title: "Langkah 4: Kader Baru Mendaftar", text: "Saat kader baru mendaftar di halaman registrasi, mereka cukup memasukkan kode ini agar otomatis terhubung ke posyandu Anda." }
      ]
    }
  ];

  // Filter guides based on search query
  const filteredGuides = guides.filter((g) =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedGuide = guides.find((g) => g.id === activeGuideId);

  return (
    <div className="space-y-8 pb-10">
      <PageHelmet
        title="Pusat Bantuan & Dokumen"
        description="Panduan penggunaan sistem posyandu, FAQ, dan kontak dukungan teknis."
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
