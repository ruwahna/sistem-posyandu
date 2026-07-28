"use client";

import { useState } from "react";
import {
  Users,
  Copy,
  Check,
  RefreshCw,
  UserCheck2,
  AlertCircle,
  Plus,
  Trash2,
  Shield,
  Eye,
  EyeOff,
  UserPlus
} from "lucide-react";

interface Kader {
  id: string;
  nama: string;
  email: string;
  role: "Owner" | "Anggota";
  status: "Aktif" | "Nonaktif" | "Undangan Terkirim";
}

export default function ManajemenAkunModule() {
  // Invitation State
  const [invitationCode, setInvitationCode] = useState("SRILESTARI-KADER-99A8");
  const [copied, setCopied] = useState(false);

  // Mock Active Cadres list
  const [kaders, setKaders] = useState<Kader[]>([
    { id: "k-1", nama: "Ibu Aminah", email: "aminah@gmail.com", role: "Owner", status: "Aktif" },
    { id: "k-2", nama: "Ibu Siti Rahmawati", email: "siti.rahma@gmail.com", role: "Anggota", status: "Aktif" },
    { id: "k-3", nama: "Ibu Endah Ningsih", email: "endah.n@gmail.com", role: "Anggota", status: "Undangan Terkirim" },
    { id: "k-4", nama: "Ibu Purwati Ningsih", email: "purwati.n@gmail.com", role: "Anggota", status: "Nonaktif" },
  ]);

  // Direct Account Creation Form State
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [newMemberNama, setNewMemberNama] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPassword, setNewMemberPassword] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"Owner" | "Anggota">("Anggota");
  const [showPassword, setShowPassword] = useState(false);
  const [addMemberSuccess, setAddMemberSuccess] = useState("");
  const [addMemberError, setAddMemberError] = useState("");

  // Action feedback
  const [actionNotice, setActionNotice] = useState("");

  // Generate code
  const handleRegenCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "SRILESTARI-KADER-";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setInvitationCode(code);
    setCopied(false);
  };

  // Copy code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(invitationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Direct Add Kader Account
  const handleCreateAccount = (e: React.FormEvent) => {
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

    if (kaders.some((k) => k.email.toLowerCase() === newMemberEmail.toLowerCase())) {
      setAddMemberError("Email ini sudah terdaftar sebagai kader di posyandu ini.");
      return;
    }

    const newKader: Kader = {
      id: `k_${Date.now()}`,
      nama: newMemberNama,
      email: newMemberEmail,
      role: newMemberRole,
      status: "Aktif",
    };

    setKaders([...kaders, newKader]);
    setAddMemberSuccess(`Akun untuk ${newMemberNama} berhasil dibuat langsung dengan status Aktif.`);
    
    setNewMemberNama("");
    setNewMemberEmail("");
    setNewMemberPassword("");
    setNewMemberRole("Anggota");
    setShowAddMemberForm(false);
    
    setTimeout(() => setAddMemberSuccess(""), 4000);
  };

  // Toggle Status
  const handleToggleStatus = (id: string) => {
    const updated = kaders.map((k) => {
      if (k.id === id) {
        if (k.role === "Owner") {
          setActionNotice("Tidak dapat menonaktifkan akun Owner posyandu.");
          setTimeout(() => setActionNotice(""), 3000);
          return k;
        }
        const newStatus: Kader["status"] = k.status === "Aktif" ? "Nonaktif" : "Aktif";
        setActionNotice(`Status kader ${k.nama} diubah menjadi ${newStatus}.`);
        setTimeout(() => setActionNotice(""), 3000);
        return { ...k, status: newStatus };
      }
      return k;
    });
    setKaders(updated);
  };

  // Change Role
  const handleChangeRole = (id: string) => {
    const updated = kaders.map((k) => {
      if (k.id === id) {
        if (k.id === "k-1") {
          setActionNotice("Pemilik posyandu utama tidak dapat diubah perannya.");
          setTimeout(() => setActionNotice(""), 3000);
          return k;
        }
        const newRole: Kader["role"] = k.role === "Owner" ? "Anggota" : "Owner";
        setActionNotice(`Peran kader ${k.nama} diubah menjadi ${newRole}.`);
        setTimeout(() => setActionNotice(""), 3000);
        return { ...k, role: newRole };
      }
      return k;
    });
    setKaders(updated);
  };

  // Revoke Access
  const handleRevokeAccess = (id: string) => {
    const target = kaders.find((k) => k.id === id);
    if (!target) return;

    if (target.role === "Owner") {
      setActionNotice("Akses Akun dengan peran Owner tidak dapat dihapus langsung.");
      setTimeout(() => setActionNotice(""), 3000);
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus akses kader ${target.nama} dari posyandu ini?`)) {
      setKaders(kaders.filter((k) => k.id !== id));
      setActionNotice(`Akses kader ${target.nama} berhasil dicabut.`);
      setTimeout(() => setActionNotice(""), 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-saas-dark tracking-tight">Manajemen Akun Kader</h2>
        <p className="text-sm text-saas-muted mt-0.5">Kelola hak akses kader, buat akun secara langsung, atau bagikan kode undangan.</p>
      </div>

      {actionNotice && (
        <div className="p-3 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all">
          <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0" />
          {actionNotice}
        </div>
      )}

      {addMemberSuccess && (
        <div className="p-3 bg-green-50 text-trend-successText border border-green-100 rounded-lg text-xs font-bold flex items-center gap-2 transition-all">
          <UserCheck2 className="w-4 h-4 text-green-600 shrink-0" />
          {addMemberSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Tabel Akun & Registrasi Anggota */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-saas-primary/10 flex items-center justify-center text-saas-primary">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-saas-dark">Akun Kader Terdaftar</h3>
                  <p className="text-xs text-saas-muted mt-0.5">Daftar kader pelaksana posyandu aktif.</p>
                </div>
              </div>

              {!showAddMemberForm && (
                <button
                  onClick={() => setShowAddMemberForm(true)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-all"
                >
                  <UserPlus className="w-4 h-4" /> Buat Akun Kader Baru
                </button>
              )}
            </div>

            {/* Form Buat Akun Anggota */}
            {showAddMemberForm && (
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-card space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase tracking-wider font-bold text-saas-dark">Tambah Kader Secara Langsung</h4>
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
                      className="w-full p-2 bg-white border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-saas-muted">Email</label>
                    <input
                      type="email"
                      placeholder="rina.amalia@gmail.com"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
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
                        className="w-full p-2 bg-white border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50 pr-8"
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
                      onChange={(e) => setNewMemberRole(e.target.value as any)}
                      className="w-full p-2 bg-white border border-gray-150 rounded-lg text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
                    >
                      <option value="Anggota">Kader Anggota (Input Data)</option>
                      <option value="Owner">Kader Owner (Full Akses)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-colors"
                    >
                      Buat Akun & Aktifkan
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold text-saas-muted uppercase tracking-wider">
                    <th className="pb-3">Kader</th>
                    <th className="pb-3 text-center">Peran</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {kaders.map((kader) => (
                    <tr key={kader.id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/20 transition-colors text-sm">
                      <td className="py-4">
                        <p className="font-bold text-saas-dark">{kader.nama}</p>
                        <p className="text-xs text-saas-muted font-medium mt-0.5">{kader.email}</p>
                      </td>
                      <td className="py-4 text-center">
                        <button
                          disabled={kader.id === "k-1"}
                          onClick={() => handleChangeRole(kader.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                            kader.role === "Owner"
                              ? "bg-teal-50 text-saas-primary border-saas-primary/20 hover:bg-teal-100"
                              : "bg-gray-50 text-saas-muted border-gray-200 hover:bg-gray-100"
                          }`}
                          title="Ubah Peran"
                        >
                          {kader.role}
                        </button>
                      </td>
                      <td className="py-4 text-center">
                        <button
                          disabled={kader.role === "Owner"}
                          onClick={() => handleToggleStatus(kader.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 border transition-colors ${
                            kader.status === "Aktif"
                              ? "bg-trend-successBg text-trend-successText border-trend-successText/20 hover:bg-green-100"
                              : kader.status === "Nonaktif"
                              ? "bg-trend-dangerBg text-trend-dangerText border-trend-dangerText/20 hover:bg-red-100"
                              : "bg-blue-50 text-saas-primary border-blue-100 hover:bg-blue-100"
                          }`}
                          title="Ubah Status"
                        >
                          {kader.status}
                        </button>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          disabled={kader.role === "Owner"}
                          onClick={() => handleRevokeAccess(kader.id)}
                          className="px-2.5 py-1.5 border border-red-100 rounded-input text-xs font-bold text-trend-dangerText hover:bg-trend-dangerBg/50 transition-colors disabled:opacity-30 disabled:pointer-events-none inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus Akses
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Kode Undangan & Panduan */}
        <div className="space-y-6">
          {/* Kode Undangan */}
          <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-4">
            <div>
              <h3 className="font-bold text-sm text-saas-dark">Kode Undangan Mandiri</h3>
              <p className="text-[11px] text-saas-muted mt-0.5 leading-normal">
                Kader lain dapat mendaftar sendiri dan memasukkan kode undangan ini untuk masuk ke posyandu Anda.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-mono font-bold text-center tracking-wider text-saas-dark select-all">
                {invitationCode}
              </code>
              <button
                onClick={handleCopyCode}
                className="w-9 h-9 rounded-lg bg-gray-50 hover:bg-saas-primary/10 border border-gray-100 flex items-center justify-center text-saas-dark hover:text-saas-primary transition-all shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleRegenCode}
                className="w-9 h-9 rounded-lg bg-gray-50 hover:bg-saas-primary/10 border border-gray-100 flex items-center justify-center text-saas-dark hover:text-saas-primary transition-all shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
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
                <p className="font-bold text-saas-dark">Kader Owner:</p>
                <p>Akses administrasi penuh. Dapat edit profil posyandu, mengelola akun kader lain, dan input rekam medis bulanan.</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-saas-dark">Kader Anggota:</p>
                <p>Akses operasional lapangan. Hanya dapat input data Balita/Lansia, pencatatan hasil periksa bulanan, dan membaca dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
