import React from 'react';
import type { Metadata } from 'next';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const metadata: Metadata = {
  title: 'Login - Employee Management',
  description: 'Login sistem employee management',
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className='min-vh-100 bg-light'>
      <div className='container-fluid p-0'>
        <div className='row g-0 min-vh-100'>
          <div
            className='col-lg-6 d-none d-lg-flex flex-column position-relative overflow-hidden'
            style={{ backgroundColor: '#04355f' }}
          >
            <div
              className='position-absolute top-0 start-0 w-100 h-100'
              style={{
                backgroundImage: "url('/auth-bg.jpeg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.15,
                filter: 'grayscale(30%)',
              }}
            />
            <div
              className='position-absolute top-0 start-0 w-100 h-100'
              style={{
                background:
                  'linear-gradient(160deg, rgba(2,20,45,.6) 0%, rgba(2,20,45,.2) 50%, rgba(2,20,45,.85) 100%)',
              }}
            />
            <div
              className='position-absolute top-0 start-0 w-100 h-100 d-flex'
              aria-hidden='true'
              style={{ pointerEvents: 'none' }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className='flex-fill h-100'
                  style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}
                />
              ))}
            </div>
            <div className='position-relative z-1 d-flex flex-column justify-content-between h-100 p-5'>
              <div className='d-flex align-items-center gap-3'>
                <div
                  className='d-flex align-items-center justify-content-center rounded-3'
                  style={{
                    width: 44,
                    height: 44,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <svg width='28' height='28' viewBox='0 0 28 28' fill='none'>
                    <rect width='12' height='12' rx='2' fill='white' />
                    <rect
                      x='16'
                      width='12'
                      height='12'
                      rx='2'
                      fill='white'
                      fillOpacity='.5'
                    />
                    <rect
                      y='16'
                      width='12'
                      height='12'
                      rx='2'
                      fill='white'
                      fillOpacity='.5'
                    />
                    <rect
                      x='16'
                      y='16'
                      width='12'
                      height='12'
                      rx='2'
                      fill='white'
                    />
                  </svg>
                </div>
                <span
                  className='text-white fw-medium'
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 18,
                    letterSpacing: '0.15em',
                  }}
                >
                  HRM Employee Management
                </span>
              </div>
              <div className='d-flex flex-column gap-4'>
                <h1
                  className='text-white fw-bold lh-1 mb-0'
                  style={{
                    fontSize: 'clamp(36px, 4vw, 54px)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Manage your
                  <br />
                  <em className='fst-italic' style={{ color: '#90c8f0' }}>
                    workforce
                  </em>
                  <br />
                  smarter.
                </h1>
                <div className='d-flex flex-wrap gap-2'>
                  {[
                    'Manajemen Pegawai',
                    'Presensi & Absensi',
                    'Tunjangan',
                    'User Management',
                  ].map((f) => (
                    <span
                      key={f}
                      className='rounded-pill px-3 py-1 small fw-medium'
                      style={{
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: 'rgba(255,255,255,0.6)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className='col-lg-6 d-flex align-items-center justify-content-center bg-light px-3 py-5'>
            <div className='w-100' style={{ maxWidth: 420 }}>
              {children}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position='top-right' autoClose={3000} />
    </main>
  );
}
