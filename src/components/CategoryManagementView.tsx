'use client';

import React, { useState } from 'react';
import { Category, TransactionType } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit2, FolderTree, Tag, Check, X, ShieldAlert } from 'lucide-react';

interface CategoryManagementViewProps {
  categories: Category[];
  onAddCategory: (cat: Omit<Category, 'id'>) => Promise<void>;
  onUpdateCategory: (cat: Category) => Promise<void>;
}

export const CategoryManagementView: React.FC<CategoryManagementViewProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
}) => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<TransactionType>('Pemasukan');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  const filteredCategories = categories.filter((c) => c.jenis === activeTab);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await onAddCategory({
      jenis: activeTab,
      nama_kategori: newCatName.trim(),
      status: 'Aktif',
    });
    setNewCatName('');
    setShowAddForm(false);
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCatId(cat.id);
    setEditingCatName(cat.nama_kategori);
  };

  const handleSaveEdit = async (cat: Category) => {
    if (!editingCatName.trim()) return;
    await onUpdateCategory({
      ...cat,
      nama_kategori: editingCatName.trim(),
    });
    setEditingCatId(null);
  };

  const handleToggleStatus = async (cat: Category) => {
    await onUpdateCategory({
      ...cat,
      status: cat.status === 'Aktif' ? 'Nonaktif' : 'Aktif',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Kelola Kategori Transaksi
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Atur daftar kategori pos arus kas pemasukan dan pengeluaran.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg border border-emerald-400/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Kategori Baru</span>
          </button>
        )}
      </div>

      {!isAdmin && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Role Viewer hanya dapat melihat kategori. Mengubah kategori hanya diizinkan untuk Admin/Bendahara.</span>
        </div>
      )}

      {/* Tabs Pemasukan / Pengeluaran */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('Pemasukan')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'Pemasukan'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Kategori Pemasukan
        </button>
        <button
          onClick={() => setActiveTab('Pengeluaran')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'Pengeluaran'
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Kategori Pengeluaran
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && isAdmin && (
        <form onSubmit={handleCreate} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex gap-3 items-center">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder={`Masukkan nama kategori ${activeTab.toLowerCase()} baru...`}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
          >
            <Check className="w-4 h-4" /> Simpan
          </button>
        </form>
      )}

      {/* Category List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800 text-slate-300 font-bold uppercase">
            <tr>
              <th className="p-3.5 w-12 text-center">No</th>
              <th className="p-3.5">Nama Kategori</th>
              <th className="p-3.5">Status</th>
              {isAdmin && <th className="p-3.5 text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat, idx) => (
                <tr key={cat.id} className="hover:bg-slate-800/50 transition">
                  <td className="p-3.5 text-center text-slate-500">{idx + 1}</td>

                  <td className="p-3.5 font-semibold text-slate-200">
                    {editingCatId === cat.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingCatName}
                          onChange={(e) => setEditingCatName(e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveEdit(cat)}
                          className="text-emerald-400 hover:underline text-xs font-bold"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => setEditingCatId(null)}
                          className="text-slate-400 hover:underline text-xs"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <span>{cat.nama_kategori}</span>
                    )}
                  </td>

                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      cat.status === 'Aktif'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}>
                      {cat.status}
                    </span>
                  </td>

                  {isAdmin && (
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleStartEdit(cat)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg"
                          title="Edit Kategori"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(cat)}
                          className="text-[11px] font-semibold text-slate-400 hover:text-white underline"
                        >
                          {cat.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-500">
                  Belum ada kategori untuk jenis ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
