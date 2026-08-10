"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Copy,
  Check,
  RefreshCw,
  UserCheck2,
  AlertCircle,
  Shield,
  Eye,
  EyeOff,
  UserPlus,
  Trash2,
  Loader2,
  Lock,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { kaderApi, KaderMember } from "../../lib/api";

interface ManajemenAkunModuleProps {
  posyanduId?: string | null;
}

export default function ManajemenAkunModule({ posyanduId: propPosyanduId }: ManajemenAkunModuleProps) {
  const { user, posyanduId: contextPosyanduId } = useAuth();
  const currentPosyanduId = propPosyanduId || contextPosyanduId;
  const isOwner = user?.role === "OWNER";

  // State
  const [kaders, setKaders] = useState<KaderMember[]>([]);
  const [invitationCode, setInvitationCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRegenLoading, setIsRegenLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string>("");

  // Form State
  const [showAddMemberForm, setShowAddMemberForm] = useState<boolean>(false);
  const [newMemberNama, setNewMemberNama] = useState<string>("");
  const [newMemberEmail, setNewMemberEmail] = useState<string>("");
  const [newMemberPassword, setNewMemberPassword] = useState<string>("");
  const [newMemberRole, setNewMemberRole] = useState<"OWNER" | "KADER">("KADER");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [addMemberSuccess, setAddMemberSuccess] = useState<string>("");
  const [addMemberError, setAddMemberError] = useState<string>("");
  const [actionNotice, setActionNotice] = useState<string>("");

  // Fetch Kader List & Invitation Code
  const fetchData = useCallback(async () => {
    if (!currentPosyanduId) return;
    setIsLoading(true);
    setErrorNotice("");
    try {
      const [kaderRes, inviteRes] = await Promise.all([
        kaderApi.getAll(currentPosyanduId),
        kaderApi.getInviteCode(currentPosyanduId),
      ]);

      if (kaderRes.success && kaderRes.data) {
        setKaders(kaderRes.data);
      }
      if (inviteRes.success && inviteRes.data) {
        setInvitationCode(inviteRes.data.invitationCode);
      }
    } catch (err: any) {
      console.error("Error loading kader data:", err);
      setErrorNotice(err.message || "Gagal memuat data kader dari server.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPosyanduId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Copy invitation code
  const handleCopyCode = () => {
    if (!invitationCode) return;
    navigator.clipboard.writeText(invitationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Regenerate invitation code
  const handleRegenCode = async () => {
    if (!currentPosyanduId || !isOwner) return;
    setIsRegenLoading(true);
    try {
      const res = await kaderApi.regenInviteCode(currentPosyanduId);
      if (res.success && res.data) {
        setInvitationCode(res.data.invitationCode);
        setCopied(false);
        setActionNotice("Kode undangan berhasil diperbarui.");
        setTimeout(() => setActionNotice(""), 3000);
      }
    } catch (err: any) {
      setActionNotice(err.message || "Gagal memperbarui kode undangan.");
      setTimeout(() => setActionNotice(""), 3000);
    } finally {
      setIsRegenLoading(false);
    }
  };

  // Create new kader account directly
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddMemberError("");
    setAddMemberSuccess("");

    if (!newMemberNama.trim() || !newMemberEmail.trim() || !newMemberPassword.trim()) {
      setAddMemberError("Mohon lengkapi seluruh kolom input.");
      return;
    }

    if (newMemberPassword.length < 6) {
      setAddMemberError("Kata sandi minimal harus 6 karakter.");
      return;
    }

    if (!currentPosyanduId) return;

    setIsSubmitting(true);
    try {
      const res = await kaderApi.create(currentPosyanduId, {
        nama: newMemberNama.trim(),
        email: newMemberEmail.trim().toLowerCase(),
        password: newMemberPassword.trim(),
        role: newMemberRole,
      });

      if (res.success && res.data) {
        setKaders((prev) => [...prev, res.data]);
        setAddMemberSuccess(`Akun untuk ${newMemberNama} berhasil dibuat.`);
        setNewMemberNama("");
        setNewMemberEmail("");
        setNewMemberPassword("");
        setNewMemberRole("KADER");
        setShowAddMemberForm(false);
        setTimeout(() => setAddMemberSuccess(""), 4000);
      }
    } catch (err: any) {
      setAddMemberError(err.message || "Gagal membuat akun kader.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle active status (Aktif / Nonaktif)
  const handleToggleStatus = async (targetKader: KaderMember) => {
    if (!currentPosyanduId || !isOwner) return;
    if (targetKader.role === "OWNER") {
      setActionNotice("Tidak dapat menonaktifkan akun Owner posyandu.");
      setTimeout(() => setActionNotice(""), 3000);
      return;
    }

    const nextStatus = !targetKader.isActive;
    try {
      const res = await kaderApi.toggleStatus(currentPosyanduId, targetKader.id, nextStatus);
      if (res.success && res.data) {
        setKaders((prev) =>
          prev.map((k) => (k.id === targetKader.id ? { ...k, isActive: res.data.isActive } : k))
        );
        setActionNotice(`Status ${targetKader.nama} berhasil diubah.`);
        setTimeout(() => setActionNotice(""), 3000);
      }
    } catch (err: any) {
      setActionNotice(err.message || "Gagal mengubah status kader.");
      setTimeout(() => setActionNotice(""), 3000);
    }
  };

  // Change role (OWNER <-> KADER)
  const handleChangeRole = async (targetKader: KaderMember) => {
    if (!currentPosyanduId || !isOwner) return;
    if (targetKader.id === user?.id) {
      setActionNotice("Anda tidak dapat mengubah peran Anda sendiri.");
      setTimeout(() => setActionNotice(""), 3000);
      return;
    }

    const newRole: "OWNER" | "KADER" = targetKader.role === "OWNER" ? "KADER" : "OWNER";
    try {
      const res = await kaderApi.updateRole(currentPosyanduId, targetKader.id, newRole);
      if (res.success && res.data) {
        setKaders((prev) =>
          prev.map((k) => (k.id === targetKader.id ? { ...k, role: res.data.role } : k))
        );
        setActionNotice(`Peran ${targetKader.nama} diubah menjadi ${res.data.role === "OWNER" ? "Owner" : "Anggota"}.`);
        setTimeout(() => setActionNotice(""), 3000);
      }
    } catch (err: any) {
      setActionNotice(err.message || "Gagal mengubah peran kader.");
      setTimeout(() => setActionNotice(""), 3000);
    }
  };

  // Revoke/Delete Kader Access
  const handleRevokeAccess = async (targetKader: KaderMember) => {
    if (!currentPosyanduId || !isOwner) return;
    if (targetKader.role === "OWNER") {
      setActionNotice("Akses Akun dengan peran Owner tidak dapat dihapus.");
      setTimeout(() => setActionNotice(""), 3000);
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus akses kader ${targetKader.nama} dari posyandu ini?`)) {
      try {
        const res = await kaderApi.delete(currentPosyanduId, targetKader.id);
        if (res.success) {
          setKaders((prev) => prev.filter((k) => k.id !== targetKader.id));
          setActionNotice(`Akses kader ${targetKader.nama} berhasil dicabut.`);
          setTimeout(() => setActionNotice(""), 3000);
        }
      } catch (err: any) {
        setActionNotice(err.message || "Gagal mencabut akses kader.");
        setTimeout(() => setActionNotice(""), 3000);
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-saas-dark tracking-tight">Manajemen Akun Kader</h2>
            {isOwner ? (
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-saas-primary text-xs font-bold border border-teal-100">
                Akses Owner (Full)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-saas-muted text-xs font-bold border border-gray-200">
                Akses Anggota (Read Only)
              </span>
            )}
          </div>
          <p className="text-sm text-saas-muted mt-0.5">
            Kelola hak akses kader, buat akun secara langsung, atau bagikan kode undangan posyandu.
          </p>
        </div>
      </div>

      {/* Global Alerts */}
      {errorNotice && (
        <div className="p-4 bg-red-50 text-trend-dangerText border border-red-100 rounded-xl text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            {errorNotice}
          </div>
          <button onClick={fetchData} className="underline text-red-700 font-bold hover:text-red-900">
            Coba Lagi
          </button>
        </div>
      )}

      {actionNotice && (
        <div className="p-3 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all">
          <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0" />
          {actionNotice}
        </div>
      )}

      {addMemberSuccess && (
        <div className="p-3 bg-green-50 text-trend-successText border border-green-200 rounded-lg text-xs font-bold flex items-center gap-2 transition-all">
          <UserCheck2 className="w-4 h-4 text-green-600 shrink-0" />
          {addMemberSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Tabel Akun & Form Registrasi Anggota */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-saas-primary/10 flex items-center justify-center text-saas-primary">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-saas-dark">Akun Kader Terdaftar</h3>
                  <p className="text-xs text-saas-muted mt-0.5">
                    Daftar kader pelaksana posyandu terhubung di database backend.
                  </p>
                </div>
              </div>

              {isOwner && !showAddMemberForm && (
                <button
                  onClick={() => setShowAddMemberForm(true)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-all"
                >
                  <UserPlus className="w-4 h-4" /> Buat Akun Kader Baru
                </button>
              )}
            </div>

            {/* Form Buat Akun Anggota */}
            {isOwner && showAddMemberForm && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-card space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-saas-dark">
                    Tambah Kader Secara Langsung
                  </h4>
                  <button
                    onClick={() => setShowAddMemberForm(false)}
                    className="text-xs text-saas-muted hover:text-saas-dark font-bold"
                  >
                    Batal
                  </button>
                </div>

                {addMemberError && (
                  <div className="p-2.5 bg-red-50 text-trend-dangerText border border-red-100 rounded-lg text-xs font-bold flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {addMemberError}
                  </div>
                )}

                <form onSubmit={handleCreateAccount} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-saas-muted">Nama Lengkap</label>
                    <input
                      type="text"
                      placeholder="Cth: Ibu Rina Amalia"
                      value={newMemberNama}
                      onChange={(e) => setNewMemberNama(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-saas-muted">Email</label>
                    <input
                      type="email"
                      placeholder="rina.amalia@gmail.com"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-saas-muted">Kata Sandi Awal</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimal 6 karakter"
                        value={newMemberPassword}
                        onChange={(e) => setNewMemberPassword(e.target.value)}
                        className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50 pr-8"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-2 text-saas-muted hover:text-saas-dark"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-saas-muted">Hak Akses</label>
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value as "OWNER" | "KADER")}
                      className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                    >
                      <option value="KADER">Kader Anggota (Input Data)</option>
                      <option value="OWNER">Kader Owner (Full Akses)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyimpan...
                        </>
                      ) : (
                        "Buat Akun & Aktifkan"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Table */}
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-saas-muted">
                <Loader2 className="w-7 h-7 text-saas-primary animate-spin" />
                <p className="text-xs font-medium">Memuat data kader posyandu...</p>
              </div>
            ) : kaders.length === 0 ? (
              <div className="py-12 text-center text-saas-muted text-xs">
                Belum ada data kader terdaftar.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-bold text-saas-muted uppercase tracking-wider">
                      <th className="pb-3">Kader</th>
                      <th className="pb-3 text-center">Peran</th>
                      <th className="pb-3 text-center">Status</th>
                      {isOwner && <th className="pb-3 text-right">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {kaders.map((kader) => {
                      const isCurrentUser = kader.id === user?.id;
                      const isKaderOwner = kader.role === "OWNER";

                      return (
                        <tr
                          key={kader.id}
                          className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/20 transition-colors text-sm"
                        >
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="font-bold text-saas-dark flex items-center gap-1.5">
                                  {kader.nama}
                                  {isCurrentUser && (
                                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-teal-100 text-teal-800 rounded">
                                      Anda
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-saas-muted font-medium mt-0.5">{kader.email}</p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 text-center">
                            <button
                              disabled={!isOwner || isCurrentUser}
                              onClick={() => handleChangeRole(kader)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                                isKaderOwner
                                  ? "bg-teal-50 text-saas-primary border-saas-primary/20 hover:bg-teal-100"
                                  : "bg-gray-50 text-saas-muted border-gray-200 hover:bg-gray-100"
                              } disabled:cursor-not-allowed`}
                              title={isOwner ? "Klik untuk ubah Peran" : "Peran kader"}
                            >
                              {isKaderOwner ? "Owner" : "Anggota"}
                            </button>
                          </td>

                          <td className="py-4 text-center">
                            <button
                              disabled={!isOwner || isKaderOwner}
                              onClick={() => handleToggleStatus(kader)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 border transition-colors ${
                                kader.isActive
                                  ? "bg-trend-successBg text-trend-successText border-trend-successText/20 hover:bg-green-100"
                                  : "bg-trend-dangerBg text-trend-dangerText border-trend-dangerText/20 hover:bg-red-100"
                              } disabled:cursor-not-allowed`}
                              title={isOwner && !isKaderOwner ? "Klik untuk ubah Status" : "Status kader"}
                            >
                              {kader.isActive ? "Aktif" : "Nonaktif"}
                            </button>
                          </td>

                          {isOwner && (
                            <td className="py-4 text-right">
                              <button
                                disabled={isKaderOwner || isCurrentUser}
                                onClick={() => handleRevokeAccess(kader)}
                                className="px-2.5 py-1.5 border border-red-100 rounded-input text-xs font-bold text-trend-dangerText hover:bg-trend-dangerBg/50 transition-colors disabled:opacity-30 disabled:pointer-events-none inline-flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Hapus Akses
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Kode Undangan & Panduan */}
        <div className="space-y-6">
          {/* Kode Undangan */}
          <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-4">
            <div>
              <h3 className="font-bold text-sm text-saas-dark">Kode Undangan Posyandu</h3>
              <p className="text-[11px] text-saas-muted mt-0.5 leading-normal">
                Kode ini unik untuk Posyandu Anda. Gunakan untuk mendaftarkan kader baru.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-bold text-center tracking-wider text-saas-dark select-all min-h-[38px] flex items-center justify-center">
                {invitationCode || (isLoading ? "..." : "BELUM ADA KODE")}
              </code>
              <button
                onClick={handleCopyCode}
                title="Salin Kode Undangan"
                disabled={!invitationCode}
                className="w-9 h-9 rounded-lg bg-gray-50 hover:bg-saas-primary/10 border border-gray-200 flex items-center justify-center text-saas-dark hover:text-saas-primary transition-all shrink-0 disabled:opacity-50"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
              {isOwner && (
                <button
                  onClick={handleRegenCode}
                  title="Perbarui Kode Undangan"
                  disabled={isRegenLoading}
                  className="w-9 h-9 rounded-lg bg-gray-50 hover:bg-saas-primary/10 border border-gray-200 flex items-center justify-center text-saas-dark hover:text-saas-primary transition-all shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRegenLoading ? "animate-spin" : ""}`} />
                </button>
              )}
            </div>
          </div>

          {/* Panduan Peran */}
          <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-4 text-xs font-semibold leading-normal">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4.5 h-4.5 text-saas-primary" />
              <h3 className="font-bold text-sm text-saas-dark">Panduan Hak Akses</h3>
            </div>

            <div className="space-y-3 pt-2 text-saas-muted font-medium border-t border-gray-50">
              <div className="space-y-1">
                <p className="font-bold text-saas-dark flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-saas-primary" /> Kader Owner:
                </p>
                <p>
                  Akses administrasi penuh. Dapat edit profil posyandu, mengelola akun kader lain, dan meriset kode undangan.
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-saas-dark flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-gray-500" /> Kader Anggota:
                </p>
                <p>
                  Akses operasional lapangan. Dapat input data Balita/Lansia, pencatatan periksa bulanan, dan melihat statistik dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
