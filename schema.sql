-- =========================================================
-- SISTEM KEUANGAN MASJID - SUPABASE DATABASE SCHEMA
-- Execute this SQL in Supabase SQL Editor (https://supabase.com/dashboard)
-- =========================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLE PENGATURAN (Mosque Settings)
CREATE TABLE IF NOT EXISTS public.pengaturan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_masjid VARCHAR(255) NOT NULL DEFAULT 'Masjid Al-Ikhlas',
    alamat TEXT DEFAULT 'Jl. Masjid No. 1, Jakarta',
    logo_url TEXT DEFAULT '',
    saldo_awal DECIMAL(15, 2) NOT NULL DEFAULT 10000000.00,
    tanggal_saldo_awal DATE NOT NULL DEFAULT CURRENT_DATE,
    nama_ketua VARCHAR(255) DEFAULT 'H. Ahmad Dahlan, S.Ag',
    nama_bendahara VARCHAR(255) DEFAULT 'H. Muhammad Yusuf',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Settings if empty
INSERT INTO public.pengaturan (nama_masjid, alamat, saldo_awal, tanggal_saldo_awal, nama_ketua, nama_bendahara)
SELECT 'Masjid Al-Ikhlas', 'Jl. Masjid No. 1, Jakarta', 10000000.00, '2026-08-01', 'H. Ahmad Dahlan, S.Ag', 'H. Muhammad Yusuf'
WHERE NOT EXISTS (SELECT 1 FROM public.pengaturan);


-- 2. TABLE USERS (User Accounts)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Viewer')),
    status VARCHAR(50) NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Nonaktif')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Users (Password for admin: admin123, password for pengurus: pengurus123)
-- In production, store BCrypt/SHA256 hashed values.
INSERT INTO public.users (nama, username, password_hash, role, status)
VALUES 
    ('Bendahara Utama', 'admin', 'admin123', 'Admin', 'Aktif'),
    ('Pengurus DKM', 'pengurus', 'pengurus123', 'Viewer', 'Aktif')
ON CONFLICT (username) DO NOTHING;


-- 3. TABLE KATEGORI (Income & Expense Categories)
CREATE TABLE IF NOT EXISTS public.kategori (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jenis VARCHAR(50) NOT NULL CHECK (jenis IN ('Pemasukan', 'Pengeluaran')),
    nama_kategori VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Nonaktif')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_kategori_jenis UNIQUE (jenis, nama_kategori)
);

-- Seed Default Categories according to PRD
INSERT INTO public.kategori (jenis, nama_kategori, status)
VALUES 
    -- Pemasukan Categories
    ('Pemasukan', 'Infak Kelompok', 'Aktif'),
    ('Pemasukan', 'Infak Mandiri', 'Aktif'),
    ('Pemasukan', 'Kas Masjid', 'Aktif'),
    ('Pemasukan', 'Kompensasi Perusahaan', 'Aktif'),
    ('Pemasukan', 'Donatur Luar', 'Aktif'),
    ('Pemasukan', 'Lembaga/Partai', 'Aktif'),
    ('Pemasukan', 'Usaha Bersama', 'Aktif'),
    ('Pemasukan', 'Lainnya', 'Aktif'),
    
    -- Pengeluaran Categories
    ('Pengeluaran', 'Konsumsi', 'Aktif'),
    ('Pengeluaran', 'Peralatan', 'Aktif'),
    ('Pengeluaran', 'Upah Kerja', 'Aktif'),
    ('Pengeluaran', 'Bahan Bangunan', 'Aktif'),
    ('Pengeluaran', 'Lainnya', 'Aktif')
ON CONFLICT (jenis, nama_kategori) DO NOTHING;


-- 4. TABLE TRANSAKSI (Transactions)
CREATE TABLE IF NOT EXISTS public.transaksi (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trx_code VARCHAR(50) UNIQUE NOT NULL,
    tanggal DATE NOT NULL,
    jenis VARCHAR(50) NOT NULL CHECK (jenis IN ('Pemasukan', 'Pengeluaran')),
    kategori_id UUID REFERENCES public.kategori(id) ON DELETE SET NULL,
    kategori_nama VARCHAR(255) NOT NULL,
    nominal DECIMAL(15, 2) NOT NULL CHECK (nominal >= 0),
    keterangan TEXT NOT NULL,
    bukti_url TEXT DEFAULT '',
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    user_nama VARCHAR(255) DEFAULT 'Admin',
    status VARCHAR(50) NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Dibatalkan')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Sample Data for preview
INSERT INTO public.transaksi (trx_code, tanggal, jenis, kategori_nama, nominal, keterangan, user_nama, status)
VALUES 
    ('TRX-001', '2026-08-05', 'Pemasukan', 'Infak Kelompok', 5000000, 'Infak pengajian rutin bapak-bapak', 'Bendahara Utama', 'Aktif'),
    ('TRX-002', '2026-08-10', 'Pemasukan', 'Infak Mandiri', 2500000, 'Kotak infak harian jamaah', 'Bendahara Utama', 'Aktif'),
    ('TRX-003', '2026-08-12', 'Pemasukan', 'Donatur Luar', 7500000, 'Sumbangan hamba Allah untuk wudhu', 'Bendahara Utama', 'Aktif'),
    ('TRX-004', '2026-08-15', 'Pengeluaran', 'Bahan Bangunan', 3500000, 'Pembelian semen 40 sak dan pasir wudhu', 'Bendahara Utama', 'Aktif'),
    ('TRX-005', '2026-08-17', 'Pengeluaran', 'Konsumsi', 1500000, 'Konsumsi panitia & jamaah HUT RI', 'Bendahara Utama', 'Aktif'),
    ('TRX-006', '2026-08-18', 'Pengeluaran', 'Peralatan', 2500000, 'Servis Sound System & Mic Wireless', 'Bendahara Utama', 'Aktif')
ON CONFLICT (trx_code) DO NOTHING;

-- Storage Bucket Setup for Receipt Proof Uploads (Execute in Storage section or SQL editor)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('bukti_transaksi', 'bukti_transaksi', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage public access policy
CREATE POLICY "Public Read Storage" ON storage.objects FOR SELECT USING (bucket_id = 'bukti_transaksi');
CREATE POLICY "Public Upload Storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'bukti_transaksi');
