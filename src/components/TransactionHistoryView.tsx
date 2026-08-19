'use client';

import React, { useState } from 'react';
import { Category, Transaction, TransactionType } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  XCircle, 
  PlusCircle, 
  MinusCircle,
  Calendar,
  Tag,
  ArrowDownCircle,
  ArrowUpCircle,
  FileCheck
} from 'lucide-react';
import { TransactionDetailModal } from './TransactionDetailModal';

interface TransactionHistoryViewProps {
  transactions: Transaction[];
  categories: Category[];
  onOpenModal: (type: TransactionType, editData?: Transaction) => void;
  onCancelTransaction: (id: string) => Promise<void>;
  initialTypeFilter?: string;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const TransactionHistoryView: React.FC<TransactionHistoryViewProps> = ({
  transactions,
  categories,
  onOpenModal,
  onCancelTransaction,
  initialTypeFilter = 'Semua',
}) => {
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>(initialTypeFilter);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [detailModalTrx, setDetailModalTrx] = useState<Transaction | null>(null);

  // Filter transactions
  const filteredTransactions = transactions.filter((trx) => {
    // Search query
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      trx.trx_code.toLowerCase().includes(query) ||
      trx.keterangan.toLowerCase().includes(query) ||
      trx.kategori_nama.toLowerCase().includes(query) ||
      trx.user_nama.toLowerCase().includes(query);

    // Type filter
    const matchesType = selectedType === 'Semua' || trx.jenis === selectedType;

    // Category filter
    const matchesCategory = selectedCategory === 'Semua' || trx.kategori_nama === selectedCategory;

    // Date range filter
    const matchesStartDate = !startDate || trx.tanggal >= startDate;
    const matchesEndDate = !endDate || trx.tanggal <= endDate;

    return matchesSearch && matchesType && matchesCategory && matchesStartDate && matchesEndDate;
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('Semua');
    setSelectedCategory('Semua');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Riwayat Transaksi Keuangan
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Daftar lengkap seluruh arus kas pemasukan & pengeluaran masjid.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenModal('Pemasukan')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Pemasukan</span>
            </button>
            <button
              onClick={() => onOpenModal('Pengeluaran')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md transition"
            >
              <MinusCircle className="w-4 h-4" />
              <span>- Pengeluaran</span>
            </button>
          </div>
        )}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="md:col-span-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi / ket..."
              className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Filter Jenis */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Semua">Semua Jenis Arus Kas</option>
              <option value="Pemasukan">Pemasukan (Masuk)</option>
              <option value="Pengeluaran">Pengeluaran (Keluar)</option>
            </select>
          </div>

          {/* Filter Kategori */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Semua">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.nama_kategori}>
                  {c.jenis}: {c.nama_kategori}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              title="Tanggal Mulai"
            />
            <span className="text-slate-500 text-xs">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              title="Tanggal Akhir"
            />
          </div>
        </div>

        {(searchQuery || selectedType !== 'Semua' || selectedCategory !== 'Semua' || startDate || endDate) && (
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Ditemukan <strong>{filteredTransactions.length}</strong> transaksi</span>
            <button
              onClick={handleResetFilters}
              className="text-emerald-400 hover:underline font-semibold"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* TABLE RIWAYAT TRANSAKSI */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800 text-slate-300 uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="p-3.5">Tanggal</th>
                <th className="p-3.5">Jenis</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Keterangan</th>
                <th className="p-3.5 text-right text-emerald-400">Masuk</th>
                <th className="p-3.5 text-right text-rose-400">Keluar</th>
                <th className="p-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((trx) => {
                  const isCanceled = trx.status === 'Dibatalkan';
                  return (
                    <tr
                      key={trx.id}
                      className={`hover:bg-slate-800/50 transition-colors ${
                        isCanceled ? 'opacity-50 line-through bg-slate-950/40' : ''
                      }`}
                    >
                      <td className="p-3.5 font-mono text-slate-300 whitespace-nowrap">
                        {trx.tanggal}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          trx.jenis === 'Pemasukan'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {trx.jenis === 'Pemasukan' ? <ArrowDownCircle className="w-3 h-3" /> : <ArrowUpCircle className="w-3 h-3" />}
                          {trx.jenis}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-200 whitespace-nowrap">
                        {trx.kategori_nama}
                      </td>
                      <td className="p-3.5 text-slate-300 max-w-xs truncate">
                        {trx.keterangan}
                        {trx.bukti_url && (
                          <span className="ml-1.5 inline-block text-[10px] text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">
                            Bukti Ada
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right font-bold text-emerald-400 whitespace-nowrap">
                        {trx.jenis === 'Pemasukan' ? formatRupiah(trx.nominal) : '-'}
                      </td>
                      <td className="p-3.5 text-right font-bold text-rose-400 whitespace-nowrap">
                        {trx.jenis === 'Pengeluaran' ? formatRupiah(trx.nominal) : '-'}
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* Detail Button */}
                          <button
                            onClick={() => setDetailModalTrx(trx)}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition"
                            title="Lihat Detail Transaksi"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Admin Actions */}
                          {isAdmin && !isCanceled && (
                            <>
                              <button
                                onClick={() => onOpenModal(trx.jenis, trx)}
                                className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition"
                                title="Edit Transaksi"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Batalkan transaksi ${trx.trx_code}?`)) {
                                    onCancelTransaction(trx.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                                title="Batalkan Transaksi"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Tidak ditemukan data transaksi yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <TransactionDetailModal
        transaction={detailModalTrx}
        onClose={() => setDetailModalTrx(null)}
      />
    </div>
  );
};
