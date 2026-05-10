'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiEdit2, FiFilter, FiTrash2 } from 'react-icons/fi';
import Card from '@/components/ui/card';
import Table from '@/components/ui/table';
import PageHeader from '@/components/ui/pageHeader';
import ModalConfirmDelete from '@/components/ui/modalConfirm';
import Filter from '@/components/ui/filter';
import Request from '@/utils/request';
import { dateFormat } from '@/utils/date';
import { toast } from 'react-toastify';
import { formatRupiah } from '@/utils/format';
import { SettingTunjanganTransport } from '@/types/setting-tunjangan-transport';

export default function SettingTunjanganPage() {
  const [settings, setSettings] = useState<SettingTunjanganTransport[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [filterDialog, setFilterDialog] = useState(false);
  const [filters, setFilters] = useState<{
    status?: string;
  }>({});

  const [deleteDialog, setDeleteDialog] = useState<{
    show: boolean;
    id?: number;
  }>({
    show: false,
  });

  const [toggleDialog, setToggleDialog] = useState<{
    show: boolean;
    id?: number;
    status?: string;
  }>({
    show: false,
  });

  const fetchSettings = async (p = 1, l = 10, status = '') => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: String(p),
        limit: String(l),
      });
      if (status) {
        query.append('status', status);
      }

      const response = await Request.GET(
        `/setting-tunjangan?${query.toString()}`
      );
      if (response.success) {
        setSettings(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalData(response.data.pagination.total);
      } else {
        toast.error(response.message || 'Gagal memuat data setting tunjangan');
      }
    } catch {
      toast.error('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchSettings(page, limit, filters.status || '');
    })();
  }, [page, limit, filters]);

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const response = await Request.DELETE(`/setting-tunjangan/${id}`);
      if (response.success) {
        toast.success(response.message || 'Setting tunjangan berhasil dihapus');
        await fetchSettings(page, limit, filters.status || '');
      } else {
        toast.error(response.message || 'Gagal menghapus setting tunjangan');
      }
    } catch {
      toast.error('Gagal terhubung ke server');
    } finally {
      setLoading(false);
      setDeleteDialog({
        show: false,
      });
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      setLoading(true);
      const response = await Request.PATCH(
        `/setting-tunjangan/${id}/toggle-status`,
        {}
      );
      if (response.success) {
        toast.success(response.message || 'Status setting berhasil diubah');
        await fetchSettings(page, limit, filters.status || '');
      } else {
        toast.error(response.message || 'Gagal mengubah status');
      }
    } catch {
      toast.error('Gagal terhubung ke server');
    } finally {
      setLoading(false);
      setToggleDialog({
        show: false,
      });
    }
  };

  const columns = [
    { key: 'no', label: '#' },
    { key: 'baseFare', label: 'Base Fare' },
    { key: 'keterangan', label: 'Keterangan' },
    { key: 'status', label: 'Status' },
    { key: 'tanggal', label: 'Tanggal Dibuat' },
    { key: 'action', label: 'Aksi' },
  ];

  const data = settings.map((item, i) => ({
    no: (page - 1) * limit + i + 1,
    baseFare: (
      <span className='fw-semibold text-dark'>
        {formatRupiah(Number(item.baseFare))}
      </span>
    ),
    keterangan: (
      <span className='text-secondary small'>{item.keterangan || '-'}</span>
    ),
    status: (
      <div className='d-flex justify-content-center align-items-center h-100'>
        <div className='form-check form-switch m-0 d-flex align-items-center'>
          <input
            className='form-check-input'
            type='checkbox'
            role='switch'
            checked={item.statusAktif === 'ACTIVE'}
            onChange={() =>
              setToggleDialog({
                show: true,
                id: item.id,
                status: item.statusAktif,
              })
            }
            style={{
              width: '2.5rem',
              height: '1.3rem',
              cursor: 'pointer',
            }}
          />
        </div>
      </div>
    ),
    tanggal: (
      <span className='text-secondary small'>
        {dateFormat(item.createDate, 'DD MMMM YYYY')}
      </span>
    ),
    action: (
      <div className='d-flex align-items-center gap-1'>
        <Link
          href={`/setting-tunjangan/edit/${item.id}`}
          className='btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center'
          title='Edit'
          style={{ width: 30, height: 30, padding: 0 }}
        >
          <FiEdit2 size={13} />
        </Link>
        <button
          type='button'
          onClick={() =>
            setDeleteDialog({
              show: true,
              id: item.id,
            })
          }
          className='btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center'
          title='Hapus'
          style={{ width: 30, height: 30, padding: 0 }}
        >
          <FiTrash2 size={13} />
        </button>
      </div>
    ),
  }));

  return (
    <>
      <Card className='w-100 bg-white border shadow-sm rounded-4 p-4'>
        <PageHeader
          title='Setting Tunjangan Transport'
          description='Kelola pengaturan base fare tunjangan transport pegawai.'
          addLink='/setting-tunjangan/add'
          addLabel='Tambah Setting'
        />
        <div className='d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-3 mb-4'>
          <div />
          <button
            type='button'
            onClick={() => setFilterDialog(true)}
            className='btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 rounded-4 px-3 py-2 shadow-sm'
          >
            <FiFilter size={16} />
            Filter
          </button>
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
      <ModalConfirmDelete
        show={deleteDialog.show}
        message='Anda yakin ingin menghapus setting tunjangan ini?'
        onCancel={() =>
          setDeleteDialog({
            show: false,
          })
        }
        onConfirm={() => handleDelete(deleteDialog.id!)}
      />
      <ModalConfirmDelete
        show={toggleDialog.show}
        message={`Anda yakin ingin ${
          toggleDialog.status === 'ACTIVE' ? 'menonaktifkan' : 'mengaktifkan'
        } setting ini?`}
        onCancel={() =>
          setToggleDialog({
            show: false,
          })
        }
        onConfirm={() => handleToggleStatus(toggleDialog.id!)}
      />
      <Filter
        show={filterDialog}
        onCloseAction={() => setFilterDialog(false)}
        title='Filter Setting Tunjangan'
        fields={[
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
              {
                value: 'ACTIVE',
                label: 'Aktif',
              },
              {
                value: 'NON_ACTIVE',
                label: 'Nonaktif',
              },
            ],
          },
        ]}
        initialValues={filters}
        onApplyAction={(f) => setFilters(f)}
      />
    </>
  );
}
