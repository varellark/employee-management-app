'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiEdit2, FiFilter, FiTrash2 } from 'react-icons/fi';
import Card from '@/components/ui/card';
import Table from '@/components/ui/table';
import PageHeader from '@/components/ui/pageHeader';
import SearchBar from '@/components/ui/searchBar';
import ModalConfirmDelete from '@/components/ui/modalConfirm';
import Filter from '@/components/ui/filter';
import Badge from '@/components/ui/badge';
import useAuthStore from '@/store/authStore';
import Request from '@/utils/request';
import { dateFormat } from '@/utils/date';
import { toast } from 'react-toastify';
import { UserLogin } from '@/types/auth';
import { User } from '@/types/user';

export default function UsersPage() {
  const user: UserLogin | null = useAuthStore((state) => state.user);
  const role = user?.role;
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
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
    name?: string;
  }>({
    show: false,
  });

  const fetchUsers = async (q = '', p = 1, l = 10, status = '') => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search: q,
        page: String(p),
        limit: String(l),
      });
      if (status) {
        query.append('status', status);
      }

      const dataUsers = await Request.GET(`/users?${query.toString()}`);
      if (dataUsers.success) {
        setUsers(dataUsers.data.data);
        setTotalPages(dataUsers.data.pagination.totalPages);
        setTotalData(dataUsers.data.pagination.total);
      } else {
        toast.error(dataUsers.message || 'Gagal memuat data user');
      }
    } catch {
      toast.error('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchUsers(search, page, limit, filters.status || '');
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, filters]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    await fetchUsers(search, 1, limit);
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const response = await Request.DELETE(`/users/${id}`);
      if (response.success) {
        toast.success(response.message || 'User berhasil dihapus');
        await fetchUsers(search, page, limit);
      } else {
        toast.error(response.message || 'Gagal menghapus user');
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

  const columns = [
    { key: 'no', label: '#' },
    { key: 'nama', label: 'Nama' },
    { key: 'role', label: 'Role' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' },
    { key: 'tanggal', label: 'Tanggal Buat' },
    { key: 'action', label: 'Aksi' },
  ];

  const data = users.map((item, i) => ({
    no: (page - 1) * limit + i + 1,
    nama: (
      <span className='fw-medium text-dark'>{item.pegawai?.nama || '-'}</span>
    ),
    role: (
      <span
        className='d-inline-block px-3 py-1 rounded-pill small fw-semibold'
        style={{
          background: '#dbeafe',
          color: '#1d4ed8',
        }}
      >
        {item.role}
      </span>
    ),
    email: (
      <span
        className='text-secondary small'
        style={{
          wordBreak: 'break-word',
        }}
      >
        {item.pegawai?.email || '-'}
      </span>
    ),
    status:
      item.statusAktif === 'ACTIVE' ? (
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
      ),
    tanggal: (
      <span className='text-secondary small'>
        {dateFormat(item.createDate, 'DD MMMM YYYY')}
      </span>
    ),
    action:
      item.id === user?.id ? (
        <span className='text-secondary small fst-italic'>Akun sendiri</span>
      ) : (
        <div className='d-flex align-items-center gap-1'>
          <Link
            href={role === 'SUPERADMIN' ? `/users/edit/${item.id}` : '#'}
            className='btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center'
            title='Detail'
            style={{ width: 30, height: 30, padding: 0 }}
            onClick={(e) => role !== 'SUPERADMIN' && e.preventDefault()}
          >
            <FiEdit2 size={14} />
          </Link>
          <button
            type='button'
            disabled={role !== 'SUPERADMIN'}
            onClick={() =>
              setDeleteDialog({
                show: true,
                id: item.id,
                name: item.pegawai?.nama,
              })
            }
            className='btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center'
            title='Hapus'
            style={{ width: 30, height: 30, padding: 0 }}
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      ),
  }));

  return (
    <>
      <Card className='w-100 bg-white border shadow-sm rounded-4 p-4'>
        <PageHeader
          title='Manajemen User'
          description='Kelola semua akun user dengan cepat dan nyaman.'
          addLink='/users/add'
          addLabel='Tambah User'
        />
        <div className='d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-3 mb-4'>
          <SearchBar
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
            onSubmit={handleSearch}
            placeholder='Cari nama atau email...'
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
        message={`Anda yakin ingin menghapus akun ${deleteDialog.name}?`}
        onCancel={() =>
          setDeleteDialog({
            show: false,
          })
        }
        onConfirm={() => handleDelete(deleteDialog.id!)}
      />
      <Filter
        show={filterDialog}
        onCloseAction={() => setFilterDialog(false)}
        title='Filter User'
        fields={[
          {
            name: 'status',
            label: 'Status User',
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
