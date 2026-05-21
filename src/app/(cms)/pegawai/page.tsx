'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FiEdit2,
  FiEye,
  FiFilter,
  FiTrash2,
  FiDownload,
  FiPlus,
  FiChevronUp,
  FiChevronDown,
} from 'react-icons/fi';
import Card from '@/components/ui/card';
import SearchBar from '@/components/ui/searchBar';
import ModalConfirmDelete from '@/components/ui/modalConfirm';
import Filter from '@/components/ui/filter';
import Badge from '@/components/ui/badge';
import useAuthStore from '@/store/authStore';
import Request from '@/utils/request';
import { dateFormat } from '@/utils/date';
import { toast } from 'react-toastify';
import { UserLogin } from '@/types/auth';
import { Pegawai } from '@/types/pegawai';

type SortKey = 'nip' | 'nama' | 'jabatan' | 'tanggalMasuk' | 'masaKerja';
type SortOrder = 'asc' | 'desc';

export default function PegawaiPage() {
  const user: UserLogin | null = useAuthStore((state) => state.user);
  const role = user?.role;
  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [filterDialog, setFilterDialog] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>('nama');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [filters, setFilters] = useState<{
    status?: string;
    jabatan?: string;
    jenisPegawai?: string;
    masaKerjaOperator?: string;
    masaKerjaTahun?: string;
  }>({});

  const [deleteDialog, setDeleteDialog] = useState<{
    show: boolean;
    ids?: number[];
    name?: string;
    bulk?: boolean;
  }>({ show: false });

  const fetchPegawai = useCallback(
    async (q = '', p = 1, l = 10, f = filters, sb = sortBy, so = sortOrder) => {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          search: q,
          page: String(p),
          limit: String(l),
          sortBy: sb,
          sortOrder: so,
        });
        if (f.status) query.append('status', f.status);
        if (f.jabatan) query.append('jabatan', f.jabatan);
        if (f.jenisPegawai) query.append('jenisPegawai', f.jenisPegawai);
        if (f.masaKerjaOperator)
          query.append('masaKerjaOperator', f.masaKerjaOperator);
        if (f.masaKerjaTahun) query.append('masaKerjaTahun', f.masaKerjaTahun);

        const res = await Request.GET(`/pegawai?${query.toString()}`);
        if (res.success) {
          setPegawaiList(res.data.data);
          setTotalPages(res.data.pagination.totalPages);
          setTotalData(res.data.pagination.total);
        } else {
          toast.error(res.message || 'Gagal memuat data pegawai');
        }
      } catch {
        toast.error('Gagal terhubung ke server');
      } finally {
        setLoading(false);
      }
    },
    [filters, sortBy, sortOrder]
  );

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await fetchPegawai(search, page, limit, filters, sortBy, sortOrder);
      if (!cancelled) setSelectedIds([]);
    };
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, filters, sortBy, sortOrder]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    await fetchPegawai(search, 1, limit, filters, sortBy, sortOrder);
    setSelectedIds([]);
  };

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? pegawaiList.map((p) => p.id) : []);
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((i) => i !== id)
    );
  };

  const handleDelete = async (ids: number[]) => {
    try {
      setLoading(true);
      let response;
      if (ids.length === 1) {
        response = await Request.DELETE(`/pegawai/${ids[0]}`);
      } else {
        response = await Request.DELETE('/pegawai', { ids });
      }
      if (response.success) {
        toast.success(response.message || 'Pegawai berhasil dihapus');
        setSelectedIds([]);
        await fetchPegawai(search, page, limit, filters, sortBy, sortOrder);
      } else {
        toast.error(response.message || 'Gagal menghapus pegawai');
      }
    } catch {
      toast.error('Gagal terhubung ke server');
    } finally {
      setLoading(false);
      setDeleteDialog({ show: false });
    }
  };

  const handleDownloadAll = async () => {
    try {
      const query = new URLSearchParams({ search });
      if (filters.status) query.append('status', filters.status);
      const res = await Request.GET(`/pegawai/export?${query.toString()}`);
      if (res.success) toast.info('Fitur export PDF dalam pengembangan.');
    } catch {
      toast.error('Gagal export data');
    }
  };

  const handleDownloadOne = async (id: number) => {
    try {
      const res = await Request.GET(`/pegawai/${id}/export`);
      if (res.success) toast.info('Fitur export PDF dalam pengembangan.');
    } catch {
      toast.error('Gagal export data');
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortBy !== col)
      return (
        <FiChevronUp size={12} className='text-secondary opacity-25 ms-1' />
      );
    return sortOrder === 'asc' ? (
      <FiChevronUp size={12} className='ms-1 text-primary' />
    ) : (
      <FiChevronDown size={12} className='ms-1 text-primary' />
    );
  };

  const formatMasaKerja = (mk: number) => {
    const tahun = Math.floor(mk);
    const bulan = Math.round((mk - tahun) * 12);
    if (tahun === 0) return `${bulan} bln`;
    if (bulan === 0) return `${tahun} thn`;
    return `${tahun} thn ${bulan} bln`;
  };

  const isAllSelected = pegawaiList.length > 0 && selectedIds.length === pegawaiList.length;
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

  return (
    <>
      <Card className='w-100 bg-white border shadow-sm rounded-4 p-4'>
        <div className='d-flex flex-column flex-md-row align-items-md-start justify-content-between gap-3 mb-4'>
          <div>
            <h4
              className='fw-bold text-dark mb-1'
              style={{
                fontSize: '1.5rem',
                letterSpacing: '-0.5px',
              }}
            >
              Manajemen Pegawai
            </h4>
            <p className='text-secondary small mb-0'>
              Kelola data seluruh pegawai perusahaan.
            </p>
          </div>
          <div className='d-flex gap-2 flex-wrap'>
            {selectedIds.length > 0 && role === 'ADMIN_HRD' && (
              <button
                type='button'
                onClick={() =>
                  setDeleteDialog({
                    show: true,
                    ids: selectedIds,
                    bulk: true,
                    name: `${selectedIds.length} pegawai`,
                  })
                }
                className='btn text-white fw-semibold d-inline-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded-4 shadow-sm'
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                  border: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <FiTrash2 size={15} />
                Hapus ({selectedIds.length})
              </button>
            )}
            <button
              type='button'
              onClick={handleDownloadAll}
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
            {role === 'ADMIN_HRD' && (
              <Link
                href='/pegawai/add'
                className='btn text-white fw-semibold d-inline-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded-4 shadow-sm'
                style={{
                  background:
                    'linear-gradient(135deg, #0d2a94 0%, #1e40af 100%)',
                  border: 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <FiPlus size={15} />
                Tambah Pegawai
              </Link>
            )}
          </div>
        </div>
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
        <div className='table-responsive border rounded-4 shadow-sm bg-white'>
          <table className='table align-middle mb-0'>
            <thead style={{ background: '#f8f9fa' }}>
              <tr>
                {role === 'ADMIN_HRD' && (
                  <th className='px-3 py-3 border-bottom' style={{ width: 40 }}>
                    <input
                      type='checkbox'
                      className='form-check-input'
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isSomeSelected;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                )}
                <th
                  className='px-4 py-3 text-uppercase small fw-semibold text-secondary border-bottom'
                  style={{
                    letterSpacing: '0.5px',
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  #
                </th>
                {(
                  [
                    'nip',
                    'nama',
                    'jabatan',
                    'tanggalMasuk',
                    'masaKerja',
                  ] as SortKey[]
                ).map((col) => {
                  const labels: Record<SortKey, string> = {
                    nip: 'NIP',
                    nama: 'Nama',
                    jabatan: 'Jabatan',
                    tanggalMasuk: 'Tgl Masuk',
                    masaKerja: 'Masa Kerja',
                  };
                  return (
                    <th
                      key={col}
                      className='px-4 py-3 text-uppercase small fw-semibold text-secondary border-bottom'
                      style={{
                        letterSpacing: '0.5px',
                        fontSize: '0.75rem',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                      onClick={() => handleSort(col)}
                    >
                      <span className='d-flex align-items-center'>
                        {labels[col]}
                        <SortIcon col={col} />
                      </span>
                    </th>
                  );
                })}
                <th
                  className='px-4 py-3 text-uppercase small fw-semibold text-secondary border-bottom'
                  style={{ letterSpacing: '0.5px', fontSize: '0.75rem' }}
                >
                  Status
                </th>
                <th
                  className='px-4 py-3 text-uppercase small fw-semibold text-secondary border-bottom'
                  style={{ letterSpacing: '0.5px', fontSize: '0.75rem' }}
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {role === 'ADMIN_HRD' && (
                      <td className='px-3 py-3'>
                        <div className='placeholder-glow'>
                          <span className='placeholder col-8 rounded' />
                        </div>
                      </td>
                    )}
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className='px-4 py-3'>
                        <div className='placeholder-glow'>
                          <span className='placeholder col-8 rounded' />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : pegawaiList.length > 0 ? (
                pegawaiList.map((item, i) => (
                  <tr key={item.id} className='align-middle'>
                    {role === 'ADMIN_HRD' && (
                      <td className='px-3 py-3'>
                        <input
                          type='checkbox'
                          className='form-check-input'
                          checked={selectedIds.includes(item.id)}
                          onChange={(e) =>
                            handleSelectOne(item.id, e.target.checked)
                          }
                        />
                      </td>
                    )}
                    <td className='px-4 py-3 text-secondary small'>
                      {(page - 1) * limit + i + 1}
                    </td>
                    <td className='px-4 py-3'>
                      <span className='fw-medium text-dark small font-monospace'>
                        {item.nip}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <div className='d-flex align-items-center gap-2'>
                        {item.foto ? (
                          <Image
                            src={item.foto}
                            alt={item.nama}
                            width={32}
                            height={32}
                            className='rounded-circle'
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            className='rounded-circle d-flex align-items-center justify-content-center fw-semibold'
                            style={{
                              width: 32,
                              height: 32,
                              background: '#dbeafe',
                              color: '#1d4ed8',
                              fontSize: 12,
                              flexShrink: 0,
                            }}
                          >
                            {item.nama.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className='fw-semibold text-dark small'>
                            {item.nama}
                          </div>
                          <div
                            className='text-secondary'
                            style={{ fontSize: 11 }}
                          >
                            {item.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <span
                        className='d-inline-block px-2 py-1 rounded-pill small fw-semibold'
                        style={{
                          background: '#f0fdf4',
                          color: '#166534',
                          fontSize: 11,
                        }}
                      >
                        {item.jabatan}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-secondary small'>
                      {dateFormat(item.tanggalMasuk, 'DD MMM YYYY')}
                    </td>
                    <td className='px-4 py-3'>
                      <span className='text-dark small'>
                        {formatMasaKerja(item.masaKerja)}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      {item.statusAktif === 'ACTIVE' ? (
                        <Badge
                          title='Aktif'
                          className='text-success bg-success-subtle'
                          dotClassName='bg-success'
                          pulse
                        />
                      ) : (
                        <Badge
                          title='Nonaktif'
                          className='text-danger bg-danger-subtle'
                          dotClassName='bg-danger'
                        />
                      )}
                    </td>
                    <td className='px-4 py-3'>
                      {item.id === user?.pegawai?.id ? (
                        <span className='text-secondary small fst-italic'>Akun sendiri</span>
                      ) : (
                        <div className='d-flex align-items-center gap-1'>
                          <Link
                            href={`/pegawai/detail/${item.id}`}
                            className='btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center'
                            title='Detail'
                            style={{ width: 30, height: 30, padding: 0 }}
                          >
                            <FiEye size={13} />
                          </Link>
                          {role === 'ADMIN_HRD' && (
                            <Link
                              href={`/pegawai/edit/${item.id}`}
                              className='btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center'
                              title='Edit'
                              style={{ width: 30, height: 30, padding: 0 }}
                            >
                              <FiEdit2 size={13} />
                            </Link>
                          )}
                          <button
                            type='button'
                            onClick={() => handleDownloadOne(item.id)}
                            className='btn btn-sm btn-outline-success d-flex align-items-center justify-content-center'
                            title='Download PDF'
                            style={{ width: 30, height: 30, padding: 0 }}
                          >
                            <FiDownload size={13} />
                          </button>
                          {role === 'ADMIN_HRD' && (
                            <button
                              type='button'
                              onClick={() =>
                                setDeleteDialog({
                                  show: true,
                                  ids: [item.id],
                                  name: item.nama,
                                })
                              }
                              className='btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center'
                              title='Hapus'
                              style={{ width: 30, height: 30, padding: 0 }}
                            >
                              <FiTrash2 size={13} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={role === 'ADMIN_HRD' ? 9 : 8}
                    className='text-center py-5'
                  >
                    <div className='d-flex flex-column align-items-center justify-content-center text-secondary'>
                      <span style={{ fontSize: '3rem' }}>📭</span>
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
            <span className='fw-semibold text-dark'>{pegawaiList.length}</span>{' '}
            dari <span className='fw-semibold text-dark'>{totalData}</span> data
          </div>
          <div className='d-flex align-items-center gap-2 flex-wrap justify-content-center'>
            <button
              type='button'
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className='btn btn-sm btn-outline-secondary'
            >
              Prev
            </button>
            <span className='small text-dark px-2'>
              {page} / {totalPages || 1}
            </span>
            <button
              type='button'
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages || totalPages === 0}
              className='btn btn-sm btn-outline-secondary'
            >
              Next
            </button>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className='form-select form-select-sm ms-1'
              style={{ width: 80 }}
            >
              {[10, 20, 30, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>
      <Filter
        show={filterDialog}
        onCloseAction={() => setFilterDialog(false)}
        title='Filter Pegawai'
        fields={[
          {
            name: 'status',
            label: 'Status Pegawai',
            type: 'select',
            options: [
              { value: 'ACTIVE', label: 'Aktif' },
              { value: 'NON_ACTIVE', label: 'Nonaktif' },
            ],
          },
          {
            name: 'jabatan',
            label: 'Jabatan',
            type: 'multiselect',
            options: [
              { value: 'MANAGER', label: 'Manager' },
              { value: 'STAF', label: 'Staf' },
              { value: 'MAGANG', label: 'Magang' },
              { value: 'KARYAWAN', label: 'Karyawan' },
            ],
          },
          {
            name: 'jenisPegawai',
            label: 'Jenis Pegawai',
            type: 'multiselect',
            options: [
              { value: 'TETAP', label: 'Tetap' },
              { value: 'KONTRAK', label: 'Kontrak' },
              { value: 'MAGANG', label: 'Magang' },
            ],
          },
          {
            name: 'masaKerja',
            label: 'Masa Kerja (Tahun)',
            type: 'masa-kerja' as 'select',
          },
        ]}
        initialValues={filters}
        onApplyAction={(f) => {
          setFilters(f);
          setPage(1);
        }}
      />
      <ModalConfirmDelete
        show={deleteDialog.show}
        message={
          deleteDialog.bulk
            ? `Anda yakin ingin menghapus ${deleteDialog.name}? Tindakan ini tidak dapat dibatalkan.`
            : `Anda yakin ingin menghapus data pegawai ${deleteDialog.name}?`
        }
        onCancel={() => setDeleteDialog({ show: false })}
        onConfirm={() => handleDelete(deleteDialog.ids!)}
      />
    </>
  );
}
