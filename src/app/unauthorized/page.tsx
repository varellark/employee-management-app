'use client';

import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiShield } from 'react-icons/fi';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className='container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-body-tertiary px-3'>
      <div
        className='card border-0 shadow-lg rounded-5 overflow-hidden'
        style={{
          maxWidth: '700px',
          width: '100%',
        }}
      >
        <div
          className='p-5 text-center text-white position-relative overflow-hidden'
          style={{
            background: 'linear-gradient(135deg, #0d2a94 0%, #1e40af 100%)',
          }}
        >
          <div
            className='position-absolute top-0 end-0'
            style={{
              width: '180px',
              height: '180px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '50%',
              transform: 'translate(30%, -30%)',
            }}
          />
          <div className='position-relative'>
            <div
              className='d-inline-flex align-items-center justify-content-center rounded-circle mb-4'
              style={{
                width: '90px',
                height: '90px',
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <FiShield size={42} />
            </div>
            <h1
              className='fw-bold mb-2'
              style={{
                fontSize: '72px',
                lineHeight: 1,
              }}
            >
              401
            </h1>
            <h2 className='fw-semibold mb-0'>Access Denied</h2>
          </div>
        </div>
        <div className='p-5 text-center'>
          <p
            className='text-secondary mb-4 mx-auto'
            style={{
              maxWidth: '500px',
              lineHeight: 1.7,
            }}
          >
            Anda tidak memiliki izin untuk mengakses halaman ini. Silakan
            kembali ke halaman sebelumnya.
          </p>
          <button
            type='button'
            onClick={() => router.push('/dashboard')}
            className='btn rounded-pill px-4 py-2 text-white fw-medium d-inline-flex align-items-center gap-2'
            style={{
              background: '#0d2a94',
            }}
          >
            <FiArrowLeft size={18} />
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
}
