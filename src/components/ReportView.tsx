'use client';

import React, { useState } from 'react';
import { Transaction, MosqueSettings, PeriodFilter, CategoryRecap } from '@/types';
import { 
  FileText, 
  Download, 
  Calendar, 
  Printer, 
  Wallet, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Filter,
  CheckCircle2
} from 'lucide-react';
import { generateDocxReport } from '@/lib/docx-exporter';
import { exportTransactionsToCSV } from '@/lib/csv-exporter';

interface ReportViewProps {
  settings: MosqueSettings;
  transactions: Transaction[];
  initialMode?: 'keuangan' | 'rekap';
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

export const ReportView: React.FC<ReportViewProps> = ({ settings, transactions, initialMode = 'keuangan' }) => {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('bulan_ini');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [downloadingDocx, setDownloadingDocx] = useState(false);

  // Compute Period Range Dates
  const now = new Date();
  let startDateStr = '';
  let endDateStr = '';
  let periodeLabel = '';

  if (periodFilter === 'hari_ini') {
    const today = now.toISOString().split('T')[0];
    startDateStr = today;
    endDateStr = today;
    periodeLabel = formatDateIndo(today);
  } else if (periodFilter === 'minggu_ini') {
    const first = now.getDate() - now.getDay();
    const firstDay = new Date(now.setDate(first));
    const lastDay = new Date(now.setDate(first + 6));
    startDateStr = firstDay.toISOString().split('T')[0];
    endDateStr = lastDay.toISOString().split('T')[0];
    periodeLabel = `${formatDateIndo(startDateStr)} s/d ${formatDateIndo(endDateStr)}`;
  } else if (periodFilter === 'bulan_ini') {
    const y = now.getFullYear();
    const m = now.getMonth();
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);
    startDateStr = firstDay.toISOString().split('T')[0];
    endDateStr = lastDay.toISOString().split('T')[0];
    periodeLabel = `${formatDateIndo(startDateStr)} – ${formatDateIndo(endDateStr)}`;
  } else if (periodFilter === 'bulan_sebelumnya') {
    const y = now.getFullYear();
    const m = now.getMonth() - 1;
    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);
    startDateStr = firstDay.toISOString().split('T')[0];
    endDateStr = lastDay.toISOString().split('T')[0];
    periodeLabel = `${formatDateIndo(startDateStr)} – ${formatDateIndo(endDateStr)}`;
  } else if (periodFilter === 'tahun_ini') {
    const y = now.getFullYear();
    startDateStr = `${y}-01-01`;
    endDateStr = `${y}-12-31`;
    periodeLabel = `Tahun ${y}`;
  } else if (periodFilter === 'custom') {
    startDateStr = customStartDate;
    endDateStr = customEndDate;
    periodeLabel = customStartDate && customEndDate 
      ? `${formatDateIndo(customStartDate)} s/d ${formatDateIndo(customEndDate)}`
      : 'Custom Periode';
  }

  // Filter Active Transactions in Period
  const periodTransactions = transactions.filter((t) => {
    if (t.status !== 'Aktif') return false;
    if (startDateStr && t.tanggal < startDateStr) return false;
    if (endDateStr && t.tanggal > endDateStr) return false;
    return true;
  });

  // Calculate Totals
  const totalPemasukan = periodTransactions
    .filter((t) => t.jenis === 'Pemasukan')
    .reduce((sum, t) => sum + Number(t.nominal), 0);

  const totalPengeluaran = periodTransactions
    .filter((t) => t.jenis === 'Pengeluaran')
    .reduce((sum, t) => sum + Number(t.nominal), 0);

  const saldoAwal = Number(settings.saldo_awal) || 0;
  const saldoAkhir = saldoAwal + totalPemasukan - totalPengeluaran;

  const financialSummary = {
    saldo_awal: saldoAwal,
    total_pemasukan: totalPemasukan,
    total_pengeluaran: totalPengeluaran,
    saldo_akhir: saldoAkhir,
    total_transaksi: periodTransactions.length,
  };

  // Rekap Pemasukan per Kategori
  const pemasukanMap: Record<string, number> = {};
  periodTransactions
    .filter((t) => t.jenis === 'Pemasukan')
    .forEach((t) => {
      pemasukanMap[t.kategori_nama] = (pemasukanMap[t.kategori_nama] || 0) + Number(t.nominal);
    });

  const rekapPemasukan: CategoryRecap[] = Object.entries(pemasukanMap).map(([kategori, jumlah], i) => ({
    no: i + 1,
    kategori,
    jumlah,
    jenis: 'Pemasukan',
  }));

  // Rekap Pengeluaran per Kategori
  const pengeluaranMap: Record<string, number> = {};
  periodTransactions
    .filter((t) => t.jenis === 'Pengeluaran')
    .forEach((t) => {
      pengeluaranMap[t.kategori_nama] = (pengeluaranMap[t.kategori_nama] || 0) + Number(t.nominal);
    });

  const rekapPengeluaran: CategoryRecap[] = Object.entries(pengeluaranMap).map(([kategori, jumlah], i) => ({
    no: i + 1,
    kategori,
    jumlah,
    jenis: 'Pengeluaran',
  }));

  // Export Handlers
  const handleDownloadDocx = async () => {
    setDownloadingDocx(true);
    try {
      await generateDocxReport({
        settings,
        periodeLabel,
        summary: financialSummary,
        rekapPemasukan,
        rekapPengeluaran,
        transactions: periodTransactions,
      });
    } catch (e) {
      console.error(e);
      alert('Gagal membuat dokumen Word DOCX.');
    } finally {
      setDownloadingDocx(false);
    }
  };

  const handleDownloadCSV = () => {
    const filename = `Laporan_CSV_${settings.nama_masjid.replace(/\s+/g, '_')}_${periodeLabel.replace(/\s+/g, '_')}.csv`;
    exportTransactionsToCSV(periodTransactions, filename);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Laporan Keuangan Masjid
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Generate & unduh laporan keuangan resmi periode tertentu (.DOCX & .CSV).
          </p>
        </div>

        {/* Download Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadDocx}
            disabled={downloadingDocx}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg border border-blue-400/30 transition cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-4 h-4 text-blue-200" />
            <span>{downloadingDocx ? 'Generating...' : '📄 Download DOCX'}</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg border border-emerald-400/30 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-200" />
            <span>📊 Download CSV</span>
          </button>
        </div>
      </div>

      {/* PERIODE FILTER BAR */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Pilih Periode:
          </span>

          {[
            { id: 'hari_ini', label: 'Hari Ini' },
            { id: 'minggu_ini', label: 'Minggu Ini' },
            { id: 'bulan_ini', label: 'Bulan Ini' },
            { id: 'bulan_sebelumnya', label: 'Bulan Sebelumnya' },
            { id: 'tahun_ini', label: 'Tahun Ini' },
            { id: 'custom', label: 'Custom Periode' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setPeriodFilter(btn.id as PeriodFilter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                periodFilter === btn.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {periodFilter === 'custom' && (
          <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Dari:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">s/d:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* REPORT DOCUMENT PREVIEW CONTAINER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-8">
        {/* Document Header */}
        <div className="text-center border-b border-slate-800 pb-6">
          <h3 className="text-2xl font-extrabold text-white tracking-wide">
            LAPORAN KEUANGAN MASJID
          </h3>
          <p className="text-lg font-bold text-emerald-400 mt-1 uppercase">
            {settings.nama_masjid}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{settings.alamat}</p>
          <div className="mt-3 inline-block bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700 text-xs font-bold text-slate-200">
            Periode: {periodeLabel}
          </div>
        </div>

        {/* SECTION A: RINGKASAN KEUANGAN */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            A. Ringkasan Keuangan
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-300 font-bold uppercase">
                <tr>
                  <th className="p-3">Keterangan</th>
                  <th className="p-3 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                <tr>
                  <td className="p-3 text-slate-300">Saldo Awal</td>
                  <td className="p-3 text-right font-semibold text-slate-200">{formatRupiah(financialSummary.saldo_awal)}</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-300">Total Pemasukan</td>
                  <td className="p-3 text-right font-semibold text-emerald-400">+{formatRupiah(financialSummary.total_pemasukan)}</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-300">Total Pengeluaran</td>
                  <td className="p-3 text-right font-semibold text-rose-400">-{formatRupiah(financialSummary.total_pengeluaran)}</td>
                </tr>
                <tr className="bg-emerald-950/40 font-bold text-slate-100">
                  <td className="p-3 text-emerald-300">Saldo Akhir</td>
                  <td className="p-3 text-right text-emerald-400 text-sm">{formatRupiah(financialSummary.saldo_akhir)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION B: REKAP PEMASUKAN */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            B. Rekap Pemasukan per Kategori
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-emerald-950/60 text-emerald-300 font-bold uppercase">
                <tr>
                  <th className="p-3 w-12 text-center">No</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {rekapPemasukan.length > 0 ? (
                  rekapPemasukan.map((item) => (
                    <tr key={item.no}>
                      <td className="p-3 text-center text-slate-400">{item.no}</td>
                      <td className="p-3 text-slate-200 font-medium">{item.kategori}</td>
                      <td className="p-3 text-right font-bold text-emerald-400">{formatRupiah(item.jumlah)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-slate-500">Tidak ada pemasukan pada periode ini.</td>
                  </tr>
                )}
                <tr className="bg-slate-800 font-bold text-slate-100">
                  <td colSpan={2} className="p-3 text-right">TOTAL PEMASUKAN</td>
                  <td className="p-3 text-right text-emerald-400">{formatRupiah(totalPemasukan)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION C: REKAP PENGELUARAN */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            C. Rekap Pengeluaran per Kategori
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-rose-950/60 text-rose-300 font-bold uppercase">
                <tr>
                  <th className="p-3 w-12 text-center">No</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {rekapPengeluaran.length > 0 ? (
                  rekapPengeluaran.map((item) => (
                    <tr key={item.no}>
                      <td className="p-3 text-center text-slate-400">{item.no}</td>
                      <td className="p-3 text-slate-200 font-medium">{item.kategori}</td>
                      <td className="p-3 text-right font-bold text-rose-400">{formatRupiah(item.jumlah)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-slate-500">Tidak ada pengeluaran pada periode ini.</td>
                  </tr>
                )}
                <tr className="bg-slate-800 font-bold text-slate-100">
                  <td colSpan={2} className="p-3 text-right">TOTAL PENGELUARAN</td>
                  <td className="p-3 text-right text-rose-400">{formatRupiah(totalPengeluaran)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION D: DETAIL TRANSAKSI */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            D. Detail Transaksi
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-300 font-bold uppercase">
                <tr>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Jenis</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Keterangan</th>
                  <th className="p-3 text-right text-emerald-400">Masuk</th>
                  <th className="p-3 text-right text-rose-400">Keluar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {periodTransactions.length > 0 ? (
                  periodTransactions.map((trx) => (
                    <tr key={trx.id}>
                      <td className="p-3 font-mono text-slate-300">{trx.tanggal}</td>
                      <td className="p-3 text-slate-200">{trx.jenis}</td>
                      <td className="p-3 font-medium text-slate-200">{trx.kategori_nama}</td>
                      <td className="p-3 text-slate-300 max-w-xs">{trx.keterangan}</td>
                      <td className="p-3 text-right font-semibold text-emerald-400">
                        {trx.jenis === 'Pemasukan' ? formatRupiah(trx.nominal) : '-'}
                      </td>
                      <td className="p-3 text-right font-semibold text-rose-400">
                        {trx.jenis === 'Pengeluaran' ? formatRupiah(trx.nominal) : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-500">Tidak ada transaksi dalam periode ini.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION E: PENGESAHAN */}
        <div className="pt-8 border-t border-slate-800">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-6">
            E. Pengesahan
          </h4>
          <div className="grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="text-slate-400">Mengetahui,</p>
              <p className="font-bold text-slate-200 mt-0.5">Ketua DKM Masjid</p>
              <div className="h-16 flex items-end justify-center">
                <p className="font-bold text-slate-100 underline decoration-slate-600">
                  ( {settings.nama_ketua || '__________________'} )
                </p>
              </div>
            </div>

            <div>
              <p className="text-slate-400">Disetujui,</p>
              <p className="font-bold text-slate-200 mt-0.5">Bendahara Utama</p>
              <div className="h-16 flex items-end justify-center">
                <p className="font-bold text-slate-100 underline decoration-slate-600">
                  ( {settings.nama_bendahara || '__________________'} )
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
