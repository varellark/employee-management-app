'use client';

import React, { useEffect, useState } from 'react';
import { FiFilter, FiMonitor, FiUser } from 'react-icons/fi';
import Card from '@/components/ui/card';
import Table from '@/components/ui/table';
import PageHeader from '@/components/ui/pageHeader';
import SearchBar from '@/components/ui/searchBar';
import Filter, { FilterValue } from '@/components/ui/filter';
import Request from '@/utils/request';
import { dateFormat } from '@/utils/date';
import { toast } from 'react-toastify';

interface LogItem {
  id: number;
  userId: number;
  username: string;
  aksi: string;
  modul: string;
  keterangan: string;
  ipAddress: string;
  userAgent: string;
  createDate: string;
  user: {
    id: number;
    username: string;
    role: string;
    pegawai: { nama: string } | null;
  } | null;
}

interface UserItem {
  username: string;
  pegawai: { nama: string } | null;
}

const MODUL_OPTIONS = [
  { value: 'AUTH LOGIN', label: 'Auth Login' },
  { value: 'AUTH LOGOUT', label: 'Auth Logout' },
  { value: 'USER', label: 'User' },
  { value: 'DASHBOARD', label: 'Dashboard' },
  { value: 'PEGAWAI', label: 'Pegawai' },
  { value: 'PRESENSI', label: 'Presensi' },
  { value: 'TUNJANGAN', label: 'Tunjangan' },
  { value: 'SETTING_TUNJANGAN', label: 'Pengaturan Tunjangan' },
];

const AKSI_OPTIONS = [
  { value: 'CREATE', label: 'Create' },
  { value: 'READ', label: 'Read' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
];

const modulColor: Record<string, { bg: string; color: string }> = {
  USER: { bg: '#dbeafe', color: '#1d4ed8' },
  PEGAWAI: { bg: '#d1fae5', color: '#065f46' },
  AUTH: { bg: '#fef9c3', color: '#854d0e' },
  LOG: { bg: '#f3e8ff', color: '#6b21a8' },
};

function ModulBadge({ modul }: { modul: string }) {
  const s = modulColor[modul] ?? { bg: '#f1f5f9', color: '#475569' };
  return (
    <span
      className='d-inline-block px-3 py-1 rounded-pill small fw-semibold'
      style={{ background: s.bg, color: s.color }}
    >
      {modul}
    </span>
  );
}

function parseUserAgent(ua: string): string {
  if (!ua) return '-';
  const browser = ua.includes('Chrome')
    ? 'Chrome'
    : ua.includes('Firefox')
      ? 'Firefox'
      : ua.includes('Safari')
        ? 'Safari'
        : ua.includes('Edge')
          ? 'Edge'
          : 'Browser';
  const os = ua.includes('Windows')
    ? 'Windows'
    : ua.includes('Mac')
      ? 'macOS'
      : ua.includes('Linux')
        ? 'Linux'
        : ua.includes('Android')
          ? 'Android'
          : ua.includes('iPhone') || ua.includes('iPad')
            ? 'iOS'
            : 'OS';
  return `${browser} / ${os}`;
}

interface LogFilters {
  username: string[];
  modul: string[];
  aksi: string | null;
  startDate: string | null;
  endDate: string | null;
}

const EMPTY_FILTERS: LogFilters = {
  username: [],
  modul: [],
  aksi: null,
  startDate: null,
  endDate: null,
};

export default function LogPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [filterDialog, setFilterDialog] = useState(false);
  const [filters, setFilters] = useState<LogFilters>(EMPTY_FILTERS);
  const [usernameOptions, setUsernameOptions] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await Request.GET('/users?noPagination=true');
        if (res.success) {
          const list: UserItem[] = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data?.data)
              ? res.data.data
              : [];

          setUsernameOptions(
            list.map((u) => ({
              value: u.username,
              label: u.pegawai?.nama
                ? `${u.pegawai.nama} (${u.username})`
                : u.username,
            }))
          );
        }
      } catch {}
    })();
  }, []);

  const buildQuery = (
    q: string,
    p: number,
    l: number,
    f: LogFilters
  ): string => {
    const params = new URLSearchParams({
      search: q,
      page: String(p),
      limit: String(l),
    });
    if (f.username.length) params.append('username', f.username.join(','));
    if (f.modul.length) params.append('modul', f.modul.join(','));
    if (f.aksi) params.append('aksi', f.aksi);
    if (f.startDate) params.append('startDate', f.startDate);
    if (f.endDate) params.append('endDate', f.endDate);
    return params.toString();
  };

  const fetchLogs = async (
    q = '',
    p = 1,
    l = 10,
    f: LogFilters = EMPTY_FILTERS
  ) => {
    setLoading(true);
    try {
      const res = await Request.GET(`/log?${buildQuery(q, p, l, f)}`);
      if (res.success) {
        setLogs(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
        setTotalData(res.data.pagination.total);
      } else {
        toast.error(res.message || 'Gagal memuat data log');
      }
    } catch {
      toast.error('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchLogs(search, page, limit, filters);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, filters]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    await fetchLogs(search, 1, limit, filters);
  };

  const handleApplyFilter = (raw: Record<string, FilterValue>) => {
    const toArr = (v: FilterValue): string[] => {
      if (!v) return [];
      return Array.isArray(v) ? v : [v];
    };
    setFilters({
      username: toArr(raw.username),
      modul: toArr(raw.modul),
      aksi: (raw.aksi as string) || null,
      startDate: (raw.startDate as string) || null,
      endDate: (raw.endDate as string) || null,
    });
    setPage(1);
  };

  const filterInitialValues: Record<string, FilterValue> = {
    username: filters.username,
    modul: filters.modul,
    aksi: filters.aksi,
    startDate: filters.startDate,
    endDate: filters.endDate,
  };

  const columns = [
    { key: 'no', label: '#' },
    { key: 'user', label: 'User' },
    { key: 'modul', label: 'Modul' },
    { key: 'keterangan', label: 'Keterangan' },
    { key: 'device', label: 'Perangkat' },
    { key: 'ip', label: 'IP Address' },
    { key: 'tanggal', label: 'Tanggal & Jam' },
  ];

  const data = logs.map((item, i) => ({
    no: (page - 1) * limit + i + 1,
    user: (
      <div className='d-flex flex-column gap-1'>
        <span className='fw-medium text-dark'>
          {item.user?.pegawai?.nama ?? item.username}
        </span>
        <span className='text-secondary small d-flex align-items-center gap-1'>
          <FiUser size={11} />
          {item.username}
          {item.user?.role && (
            <span
              className='ms-1 px-2 rounded-pill fw-semibold'
              style={{
                background: '#dbeafe',
                color: '#1d4ed8',
                fontSize: '10px',
              }}
            >
              {item.user.role}
            </span>
          )}
        </span>
      </div>
    ),
    modul: <ModulBadge modul={item.modul} />,
    keterangan: (
      <span className='text-secondary small'>{item.keterangan || '-'}</span>
    ),
    device: (
      <span
        className='text-secondary small d-flex align-items-center gap-1'
        title={item.userAgent}
      >
        <FiMonitor size={12} />
        {parseUserAgent(item.userAgent)}
      </span>
    ),
    ip: (
      <code
        className='small'
        style={{
          background: '#f1f5f9',
          padding: '2px 8px',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#475569',
        }}
      >
        {item.ipAddress || '-'}
      </code>
    ),
    tanggal: (
      <div className='d-flex flex-column gap-0'>
        <span className='text-secondary small'>
          {dateFormat(item.createDate, 'DD MMMM YYYY')}
        </span>
        <span className='text-secondary' style={{ fontSize: '11px' }}>
          {dateFormat(item.createDate, 'HH:mm:ss')}
        </span>
      </div>
    ),
  }));

  return (
    <>
      <Card className='w-100 bg-white border shadow-sm rounded-4 p-4'>
        <PageHeader
          title='Log Aktivitas'
          description='Pantau seluruh aktivitas pengguna dalam sistem.'
        />
        <div className='d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-3 mb-4'>
          <SearchBar
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
            onSubmit={handleSearch}
            placeholder='Cari username atau modul...'
          />
          <button
            type='button'
            onClick={() => setFilterDialog(true)}
            className='btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 rounded-4 px-3 py-2 shadow-sm'
          >
            <FiFilter size={16} />
            Filter
            {Object.values(filters).some((v) =>
              Array.isArray(v) ? v.length > 0 : !!v
            ) && (
              <span
                className='badge rounded-pill'
                style={{ background: '#0d2a94', fontSize: '10px' }}
              >
                {
                  [
                    ...filters.username,
                    ...filters.modul,
                    filters.aksi,
                    filters.startDate,
                    filters.endDate,
                  ].filter(Boolean).length
                }
              </span>
            )}
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
      <Filter
        show={filterDialog}
        onCloseAction={() => setFilterDialog(false)}
        title='Filter Log'
        fields={[
          {
            name: 'username',
            label: 'Username',
            type: 'multiselect',
            options: usernameOptions,
          },
          {
            name: 'modul',
            label: 'Modul',
            type: 'multiselect',
            options: MODUL_OPTIONS,
          },
          {
            name: 'aksi',
            label: 'Aksi',
            type: 'select',
            options: AKSI_OPTIONS,
          },
          {
            name: 'daterange',
            label: 'Tanggal & Jam',
            type: 'daterange',
            startKey: 'startDate',
            endKey: 'endDate',
          },
        ]}
        initialValues={filterInitialValues}
        onApplyAction={handleApplyFilter}
      />
    </>
  );
}
