"use client";

import { useState, useEffect } from "react";
import { Calendar, Plus, Check, Clock, AlertCircle, X, Sparkles, Trash2 } from "lucide-react";
import { periodeApi, PeriodePelayanan } from "../lib/api";
import Modal from "./Modal";

const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

interface PeriodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  posyanduId: string;
  activePeriode: PeriodePelayanan | null;
  onSelectPeriode: (periode: PeriodePelayanan) => void;
  onRefreshPeriode: () => void;
}

export default function PeriodeModal({
  isOpen,
  onClose,
  posyanduId,
  activePeriode,
  onSelectPeriode,
  onRefreshPeriode,
}: PeriodeModalProps) {
  const [periodes, setPeriodes] = useState<PeriodePelayanan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form State
  const today = new Date();
  const currentMonthIdx = today.getMonth();
  const currentYearNum = today.getFullYear();

  const [nama, setNama] = useState(`Pelayanan ${NAMA_BULAN[currentMonthIdx]} ${currentYearNum}`);
  const [bulan, setBulan] = useState(currentMonthIdx + 1);
  const [tahun, setTahun] = useState(currentYearNum);
  const [tanggal, setTanggal] = useState(today.toISOString().slice(0, 10));
  const [status, setStatus] = useState<"AKTIF" | "SELESAI">("AKTIF");
  const [catatan, setCatatan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPeriodes = async () => {
    if (!posyanduId) return;
    setIsLoading(true);
    try {
      const res = await periodeApi.getAll(posyanduId);
      if (res.success && res.data) {
        setPeriodes(res.data);
      }
    } catch (err: any) {
      console.error("Gagal memuat daftar periode:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPeriodes();
      setErrorMsg("");
      setSuccessMsg("");
      setShowAddForm(!activePeriode);
    }
  }, [isOpen, posyanduId, activePeriode]);

  // Update automatic nama when month/year changes
  const handleBulanYearChange = (newBulan: number, newTahun: number) => {
    setBulan(newBulan);
    setTahun(newTahun);
    setNama(`Pelayanan ${NAMA_BULAN[newBulan - 1]} ${newTahun}`);
  };

  const handleCreatePeriode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!nama.trim() || !tanggal) {
      setErrorMsg("Mohon isi nama periode dan tanggal pelayanan.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await periodeApi.create(posyanduId, {
        nama: nama.trim(),
        bulan,
        tahun,
        tanggal,
        status,
        catatan: catatan.trim() || undefined,
      });

      if (res.success && res.data) {
        setSuccessMsg("Periode pelayanan baru berhasil dibuka!");
        onSelectPeriode(res.data);
        onRefreshPeriode();
        setShowAddForm(false);
        fetchPeriodes();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal membuka periode pelayanan baru.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = async (p: PeriodePelayanan) => {
    try {
      setErrorMsg("");
      const res = await periodeApi.activate(posyanduId, p.id);
      if (res.success && res.data) {
        onSelectPeriode(res.data);
        onRefreshPeriode();
        setSuccessMsg(`Periode "${p.nama}" sekarang aktif.`);
        fetchPeriodes();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mengaktifkan periode pelayanan.");
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; nama: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await periodeApi.delete(posyanduId, deleteTarget.id);
      fetchPeriodes();
      onRefreshPeriode();
      setSuccessMsg(`Periode "${deleteTarget.nama}" berhasil dihapus.`);
      setDeleteTarget(null);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menghapus periode.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kelola Periode Pelayanan Posyandu"
    >
      <div className="space-y-5">
        {/* Header Summary */}
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-saas-primary text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-saas-muted">Periode Aktif Saat Ini</p>
              <h4 className="font-extrabold text-sm text-saas-dark">
                {activePeriode ? activePeriode.nama : "Belum Ada Periode Aktif"}
              </h4>
              {activePeriode ? (
                <p className="text-[11px] text-saas-muted font-medium mt-0.5">
                  Pelaksanaan: {new Date(activePeriode.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              ) : (
                <p className="text-[11px] text-amber-600 font-semibold mt-0.5">
                  ⚠️ Belum ada periode aktif untuk bulan ini. Mohon buat periode baru di bawah ini.
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowAddForm(!showAddForm);
              setErrorMsg("");
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            {showAddForm ? (
              <>
                <X className="w-4 h-4" /> Batal
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Buka Periode Baru
              </>
            )}
          </button>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="p-3 bg-red-50 text-trend-dangerText border border-red-100 rounded-lg text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-green-50 text-trend-successText border border-green-150 rounded-lg text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-green-600" /> {successMsg}
          </div>
        )}

        {/* FORM Buka Periode Baru */}
        {showAddForm && (
          <form onSubmit={handleCreatePeriode} className="bg-gray-50 border border-gray-200/80 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <h5 className="font-bold text-xs text-saas-dark flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-saas-primary" /> Form Pembukaan Periode Pelayanan Baru
              </h5>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-saas-dark mb-1">Bulan Pelayanan</label>
                <select
                  value={bulan}
                  onChange={(e) => handleBulanYearChange(Number(e.target.value), tahun)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-input text-xs font-semibold text-saas-dark focus:outline-none focus:border-saas-primary"
                >
                  {NAMA_BULAN.map((m, idx) => (
                    <option key={m} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-saas-dark mb-1">Tahun</label>
                <select
                  value={tahun}
                  onChange={(e) => handleBulanYearChange(bulan, Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-input text-xs font-semibold text-saas-dark focus:outline-none focus:border-saas-primary"
                >
                  {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-saas-dark mb-1">Nama Periode</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Pelayanan Agustus 2026"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-input text-xs font-semibold text-saas-dark focus:outline-none focus:border-saas-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-saas-dark mb-1">Tanggal Pelaksanaan Kegiatan</label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-input text-xs font-semibold text-saas-dark focus:outline-none focus:border-saas-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-saas-dark mb-1">Status Langsung</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "AKTIF" | "SELESAI")}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-input text-xs font-semibold text-saas-dark focus:outline-none focus:border-saas-primary"
                >
                  <option value="AKTIF">Aktif (Jadikan Periode Kerja Utama)</option>
                  <option value="SELESAI">Selesai (Simpan sebagai riwayat)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-saas-dark mb-1">Catatan/Keterangan Kegiatan (Opsional)</label>
                <input
                  type="text"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Contoh: Posyandu Rutin Serentak + Pembagian PMT"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-input text-xs font-semibold text-saas-dark focus:outline-none focus:border-saas-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs font-bold text-saas-muted hover:text-saas-dark"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-saas-primary hover:bg-teal-600 text-white text-xs font-bold rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan & Buka Periode"}
              </button>
            </div>
          </form>
        )}

        {/* DAFTAR PERIODE PELAYANAN */}
        <div className="space-y-2">
          <h5 className="font-bold text-xs text-saas-dark uppercase tracking-wider">
            Daftar Periode Pelayanan ({periodes.length})
          </h5>

          {isLoading ? (
            <div className="text-center py-6 text-xs text-saas-muted font-medium">Memuat daftar periode...</div>
          ) : periodes.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100 p-4">
              <p className="text-xs text-saas-muted font-semibold">Belum ada periode pelayanan yang dibuat.</p>
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="mt-2 text-xs font-bold text-saas-primary hover:underline"
              >
                + Buka Periode Pelayanan Pertama
              </button>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {periodes.map((p) => {
                const isSelected = activePeriode?.id === p.id;
                const isAktif = p.status === "AKTIF";

                return (
                  <div
                    key={p.id}
                    className={`p-3.5 border rounded-xl flex items-center justify-between transition-all ${
                      isAktif
                        ? "border-saas-primary/50 bg-teal-50/40 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                        isAktif ? "bg-saas-primary text-white" : "bg-gray-100 text-saas-muted"
                      }`}>
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h6 className="font-bold text-xs text-saas-dark">{p.nama}</h6>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                            isAktif ? "bg-teal-100 text-saas-primary" : "bg-gray-100 text-saas-muted"
                          }`}>
                            {isAktif ? "Aktif" : "Selesai"}
                          </span>
                        </div>
                        <p className="text-[10px] text-saas-muted font-medium mt-0.5">
                          Pelaksanaan: {new Date(p.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                          {p.catatan ? ` • ${p.catatan}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isAktif ? (
                        <button
                          type="button"
                          onClick={() => handleActivate(p)}
                          className="px-3 py-1.5 bg-white hover:bg-teal-50 border border-gray-200 text-saas-primary hover:border-teal-300 text-[11px] font-bold rounded-lg transition-all"
                        >
                          Pilih / Aktifkan
                        </button>
                      ) : (
                        <span className="px-3 py-1 bg-teal-100 text-saas-primary text-[11px] font-extrabold rounded-lg flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Sedang Dipilih
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ id: p.id, nama: p.nama })}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Periode"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Konfirmasi Hapus Periode */}
      {deleteTarget && (
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Konfirmasi Hapus Periode"
        >
          <div className="space-y-4 py-1">
            <div className="flex items-start gap-3.5 p-3.5 bg-red-50/70 border border-red-100 rounded-xl text-red-900">
              <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-extrabold text-sm text-red-950">Hapus Periode Pelayanan?</h5>
                <p className="text-xs text-red-800 mt-1 leading-relaxed">
                  Apakah Anda yakin ingin menghapus periode <span className="font-bold underline text-red-950">"{deleteTarget.nama}"</span>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-bold text-saas-muted hover:text-saas-dark hover:bg-gray-100 rounded-lg transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Menghapus..." : "Ya, Hapus Periode"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
}
