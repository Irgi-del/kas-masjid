'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Receipt, 
  BarChart3, 
  PieChart, 
  Settings, 
  FolderTree, 
  Users, 
  Building, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export type ActiveTab = 
  | 'dashboard' 
  | 'transaksi_semua' 
  | 'pemasukan' 
  | 'pengeluaran' 
  | 'laporan_keuangan' 
  | 'laporan_rekap' 
  | 'pengaturan_kategori' 
  | 'pengaturan_pengguna' 
  | 'pengaturan_masjid';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  openTransactionModal?: (type: 'Pemasukan' | 'Pengeluaran') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, openTransactionModal }) => {
  const { logout, isAdmin } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [transaksiOpen, setTransaksiOpen] = useState(true);
  const [laporanOpen, setLaporanOpen] = useState(true);
  const [pengaturanOpen, setPengaturanOpen] = useState(true);

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  const navItemClass = (tab: ActiveTab) =>
    `flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer ${
      activeTab === tab
        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20 font-semibold'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-r border-slate-800">
      {/* Header Brand */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-sm">
            KM
          </div>
          <span className="font-bold text-base text-slate-100 tracking-wide">MASJID FINANCE</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {/* Dashboard */}
        <div>
          <button
            onClick={() => handleSelectTab('dashboard')}
            className={`w-full ${navItemClass('dashboard')}`}
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-400" />
            <span>Dashboard</span>
          </button>
        </div>

        {/* Transaksi Section */}
        <div className="space-y-1">
          <button
            onClick={() => setTransaksiOpen(!transaksiOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200"
          >
            <span className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              Transaksi
            </span>
            {transaksiOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {transaksiOpen && (
            <div className="pl-4 space-y-1 border-l border-slate-800 ml-3">
              <button
                onClick={() => handleSelectTab('transaksi_semua')}
                className={`w-full ${navItemClass('transaksi_semua')}`}
              >
                <Receipt className="w-4 h-4 text-slate-400" />
                <span>Semua Transaksi</span>
              </button>

              <button
                onClick={() => {
                  if (openTransactionModal && isAdmin) openTransactionModal('Pemasukan');
                  handleSelectTab('pemasukan');
                }}
                className={`w-full ${navItemClass('pemasukan')}`}
              >
                <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
                <span>Pemasukan</span>
              </button>

              <button
                onClick={() => {
                  if (openTransactionModal && isAdmin) openTransactionModal('Pengeluaran');
                  handleSelectTab('pengeluaran');
                }}
                className={`w-full ${navItemClass('pengeluaran')}`}
              >
                <ArrowUpCircle className="w-4 h-4 text-red-400" />
                <span>Pengeluaran</span>
              </button>
            </div>
          )}
        </div>

        {/* Laporan Section */}
        <div className="space-y-1">
          <button
            onClick={() => setLaporanOpen(!laporanOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200"
          >
            <span className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-400" />
              Laporan
            </span>
            {laporanOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {laporanOpen && (
            <div className="pl-4 space-y-1 border-l border-slate-800 ml-3">
              <button
                onClick={() => handleSelectTab('laporan_keuangan')}
                className={`w-full ${navItemClass('laporan_keuangan')}`}
              >
                <BarChart3 className="w-4 h-4 text-slate-400" />
                <span>Laporan Keuangan</span>
              </button>

              <button
                onClick={() => handleSelectTab('laporan_rekap')}
                className={`w-full ${navItemClass('laporan_rekap')}`}
              >
                <PieChart className="w-4 h-4 text-teal-400" />
                <span>Rekap Kategori</span>
              </button>
            </div>
          )}
        </div>

        {/* Pengaturan Section */}
        <div className="space-y-1">
          <button
            onClick={() => setPengaturanOpen(!pengaturanOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200"
          >
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-400" />
              Pengaturan
            </span>
            {pengaturanOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {pengaturanOpen && (
            <div className="pl-4 space-y-1 border-l border-slate-800 ml-3">
              <button
                onClick={() => handleSelectTab('pengaturan_kategori')}
                className={`w-full ${navItemClass('pengaturan_kategori')}`}
              >
                <FolderTree className="w-4 h-4 text-slate-400" />
                <span>Kategori</span>
              </button>

              <button
                onClick={() => handleSelectTab('pengaturan_pengguna')}
                className={`w-full ${navItemClass('pengaturan_pengguna')}`}
              >
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Pengguna</span>
              </button>

              <button
                onClick={() => handleSelectTab('pengaturan_masjid')}
                className={`w-full ${navItemClass('pengaturan_masjid')}`}
              >
                <Building className="w-4 h-4 text-blue-400" />
                <span>Profil Masjid</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-xl border border-slate-800 hover:border-red-500/30 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Floating Button */}
      <div className="md:hidden fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center border border-emerald-400/40"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 min-h-[calc(100vh-4rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative flex-1 max-w-xs w-full bg-slate-900 z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
