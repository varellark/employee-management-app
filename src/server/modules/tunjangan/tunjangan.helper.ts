export const MINIMAL_HARI_MASUK = 19;
export const JARAK_MIN_KM = 5;
export const JARAK_MAX_KM = 25;

export function bulatkan(nilai: number): number {
  const desimal = nilai - Math.floor(nilai);
  return desimal < 0.5 ? Math.floor(nilai) : Math.ceil(nilai);
}

export function hitungTunjangan(
  baseFare: number,
  jarakKm: number,
  jumlahHariMasuk: number
): { totalTunjangan: number; eligible: boolean; alasan?: string } {
  if (jumlahHariMasuk < MINIMAL_HARI_MASUK) {
    return {
      totalTunjangan: 0,
      eligible: false,
      alasan: `Jumlah hari masuk (${jumlahHariMasuk}) kurang dari minimal ${MINIMAL_HARI_MASUK} hari`,
    };
  }

  if (jarakKm < JARAK_MIN_KM || jarakKm > JARAK_MAX_KM) {
    return {
      totalTunjangan: 0,
      eligible: false,
      alasan: `Jarak (${jarakKm} km) di luar rentang ${JARAK_MIN_KM}–${JARAK_MAX_KM} km`,
    };
  }

  const raw = baseFare * jarakKm * jumlahHariMasuk;
  const totalTunjangan = bulatkan(raw);

  return { totalTunjangan, eligible: true };
}
