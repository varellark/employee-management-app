'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export default function EditSettingTunjanganPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

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
  const baseFareValue = watch('baseFare');

  useEffect(() => {
    const fetchSetting = async () => {
      try {
        setLoadingData(true);
        const response = await Request.GET(`/setting-tunjangan/${id}`);
        if (response.success) {
          const data = response.data;
          setValue('baseFare', String(data.baseFare || ''));
          setValue('keterangan', data.keterangan || '');
          setValue('statusAktif', data.statusAktif === 'ACTIVE');
        } else {
          toast.error(
            response.message || 'Gagal memuat data setting tunjangan'
          );
          router.push('/setting-tunjangan');
        }
      } catch {
        toast.error('Gagal terhubung ke server');
        router.push('/setting-tunjangan');
      } finally {
        setLoadingData(false);
      }
    };

    if (id) {
      fetchSetting();
    }
  }, [id, router, setValue]);

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      const payload = {
        baseFare: Number(data.baseFare),
        keterangan: data.keterangan || null,
        statusAktif: data.statusAktif ? 'ACTIVE' : 'NON_ACTIVE',
      };
      const response = await Request.PUT(`/setting-tunjangan/${id}`, payload);
      if (response.success) {
        toast.success(
          response.message || 'Setting tunjangan berhasil diperbarui'
        );
        router.push('/setting-tunjangan');
      } else {
        toast.error(response.message || 'Gagal memperbarui setting tunjangan');
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
        title='Edit Setting Tunjangan'
        description='Perbarui pengaturan base fare tunjangan transport pegawai.'
        icon={<FiDatabase size={32} />}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='row g-4'>
          <div className='col-12'>
            <label className='form-label fw-semibold'>Base Fare</label>
            <input
              type='number'
              min={0}
              className={`form-control rounded-3 ${
                errors.baseFare ? 'is-invalid' : ''
              }`}
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
            submitLabel='Simpan Perubahan'
            loading={loading}
            disabled={loading}
          />
        </div>
      </form>
    </Card>
  );
}
