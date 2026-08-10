"use client";

import { useState, useEffect, useRef } from "react";
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
  AlertTriangle,
  Info,
  Check,
  ChevronDown,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { notificationApi, AppNotification } from "../lib/api";

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

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState<boolean>(false);

  const loadNotifications = async () => {
    if (!posyanduId) return;
    try {
      setIsLoadingNotifications(true);
      const res = await notificationApi.getNotifications(posyanduId);
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error("Gagal memuat notifikasi:", err);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  useEffect(() => {
    if (user && posyanduId) {
      loadNotifications();
    }
  }, [user, posyanduId, activeMenu]);

  const handleMarkAllRead = async () => {
    if (!posyanduId) return;
    try {
      const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
      if (unreadIds.length === 0) return;
      await notificationApi.markAsRead(posyanduId, unreadIds);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Gagal menandai notifikasi dibaca:", err);
    }
  };

  const handleNotificationItemClick = async (item: AppNotification) => {
    // 1. Mark item as read if unread
    if (!item.isRead && posyanduId) {
      try {
        await notificationApi.markAsRead(posyanduId, [item.id]);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Gagal menandai notifikasi dibaca:", err);
      }
    }

    // 2. Navigate based on category
    if (item.category === "balita") {
      setActiveMenu("Balita");
    } else if (item.category === "lansia") {
      setActiveMenu("Lansia");
    } else if (item.category === "system") {
      setActiveMenu("Overview");
    }

    // 3. Close dropdown
    setShowNotification(false);
  };

  // Close notification & profile dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotification(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowNotification(false);
        setShowProfileMenu(false);
      }
    };

    if (showNotification || showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNotification, showProfileMenu]);

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
    setShowNotification(false);
    setShowProfileMenu(false);
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
            {/* Container Lonceng & Dropdown Notifikasi */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setShowNotification((prev) => !prev);
                  if (!showNotification) loadNotifications();
                }}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-100 flex items-center justify-center relative hover:bg-gray-50 transition-all"
                aria-label="Notifikasi"
              >
                <Bell className="w-4 h-4 text-saas-dark" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Notifikasi */}
              {showNotification && (
                <div className="absolute top-12 right-0 w-80 sm:w-96 bg-white rounded-card shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in duration-150 max-h-[80vh] flex flex-col">
                  {/* Header Notifikasi */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-saas-dark">Notifikasi</h4>
                      {unreadCount > 0 && (
                        <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {unreadCount} baru
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-bold text-saas-primary hover:underline flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Tandai dibaca
                      </button>
                    )}
                  </div>

                  {/* List Notifikasi */}
                  <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
                    {isLoadingNotifications ? (
                      <div className="py-6 text-center text-saas-muted text-xs flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-saas-primary" />
                        Memuat notifikasi...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="py-8 text-center text-saas-muted text-xs">
                        Tidak ada notifikasi saat ini
                      </div>
                    ) : (
                      notifications.map((item) => {
                        let bgClass = "bg-blue-50/50 border-blue-100 text-blue-900";
                        let IconComponent = Info;
                        let iconColor = "text-blue-500";

                        if (item.type === "DANGER") {
                          bgClass = "bg-red-50/60 border-red-200/70 text-red-900";
                          IconComponent = AlertCircle;
                          iconColor = "text-red-500";
                        } else if (item.type === "WARNING") {
                          bgClass = "bg-amber-50/60 border-amber-200/70 text-amber-900";
                          IconComponent = AlertTriangle;
                          iconColor = "text-amber-500";
                        } else if (item.type === "SUCCESS") {
                          bgClass = "bg-emerald-50/50 border-emerald-100 text-emerald-900";
                          IconComponent = CheckCircle2;
                          iconColor = "text-emerald-500";
                        }

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleNotificationItemClick(item)}
                            className={`p-3 border rounded-xl text-xs relative transition-all cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99] ${bgClass} ${
                              !item.isRead ? "shadow-xs font-semibold ring-1 ring-black/5" : "opacity-75 hover:opacity-100"
                            }`}
                          >
                            <div className="flex gap-2.5 items-start">
                              <IconComponent className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <p className="font-bold text-saas-dark text-xs truncate">
                                    {item.title}
                                  </p>
                                  {!item.isRead && (
                                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                  )}
                                </div>
                                <p className="text-[11px] text-saas-dark/80 leading-relaxed">
                                  {item.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profil Kader */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setShowProfileMenu((prev) => !prev);
                  setShowNotification(false);
                }}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-gray-100/80 transition-all cursor-pointer group"
                aria-label="Menu Profil"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-saas-primary/10 flex items-center justify-center font-bold text-saas-primary text-xs sm:text-sm border border-saas-primary/20 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                  {initials}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1">
                    <p className="text-xs sm:text-sm font-bold text-saas-dark leading-none">{user.nama}</p>
                    <ChevronDown className="w-3.5 h-3.5 text-saas-muted group-hover:text-saas-dark transition-transform duration-200" />
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-saas-muted font-semibold mt-0.5">
                    {user.role === "OWNER" ? "Pengelola" : "Kader"} · {user.posyandu.nama}
                  </p>
                </div>
              </button>

              {/* Dropdown Menu Profil */}
              {showProfileMenu && (
                <div className="absolute top-14 right-0 w-64 bg-white rounded-card shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in duration-150 space-y-1">
                  {/* Info Ringkas */}
                  <div className="p-3 border-b border-gray-100 bg-gray-50/60 rounded-lg mb-1">
                    <p className="font-extrabold text-xs text-saas-dark">{user.nama}</p>
                    <p className="text-[10px] text-saas-muted truncate mt-0.5">{user.email}</p>
                    <div className="mt-2 inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal-50 text-saas-primary border border-teal-200/50">
                      {user.role === "OWNER" ? "Pengelola (Owner)" : "Kader Posyandu"}
                    </div>
                  </div>

                  {/* Menu Navigasi Profil */}
                  <button
                    onClick={() => handleMenuSelect("Pengaturan")}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-saas-dark hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-saas-muted" />
                    Pengaturan Sistem
                  </button>

                  {user.role === "OWNER" && (
                    <button
                      onClick={() => handleMenuSelect("Manajemen Akun")}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-saas-dark hover:bg-gray-50 rounded-lg transition-colors text-left"
                    >
                      <Users className="w-4 h-4 text-saas-muted" />
                      Manajemen Akun Kader
                    </button>
                  )}

                  <button
                    onClick={() => handleMenuSelect("Bantuan")}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-saas-dark hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    <HelpCircle className="w-4 h-4 text-saas-muted" />
                    Pusat Bantuan & Dokumen
                  </button>

                  <div className="border-t border-gray-100 pt-1 mt-1">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50/80 rounded-lg transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Keluar (Logout)
                    </button>
                  </div>
                </div>
              )}
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

