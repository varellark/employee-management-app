export const userPaths = {
  '/users': {
    get: {
      tags: ['Users'],
      summary: 'Get semua user',
      description: 'Mengambil daftar semua user dengan filter dan pagination.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'search',
          in: 'query',
          schema: { type: 'string' },
          description: 'Cari berdasarkan username atau nama',
        },
        {
          name: 'status',
          in: 'query',
          schema: { $ref: '#/components/schemas/StatusAktif' },
          description: 'Filter berdasarkan status aktif',
        },
        { $ref: '#/components/parameters/page' },
        { $ref: '#/components/parameters/limit' },
        { $ref: '#/components/parameters/noPagination' },
      ],
      responses: {
        '200': {
          description: 'Daftar user berhasil diambil',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/PaginatedResponse' },
                  {
                    type: 'object',
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    },
    post: {
      tags: ['Users'],
      summary: 'Buat user baru',
      description: 'Membuat akun user baru yang terhubung ke data pegawai.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['pegawaiId', 'username', 'role'],
              properties: {
                pegawaiId: {
                  type: 'integer',
                  description: 'ID pegawai yang akan dibuatkan akun',
                  example: 1,
                },
                username: {
                  type: 'string',
                  minLength: 6,
                  description: 'Username (hanya huruf kecil dan angka)',
                  example: 'johndoe01',
                },
                role: { $ref: '#/components/schemas/Role' },
                statusAktif: { $ref: '#/components/schemas/StatusAktif' },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'User berhasil dibuat',
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

  '/users/me': {
    get: {
      tags: ['Users'],
      summary: 'Get profil sendiri',
      description: 'Mengambil data profil user yang sedang login.',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': {
          description: 'Data profil berhasil diambil',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/SuccessResponse' },
                  {
                    type: 'object',
                    properties: { data: { $ref: '#/components/schemas/User' } },
                  },
                ],
              },
            },
          },
        },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    },
    put: {
      tags: ['Users'],
      summary: 'Update profil sendiri',
      description:
        'Mengupdate nama, email, nomor HP, dan/atau password user yang sedang login.',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email'],
              properties: {
                name: { type: 'string', minLength: 2, example: 'John Doe' },
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'john@example.com',
                },
                phone: { type: 'string', example: '+6281234567890' },
                password: {
                  type: 'string',
                  minLength: 8,
                  description:
                    'Min 8 karakter, wajib ada huruf besar, huruf kecil, dan karakter khusus',
                  example: 'NewPass123!',
                },
              },
            },
          },
        },
      },
      responses: {
        '200': { description: 'Profil berhasil diupdate' },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },

  '/users/search-pegawai': {
    get: {
      tags: ['Users'],
      summary: 'Cari pegawai untuk pembuatan user',
      description: 'Mencari data pegawai yang belum memiliki akun user.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'search',
          in: 'query',
          schema: { type: 'string' },
          description: 'Cari berdasarkan nama atau NIP pegawai',
        },
      ],
      responses: {
        '200': { description: 'Hasil pencarian pegawai' },
        '401': { $ref: '#/components/responses/Unauthorized' },
      },
    },
  },

  '/users/{id}': {
    get: {
      tags: ['Users'],
      summary: 'Get user by ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/id' }],
      responses: {
        '200': { description: 'Data user berhasil diambil' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
    put: {
      tags: ['Users'],
      summary: 'Update user by ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/id' }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                username: {
                  type: 'string',
                  minLength: 6,
                  example: 'johndoe01',
                },
                role: { $ref: '#/components/schemas/Role' },
                statusAktif: { $ref: '#/components/schemas/StatusAktif' },
              },
            },
          },
        },
      },
      responses: {
        '200': { description: 'User berhasil diupdate' },
        '400': { $ref: '#/components/responses/BadRequest' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
    delete: {
      tags: ['Users'],
      summary: 'Hapus user by ID',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/id' }],
      responses: {
        '200': { description: 'User berhasil dihapus' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
  },

  '/users/{id}/toggle-status': {
    patch: {
      tags: ['Users'],
      summary: 'Toggle status aktif user',
      security: [{ bearerAuth: [] }],
      parameters: [{ $ref: '#/components/parameters/id' }],
      responses: {
        '200': { description: 'Status user berhasil diubah' },
        '401': { $ref: '#/components/responses/Unauthorized' },
        '404': { $ref: '#/components/responses/NotFound' },
      },
    },
  },
};
