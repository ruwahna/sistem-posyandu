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
  MessageSquareCode,
  FileText
} from "lucide-react";

interface FAQItem {
  id: string;
  category: "kader" | "owner";
  question: string;
  answer: React.ReactNode;
}

export default function BantuanModule() {
  const [activeTab, setActiveTab] = useState<"kader" | "owner">("kader");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  const faqData: FAQItem[] = [
    // Panduan Kader (Operational)
    {
      id: "k-1",
      category: "kader",
      question: "Bagaimana cara cepat mencatat kunjungan/pemeriksaan warga?",
      answer: (
        <div className="space-y-2">
          <p>Anda dapat menggunakan menu **Pelayanan** di sidebar untuk melakukan pencatatan masal:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Buka halaman **Pelayanan**.</li>
            <li>Cari nama anak/lansia di panel pencarian sebelah kiri.</li>
            <li>Klik nama warga tersebut untuk memunculkan formulir pemeriksaan di sebelah kanan.</li>
            <li>Isi hasil penimbangan, tinggi badan, dll., lalu klik **Simpan Pemeriksaan**.</li>
          </ol>
          <p className="text-saas-primary font-semibold">💡 Tips: Jika warga baru pertama kali datang dan namanya belum ada, klik tombol "+ Balita Baru" atau "+ Lansia Baru" di kanan atas halaman Pelayanan untuk mendaftarkannya terlebih dahulu secara instan.</p>
        </div>
      )
    },
    {
      id: "k-2",
      category: "kader",
      question: "Apa arti warna warning/peringatan kuning yang muncul saat input?",
      answer: (
        <p>Sistem memiliki fitur **validasi manusiawi** untuk mencegah kesalahan salah ketik di lapangan yang bising. Jika Anda menginput berat badan yang tidak wajar untuk usia balita (misal: 30 kg untuk bayi 10 bulan) atau tekanan darah lansia di atas batas aman (lebih dari 200 mmHg), kotak peringatan kuning akan muncul. Harap periksa kembali angka timbangan sebelum menekan tombol Simpan.</p>
      )
    },
    {
      id: "k-3",
      category: "kader",
      question: "Bagaimana cara memahami klasifikasi status gizi WHO untuk balita?",
      answer: (
        <div className="space-y-1">
          <p>Pengukuran gizi balita menggunakan standar WHO:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>BB/U (Berat Badan menurut Umur):</strong> Menentukan status berat kurang (underweight), normal, atau lebih.</li>
            <li><strong>TB/U (Tinggi Badan menurut Umur):</strong> Menentukan status stunting (pendek/sangat pendek) atau normal.</li>
            <li><strong>BB/TB (Berat menurut Tinggi):</strong> Menentukan status kurus (wasting), normal, atau obesitas.</li>
          </ul>
        </div>
      )
    },
    {
      id: "k-4",
      category: "kader",
      question: "Bagaimana cara melihat riwayat rekam medis warga terdahulu?",
      answer: (
        <p>Anda dapat melihat semua log histori di menu **Riwayat** di sidebar. Untuk riwayat detail satu orang warga secara khusus, buka menu **Balita** atau **Lansia**, cari nama yang bersangkutan, lalu klik tombol **Detail Data** untuk masuk ke profil lengkapnya yang memuat riwayat tabel perkembangan dari bulan ke bulan.</p>
      )
    },
    // Panduan Owner (Administrative)
    {
      id: "o-1",
      category: "owner",
      question: "Bagaimana cara menambahkan kader/anggota baru ke Posyandu?",
      answer: (
        <div className="space-y-2">
          <p>Sebagai Owner, Anda memiliki dua cara untuk merekrut kader pelaksana baru:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Cara 1 (Membuat Akun Langsung):</strong> Buka menu **Manajemen Akun**, klik **Buat Akun Kader Baru**, isi data lengkap beserta kata sandi awal, lalu klik Simpan. Akun kader tersebut langsung aktif dan bisa digunakan login.</li>
            <li><strong>Cara 2 (Kode Undangan):</strong> Salin **Kode Undangan Mandiri** yang tertera di menu Manajemen Akun, lalu bagikan kode tersebut (misal via WhatsApp) ke kader baru agar mereka dapat menginputnya sendiri saat mendaftar akun.</li>
          </ul>
        </div>
      )
    },
    {
      id: "o-2",
      category: "owner",
      question: "Apa perbedaan peran antara Kader Owner dan Kader Anggota?",
      answer: (
        <div className="space-y-2">
          <p>Sistem membedakan hak akses demi keamanan data posyandu:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Kader Owner (Pemilik):</strong> Memiliki akses penuh termasuk mengedit profil posyandu, mengundang kader baru, mengubah peran, menonaktifkan akun kader lain, dan melakukan penghapusan data medis.</li>
            <li><strong>Kader Anggota:</strong> Memiliki akses operasional seperti menginput data balita/lansia, mencatat kunjungan bulanan, membaca dashboard, dan mencetak laporan. Anggota tidak bisa mengakses menu Manajemen Akun dan Pengaturan Posyandu.</li>
          </ul>
        </div>
      )
    },
    {
      id: "o-3",
      category: "owner",
      question: "Apakah posyandu lain dapat melihat atau mengubah data posyandu saya?",
      answer: (
        <p><strong>Tidak bisa.</strong> Sistem posyandu kita menerapkan isolasi data multi-tenant (keamanan tingkat tinggi). Data posyandu diisolasi secara ketat berdasarkan kode registrasi posyandu masing-masing. Kader dari Posyandu A sama sekali tidak memiliki akses teknis maupun visual ke data Posyandu B.</p>
      )
    },
    {
      id: "o-4",
      category: "owner",
      question: "Bagaimana cara mengubah profil dan alamat posyandu?",
      answer: (
        <p>Buka menu **Pengaturan** di sidebar kiri. Di sana Anda dapat memperbarui Nama Posyandu, Kelurahan/Desa, Kecamatan, serta detail Alamat Jalan/RT/RW. Klik **Simpan Perubahan** untuk memperbarui identitas posyandu Anda di database.</p>
      )
    }
  ];

  // Filtering FAQs based on tab and query
  const filteredFaqs = faqData.filter((faq) => {
    const matchesTab = faq.category === activeTab;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.question.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-saas-dark tracking-tight">Pusat Bantuan & Panduan</h2>
        <p className="text-sm text-saas-muted mt-0.5">Temukan solusi panduan penggunaan sistem informasi PosyanduKita.</p>
      </div>

      {/* Grid Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Tab FAQ & Accordion (Width 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-6">
            
            {/* Search Bar FAQ */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari pertanyaan bantuan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50 focus:bg-white transition-all"
              />
              <Search className="absolute left-4 top-3.5 text-saas-muted w-4.5 h-4.5" />
            </div>

            {/* Tabs Filter */}
            <div className="flex gap-2 border-b border-gray-100 pb-3">
              <button
                onClick={() => {
                  setActiveTab("kader");
                  setExpandedFaqId(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "kader"
                    ? "bg-saas-primary text-white shadow-md shadow-teal-500/10"
                    : "text-saas-muted hover:text-saas-dark hover:bg-gray-50"
                }`}
              >
                <BookOpen className="w-4 h-4" /> Panduan Kader (Operasional)
              </button>
              <button
                onClick={() => {
                  setActiveTab("owner");
                  setExpandedFaqId(null);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "owner"
                    ? "bg-saas-primary text-white shadow-md shadow-teal-500/10"
                    : "text-saas-muted hover:text-saas-dark hover:bg-gray-50"
                }`}
              >
                <Building2 className="w-4 h-4" /> Panduan Owner (Administrasi)
              </button>
            </div>

            {/* Accordion FAQ list */}
            <div className="space-y-3">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => {
                  const isExpanded = expandedFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className={`border rounded-xl transition-all ${
                        isExpanded ? "border-saas-primary bg-saas-primary/5" : "border-gray-100 hover:border-gray-250"
                      }`}
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-center justify-between p-4 text-left font-bold text-xs text-saas-dark"
                      >
                        <span>{faq.question}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-saas-primary shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-saas-muted shrink-0" />
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 text-xs text-saas-muted leading-relaxed font-semibold border-t border-gray-100/50">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-xs text-saas-muted font-semibold">
                  Tidak menemukan pertanyaan bantuan yang cocok.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Kontak Dukungan & Panduan Cepat (Width 1/3) */}
        <div className="space-y-6">
          {/* Dukungan Kontak */}
          <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4.5 h-4.5 text-saas-primary" />
              <h3 className="font-extrabold text-sm text-saas-dark">Kontak Medis & Dukungan</h3>
            </div>
            
            <p className="text-[11px] text-saas-muted leading-normal">
              Hubungi bidan desa atau puskesmas setempat jika menemukan indikasi warga berisiko tinggi saat penimbangan.
            </p>

            <div className="space-y-3 pt-3 border-t border-gray-50">
              {/* Kontak 1 */}
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
                <p className="text-[10px] text-saas-muted font-bold uppercase">Bidan Desa Sri Lestari</p>
                <p className="text-xs font-bold text-saas-dark">Bidan Sri Utami, A.Md.Keb</p>
                <p className="text-xs text-saas-primary font-bold hover:underline cursor-pointer mt-0.5">
                  📞 +62 812-3456-7890 (WA)
                </p>
              </div>

              {/* Kontak 2 */}
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
                <p className="text-[10px] text-saas-muted font-bold uppercase">Puskesmas Kecamatan</p>
                <p className="text-xs font-bold text-saas-dark">Hotline Rujukan Karanggayam</p>
                <p className="text-xs text-saas-primary font-bold hover:underline cursor-pointer mt-0.5">
                  📞 (0287) 123-456
                </p>
              </div>

              {/* Kontak 3 */}
              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
                <p className="text-[10px] text-saas-muted font-bold uppercase">Dukungan Sistem PosyanduKita</p>
                <p className="text-xs font-bold text-saas-dark">Tim IT Developer</p>
                <p className="text-xs text-saas-primary font-bold hover:underline cursor-pointer mt-0.5">
                  📧 support@posyandukita.id
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats / Info Kesehatan */}
          <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5 text-saas-primary" />
              <h3 className="font-extrabold text-sm text-saas-dark">Indikator Darurat Medis</h3>
            </div>

            <div className="space-y-3 pt-2 text-[11px] text-saas-muted leading-relaxed font-semibold">
              <div className="flex gap-2">
                <Baby className="w-4.5 h-4.5 text-saas-primary shrink-0" />
                <div>
                  <p className="font-bold text-saas-dark">Gizi Buruk Balita</p>
                  <p>Segera koordinasi dengan Bidan Desa jika grafik WHO balita berada di zona merah (Sangat Kurang/Sangat Pendek).</p>
                </div>
              </div>

              <div className="flex gap-2 border-t border-gray-50 pt-2">
                <Heart className="w-4.5 h-4.5 text-red-500 shrink-0" />
                <div>
                  <p className="font-bold text-saas-dark">Risiko Hipertensi Lansia</p>
                  <p>Lansia dengan tekanan darah sistol &gt; 180 mmHg wajib diistirahatkan sejenak lalu ditensi ulang sebelum rujukan.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
