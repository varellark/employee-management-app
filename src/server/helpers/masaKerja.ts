export function hitungMasaKerja(tanggalMasuk: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - tanggalMasuk.getTime();

  return diffMs / (1000 * 60 * 60 * 24 * 365.25);
}

export function formatMasaKerja(tahun: number): string {
  const thn = Math.floor(tahun);
  const bln = Math.floor((tahun - thn) * 12);

  if (thn === 0) {
    return `${bln} bulan`;
  }

  if (bln === 0) {
    return `${thn} tahun`;
  }

  return `${thn} tahun ${bln} bulan`;
}
