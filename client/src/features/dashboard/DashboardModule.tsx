"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  SlidersHorizontal,
  Download,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react";

interface DashboardModuleProps {
  searchQuery: string;
  onNavigate: (menu: string) => void;
}

interface Kunjungan {
  id: string;
  nama: string;
  tipe: "Balita" | "Lansia";
  detail: string;
  status: string;
  statusType: "success" | "warning" | "info";
  waktu: string;
}

const mockKunjungan: Kunjungan[] = [
  { id: "1", nama: "Andi Pratama", tipe: "Balita", detail: "12 Bulan", status: "Selesai Periksa", statusType: "success", waktu: "09:30 WIB" },
  { id: "2", nama: "Mbah Karto", tipe: "Lansia", detail: "RT 02 / RW 02", status: "Belum Periksa", statusType: "warning", waktu: "09:45 WIB" },
  { id: "3", nama: "Citra Lestari", tipe: "Balita", detail: "24 Bulan", status: "Selesai Periksa", statusType: "success", waktu: "10:15 WIB" },
  { id: "4", nama: "Budi Santoso", tipe: "Lansia", detail: "RT 01 / RW 02", status: "Ditunda", statusType: "info", waktu: "10:30 WIB" },
  { id: "5", nama: "Aisyah Putri", tipe: "Balita", detail: "6 Bulan", status: "Selesai Periksa", statusType: "success", waktu: "10:50 WIB" },
  { id: "6", nama: "Mbah Sumi", tipe: "Lansia", detail: "RT 03 / RW 02", status: "Belum Periksa", statusType: "warning", waktu: "11:00 WIB" },
];

export default function DashboardModule({ searchQuery, onNavigate }: DashboardModuleProps) {
  const [activeTab, setActiveTab] = useState<"Semua" | "Balita" | "Lansia">("Semua");

  const filteredKunjungan = mockKunjungan.filter((k) => {
    const matchesSearch = k.nama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "Semua" || k.tipe === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-saas-dark tracking-tight">Dashboard Overview</h2>
          <p className="text-sm text-saas-muted mt-0.5">
            Overview data tumbuh kembang anak dan kesehatan lansia di Posyandu Sri Lestari.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-input bg-white text-xs font-bold text-saas-dark hover:bg-gray-50 transition-all shadow-sm">
            <Download className="w-3.5 h-3.5 text-saas-muted" /> Export Laporan
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-input bg-white text-xs font-bold text-saas-dark hover:bg-gray-50 transition-all shadow-sm">
            <SlidersHorizontal className="w-3.5 h-3.5 text-saas-muted" /> Filter Data
          </button>
        </div>
      </div>

      {/* 4 Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Balita */}
        <div className="bg-saas-primary rounded-card shadow-soft-card p-6 relative overflow-hidden flex flex-col justify-between h-40 group text-white">
          <button 
            onClick={() => onNavigate("Balita")}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
          >
            <ArrowUpRight className="w-4 h-4 text-white" />
          </button>
          
          <div>
            <span className="text-xs uppercase tracking-wider text-white/70 font-bold">Total Balita</span>
            <h3 className="text-3xl font-extrabold mt-1">48 Anak</h3>
          </div>

          <div className="flex items-center gap-2 z-10">
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">
              +3.9%
            </span>
            <span className="text-xs text-white/70 font-medium">vs bulan lalu</span>
          </div>

          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/5 rounded-full filter blur-xl group-hover:scale-125 transition-transform duration-500"></div>
        </div>

        {/* Card 2: Total Lansia */}
        <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 relative flex flex-col justify-between h-40">
          <button 
            onClick={() => onNavigate("Lansia")}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-saas-dark hover:bg-saas-primary hover:text-white transition-colors"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <div>
            <span className="text-xs uppercase tracking-wider text-saas-muted font-bold">Total Lansia</span>
            <h3 className="text-3xl font-extrabold text-saas-dark mt-1">32 Jiwa</h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-trend-successBg text-trend-successText">
              +4.2%
            </span>
            <span className="text-xs text-saas-muted font-medium">vs bulan lalu</span>
          </div>
        </div>

        {/* Card 3: Gizi Kurang */}
        <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 relative flex flex-col justify-between h-40">
          <button 
            onClick={() => onNavigate("Balita")}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-saas-dark hover:bg-saas-primary hover:text-white transition-colors"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <div>
            <span className="text-xs uppercase tracking-wider text-saas-muted font-bold">Balita Gizi Kurang</span>
            <h3 className="text-3xl font-extrabold text-saas-dark mt-1">3 Anak</h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-trend-dangerBg text-trend-dangerText">
              -2.8%
            </span>
            <span className="text-xs text-saas-muted font-medium">vs bulan lalu</span>
          </div>
        </div>

        {/* Card 4: Kehadiran Pelayanan */}
        <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 relative flex flex-col justify-between h-40 overflow-hidden">
          <button 
            onClick={() => onNavigate("Riwayat")}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-saas-dark hover:bg-saas-primary hover:text-white transition-colors"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <div>
            <span className="text-xs uppercase tracking-wider text-saas-muted font-bold">Kehadiran Pelayanan</span>
            <h3 className="text-3xl font-extrabold text-saas-dark mt-1">72%</h3>
          </div>

          <div className="absolute right-6 bottom-4 w-28 h-10">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <defs>
                <linearGradient id="gradient-spark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 25 C 20 18, 40 5, 60 15 C 80 25, 90 2, 100 5 L 100 30 L 0 30 Z"
                fill="url(#gradient-spark)"
              />
              <path
                d="M 0 25 C 20 18, 40 5, 60 15 C 80 25, 90 2, 100 5"
                fill="none"
                stroke="#14B8A6"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-trend-successBg text-trend-successText">
              +4.2%
            </span>
            <span className="text-xs text-saas-muted font-medium">Bulan ini</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tren Status Gizi Balita (Bar Chart) */}
        <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-saas-dark">Tren Status Gizi Balita</h3>
              <p className="text-xs text-saas-muted mt-0.5">Distribusi hasil pemeriksaan bulanan 2026</p>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1">
              <button className="text-xs px-3 py-1.5 rounded-md font-bold bg-white text-saas-dark shadow-sm">
                Bulanan
              </button>
              <button className="text-xs px-3 py-1.5 rounded-md font-bold text-saas-muted hover:text-saas-dark">
                Tahunan
              </button>
            </div>
          </div>

          <div className="h-64 flex flex-col justify-between">
            <div className="flex-1 flex items-end justify-between px-4 pb-2 border-b border-gray-100 relative">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-full border-t border-dashed border-gray-100/80"></div>
                ))}
              </div>

              {[
                { bln: "Jan", val: 82, val2: 12 },
                { bln: "Feb", val: 85, val2: 10 },
                { bln: "Mar", val: 90, val2: 8 },
                { bln: "Apr", val: 78, val2: 15 },
                { bln: "Mei", val: 95, val2: 3 },
                { bln: "Jun", val: 88, val2: 9 },
                { bln: "Jul", val: 92, val2: 6 },
              ].map((data, index) => (
                <div key={index} className="flex flex-col items-center gap-2 z-10 w-8 group">
                  <div className="w-full flex justify-center gap-0.5 items-end h-48 relative">
                    <div className="absolute -top-10 bg-saas-dark text-white text-[10px] py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none z-20">
                      Normal: {data.val}% | Kurang: {data.val2}%
                    </div>
                    <div
                      style={{ height: `${data.val * 0.45}%` }}
                      className="w-3 bg-saas-primary rounded-t-full transition-all duration-700 hover:opacity-85"
                    ></div>
                    <div
                      style={{ height: `${data.val2 * 0.45}%` }}
                      className="w-3 bg-trend-dangerText/80 rounded-t-full transition-all duration-700 hover:opacity-85"
                    ></div>
                  </div>
                  <span className="text-[10px] text-saas-muted font-semibold">{data.bln}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 mt-4 px-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-saas-primary"></span>
                <span className="text-xs text-saas-muted font-medium">Balita Gizi Normal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-trend-dangerText/80"></span>
                <span className="text-xs text-saas-muted font-medium">Balita Gizi Kurang</span>
              </div>
            </div>
          </div>
        </div>

        {/* Aktivitas Kunjungan (Donut Chart) */}
        <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-saas-dark">Aktivitas Kunjungan</h3>
              <p className="text-xs text-saas-muted mt-0.5">Tingkat partisipasi kader & posyandu</p>
            </div>
            <button className="text-saas-muted hover:text-saas-dark transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#F3F4F6"
                  strokeWidth="10"
                  strokeDasharray="251.2"
                  strokeDashoffset="62.8"
                  strokeLinecap="round"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#14B8A6"
                  strokeWidth="10"
                  strokeDasharray="251.2"
                  strokeDashoffset="110"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-2xl font-black text-saas-dark leading-none">78%</span>
                <span className="text-[10px] text-saas-muted font-bold uppercase tracking-wider mt-1">Selesai</span>
              </div>
            </div>

            <div className="w-full space-y-3 mt-6">
              {[
                { label: "Balita Selesai Periksa", count: "45 Anak", color: "bg-saas-primary" },
                { label: "Lansia Selesai Periksa", count: "23 Lansia", color: "bg-green-500" },
                { label: "Belum Mengisi Data", count: "12 Orang", color: "bg-yellow-400" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs border-b border-gray-50 pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                    <span className="text-saas-muted font-semibold">{item.label}</span>
                  </div>
                  <span className="font-bold text-saas-dark">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kunjungan Terakhir Table */}
        <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h3 className="font-bold text-base text-saas-dark">Riwayat Antrean & Kunjungan Hari Ini</h3>
              <p className="text-xs text-saas-muted mt-0.5">Daftar pemeriksaan pelayanan posyandu terkini</p>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1 border border-gray-100/50">
              {(["Semua", "Balita", "Lansia"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs px-3.5 py-1.5 rounded-md font-bold transition-all ${
                    activeTab === tab 
                      ? "bg-white text-saas-primary shadow-sm" 
                      : "text-saas-muted hover:text-saas-dark"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-saas-muted uppercase tracking-wider">
                  <th className="pb-3 text-left">Nama</th>
                  <th className="pb-3">Kategori</th>
                  <th className="pb-3">Keterangan</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Jam Periksa</th>
                </tr>
              </thead>
              <tbody>
                {filteredKunjungan.length > 0 ? (
                  filteredKunjungan.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors text-sm">
                      <td className="py-4 font-bold text-saas-dark">{item.nama}</td>
                      <td className="py-4 text-saas-muted font-medium">{item.tipe}</td>
                      <td className="py-4 text-saas-muted font-medium">{item.detail}</td>
                      <td className="py-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                            item.statusType === "success"
                              ? "bg-trend-successBg text-trend-successText"
                              : item.statusType === "warning"
                              ? "bg-trend-dangerBg text-trend-dangerText"
                              : "bg-blue-50 text-saas-primary"
                          }`}
                        >
                          {item.statusType === "success" && <CheckCircle2 className="w-3 h-3" />}
                          {item.statusType === "warning" && <AlertCircle className="w-3 h-3" />}
                          {item.statusType === "info" && <Clock className="w-3 h-3" />}
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 text-right text-saas-muted font-semibold">{item.waktu}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-saas-muted font-medium">
                      Tidak menemukan data kunjungan yang cocok
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Distribusi RT/RW */}
        <div className="bg-white rounded-card shadow-soft-card border border-gray-100/70 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-saas-dark">Distribusi Kehadiran RT/RW</h3>
              <p className="text-xs text-saas-muted mt-0.5">Tingkat kehadiran per wilayah</p>
            </div>
            <button className="text-saas-muted hover:text-saas-dark transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {[
              { region: "RT 01 / RW 02", percent: 84, color: "bg-saas-primary" },
              { region: "RT 02 / RW 02", percent: 72, color: "bg-green-500" },
              { region: "RT 03 / RW 02", percent: 65, color: "bg-indigo-500" },
              { region: "RT 04 / RW 02", percent: 48, color: "bg-yellow-400" },
              { region: "RT 05 / RW 02", percent: 30, color: "bg-red-400" },
            ].map((row, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-saas-dark font-bold">{row.region}</span>
                  <span className="text-saas-muted font-bold">{row.percent}%</span>
                </div>
                <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100/20">
                  <div style={{ width: `${row.percent}%` }} className={`h-full rounded-full ${row.color}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
