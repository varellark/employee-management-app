'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import {
  FiAlertTriangle,
  FiAward,
  FiBriefcase,
  FiCalendar,
  FiFileText,
  FiHome,
  FiLock,
  FiMapPin,
  FiRefreshCw,
  FiTruck,
  FiUserCheck,
  FiUsers,
} from 'react-icons/fi';
import useAuthStore from '@/store/authStore';
import Request from '@/utils/request';
import { toast } from 'react-toastify';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PegawaiTerbaru {
  id: string;
  nip: string;
  nama: string;
  jabatan: string;
  jenisPegawai: string;
  tanggalMasuk: string;
  foto?: string | null;
}

interface PegawaiTerdekat {
  id: string;
  nip: string;
  nama: string;
  jabatan: string;
  latitude: number;
  longitude: number;
  alamatDetail?: string | null;
  jarakKm: number;
}

interface DomisiliArea {
  id: string;
  nip: string;
  nama: string;
  latitude: number | null;
  longitude: number | null;
  alamatDetail?: string | null;
  kabupaten?: string | null;
  provinsi?: string | null;
}

interface ManagerDashboardData {
  widgets: {
    totalPegawai: number;
    totalPegawaiKontrak: number;
    totalPegawaiTetap: number;
    totalMagang: number;
  };
  chartJenisPegawai: { kontrak: number; tetap: number; magang: number };
  chartGender: { pria: number; wanita: number };
  pegawaiTerbaru: PegawaiTerbaru[];
  pegawaiTerdekat: PegawaiTerdekat | null;
  domisiliArea: DomisiliArea[];
}

function SkeletonBlock({
  height,
  width = '100%',
  radius = 8,
  circle = false,
}: {
  height: number;
  width?: number | string;
  radius?: number;
  circle?: boolean;
}) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius: circle ? '50%' : radius,
        background:
          'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        flexShrink: 0,
      }}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div className='container-fluid d-flex flex-column gap-4'>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className='card border-0 shadow-sm rounded-4'>
        <div className='card-body p-4 d-flex flex-column gap-2'>
          <SkeletonBlock height={28} width='40%' />
          <SkeletonBlock height={18} width='25%' />
        </div>
      </div>
      <div className='row g-4'>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className='col-12 col-md-6 col-xl-3'>
            <div className='card border-0 shadow-sm rounded-4 h-100'>
              <div className='card-body p-4 d-flex flex-column gap-3'>
                <SkeletonBlock height={16} width='60%' />
                <SkeletonBlock height={40} width='40%' />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className='row g-4'>
        {[0, 1].map((i) => (
          <div key={i} className='col-12 col-xl-6'>
            <div className='card border-0 shadow-sm rounded-4 h-100'>
              <div className='card-body p-4 d-flex flex-column align-items-center gap-4'>
                <SkeletonBlock height={20} width='35%' />
                <SkeletonBlock height={280} width={280} circle />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_COLORS = {
  backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
  borderColor: ['#2563EB', '#059669', '#D97706'],
  borderWidth: 2,
};

const GENDER_COLORS = {
  backgroundColor: ['#6366F1', '#EC4899'],
  borderColor: ['#4F46E5', '#DB2777'],
  borderWidth: 2,
};

const DOUGHNUT_OPTIONS = {
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 16,
        font: { size: 13, family: "'Plus Jakarta Sans', sans-serif" },
        usePointStyle: true,
        pointStyleWidth: 10,
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx: { label: string; parsed: number }) =>
          ` ${ctx.label}: ${ctx.parsed} orang`,
      },
    },
  },
  cutout: '65%',
  maintainAspectRatio: true,
};

function WidgetCard({
  label,
  value,
  icon,
  color,
  delay = 0,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}) {
  return (
    <div
      className='col-12 col-md-6 col-xl-3'
      style={{
        animation: `fadeIn 0.5s ease both`,
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        className='card border-0 shadow-sm rounded-4 h-100'
        style={{
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'default',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform =
            'translateY(-4px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            '0 8px 30px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = '';
        }}
      >
        <div className='card-body p-4 d-flex align-items-center gap-3'>
          <div
            className='d-flex align-items-center justify-content-center flex-shrink-0'
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: `${color}1A`,
              color,
            }}
          >
            {icon}
          </div>
          <div>
            <p
              className='text-muted mb-1'
              style={{ fontSize: 13, fontWeight: 500 }}
            >
              {label}
            </p>
            <h2
              className='fw-bold mb-0'
              style={{ fontSize: 28, lineHeight: 1, color }}
            >
              {value.toLocaleString('id-ID')}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

function JenisBadge({ jenis }: { jenis: string }) {
  const map: Record<string, { label: string; color: string }> = {
    TETAP: { label: 'Tetap', color: '#10B981' },
    KONTRAK: { label: 'Kontrak', color: '#3B82F6' },
    MAGANG: { label: 'Magang', color: '#F59E0B' },
  };
  const cfg = map[jenis] ?? { label: jenis, color: '#6B7280' };
  return (
    <span
      style={{
        background: `${cfg.color}1A`,
        color: cfg.color,
        padding: '2px 10px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        display: 'inline-block',
      }}
    >
      {cfg.label}
    </span>
  );
}

function WelcomeDashboard({ nama, role }: { nama: string; role: string }) {
  const isSuperadmin = role === 'SUPERADMIN';
  const roleLabel = isSuperadmin ? 'Super Administrator' : 'Admin HRD';
  const RoleIcon = isSuperadmin ? FiAward : FiUserCheck;

  return (
    <div
      className='container-fluid d-flex align-items-center justify-content-center'
      style={{ minHeight: '70vh', animation: 'fadeIn 0.6s ease both' }}
    >
      <div className='text-center' style={{ maxWidth: 520 }}>
        <div
          className='d-flex align-items-center justify-content-center mx-auto mb-4'
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            background: '#3B82F61A',
            color: '#3B82F6',
          }}
        >
          <RoleIcon size={36} />
        </div>
        <h1 className='fw-bold mb-2' style={{ fontSize: 32 }}>
          Selamat Datang
        </h1>
        <h2
          className='fw-semibold mb-3'
          style={{ color: '#3B82F6', fontSize: 26 }}
        >
          {nama}
        </h2>
        <span
          style={{
            display: 'inline-block',
            background: '#3B82F61A',
            color: '#3B82F6',
            padding: '6px 20px',
            borderRadius: 30,
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          {roleLabel}
        </span>
        <p className='text-muted mt-4 mb-0' style={{ fontSize: 15 }}>
          Anda masuk sebagai <strong>{roleLabel}</strong>. Gunakan menu navigasi
          untuk mengakses fitur yang tersedia.
        </p>
      </div>
    </div>
  );
}

const AVATAR_COLORS = ['#3B82F6', '#6366F1', '#10B981', '#F59E0B', '#EC4899'];

function ManagerDashboard({
  data,
  namaUser,
}: {
  data: ManagerDashboardData;
  namaUser: string;
}) {
  const {
    widgets,
    chartJenisPegawai,
    chartGender,
    pegawaiTerbaru,
    pegawaiTerdekat,
    domisiliArea,
  } = data;

  const statusChartData = {
    labels: ['Pegawai Tetap', 'Pegawai Kontrak', 'Peserta Magang'],
    datasets: [
      {
        data: [
          chartJenisPegawai.tetap,
          chartJenisPegawai.kontrak,
          chartJenisPegawai.magang,
        ],
        ...STATUS_COLORS,
      },
    ],
  };

  const genderChartData = {
    labels: ['Pria', 'Wanita'],
    datasets: [
      { data: [chartGender.pria, chartGender.wanita], ...GENDER_COLORS },
    ],
  };

  const formatTanggal = (iso: string) =>
    new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const grouped = domisiliArea.reduce(
    (acc, p) => {
      const key = p.kabupaten ?? 'Tidak diketahui';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const domisiliSorted = Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const domisiliTotal = domisiliArea.length;

  const charts = [
    { title: 'Status Pegawai', chartData: statusChartData },
    { title: 'Gender Pegawai', chartData: genderChartData },
  ] as const;

  return (
    <div className='container-fluid d-flex flex-column gap-4'>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .db-hover-row:hover td { background: #f8fafc; }
      `}</style>

      <div
        className='card border-0 rounded-4 overflow-hidden'
        style={{
          background: 'linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)',
          animation: 'fadeIn 0.4s ease both',
        }}
      >
        <div className='card-body p-4 d-flex align-items-center justify-content-between flex-wrap gap-3'>
          <div>
            <p className='mb-1 text-white-50' style={{ fontSize: 13 }}>
              Dashboard Manager HRD
            </p>
            <h3 className='fw-bold text-white mb-0'>
              Selamat Datang, {namaUser}
            </h3>
          </div>
          <div
            className='d-flex align-items-center gap-2 text-white-50'
            style={{ fontSize: 13 }}
          >
            <FiCalendar size={14} />
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
        </div>
      </div>
      <div className='row g-4'>
        <WidgetCard
          label='Total Pegawai'
          value={widgets.totalPegawai}
          icon={<FiUsers size={22} />}
          color='#3B82F6'
          delay={0}
        />
        <WidgetCard
          label='Pegawai Kontrak'
          value={widgets.totalPegawaiKontrak}
          icon={<FiFileText size={22} />}
          color='#6366F1'
          delay={80}
        />
        <WidgetCard
          label='Pegawai Tetap'
          value={widgets.totalPegawaiTetap}
          icon={<FiAward size={22} />}
          color='#10B981'
          delay={160}
        />
        <WidgetCard
          label='Peserta Magang'
          value={widgets.totalMagang}
          icon={<FiBriefcase size={22} />}
          color='#F59E0B'
          delay={240}
        />
      </div>
      <div className='row g-4'>
        {charts.map(({ title, chartData }, i) => (
          <div
            key={title}
            className='col-12 col-xl-6'
            style={{
              animation: `fadeIn 0.5s ease both`,
              animationDelay: `${320 + i * 80}ms`,
            }}
          >
            <div className='card border-0 shadow-sm rounded-4 h-100'>
              <div className='card-body p-4'>
                <h6 className='fw-semibold mb-4' style={{ fontSize: 15 }}>
                  {title}
                </h6>
                <div style={{ maxWidth: 320, margin: '0 auto' }}>
                  <Doughnut data={chartData} options={DOUGHNUT_OPTIONS} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className='row g-4'>
        <div
          className='col-12 col-xl-7'
          style={{
            animation: 'fadeIn 0.5s ease both',
            animationDelay: '480ms',
          }}
        >
          <div className='card border-0 shadow-sm rounded-4 h-100'>
            <div className='card-body p-4'>
              <div className='d-flex justify-content-between align-items-center mb-4'>
                <h6
                  className='fw-semibold mb-0 d-flex align-items-center gap-2'
                  style={{ fontSize: 15 }}
                >
                  <FiUserCheck size={16} color='#3B82F6' />
                  Pegawai Terbaru
                </h6>
                <span
                  style={{
                    background: '#3B82F61A',
                    color: '#3B82F6',
                    padding: '3px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {pegawaiTerbaru.length} terakhir
                </span>
              </div>
              <div className='table-responsive'>
                <table
                  className='table align-middle mb-0'
                  style={{ fontSize: 14 }}
                >
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                      {(['Pegawai', 'Status', 'Tanggal Masuk'] as const).map(
                        (h) => (
                          <th
                            key={h}
                            className='text-muted fw-semibold pb-3'
                            style={{
                              fontSize: 11,
                              textTransform: 'uppercase',
                              letterSpacing: '0.06em',
                            }}
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {pegawaiTerbaru.map((p, idx) => (
                      <tr
                        key={p.id}
                        className='db-hover-row'
                        style={{
                          borderBottom:
                            idx < pegawaiTerbaru.length - 1
                              ? '1px solid #f8fafc'
                              : 'none',
                        }}
                      >
                        <td className='py-3'>
                          <div className='d-flex align-items-center gap-3'>
                            <div
                              className='d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0'
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 10,
                                background:
                                  AVATAR_COLORS[idx % AVATAR_COLORS.length],
                                fontSize: 13,
                              }}
                            >
                              {p.nama.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div
                                className='fw-semibold'
                                style={{ fontSize: 14 }}
                              >
                                {p.nama}
                              </div>
                              <div
                                className='text-muted'
                                style={{ fontSize: 12 }}
                              >
                                {p.jabatan}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <JenisBadge jenis={p.jenisPegawai} />
                        </td>
                        <td className='text-muted' style={{ fontSize: 13 }}>
                          <span className='d-flex align-items-center gap-1'>
                            <FiCalendar size={11} />
                            {formatTanggal(p.tanggalMasuk)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div
          className='col-12 col-xl-5 d-flex flex-column gap-4'
          style={{
            animation: 'fadeIn 0.5s ease both',
            animationDelay: '560ms',
          }}
        >
          <div className='card border-0 shadow-sm rounded-4'>
            <div className='card-body p-4'>
              <h6
                className='fw-semibold mb-3 d-flex align-items-center gap-2'
                style={{ fontSize: 15 }}
              >
                <FiMapPin size={16} color='#3B82F6' />
                Pegawai Terdekat dengan Kantor
              </h6>
              {pegawaiTerdekat ? (
                <div className='d-flex flex-column gap-3'>
                  <div className='d-flex align-items-center gap-3'>
                    <div
                      className='d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0'
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: '#3B82F6',
                        fontSize: 16,
                      }}
                    >
                      {pegawaiTerdekat.nama.charAt(0)}
                    </div>
                    <div>
                      <div className='fw-semibold' style={{ fontSize: 14 }}>
                        {pegawaiTerdekat.nama}
                      </div>
                      <div className='text-muted' style={{ fontSize: 12 }}>
                        {pegawaiTerdekat.jabatan}
                      </div>
                    </div>
                  </div>
                  <div
                    className='d-flex align-items-center gap-2 p-3 rounded-3'
                    style={{ background: '#f8fafc' }}
                  >
                    <FiTruck size={18} color='#10B981' />
                    <span
                      className='fw-bold'
                      style={{ color: '#10B981', fontSize: 16 }}
                    >
                      {pegawaiTerdekat.jarakKm.toFixed(1)} km
                    </span>
                    <span className='text-muted' style={{ fontSize: 12 }}>
                      dari kantor
                    </span>
                  </div>
                  {pegawaiTerdekat.alamatDetail && (
                    <p
                      className='text-muted mb-0 d-flex align-items-start gap-1'
                      style={{ fontSize: 12 }}
                    >
                      <FiHome
                        size={12}
                        style={{ marginTop: 2, flexShrink: 0 }}
                      />
                      {pegawaiTerdekat.alamatDetail}
                    </p>
                  )}
                </div>
              ) : (
                <p className='text-muted mb-0' style={{ fontSize: 14 }}>
                  Data koordinat pegawai belum tersedia.
                </p>
              )}
            </div>
          </div>
          <div className='card border-0 shadow-sm rounded-4 flex-grow-1'>
            <div className='card-body p-4'>
              <div className='d-flex justify-content-between align-items-center mb-3'>
                <h6
                  className='fw-semibold mb-0 d-flex align-items-center gap-2'
                  style={{ fontSize: 15 }}
                >
                  <FiMapPin size={16} color='#10B981' />
                  Area Domisili Pegawai
                </h6>
                <span
                  style={{
                    background: '#10B9811A',
                    color: '#10B981',
                    padding: '3px 12px',
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {domisiliArea.filter((d) => d.latitude && d.longitude).length}{' '}
                  titik
                </span>
              </div>
              {domisiliSorted.length > 0 ? (
                <div className='d-flex flex-column gap-2'>
                  {domisiliSorted.map(([kab, count]) => (
                    <div key={kab}>
                      <div
                        className='d-flex justify-content-between mb-1'
                        style={{ fontSize: 13 }}
                      >
                        <span className='fw-medium'>{kab}</span>
                        <span className='text-muted'>{count} orang</span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          background: '#f1f5f9',
                          borderRadius: 3,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${domisiliTotal > 0 ? (count / domisiliTotal) * 100 : 0}%`,
                            background:
                              'linear-gradient(90deg, #3B82F6, #6366F1)',
                            borderRadius: 3,
                            transition: 'width 1s ease',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className='d-flex align-items-center justify-content-center text-muted rounded-3'
                  style={{ height: 120, background: '#f8fafc', fontSize: 14 }}
                >
                  Data domisili belum tersedia
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      className='container-fluid d-flex align-items-center justify-content-center'
      style={{ minHeight: '60vh' }}
    >
      <div className='text-center'>
        <div
          className='d-flex align-items-center justify-content-center mx-auto mb-3'
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background: '#FEF2F2',
            color: '#EF4444',
          }}
        >
          <FiAlertTriangle size={28} />
        </div>
        <h5 className='fw-semibold mb-2'>Gagal Memuat Dashboard</h5>
        <p className='text-muted mb-4'>{message}</p>
        <button
          className='btn btn-primary rounded-3 px-4 d-inline-flex align-items-center gap-2'
          onClick={onRetry}
        >
          <FiRefreshCw size={15} />
          Coba Lagi
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [isHydrated, setIsHydrated] = useState(false);
  const [dashboardData, setDashboardData] =
    useState<ManagerDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, []);

  const role = user?.role;
  const namaUser = user?.pegawai?.nama ?? user?.username ?? '-';

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await Request.GET('/dashboard');
      if (res.success) {
        if (role === 'MANAGER_HRD') {
          setDashboardData(res.data as ManagerDashboardData);
        }
      } else {
        const msg = (res.message as string) || 'Gagal memuat data dashboard';
        setError(msg);
        toast.error(msg);
      }
    } catch {
      const msg = 'Gagal terhubung ke server';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isHydrated || !role) return;
    if (hasFetched.current) return;
    hasFetched.current = true;
    void fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, role]);

  if (!isHydrated || loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboard} />;
  }

  if (role === 'SUPERADMIN' || role === 'ADMIN_HRD') {
    return <WelcomeDashboard nama={namaUser} role={role} />;
  }

  if (role === 'MANAGER_HRD') {
    if (!dashboardData) return <DashboardSkeleton />;
    return <ManagerDashboard data={dashboardData} namaUser={namaUser} />;
  }

  return (
    <div
      className='container-fluid d-flex align-items-center justify-content-center'
      style={{ minHeight: '60vh' }}
    >
      <div className='text-center'>
        <div
          className='d-flex align-items-center justify-content-center mx-auto mb-3'
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background: '#F1F5F9',
            color: '#64748B',
          }}
        >
          <FiLock size={28} />
        </div>
        <h5 className='fw-semibold mb-2'>Akses Tidak Diizinkan</h5>
        <p className='text-muted mb-0'>
          Role Anda tidak memiliki akses ke halaman ini.
        </p>
      </div>
    </div>
  );
}
