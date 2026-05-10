'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FiDownload,
  FiEye,
  FiFilter,
  FiRefreshCw,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import Card from '@/components/ui/card';
import Table from '@/components/ui/table';
import Filter from '@/components/ui/filter';
import PageHeader from '@/components/ui/pageHeader';
import Request from '@/utils/request';
import { dateFormat } from '@/utils/date';
import { formatRupiah } from '@/utils/format';
import SearchBar from '@/components/ui/searchBar';

type Tunjangan = {
  id: number;
  periode: string;
  jarakKm: number;
  jumlahHariMasuk: number;
  baseFare: string;
  totalTunjangan: string;
  keterangan?: string | null;
  createDate: string;
  pegawai: {
    id: number;
    nip: string;
    nama: string;
    jabatan?: string | null;
    departemen?: string | null;
  };
};

export default function TunjanganPage() {
  const [tunjangan, setTunjangan] = useState<Tunjangan[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [filterDialog, setFilterDialog] = useState(false);
  const [filters, setFilters] = useState<{
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }>({});

  const fetchTunjangan = async (
    p = 1,
    l = 10,
    currentFilters = filters,
    searchValue = search
  ) => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: String(p),
        limit: String(l),
      });
      if (searchValue) {
        query.append('search', searchValue);
      }
      if (currentFilters.sortBy) {
        query.append('sortBy', currentFilters.sortBy);
      }
      if (currentFilters.sortOrder) {
        query.append('sortOrder', currentFilters.sortOrder);
      }

      const response = await Request.GET(`/tunjangan?${query.toString()}`);
      if (response.success) {
        setTunjangan(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalData(response.data.pagination?.total || 0);
      } else {
        toast.error(response.message || 'Gagal memuat data tunjangan');
      }
    } catch {
      toast.error('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchTunjangan(page, limit, filters, search);
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, filters]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    await fetchTunjangan(1, limit, filters, search);
  };

  const handleExport = async () => {
    try {
      const query = new URLSearchParams({ search });
      if (filters.search) {
        query.append('search', filters.search);
      }
      const res = await Request.GET(
        `/tunjangan/export?${query.toString()}`
      );
      if (res.success) toast.info('Fitur export PDF dalam pengembangan.');
    } catch {
      toast.error('Gagal export data');
    }
  };

  const columns = useMemo(
    () => [
      { key: 'no', label: '#' },
      { key: 'pegawai', label: 'Pegawai' },
      { key: 'periode', label: 'Periode' },
      { key: 'jarak', label: 'Jarak' },
      { key: 'hariMasuk', label: 'Hari Masuk' },
      { key: 'baseFare', label: 'Base Fare' },
      { key: 'total', label: 'Total Tunjangan' },
      { key: 'tanggal', label: 'Tanggal' },
      { key: 'action', label: 'Aksi' },
    ],
    []
  );

  const data = tunjangan.map((item, i) => ({
    no: (page - 1) * limit + i + 1,
    pegawai: (
      <div>
        <div className='fw-semibold text-dark'>{item.pegawai.nama}</div>
        <div className='small text-secondary'>{item.pegawai.nip}</div>
        <div className='small text-secondary'>
          {item.pegawai.departemen || '-'}
        </div>
      </div>
    ),
    periode: <span className='fw-medium text-dark'>{item.periode}</span>,
    jarak: <span className='text-secondary'>{item.jarakKm} KM</span>,
    hariMasuk: (
      <span className='text-secondary'>{item.jumlahHariMasuk} Hari</span>
    ),
    baseFare: (
      <span className='text-secondary'>
        {formatRupiah(Number(item.baseFare))}
      </span>
    ),
    total: (
      <span className='fw-bold text-success'>
        {formatRupiah(Number(item.totalTunjangan))}
      </span>
    ),
    tanggal: (
      <span className='small text-secondary'>
        {dateFormat(item.createDate, 'DD MMM YYYY')}
      </span>
    ),
    action: (
      <div className='d-flex align-items-center gap-1'>
        <Link
          href={`/tunjangan/detail/${item.id}`}
          className='btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center'
          title='Detail'
          style={{ width: 30, height: 30, padding: 0 }}
        >
          <FiEye size={13} />
        </Link>
        <button
          type='button'
          onClick={handleExport}
          className='btn btn-sm btn-outline-success d-flex align-items-center justify-content-center'
          title='Download PDF'
          style={{ width: 30, height: 30, padding: 0 }}
        >
          <FiDownload size={13} />
        </button>
      </div>
    ),
  }));

  return (
    <>
      <Card className='w-100 bg-white border shadow-sm rounded-4 p-4'>
        <PageHeader
          title='Tunjangan Transport'
          description='Kelola data tunjangan transport pegawai.'
        />
        <div className='alert alert-light border rounded-4 mb-4'>
          <div className='fw-semibold mb-2'>Aturan Tunjangan Transport</div>
          <ul className='mb-0 small text-secondary ps-3'>
            <li>Rumus: Base Fare × KM × Jumlah Hari Masuk</li>
            <li>Minimal hari kerja: 19 hari</li>
            <li>Jarak minimal: lebih dari 5 KM</li>
            <li>Jarak maksimal dihitung: 25 KM</li>
            <li>Hanya berlaku untuk pegawai tetap</li>
          </ul>
        </div>
        <div className='d-flex flex-column flex-lg-row justify-content-between align-items-stretch align-items-lg-center gap-3 mb-4'>
          <div className='flex-grow-1'>
            <SearchBar
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              onSubmit={handleSearch}
              placeholder='Cari nama atau NIP pegawai...'
            />
          </div>
          <div className='d-flex flex-wrap gap-2'>
            <button
              type='button'
              onClick={() => fetchTunjangan(page, limit, filters, search)}
              className='btn text-white fw-semibold d-inline-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded-4 shadow-sm'
              style={{
                background:
                  'linear-gradient(135deg, #0d2a94 0%, #1e40af 100%)',
                border: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <FiRefreshCw size={15} />
              Refresh
            </button>
            <button
              type='button'
              onClick={handleExport}
              className='btn text-white fw-semibold d-inline-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded-4 shadow-sm'
              style={{
                background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
                border: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <FiDownload size={15} />
              Export
            </button>
            <button
              type='button'
              onClick={() => setFilterDialog(true)}
              className='btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 rounded-4 px-3 py-2 shadow-sm'
            >
              <FiFilter size={16} />
              Filter
            </button>
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
        title='Filter Tunjangan'
        fields={[
          {
            name: 'sortBy',
            label: 'Urutkan Berdasarkan',
            type: 'select',
            options: [
              {
                label: 'Periode',
                value: 'periode',
              },
              {
                label: 'Pegawai',
                value: 'pegawai',
              },
              {
                label: 'Total Tunjangan',
                value: 'totalTunjangan',
              },
              {
                label: 'Jumlah Hari Masuk',
                value: 'jumlahHariMasuk',
              },
            ],
          },
          {
            name: 'sortOrder',
            label: 'Urutan',
            type: 'select',
            options: [
              {
                label: 'Descending',
                value: 'desc',
              },
              {
                label: 'Ascending',
                value: 'asc',
              },
            ],
          },
        ]}
        initialValues={filters}
        onApplyAction={(f) => {
          setPage(1);
          setFilters(f);
        }}
      />
    </>
  );
}
