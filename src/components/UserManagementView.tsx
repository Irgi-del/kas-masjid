'use client';

import React, { useState } from 'react';
import { User, UserRole, UserStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Users, UserPlus, ShieldCheck, ShieldAlert, Edit2, Key, Check, X, AlertCircle } from 'lucide-react';

interface UserManagementViewProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id'>) => Promise<void>;
  onUpdateUser: (user: User) => Promise<void>;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ users, onAddUser, onUpdateUser }) => {
  const { isAdmin, user: currentUser } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Viewer');
  const [status, setStatus] = useState<UserStatus>('Aktif');
  const [errorMsg, setErrorMsg] = useState('');

  const openAddForm = () => {
    setEditingUser(null);
    setNama('');
    setUsername('');
    setPassword('');
    setRole('Viewer');
    setStatus('Aktif');
    setErrorMsg('');
    setShowAddModal(true);
  };

  const openEditForm = (u: User) => {
    setEditingUser(u);
    setNama(u.nama);
    setUsername(u.username);
    setPassword('');
    setRole(u.role);
    setStatus(u.status);
    setErrorMsg('');
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nama.trim() || !username.trim()) {
      setErrorMsg('Nama dan Username wajib diisi.');
      return;
    }

    if (!editingUser && !password.trim()) {
      setErrorMsg('Password wajib diisi untuk akun baru.');
      return;
    }

    try {
      if (editingUser) {
        await onUpdateUser({
          ...editingUser,
          nama: nama.trim(),
          username: username.trim(),
          password: password ? password : undefined,
          role,
          status,
        });
      } else {
        await onAddUser({
          nama: nama.trim(),
          username: username.trim(),
          password,
          role,
          status,
        });
      }
      setShowAddModal(false);
    } catch (err) {
      setErrorMsg('Gagal menyimpan pengguna.');
    }
  };

  const handleToggleStatus = async (u: User) => {
    if (u.username === currentUser?.username) {
      alert('Anda tidak dapat menonaktifkan akun sendiri yang sedang digunakan.');
      return;
    }
    await onUpdateUser({
      ...u,
      status: u.status === 'Aktif' ? 'Nonaktif' : 'Aktif',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Manajemen Pengguna (User Access)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Kelola hak akses akun DKM (Admin/Bendahara vs Viewer/Pengurus).
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg border border-indigo-400/30 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Pengguna Baru</span>
          </button>
        )}
      </div>

      {!isAdmin && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Hanya Admin/Bendahara yang memiliki hak akses mengelola pengguna.</span>
        </div>
      )}

      {/* User List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800 text-slate-300 font-bold uppercase">
            <tr>
              <th className="p-3.5">Nama Lengkap</th>
              <th className="p-3.5">Username</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Status</th>
              {isAdmin && <th className="p-3.5 text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/50 transition">
                <td className="p-3.5 font-semibold text-slate-200">{u.nama}</td>
                <td className="p-3.5 font-mono text-slate-300">{u.username}</td>
                <td className="p-3.5">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    u.role === 'Admin'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                  }`}>
                    <ShieldCheck className="w-3 h-3" />
                    {u.role === 'Admin' ? 'Admin / Bendahara' : 'Viewer / Pengurus'}
                  </span>
                </td>
                <td className="p-3.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    u.status === 'Aktif'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}>
                    {u.status}
                  </span>
                </td>
                {isAdmin && (
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditForm(u)}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg"
                        title="Edit User"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className="text-[11px] font-semibold text-slate-400 hover:text-white underline"
                      >
                        {u.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form Add/Edit User */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 bg-indigo-950/40 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">
                {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: H. Ahmad Supardi"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username login"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Password {editingUser && '(Kosongkan jika tidak diubah)'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required={!editingUser}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Role Pengguna
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Admin">Admin / Bendahara (Full Access)</option>
                  <option value="Viewer">Viewer / Pengurus (Read-Only)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Status Akun
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as UserStatus)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
