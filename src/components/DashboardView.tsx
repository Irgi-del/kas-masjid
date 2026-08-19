'use client';

import React from 'react';
import { Transaction, MosqueSettings } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { 
  Wallet, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Receipt, 
  PlusCircle, 
  MinusCircle, 
  Calendar,
  Eye,
  TrendingUp,
  Tag
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

interface DashboardViewProps {
  settings: MosqueSettings;
  transactions: Transaction[];
  onOpenModal: (type: 'Pemasukan' | 'Pengeluaran') => void;
  onViewHistory: () => void;
  onViewDetail: (trx: Transaction) => void;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const COLORS_INCOME = ['#10b981', '#059669', '#047857', '#34d399', '#6ee7b7', '#a7f3d0', '#0284c7', '#38bdf8'];
const COLORS_EXPENSE = ['#ef4444', '#dc2626', '#b91c1c', '#f87171', '#f59e0b', '#d97706', '#8b5cf6', '#a855f7'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  settings,
  transactions,
  onOpenModal,
  onViewHistory,
  onViewDetail,
}) => {
  const { isAdmin } = useAuth();

  // Filter active transactions
  const activeTransactions = transactions.filter(t => t.status === 'Aktif');

  // Calculations
  const totalPemasukan = activeTransactions
    .filter(t => t.jenis === 'Pemasukan')
    .reduce((sum, t) => sum + Number(t.nominal), 0);

  const totalPengeluaran = activeTransactions
    .filter(t => t.jenis === 'Pengeluaran')
    .reduce((sum, t) => sum + Number(t.nominal), 0);

  const saldoSaatIni = (Number(settings.saldo_awal) || 0) + totalPemasukan - totalPengeluaran;
  const totalCount = activeTransactions.length;

  // Latest Pemasukan & Pengeluaran (Top 5 each)
  const latestPemasukan = activeTransactions
    .filter(t => t.jenis === 'Pemasukan')
    .slice(0, 5);

  const latestPengeluaran = activeTransactions
    .filter(t => t.jenis === 'Pengeluaran')
    .slice(0, 5);

  // Rekap Pemasukan per Kategori
  const rekapPemasukanMap: Record<string, number> = {};
  activeTransactions
    .filter(t => t.jenis === 'Pemasukan')
    .forEach(t => {
      rekapPemasukanMap[t.kategori_nama] = (rekapPemasukanMap[t.kategori_nama] || 0) + Number(t.nominal);
    });

  const chartPemasukanData = Object.entries(rekapPemasukanMap).map(([name, value]) => ({ name, value }));

  // Rekap Pengeluaran per Kategori
  const rekapPengeluaranMap: Record<string, number> = {};
  activeTransactions
    .filter(t => t.jenis === 'Pengeluaran')
    .forEach(t => {
      rekapPengeluaranMap[t.kategori_nama] = (rekapPengeluaranMap[t.kategori_nama] || 0) + Number(t.nominal);
    });

  const chartPengeluaranData = Object.entries(rekapPengeluaranMap).map(([name, value]) => ({ name, value }));

  // Monthly Comparison Bar Chart Data
  const monthlyDataMap: Record<string, { bulan: string; masuk: number; keluar: number }> = {};
  activeTransactions.forEach(t => {
    const monthKey = t.tanggal.substring(0, 7); // YYYY-MM
    const dateObj = new Date(t.tanggal);
    const monthLabel = dateObj.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
    if (!monthlyDataMap[monthKey]) {
      monthlyDataMap[monthKey] = { bulan: monthLabel, masuk: 0, keluar: 0 };
    }
    if (t.jenis === 'Pemasukan') monthlyDataMap[monthKey].masuk += Number(t.nominal);
    if (t.jenis === 'Pengeluaran') monthlyDataMap[monthKey].keluar += Number(t.nominal);
  });

  const barChartData = Object.values(monthlyDataMap).reverse();

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Dashboard Keuangan
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ringkasan kas, pemasukan, pengeluaran & grafik keuangan masjid.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenModal('Pemasukan')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-900/30 border border-emerald-400/30 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Pemasukan</span>
            </button>
            <button
              onClick={() => onOpenModal('Pengeluaran')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 shadow-lg shadow-red-900/30 border border-red-400/30 transition-all cursor-pointer"
            >
              <MinusCircle className="w-4 h-4" />
              <span>- Pengeluaran</span>
            </button>
          </div>
        )}
      </div>

      {/* 4 STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Saldo Saat Ini */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Saldo Saat Ini</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {formatRupiah(saldoSaatIni)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Termasuk Saldo Awal: {formatRupiah(Number(settings.saldo_awal) || 0)}
          </p>
        </div>

        {/* Card 2: Total Pemasukan */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">Total Pemasukan</span>
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {formatRupiah(totalPemasukan)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Dari {activeTransactions.filter(t => t.jenis === 'Pemasukan').length} transaksi pemasukan
          </p>
        </div>

        {/* Card 3: Total Pengeluaran */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Total Pengeluaran</span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {formatRupiah(totalPengeluaran)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Dari {activeTransactions.filter(t => t.jenis === 'Pengeluaran').length} transaksi pengeluaran
          </p>
        </div>

        {/* Card 4: Jumlah Transaksi */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Jumlah Transaksi</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">
            {totalCount} <span className="text-sm font-normal text-slate-400">transaksi</span>
          </div>
          <button
            onClick={onViewHistory}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium mt-2 flex items-center gap-1"
          >
            Lihat semua riwayat →
          </button>
        </div>
      </div>

      {/* MONTHLY ARROW BAR CHART */}
      {barChartData.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Grafik Pemasukan vs Pengeluaran
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="bulan" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `Rp${v / 1000000}M`} />
                <Tooltip
                  formatter={(value: any) => [formatRupiah(Number(value)), '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }}
                />
                <Bar dataKey="masuk" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="keluar" name="Pengeluaran" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* CATEGORY BREAKDOWN CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rekap Pemasukan per Kategori */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-400" />
              Rekap Pemasukan per Kategori
            </h3>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              {formatRupiah(totalPemasukan)}
            </span>
          </div>

          {chartPemasukanData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="h-48 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={chartPemasukanData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                    >
                      {chartPemasukanData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_INCOME[index % COLORS_INCOME.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatRupiah(Number(value))} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {chartPemasukanData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS_INCOME[idx % COLORS_INCOME.length] }}
                      />
                      <span className="text-slate-300 truncate">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-100">{formatRupiah(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs">Belum ada data pemasukan</div>
          )}
        </div>

        {/* Rekap Pengeluaran per Kategori */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-rose-400" />
              Rekap Pengeluaran per Kategori
            </h3>
            <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              {formatRupiah(totalPengeluaran)}
            </span>
          </div>

          {chartPengeluaranData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="h-48 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={chartPengeluaranData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                    >
                      {chartPengeluaranData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_EXPENSE[index % COLORS_EXPENSE.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatRupiah(Number(value))} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {chartPengeluaranData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: COLORS_EXPENSE[idx % COLORS_EXPENSE.length] }}
                      />
                      <span className="text-slate-300 truncate">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-100">{formatRupiah(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs">Belum ada data pengeluaran</div>
          )}
        </div>
      </div>

      {/* LATEST TRANSACTIONS TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pemasukan Terbaru */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
              Pemasukan Terbaru
            </h3>
            <button
              onClick={onViewHistory}
              className="text-xs text-emerald-400 hover:underline font-medium"
            >
              Lihat Semua
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-2.5 rounded-l-lg">Tanggal</th>
                  <th className="p-2.5">Kategori</th>
                  <th className="p-2.5">Keterangan</th>
                  <th className="p-2.5 text-right rounded-r-lg">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {latestPemasukan.length > 0 ? (
                  latestPemasukan.map(t => (
                    <tr
                      key={t.id}
                      onClick={() => onViewDetail(t)}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="p-2.5 text-slate-300 font-mono">{t.tanggal}</td>
                      <td className="p-2.5 text-emerald-400 font-medium">{t.kategori_nama}</td>
                      <td className="p-2.5 text-slate-300 max-w-[150px] truncate">{t.keterangan}</td>
                      <td className="p-2.5 text-right font-bold text-emerald-400">
                        +{formatRupiah(t.nominal)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500">
                      Belum ada transaksi pemasukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pengeluaran Terbaru */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ArrowUpCircle className="w-4 h-4 text-rose-400" />
              Pengeluaran Terbaru
            </h3>
            <button
              onClick={onViewHistory}
              className="text-xs text-rose-400 hover:underline font-medium"
            >
              Lihat Semua
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="p-2.5 rounded-l-lg">Tanggal</th>
                  <th className="p-2.5">Kategori</th>
                  <th className="p-2.5">Keterangan</th>
                  <th className="p-2.5 text-right rounded-r-lg">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {latestPengeluaran.length > 0 ? (
                  latestPengeluaran.map(t => (
                    <tr
                      key={t.id}
                      onClick={() => onViewDetail(t)}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="p-2.5 text-slate-300 font-mono">{t.tanggal}</td>
                      <td className="p-2.5 text-rose-400 font-medium">{t.kategori_nama}</td>
                      <td className="p-2.5 text-slate-300 max-w-[150px] truncate">{t.keterangan}</td>
                      <td className="p-2.5 text-right font-bold text-rose-400">
                        -{formatRupiah(t.nominal)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500">
                      Belum ada transaksi pengeluaran.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
