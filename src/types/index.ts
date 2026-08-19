export type UserRole = 'Admin' | 'Viewer';
export type UserStatus = 'Aktif' | 'Nonaktif';

export interface User {
  id: string;
  nama: string;
  username: string;
  password?: string;
  password_hash?: string;
  role: UserRole;
  status: UserStatus;
  created_at?: string;
}

export type TransactionType = 'Pemasukan' | 'Pengeluaran';
export type TransactionStatus = 'Aktif' | 'Dibatalkan';

export interface Category {
  id: string;
  jenis: TransactionType;
  nama_kategori: string;
  status: 'Aktif' | 'Nonaktif';
  created_at?: string;
}

export interface Transaction {
  id: string;
  trx_code: string;
  tanggal: string; // YYYY-MM-DD
  jenis: TransactionType;
  kategori_id?: string;
  kategori_nama: string;
  nominal: number;
  keterangan: string;
  bukti_url?: string;
  user_id?: string;
  user_nama: string;
  status: TransactionStatus;
  created_at?: string;
  updated_at?: string;
}

export interface MosqueSettings {
  id?: string;
  nama_masjid: string;
  alamat: string;
  logo_url: string;
  saldo_awal: number;
  tanggal_saldo_awal: string; // YYYY-MM-DD
  nama_ketua: string;
  nama_bendahara: string;
  updated_at?: string;
}

export interface FinancialSummary {
  saldo_awal: number;
  total_pemasukan: number;
  total_pengeluaran: number;
  saldo_akhir: number;
  total_transaksi: number;
}

export interface CategoryRecap {
  no: number;
  kategori: string;
  jumlah: number;
  jenis: TransactionType;
}

export type PeriodFilter = 'hari_ini' | 'minggu_ini' | 'bulan_ini' | 'bulan_sebelumnya' | 'tahun_ini' | 'custom';
