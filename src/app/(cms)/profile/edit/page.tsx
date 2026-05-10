'use client';

import React, { useEffect, useState } from 'react';
import {
  FiArrowLeft,
  FiMail,
  FiPhone,
  FiUser,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Card from '@/components/ui/card';
import PageHeader from '@/components/ui/pageHeader';
import SkeletonBox from '@/components/ui/skeletonBox';
import AvatarAlphabet from '@/components/ui/avatarAlphabet';
import Request from '@/utils/request';
import useAuthStore from '@/store/authStore';
import { UserLogin } from '@/types/auth';

type FormValues = {
  name: string;
  email: string;
  phone: string;
  password?: string;
  confirmPassword?: string;
};

type PasswordRule = {
  label: string;
  test: (val: string) => boolean;
};

const PASSWORD_RULES: PasswordRule[] = [
  { label: 'Minimal 8 karakter', test: (v) => v.length >= 8 },
  { label: 'Tidak ada spasi', test: (v) => !/\s/.test(v) },
  { label: 'Minimal 1 huruf besar', test: (v) => /[A-Z]/.test(v) },
  { label: 'Minimal 1 huruf kecil', test: (v) => /[a-z]/.test(v) },
  { label: 'Minimal 1 karakter khusus', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

function ProfileSkeleton() {
  return (
    <div className='row g-4 mt-3'>
      <div className='col-lg-4 d-flex flex-column align-items-center'>
        <SkeletonBox className='rounded-circle' width={140} height={140} />
        <SkeletonBox className='mt-3' width={160} height={22} />
        <SkeletonBox className='mt-2' width={90} height={16} />
      </div>
      <div className='col-lg-8'>
        <SkeletonBox className='mb-1' width={60} height={16} />
        <SkeletonBox className='mb-3' width='100%' height={40} />
        <SkeletonBox className='mb-1' width={50} height={16} />
        <SkeletonBox className='mb-3' width='100%' height={40} />
        <SkeletonBox className='mb-1' width={70} height={16} />
        <SkeletonBox className='mb-3' width='100%' height={40} />
        <SkeletonBox className='mb-1' width={120} height={16} />
        <SkeletonBox className='mb-3' width='100%' height={40} />
        <div className='d-flex justify-content-end gap-2 border-top pt-3 mt-2'>
          <SkeletonBox width={90} height={38} />
          <SkeletonBox width={80} height={38} />
        </div>
      </div>
    </div>
  );
}

function RuleItem({ label, passed }: { label: string; passed: boolean }) {
  return (
    <li
      className={`d-flex align-items-center gap-1 small mb-1 ${
        passed ? 'text-success' : 'text-muted'
      }`}
    >
      {passed ? <FiCheck size={12} /> : <FiX size={12} />}
      {label}
    </li>
  );
}

export default function EditProfilePage() {
  const user: UserLogin | null = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadSubmit, setLoadSubmit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLive, setPasswordLive] = useState('');
  const [confirmLive, setConfirmLive] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>();

  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      try {
        setLoading(true);
        const res = await Request.GET(`/users/${user.id}`);
        if (res.success) {
          const data = res.data;
          setValue('name', data.pegawai?.nama || '');
          setValue('email', data.pegawai?.email || '');
          setValue('phone', data.pegawai?.nomorHp || '');
        } else {
          toast.error('Gagal memuat profile');
        }
      } catch {
        toast.error('Gagal terhubung ke server');
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id, setValue]);

  const validatePassword = (val?: string) => {
    if (!val) return true;
    for (const rule of PASSWORD_RULES) {
      if (!rule.test(val)) return rule.label;
    }
    return true;
  };

  const validateConfirm = (val?: string) => {
    const pwd = getValues('password');
    if (!pwd) return true;
    if (val !== pwd) return 'Password tidak cocok';
    return true;
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setLoadSubmit(true);

      const fd = new FormData();
      fd.append('name', data.name);
      fd.append('email', data.email);
      if (data.phone) fd.append('phone', data.phone);
      if (data.password) fd.append('password', data.password);

      const res = await Request.PUT_FORM(`/users/me`, fd);
      if (res.success) {
        const updated = res.data;
        updateUser({
          username: updated.pegawai?.nama ?? user?.username,
        });
        toast.success('Profile berhasil diperbarui');
        router.push('/profile');
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Server error');
    } finally {
      setLoadSubmit(false);
    }
  };

  const passwordRulesPassed = PASSWORD_RULES.map((r) => r.test(passwordLive));
  const allRulesPassed = passwordRulesPassed.every(Boolean);
  const confirmMatches = confirmLive === passwordLive && confirmLive !== '';

  return (
    <Card className='w-100 bg-white border shadow-sm rounded-4 p-4'>
      <PageHeader title='Ubah Profile' description='Edit data profile kamu' />
      {loading ? (
        <ProfileSkeleton />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className='row g-4 mt-3'>
          <div className='col-lg-4 d-flex flex-column align-items-center'>
            <AvatarAlphabet name={user?.username || ''} size={140} />
            <h5 className='mt-3 mb-0 text-center'>{user?.username}</h5>
            <small className='text-muted'>{user?.role}</small>
          </div>
          <div className='col-lg-8'>
            <div className='mb-3'>
              <label className='form-label fw-semibold'>Nama</label>
              <div className='input-group'>
                <span className='input-group-text'>
                  <FiUser />
                </span>
                <input
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  placeholder='Nama lengkap'
                  {...register('name', { required: 'Nama wajib diisi' })}
                />
              </div>
              {errors.name && (
                <small className='text-danger'>{errors.name.message}</small>
              )}
            </div>
            <div className='mb-3'>
              <label className='form-label fw-semibold'>Email</label>
              <div className='input-group'>
                <span className='input-group-text'>
                  <FiMail />
                </span>
                <input
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder='email@contoh.com'
                  {...register('email', {
                    required: 'Email wajib diisi',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Format email tidak valid',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <small className='text-danger'>{errors.email.message}</small>
              )}
            </div>
            <div className='mb-3'>
              <label className='form-label fw-semibold'>Telepon</label>
              <div className='input-group'>
                <span className='input-group-text'>
                  <FiPhone />
                </span>
                <input
                  className='form-control'
                  placeholder='+628xxxxxxxx'
                  {...register('phone')}
                />
              </div>
            </div>
            <div className='mb-1'>
              <label className='form-label fw-semibold'>
                Password Baru{' '}
                <small className='text-muted fw-normal'>
                  (kosongkan jika tidak ingin mengubah)
                </small>
              </label>
              <div className='input-group'>
                <span className='input-group-text'>
                  <FiLock />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  placeholder='Password baru'
                  {...register('password', { validate: validatePassword })}
                  onKeyUp={(e) =>
                    setPasswordLive((e.target as HTMLInputElement).value)
                  }
                />
                <button
                  type='button'
                  className='btn btn-outline-secondary'
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && (
                <small className='text-danger'>{errors.password.message}</small>
              )}
            </div>
            {passwordLive.length > 0 && (
              <div className='mb-3 ps-1'>
                <ul className='list-unstyled mb-0'>
                  {PASSWORD_RULES.map((rule, i) => (
                    <RuleItem
                      key={i}
                      label={rule.label}
                      passed={passwordRulesPassed[i]}
                    />
                  ))}
                </ul>
              </div>
            )}
            {passwordLive.length > 0 && (
              <div className='mb-3'>
                <label className='form-label fw-semibold'>
                  Ketik Ulang Password
                </label>
                <div className='input-group'>
                  <span className='input-group-text'>
                    <FiLock />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`form-control ${
                      errors.confirmPassword
                        ? 'is-invalid'
                        : confirmLive.length > 0
                          ? confirmMatches
                            ? 'is-valid'
                            : 'is-invalid'
                          : ''
                    }`}
                    placeholder='Ulangi password baru'
                    {...register('confirmPassword', {
                      validate: validateConfirm,
                    })}
                    onKeyUp={(e) =>
                      setConfirmLive((e.target as HTMLInputElement).value)
                    }
                  />
                  <button
                    type='button'
                    className='btn btn-outline-secondary'
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {confirmLive.length > 0 && (
                  <small
                    className={confirmMatches ? 'text-success' : 'text-danger'}
                  >
                    {confirmMatches
                      ? '✓ Password cocok'
                      : '✗ Password tidak cocok'}
                  </small>
                )}
                {errors.confirmPassword && !confirmLive && (
                  <small className='text-danger'>
                    {errors.confirmPassword.message}
                  </small>
                )}
              </div>
            )}
            <div className='d-flex justify-content-end gap-2 border-top pt-3 mt-4'>
              <button
                type='button'
                className='btn btn-outline-secondary'
                onClick={() => router.back()}
              >
                <FiArrowLeft className='me-1' />
                Batal
              </button>
              <button
                disabled={
                  loadSubmit ||
                  (passwordLive.length > 0 &&
                    (!allRulesPassed || !confirmMatches))
                }
                className='btn btn-primary'
                type='submit'
              >
                {loadSubmit ? (
                  <>
                    <span
                      className='spinner-border spinner-border-sm me-1'
                      role='status'
                    />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan'
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </Card>
  );
}
