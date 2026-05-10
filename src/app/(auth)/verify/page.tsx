'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import useAuthStore from '@/store/authStore';
import Request from '@/utils/request';
import OtpInput from '@/components/ui/otpInput';

type VerifyOtpValues = {
  otp: string;
};

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);
  const userId = searchParams.get('userId');
  const rememberMe = searchParams.get('rememberMe') === 'true';

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<VerifyOtpValues>({
    defaultValues: {
      otp: '',
    },
  });

  useEffect(() => {
    register('otp', {
      required: 'OTP wajib diisi',
      validate: (value) => {
        if (!value || value.length === 0) {
          return 'OTP wajib diisi';
        }
        if (value.length !== 6) {
          return 'OTP harus 6 digit';
        }
        if (!/^\d+$/.test(value)) {
          return 'OTP hanya boleh angka';
        }
        return true;
      },
    });
  }, [register]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const otpValue = watch('otp');

  const handleVerifyOtp = async (data: VerifyOtpValues) => {
    try {
      setLoading(true);

      const response = await Request.POST('/auth/verify-otp', {
        userId: Number(userId),
        otp: data.otp,
        rememberMe,
      });

      if (response.success) {
        login(response.data.accessToken, response.data.user);
        sessionStorage.setItem('loginSuccess', 'true');
        router.push('/dashboard');
      } else {
        toast.error(response.message || 'Verifikasi gagal');
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='card border-0 shadow rounded-4 overflow-hidden'>
      <div className='card-body p-4 p-lg-5'>
        <div className='mb-4'>
          <p
            className='text-uppercase fw-semibold mb-1'
            style={{
              fontSize: 11,
              letterSpacing: '0.12em',
              color: '#1a6fb5',
            }}
          >
            Verifikasi 2 Langkah
          </p>
          <h2 className='fw-bold mb-1' style={{ letterSpacing: '-0.01em' }}>
            Masukkan OTP
          </h2>
          <p className='text-muted mb-0' style={{ fontSize: 14 }}>
            Kode 6 digit telah dikirim ke email Anda
          </p>
        </div>
        <hr className='mb-4' />
        <form onSubmit={handleSubmit(handleVerifyOtp)} noValidate>
          <div className='mb-4'>
            <label
              className='form-label text-uppercase fw-semibold'
              style={{
                fontSize: 11,
                letterSpacing: '0.08em',
              }}
            >
              Kode OTP
            </label>
            <OtpInput
              value={otpValue}
              disabled={loading}
              error={isSubmitted ? errors.otp?.message : undefined}
              onChangeAction={(value) => {
                setValue('otp', value, {
                  shouldValidate: false,
                });
              }}
            />
          </div>
          <button
            type='submit'
            disabled={loading || otpValue.length !== 6}
            className='btn w-100 py-2 fw-semibold rounded-3 text-white'
            style={{
              backgroundColor: '#04355f',
              borderColor: '#04355f',
            }}
          >
            {loading && (
              <span
                className='spinner-border spinner-border-sm me-2'
                role='status'
                aria-hidden='true'
              />
            )}
            {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
          </button>
          <button
            type='button'
            className='btn btn-link w-100 mt-3 text-decoration-none'
            style={{
              fontSize: 13,
              color: '#04355f',
            }}
            onClick={() => router.push('/login')}
          >
            Kembali ke halaman login
          </button>
        </form>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
