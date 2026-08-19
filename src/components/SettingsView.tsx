'use client';

import React, { useState } from 'react';
import { MosqueSettings } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Building, Save, ShieldAlert, CheckCircle2, Image as ImageIcon } from 'lucide-react';

interface SettingsViewProps {
  settings: MosqueSettings;
  onSaveSettings: (settings: MosqueSettings) => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSaveSettings }) => {
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState<MosqueSettings>({ ...settings });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (field: keyof MosqueSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setSaving(true);
    try {
      await onSaveSettings(formData);
      setSuccessMsg('Profil masjid & saldo awal berhasil diperbarui!');
    } catch (e) {
      alert('Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Profil & Pengaturan Masjid
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Atur identitas masjid, saldo awal, dan nama pengesah laporan.
          </p>
        </div>
      </div>

      {!isAdmin && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Hanya Admin/Bendahara yang dapat mengubah informasi profil masjid.</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Nama Masjid */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Nama Masjid / DKM
            </label>
            <input
              type="text"
              value={formData.nama_masjid}
              onChange={(e) => handleChange('nama_masjid', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              disabled={!isAdmin}
              required
            />
          </div>

          {/* Alamat */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Alamat Lengkap Masjid
            </label>
            <textarea
              rows={2}
              value={formData.alamat}
              onChange={(e) => handleChange('alamat', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              disabled={!isAdmin}
              required
            />
          </div>

          {/* Saldo Awal */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Saldo Awal Kas (Rp)
            </label>
            <input
              type="number"
              value={formData.saldo_awal}
              onChange={(e) => handleChange('saldo_awal', parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              disabled={!isAdmin}
              required
            />
          </div>

          {/* Tanggal Saldo Awal */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Tanggal Saldo Awal
            </label>
            <input
              type="date"
              value={formData.tanggal_saldo_awal}
              onChange={(e) => handleChange('tanggal_saldo_awal', e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              disabled={!isAdmin}
              required
            />
          </div>

          {/* Nama Ketua / DKM */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Nama Ketua / DKM (Untuk Laporan DOCX)
            </label>
            <input
              type="text"
              value={formData.nama_ketua}
              onChange={(e) => handleChange('nama_ketua', e.target.value)}
              placeholder="H. Ahmad Dahlan, S.Ag"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              disabled={!isAdmin}
              required
            />
          </div>

          {/* Nama Bendahara */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Nama Bendahara (Untuk Laporan DOCX)
            </label>
            <input
              type="text"
              value={formData.nama_bendahara}
              onChange={(e) => handleChange('nama_bendahara', e.target.value)}
              placeholder="H. Muhammad Yusuf"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              disabled={!isAdmin}
              required
            />
          </div>
        </div>

        {isAdmin && (
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-900/30 border border-emerald-400/30 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Memproses...' : 'Simpan Pengaturan'}</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
