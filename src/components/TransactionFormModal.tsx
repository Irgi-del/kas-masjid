'use client';

import React, { useState, useEffect } from 'react';
import { Category, Transaction, TransactionType } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { X, Upload, FileText, Image as ImageIcon, AlertCircle, Plus, Check } from 'lucide-react';
import { uploadReceiptFile, addCategory } from '@/lib/data-service';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: TransactionType;
  categories: Category[];
  onSubmit: (trxData: Partial<Transaction>) => Promise<void>;
  editData?: Transaction | null;
  onCategoryAdded?: () => void;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  type,
  categories,
  onSubmit,
  editData,
  onCategoryAdded,
}) => {
  const { user } = useAuth();
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [kategoriNama, setKategoriNama] = useState<string>('');
  const [nominal, setNominal] = useState<string>('');
  const [keterangan, setKeterangan] = useState<string>('');
  const [buktiUrl, setBuktiUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Quick category addition state
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const filteredCategories = categories.filter(c => c.jenis === type && c.status === 'Aktif');

  useEffect(() => {
    if (editData) {
      setTanggal(editData.tanggal);
      setKategoriNama(editData.kategori_nama);
      setNominal(String(editData.nominal));
      setKeterangan(editData.keterangan);
      setBuktiUrl(editData.bukti_url || '');
    } else {
      setTanggal(new Date().toISOString().split('T')[0]);
      setNominal('');
      setKeterangan('');
      setBuktiUrl('');
      setKategoriNama(filteredCategories[0]?.nama_kategori || '');
    }
    setErrorMessage('');
    setIsAddingNewCat(false);
  }, [editData, isOpen, type]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Ukuran file bukti transaksi maksimal 5MB.');
      return;
    }

    setUploading(true);
    try {
      const url = await uploadReceiptFile(file);
      setBuktiUrl(url);
    } catch (err) {
      setErrorMessage('Gagal mengunggah bukti transaksi.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveQuickCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      await addCategory({
        jenis: type,
        nama_kategori: newCatName.trim(),
        status: 'Aktif',
      });
      setKategoriNama(newCatName.trim());
      setNewCatName('');
      setIsAddingNewCat(false);
      if (onCategoryAdded) onCategoryAdded();
    } catch (e) {
      setErrorMessage('Gagal menambah kategori baru.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const parsedNominal = parseFloat(nominal.replace(/[^0-9]/g, ''));
    if (isNaN(parsedNominal) || parsedNominal <= 0) {
      setErrorMessage('Nominal transaksi harus berupa angka lebih dari 0.');
      return;
    }

    if (!kategoriNama) {
      setErrorMessage('Silakan pilih kategori transaksi.');
      return;
    }

    if (!keterangan.trim()) {
      setErrorMessage('Keterangan detail wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        tanggal,
        jenis: type,
        kategori_nama: kategoriNama,
        nominal: parsedNominal,
        keterangan: keterangan.trim(),
        bukti_url: buktiUrl,
        user_nama: user?.nama || 'Admin',
      });
      onClose();
    } catch (err) {
      setErrorMessage('Terjadi kesalahan saat menyimpan transaksi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className={`p-5 flex items-center justify-between border-b border-slate-800 ${
          type === 'Pemasukan' ? 'bg-emerald-950/40' : 'bg-rose-950/40'
        }`}>
          <div>
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              {editData ? 'Edit Transaksi' : `Tambah ${type}`}
            </h3>
            <p className="text-xs text-slate-400">
              Formulir catat {type.toLowerCase()} keuangan masjid.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Tanggal */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Tanggal Transaksi
            </label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          {/* Kategori */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Kategori
              </label>
              <button
                type="button"
                onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                className="text-xs font-medium text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                {isAddingNewCat ? 'Batal' : 'Tambah Kategori'}
              </button>
            </div>

            {isAddingNewCat ? (
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Nama kategori baru"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveQuickCategory}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Simpan
                </button>
              </div>
            ) : (
              <select
                value={kategoriNama}
                onChange={(e) => setKategoriNama(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              >
                <option value="">-- Pilih Kategori --</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.nama_kategori}>
                    {cat.nama_kategori}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Nominal */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Nominal (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-slate-400 font-bold text-sm">Rp</span>
              <input
                type="text"
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                placeholder="Contoh: 1500000"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-white text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Keterangan Detail */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Keterangan Detail
            </label>
            <textarea
              rows={3}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Jelaskan rincian detail transaksi (misal: Pembelian semen 20 sak untuk wudhu)..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          {/* Upload Bukti (Opsional) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Bukti Transaksi / Struk (Opsional)
            </label>
            <div className="mt-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition">
              {buktiUrl ? (
                <div className="w-full flex items-center justify-between bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {buktiUrl.startsWith('data:image') || buktiUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                      <ImageIcon className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <FileText className="w-5 h-5 text-teal-400 shrink-0" />
                    )}
                    <span className="text-xs text-slate-300 truncate">Bukti Terlampir</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBuktiUrl('')}
                    className="text-xs font-semibold text-rose-400 hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-300 font-medium">
                    {uploading ? 'Mengunggah...' : 'Klik untuk unggah (JPG, PNG, PDF)'}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Maksimal 5MB</span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-lg border transition ${
                type === 'Pemasukan'
                  ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400/30'
                  : 'bg-rose-600 hover:bg-rose-500 border-rose-400/30'
              } disabled:opacity-50`}
            >
              {submitting ? 'Menyimpan...' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
