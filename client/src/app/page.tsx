"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  Baby,
  HeartPulse,
  History,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Search,
  Bell,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

// Feature Modules
import DashboardModule from "../features/dashboard/DashboardModule";
import PelayananModule from "../features/pelayanan/PelayananModule";
import BalitaModule from "../features/balita/BalitaModule";
import LansiaModule from "../features/lansia/LansiaModule";
import RiwayatModule from "../features/riwayat/RiwayatModule";
import PengaturanModule from "../features/pengaturan/PengaturanModule";
import ManajemenAkunModule from "../features/pengaturan/ManajemenAkunModule";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Overview");

  // Conditional Rendering of Views
  const renderActiveView = () => {
    switch (activeMenu) {
      case "Overview":
        return <DashboardModule searchQuery={searchQuery} onNavigate={setActiveMenu} />;
      case "Pelayanan":
        return <PelayananModule />;
      case "Balita":
        return <BalitaModule />;
      case "Lansia":
        return <LansiaModule />;
      case "Riwayat":
        return <RiwayatModule />;
      case "Manajemen Akun":
        return <ManajemenAkunModule />;
      case "Pengaturan":
        return <PengaturanModule />;
      default:
        return <DashboardModule searchQuery={searchQuery} onNavigate={setActiveMenu} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-canvas font-sans text-saas-dark">
      {/* 1. SIDEBAR NAVIGASI KIRI */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col justify-between p-6 shrink-0">
        <div>
          {/* Logo Brand */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 rounded-xl bg-saas-primary flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <HeartPulse className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-bold text-saas-dark text-base tracking-tight leading-none">PosyanduKita</h1>
              <span className="text-[10px] text-saas-muted font-bold tracking-wider uppercase">Sistem Informasi</span>
            </div>
          </div>

          {/* Menu Link */}
          <nav className="space-y-1">
            {[
              { name: "Overview", icon: LayoutDashboard },
              { name: "Pelayanan", icon: ClipboardList },
              { name: "Balita", icon: Baby },
              { name: "Lansia", icon: HeartPulse },
              { name: "Riwayat", icon: History },
              { name: "Manajemen Akun", icon: Users },
              { name: "Pengaturan", icon: Settings },
            ].map((menu) => {
              const isActive = activeMenu === menu.name;
              const Icon = menu.icon;
              return (
                <button
                  key={menu.name}
                  onClick={() => setActiveMenu(menu.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-saas-primary text-white shadow-lg shadow-teal-500/15"
                      : "text-saas-muted hover:text-saas-dark hover:bg-gray-50/80"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-saas-muted group-hover:text-saas-dark"}`} />
                  {menu.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Menu Bawah */}
        <div className="border-t border-gray-100 pt-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-saas-muted hover:text-saas-dark hover:bg-gray-50/80 transition-all">
            <HelpCircle className="w-4 h-4" />
            Bantuan
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-trend-dangerText hover:bg-red-55/40 transition-all">
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* AREA KONTEN UTAMA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* 2. TOP NAVBAR */}
        <header className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between shrink-0">
          {/* Kolom Pencarian Global */}
          <div className="relative w-80">
            <input
              type="text"
              placeholder="Cari nama balita atau lansia..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50/70 border border-gray-100 rounded-input text-sm text-saas-dark placeholder-saas-muted/70 focus:outline-none focus:border-saas-primary/50 focus:bg-white transition-all"
            />
            <Search className="absolute left-3.5 top-2.5 text-saas-muted/80 w-4 h-4" />
          </div>

          {/* Notifikasi & Profil */}
          <div className="flex items-center gap-6">
            {/* Lonceng Notifikasi */}
            <button
              onClick={() => setShowNotification(!showNotification)}
              className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center relative hover:bg-gray-50 transition-all"
            >
              <Bell className="w-4 h-4 text-saas-dark" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-trend-dangerText rounded-full border border-white"></span>
            </button>

            {/* Dropdown Notifikasi Mock */}
            {showNotification && (
              <div className="absolute top-20 right-28 w-80 bg-white rounded-card shadow-lg border border-gray-100 p-4 z-50">
                <h4 className="font-bold text-sm text-saas-dark mb-2">Notifikasi Terbaru</h4>
                <div className="space-y-2">
                  <div className="p-2.5 bg-yellow-400/10 text-yellow-800 border border-yellow-250/20 rounded-lg text-xs flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">3 Lansia belum periksa</p>
                      <p className="text-saas-muted mt-0.5">Mbah Karto, Mbah Sumi, Mbah Harjo belum input.</p>
                    </div>
                  </div>
                  <div className="p-2.5 bg-green-50/40 rounded-lg text-xs text-saas-dark border border-green-100/50 flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Input Balita Berhasil</p>
                      <p className="text-saas-muted mt-0.5">Data berat badan Andi Pratama berhasil disimpan.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profil Kader */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-saas-primary/10 flex items-center justify-center font-bold text-saas-primary text-sm border border-saas-primary/20 overflow-hidden">
                IA
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-bold text-saas-dark leading-none">Ibu Aminah</p>
                <p className="text-[11px] text-saas-muted font-semibold mt-0.5">Kader Posyandu Sri Lestari</p>
              </div>
            </div>
          </div>
        </header>

        {/* 3. KONTEN MODUL DINAMIS */}
        <main className="p-8 flex-1">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
