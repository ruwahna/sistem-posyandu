"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Save,
  UserCheck2,
  ALargeSmall,
  Minus,
  Plus,
  CheckCircle2,
  User,
  Lock,
  Bell,
  Palette,
  Shield,
  ChevronRight,
  Eye,
  EyeOff,
  BellRing,
  BellOff,
  Database,
  Download,
  Sun,
  Moon,
  Monitor,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useFontSize, FontSizeLevel } from "../../contexts/FontSizeContext";
import { useAuth } from "../../contexts/AuthContext";
import PageHelmet from "../../components/PageHelmet";
import { authApi, posyanduApi } from "../../lib/api";

// ─── Types ────────────────────────────────────────────────
type SettingSection =
  | "profil"
  | "akun"
  | "tampilan"
  | "notifikasi"
  | "data";

interface NavItem {
  id: SettingSection;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

// ─── Font size config ─────────────────────────────────────
const fontSizeLevels: {
  level: FontSizeLevel;
  label: string;
  description: string;
}[] = [
  { level: "kecil", label: "Kecil", description: "Tampilan lebih padat" },
  { level: "normal", label: "Normal", description: "Ukuran standar" },
  { level: "besar", label: "Besar", description: "Lebih mudah dibaca" },
  { level: "sangat-besar", label: "Sangat Besar", description: "Untuk penglihatan kurang jelas" },
];

// ─── Sidebar nav items ────────────────────────────────────
const navItems: NavItem[] = [
  {
    id: "profil",
    label: "Profil Posyandu",
    description: "Nama, lokasi & alamat",
    icon: Building2,
    color: "text-teal-600",
    bgColor: "bg-teal-500/10",
  },
  {
    id: "akun",
    label: "Akun & Keamanan",
    description: "Password & profil kader",
    icon: Lock,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "tampilan",
    label: "Tampilan",
    description: "Ukuran teks & tema",
    icon: Palette,
    color: "text-violet-600",
    bgColor: "bg-violet-500/10",
  },
  {
    id: "notifikasi",
    label: "Notifikasi",
    description: "Pengingat jadwal & imunisasi",
    icon: Bell,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "data",
    label: "Data & Privasi",
    description: "Backup & ekspor data",
    icon: Database,
    color: "text-rose-600",
    bgColor: "bg-rose-500/10",
  },
];

// ═══════════════════════════════════════════════════════════
// SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════

// ─── Profil Posyandu ──────────────────────────────────────
function ProfilSection() {
  const { user, posyanduId, updateUser } = useAuth();
  const [posyanduNama, setPosyanduNama] = useState(user?.posyandu?.nama || "");
  const [posyanduDesa, setPosyanduDesa] = useState("");
  const [posyanduKecamatan, setPosyanduKecamatan] = useState("");
  const [posyanduAlamat, setPosyanduAlamat] = useState("");
  const [savingPosyandu, setSavingPosyandu] = useState(false);
  const [posyanduNotice, setPosyanduNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!posyanduId) return;
    posyanduApi
      .getById(posyanduId)
      .then((res) => {
        if (res.success && res.data) {
          setPosyanduNama(res.data.nama);
          setPosyanduDesa(res.data.desa || "");
          setPosyanduKecamatan(res.data.kecamatan || "");
          setPosyanduAlamat(res.data.alamat || "");
        }
      })
      .catch((err) => console.error("Gagal mengambil data posyandu:", err));
  }, [posyanduId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosyanduNotice(null);
    if (!posyanduId) return;

    if (!posyanduNama.trim() || !posyanduDesa.trim() || !posyanduKecamatan.trim()) {
      setPosyanduNotice({ type: "error", message: "Nama Posyandu, Desa, dan Kecamatan wajib diisi." });
      return;
    }

    try {
      setSavingPosyandu(true);
      const res = await posyanduApi.update(posyanduId, {
        nama: posyanduNama.trim(),
        desa: posyanduDesa.trim(),
        kecamatan: posyanduKecamatan.trim(),
        alamat: posyanduAlamat.trim(),
      });

      if (res.success && res.data) {
        updateUser({ posyandu: { id: posyanduId, nama: res.data.nama } });
        setPosyanduNotice({ type: "success", message: "Informasi Posyandu berhasil disimpan!" });
      }
    } catch (err: any) {
      setPosyanduNotice({ type: "error", message: err.message || "Gagal menyimpan data posyandu." });
    } finally {
      setSavingPosyandu(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Building2}
        iconColor="text-teal-600"
        iconBg="bg-teal-500/10"
        title="Profil Posyandu"
        subtitle="Kelola informasi dan lokasi administratif posyandu Anda."
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <form onSubmit={handleSave} className="space-y-5">
          {posyanduNotice && (
            <div
              className={`p-3 rounded-xl text-sm font-semibold flex items-center gap-2 border ${
                posyanduNotice.type === "success"
                  ? "bg-green-50 text-green-700 border-green-100"
                  : "bg-red-50 text-red-700 border-red-100"
              }`}
            >
              {posyanduNotice.type === "success" ? (
                <UserCheck2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              {posyanduNotice.message}
            </div>
          )}

          <FormField label="Nama Posyandu">
            <input
              type="text"
              value={posyanduNama}
              onChange={(e) => setPosyanduNama(e.target.value)}
              disabled={user?.role !== "OWNER"}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-teal-400 focus:bg-white disabled:opacity-60 transition-all"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Desa / Kelurahan">
              <input
                type="text"
                value={posyanduDesa}
                onChange={(e) => setPosyanduDesa(e.target.value)}
                disabled={user?.role !== "OWNER"}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-teal-400 focus:bg-white disabled:opacity-60 transition-all"
              />
            </FormField>
            <FormField label="Kecamatan">
              <input
                type="text"
                value={posyanduKecamatan}
                onChange={(e) => setPosyanduKecamatan(e.target.value)}
                disabled={user?.role !== "OWNER"}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-teal-400 focus:bg-white disabled:opacity-60 transition-all"
              />
            </FormField>
          </div>

          <FormField label="Alamat Jalan / RT / RW">
            <textarea
              rows={3}
              value={posyanduAlamat}
              onChange={(e) => setPosyanduAlamat(e.target.value)}
              disabled={user?.role !== "OWNER"}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-teal-400 focus:bg-white disabled:opacity-60 transition-all resize-none"
            />
          </FormField>

          {user?.role === "OWNER" && (
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={savingPosyandu}
                className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-bold rounded-xl shadow-md shadow-teal-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {savingPosyandu ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      <div className="bg-teal-50/60 border border-teal-100 rounded-xl p-4 flex gap-3">
        <Shield className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-teal-800">Data Terverifikasi</p>
          <p className="text-xs text-teal-600 mt-0.5 leading-relaxed">
            Informasi posyandu Anda sudah terdaftar dan aktif di sistem. Perubahan akan langsung berlaku setelah disimpan.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Akun & Keamanan ──────────────────────────────────────
function AkunSection() {
  const { user, updateUser } = useAuth();
  const [namaKader, setNamaKader] = useState(user?.nama || "");
  const [emailKader, setEmailKader] = useState(user?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (user) {
      setNamaKader(user.nama);
      setEmailKader(user.email);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileNotice(null);

    if (!namaKader.trim() || !emailKader.trim()) {
      setProfileNotice({ type: "error", message: "Nama dan Email wajib diisi." });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setProfileNotice({ type: "error", message: "Kata sandi baru minimal 6 karakter." });
      return;
    }

    try {
      setSavingProfile(true);
      const res = await authApi.updateProfile({
        nama: namaKader.trim(),
        email: emailKader.trim(),
        ...(newPassword.trim() ? { password: newPassword.trim() } : {}),
      });

      if (res.success && res.data) {
        updateUser({
          nama: res.data.nama,
          email: res.data.email,
        });
        setNewPassword("");
        setProfileNotice({ type: "success", message: "Profil dan akun berhasil diperbarui!" });
      }
    } catch (err: any) {
      setProfileNotice({ type: "error", message: err.message || "Gagal memperbarui profil." });
    } finally {
      setSavingProfile(false);
    }
  };

  const initials = namaKader
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={User}
        iconColor="text-blue-600"
        iconBg="bg-blue-500/10"
        title="Akun & Keamanan"
        subtitle="Kelola profil pribadi dan keamanan kata sandi akun Anda."
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h3 className="text-sm font-bold text-saas-dark flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" /> Profil Kader
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {profileNotice && (
            <div
              className={`p-3 rounded-xl text-sm font-semibold flex items-center gap-2 border ${
                profileNotice.type === "success"
                  ? "bg-green-50 text-green-700 border-green-100"
                  : "bg-red-50 text-red-700 border-red-100"
              }`}
            >
              {profileNotice.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              {profileNotice.message}
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center font-bold text-blue-600 text-xl border-2 border-blue-100 shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-sm font-bold text-saas-dark">{user?.nama}</p>
              <p className="text-xs text-saas-muted">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-100">
                {user?.role === "OWNER" ? "Pengelola (Owner)" : "Kader"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nama Lengkap">
              <input
                type="text"
                value={namaKader}
                onChange={(e) => setNamaKader(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
                required
              />
            </FormField>

            <FormField label="Alamat Email">
              <input
                type="email"
                value={emailKader}
                onChange={(e) => setEmailKader(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
                required
              />
            </FormField>
          </div>

          <FormField label="Kata Sandi Baru (Opsional)">
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Biarkan kosong jika tidak ingin mengganti kata sandi"
                className="w-full p-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-3.5 text-saas-muted hover:text-saas-dark"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </FormField>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {savingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Simpan Profil
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Tampilan ─────────────────────────────────────────────
function TampilanSection() {
  const { fontSizeLevel, setFontSizeLevel, increaseFontSize, decreaseFontSize } = useFontSize();
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [fontSaveBanner, setFontSaveBanner] = useState(false);

  const handleFontChange = (level: FontSizeLevel) => {
    setFontSizeLevel(level);
    setFontSaveBanner(true);
    setTimeout(() => setFontSaveBanner(false), 2500);
  };

  const currentIndex = fontSizeLevels.findIndex((f) => f.level === fontSizeLevel);

  const themes = [
    { id: "light" as const, label: "Terang", icon: Sun },
    { id: "dark" as const, label: "Gelap", icon: Moon },
    { id: "system" as const, label: "Sistem", icon: Monitor },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Palette}
        iconColor="text-violet-600"
        iconBg="bg-violet-500/10"
        title="Tampilan"
        subtitle="Sesuaikan tampilan aplikasi agar lebih nyaman digunakan."
      />

      {/* Ukuran Teks */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h3 className="text-sm font-bold text-saas-dark flex items-center gap-2">
          <ALargeSmall className="w-4 h-4 text-violet-500" /> Ukuran Teks
        </h3>

        {fontSaveBanner && (
          <div className="p-3 bg-violet-50 text-violet-700 border border-violet-100 rounded-xl text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Ukuran teks diubah ke &quot;{fontSizeLevels.find(f => f.level === fontSizeLevel)?.label}&quot;
          </div>
        )}

        {/* Preview */}
        <div className="p-4 bg-gradient-to-br from-violet-50/60 to-indigo-50/40 border border-violet-100/60 rounded-xl">
          <p className="text-[10px] text-violet-500 font-bold mb-2 uppercase tracking-widest">Pratinjau Teks</p>
          <p
            className="font-bold text-saas-dark transition-all duration-300"
            style={{ fontSize: fontSizeLevel === "kecil" ? "0.875em" : fontSizeLevel === "normal" ? "1em" : fontSizeLevel === "besar" ? "1.125em" : "1.375em" }}
          >
            Data Posyandu Kita
          </p>
          <p
            className="text-saas-muted mt-1 transition-all duration-300"
            style={{ fontSize: fontSizeLevel === "kecil" ? "0.75em" : fontSizeLevel === "normal" ? "0.875em" : fontSizeLevel === "besar" ? "1em" : "1.125em" }}
          >
            Kader dapat melihat informasi warga dengan jelas.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={decreaseFontSize}
            disabled={currentIndex === 0}
            aria-label="Perkecil teks"
            className="w-10 h-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="flex-1 flex gap-2">
            {fontSizeLevels.map((item, idx) => {
              const isActive = fontSizeLevel === item.level;
              return (
                <button
                  key={item.level}
                  onClick={() => handleFontChange(item.level)}
                  title={item.description}
                  className={`flex-1 py-2.5 rounded-xl border font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20"
                      : "bg-white text-saas-muted border-gray-200 hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50/50"
                  }`}
                  style={{ fontSize: `${0.62 + idx * 0.09}rem` }}
                >
                  A
                </button>
              );
            })}
          </div>

          <button
            onClick={increaseFontSize}
            disabled={currentIndex === fontSizeLevels.length - 1}
            aria-label="Perbesar teks"
            className="w-10 h-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 px-[3.25rem]">
          {fontSizeLevels.map((item) => (
            <div key={item.level} className="flex-1 text-center">
              <p className={`text-[10px] font-bold transition-colors ${fontSizeLevel === item.level ? "text-violet-600" : "text-saas-muted"}`}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tema Mode */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="text-sm font-bold text-saas-dark flex items-center gap-2">
          <Palette className="w-4 h-4 text-violet-500" /> Mode Tema
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {themes.map(({ id, label, icon: Icon }) => {
            const isActive = theme === id;
            return (
              <button
                key={id}
                onClick={() => setTheme(id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border font-bold text-xs transition-all ${
                  isActive
                    ? "border-violet-600 bg-violet-50/50 text-violet-700 shadow-sm"
                    : "border-gray-200 text-saas-muted hover:border-gray-300"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Notifikasi ───────────────────────────────────────────
function NotifikasiSection() {
  const [notifs, setNotifs] = useState({
    jadwalPosyandu: true,
    imunisasiBalita: true,
    resikoKesehatan: true,
    laporanBulanan: false,
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key: keyof typeof notifs) => {
    setNotifs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const items = [
    { key: "jadwalPosyandu" as const, label: "Pengingat Jadwal Posyandu", desc: "Notifikasi otomatis menjelang hari buka posyandu" },
    { key: "imunisasiBalita" as const, label: "Peringatan Imunisasi Balita", desc: "Notifikasi balita yang belum lengkap imunisasinya" },
    { key: "resikoKesehatan" as const, label: "Peringatan Gizi & Hipertensi", desc: "Notifikasi lansia/balita berisiko tinggi" },
    { key: "laporanBulanan" as const, label: "Pengingat Laporan Bulanan", desc: "Notifikasi untuk melengkapi laporan akhir bulan" },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Bell}
        iconColor="text-amber-600"
        iconBg="bg-amber-500/10"
        title="Notifikasi & Pengingat"
        subtitle="Aktifkan pengingat penting agar tidak ada jadwal atau laporan yang terlewat."
      />

      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
        {items.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between p-5 gap-4">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${notifs[key] ? "bg-amber-500/10" : "bg-gray-100"}`}>
                {notifs[key]
                  ? <BellRing className="w-4 h-4 text-amber-600" />
                  : <BellOff className="w-4 h-4 text-saas-muted" />
                }
              </div>
              <div>
                <p className={`text-sm font-bold ${notifs[key] ? "text-saas-dark" : "text-saas-muted"}`}>{label}</p>
                <p className="text-xs text-saas-muted mt-0.5">{desc}</p>
              </div>
            </div>
            <button
              onClick={() => toggle(key)}
              aria-label={`Toggle ${label}`}
              className={`relative w-12 h-6 rounded-full transition-all duration-300 shrink-0 ${notifs[key] ? "bg-amber-500" : "bg-gray-200"}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${notifs[key] ? "left-7" : "left-1"}`} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saved ? "Tersimpan!" : "Simpan Pengaturan"}
        </button>
      </div>
    </div>
  );
}

// ─── Data & Privasi ───────────────────────────────────────
function DataSection() {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => setExporting(false), 2000);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Database}
        iconColor="text-rose-600"
        iconBg="bg-rose-500/10"
        title="Data & Privasi"
        subtitle="Kelola backup, ekspor data posyandu, dan keamanan informasi."
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="text-sm font-bold text-saas-dark flex items-center gap-2">
          <Download className="w-4 h-4 text-rose-500" /> Ekspor & Backup Data
        </h3>
        <p className="text-sm text-saas-muted">
          Unduh seluruh data posyandu dalam format Excel untuk keperluan pelaporan ke Puskesmas atau backup mandiri.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Data Balita", desc: "Seluruh catatan tumbuh kembang balita", color: "text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100" },
            { label: "Data Lansia", desc: "Rekam kesehatan seluruh warga lansia", color: "text-teal-600 bg-teal-50 border-teal-100 hover:bg-teal-100" },
            { label: "Laporan Bulanan", desc: "Rekap pelayanan posyandu per bulan", color: "text-violet-600 bg-violet-50 border-violet-100 hover:bg-violet-100" },
            { label: "Semua Data", desc: "Export lengkap seluruh data posyandu", color: "text-rose-600 bg-rose-50 border-rose-100 hover:bg-rose-100" },
          ].map(({ label, desc, color }) => (
            <button
              key={label}
              onClick={handleExport}
              className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${color}`}
            >
              <Download className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold">{label}</p>
                <p className="text-xs opacity-80 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
        {exporting && (
          <p className="text-xs text-saas-muted text-center animate-pulse">⏳ Sedang mempersiapkan file ekspor...</p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="text-sm font-bold text-saas-dark flex items-center gap-2">
          <Shield className="w-4 h-4 text-rose-500" /> Log Aktivitas Terakhir
        </h3>
        <div className="space-y-2">
          {[
            { action: "Login berhasil", user: "Kader Posyandu", time: "Hari ini, 08:24", dot: "bg-green-400" },
            { action: "Tambah data balita baru", user: "Kader Posyandu", time: "Kemarin, 14:05", dot: "bg-blue-400" },
            { action: "Edit laporan bulanan", user: "Kader Posyandu", time: "3 hari lalu, 09:10", dot: "bg-violet-400" },
            { action: "Ubah pengaturan posyandu", user: "Pengelola Posyandu", time: "5 hari lalu, 11:30", dot: "bg-amber-400" },
          ].map((log, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className={`w-2 h-2 rounded-full shrink-0 ${log.dot}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-saas-dark truncate">{log.action}</p>
                <p className="text-xs text-saas-muted">{log.user} · {log.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-red-700 flex items-center gap-2">
          ⚠️ Zona Berbahaya
        </h3>
        <p className="text-xs text-red-600 leading-relaxed">
          Tindakan di bawah ini bersifat permanen dan tidak dapat dibatalkan. Pastikan Anda sudah melakukan backup data sebelum melanjutkan.
        </p>
        <button
          disabled
          className="px-4 py-2.5 border border-red-200 text-red-500 text-sm font-bold rounded-xl hover:bg-red-100 transition-all flex items-center gap-2 opacity-50 cursor-not-allowed"
        >
          Reset Semua Data Posyandu
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SHARED HELPERS
// ═══════════════════════════════════════════════════════════
function SectionHeader({
  icon: Icon, iconColor, iconBg, title, subtitle,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 pb-1">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-saas-dark">{title}</h2>
        <p className="text-xs text-saas-muted mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-saas-muted">{label}</label>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN MODULE
// ═══════════════════════════════════════════════════════════
export default function PengaturanModule() {
  const [activeSection, setActiveSection] = useState<SettingSection>("profil");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case "profil": return <ProfilSection />;
      case "akun": return <AkunSection />;
      case "tampilan": return <TampilanSection />;
      case "notifikasi": return <NotifikasiSection />;
      case "data": return <DataSection />;
    }
  };

  const activeNav = navItems.find(n => n.id === activeSection)!;

  return (
    <div className="space-y-4">
      <PageHelmet
        title="Pengaturan Sistem"
        description="Konfigurasi akun profil kader, ubah kata sandi, dan preferensi tampilan."
      />
      <div>
        <h2 className="text-2xl font-bold text-saas-dark tracking-tight">Pengaturan</h2>
        <p className="text-sm text-saas-muted mt-0.5">Kelola preferensi, profil, dan konfigurasi sistem posyandu Anda.</p>
      </div>

      <button
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        className="flex md:hidden w-full items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm"
      >
        <div className={`w-9 h-9 rounded-xl ${activeNav.bgColor} flex items-center justify-center`}>
          <activeNav.icon className={`w-4 h-4 ${activeNav.color}`} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold text-saas-dark">{activeNav.label}</p>
          <p className="text-xs text-saas-muted">{activeNav.description}</p>
        </div>
        <ChevronRight className={`w-4 h-4 text-saas-muted transition-transform ${mobileSidebarOpen ? "rotate-90" : ""}`} />
      </button>

      {mobileSidebarOpen && (
        <div className="md:hidden bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all ${
                  isActive ? "bg-gray-50" : "hover:bg-gray-50/60"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl ${item.bgColor} flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <p className={`text-sm font-bold ${isActive ? "text-saas-dark" : "text-saas-muted"}`}>{item.label}</p>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-saas-primary" />}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex gap-6 items-start">
        <aside className="hidden md:flex w-60 shrink-0 flex-col bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden sticky top-6">
          {navItems.map((item, idx) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-4 transition-all relative ${
                  isActive
                    ? "bg-gray-50"
                    : "hover:bg-gray-50/60"
                } ${idx !== navItems.length - 1 ? "border-b border-gray-50" : ""}`}
              >
                {isActive && (
                  <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-saas-primary" />
                )}
                <div className={`w-9 h-9 rounded-xl ${item.bgColor} flex items-center justify-center shrink-0`}>
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className={`text-sm font-bold leading-none ${isActive ? "text-saas-dark" : "text-saas-muted"}`}>
                    {item.label}
                  </p>
                  <p className="text-[11px] text-saas-muted mt-1 truncate">{item.description}</p>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 transition-colors shrink-0 ${isActive ? "text-saas-primary" : "text-gray-200"}`} />
              </button>
            );
          })}
        </aside>

        <div className="flex-1 min-w-0">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
