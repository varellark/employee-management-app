import { Prisma, Jabatan, JenisPegawai, StatusAktif } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { Pagination } from '@/server/helpers';
import { InputJsonValue } from '@prisma/client/runtime/library';
import { parseDDMMYYYY } from '../../helpers/date';
import { hitungMasaKerja } from '../../helpers/masaKerja';
import type {
  CreatePegawaiPayload,
  GetAllQuery,
  UpdatePegawaiPayload,
} from './pegawai.type';

const pegawaiIncludeFull = {
  provinsi: true,
  kabupaten: true,
  kecamatan: true,
  kalurahan: true,
  tempatLahirProvinsi: true,
  tempatLahirKabupaten: true,
} as const;

const pegawaiIncludeSummary = {
  provinsi: { select: { id: true, nama: true } },
  kabupaten: { select: { id: true, nama: true } },
  kecamatan: { select: { id: true, nama: true } },
  kalurahan: { select: { id: true, nama: true } },
  tempatLahirProvinsi: { select: { id: true, nama: true } },
  tempatLahirKabupaten: { select: { id: true, nama: true } },
} as const;

export class PegawaiService {
  static async getAll(query: GetAllQuery) {
    const {
      search = '',
      status,
      jabatan,
      jenisPegawai,
      masaKerjaOperator,
      masaKerjaTahun,
      sortBy = 'id',
      sortOrder = 'desc',
      page = '1',
      limit = '10',
      noPagination = 'false',
    } = query;

    const usePagination = noPagination !== 'true';
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const jabatanList = jabatan
      ? (jabatan.split(',').filter(Boolean) as Jabatan[])
      : undefined;

    const jenisList = jenisPegawai
      ? (jenisPegawai.split(',').filter(Boolean) as JenisPegawai[])
      : undefined;

    const filters: Prisma.PegawaiWhereInput = {
      ...(search
        ? {
            OR: [
              { nama: { contains: search, mode: 'insensitive' } },
              { nip: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(status ? { statusAktif: status } : {}),
      ...(jabatanList?.length ? { jabatan: { in: jabatanList } } : {}),
      ...(jenisList?.length ? { jenisPegawai: { in: jenisList } } : {}),
    };

    const masaKerjaTahunNum = masaKerjaTahun
      ? parseFloat(masaKerjaTahun)
      : undefined;

    let orderBy: Prisma.PegawaiOrderByWithRelationInput = {
      id: 'desc',
    };

    if (sortBy === 'nip') {
      orderBy = { nip: sortOrder };
    } else if (sortBy === 'nama') {
      orderBy = { nama: sortOrder };
    } else if (sortBy === 'jabatan') {
      orderBy = { jabatan: sortOrder };
    } else if (sortBy === 'tanggalMasuk' || sortBy === 'masaKerja') {
      orderBy = {
        tanggalMasuk: sortOrder === 'asc' ? 'desc' : 'asc',
      };
    }

    const [pegawaiList, totalData] = await Promise.all([
      prisma.pegawai.findMany({
        where: filters,
        include: pegawaiIncludeSummary,
        orderBy,
      }),

      prisma.pegawai.count({
        where: filters,
      }),
    ]);

    let total = totalData;

    let enriched = pegawaiList.map((p) => ({
      ...p,
      masaKerja: hitungMasaKerja(p.tanggalMasuk),
    }));

    if (masaKerjaTahunNum !== undefined && masaKerjaOperator) {
      enriched = enriched.filter((p) => {
        const mk = p.masaKerja;

        if (masaKerjaOperator === '>') {
          return mk > masaKerjaTahunNum;
        }

        if (masaKerjaOperator === '<') {
          return mk < masaKerjaTahunNum;
        }

        return Math.floor(mk) === Math.floor(masaKerjaTahunNum);
      });

      total = enriched.length;
    }

    const paginatedData = usePagination
      ? enriched.slice((pageNumber - 1) * limitNumber, pageNumber * limitNumber)
      : enriched;

    return {
      data: paginatedData,

      ...(usePagination
        ? {
            pagination: Pagination({
              page: pageNumber,
              limit: limitNumber,
              total,
            }),
          }
        : { total }),
    };
  }

  static async findById(id: number) {
    const pegawai = await prisma.pegawai.findUnique({
      where: { id },
      include: {
        ...pegawaiIncludeFull,
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            statusAktif: true,
            lastLoginAt: true,
          },
        },
      },
    });

    if (!pegawai) return null;

    return {
      ...pegawai,
      masaKerja: hitungMasaKerja(pegawai.tanggalMasuk),
    };
  }

  static async findByNip(nip: string) {
    return prisma.pegawai.findUnique({ where: { nip } });
  }

  static async findByEmail(email: string) {
    return prisma.pegawai.findUnique({ where: { email } });
  }

  static async create(payload: CreatePegawaiPayload) {
    const tanggalLahir = parseDDMMYYYY(payload.tanggalLahir);
    const tanggalMasuk = parseDDMMYYYY(payload.tanggalMasuk);

    return prisma.pegawai.create({
      data: {
        nip: payload.nip,
        nama: payload.nama,
        email: payload.email,
        nomorHp: payload.nomorHp,
        foto: payload.foto,
        provinsiId: payload.provinsiId,
        kabupatenId: payload.kabupatenId,
        kecamatanId: payload.kecamatanId,
        kalurahanId: payload.kalurahanId,
        alamatDetail: payload.alamatDetail,
        latitude: payload.latitude,
        longitude: payload.longitude,
        tempatLahirProvinsiId: payload.tempatLahirProvinsiId,
        tempatLahirKabupatenId: payload.tempatLahirKabupatenId,
        tanggalLahir,
        gender: payload.gender,
        statusKawin: payload.statusKawin,
        jumlahAnak: payload.jumlahAnak ?? 0,
        tanggalMasuk,
        jabatan: payload.jabatan,
        departemen: payload.departemen,
        jenisPegawai: payload.jenisPegawai,
        statusAktif: payload.statusAktif ?? StatusAktif.ACTIVE,
        pendidikan: payload.pendidikan
          ? (payload.pendidikan as InputJsonValue[])
          : undefined,
      },
      include: pegawaiIncludeFull,
    });
  }

  static async update(id: number, payload: UpdatePegawaiPayload) {
    const data: Prisma.PegawaiUpdateInput = {};

    if (payload.nip !== undefined) data.nip = payload.nip;
    if (payload.nama !== undefined) data.nama = payload.nama;
    if (payload.email !== undefined) data.email = payload.email;
    if (payload.nomorHp !== undefined) data.nomorHp = payload.nomorHp;
    if (payload.foto !== undefined) data.foto = payload.foto;
    if (payload.provinsiId !== undefined)
      data.provinsi = { connect: { id: payload.provinsiId } };
    if (payload.kabupatenId !== undefined)
      data.kabupaten = { connect: { id: payload.kabupatenId } };
    if (payload.kecamatanId !== undefined)
      data.kecamatan = { connect: { id: payload.kecamatanId } };
    if (payload.kalurahanId !== undefined)
      data.kalurahan = { connect: { id: payload.kalurahanId } };
    if (payload.alamatDetail !== undefined)
      data.alamatDetail = payload.alamatDetail;
    if (payload.latitude !== undefined) data.latitude = payload.latitude;
    if (payload.longitude !== undefined) data.longitude = payload.longitude;
    if (payload.tempatLahirProvinsiId !== undefined)
      data.tempatLahirProvinsi = payload.tempatLahirProvinsiId
        ? { connect: { id: payload.tempatLahirProvinsiId } }
        : { disconnect: true };
    if (payload.tempatLahirKabupatenId !== undefined)
      data.tempatLahirKabupaten = payload.tempatLahirKabupatenId
        ? { connect: { id: payload.tempatLahirKabupatenId } }
        : { disconnect: true };
    if (payload.tanggalLahir !== undefined)
      data.tanggalLahir = parseDDMMYYYY(payload.tanggalLahir);
    if (payload.gender !== undefined) data.gender = payload.gender;
    if (payload.statusKawin !== undefined)
      data.statusKawin = payload.statusKawin;
    if (payload.jumlahAnak !== undefined) data.jumlahAnak = payload.jumlahAnak;
    if (payload.tanggalMasuk !== undefined)
      data.tanggalMasuk = parseDDMMYYYY(payload.tanggalMasuk);
    if (payload.jabatan !== undefined) data.jabatan = payload.jabatan;
    if (payload.departemen !== undefined) data.departemen = payload.departemen;
    if (payload.jenisPegawai !== undefined)
      data.jenisPegawai = payload.jenisPegawai;
    if (payload.statusAktif !== undefined)
      data.statusAktif = payload.statusAktif;
    if (payload.pendidikan !== undefined)
      data.pendidikan = payload.pendidikan as InputJsonValue[];

    return prisma.pegawai.update({
      where: { id },
      data,
      include: pegawaiIncludeFull,
    });
  }

  static async delete(id: number) {
    return prisma.$transaction(async (tx) => {
      await tx.tunjangan.deleteMany({
        where: {
          pegawaiId: id,
        },
      });

      await tx.presensi.deleteMany({
        where: {
          pegawaiId: id,
        },
      });

      return tx.pegawai.delete({
        where: {
          id,
        },
      });
    });
  }

  static async bulkDelete(ids: number[]) {
    return prisma.$transaction(async (tx) => {
      await tx.tunjangan.deleteMany({
        where: {
          pegawaiId: {
            in: ids,
          },
        },
      });

      await tx.presensi.deleteMany({
        where: {
          pegawaiId: {
            in: ids,
          },
        },
      });

      return tx.pegawai.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
    });
  }

  static async findManyByIds(ids: number[]) {
    return prisma.pegawai.findMany({
      where: { id: { in: ids } },
      include: {
        user: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });
  }
}
