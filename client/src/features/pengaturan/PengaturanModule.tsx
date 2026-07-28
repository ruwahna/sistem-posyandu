"use client";

import { useState } from "react";
import {
  Building2,
  Save,
  UserCheck2
} from "lucide-react";

export default function PengaturanModule() {
  // Posyandu Info Form State
  const [posyanduNama, setPosyanduNama] = useState("Posyandu Sri Lestari");
  const [posyanduDesa, setPosyanduDesa] = useState("Desa Karanggayam");
  const [posyanduKecamatan, setPosyanduKecamatan] = useState("Kecamatan Karanggayam");
  const [posyanduAlamat, setPosyanduAlamat] = useState("RT 02 / RW 02, Karanggayam");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Save Posyandu Info
  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-saas-dark tracking-tight">Pengaturan Posyandu</h2>
        <p className="text-sm text-saas-muted mt-0.5">Kelola informasi profil, nama, dan lokasi administratif posyandu Anda.</p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-saas-primary/10 flex items-center justify-center text-saas-primary">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-saas-dark">Profil & Lokasi Posyandu</h3>
            <p className="text-xs text-saas-muted mt-0.5">Edit data administratif posyandu aktif.</p>
          </div>
        </div>

        <form onSubmit={handleSaveInfo} className="space-y-4 pt-2">
          {saveSuccess && (
            <div className="p-3 bg-green-50 text-trend-successText border border-green-100 rounded-lg text-xs font-bold flex items-center gap-2">
              <UserCheck2 className="w-4 h-4 text-green-600 shrink-0" /> Pengaturan Posyandu berhasil disimpan!
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-saas-muted">Nama Posyandu</label>
            <input
              type="text"
              value={posyanduNama}
              onChange={(e) => setPosyanduNama(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">Desa / Kelurahan</label>
              <input
                type="text"
                value={posyanduDesa}
                onChange={(e) => setPosyanduDesa(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-saas-muted">Kecamatan</label>
              <input
                type="text"
                value={posyanduKecamatan}
                onChange={(e) => setPosyanduKecamatan(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-saas-muted">Alamat Jalan / RT / RW</label>
            <textarea
              rows={3}
              value={posyanduAlamat}
              onChange={(e) => setPosyanduAlamat(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-150 rounded-input text-xs font-semibold focus:outline-none focus:border-saas-primary/50"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-input shadow-md shadow-teal-500/10 transition-all flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" /> Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
