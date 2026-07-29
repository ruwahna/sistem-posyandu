"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  HeartPulse,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Baby,
  Heart,
  Users,
  MapPin,
  Building2,
  Mail,
  Lock,
  User,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

type Mode = "login" | "register";
type RegisterStep = 1 | 2;

// ─────────────────────────────────────────────────────────────
// FLOATING DECORATIVE CARD
// ─────────────────────────────────────────────────────────────

function StatBubble({
  icon,
  label,
  value,
  className,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`absolute bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl border border-white/60 flex items-center gap-3 animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="w-9 h-9 rounded-xl bg-saas-primary/10 flex items-center justify-center text-saas-primary shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-saas-muted font-semibold uppercase tracking-wider leading-none">
          {label}
        </p>
        <p className="text-sm font-bold text-saas-dark mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LEFT PANEL — Brand & Illustration
// ─────────────────────────────────────────────────────────────

function LeftPanel() {
  return (
    <div className="hidden md:flex w-[45%] shrink-0 bg-saas-primary rounded-3xl p-10 flex-col justify-between relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full" />
      <div className="absolute -bottom-32 -right-16 w-80 h-80 bg-white/5 rounded-full" />
      <div className="absolute top-1/2 -right-10 w-32 h-32 bg-white/5 rounded-full" />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 backdrop-blur-sm">
          <HeartPulse className="w-6 h-6 text-white stroke-[2.5]" />
        </div>
        <div>
          <p className="text-white font-bold text-lg leading-none">PosyanduKita</p>
          <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest mt-0.5">
            Sistem Informasi
          </p>
        </div>
      </div>

      {/* Center content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
        <h2 className="text-white text-3xl font-extrabold leading-tight mb-4">
          Digitalisasi<br />
          Pelayanan<br />
          Posyandu
        </h2>
        <p className="text-white/70 text-sm font-medium leading-relaxed max-w-[240px]">
          Catat tumbuh kembang balita & kesehatan lansia secara digital, akurat, dan efisien.
        </p>

        {/* Floating Stat Cards */}
        <div className="relative h-48 mt-8">
          <StatBubble
            icon={<Baby className="w-4 h-4" />}
            label="Balita Terdaftar"
            value="Terdata rapi"
            className="left-0 top-0"
            delay={0}
          />
          <StatBubble
            icon={<Heart className="w-4 h-4" />}
            label="Pemeriksaan"
            value="Real-time"
            className="right-0 top-14"
            delay={1.5}
          />
          <StatBubble
            icon={<Users className="w-4 h-4" />}
            label="Lansia"
            value="Terpantau"
            className="left-4 bottom-0"
            delay={3}
          />
        </div>
      </div>

      {/* Decorative bottom shapes */}
      <div className="relative z-10 flex gap-2 opacity-20">
        <div className="w-10 h-10 border-2 border-white rounded-full" />
        <div className="w-10 h-10 border-2 border-white rounded-lg rotate-45" />
        <div className="w-10 h-10 border-2 border-white rounded-full" />
        <div className="w-10 h-10 border-2 border-white rounded-lg rotate-12" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// LOGIN FORM
// ─────────────────────────────────────────────────────────────

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login gagal, coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-saas-dark tracking-tight">Masuk</h1>
        <p className="text-sm text-saas-muted mt-1 font-medium">
          Selamat datang kembali, Kader Posyandu!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-saas-muted uppercase tracking-wider mb-1.5">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-saas-muted" />
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kader@posyandu.id"
              className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-gray-200 rounded-input text-sm text-saas-dark placeholder-saas-muted/60 focus:outline-none focus:border-saas-primary focus:ring-1 focus:ring-saas-primary/30 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-saas-muted uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-saas-muted" />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-canvas border border-gray-200 rounded-input text-sm text-saas-dark placeholder-saas-muted/60 focus:outline-none focus:border-saas-primary focus:ring-1 focus:ring-saas-primary/30 focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-saas-muted hover:text-saas-dark transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          id="btn-login-submit"
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-saas-primary text-white font-bold rounded-input shadow-lg shadow-teal-500/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Memproses...
            </>
          ) : (
            "MASUK"
          )}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-saas-muted font-medium">
          Belum punya posyandu terdaftar?{" "}
          <button
            id="btn-switch-to-register"
            onClick={onSwitch}
            className="text-saas-primary font-bold hover:underline transition-all"
          >
            Daftarkan Posyandu
          </button>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// REGISTER FORM — 2 Steps
// ─────────────────────────────────────────────────────────────

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const { registerPosyandu } = useAuth();
  const [step, setStep] = useState<RegisterStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Step 1 — Posyandu data
  const [namaPosyandu, setNamaPosyandu] = useState("");
  const [desa, setDesa] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [alamat, setAlamat] = useState("");

  // Step 2 — Kader (Owner) data
  const [namaKader, setNamaKader] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleStep1 = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!namaPosyandu.trim() || !desa.trim() || !kecamatan.trim() || !alamat.trim()) {
      setError("Semua field posyandu wajib diisi.");
      return;
    }
    setStep(2);
  };

  const handleStep2 = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!namaKader.trim() || !email.trim() || !password) {
      setError("Semua field akun wajib diisi.");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    setIsLoading(true);
    try {
      await registerPosyandu({ namaPosyandu, desa, kecamatan, alamat, namaKader, email, password });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registrasi gagal.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-saas-dark tracking-tight">
          Daftarkan Posyandu
        </h1>
        <p className="text-sm text-saas-muted mt-1 font-medium">
          Buat akun posyandu baru dalam 2 langkah mudah
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-7">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s
                  ? "bg-saas-primary text-white shadow-md shadow-teal-500/30"
                  : "bg-gray-100 text-saas-muted"
              }`}
            >
              {s}
            </div>
            {s < 2 && (
              <div
                className={`h-0.5 w-14 rounded-full transition-all ${
                  step > s ? "bg-saas-primary" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
        <span className="text-xs text-saas-muted font-semibold ml-2">
          {step === 1 ? "Data Posyandu" : "Akun Pengelola"}
        </span>
      </div>

      {/* STEP 1: Posyandu Data */}
      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-4">
          <InputField
            id="reg-nama-posyandu"
            icon={<Building2 className="w-4 h-4" />}
            label="Nama Posyandu"
            value={namaPosyandu}
            onChange={setNamaPosyandu}
            placeholder="contoh: Posyandu Sri Lestari"
          />
          <InputField
            id="reg-desa"
            icon={<MapPin className="w-4 h-4" />}
            label="Desa / Kelurahan"
            value={desa}
            onChange={setDesa}
            placeholder="contoh: Karanggayam"
          />
          <InputField
            id="reg-kecamatan"
            icon={<MapPin className="w-4 h-4" />}
            label="Kecamatan"
            value={kecamatan}
            onChange={setKecamatan}
            placeholder="contoh: Salaman"
          />
          <InputField
            id="reg-alamat"
            icon={<MapPin className="w-4 h-4" />}
            label="Alamat Lengkap"
            value={alamat}
            onChange={setAlamat}
            placeholder="contoh: Jl. Raya No. 1, RT 02/RW 03"
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold">
              {error}
            </div>
          )}

          <button
            id="btn-register-step1"
            type="submit"
            className="w-full py-3 bg-saas-primary text-white font-bold rounded-input shadow-lg shadow-teal-500/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
          >
            Selanjutnya <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* STEP 2: Kader Account */}
      {step === 2 && (
        <form onSubmit={handleStep2} className="space-y-4">
          <InputField
            id="reg-nama-kader"
            icon={<User className="w-4 h-4" />}
            label="Nama Pengelola (Anda)"
            value={namaKader}
            onChange={setNamaKader}
            placeholder="contoh: Ibu Aminah"
          />
          <InputField
            id="reg-email"
            icon={<Mail className="w-4 h-4" />}
            label="Email"
            value={email}
            onChange={setEmail}
            type="email"
            placeholder="kader@posyandu.id"
          />
          <div>
            <label className="block text-xs font-bold text-saas-muted uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-saas-muted" />
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 karakter"
                className="w-full pl-10 pr-10 py-2.5 bg-canvas border border-gray-200 rounded-input text-sm text-saas-dark placeholder-saas-muted/60 focus:outline-none focus:border-saas-primary focus:ring-1 focus:ring-saas-primary/30 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-saas-muted hover:text-saas-dark transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <InputField
            id="reg-confirm-password"
            icon={<Lock className="w-4 h-4" />}
            label="Konfirmasi Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            type="password"
            placeholder="Ulangi password"
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <button
              id="btn-register-back"
              type="button"
              onClick={() => { setStep(1); setError(null); }}
              className="flex-1 py-3 border border-gray-200 text-saas-dark font-bold rounded-input hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
            <button
              id="btn-register-submit"
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-saas-primary text-white font-bold rounded-input shadow-lg shadow-teal-500/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Membuat...</>
              ) : (
                "DAFTAR"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Switch to Login */}
      <div className="mt-8 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-saas-muted font-medium">
          Sudah punya akun?{" "}
          <button
            id="btn-switch-to-login"
            onClick={onSwitch}
            className="text-saas-primary font-bold hover:underline transition-all"
          >
            Masuk di sini
          </button>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// REUSABLE INPUT FIELD
// ─────────────────────────────────────────────────────────────

function InputField({
  id,
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-bold text-saas-muted uppercase tracking-wider mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-saas-muted">{icon}</span>
        <input
          id={id}
          type={type}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 bg-canvas border border-gray-200 rounded-input text-sm text-saas-dark placeholder-saas-muted/60 focus:outline-none focus:border-saas-primary focus:ring-1 focus:ring-saas-primary/30 focus:bg-white transition-all"
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");

  return (
    <>
      {/* Inject float animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>

      <div className="min-h-screen bg-canvas flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Ambient glow */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-saas-primary/6 rounded-full blur-3xl" />
        </div>

        {/* Card */}
        <div className="relative w-full max-w-4xl bg-white rounded-[28px] p-3 flex shadow-2xl shadow-black/10 min-h-[600px] overflow-hidden border border-gray-100">

          {/* Left colored panel */}
          <LeftPanel />

          {/* Right form panel */}
          <div className="flex-1 flex flex-col justify-center px-8 py-10 min-w-0">
            {/* Mobile logo */}
            <div className="md:hidden flex items-center gap-2.5 mb-8">
              <div className="w-9 h-9 rounded-xl bg-saas-primary flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-saas-dark text-base">PosyanduKita</span>
            </div>

            {/* Form switch animation */}
            {mode === "login" ? (
              <LoginForm onSwitch={() => setMode("register")} />
            ) : (
              <RegisterForm onSwitch={() => setMode("login")} />
            )}

            {/* Footer */}
            <p className="text-center text-[11px] text-saas-muted font-medium mt-8">
              © 2026 PosyanduKita · Sistem Informasi Posyandu
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
