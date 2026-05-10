import { prisma } from '../../lib/prisma';

export class AuthService {
  static async findUserByIdentifier(identifier: string) {
    return prisma.user.findFirst({
      where: {
        OR: [
          {
            username: {
              equals: identifier,
              mode: 'insensitive',
            },
          },
          {
            pegawai: {
              email: {
                equals: identifier,
                mode: 'insensitive',
              },
            },
          },
          {
            pegawai: {
              nomorHp: identifier,
            },
          },
        ],
      },

      include: {
        pegawai: true,
      },
    });
  }

  static async createOtp(userId: number) {
    await prisma.otpCode.deleteMany({
      where: {
        userId,
        used: false,
      },
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date(
      Date.now() + Number(process.env.OTP_EXPIRED_SECONDS) * 1000
    );

    await prisma.otpCode.create({
      data: {
        userId,
        kode: otp,
        expiresAt,
      },
    });

    return {
      otp,
      expiresAt,
    };
  }

  static async verifyOtp(userId: number, code: string) {
    return prisma.otpCode.findFirst({
      where: {
        userId,
        kode: code,
        used: false,
      },

      orderBy: {
        id: 'desc',
      },
    });
  }

  static async markOtpAsUsed(id: number) {
    return prisma.otpCode.update({
      where: {
        id,
      },

      data: {
        used: true,
      },
    });
  }

  static async findUserById(id: number) {
    return prisma.user.findUnique({
      where: {
        id,
      },

      include: {
        pegawai: true,
      },
    });
  }
}
