'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { FiRefreshCw } from 'react-icons/fi';
import Request from '@/utils/request';

type LoginFormValues = {
  identifier: string;
  password: string;
  captcha: string;
  rememberMe: boolean;
};

function generateCaptcha() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function LoginPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: {
      identifier: '',
      password: '',
      captcha: '',
      rememberMe: false,
    },
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setCaptchaCode(generateCaptcha());
  }, []);

  const refreshCaptcha = () => setCaptchaCode(generateCaptcha());

  const handleLogin = async (data: LoginFormValues) => {
    try {
      setLoading(true);
      const response = await Request.POST('/auth/login', {
        identifier: data.identifier,
        password: data.password,
        captcha: data.captcha,
        captchaCode,
        rememberMe: data.rememberMe,
      });

      if (response.success) {
        toast.success(response.message || 'OTP berhasil dikirim ke email');
        router.push(
          `/verify?userId=${response.data.userId}&rememberMe=${data.rememberMe}`
        );
      } else {
        toast.error(response.message || 'Login gagal');
        refreshCaptcha();
        setValue('captcha', '');
        return;
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className='card border-0 shadow rounded-4 overflow-hidden'>
      <div className='card-body p-4 p-lg-5'>
        <div className='mb-4'>
          <p
            className='text-uppercase fw-semibold mb-1'
            style={{ fontSize: 11, letterSpacing: '0.12em', color: '#1a6fb5' }}
          >
            Employee Management System
          </p>
          <h2 className='fw-bold mb-1' style={{ letterSpacing: '-0.01em' }}>
            Selamat Datang
          </h2>
          <p className='text-muted mb-0' style={{ fontSize: 14 }}>
            Masuk ke akun Anda untuk melanjutkan
          </p>
        </div>
        <hr className='mb-4' />
        <form onSubmit={handleSubmit(handleLogin)} noValidate>
          <div className='mb-3'>
            <label
              className='form-label text-uppercase fw-semibold'
              style={{ fontSize: 11, letterSpacing: '0.08em' }}
            >
              Username / Email / No. HP
            </label>
            <input
              type='text'
              className={`form-control ${errors.identifier ? 'is-invalid' : ''}`}
              placeholder='Masukkan username, email, atau no. HP'
              {...register('identifier', {
                required: 'Identifier wajib diisi',
              })}
            />
            {errors.identifier && (
              <div className='invalid-feedback'>
                {errors.identifier.message}
              </div>
            )}
          </div>
          <div className='mb-3'>
            <label
              className='form-label text-uppercase fw-semibold'
              style={{ fontSize: 11, letterSpacing: '0.08em' }}
            >
              Password
            </label>
            <input
              type='password'
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder='Masukkan password'
              {...register('password', {
                required: 'Password wajib diisi',
              })}
            />
            {errors.password && (
              <div className='invalid-feedback'>{errors.password.message}</div>
            )}
          </div>
          <div className='mb-3'>
            <label
              className='form-label text-uppercase fw-semibold'
              style={{ fontSize: 11, letterSpacing: '0.08em' }}
            >
              Captcha
            </label>
            <div className='d-flex gap-2 mb-2'>
              <div
                className='d-flex align-items-center justify-content-center rounded-3 text-white fw-bold user-select-none flex-grow-1'
                style={{
                  height: 46,
                  backgroundColor: '#04355f',
                  fontFamily: 'monospace',
                  fontSize: 18,
                  letterSpacing: '0.25em',
                }}
              >
                {captchaCode}
              </div>
              <button
                type='button'
                className='btn btn-outline-primary rounded-3 d-flex align-items-center gap-2'
                style={{ height: 46 }}
                onClick={refreshCaptcha}
                aria-label='Refresh captcha'
              >
                <FiRefreshCw size={16} />
                Refresh
              </button>
            </div>
            <input
              type='text'
              className={`form-control ${errors.captcha ? 'is-invalid' : ''}`}
              placeholder='Ketik kode captcha di atas'
              autoComplete='off'
              {...register('captcha', { required: 'Captcha wajib diisi' })}
            />
            {errors.captcha && (
              <div className='invalid-feedback'>{errors.captcha.message}</div>
            )}
          </div>
          <div className='form-check mb-4'>
            <input
              className='form-check-input'
              type='checkbox'
              id='rememberMe'
              {...register('rememberMe')}
            />
            <label
              className='form-check-label'
              htmlFor='rememberMe'
              style={{ fontSize: 14 }}
            >
              Ingat saya selama 30 hari
            </label>
          </div>
          <button
            type='submit'
            disabled={loading}
            className='btn w-100 py-2 fw-semibold rounded-3 text-white'
            style={{ backgroundColor: '#04355f', borderColor: '#04355f' }}
          >
            {loading && (
              <span
                className='spinner-border spinner-border-sm me-2'
                role='status'
                aria-hidden='true'
              />
            )}
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
