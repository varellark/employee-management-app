import bcrypt from 'bcryptjs';

import { Prisma, StatusAktif } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { Pagination } from '@/server/helpers';
import type {
  CreateUserPayload,
  GetAllPayload,
  UpdateMeServicePayload,
  UpdateUserPayload,
} from './user.type';

export class UserService {
  static async getAll(query: GetAllPayload) {
    const {
      search = '',
      status,
      page = '1',
      limit = '10',
      noPagination = 'false',
    } = query;

    const usePagination = noPagination !== 'true';

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const filters: Prisma.UserWhereInput = {
      ...(search
        ? {
            OR: [
              {
                username: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                pegawai: {
                  nama: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                pegawai: {
                  email: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
              {
                pegawai: {
                  nomorHp: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              },
            ],
          }
        : {}),

      ...(status
        ? {
            statusAktif: status,
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: filters,
        include: {
          pegawai: true,
        },
        ...(usePagination
          ? {
              skip: (pageNumber - 1) * limitNumber,
              take: limitNumber,
            }
          : {}),
        orderBy: {
          id: 'desc',
        },
      }),

      prisma.user.count({
        where: filters,
      }),
    ]);

    return {
      data: users,

      ...(usePagination
        ? {
            pagination: Pagination({
              page: pageNumber,
              limit: limitNumber,
              total,
            }),
          }
        : {
            total,
          }),
    };
  }

  static async getByUserId(id: number) {
    return prisma.user.findUnique({
      where: {
        id,
      },

      include: {
        pegawai: true,
      },
    });
  }

  static async findById(id: number) {
    return prisma.user.findUnique({
      where: {
        id,
      },

      include: {
        pegawai: true,
      },
    });
  }

  static async findByUsername(username: string) {
    return prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive',
        },
      },
    });
  }

  static async findByPegawaiId(pegawaiId: number) {
    return prisma.user.findUnique({
      where: {
        pegawaiId,
      },
    });
  }

  static async findPegawaiById(id: number) {
    return prisma.pegawai.findUnique({
      where: {
        id,
      },
    });
  }

  static generatePassword(length = 10) {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const number = '0123456789';
    const special = '!@#$%^&*';
    const all = upper + lower + number + special;

    let password = '';

    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += number[Math.floor(Math.random() * number.length)];
    password += special[Math.floor(Math.random() * special.length)];

    for (let i = password.length; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }

    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  static async create(payload: CreateUserPayload) {
    const plainPassword = this.generatePassword();

    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    const user = await prisma.user.create({
      data: {
        pegawaiId: payload.pegawaiId,
        username: payload.username,
        password: hashedPassword,
        role: payload.role,
        statusAktif: payload.statusAktif ?? StatusAktif.ACTIVE,
      },

      include: {
        pegawai: true,
      },
    });

    return {
      user,
      plainPassword,
    };
  }

  static async update(id: number, payload: UpdateUserPayload) {
    return prisma.user.update({
      where: {
        id,
      },

      data: payload,

      include: {
        pegawai: true,
      },
    });
  }

  static async delete(id: number) {
    return prisma.user.delete({
      where: {
        id,
      },
    });
  }

  static async searchPegawai(keyword: string) {
    return prisma.pegawai.findMany({
      where: {
        nama: {
          contains: keyword,
          mode: 'insensitive',
        },

        user: null,
      },

      select: {
        id: true,
        nama: true,
        email: true,
        nomorHp: true,
      },

      take: 10,
    });
  }

  static async updateMe(userId: number, payload: UpdateMeServicePayload) {
    const { name, email, phone, password } = payload;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { pegawai: true },
    });

    if (!existingUser) throw new Error('User tidak ditemukan');

    let hashedPassword: string | undefined;
    if (password && password.trim() !== '') {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    return prisma.$transaction(async (tx) => {
      if (existingUser.pegawaiId) {
        await tx.pegawai.update({
          where: { id: existingUser.pegawaiId },
          data: {
            nama: name,
            email,
            ...(phone !== undefined ? { nomorHp: phone } : {}),
          },
        });
      }

      if (hashedPassword) {
        await tx.user.update({
          where: { id: userId },
          data: { password: hashedPassword },
        });
      }

      return tx.user.findUnique({
        where: { id: userId },
        include: { pegawai: true },
      });
    });
  }
}
