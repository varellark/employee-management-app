'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FiShield } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Card from '@/components/ui/card';
import Request from '@/utils/request';
import FormHeader from '@/components/ui/formHeader';
import FormActions from '@/components/ui/formActions';
import { Pegawai } from '@/types/pegawai';

type FormValues = {
  pegawaiId: string;
  username: string;
  role: string;
  statusAktif: boolean;
};

export default function AddUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingPegawai, setLoadingPegawai] = useState(false);
  const [pegawaiKeyword, setPegawaiKeyword] = useState('');
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | null>(null);

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

  useEffect(() => {
    if (
      selectedPegawai &&
      pegawaiKeyword === selectedPegawai.nama
    ) {
      return;
    }

    const delayDebounce = setTimeout(async () => {
      if (pegawaiKeyword.trim().length < 2) {
        setPegawaiList([]);
        return;
      }

      try {
        setLoadingPegawai(true);
        const response = await Request.GET(
          `/users/search-pegawai?q=${pegawaiKeyword}`
        );
        if (response.success) {
          setPegawaiList(response.data || []);
        }
      } catch {
        toast.error('Gagal mengambil data pegawai');
      } finally {
        setLoadingPegawai(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [pegawaiKeyword, selectedPegawai]);

  const usernameValidation = useMemo(() => {
    const regex = /^[a-z0-9]+$/;

    return {
      min: username?.length >= 6,
      noSpace: !/\s/.test(username || ''),
      validChar: regex.test(username || ''),
    };
  }, [username]);

  const selectPegawai = (pegawai: Pegawai) => {
    setSelectedPegawai(pegawai);
    setPegawaiKeyword(pegawai.nama);
    setPegawaiList([]);

    setValue('pegawaiId', String(pegawai.id));
  };

  const onSubmit = async (data: FormValues) => {
    if (!selectedPegawai) {
      toast.error('Silakan pilih pegawai dari daftar');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        pegawaiId: Number(data.pegawaiId),
        username: data.username,
        role: data.role,
        statusAktif: data.statusAktif ? 'ACTIVE' : 'NON_ACTIVE',
      };

      const response = await Request.POST('/users', payload);

      if (response.success) {
        toast.success(response.message || 'User berhasil dibuat');
        if (response.data?.defaultPassword) {
          toast.info(`Password default: ${response.data.defaultPassword}`);
        }
        router.push('/users');
      } else {
        toast.error(response.message || 'Gagal membuat user');
      }
    } catch {
      toast.error('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className='w-100 bg-white border shadow-sm rounded-4 p-4'>
      <FormHeader
        title='Tambah User'
        description='Tambahkan akun user baru ke dalam sistem.'
        icon={<FiShield size={32} />}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='row g-4'>
          <div className='col-12 position-relative'>
            <label className='form-label fw-semibold'>Nama Pengguna</label>
            <input
              type='text'
              className='form-control rounded-3'
              placeholder='Cari nama pegawai minimal 2 huruf'
              value={pegawaiKeyword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPegawaiKeyword(e.target.value);
                setSelectedPegawai(null);
              }}
            />
            <input
              type='hidden'
              {...register('pegawaiId', {
                required: 'Pegawai wajib dipilih',
              })}
            />
            {pegawaiList.length > 0 && (
              <div
                className='position-absolute bg-white border rounded-3 shadow-sm mt-1 w-100 overflow-auto'
                style={{
                  zIndex: 20,
                  maxHeight: '240px',
                }}
              >
                {pegawaiList.map((pegawai) => (
                  <button
                    key={pegawai.id}
                    type='button'
                    onClick={() => selectPegawai(pegawai)}
                    className='dropdown-item py-2 px-3'
                  >
                    <div className='fw-medium'>{pegawai.nama}</div>
                    <small className='text-secondary'>{pegawai.email}</small>
                  </button>
                ))}
              </div>
            )}
            {loadingPegawai && (
              <small className='text-secondary'>Mencari pegawai...</small>
            )}
            {errors.pegawaiId && (
              <div className='text-danger small mt-1'>
                {errors.pegawaiId.message}
              </div>
            )}
          </div>
          <div className='col-12 col-md-6'>
            <label className='form-label fw-semibold'>Username</label>
            <input
              type='text'
              className='form-control rounded-3'
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
              className='form-select rounded-3'
              {...register('role', {
                required: 'Role wajib dipilih',
              })}
            >
              <option value=''>Pilih Role</option>
              <option value='SUPERADMIN'>SUPERADMIN</option>
              <option value='MANAGER_HRD'>MANAGER_HRD</option>
              <option value='ADMIN_HRD'>ADMIN_HRD</option>
            </select>
          </div>
          <div className='col-12 col-md-6'>
            <label className='form-label fw-semibold'>Email</label>
            <input
              type='email'
              disabled
              value={selectedPegawai?.email || ''}
              className='form-control rounded-3 bg-light'
            />
          </div>
          <div className='col-12 col-md-6'>
            <label className='form-label fw-semibold'>No. Seluler</label>
            <input
              type='text'
              disabled
              value={selectedPegawai?.nomorHp || ''}
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
            submitLabel='Simpan User'
            loading={loading}
            disabled={loading}
          />
        </div>
      </form>
    </Card>
  );
}
