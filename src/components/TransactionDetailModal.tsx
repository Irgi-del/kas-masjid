'use client';

import React from 'react';
import { Transaction } from '@/types';
import { X, FileText, Image as ImageIcon, ExternalLink, Calendar, User as UserIcon, Tag, AlertCircle } from 'lucide-react';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const isImage = transaction.bukti_url?.startsWith('data:image') || 
                  transaction.bukti_url?.match(/\.(jpeg|jpg|gif|png)$/i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className={`p-5 flex items-center justify-between border-b border-slate-800 ${
          transaction.jenis === 'Pemasukan' ? 'bg-emerald-950/40' : 'bg-rose-950/40'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                transaction.jenis === 'Pemasukan' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {transaction.jenis}
              </span>
              <span className="text-xs font-mono text-slate-400">{transaction.trx_code}</span>
            </div>
            <h3 className="font-bold text-lg text-white mt-1">
              Detail Transaksi
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-sm">
          {/* Nominal */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60 text-center">
            <span className="text-xs text-slate-400 font-medium">Nominal Transaksi</span>
            <div className={`text-2xl font-extrabold mt-0.5 ${
              transaction.jenis === 'Pemasukan' ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {transaction.jenis === 'Pemasukan' ? '+' : '-'}{formatRupiah(transaction.nominal)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5" /> Tanggal
              </span>
              <p className="font-semibold text-slate-200 mt-1">{transaction.tanggal}</p>
            </div>

            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Tag className="w-3.5 h-3.5" /> Kategori
              </span>
              <p className="font-semibold text-slate-200 mt-1">{transaction.kategori_nama}</p>
            </div>
          </div>

          {/* Keterangan */}
          <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-500 font-medium">Keterangan Detail:</span>
            <p className="text-slate-200 mt-1 whitespace-pre-wrap leading-relaxed">
              {transaction.keterangan}
            </p>
          </div>

          {/* User & Status */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5" /> Didelegasikan: <strong className="text-slate-300">{transaction.user_nama}</strong>
            </span>
            <span className={`px-2 py-0.5 rounded font-semibold ${
              transaction.status === 'Aktif' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
            }`}>
              Status: {transaction.status}
            </span>
          </div>

          {/* Proof Viewer */}
          <div className="pt-3 border-t border-slate-800">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Bukti Transaksi
            </label>

            {transaction.bukti_url ? (
              <div className="space-y-3">
                {isImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 max-h-64 bg-black/40 flex items-center justify-center">
                    <img
                      src={transaction.bukti_url}
                      alt="Bukti Struk"
                      className="max-h-60 object-contain w-full"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <FileText className="w-8 h-8 text-teal-400" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs font-semibold text-slate-200 truncate">Dokumen Bukti Transaksi (PDF)</p>
                      <span className="text-[10px] text-slate-400">Klik tombol untuk melihat dokumen</span>
                    </div>
                  </div>
                )}
                <a
                  href={transaction.bukti_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold text-xs rounded-xl border border-slate-700 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Lihat Bukti Terlampir</span>
                </a>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-center text-xs text-slate-500 italic">
                Tidak ada bukti transaksi.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
