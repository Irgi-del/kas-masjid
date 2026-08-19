'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { MosqueSettings } from '@/types';
import { Building2, LogOut, ShieldCheck, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  settings: MosqueSettings;
}

export const Navbar: React.FC<NavbarProps> = ({ settings }) => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Mosque Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/30">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <Building2 className="w-6 h-6" />
              )}
            </div>
            <div>
              <h1 className="font-bold text-lg leading-snug tracking-wide text-slate-100 flex items-center gap-2">
                {settings.nama_masjid || 'Sistem Keuangan Masjid'}
              </h1>
              <p className="text-xs text-slate-400 font-medium">Sistem Keuangan DKM & Bendahara</p>
            </div>
          </div>

          {/* User Profile & Actions */}
          {user && (
            <div className="flex items-center space-x-4">
              {/* Role Badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                isAdmin 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {user.role}
              </span>

              {/* User Name */}
              <div className="hidden sm:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <UserIcon className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-200">{user.nama}</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-slate-700 hover:border-red-500/30 transition-colors"
                title="Keluar dari sistem"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
