import { saveAs } from 'file-saver';
import { Transaction } from '@/types';

export function exportTransactionsToCSV(transactions: Transaction[], filename: string = 'Data_Transaksi_Masjid.csv') {
  const headers = ['ID', 'Tanggal', 'Jenis', 'Kategori', 'Nominal', 'Keterangan', 'Bukti', 'User', 'Status'];

  const rows = transactions.map(trx => {
    // Format date as DD/MM/YYYY
    const [year, month, day] = trx.tanggal.split('-');
    const formattedDate = day && month && year ? `${day}/${month}/${year}` : trx.tanggal;

    const escapeCsv = (str: string) => {
      if (!str) return '""';
      const clean = str.replace(/"/g, '""');
      return `"${clean}"`;
    };

    return [
      trx.trx_code || trx.id,
      formattedDate,
      trx.jenis,
      escapeCsv(trx.kategori_nama),
      trx.nominal,
      escapeCsv(trx.keterangan),
      trx.bukti_url ? escapeCsv(trx.bukti_url) : '""',
      escapeCsv(trx.user_nama || 'Admin'),
      trx.status || 'Aktif',
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
}
