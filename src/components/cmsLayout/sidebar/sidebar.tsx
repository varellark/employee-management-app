'use client';

import Image from 'next/image';
import {
  FiActivity,
  FiCalendar,
  FiDatabase,
  FiDollarSign,
  FiHome,
  FiShield,
  FiUserCheck,
} from 'react-icons/fi';

import packageJson from '@/../package.json';
import Logo from '@/../public/logo_hrm.png';
import SidebarMenu from './sidebarMenu';
import { dateNow, yearNow } from '@/utils/date';
import type { UserLogin } from '@/types/auth';

interface SidebarProps {
  user: UserLogin | null;
  open: boolean;
  closeSidebarAction: () => void;
}

const roleAccessMap: Record<string, string[]> = {
  SUPERADMIN: ['/dashboard', '/users', '/logs'],
  MANAGER_HRD: ['/dashboard', '/pegawai', '/tunjangan', '/presensi'],
  ADMIN_HRD: [
    '/dashboard',
    '/pegawai',
    '/tunjangan',
    '/setting-tunjangan',
    '/presensi',
  ],
};

function SidebarSection({ title }: { title: string }) {
  return (
    <div className='px-3 pt-3 pb-2 text-uppercase fw-semibold text-secondary small'>
      {title}
    </div>
  );
}

export default function Sidebar({
  user,
  open,
  closeSidebarAction,
}: SidebarProps) {
  const allowedMenus = roleAccessMap[user?.role || ''] || [];
  const hasAccess = (path: string) => allowedMenus.includes(path);

  return (
    <>
      {open && (
        <div
          className='position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none'
          style={{ zIndex: 1040 }}
          onClick={closeSidebarAction}
        />
      )}
      <aside
        className={`bg-white border-end position-fixed top-0 start-0 h-100 d-flex flex-column shadow-sm sidebar-transition ${
          open ? 'sidebar-open' : 'sidebar-close'
        }`}
        style={{
          width: '260px',
          zIndex: 1050,
        }}
      >
        <div>
          <div
            className='d-flex align-items-center justify-content-center border-bottom'
            style={{
              height: '100px',
            }}
          >
            <Image src={Logo} width={180} height={85} alt='Logo' priority />
          </div>
          <div
            className='mx-3 my-3 rounded-4 p-3 text-white position-relative overflow-hidden'
            style={{
              background: 'linear-gradient(135deg, #0d2a94 0%, #1e40af 100%)',
            }}
          >
            <div
              className='position-absolute top-0 end-0'
              style={{
                width: '90px',
                height: '90px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '50%',
                transform: 'translate(30%, -30%)',
              }}
            />
            <div className='position-relative'>
              <div
                className='small text-white-50 mb-1'
                style={{
                  letterSpacing: '0.5px',
                }}
              >
                SELAMAT DATANG
              </div>
              <div className='fw-semibold fs-6 text-truncate'>
                {user?.pegawai?.nama || '-'}
              </div>
              <div
                className='small mt-1 text-uppercase'
                style={{
                  color: 'rgba(255,255,255,0.75)',
                }}
              >
                {user?.role?.replaceAll('_', ' ')}
              </div>
            </div>
          </div>
        </div>
        <nav className='flex-grow-1 sidebar-scroll px-2 pb-4'>
          {hasAccess('/dashboard') && (
            <SidebarMenu
              title='Dashboard'
              href='/dashboard'
              icon={<FiHome size={18} />}
            />
          )}
          {(hasAccess('/users') || hasAccess('/pegawai')) && (
            <SidebarSection title='Master Data' />
          )}
          {hasAccess('/users') && (
            <SidebarMenu
              title='Users'
              href='/users'
              icon={<FiShield size={18} />}
            />
          )}
          {hasAccess('/pegawai') && (
            <SidebarMenu
              title='Pegawai'
              href='/pegawai'
              icon={<FiUserCheck size={18} />}
            />
          )}
          {(hasAccess('/tunjangan') || hasAccess('/setting-tunjangan')) && (
            <SidebarSection title='Manajemen Tunjangan' />
          )}
          {hasAccess('/tunjangan') && (
            <SidebarMenu
              title='Tunjangan'
              href='/tunjangan'
              icon={<FiDollarSign size={18} />}
            />
          )}
          {hasAccess('/setting-tunjangan') && (
            <SidebarMenu
              title='Pengaturan Tunjangan'
              href='/setting-tunjangan'
              icon={<FiDatabase size={18} />}
            />
          )}
          {(hasAccess('/presensi') || hasAccess('/logs')) && (
            <SidebarSection title='Aktivitas' />
          )}
          {hasAccess('/presensi') && (
            <SidebarMenu
              title='Presensi'
              href='/presensi'
              icon={<FiCalendar size={18} />}
            />
          )}
          {hasAccess('/logs') && (
            <SidebarMenu
              title='Logs'
              href='/logs'
              icon={<FiActivity size={18} />}
            />
          )}
        </nav>
        <div className='border-top px-3 py-3 text-center text-muted small'>
          <div>Build v{packageJson.version}</div>
          <div suppressHydrationWarning>
            ({dateNow('YYYY-MM-DD')} © {yearNow()})
          </div>
        </div>
      </aside>
    </>
  );
}
