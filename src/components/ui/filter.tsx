'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FiX, FiCheck } from 'react-icons/fi';

const SCROLLBAR_CSS = `
.filter-scroll::-webkit-scrollbar { width: 5px; }
.filter-scroll::-webkit-scrollbar-track { background: transparent; }
.filter-scroll::-webkit-scrollbar-thumb { background: rgba(13,42,148,0.35); border-radius: 20px; }
.filter-scroll::-webkit-scrollbar-thumb:hover { background: rgba(13,42,148,0.55); }
`;

function injectScrollbarStyle() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('filter-scrollbar-style')) return;
  const el = document.createElement('style');
  el.id = 'filter-scrollbar-style';
  el.textContent = SCROLLBAR_CSS;
  document.head.appendChild(el);
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  name: string;
  label: string;
  type?:
    | 'text'
    | 'select'
    | 'date'
    | 'multiselect'
    | 'daterange'
    | 'masa-kerja';
  placeholder?: string;
  options?: FilterOption[];
  startKey?: string;
  endKey?: string;
}

export type FilterValue = string | string[] | null;

export interface FilterProps {
  show: boolean;
  onCloseAction: () => void;
  onApplyAction: (filters: Record<string, FilterValue>) => void;
  title?: string;
  fields: FilterField[];
  initialValues?: Record<string, FilterValue>;
}

function buildInitial(
  fields: FilterField[],
  initial: Record<string, FilterValue>
): Record<string, FilterValue> {
  const state: Record<string, FilterValue> = {};
  fields.forEach((f) => {
    if (f.type === 'daterange') {
      const sk = f.startKey ?? 'startDate';
      const ek = f.endKey ?? 'endDate';
      state[sk] = initial[sk] ?? null;
      state[ek] = initial[ek] ?? null;
    } else if (f.type === 'multiselect') {
      const v = initial[f.name];
      state[f.name] = Array.isArray(v) ? v : v ? [v as string] : [];
    } else if (f.type === 'masa-kerja') {
      state[`${f.name}Operator`] =
        (initial[`${f.name}Operator`] as string) ?? null;
      state[`${f.name}Tahun`] = (initial[`${f.name}Tahun`] as string) ?? null;
    } else {
      state[f.name] = (initial[f.name] as string) ?? null;
    }
  });
  return state;
}

function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Pilih...',
}: {
  options: FilterOption[];
  value: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (val: string) =>
    onChange(
      value.includes(val) ? value.filter((v) => v !== val) : [...value, val]
    );

  const displayLabel =
    value.length === 0
      ? placeholder
      : value.length === 1
        ? (options.find((o) => o.value === value[0])?.label ?? value[0])
        : `${value.length} dipilih`;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        role='button'
        tabIndex={0}
        onClick={() => setOpen((p) => !p)}
        onKeyDown={(e) => e.key === 'Enter' && setOpen((p) => !p)}
        className='form-control rounded-3 d-flex align-items-center justify-content-between'
        style={{
          minHeight: '38px',
          cursor: 'pointer',
          userSelect: 'none',
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '16px 12px',
          paddingRight: '2.25rem',
        }}
      >
        <span
          className='text-truncate small'
          style={{ color: value.length === 0 ? '#6c757d' : '#212529' }}
        >
          {displayLabel}
        </span>
        {value.length > 0 && (
          <span
            className='badge rounded-pill ms-2 flex-shrink-0'
            style={{ background: '#0d2a94', fontSize: '10px' }}
          >
            {value.length}
          </span>
        )}
      </div>
      {open && (
        <div
          className='bg-white border rounded-3 shadow-sm filter-scroll'
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 1080,
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {options.length === 0 ? (
            <div className='px-3 py-2 text-muted small'>Tidak ada opsi</div>
          ) : (
            options.map((opt) => {
              const selected = value.includes(opt.value);
              return (
                <div
                  key={opt.value}
                  role='button'
                  tabIndex={0}
                  onClick={() => toggle(opt.value)}
                  onKeyDown={(e) => e.key === 'Enter' && toggle(opt.value)}
                  className='d-flex align-items-center gap-2 px-3 py-2'
                  style={{
                    cursor: 'pointer',
                    background: selected ? '#eff6ff' : 'white',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => {
                    if (!selected)
                      (e.currentTarget as HTMLElement).style.background =
                        '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (!selected)
                      (e.currentTarget as HTMLElement).style.background =
                        'white';
                  }}
                >
                  <span
                    className='d-flex align-items-center justify-content-center rounded-1 flex-shrink-0'
                    style={{
                      width: 16,
                      height: 16,
                      border: selected ? 'none' : '1.5px solid #cbd5e1',
                      background: selected ? '#0d2a94' : 'white',
                      transition: 'all 0.15s',
                    }}
                  >
                    {selected && (
                      <FiCheck size={11} color='white' strokeWidth={3} />
                    )}
                  </span>
                  <span className='small' style={{ color: '#212529' }}>
                    {opt.label}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function DateRange({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
}: {
  startValue: string;
  endValue: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
}) {
  return (
    <div className='d-flex align-items-center gap-2'>
      <input
        type='datetime-local'
        className='form-control rounded-3'
        value={startValue}
        onChange={(e) => onStartChange(e.target.value)}
        style={{ fontSize: '13px' }}
      />
      <span className='text-secondary small flex-shrink-0'>s/d</span>
      <input
        type='datetime-local'
        className='form-control rounded-3'
        value={endValue}
        min={startValue || undefined}
        onChange={(e) => onEndChange(e.target.value)}
        style={{ fontSize: '13px' }}
      />
    </div>
  );
}

const OPERATOR_OPTIONS = [
  { value: '=', label: 'Sama dengan' },
  { value: '>', label: 'Lebih dari' },
  { value: '<', label: 'Kurang dari' },
];

function MasaKerja({
  operator,
  tahun,
  onOperatorChange,
  onTahunChange,
}: {
  operator: string;
  tahun: string;
  onOperatorChange: (v: string) => void;
  onTahunChange: (v: string) => void;
}) {
  return (
    <div className='d-flex gap-2'>
      <select
        className='form-select rounded-3'
        value={operator}
        onChange={(e) => onOperatorChange(e.target.value || '')}
        style={{ width: '160px', flexShrink: 0 }}
      >
        <option value=''>Semua</option>
        {OPERATOR_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <div className='input-group'>
        <input
          type='number'
          className='form-control rounded-3'
          value={tahun}
          min={0}
          placeholder='Tahun...'
          onChange={(e) => onTahunChange(e.target.value || '')}
          disabled={!operator}
          style={{ minWidth: 0 }}
        />
        <span className='input-group-text rounded-end-3'>thn</span>
      </div>
    </div>
  );
}

export default function Filter({
  show,
  onCloseAction,
  onApplyAction,
  title = 'Filter Data',
  fields,
  initialValues = {},
}: FilterProps) {
  const prevShow = useRef(false);
  const [values, setValues] = useState<Record<string, FilterValue>>(() =>
    buildInitial(fields, initialValues)
  );

  useEffect(() => {
    injectScrollbarStyle();
  }, []);

  useEffect(() => {
    if (show && !prevShow.current) {
      setValues(buildInitial(fields, initialValues));
    }
    prevShow.current = show;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  if (!show) return null;

  const getString = (key: string): string => (values[key] as string) || '';
  const getArray = (key: string): string[] => {
    const v = values[key];
    if (!v) return [];
    return Array.isArray(v) ? v : [v as string];
  };
  const set = (key: string, val: FilterValue) =>
    setValues((prev) => ({ ...prev, [key]: val }));

  const handleApply = () => {
    onApplyAction({ ...values });
    onCloseAction();
  };

  const handleReset = () => {
    const cleared: Record<string, FilterValue> = {};
    fields.forEach((f) => {
      if (f.type === 'daterange') {
        cleared[f.startKey ?? 'startDate'] = null;
        cleared[f.endKey ?? 'endDate'] = null;
      } else if (f.type === 'multiselect') {
        cleared[f.name] = [];
      } else if (f.type === 'masa-kerja') {
        cleared[`${f.name}Operator`] = null;
        cleared[`${f.name}Tahun`] = null;
      } else {
        cleared[f.name] = null;
      }
    });
    setValues(cleared);
    onApplyAction(cleared);
    onCloseAction();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onCloseAction();
  };

  const colClass = (field: FilterField) => {
    if (field.type === 'daterange' || field.type === 'masa-kerja')
      return 'col-12';
    return fields.length === 1 ? 'col-12' : 'col-12 col-md-6';
  };

  return (
    <div
      onClick={handleBackdropClick}
      className='position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center'
      style={{
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 1055,
        padding: '16px',
      }}
    >
      <div
        className='bg-white rounded-4 shadow-lg w-100'
        style={{ maxWidth: '720px' }}
      >
        <div className='d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-light rounded-top-4'>
          <h5 className='mb-0 fw-semibold'>{title}</h5>
          <button
            type='button'
            onClick={onCloseAction}
            className='btn btn-sm btn-light rounded-circle'
          >
            <FiX size={18} />
          </button>
        </div>
        <div
          className='p-4 filter-scroll'
          style={{ maxHeight: '50vh', overflowY: 'auto', overflowX: 'visible' }}
        >
          <div className='row g-4'>
            {fields.map((field) => (
              <div key={field.name} className={colClass(field)}>
                <label className='form-label fw-medium small text-secondary'>
                  {field.label}
                </label>
                {field.type === 'multiselect' && field.options ? (
                  <MultiSelect
                    options={field.options}
                    value={getArray(field.name)}
                    onChange={(val) => set(field.name, val)}
                  />
                ) : field.type === 'daterange' ? (
                  <DateRange
                    startValue={getString(field.startKey ?? 'startDate')}
                    endValue={getString(field.endKey ?? 'endDate')}
                    onStartChange={(v) =>
                      set(field.startKey ?? 'startDate', v || null)
                    }
                    onEndChange={(v) =>
                      set(field.endKey ?? 'endDate', v || null)
                    }
                  />
                ) : field.type === 'masa-kerja' ? (
                  <MasaKerja
                    operator={getString(`${field.name}Operator`)}
                    tahun={getString(`${field.name}Tahun`)}
                    onOperatorChange={(v) => {
                      set(`${field.name}Operator`, v || null);
                      if (!v) set(`${field.name}Tahun`, null);
                    }}
                    onTahunChange={(v) => set(`${field.name}Tahun`, v || null)}
                  />
                ) : field.type === 'select' && field.options ? (
                  <select
                    className='form-select rounded-3'
                    value={getString(field.name)}
                    onChange={(e) => set(field.name, e.target.value || null)}
                  >
                    <option value=''>Semua</option>
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'date' ? (
                  <input
                    type='date'
                    className='form-control rounded-3'
                    value={getString(field.name)}
                    onChange={(e) => set(field.name, e.target.value || null)}
                  />
                ) : (
                  <input
                    type='text'
                    className='form-control rounded-3'
                    value={getString(field.name)}
                    onChange={(e) => set(field.name, e.target.value || null)}
                    placeholder={field.placeholder || ''}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className='d-flex justify-content-between align-items-center px-4 py-3 border-top bg-light rounded-bottom-4'>
          <button type='button' onClick={handleReset} className='btn btn-light'>
            Reset
          </button>
          <div className='d-flex gap-2'>
            <button
              type='button'
              onClick={onCloseAction}
              className='btn btn-outline-secondary'
            >
              Batal
            </button>
            <button
              type='button'
              onClick={handleApply}
              className='btn text-white'
              style={{ background: '#0d2a94' }}
            >
              Terapkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
