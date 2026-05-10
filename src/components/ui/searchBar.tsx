import React from 'react';
import { FiSearch } from 'react-icons/fi';

type SearchBarProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Cari data...',
}: SearchBarProps) {
  return (
    <form
      onSubmit={onSubmit}
      className='position-relative d-flex align-items-center w-100'
      style={{
        maxWidth: '420px',
      }}
    >
      <FiSearch
        size={18}
        className='position-absolute text-secondary'
        style={{
          left: '14px',
          zIndex: 2,
        }}
      />
      <input
        type='text'
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className='form-control rounded-4 ps-5 py-2 shadow-sm border'
        style={{
          background: '#f8f9fa',
          minHeight: '46px',
          paddingRight: '90px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      />
      <button
        type='submit'
        className='btn position-absolute end-0 top-50 translate-middle-y me-2 px-3 py-1 rounded-3 text-white fw-medium'
        style={{
          background: '#0d2a94',
          fontSize: '0.8rem',
        }}
      >
        Cari
      </button>
    </form>
  );
}
