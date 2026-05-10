import { z } from 'zod';

export const loginValidation = z.object({
  identifier: z.string().min(1, 'Username/email/nomor hp wajib diisi'),

  password: z.string().min(1, 'Password wajib diisi'),

  captcha: z.string().min(1, 'Captcha wajib diisi'),

  captchaCode: z.string().min(1, 'Captcha code wajib diisi'),

  rememberMe: z.boolean().optional(),
});
