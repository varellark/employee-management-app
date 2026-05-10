'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FiDatabase } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Card from '@/components/ui/card';
import FormHeader from '@/components/ui/formHeader';
import FormActions from '@/components/ui/formActions';
import Request from '@/utils/request';
import { formatRupiah } from '@/utils/format';

type FormValues = {
  baseFare: string;
  keterangan: string;
  statusAktif: boolean;
};

export default function AddSettingTunjanganPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      statusAktif: true,
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const baseFareValue = watch('baseFare');

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      const payload = {
        baseFare: Number(data.baseFare),
        keterangan: data.keterangan || null,
        statusAktif: data.statusAktif ? 'ACTIVE' : 'NON_ACTIVE',
      };
      const response = await Request.POST('/setting-tunjangan', payload);
      if (response.success) {
        toast.success(
          response.message || 'Setting tunjangan berhasil ditambahkan'
        );
        router.push('/setting-tunjangan');
      } else {
        toast.error(response.message || 'Gagal menambahkan setting tunjangan');
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
        title='Tambah Setting Tunjangan'
        description='Tambahkan pengaturan base fare tunjangan transport pegawai.'
        icon={<FiDatabase size={32} />}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='row g-4'>
          <div className='col-12'>
            <label className='form-label fw-semibold'>Base Fare</label>
            <input
              type='number'
              min={0}
              className='form-control rounded-3'
              placeholder='Masukkan base fare'
              {...register('baseFare', {
                required: 'Base fare wajib diisi',
                min: {
                  value: 1,
                  message: 'Base fare minimal 1',
                },
              })}
            />
            {baseFareValue && Number(baseFareValue) > 0 && (
              <small className='text-secondary mt-2 d-block'>
                Preview:{' '}
                <span className='fw-semibold text-dark'>
                  {formatRupiah(Number(baseFareValue))}
                </span>
              </small>
            )}
            {errors.baseFare && (
              <div className='text-danger small mt-1'>
                {errors.baseFare.message}
              </div>
            )}
          </div>
          <div className='col-12'>
            <label className='form-label fw-semibold'>Keterangan</label>
            <textarea
              rows={4}
              className='form-control rounded-3'
              placeholder='Masukkan keterangan (opsional)'
              {...register('keterangan')}
            />
          </div>
          <div className='col-12'>
            <div className='form-check form-switch'>
              <input
                type='checkbox'
                className='form-check-input'
                id='statusAktif'
                {...register('statusAktif')}
                style={{
                  width: '2.5rem',
                  height: '1.3rem',
                  cursor: 'pointer',
                }}
              />
              <label
                htmlFor='statusAktif'
                className='form-check-label fw-medium ms-2'
              >
                Aktifkan Setting
              </label>
            </div>
            <small className='text-secondary'>
              Jika aktif, maka setting aktif sebelumnya otomatis dinonaktifkan.
            </small>
          </div>
        </div>
        <div className='mt-4'>
          <FormActions
            cancelTo='/setting-tunjangan'
            submitLabel='Simpan Setting'
            loading={loading}
            disabled={loading}
          />
        </div>
      </form>
    </Card>
  );
}
