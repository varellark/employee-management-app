'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiDownload,
  FiEye,
  FiFilter,
  FiUpload,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import Card from '@/components/ui/card';
import Table from '@/components/ui/table';
import PageHeader from '@/components/ui/pageHeader';
import SearchBar from '@/components/ui/searchBar';
import Filter from '@/components/ui/filter';
import Badge from '@/components/ui/badge';
import Request from '@/utils/request';
import { toast } from 'react-toastify';
import { UserLogin } from '@/types/auth';
import useAuthStore from '@/store/authStore';
import { Role } from '@prisma/client';

type PresensiRow = {
  id: number;
  nip: string;
  nama: string;
  jabatan: string | null;
  hadir: number;
  statusHadir: 'TERPENUHI' | 'TIDAK_TERPENUHI';
  cuti: number;
  kuotaCuti: number;
  izin: number;
  kuotaIzin: number;
  unpaidLeave: number;
  kuotaUnpaidLeave: number;
};

const JABATAN_LABEL: Record<string, string> = {
  MANAGER: 'Manager',
  STAF: 'Staf',
  MAGANG: 'Magang',
  KARYAWAN: 'Karyawan',
};

function getDefaultPeriode() {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return {
    month: String(prev.getMonth() + 1).padStart(2, '0'),
    year: String(prev.getFullYear()),
  };
}

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const YEAR_OPTIONS = (() => {
  const current = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => String(current - i));
})();

export default function PresensiPage() {
  const user: UserLogin | null = useAuthStore((state) => state.user);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<PresensiRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [filterDialog, setFilterDialog] = useState(false);
  const [filters, setFilters] = useState<{ statusKehadiran?: string }>({});
  const defaultPeriode = getDefaultPeriode();
  const [month, setMonth] = useState(defaultPeriode.month);
  const [year, setYear] = useState(defaultPeriode.year);
  const [loadingDownload, setLoadingDownload] = useState(false);

  const fetchData = async (
    q = '',
    p = 1,
    l = 10,
    m = month,
    y = year,
    statusKehadiran = ''
  ) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search: q,
        page: String(p),
        limit: String(l),
        month: m,
        year: y,
      });
      if (statusKehadiran) query.append('statusKehadiran', statusKehadiran);

      const res = await Request.GET(`/presensi?${query.toString()}`);
      if (res.success) {
        setRows(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
        setTotalData(res.data.pagination.total);
      } else {
        toast.error(res.message || 'Gagal memuat data presensi');
      }
    } catch {
      toast.error('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchData(
        search,
        page,
        limit,
        month,
        year,
        filters.statusKehadiran || ''
      );
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, filters, month, year]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    await fetchData(
      search,
      1,
      limit,
      month,
      year,
      filters.statusKehadiran || ''
    );
  };

  const handleDownloadTemplate = async () => {
    try {
      setLoadingDownload(true);
      toast.info('Menyiapkan template...');
      const token = useAuthStore.getState().token;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FETCH_URL}/presensi/template?month=${month}&year=${year}`,
        { method: 'GET', headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) {
        toast.error('Gagal download template');
        return;
      }

      const blob = await response.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `template-presensi-${year}${month.padStart(2, '0')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success('Template berhasil diunduh!');
    } catch {
      toast.error('Gagal download template');
    } finally {
      setLoadingDownload(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (!allowed.includes(file.type)) {
      toast.error('File harus berformat .xlsx atau .xls');
      e.target.value = '';
      return;
    }

    try {
      setImporting(true);
      toast.info('Mengupload file, proses rekap berjalan di background...');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('month', month);
      formData.append('year', year);

      const res = await Request.POST_FORM('/presensi/import', formData);

      if (res.success) {
        toast.success(
          res.message || 'Import berhasil. Data sedang diproses...'
        );
        setTimeout(() => {
          fetchData(
            search,
            page,
            limit,
            month,
            year,
            filters.statusKehadiran || ''
          );
        }, 3000);
      } else {
        toast.error(res.message || 'Import gagal');
      }
    } catch {
      toast.error('Gagal mengunggah file');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const columns = [
    { key: 'no', label: '#' },
    { key: 'nama', label: 'Nama' },
    { key: 'jabatan', label: 'Jabatan' },
    { key: 'hadir', label: 'Hadir' },
    { key: 'statusHadir', label: 'Status Hadir' },
    { key: 'cuti', label: 'Cuti' },
    { key: 'kuotaCuti', label: 'Kuota Cuti' },
    { key: 'izin', label: 'Izin' },
    { key: 'kuotaIzin', label: 'Kuota Izin' },
    { key: 'unpaid', label: 'Unpaid Leave' },
    { key: 'kuotaUnpaid', label: 'Kuota Unpaid' },
    { key: 'action', label: 'Aksi' },
  ];

  const data = rows.map((item, i) => ({
    no: (page - 1) * limit + i + 1,
    nama: (
      <div>
        <div className='fw-medium text-dark'>{item.nama}</div>
        <div className='text-secondary' style={{ fontSize: 11 }}>
          {item.nip}
        </div>
      </div>
    ),
    jabatan: (
      <span className='text-secondary small'>
        {JABATAN_LABEL[item.jabatan ?? ''] ?? item.jabatan ?? '-'}
      </span>
    ),
    hadir: <span className='fw-semibold text-success'>{item.hadir}</span>,
    statusHadir:
      item.statusHadir === 'TERPENUHI' ? (
        <Badge
          title='Terpenuhi'
          className='text-success bg-success-subtle'
          dotClassName='bg-success'
          pulse
        />
      ) : (
        <Badge
          title='Tdk Terpenuhi'
          className='text-warning bg-warning-subtle'
          dotClassName='bg-warning'
        />
      ),
    cuti: <span className='fw-semibold text-info'>{item.cuti}</span>,
    kuotaCuti: (
      <span className='text-secondary small'>{item.kuotaCuti} sisa</span>
    ),
    izin: <span className='fw-semibold text-primary'>{item.izin}</span>,
    kuotaIzin: (
      <span className='text-secondary small'>{item.kuotaIzin} sisa</span>
    ),
    unpaid: <span className='fw-semibold text-danger'>{item.unpaidLeave}</span>,
    kuotaUnpaid: (
      <span className='text-secondary small'>{item.kuotaUnpaidLeave} sisa</span>
    ),
    action: (
      <div className='d-flex align-items-center'>
        <button
          type='button'
          onClick={() =>
            router.push(`/presensi/${item.id}/detail?month=${month}&year=${year}`)
          }
          className='btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center'
          title='Detail'
        >
          <FiEye size={13} />
        </button>
      </div>
    ),
  }));

  const periodeLabel = `${MONTH_NAMES[Number(month) - 1]} ${year}`;

  return (
    <>
      <Card className='w-100 bg-white border shadow-sm rounded-4 p-4'>
        <PageHeader
          title='Presensi Pegawai'
          description={`Rekap absensi periode ${periodeLabel}.`}
        />
        <div className='d-flex flex-wrap align-items-end gap-3 mb-4 p-3 border rounded-4 bg-light-subtle'>
          <div>
            <label className='form-label fw-semibold small mb-1'>Bulan</label>
            <select
              className='form-select rounded-3'
              style={{ minWidth: 140 }}
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                setPage(1);
              }}
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={idx} value={String(idx + 1).padStart(2, '0')}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='form-label fw-semibold small mb-1'>Tahun</label>
            <select
              className='form-select rounded-3'
              style={{ minWidth: 100 }}
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setPage(1);
              }}
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          {user?.role === Role.ADMIN_HRD && (
            <div className='ms-auto d-flex gap-2 flex-wrap'>
              <button
                type='button'
                onClick={handleDownloadTemplate}
                className='btn text-white fw-semibold d-inline-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded-4 shadow-sm'
                style={{
                  background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
                  border: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {loadingDownload ? (
                  <>
                  <span
                    className='spinner-border spinner-border-sm'
                    role='status'
                    aria-hidden='true'
                  />
                    Memproses...
                  </>
                ) : (
                  <>
                    <FiDownload size={15} />
                    Template Excel
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type='file'
                accept='.xlsx,.xls'
                className='d-none'
                onChange={handleFileChange}
              />
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className='btn text-white fw-semibold d-inline-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded-4 shadow-sm'
                style={{
                  background: importing
                    ? '#94a3b8'
                    : 'linear-gradient(135deg, #0d2a94 0%, #1e40af 100%)',
                  border: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {importing ? (
                  <>
                    <span
                      className='spinner-border spinner-border-sm'
                      role='status'
                    />
                    Memproses...
                  </>
                ) : (
                  <>
                    <FiUpload size={15} />
                    Import Excel
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        {importing && (
          <div className='d-flex align-items-start gap-3 border border-warning rounded-4 p-3 mb-4 bg-warning-subtle'>
            <FiAlertCircle
              size={18}
              className='text-warning mt-1 flex-shrink-0'
            />
            <div className='small'>
              <span className='fw-semibold'>Sedang memproses import.</span> Data
              rekap akan diperbarui otomatis setelah proses selesai. Harap
              tunggu dan jangan tutup halaman ini.
            </div>
          </div>
        )}
        <div className='d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-3 mb-4'>
          <SearchBar
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
            onSubmit={handleSearch}
            placeholder='Cari nama atau NIP...'
          />
          <button
            type='button'
            onClick={() => setFilterDialog(true)}
            className='btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 rounded-4 px-3 py-2 shadow-sm'
          >
            <FiFilter size={16} />
            Filter
          </button>
        </div>
        <div className='d-flex flex-wrap gap-3 mb-3'>
          <div className='d-flex align-items-center gap-1 small text-secondary'>
            <FiCheckCircle size={13} className='text-success' />
            Hadir terpenuhi
          </div>
          <div className='d-flex align-items-center gap-1 small text-secondary'>
            <FiXCircle size={13} className='text-warning' />
            Hadir tidak terpenuhi
          </div>
          <div className='d-flex align-items-center gap-1 small text-secondary'>
            <span
              className='rounded-circle d-inline-block bg-secondary'
              style={{ width: 8, height: 8 }}
            />
            Sisa = kuota yang belum terpakai
          </div>
        </div>
        <Table
          columns={columns}
          data={data}
          loading={loading}
          currentPage={page}
          totalPages={totalPages}
          totalData={totalData}
          limit={limit}
          onPageChangeAction={setPage}
          onLimitChangeAction={setLimit}
        />
      </Card>
      <Filter
        show={filterDialog}
        onCloseAction={() => setFilterDialog(false)}
        title='Filter Presensi'
        fields={[
          {
            name: 'statusKehadiran',
            label: 'Status Kehadiran',
            type: 'select',
            options: [
              { value: 'HADIR', label: 'Hadir' },
              { value: 'CUTI', label: 'Cuti' },
              { value: 'IZIN', label: 'Izin' },
              { value: 'UNPAID_LEAVE', label: 'Unpaid Leave' },
              { value: 'ALPHA', label: 'Alpha' },
            ],
          },
        ]}
        initialValues={filters}
        onApplyAction={(f) => {
          setFilters(f);
          setPage(1);
        }}
      />
    </>
  );
}
