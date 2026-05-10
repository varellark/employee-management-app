export const authPaths = {
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login user',
      description:
        'Login menggunakan username/email/nomor HP dan password. Jika berhasil, akan mengirimkan OTP ke pengguna.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['identifier', 'password', 'captcha', 'captchaCode'],
              properties: {
                identifier: {
                  type: 'string',
                  description: 'Username, email, atau nomor HP',
                  example: 'superadmin',
                },
                password: {
                  type: 'string',
                  description: 'Password akun',
                  example: 'Password123!',
                },
                captcha: {
                  type: 'string',
                  description: 'Input captcha dari pengguna',
                  example: 'ABCD12',
                },
                captchaCode: {
                  type: 'string',
                  description: 'Kode captcha yang di-generate sistem',
                  example: 'ABCD12',
                },
                rememberMe: {
                  type: 'boolean',
                  description: 'Opsi remember me',
                  example: false,
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Login berhasil, OTP dikirim',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },

  '/auth/verify-otp': {
    post: {
      tags: ['Auth'],
      summary: 'Verifikasi OTP',
      description:
        'Verifikasi OTP yang dikirimkan setelah login. Mengembalikan access token jika OTP valid.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['userId', 'otp'],
              properties: {
                userId: {
                  type: 'integer',
                  description: 'ID pengguna dari response login',
                  example: 1,
                },
                otp: {
                  type: 'string',
                  description: 'Kode OTP 6 digit',
                  example: '123456',
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'OTP valid, token dikembalikan',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'object',
                        properties: {
                          token: { type: 'string', example: 'eyJhbGci...' },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },

  '/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Logout user',
      description: 'Logout dan invalidasi token. Memerlukan autentikasi.',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Logout berhasil',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },
};
