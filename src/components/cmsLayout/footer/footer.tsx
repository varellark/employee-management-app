'use client';

export default function Footer() {
  return (
    <footer
      className='bg-white border-top d-flex align-items-center justify-content-center text-muted small flex-shrink-0'
      style={{ minHeight: '52px', padding: '12px 24px' }}
    >
      © {new Date().getFullYear()} Employee Management. All rights reserved.
    </footer>
  );
}