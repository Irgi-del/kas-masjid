'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MosqueSettings, Transaction, Category, User, TransactionType } from '@/types';
import { 
  getMosqueSettings, 
  updateMosqueSettings, 
  getCategories, 
  addCategory, 
  updateCategory, 
  getTransactions, 
  addTransaction, 
  updateTransaction, 
  cancelTransaction, 
  getUsers, 
  addUser, 
  updateUser 
} from '@/lib/data-service';

import { LoginView } from '@/components/LoginView';
import { Navbar } from '@/components/Navbar';
import { Sidebar, ActiveTab } from '@/components/Sidebar';
import { DashboardView } from '@/components/DashboardView';
import { TransactionFormModal } from '@/components/TransactionFormModal';
import { TransactionHistoryView } from '@/components/TransactionHistoryView';
import { ReportView } from '@/components/ReportView';
import { CategoryManagementView } from '@/components/CategoryManagementView';
import { SettingsView } from '@/components/SettingsView';
import { UserManagementView } from '@/components/UserManagementView';

export default function Home() {
  const { user, isLoading } = useAuth();

  // Active View Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Application Data States
  const [settings, setSettings] = useState<MosqueSettings>({
    nama_masjid: 'Masjid Al-Ikhlas',
    alamat: 'Jl. Masjid Raya No. 123, Jakarta',
    logo_url: '',
    saldo_awal: 10000000,
    tanggal_saldo_awal: '2026-08-01',
    nama_ketua: 'H. Ahmad Dahlan, S.Ag',
    nama_bendahara: 'H. Muhammad Yusuf',
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);

  // Modal Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('Pemasukan');
  const [editTrxData, setEditTrxData] = useState<Transaction | null>(null);

  // Initial Data Loader
  const loadData = async () => {
    try {
      const [stg, trxs, cats, usrs] = await Promise.all([
        getMosqueSettings(),
        getTransactions(),
        getCategories(),
        getUsers(),
      ]);
      setSettings(stg);
      setTransactions(trxs);
      setCategories(cats);
      setUsersList(usrs);
    } catch (e) {
      console.error('Data loading error:', e);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Modal Handlers
  const handleOpenTransactionModal = (type: TransactionType, editData?: Transaction) => {
    setModalType(type);
    setEditTrxData(editData || null);
    setModalOpen(true);
  };

  const handleSaveTransaction = async (trxData: Partial<Transaction>) => {
    if (editTrxData) {
      const updated = await updateTransaction({
        ...editTrxData,
        ...trxData,
      } as Transaction);
      setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
    } else {
      const created = await addTransaction(trxData as any);
      setTransactions(prev => [created, ...prev]);
    }
  };

  const handleCancelTransaction = async (id: string) => {
    await cancelTransaction(id);
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'Dibatalkan' as const } : t));
  };

  const handleSaveSettings = async (newSettings: MosqueSettings) => {
    const updated = await updateMosqueSettings(newSettings);
    setSettings(updated);
  };

  const handleAddCategory = async (cat: Omit<Category, 'id'>) => {
    const created = await addCategory(cat);
    setCategories(prev => [...prev, created]);
  };

  const handleUpdateCategory = async (cat: Category) => {
    const updated = await updateCategory(cat);
    setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleAddUser = async (u: Omit<User, 'id'>) => {
    const created = await addUser(u);
    setUsersList(prev => [...prev, created]);
  };

  const handleUpdateUser = async (u: User) => {
    const updated = await updateUser(u);
    setUsersList(prev => prev.map(usr => usr.id === updated.id ? updated : usr));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-400">Memuat Sistem Keuangan Masjid...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView settings={settings} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar settings={settings} />

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openTransactionModal={handleOpenTransactionModal}
        />

        {/* Dynamic Content View */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              settings={settings}
              transactions={transactions}
              onOpenModal={handleOpenTransactionModal}
              onViewHistory={() => setActiveTab('transaksi_semua')}
              onViewDetail={(trx) => {
                setActiveTab('transaksi_semua');
              }}
            />
          )}

          {activeTab === 'transaksi_semua' && (
            <TransactionHistoryView
              transactions={transactions}
              categories={categories}
              onOpenModal={handleOpenTransactionModal}
              onCancelTransaction={handleCancelTransaction}
              initialTypeFilter="Semua"
            />
          )}

          {activeTab === 'pemasukan' && (
            <TransactionHistoryView
              transactions={transactions}
              categories={categories}
              onOpenModal={handleOpenTransactionModal}
              onCancelTransaction={handleCancelTransaction}
              initialTypeFilter="Pemasukan"
            />
          )}

          {activeTab === 'pengeluaran' && (
            <TransactionHistoryView
              transactions={transactions}
              categories={categories}
              onOpenModal={handleOpenTransactionModal}
              onCancelTransaction={handleCancelTransaction}
              initialTypeFilter="Pengeluaran"
            />
          )}

          {activeTab === 'laporan_keuangan' && (
            <ReportView
              settings={settings}
              transactions={transactions}
              initialMode="keuangan"
            />
          )}

          {activeTab === 'laporan_rekap' && (
            <ReportView
              settings={settings}
              transactions={transactions}
              initialMode="rekap"
            />
          )}

          {activeTab === 'pengaturan_kategori' && (
            <CategoryManagementView
              categories={categories}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
            />
          )}

          {activeTab === 'pengaturan_pengguna' && (
            <UserManagementView
              users={usersList}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
            />
          )}

          {activeTab === 'pengaturan_masjid' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}
        </main>
      </div>

      {/* Transaction Form Modal (Pemasukan / Pengeluaran) */}
      <TransactionFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        categories={categories}
        onSubmit={handleSaveTransaction}
        editData={editTrxData}
        onCategoryAdded={loadData}
      />
    </div>
  );
}
