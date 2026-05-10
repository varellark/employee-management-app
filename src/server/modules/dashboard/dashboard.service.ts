import { GenderPegawai, JenisPegawai, StatusAktif } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../lib/prisma';
import { hitungJarakHaversine } from '../../helpers/haversine';
import type {
  DashboardAdminHRD,
  DashboardManagerHRD,
  DashboardSuperadmin,
  DomisiliArea,
  PegawaiTerbaru,
  PegawaiTerdekat,
} from './dashboard.type';

const OFFICE_LATITUDE = parseFloat(process.env.OFFICE_LATITUDE ?? '-7.8167834');
const OFFICE_LONGITUDE = parseFloat(process.env.OFFICE_LONGITUDE ?? '110.3496963');

function toNumber(val: Decimal | null | undefined): number | null {
  if (val === null || val === undefined) return null;
  return (val as unknown as Decimal).toNumber();
}

export class DashboardService {
  static async getSuperadminDashboard(
    nama: string,
    role: string
  ): Promise<DashboardSuperadmin> {
    return {
      welcome: `Selamat Datang ${nama} - ${role}`,
    };
  }

  static async getAdminHRDDashboard(
    nama: string,
    role: string
  ): Promise<DashboardAdminHRD> {
    return {
      welcome: `Selamat Datang ${nama} - ${role}`,
    };
  }

  static async getManagerHRDDashboard(): Promise<DashboardManagerHRD> {
    const [totalPegawai, totalKontrak, totalTetap, totalMagang] =
      await Promise.all([
        prisma.pegawai.count({
          where: { statusAktif: StatusAktif.ACTIVE },
        }),
        prisma.pegawai.count({
          where: {
            statusAktif: StatusAktif.ACTIVE,
            jenisPegawai: JenisPegawai.KONTRAK,
          },
        }),
        prisma.pegawai.count({
          where: {
            statusAktif: StatusAktif.ACTIVE,
            jenisPegawai: JenisPegawai.TETAP,
          },
        }),
        prisma.pegawai.count({
          where: {
            statusAktif: StatusAktif.ACTIVE,
            jenisPegawai: JenisPegawai.MAGANG,
          },
        }),
      ]);

    const [totalPria, totalWanita] = await Promise.all([
      prisma.pegawai.count({
        where: {
          statusAktif: StatusAktif.ACTIVE,
          gender: GenderPegawai.PRIA,
        },
      }),
      prisma.pegawai.count({
        where: {
          statusAktif: StatusAktif.ACTIVE,
          gender: GenderPegawai.WANITA,
        },
      }),
    ]);

    const pegawaiTerbaruRaw = await prisma.pegawai.findMany({
      where: { statusAktif: StatusAktif.ACTIVE },
      orderBy: { tanggalMasuk: 'desc' },
      take: 5,
      select: {
        id: true,
        nip: true,
        nama: true,
        jabatan: true,
        jenisPegawai: true,
        tanggalMasuk: true,
        foto: true,
      },
    });

    const pegawaiTerbaru: PegawaiTerbaru[] = pegawaiTerbaruRaw.map((p) => ({
      id: p.id,
      nip: p.nip,
      nama: p.nama,
      jabatan: p.jabatan,
      jenisPegawai: p.jenisPegawai,
      tanggalMasuk: p.tanggalMasuk,
      foto: p.foto,
    }));

    const pegawaiDenganKoordinat = await prisma.pegawai.findMany({
      where: {
        statusAktif: StatusAktif.ACTIVE,
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        nip: true,
        nama: true,
        jabatan: true,
        latitude: true,
        longitude: true,
        alamatDetail: true,
      },
    });

    let pegawaiTerdekat: PegawaiTerdekat | null = null;

    if (pegawaiDenganKoordinat.length > 0) {
      const withJarak = pegawaiDenganKoordinat.map((p) => {
        const lat = toNumber(p.latitude)!;
        const lon = toNumber(p.longitude)!;
        return {
          id: p.id,
          nip: p.nip,
          nama: p.nama,
          jabatan: p.jabatan,
          latitude: lat,
          longitude: lon,
          alamatDetail: p.alamatDetail,
          jarakKm: hitungJarakHaversine(
            OFFICE_LATITUDE,
            OFFICE_LONGITUDE,
            lat,
            lon
          ),
        };
      });

      withJarak.sort((a, b) => a.jarakKm - b.jarakKm);
      pegawaiTerdekat = withJarak[0];
    }

    const domisiliRaw = await prisma.pegawai.findMany({
      where: {
        statusAktif: StatusAktif.ACTIVE,
      },
      select: {
        id: true,
        nip: true,
        nama: true,
        latitude: true,
        longitude: true,
        alamatDetail: true,
        kabupaten: { select: { nama: true } },
        provinsi: { select: { nama: true } },
      },
    });

    const domisiliArea: DomisiliArea[] = domisiliRaw.map((p) => ({
      id: p.id,
      nip: p.nip,
      nama: p.nama,
      latitude: toNumber(p.latitude),
      longitude: toNumber(p.longitude),
      alamatDetail: p.alamatDetail,
      kabupaten: p.kabupaten?.nama ?? null,
      provinsi: p.provinsi?.nama ?? null,
    }));

    return {
      widgets: {
        totalPegawai,
        totalPegawaiKontrak: totalKontrak,
        totalPegawaiTetap: totalTetap,
        totalMagang,
      },
      chartJenisPegawai: {
        kontrak: totalKontrak,
        tetap: totalTetap,
        magang: totalMagang,
      },
      chartGender: {
        pria: totalPria,
        wanita: totalWanita,
      },
      pegawaiTerbaru,
      pegawaiTerdekat,
      domisiliArea,
    };
  }
}
