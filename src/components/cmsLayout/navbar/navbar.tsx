'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FiBell, FiChevronDown, FiMenu } from 'react-icons/fi';
import AvatarAlphabet from '@/components/ui/avatarAlphabet';
import ModalConfirmLogout from '@/components/ui/modalConfirm';
import useAuthStore from '@/store/authStore';
import type { UserLogin } from '@/types/auth';
import { toast } from 'react-toastify';
import Link from 'next/link';
import Request from '@/utils/request';

interface NavbarProps {
  toggleSidebarAction?: () => void;
  user?: UserLogin | null;
}

export default function Navbar({ toggleSidebarAction, user }: NavbarProps) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('.dropdown-user') &&
        !target.closest('.dropdown-notif')
      ) {
        setOpenDropdown(false);
        setOpenNotif(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogoutClick = async () => {
    setLoading(true);
    try {
      await Request.POST('/auth/logout', {});
      logout();
      toast.success('Berhasil logout');
      router.push('/login');
    } catch (error) {
      console.error(error);
      toast.error('Gagal logout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className='navbar navbar-expand-lg bg-white shadow-sm px-3 sticky-top'>
        <div className='container-fluid p-0'>
          <button
            type='button'
            onClick={toggleSidebarAction}
            className='btn d-lg-none'
          >
            <FiMenu size={22} />
          </button>
          <div className='flex-grow-1 ms-2'></div>
          <div className='d-flex align-items-center gap-3'>
            <div className='position-relative dropdown-notif'>
              <button
                type='button'
                onClick={() => setOpenNotif((prev) => !prev)}
                className='btn border-0 bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm position-relative'
                style={{
                  width: '44px',
                  height: '44px',
                }}
              >
                <FiBell size={20} color={openNotif ? '#0d2a94' : '#495057'} />
                <span
                  className='position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger'
                  style={{
                    fontSize: '10px',
                  }}
                >
                  1
                </span>
              </button>
              {openNotif && (
                <div
                  className='position-absolute end-0 mt-3 bg-white rounded-4 shadow border-0 overflow-hidden'
                  style={{
                    width: '320px',
                    zIndex: 1050,
                  }}
                >
                  <div
                    className='d-flex align-items-center justify-content-between px-4 py-3 border-bottom'
                    style={{
                      background:
                        'linear-gradient(135deg, #0d2a94 0%, #1e40af 100%)',
                    }}
                  >
                    <div>
                      <div className='fw-semibold text-white'>Notifikasi</div>
                      <div
                        className='small'
                        style={{
                          color: 'rgba(255,255,255,0.75)',
                        }}
                      >
                        Update terbaru sistem
                      </div>
                    </div>
                  </div>
                  <div className='py-5 px-4 text-center'>
                    <div
                      className='mx-auto mb-3 rounded-circle d-flex align-items-center justify-content-center'
                      style={{
                        width: '60px',
                        height: '60px',
                        background: 'rgba(13,42,148,0.08)',
                      }}
                    >
                      <FiBell size={24} color='#0d2a94' />
                    </div>
                    <div className='fw-semibold text-dark mb-1'>
                      Tidak Ada Notifikasi
                    </div>
                    <div className='small text-muted'>
                      Semua notifikasi terbaru akan muncul di sini
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className='position-relative dropdown-user'>
              <button
                type='button'
                onClick={() => setOpenDropdown((prev) => !prev)}
                className='btn bg-white border-0 shadow-sm rounded-4 px-2 py-2 d-flex align-items-center gap-3'
              >
                <div className='position-relative'>
                  {user?.pegawai?.foto ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_IMAGES_URL}/${user.pegawai.foto}`}
                      alt='Profile'
                      width={42}
                      height={42}
                      className='rounded-circle object-fit-cover border border-2 border-light'
                    />
                  ) : (
                    <AvatarAlphabet
                      name={user?.pegawai?.nama || ''}
                      size={42}
                    />
                  )}
                  <span
                    className='position-absolute bottom-0 end-0 bg-success border border-2 border-white rounded-circle'
                    style={{
                      width: '11px',
                      height: '11px',
                    }}
                  />
                </div>
                <div className='d-none d-sm-flex flex-column text-start'>
                  <span
                    className='fw-semibold'
                    style={{
                      fontSize: '14px',
                      lineHeight: '18px',
                    }}
                  >
                    {user?.pegawai?.nama}
                  </span>
                  <span
                    className='text-muted text-uppercase'
                    style={{
                      fontSize: '11px',
                      letterSpacing: '0.4px',
                    }}
                  >
                    {user?.role?.replaceAll('_', ' ')}
                  </span>
                </div>
                <FiChevronDown size={18} color='#6c757d' />
              </button>
              {openDropdown && (
                <div
                  className='position-absolute end-0 mt-3 bg-white rounded-4 shadow border-0 overflow-hidden'
                  style={{
                    width: '260px',
                    zIndex: 1050,
                  }}
                >
                  <div
                    className='p-4 text-white'
                    style={{
                      background:
                        'linear-gradient(135deg, #0d2a94 0%, #1e40af 100%)',
                    }}
                  >
                    <div className='d-flex align-items-center gap-3'>
                      <div className='flex-grow-1 overflow-hidden'>
                        <div className='fw-semibold text-truncate'>
                          {user?.pegawai?.nama}
                        </div>
                        <div
                          className='small text-truncate'
                          style={{
                            color: 'rgba(255,255,255,0.8)',
                          }}
                        >
                          {user?.pegawai?.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='pt-2 px-2'>
                    <Link
                      href='/profile'
                      className='btn btn-light w-100 rounded-3 d-flex align-items-center justify-content-center gap-2 text-primary fw-semibold'
                    >
                      Profile
                    </Link>
                  </div>
                  <div className='p-2'>
                    <button
                      type='button'
                      onClick={() => setLogoutDialog(true)}
                      className='btn btn-light w-100 rounded-3 d-flex align-items-center justify-content-center gap-2 text-danger fw-semibold'
                    >
                      {loading ? 'Loading...' : 'Logout'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <ModalConfirmLogout
        show={logoutDialog}
        title='Anda yakin ingin logout?'
        message='Jangan lupa bersyukur hari ini :)'
        buttonConfirm='Logout'
        onCancel={() => setLogoutDialog(false)}
        onConfirm={handleLogoutClick}
      />
    </>
  );
}
