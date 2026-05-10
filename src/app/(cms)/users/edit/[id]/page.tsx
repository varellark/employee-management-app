'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FiShield } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Card from '@/components/ui/card';
import Request from '@/utils/request';
import FormHeader from '@/components/ui/formHeader';
import FormActions from '@/components/ui/formActions';

type FormValues = {
  username: string;
  role: string;
  statusAktif: boolean;
};

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [pegawaiName, setPegawaiName] = useState('');
  const [pegawaiEmail, setPegawaiEmail] = useState('');
  const [pegawaiPhone, setPegawaiPhone] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      statusAktif: true,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const username = watch('username');

  const usernameValidation = React.useMemo(() => {
    const regex = /^[a-z0-9]+$/;
    return {
      min: (username?.length ?? 0) >= 6,
      noSpace: !/\s/.test(username || ''),
      validChar: regex.test(username || ''),
    };
  }, [username]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoadingData(true);
        const response = await Request.GET(`/users/${id}`);
        if (response.success) {
          const data = response.data;
          setValue('username', data.username || '');
          setValue('role', data.role || '');
          setValue('statusAktif', data.statusAktif === 'ACTIVE');
          setPegawaiName(data.pegawai?.nama || '');
          setPegawaiEmail(data.pegawai?.email || '');
          setPegawaiPhone(data.pegawai?.nomorHp || '');
        } else {
          toast.error(response.message || 'Gagal memuat data user');
          router.push('/users');
        }
      } catch {
        toast.error('Gagal terhubung ke server');
        router.push('/users');
      } finally {
        setLoadingData(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id, router, setValue]);

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      const payload: Record<string, unknown> = {};
      if (data.username) payload.username = data.username;
      if (data.role) payload.role = data.role;
      payload.statusAktif = data.statusAktif ? 'ACTIVE' : 'NON_ACTIVE';

      const response = await Request.PUT(`/users/${id}`, payload);
      if (response.success) {
        toast.success(response.message || 'User berhasil diperbarui');
        router.push('/users');
      } else {
        toast.error(response.message || 'Gagal memperbarui user');
      }
    } catch {
      toast.error('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Card className='w-100 bg-white border shadow-sm rounded-4 p-4'>
        <div className='d-flex justify-content-center align-items-center py-5'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className='w-100 bg-white border shadow-sm rounded-4 p-4'>
      <FormHeader
        title='Edit User'
        description='Perbarui informasi akun user yang sudah ada.'
        icon={<FiShield size={32} />}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='row g-4'>
          <div className='col-12'>
            <label className='form-label fw-semibold'>Nama Pengguna</label>
            <input
              type='text'
              disabled
              value={pegawaiName}
              className='form-control rounded-3 bg-light'
            />
            <small className='text-secondary'>
              Nama pegawai tidak dapat diubah.
            </small>
          </div>
          <div className='col-12 col-md-6'>
            <label className='form-label fw-semibold'>Username</label>
            <input
              type='text'
              className={`form-control rounded-3 ${errors.username ? 'is-invalid' : ''}`}
              placeholder='Masukkan username'
              {...register('username', {
                required: 'Username wajib diisi',
                minLength: {
                  value: 6,
                  message: 'Minimal 6 karakter',
                },
                pattern: {
                  value: /^[a-z0-9]+$/,
                  message: 'Hanya huruf kecil dan angka tanpa spasi',
                },
              })}
            />
            <div className='mt-2 small'>
              <div
                className={
                  usernameValidation.min ? 'text-success' : 'text-secondary'
                }
              >
                • Minimal 6 karakter
              </div>
              <div
                className={
                  usernameValidation.noSpace ? 'text-success' : 'text-secondary'
                }
              >
                • Tidak boleh ada spasi
              </div>
              <div
                className={
                  usernameValidation.validChar
                    ? 'text-success'
                    : 'text-secondary'
                }
              >
                • Hanya huruf kecil dan angka
              </div>
            </div>
            {errors.username && (
              <div className='text-danger small mt-1'>
                {errors.username.message}
              </div>
            )}
          </div>
          <div className='col-12 col-md-6'>
            <label className='form-label fw-semibold'>Role</label>
            <select
              className={`form-select rounded-3 ${errors.role ? 'is-invalid' : ''}`}
              {...register('role', {
                required: 'Role wajib dipilih',
              })}
            >
              <option value=''>Pilih Role</option>
              <option value='SUPERADMIN'>SUPERADMIN</option>
              <option value='MANAGER_HRD'>MANAGER_HRD</option>
              <option value='ADMIN_HRD'>ADMIN_HRD</option>
            </select>
            {errors.role && (
              <div className='text-danger small mt-1'>
                {errors.role.message}
              </div>
            )}
          </div>
          <div className='col-12 col-md-6'>
            <label className='form-label fw-semibold'>Email</label>
            <input
              type='email'
              disabled
              value={pegawaiEmail}
              className='form-control rounded-3 bg-light'
            />
          </div>
          <div className='col-12 col-md-6'>
            <label className='form-label fw-semibold'>No. Seluler</label>
            <input
              type='text'
              disabled
              value={pegawaiPhone}
              className='form-control rounded-3 bg-light'
            />
          </div>
          <div className='col-12'>
            <div className='form-check'>
              <input
                type='checkbox'
                className='form-check-input'
                id='statusAktif'
                {...register('statusAktif')}
              />
              <label
                htmlFor='statusAktif'
                className='form-check-label fw-medium'
              >
                Aktif
              </label>
            </div>
            <small className='text-secondary'>
              User aktif dapat login ke sistem.
            </small>
          </div>
        </div>
        <div className='mt-4'>
          <FormActions
            cancelTo='/users'
            submitLabel='Simpan Perubahan'
            loading={loading}
            disabled={loading}
          />
        </div>
      </form>
    </Card>
  );
}
