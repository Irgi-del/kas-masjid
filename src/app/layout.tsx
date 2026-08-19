import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Sistem Keuangan Masjid - Kas & Laporan DKM',
  description: 'Aplikasi Manajemen Keuangan & Kas Masjid modern, akuntabel, dan transparan.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
