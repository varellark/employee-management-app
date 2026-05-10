import { Context } from 'hono';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { loginValidation } from './auth.validation';
import { AuthService } from './auth.service';
import { ResponseHelper } from '../../helpers/response';
import { formatZodError } from '../../helpers/zodError';
import { MailService } from '../../services/mail.service';
import { AksiLog } from '@prisma/client';
import { LogService } from '../../services/log.service';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export class AuthController {
  static async login(c: Context) {
    try {
      const body = await c.req.json();

      const validation = loginValidation.safeParse(body);

      if (!validation.success) {
        return ResponseHelper.error(
          c,
          'Validation error',
          formatZodError(validation.error),
          422
        );
      }

      const { identifier, password, captcha, captchaCode } = validation.data;

      if (captcha.toLowerCase() !== captchaCode.toLowerCase()) {
        return ResponseHelper.error(c, 'Captcha salah', null, 422);
      }

      const user = await AuthService.findUserByIdentifier(identifier);

      if (!user) {
        return ResponseHelper.error(
          c,
          'Login gagal',
          'User tidak ditemukan',
          404
        );
      }

      if (user.statusAktif === 'NON_ACTIVE') {
        return ResponseHelper.error(
          c,
          'Akun nonaktif',
          'Silakan hubungi administrator',
          403
        );
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        return ResponseHelper.error(c, 'Login gagal', 'Password salah', 401);
      }

      const otpData = await AuthService.createOtp(user.id);

      await MailService.sendOtpEmail({
        to: user.pegawai.email,
        name: user.pegawai.nama,
        otp: otpData.otp,
      });

      return ResponseHelper.success(c, 'OTP berhasil dikirim', {
        userId: user.id,
        expiresAt: otpData.expiresAt,
      });
    } catch (error) {
      console.error(error);

      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async verifyOtp(c: Context) {
    try {
      const body = await c.req.json();

      const { userId, otp, rememberMe } = body;

      if (!userId || !otp) {
        return ResponseHelper.error(
          c,
          'Validation error',
          {
            userId: !userId ? 'User id wajib diisi' : null,

            otp: !otp ? 'OTP wajib diisi' : null,
          },
          422
        );
      }

      const otpData = await AuthService.verifyOtp(Number(userId), otp);

      if (!otpData) {
        return ResponseHelper.error(c, 'OTP tidak valid', null, 401);
      }

      if (new Date() > new Date(otpData.expiresAt)) {
        return ResponseHelper.error(c, 'OTP expired', null, 401);
      }

      const user = await AuthService.findUserById(otpData.userId);

      if (!user) {
        return ResponseHelper.error(c, 'User tidak ditemukan', null, 404);
      }

      if (user.statusAktif === 'NON_ACTIVE') {
        return ResponseHelper.error(
          c,
          'Akun nonaktif',
          'Silakan hubungi administrator',
          403
        );
      }

      await AuthService.markOtpAsUsed(otpData.id);

      const token = await new SignJWT({
        id: user.id,
        username: user.username,
        role: user.role,
        pegawaiId: user.pegawaiId,
      })
        .setProtectedHeader({
          alg: 'HS256',
        })
        .setIssuedAt()
        .setExpirationTime(rememberMe ? '30d' : '1d')
        .sign(secret);

      await LogService.create({
        userId: user.id,
        username: user.username,
        aksi: AksiLog.LOGIN,
        modul: 'AUTH LOGIN',
        keterangan: 'User berhasil login ke sistem',
        ipAddress:
          c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(c, 'Login berhasil', {
        accessToken: token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          pegawaiId: user.pegawaiId,
          pegawai: {
            id: user.pegawai.id,
            nama: user.pegawai.nama,
            email: user.pegawai.email,
            foto: user.pegawai.foto,
          },
        },
      });
    } catch (error) {
      console.error(error);

      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }

  static async logout(c: Context) {
    try {
      const auth = c.get('user');
      const user = await AuthService.findUserById(auth.id);

      if (!user) {
        return ResponseHelper.error(c, 'User tidak ditemukan', null, 404);
      }

      await LogService.create({
        userId: user.id,
        username: user.username,
        aksi: AksiLog.LOGOUT,
        modul: 'AUTH LOGOUT',
        keterangan: 'User logout dari sistem',
        ipAddress: c.req.header('x-forwarded-for') || '',
        userAgent: c.req.header('user-agent') || '',
      });

      return ResponseHelper.success(c, 'Logout berhasil');
    } catch (error) {
      console.error(error);

      return ResponseHelper.error(c, 'Internal server error', error);
    }
  }
}
