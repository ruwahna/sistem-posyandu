"use client";

import { useState, useEffect } from "react";
import {
  User,
  Building2,
  Save,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Loader2,
  Lock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi, posyanduApi } from "@/lib/api";

export default function PengaturanModule() {
  const { user, posyanduId, updateUser } = useAuth();

  // User Profile Form State
  const [namaKader, setNamaKader] = useState(user?.nama || "");
  const [emailKader, setEmailKader] = useState(user?.email || "");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Posyandu Info Form State
  const [posyanduNama, setPosyanduNama] = useState(user?.posyandu?.nama || "");
  const [posyanduDesa, setPosyanduDesa] = useState("");
  const [posyanduKecamatan, setPosyanduKecamatan] = useState("");
  const [posyanduAlamat, setPosyanduAlamat] = useState("");
  const [savingPosyandu, setSavingPosyandu] = useState(false);
  const [posyanduNotice, setPosyanduNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (user) {
      setNamaKader(user.nama);
      setEmailKader(user.email);
    }
  }, [user]);

  // Load Posyandu Data
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

  // 1. Handle Save User Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileNotice(null);

    if (!namaKader.trim() || !emailKader.trim()) {
      setProfileNotice({ type: "error", message: "Nama dan Email wajib diisi." });
      return;
    }

    if (passwordBaru && passwordBaru.length < 6) {
      setProfileNotice({ type: "error", message: "Kata sandi baru minimal 6 karakter." });
      return;
    }

    try {
      setSavingProfile(true);
      const res = await authApi.updateProfile({
        nama: namaKader.trim(),
        email: emailKader.trim(),
        ...(passwordBaru.trim() ? { password: passwordBaru.trim() } : {}),
      });

      if (res.success && res.data) {
        updateUser({
          nama: res.data.nama,
          email: res.data.email,
        });
        setPasswordBaru("");
        setProfileNotice({ type: "success", message: "Profil Anda berhasil diperbarui!" });
      }
    } catch (err: any) {
      setProfileNotice({
        type: "error",
        message: err.message || "Gagal memperbarui profil.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // 2. Handle Save Posyandu Info
  const handleSavePosyandu = async (e: React.FormEvent) => {
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
        updateUser({
          posyandu: { id: posyanduId, nama: res.data.nama },
        });
        setPosyanduNotice({ type: "success", message: "Informasi Posyandu berhasil diperbarui!" });
      }
    } catch (err: any) {
      setPosyanduNotice({
        type: "error",
        message: err.message || "Gagal memperbarui data posyandu.",
      });
    } finally {
      setSavingPosyandu(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-saas-dark tracking-tight">Pengaturan Sistem</h2>
        <p className="text-sm text-saas-muted mt-0.5">
          Kelola data akun profil Anda dan informasi administratif posyandu.
        </p>
      </div>

      {/* FORM 1: EDIT PROFIL SAYA */}
      <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-saas-primary/10 flex items-center justify-center text-saas-primary">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-saas-dark">Profil Saya</h3>
            <p className="text-xs text-saas-muted mt-0.5">Ubah nama, email, dan kata sandi akun Anda.</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {profileNotice && (
            <div
              className={`p-3 rounded-lg text-xs font-bold flex items-center gap-2 border ${
                profileNotice.type === "success"
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              {profileNotice.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              {profileNotice.message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-dark">Nama Lengkap Kader</label>
              <input
                type="text"
                value={namaKader}
                onChange={(e) => setNamaKader(e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                className="w-full p-2.5 bg-gray-50/80 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary focus:bg-white transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-dark">Alamat Email</label>
              <input
                type="email"
                value={emailKader}
                onChange={(e) => setEmailKader(e.target.value)}
                placeholder="nama@email.com"
                className="w-full p-2.5 bg-gray-50/80 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-saas-muted" />
              <label className="text-xs font-bold text-saas-dark">Kata Sandi Baru (Opsional)</label>
            </div>
            <input
              type="password"
              value={passwordBaru}
              onChange={(e) => setPasswordBaru(e.target.value)}
              placeholder="Biarkan kosong jika tidak ingin mengubah kata sandi"
              className="w-full p-2.5 bg-gray-50/80 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary focus:bg-white transition-all"
            />
            <p className="text-[10px] text-saas-muted">Minimal 6 karakter jika ingin mengganti kata sandi.</p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 bg-saas-primary hover:bg-teal-600 disabled:opacity-50 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-all flex items-center gap-1.5"
            >
              {savingProfile ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Simpan Profil
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* FORM 2: EDIT PROFIL & LOKASI POSYANDU */}
      <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-saas-primary">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-saas-dark">Profil & Lokasi Posyandu</h3>
              <p className="text-xs text-saas-muted mt-0.5">Ubah data administratif posyandu Anda.</p>
            </div>
          </div>
          {user?.role !== "OWNER" && (
            <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
              <Lock className="w-3 h-3" /> Hanya Pengelola
            </span>
          )}
        </div>

        <form onSubmit={handleSavePosyandu} className="space-y-4">
          {posyanduNotice && (
            <div
              className={`p-3 rounded-lg text-xs font-bold flex items-center gap-2 border ${
                posyanduNotice.type === "success"
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              {posyanduNotice.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              {posyanduNotice.message}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-saas-dark">Nama Posyandu</label>
            <input
              type="text"
              value={posyanduNama}
              onChange={(e) => setPosyanduNama(e.target.value)}
              placeholder="Contoh: Posyandu Pelita"
              disabled={user?.role !== "OWNER"}
              className="w-full p-2.5 bg-gray-50/80 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary focus:bg-white disabled:opacity-60 transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-dark">Desa / Kelurahan</label>
              <input
                type="text"
                value={posyanduDesa}
                onChange={(e) => setPosyanduDesa(e.target.value)}
                placeholder="Desa..."
                disabled={user?.role !== "OWNER"}
                className="w-full p-2.5 bg-gray-50/80 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary focus:bg-white disabled:opacity-60 transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-dark">Kecamatan</label>
              <input
                type="text"
                value={posyanduKecamatan}
                onChange={(e) => setPosyanduKecamatan(e.target.value)}
                placeholder="Kecamatan..."
                disabled={user?.role !== "OWNER"}
                className="w-full p-2.5 bg-gray-50/80 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary focus:bg-white disabled:opacity-60 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-saas-dark">Alamat Jalan / RT / RW</label>
            <textarea
              rows={3}
              value={posyanduAlamat}
              onChange={(e) => setPosyanduAlamat(e.target.value)}
              placeholder="Alamat lengkap posyandu..."
              disabled={user?.role !== "OWNER"}
              className="w-full p-2.5 bg-gray-50/80 border border-gray-200 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary focus:bg-white disabled:opacity-60 transition-all"
            />
          </div>

          {user?.role === "OWNER" && (
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingPosyandu}
                className="px-5 py-2.5 bg-saas-primary hover:bg-teal-600 disabled:opacity-50 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-all flex items-center gap-1.5"
              >
                {savingPosyandu ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" /> Simpan Data Posyandu
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
