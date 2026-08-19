import { 
  Document, 
  Packer, 
  Paragraph, 
  Table, 
  TableCell, 
  TableRow, 
  TextRun, 
  WidthType, 
  AlignmentType, 
  BorderStyle, 
  HeadingLevel 
} from 'docx';
import { saveAs } from 'file-saver';
import { Transaction, MosqueSettings, CategoryRecap, FinancialSummary } from '@/types';

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function generateDocxReport({
  settings,
  periodeLabel,
  summary,
  rekapPemasukan,
  rekapPengeluaran,
  transactions,
}: {
  settings: MosqueSettings;
  periodeLabel: string;
  summary: FinancialSummary;
  rekapPemasukan: CategoryRecap[];
  rekapPengeluaran: CategoryRecap[];
  transactions: Transaction[];
}) {
  const tableBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  };

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'LAPORAN KEUANGAN MASJID',
                bold: true,
                size: 32,
                color: '0F172A',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: settings.nama_masjid.toUpperCase(),
                bold: true,
                size: 26,
                color: '059669',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: settings.alamat,
                size: 20,
                color: '475569',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: `Periode: ${periodeLabel}`,
                bold: true,
                size: 22,
                color: '1E293B',
              }),
            ],
          }),

          // Section A: Ringkasan Keuangan
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: 'A. Ringkasan Keuangan',
                bold: true,
                size: 24,
                color: '0F172A',
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: tableBorder,
                    shading: { fill: '059669' },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Keterangan', bold: true, color: 'FFFFFF' })] })],
                  }),
                  new TableCell({
                    borders: tableBorder,
                    shading: { fill: '059669' },
                    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Jumlah', bold: true, color: 'FFFFFF' })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: tableBorder, children: [new Paragraph('Saldo Awal')] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun(formatRupiah(summary.saldo_awal))] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: tableBorder, children: [new Paragraph('Total Pemasukan')] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun(formatRupiah(summary.total_pemasukan))] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: tableBorder, children: [new Paragraph('Total Pengeluaran')] }),
                  new TableCell({ borders: tableBorder, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun(formatRupiah(summary.total_pengeluaran))] })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: tableBorder, shading: { fill: 'ECFDF5' }, children: [new Paragraph({ children: [new TextRun({ text: 'Saldo Akhir', bold: true })] })] }),
                  new TableCell({ borders: tableBorder, shading: { fill: 'ECFDF5' }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatRupiah(summary.saldo_akhir), bold: true, color: '047857' })] })] }),
                ],
              }),
            ],
          }),

          // Section B: Rekap Pemasukan
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
            children: [new TextRun({ text: 'B. Rekap Pemasukan', bold: true, size: 24, color: '0F172A' })],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, borders: tableBorder, shading: { fill: '047857' }, children: [new Paragraph({ children: [new TextRun({ text: 'No', bold: true, color: 'FFFFFF' })] })] }),
                  new TableCell({ width: { size: 60, type: WidthType.PERCENTAGE }, borders: tableBorder, shading: { fill: '047857' }, children: [new Paragraph({ children: [new TextRun({ text: 'Kategori', bold: true, color: 'FFFFFF' })] })] }),
                  new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: tableBorder, shading: { fill: '047857' }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Jumlah', bold: true, color: 'FFFFFF' })] })] }),
                ],
              }),
              ...rekapPemasukan.map(
                (item) =>
                  new TableRow({
                    children: [
                      new TableCell({ borders: tableBorder, children: [new Paragraph(String(item.no))] }),
                      new TableCell({ borders: tableBorder, children: [new Paragraph(item.kategori)] }),
                      new TableCell({ borders: tableBorder, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun(formatRupiah(item.jumlah))] })] }),
                    ],
                  })
              ),
              new TableRow({
                children: [
                  new TableCell({ borders: tableBorder, shading: { fill: 'F1F5F9' }, children: [new Paragraph({ children: [new TextRun({ text: '', bold: true })] })] }),
                  new TableCell({ borders: tableBorder, shading: { fill: 'F1F5F9' }, children: [new Paragraph({ children: [new TextRun({ text: 'TOTAL PEMASUKAN', bold: true })] })] }),
                  new TableCell({ borders: tableBorder, shading: { fill: 'F1F5F9' }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatRupiah(summary.total_pemasukan), bold: true, color: '047857' })] })] }),
                ],
              }),
            ],
          }),

          // Section C: Rekap Pengeluaran
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
            children: [new TextRun({ text: 'C. Rekap Pengeluaran', bold: true, size: 24, color: '0F172A' })],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, borders: tableBorder, shading: { fill: 'B91C1C' }, children: [new Paragraph({ children: [new TextRun({ text: 'No', bold: true, color: 'FFFFFF' })] })] }),
                  new TableCell({ width: { size: 60, type: WidthType.PERCENTAGE }, borders: tableBorder, shading: { fill: 'B91C1C' }, children: [new Paragraph({ children: [new TextRun({ text: 'Kategori', bold: true, color: 'FFFFFF' })] })] }),
                  new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: tableBorder, shading: { fill: 'B91C1C' }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Jumlah', bold: true, color: 'FFFFFF' })] })] }),
                ],
              }),
              ...rekapPengeluaran.map(
                (item) =>
                  new TableRow({
                    children: [
                      new TableCell({ borders: tableBorder, children: [new Paragraph(String(item.no))] }),
                      new TableCell({ borders: tableBorder, children: [new Paragraph(item.kategori)] }),
                      new TableCell({ borders: tableBorder, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun(formatRupiah(item.jumlah))] })] }),
                    ],
                  })
              ),
              new TableRow({
                children: [
                  new TableCell({ borders: tableBorder, shading: { fill: 'F1F5F9' }, children: [new Paragraph('')] }),
                  new TableCell({ borders: tableBorder, shading: { fill: 'F1F5F9' }, children: [new Paragraph({ children: [new TextRun({ text: 'TOTAL PENGELUARAN', bold: true })] })] }),
                  new TableCell({ borders: tableBorder, shading: { fill: 'F1F5F9' }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: formatRupiah(summary.total_pengeluaran), bold: true, color: 'B91C1C' })] })] }),
                ],
              }),
            ],
          }),

          // Section D: Detail Transaksi
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
            children: [new TextRun({ text: 'D. Detail Transaksi', bold: true, size: 24, color: '0F172A' })],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ width: { size: 12, type: WidthType.PERCENTAGE }, borders: tableBorder, shading: { fill: '334155' }, children: [new Paragraph({ children: [new TextRun({ text: 'Tanggal', bold: true, color: 'FFFFFF' })] })] }),
                  new TableCell({ width: { size: 10, type: WidthType.PERCENTAGE }, borders: tableBorder, shading: { fill: '334155' }, children: [new Paragraph({ children: [new TextRun({ text: 'Jenis', bold: true, color: 'FFFFFF' })] })] }),
                  new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, borders: tableBorder, shading: { fill: '334155' }, children: [new Paragraph({ children: [new TextRun({ text: 'Kategori', bold: true, color: 'FFFFFF' })] })] }),
                  new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: tableBorder, shading: { fill: '334155' }, children: [new Paragraph({ children: [new TextRun({ text: 'Keterangan', bold: true, color: 'FFFFFF' })] })] }),
                  new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, borders: tableBorder, shading: { fill: '334155' }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Masuk', bold: true, color: 'FFFFFF' })] })] }),
                  new TableCell({ width: { size: 14, type: WidthType.PERCENTAGE }, borders: tableBorder, shading: { fill: '334155' }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Keluar', bold: true, color: 'FFFFFF' })] })] }),
                ],
              }),
              ...transactions.map(
                (trx) =>
                  new TableRow({
                    children: [
                      new TableCell({ borders: tableBorder, children: [new Paragraph(trx.tanggal)] }),
                      new TableCell({ borders: tableBorder, children: [new Paragraph(trx.jenis)] }),
                      new TableCell({ borders: tableBorder, children: [new Paragraph(trx.kategori_nama)] }),
                      new TableCell({ borders: tableBorder, children: [new Paragraph(trx.keterangan)] }),
                      new TableCell({ borders: tableBorder, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun(trx.jenis === 'Pemasukan' ? formatRupiah(trx.nominal) : '-')] })] }),
                      new TableCell({ borders: tableBorder, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun(trx.jenis === 'Pengeluaran' ? formatRupiah(trx.nominal) : '-')] })] }),
                    ],
                  })
              ),
            ],
          }),

          // Section E: Pengesahan
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
            children: [new TextRun({ text: 'E. Pengesahan', bold: true, size: 24, color: '0F172A' })],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun('Mengetahui,')] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Ketua / DKM', bold: true })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 700 }, children: [new TextRun(`( ${settings.nama_ketua || '__________________'} )`)] }),
                    ],
                  }),
                  new TableCell({
                    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                    children: [
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun('Disetujui,')] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Bendahara Masjid', bold: true })] }),
                      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 700 }, children: [new TextRun(`( ${settings.nama_bendahara || '__________________'} )`)] }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanFilename = `Laporan_Keuangan_${settings.nama_masjid.replace(/\s+/g, '_')}_${periodeLabel.replace(/\s+/g, '_')}.docx`;
  saveAs(blob, cleanFilename);
}
