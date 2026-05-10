'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiEdit, FiMail, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Card from '@/components/ui/card';
import PageHeader from '@/components/ui/pageHeader';
import SkeletonBox from '@/components/ui/skeletonBox';
import AvatarAlphabet from '@/components/ui/avatarAlphabet';
import Request from '@/utils/request';
import useAuthStore from '@/store/authStore';
import { UserLogin } from '@/types/auth';
import { User } from '@/types/user';

export default function ProfilePage() {
  const user: UserLogin | null = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (!profile?.pegawai?.foto) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImageUrl(
      `${process.env.NEXT_PUBLIC_IMAGES_URL}/${profile.pegawai.foto}?t=${new Date().getTime()}`
    );
  }, [profile?.pegawai?.foto]);

  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      try {
        setLoading(true);
        const response = await Request.GET(`/users/${user.id}`);

        if (response.success) {
          setProfile(response.data);
        } else {
          toast.error('Gagal memuat data profile');
        }
      } catch {
        toast.error('Gagal terhubung ke server');
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  const Skeleton = () => (
    <div className='row g-4 mt-1'>
      <div className='col-12 col-lg-4'>
        <div className='d-flex flex-column align-items-center text-center gap-3'>
          <SkeletonBox className='rounded-circle' width={140} height={140} />
          <SkeletonBox className='rounded-3' width={180} height={20} />
          <SkeletonBox className='rounded-3' width={120} height={16} />
        </div>
      </div>
      <div className='col-12 col-lg-8'>
        <div className='d-flex flex-column gap-3'>
          {[...Array(2)].map((_, i) => (
            <div key={i} className='border rounded-4 p-4 bg-light-subtle'>
              <SkeletonBox className='rounded-3 mb-2' width={120} height={14} />
              <SkeletonBox className='rounded-3' width='100%' height={20} />
            </div>
          ))}
        </div>
        <div className='d-flex flex-column flex-sm-row justify-content-end gap-2 border-top pt-4 mt-4'>
          <SkeletonBox className='rounded-3' width={120} height={42} />
          <SkeletonBox className='rounded-3' width={160} height={42} />
        </div>
      </div>
    </div>
  );

  return (
    <Card className='w-100 bg-white border shadow-sm rounded-4 p-4'>
      <PageHeader
        title='Profile'
        description='Kelola informasi profile anda.'
      />
      {loading ? (
        // eslint-disable-next-line react-hooks/static-components
        <Skeleton />
      ) : (
        <div className='row g-4 mt-1'>
          <div className='col-12 col-lg-4'>
            <div className='d-flex flex-column align-items-center text-center'>
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt='Profile'
                  width={140}
                  height={140}
                  className='rounded-circle object-fit-cover border border-3 shadow-sm'
                  style={{
                    width: 140,
                    height: 140,
                  }}
                />
              ) : (
                <AvatarAlphabet
                  name={profile?.pegawai?.nama || ''}
                  size={140}
                />
              )}
              <div className='mt-3'>
                <h5 className='fw-bold mb-1 text-dark'>
                  {profile?.pegawai?.nama || '-'}
                </h5>
                <p className='text-secondary mb-0 small'>
                  {profile?.role || '-'}
                </p>
              </div>
            </div>
          </div>
          <div className='col-12 col-lg-8'>
            <div className='d-flex flex-column gap-3'>
              <div className='border rounded-4 p-4 bg-light-subtle'>
                <div className='d-flex align-items-start gap-3'>
                  <div className='bg-white border rounded-3 p-2 text-secondary shadow-sm'>
                    <FiUser size={18} />
                  </div>
                  <div>
                    <p className='text-secondary small mb-1'>Nama Lengkap</p>
                    <h6 className='fw-semibold text-dark mb-0'>
                      {profile?.pegawai?.nama || '-'}
                    </h6>
                  </div>
                </div>
              </div>
              <div className='border rounded-4 p-4 bg-light-subtle'>
                <div className='d-flex align-items-start gap-3'>
                  <div className='bg-white border rounded-3 p-2 text-secondary shadow-sm'>
                    <FiMail size={18} />
                  </div>
                  <div>
                    <p className='text-secondary small mb-1'>Email</p>
                    <h6 className='fw-semibold text-dark mb-0'>
                      {profile?.pegawai?.email || '-'}
                    </h6>
                  </div>
                </div>
              </div>
            </div>
            <div className='d-flex flex-column flex-sm-row justify-content-end gap-2 border-top pt-4 mt-4'>
              <Link
                href='/dashboard'
                className='btn btn-outline-secondary rounded-3 d-flex align-items-center justify-content-center gap-2 px-4'
              >
                <FiArrowLeft size={16} />
                Kembali
              </Link>
              <Link
                href='/profile/edit'
                className='btn btn-primary rounded-3 d-flex align-items-center justify-content-center gap-2 px-4 shadow-sm'
              >
                <FiEdit size={16} />
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
