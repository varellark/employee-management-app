import Link from 'next/link';
import { FiPlus } from 'react-icons/fi';

import { formatRupiah } from '@/utils/format';

type PageHeaderProps = {
  title: string;
  description?: string;
  addLink?: string;
  addLabel?: string;
  titleAmount?: string;
  totalAmount?: number;
};

export default function PageHeader({
  title,
  description,
  addLink,
  addLabel = 'Tambah Data',
  titleAmount = 'Total Pembayaran',
  totalAmount,
}: PageHeaderProps) {
  return (
    <div className='d-flex flex-column flex-sm-row align-items-sm-center justify-content-between mb-4 gap-3'>
      <div>
        <h1
          className='fw-bold text-dark mb-1'
          style={{
            fontSize: '1.5rem',
            letterSpacing: '-0.5px',
          }}
        >
          {title}
        </h1>
        {description && (
          <p className='text-secondary small mb-0'>{description}</p>
        )}
      </div>
      <div className='d-flex align-items-center gap-3 flex-wrap justify-content-end'>
        {typeof totalAmount !== 'undefined' && (
          <div
            className='d-flex align-items-center gap-3 px-4 py-2 rounded-4 border shadow-sm'
            style={{
              background: '#ecfdf3',
              borderColor: '#bbf7d0',
            }}
          >
            <span
              className='small fw-medium'
              style={{
                color: '#15803d',
                whiteSpace: 'nowrap',
              }}
            >
              {titleAmount}
            </span>
            <div
              style={{
                width: '1px',
                height: '16px',
                background: '#86efac',
              }}
            />
            <span
              className='fw-semibold'
              style={{
                color: '#166534',
                fontSize: '0.95rem',
                letterSpacing: '-0.2px',
              }}
            >
              {formatRupiah(totalAmount)}
            </span>
          </div>
        )}
        {addLink && (
          <Link
            href={addLink}
            className='btn text-white fw-semibold d-inline-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded-4 shadow-sm'
            style={{
              background: 'linear-gradient(135deg, #0d2a94 0%, #1e40af 100%)',
              border: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <FiPlus size={16} />
            <span>{addLabel}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
