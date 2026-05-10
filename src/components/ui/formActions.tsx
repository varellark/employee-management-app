'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

type FormActionsProps = {
  cancelTo: string;
  submitLabel?: string;
  loadingLabel?: string;
  loading?: boolean;
  disabled?: boolean;
};

export default function FormActions({
  cancelTo,
  submitLabel = 'Simpan',
  loadingLabel = 'Menyimpan...',
  loading = false,
  disabled = false,
}: FormActionsProps) {
  const router = useRouter();

  return (
    <div className='d-flex justify-content-end gap-2 pt-4 mt-4 border-top'>
      <button
        type='button'
        onClick={() => router.push(cancelTo)}
        className='btn btn-outline-secondary rounded-4 px-4 py-2 fw-medium'
        disabled={loading}
      >
        Batal
      </button>
      <button
        type='submit'
        disabled={loading || disabled}
        className='btn text-white rounded-4 px-4 py-2 fw-semibold shadow-sm'
        style={{
          background: 'linear-gradient(135deg, #0d2a94 0%, #1e40af 100%)',
          border: 'none',
          minWidth: '140px',
        }}
      >
        {loading ? (
          <span className='d-flex align-items-center justify-content-center gap-2'>
            <span
              className='spinner-border spinner-border-sm'
              role='status'
              aria-hidden='true'
            />
            {loadingLabel}
          </span>
        ) : (
          submitLabel
        )}
      </button>
    </div>
  );
}
