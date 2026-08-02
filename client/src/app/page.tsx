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
  AlertCircle,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

// Feature Modules
import DashboardModule from "../features/dashboard/DashboardModule";
import PelayananModule from "../features/pelayanan/PelayananModule";
import BalitaModule from "../features/balita/BalitaModule";
import LansiaModule from "../features/lansia/LansiaModule";
import RiwayatModule from "../features/riwayat/RiwayatModule";
import PengaturanModule from "../features/pengaturan/PengaturanModule";
import ManajemenAkunModule from "../features/pengaturan/ManajemenAkunModule";
import BantuanModule from "../features/bantuan/BantuanModule";

// Login Page (rendered inline when not authenticated)
import LoginPage from "./login/page";

export default function Home() {
  const { user, posyanduId, isLoading, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ── Loading spinner ──────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-saas-primary animate-spin" />
          <p className="text-sm text-saas-muted font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  // ── Login wall ───────────────────────────────────────────
  if (!user || !posyanduId) {
    return <LoginPage />;
  }

  // Navigation Items Config
  const navMenuItems = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Pelayanan", icon: ClipboardList },
    { name: "Balita", icon: Baby },
    { name: "Lansia", icon: HeartPulse },
    { name: "Riwayat", icon: History },
    { name: "Manajemen Akun", icon: Users },
    { name: "Pengaturan", icon: Settings },
  ];

  // ── Conditional Rendering of Views ──────────────────────
  const renderActiveView = () => {
    switch (activeMenu) {
      case "Overview":
        return (
          <DashboardModule
            searchQuery={searchQuery}
            onNavigate={setActiveMenu}
            posyanduId={posyanduId}
          />
        );
      case "Pelayanan":
        return <PelayananModule posyanduId={posyanduId} />;
      case "Balita":
        return <BalitaModule posyanduId={posyanduId} />;
      case "Lansia":
        return <LansiaModule posyanduId={posyanduId} />;
      case "Riwayat":
        return <RiwayatModule posyanduId={posyanduId} />;
      case "Manajemen Akun":
        return <ManajemenAkunModule />;
      case "Pengaturan":
        return <PengaturanModule />;
      case "Bantuan":
        return <BantuanModule />;
      default:
        return (
          <DashboardModule
            searchQuery={searchQuery}
            onNavigate={setActiveMenu}
            posyanduId={posyanduId}
          />
        );
    }
  };

  // User initials for avatar
  const initials = user.nama
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleMenuSelect = (menuName: string) => {
    setActiveMenu(menuName);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-canvas font-sans text-saas-dark overflow-hidden relative">
      {/* 1. SIDEBAR NAVIGASI DESKTOP (Tampil di md+) */}
      <aside className="hidden md:flex w-64 h-full bg-white border-r border-gray-100 flex-col justify-between p-6 shrink-0 overflow-y-auto">
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
            {navMenuItems.map((menu) => {
              const isActive = activeMenu === menu.name;
              const Icon = menu.icon;
              return (
                <button
                  key={menu.name}
                  onClick={() => handleMenuSelect(menu.name)}
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
          <button
            onClick={() => handleMenuSelect("Bantuan")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeMenu === "Bantuan"
                ? "bg-saas-primary text-white shadow-lg shadow-teal-500/15"
                : "text-saas-muted hover:text-saas-dark hover:bg-gray-50/80"
            }`}
          >
            <HelpCircle className={`w-4 h-4 ${activeMenu === "Bantuan" ? "text-white" : "text-saas-muted"}`} />
            Bantuan
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50/60 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* 2. MOBILE SIDEBAR DRAWER OVERLAY (Tampil di < md saat isMobileMenuOpen=true) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-saas-dark/40 backdrop-blur-sm transition-opacity"
          />

          {/* Mobile Drawer Panel */}
          <aside className="relative w-4/5 max-w-xs h-full bg-white shadow-2xl flex flex-col justify-between p-6 z-10 overflow-y-auto transform transition-transform duration-300">
            <div>
              {/* Header Drawer dengan Tombol Close */}
              <div className="flex items-center justify-between mb-8 px-1">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-saas-primary flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                    <HeartPulse className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h1 className="font-bold text-saas-dark text-base tracking-tight leading-none">PosyanduKita</h1>
                    <span className="text-[9px] text-saas-muted font-bold tracking-wider uppercase">Sistem Informasi</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-saas-muted hover:text-saas-dark"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Menu Links */}
              <nav className="space-y-1.5">
                {navMenuItems.map((menu) => {
                  const isActive = activeMenu === menu.name;
                  const Icon = menu.icon;
                  return (
                    <button
                      key={menu.name}
                      onClick={() => handleMenuSelect(menu.name)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-saas-primary text-white shadow-lg shadow-teal-500/15"
                          : "text-saas-muted hover:text-saas-dark hover:bg-gray-50/80"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-saas-muted"}`} />
                      {menu.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Menu Bawah Drawer */}
            <div className="border-t border-gray-100 pt-4 space-y-1.5 mt-6">
              <button
                onClick={() => handleMenuSelect("Bantuan")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeMenu === "Bantuan"
                    ? "bg-saas-primary text-white shadow-lg shadow-teal-500/15"
                    : "text-saas-muted hover:text-saas-dark hover:bg-gray-50/80"
                }`}
              >
                <HelpCircle className={`w-4 h-4 ${activeMenu === "Bantuan" ? "text-white" : "text-saas-muted"}`} />
                Bantuan
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50/60 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* AREA KONTEN UTAMA */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* 3. TOP NAVBAR (RESPONSIF) */}
        <header className="h-16 md:h-20 bg-white border-b border-gray-100 px-4 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
          {/* Left: Mobile Hamburger Toggle + Mobile Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-saas-dark hover:bg-gray-100 transition-colors"
              aria-label="Buka Menu Navigasi"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-8 h-8 rounded-lg bg-saas-primary flex items-center justify-center text-white">
                <HeartPulse className="w-4 h-4" />
              </div>
              <span className="font-bold text-saas-dark text-sm tracking-tight">PosyanduKita</span>
            </div>

            {/* Desktop Search Input */}
            <div className="relative hidden md:block w-72 lg:w-80">
              <input
                type="text"
                placeholder="Cari nama balita atau lansia..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50/70 border border-gray-100 rounded-input text-sm text-saas-dark placeholder-saas-muted/70 focus:outline-none focus:border-saas-primary/50 focus:bg-white transition-all"
              />
              <Search className="absolute left-3.5 top-2.5 text-saas-muted/80 w-4 h-4" />
            </div>
          </div>

          {/* Right: Search Toggle Mobile, Notifikasi & Profil */}
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Lonceng Notifikasi */}
            <button
              onClick={() => setShowNotification(!showNotification)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-100 flex items-center justify-center relative hover:bg-gray-50 transition-all"
            >
              <Bell className="w-4 h-4 text-saas-dark" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            {/* Dropdown Notifikasi */}
            {showNotification && (
              <div className="absolute top-16 sm:top-20 right-4 sm:right-10 w-72 sm:w-80 bg-white rounded-card shadow-lg border border-gray-100 p-4 z-50">
                <h4 className="font-bold text-sm text-saas-dark mb-2">Notifikasi Terbaru</h4>
                <div className="space-y-2">
                  <div className="p-2.5 bg-yellow-400/10 text-yellow-800 border border-yellow-250/20 rounded-lg text-xs flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Cek data terbaru</p>
                      <p className="text-saas-muted mt-0.5">Lihat dashboard untuk ringkasan posyandu.</p>
                    </div>
                  </div>
                  <div className="p-2.5 bg-green-50/40 rounded-lg text-xs text-saas-dark border border-green-100/50 flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Terhubung ke server</p>
                      <p className="text-saas-muted mt-0.5">Data diambil langsung dari database.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profil Kader */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-saas-primary/10 flex items-center justify-center font-bold text-saas-primary text-xs sm:text-sm border border-saas-primary/20 overflow-hidden shrink-0">
                {initials}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs sm:text-sm font-bold text-saas-dark leading-none">{user.nama}</p>
                <p className="text-[10px] sm:text-[11px] text-saas-muted font-semibold mt-0.5">
                  {user.role === "OWNER" ? "Pengelola" : "Kader"} · {user.posyandu.nama}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* 4. KONTEN MODUL DINAMIS */}
        <main className="p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 flex-1">
          {renderActiveView()}
        </main>
      </div>

      {/* 5. MOBILE BOTTOM NAVIGATION BAR (Tampil khusus di HP < md) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-2 flex items-center justify-around z-40 shadow-lg">
        {[
          { name: "Overview", label: "Home", icon: LayoutDashboard },
          { name: "Pelayanan", label: "Layanan", icon: ClipboardList },
          { name: "Balita", label: "Balita", icon: Baby },
          { name: "Lansia", label: "Lansia", icon: HeartPulse },
          { name: "Riwayat", label: "Riwayat", icon: History },
        ].map((item) => {
          const isActive = activeMenu === item.name;
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => handleMenuSelect(item.name)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? "text-saas-primary font-bold" : "text-saas-muted hover:text-saas-dark"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-saas-primary stroke-[2.5]" : "text-saas-muted"}`} />
              <span className="text-[10px] leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

