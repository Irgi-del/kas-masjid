import { supabase, isSupabaseConnected } from './supabase';
import { Transaction, Category, User, MosqueSettings } from '@/types';

// Seed Defaults for fallback & initial DB setup
const DEFAULT_SETTINGS: MosqueSettings = {
  nama_masjid: 'Masjid Al-Ikhlas',
  alamat: 'Jl. Masjid Raya No. 123, Jakarta South',
  logo_url: '',
  saldo_awal: 10000000,
  tanggal_saldo_awal: '2026-08-01',
  nama_ketua: 'H. Ahmad Dahlan, S.Ag',
  nama_bendahara: 'H. Muhammad Yusuf',
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', jenis: 'Pemasukan', nama_kategori: 'Infak Kelompok', status: 'Aktif' },
  { id: 'cat-2', jenis: 'Pemasukan', nama_kategori: 'Infak Mandiri', status: 'Aktif' },
  { id: 'cat-3', jenis: 'Pemasukan', nama_kategori: 'Kas Masjid', status: 'Aktif' },
  { id: 'cat-4', jenis: 'Pemasukan', nama_kategori: 'Kompensasi Perusahaan', status: 'Aktif' },
  { id: 'cat-5', jenis: 'Pemasukan', nama_kategori: 'Donatur Luar', status: 'Aktif' },
  { id: 'cat-6', jenis: 'Pemasukan', nama_kategori: 'Lembaga/Partai', status: 'Aktif' },
  { id: 'cat-7', jenis: 'Pemasukan', nama_kategori: 'Usaha Bersama', status: 'Aktif' },
  { id: 'cat-8', jenis: 'Pemasukan', nama_kategori: 'Lainnya', status: 'Aktif' },
  { id: 'cat-9', jenis: 'Pengeluaran', nama_kategori: 'Konsumsi', status: 'Aktif' },
  { id: 'cat-10', jenis: 'Pengeluaran', nama_kategori: 'Peralatan', status: 'Aktif' },
  { id: 'cat-11', jenis: 'Pengeluaran', nama_kategori: 'Upah Kerja', status: 'Aktif' },
  { id: 'cat-12', jenis: 'Pengeluaran', nama_kategori: 'Bahan Bangunan', status: 'Aktif' },
  { id: 'cat-13', jenis: 'Pengeluaran', nama_kategori: 'Lainnya', status: 'Aktif' },
];

const DEFAULT_USERS: User[] = [
  { id: 'u-1', nama: 'Bendahara DKM', username: 'admin', password_hash: 'admin123', role: 'Admin', status: 'Aktif' },
  { id: 'u-2', nama: 'Pengurus Masjid', username: 'pengurus', password_hash: 'pengurus123', role: 'Viewer', status: 'Aktif' },
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'trx-1',
    trx_code: 'TRX-001',
    tanggal: '2026-08-05',
    jenis: 'Pemasukan',
    kategori_nama: 'Infak Kelompok',
    nominal: 5000000,
    keterangan: 'Infak dari kelompok pengajian bapak-bapak Al-Hidayah',
    user_nama: 'Bendahara DKM',
    status: 'Aktif',
    created_at: new Date('2026-08-05').toISOString(),
  },
  {
    id: 'trx-2',
    trx_code: 'TRX-002',
    tanggal: '2026-08-10',
    jenis: 'Pemasukan',
    kategori_nama: 'Infak Mandiri',
    nominal: 2500000,
    keterangan: 'Kotak infak jumat & harian jamaah',
    user_nama: 'Bendahara DKM',
    status: 'Aktif',
    created_at: new Date('2026-08-10').toISOString(),
  },
  {
    id: 'trx-3',
    trx_code: 'TRX-003',
    tanggal: '2026-08-12',
    jenis: 'Pemasukan',
    kategori_nama: 'Donatur Luar',
    nominal: 7500000,
    keterangan: 'Sumbangan pembangunan tempat wudhu dari H. Ridwan',
    user_nama: 'Bendahara DKM',
    status: 'Aktif',
    created_at: new Date('2026-08-12').toISOString(),
  },
  {
    id: 'trx-4',
    trx_code: 'TRX-004',
    tanggal: '2026-08-15',
    jenis: 'Pengeluaran',
    kategori_nama: 'Bahan Bangunan',
    nominal: 3500000,
    keterangan: 'Pembelian semen 40 sak dan pasir wudhu',
    user_nama: 'Bendahara DKM',
    status: 'Aktif',
    created_at: new Date('2026-08-15').toISOString(),
  },
  {
    id: 'trx-5',
    trx_code: 'TRX-005',
    tanggal: '2026-08-17',
    jenis: 'Pengeluaran',
    kategori_nama: 'Konsumsi',
    nominal: 1500000,
    keterangan: 'Konsumsi kerja bakti & pengajian rutin',
    user_nama: 'Bendahara DKM',
    status: 'Aktif',
    created_at: new Date('2026-08-17').toISOString(),
  },
  {
    id: 'trx-6',
    trx_code: 'TRX-006',
    tanggal: '2026-08-18',
    jenis: 'Pengeluaran',
    kategori_nama: 'Peralatan',
    nominal: 2500000,
    keterangan: 'Pembelian 2 unit Mic Wireless & perbaikan sound system',
    user_nama: 'Bendahara DKM',
    status: 'Aktif',
    created_at: new Date('2026-08-18').toISOString(),
  },
];

// Helper LocalStorage
function getLocal<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setLocal<T>(key: string, val: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

// 1. MOSQUE SETTINGS
export async function getMosqueSettings(): Promise<MosqueSettings> {
  if (isSupabaseConnected() && supabase) {
    try {
      const { data, error } = await supabase.from('pengaturan').select('*').limit(1).maybeSingle();
      if (!error && data) return data as MosqueSettings;
    } catch (e) {
      console.warn('Supabase fetch settings failed, using fallback:', e);
    }
  }
  return getLocal<MosqueSettings>('km_settings', DEFAULT_SETTINGS);
}

export async function updateMosqueSettings(settings: MosqueSettings): Promise<MosqueSettings> {
  if (isSupabaseConnected() && supabase) {
    try {
      const existing = await getMosqueSettings();
      if (existing && existing.id) {
        const { data, error } = await supabase
          .from('pengaturan')
          .update(settings)
          .eq('id', existing.id)
          .select()
          .single();
        if (!error && data) return data as MosqueSettings;
      } else {
        const { data, error } = await supabase
          .from('pengaturan')
          .insert([settings])
          .select()
          .single();
        if (!error && data) return data as MosqueSettings;
      }
    } catch (e) {
      console.warn('Supabase update settings error:', e);
    }
  }
  setLocal('km_settings', settings);
  return settings;
}

// 2. CATEGORIES
export async function getCategories(): Promise<Category[]> {
  if (isSupabaseConnected() && supabase) {
    try {
      const { data, error } = await supabase.from('kategori').select('*').order('nama_kategori', { ascending: true });
      if (!error && data) {
        if (data.length === 0) {
          // Seed default categories into Supabase
          const { data: seeded } = await supabase.from('kategori').insert(
            DEFAULT_CATEGORIES.map(c => ({ jenis: c.jenis, nama_kategori: c.nama_kategori, status: c.status }))
          ).select();
          if (seeded) return seeded as Category[];
        } else {
          return data as Category[];
        }
      }
    } catch (e) {
      console.warn('Supabase fetch categories error:', e);
    }
  }
  return getLocal<Category[]>('km_categories', DEFAULT_CATEGORIES);
}

export async function addCategory(category: Omit<Category, 'id'>): Promise<Category> {
  const newCat: Category = {
    ...category,
    id: `cat-${Date.now()}`,
  };

  if (isSupabaseConnected() && supabase) {
    try {
      const { data, error } = await supabase.from('kategori').insert([{
        jenis: category.jenis,
        nama_kategori: category.nama_kategori,
        status: category.status || 'Aktif'
      }]).select().single();
      if (!error && data) return data as Category;
    } catch (e) {
      console.warn('Supabase category add error:', e);
    }
  }

  const existing = getLocal<Category[]>('km_categories', DEFAULT_CATEGORIES);
  const updated = [...existing, newCat];
  setLocal('km_categories', updated);
  return newCat;
}

export async function updateCategory(category: Category): Promise<Category> {
  if (isSupabaseConnected() && supabase && category.id && !category.id.startsWith('cat-')) {
    try {
      const { data, error } = await supabase.from('kategori').update({
        nama_kategori: category.nama_kategori,
        status: category.status,
      }).eq('id', category.id).select().single();
      if (!error && data) return data as Category;
    } catch (e) {
      console.warn('Supabase update category error:', e);
    }
  }

  const existing = getLocal<Category[]>('km_categories', DEFAULT_CATEGORIES);
  const updated = existing.map(c => c.id === category.id ? category : c);
  setLocal('km_categories', updated);
  return category;
}

// 3. TRANSACTIONS
export async function getTransactions(): Promise<Transaction[]> {
  if (isSupabaseConnected() && supabase) {
    try {
      const { data, error } = await supabase
        .from('transaksi')
        .select('*')
        .order('tanggal', { ascending: false });
      
      if (!error && data) {
        return data as Transaction[];
      }
    } catch (e) {
      console.warn('Supabase transactions fetch error:', e);
    }
  }
  return getLocal<Transaction[]>('km_transactions', DEFAULT_TRANSACTIONS);
}

export async function addTransaction(trx: Omit<Transaction, 'id' | 'trx_code'>): Promise<Transaction> {
  const transactions = await getTransactions();
  const nextNum = transactions.length + 1;
  const trxCode = `TRX-${String(nextNum).padStart(3, '0')}`;

  const newTrx: Transaction = {
    ...trx,
    id: `trx-${Date.now()}`,
    trx_code: trxCode,
    status: 'Aktif',
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConnected() && supabase) {
    try {
      const { data, error } = await supabase.from('transaksi').insert([{
        trx_code: trxCode,
        tanggal: trx.tanggal,
        jenis: trx.jenis,
        kategori_nama: trx.kategori_nama,
        nominal: trx.nominal,
        keterangan: trx.keterangan,
        bukti_url: trx.bukti_url || '',
        user_nama: trx.user_nama || 'Admin',
        status: 'Aktif',
      }]).select().single();

      if (!error && data) return data as Transaction;
    } catch (e) {
      console.warn('Supabase insert transaction error:', e);
    }
  }

  const existing = getLocal<Transaction[]>('km_transactions', DEFAULT_TRANSACTIONS);
  const updated = [newTrx, ...existing];
  setLocal('km_transactions', updated);
  return newTrx;
}

export async function updateTransaction(trx: Transaction): Promise<Transaction> {
  if (isSupabaseConnected() && supabase && trx.id && !trx.id.startsWith('trx-')) {
    try {
      const { data, error } = await supabase.from('transaksi').update({
        tanggal: trx.tanggal,
        jenis: trx.jenis,
        kategori_nama: trx.kategori_nama,
        nominal: trx.nominal,
        keterangan: trx.keterangan,
        bukti_url: trx.bukti_url,
        updated_at: new Date().toISOString(),
      }).eq('id', trx.id).select().single();
      if (!error && data) return data as Transaction;
    } catch (e) {
      console.warn('Supabase update transaction error:', e);
    }
  }

  const existing = getLocal<Transaction[]>('km_transactions', DEFAULT_TRANSACTIONS);
  const updated = existing.map(t => t.id === trx.id ? trx : t);
  setLocal('km_transactions', updated);
  return trx;
}

export async function cancelTransaction(id: string): Promise<boolean> {
  if (isSupabaseConnected() && supabase && !id.startsWith('trx-')) {
    try {
      const { error } = await supabase.from('transaksi').update({ status: 'Dibatalkan' }).eq('id', id);
      if (!error) return true;
    } catch (e) {
      console.warn('Supabase cancel transaction error:', e);
    }
  }

  const existing = getLocal<Transaction[]>('km_transactions', DEFAULT_TRANSACTIONS);
  const updated = existing.map(t => t.id === id ? { ...t, status: 'Dibatalkan' as const } : t);
  setLocal('km_transactions', updated);
  return true;
}

// 4. USERS
export async function getUsers(): Promise<User[]> {
  if (isSupabaseConnected() && supabase) {
    try {
      const { data, error } = await supabase.from('users').select('*').order('nama', { ascending: true });
      if (!error && data) {
        if (data.length === 0) {
          const { data: seeded } = await supabase.from('users').insert(
            DEFAULT_USERS.map(u => ({ nama: u.nama, username: u.username, password_hash: u.password_hash || '123456', role: u.role, status: u.status }))
          ).select();
          if (seeded) return seeded as User[];
        } else {
          return data as User[];
        }
      }
    } catch (e) {
      console.warn('Supabase users fetch error:', e);
    }
  }
  return getLocal<User[]>('km_users', DEFAULT_USERS);
}

export async function addUser(user: Omit<User, 'id'>): Promise<User> {
  const newUser: User = {
    ...user,
    id: `u-${Date.now()}`,
    status: user.status || 'Aktif',
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConnected() && supabase) {
    try {
      const { data, error } = await supabase.from('users').insert([{
        nama: user.nama,
        username: user.username,
        password_hash: user.password || '123456',
        role: user.role,
        status: user.status || 'Aktif',
      }]).select().single();
      if (!error && data) return data as User;
    } catch (e) {
      console.warn('Supabase add user error:', e);
    }
  }

  const existing = getLocal<User[]>('km_users', DEFAULT_USERS);
  const updated = [...existing, newUser];
  setLocal('km_users', updated);
  return newUser;
}

export async function updateUser(user: User): Promise<User> {
  if (isSupabaseConnected() && supabase && user.id && !user.id.startsWith('u-')) {
    try {
      const updateData: any = {
        nama: user.nama,
        username: user.username,
        role: user.role,
        status: user.status,
      };
      if (user.password) {
        updateData.password_hash = user.password;
      }
      const { data, error } = await supabase.from('users').update(updateData).eq('id', user.id).select().single();
      if (!error && data) return data as User;
    } catch (e) {
      console.warn('Supabase update user error:', e);
    }
  }

  const existing = getLocal<User[]>('km_users', DEFAULT_USERS);
  const updated = existing.map(u => u.id === user.id ? { ...user, password_hash: user.password || u.password_hash } : u);
  setLocal('km_users', updated);
  return user;
}

// 5. FILE / PROOF UPLOAD
export async function uploadReceiptFile(file: File): Promise<string> {
  if (isSupabaseConnected() && supabase) {
    try {
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const { data, error } = await supabase.storage.from('bukti_transaksi').upload(fileName, file);
      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from('bukti_transaksi').getPublicUrl(fileName);
        return publicUrlData.publicUrl;
      }
    } catch (e) {
      console.warn('Supabase upload file error, using base64 fallback:', e);
    }
  }

  // Base64 Fallback
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
