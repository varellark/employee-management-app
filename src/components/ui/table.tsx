'use client';

import React from 'react';

interface Column {
  key: string;
  label: string;
}

interface TableProps<T> {
  columns: Column[];
  data: T[];
  loading?: boolean;
  currentPage: number;
  totalPages: number;
  totalData: number;
  limit: number;
  onPageChangeAction: (page: number) => void;
  onLimitChangeAction: (limit: number) => void;
}

export default function Table<T extends Record<string, React.ReactNode>>({
  columns,
  data,
  loading = false,
  currentPage,
  totalPages,
  totalData,
  limit,
  onPageChangeAction,
  onLimitChangeAction,
}: TableProps<T>) {
  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChangeAction(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChangeAction(currentPage + 1);
    }
  };

  return (
    <div className='w-100'>
      <div className='table-responsive cms-scroll border rounded-4 shadow-sm bg-white'>
        <table className='table align-middle mb-0'>
          <thead
            style={{
              background: '#f8f9fa',
            }}
          >
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className='px-4 py-3 text-uppercase small fw-semibold text-secondary border-bottom'
                  style={{
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                    fontSize: '0.75rem',
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className='px-4 py-3'>
                      <div className='placeholder-glow'>
                        <span className='placeholder col-8 rounded' />
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length > 0 ? (
              data.map((row, i) => (
                <tr key={i} className='align-top'>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className='px-4 py-3 text-secondary'
                      style={{
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className='text-center py-5'>
                  <div className='d-flex flex-column align-items-center justify-content-center text-secondary'>
                    <span
                      style={{
                        fontSize: '3rem',
                      }}
                    >
                      📭
                    </span>
                    <p className='fw-medium mb-1'>Tidak ada data ditemukan</p>
                    <small className='text-muted'>
                      Coba ubah filter atau kata kunci pencarian.
                    </small>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className='d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mt-4'>
        <div className='text-secondary small text-center text-sm-start'>
          Menampilkan{' '}
          <span className='fw-semibold text-dark'>{data.length}</span> dari{' '}
          <span className='fw-semibold text-dark'>{totalData}</span> data
        </div>
        <div className='d-flex align-items-center gap-2 flex-wrap justify-content-center justify-content-sm-end'>
          <button
            type='button'
            onClick={handlePrev}
            disabled={currentPage === 1}
            className='btn btn-sm btn-outline-secondary'
          >
            Prev
          </button>
          <span className='small text-dark px-2'>
            {currentPage} / {totalPages || 1}
          </span>
          <button
            type='button'
            onClick={handleNext}
            disabled={currentPage === totalPages || totalPages === 0}
            className='btn btn-sm btn-outline-secondary'
          >
            Next
          </button>
          <select
            value={limit}
            onChange={(e) => onLimitChangeAction(Number(e.target.value))}
            className='form-select form-select-sm ms-1'
            style={{
              width: '80px',
            }}
          >
            {[10, 20, 30, 40, 50].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
