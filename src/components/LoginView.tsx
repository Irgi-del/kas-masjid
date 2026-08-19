'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Building2, Lock, User as UserIcon, AlertCircle, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { MosqueSettings } from '@/types';

interface LoginViewProps {
  settings: MosqueSettings;
}

export const LoginView: React.FC<LoginViewProps> = ({ settings }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!username || !password) {
      setErrorMessage('Mohon isi username dan password.');
      return;
    }

    setLoading(true);
    const res = await login(username, password, remember);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Username atau password tidak sesuai.');
    }
  };

  const fillDemoAccount = (demoUser: string, demoPass: string) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-600/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-2xl shadow-emerald-500/20 ring-4 ring-emerald-500/20">
            <Building2 className="w-9 h-9 stroke-[2.2]" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-white">
          {settings.nama_masjid || 'Sistem Keuangan Masjid'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Masuk ke akun DKM / Bendahara Keuangan
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 backdrop-blur-xl">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMessage}</p>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Username / Email
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <UserIcon className="h-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username atau email"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="block w-full pl-10 pr-10 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 h-4" /> : <Eye className="h-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-300">
                  Ingat saya
                </label>
              </div>

              <div className="text-xs">
                <button
                  type="button"
                  onClick={() => alert('Fitur reset password dapat menghubungi Bendahara Utama / Admin DKM.')}
                  className="font-medium text-emerald-400 hover:text-emerald-300"
                >
                  Lupa password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-900/30 border border-emerald-400/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <span>Memvalidasi...</span>
                ) : (
                  <>
                    <span>Masuk</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Login Preset */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-xs text-slate-400 text-center font-medium mb-3 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Demo Akun (Klik untuk Uji Coba Quick Login)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fillDemoAccount('admin', 'admin123')}
                className="px-3 py-2 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl transition text-center"
              >
                Admin (Full Access)
                <span className="block font-mono text-[10px] text-slate-400 mt-0.5">admin / admin123</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('pengurus', 'pengurus123')}
                className="px-3 py-2 text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl transition text-center"
              >
                Viewer (Pengurus)
                <span className="block font-mono text-[10px] text-slate-400 mt-0.5">pengurus / pengurus123</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
