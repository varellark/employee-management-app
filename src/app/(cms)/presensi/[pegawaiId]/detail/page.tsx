'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiInfo,
  FiMapPin,
  FiMinus,
  FiUser,
  FiXCircle,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import Card from '@/components/ui/card';
import Request from '@/utils/request';
import { dateFormat } from '@/utils/date';

type PresensiDetail = {
  id: number;
  tanggal: string;
  lokasiCheckin: string | null;
  lokasiCheckout: string | null;
  waktuCheckin: string | null;
  waktuCheckout: string | null;
  durasi: number | null;
  statusKehadiran: string;
  statusTerpenuhi: boolean;
  isHalfday: boolean;
  statusVerifikasi: string;
  verifikator: string | null;
  keterangan: string | null;
  pegawai: {
    id: number;
    nip: string;
    nama: string;
    jabatan: string | null;
    departemen: string | null;
  };
};

const JABATAN_LABEL: Record<string, string> = {
  MANAGER: 'Manager',
  STAF: 'Staf',
  MAGANG: 'Magang',
  KARYAWAN: 'Karyawan',
};

const DEPARTEMEN_LABEL: Record<string, string> = {
  MARKETING: 'Marketing',
  HRD: 'HRD',
  PRODUCTION: 'Production',
  EXECUTIVE: 'Executive',
  COMMISSIONER: 'Commissioner',
};

const LOKASI_LABEL: Record<string, string> = {
  GEDUNG_UTAMA: 'Gedung Utama',
  GEDUNG_A: 'Gedung A',
  GEDUNG_B: 'Gedung B',
};

const STATUS_KEHADIRAN_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  HADIR: {
    label: 'Hadir',
    color: '#16a34a',
    bg: '#dcfce7',
    icon: <FiCheckCircle size={12} />,
  },
  CUTI: {
    label: 'Cuti',
    color: '#0284c7',
    bg: '#e0f2fe',
    icon: <FiCalendar size={12} />,
  },
  IZIN: {
    label: 'Izin',
    color: '#7c3aed',
    bg: '#ede9fe',
    icon: <FiAlertCircle size={12} />,
  },
  UNPAID_LEAVE: {
    label: 'Unpaid Leave',
    color: '#b45309',
    bg: '#fef3c7',
    icon: <FiMinus size={12} />,
  },
  ALPHA: {
    label: 'Alpha',
    color: '#dc2626',
    bg: '#fee2e2',
    icon: <FiXCircle size={12} />,
  },
};

const VERIFIKASI_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  PENDING: { label: 'Pending', color: '#b45309', bg: '#fef3c7' },
  DISETUJUI: { label: 'Disetujui', color: '#16a34a', bg: '#dcfce7' },
  DITOLAK: { label: 'Ditolak', color: '#dc2626', bg: '#fee2e2' },
};

const VERIFIKATOR_LABEL: Record<string, string> = {
  LEAD: 'Lead',
  MANAGER: 'Manager',
  HRD: 'HRD',
};

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

function formatDurasi(minutes: number | null): string {
  if (minutes == null) return '-';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}j ${m}m` : `${m}m`;
}

function formatWaktu(iso: string | null): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_KEHADIRAN_CONFIG[status];
  if (!cfg) return <span className='text-secondary small'>-</span>;
  return (
    <span
      className='d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill fw-semibold'
      style={{
        background: cfg.bg,
        color: cfg.color,
        fontSize: 11,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function VerifikasiBadge({ status }: { status: string }) {
  const cfg = VERIFIKASI_CONFIG[status] ?? {
    label: status,
    color: '#64748b',
    bg: '#f1f5f9',
  };
  return (
    <span
      className='d-inline-flex align-items-center px-2 py-1 rounded-pill fw-semibold'
      style={{
        background: cfg.bg,
        color: cfg.color,
        fontSize: 11,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  );
}

function TerpenuhiBadge({
  terpenuhi,
  kehadiran,
  halfday,
}: {
  terpenuhi: boolean;
  kehadiran: string;
  halfday: boolean;
}) {
  if (kehadiran !== 'HADIR')
    return <span className='text-secondary small'>-</span>;
  if (halfday)
    return (
      <span
        className='d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill fw-semibold'
        style={{ background: '#fef3c7', color: '#b45309', fontSize: 11 }}
      >
        Halfday
      </span>
    );
  if (terpenuhi)
    return (
      <span
        className='d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill fw-semibold'
        style={{ background: '#dcfce7', color: '#16a34a', fontSize: 11 }}
      >
        <FiCheckCircle size={11} /> Terpenuhi
      </span>
    );
  return (
    <span
      className='d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill fw-semibold'
      style={{ background: '#fee2e2', color: '#dc2626', fontSize: 11 }}
    >
      <FiXCircle size={11} /> Tdk Terpenuhi
    </span>
  );
}

export default function DetailPresensiPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const pegawaiId = params?.pegawaiId as string;
  const month = searchParams.get('month') ?? '';
  const year = searchParams.get('year') ?? '';
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<PresensiDetail[]>([]);
  const [pegawai, setPegawai] = useState<PresensiDetail['pegawai'] | null>(
    null
  );

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        if (month) query.append('month', month);
        if (year) query.append('year', year);

        const res = await Request.GET(
          `/presensi/${pegawaiId}/detail?${query.toString()}`
        );
        if (res.success) {
          const data: PresensiDetail[] = res.data;
          setList(data);
          if (data.length > 0) setPegawai(data[0].pegawai);
        } else {
          toast.error(res.message || 'Gagal memuat detail presensi');
          router.push('/presensi');
        }
      } catch {
        toast.error('Gagal terhubung ke server');
        router.push('/presensi');
      } finally {
        setLoading(false);
      }
    };

    if (pegawaiId) fetchDetail();
  }, [pegawaiId, month, year, router]);

  if (loading) {
    return (
      <Card className='w-100 bg-white border shadow-sm rounded-4 p-4'>
        <div className='d-flex justify-content-center align-items-center py-5'>
          <div className='spinner-border text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
        </div>
      </Card>
    );
  }

  const hadir = list.filter((x) => x.statusKehadiran === 'HADIR').length;
  const cuti = list.filter((x) => x.statusKehadiran === 'CUTI').length;
  const izin = list.filter((x) => x.statusKehadiran === 'IZIN').length;
  const unpaid = list.filter(
    (x) => x.statusKehadiran === 'UNPAID_LEAVE'
  ).length;
  const alpha = list.filter((x) => x.statusKehadiran === 'ALPHA').length;
  const terpenuhi = list.filter(
    (x) => x.statusKehadiran === 'HADIR' && x.statusTerpenuhi
  ).length;

  const periodeLabel = month
    ? `${MONTH_NAMES[Number(month) - 1]} ${year}`
    : '-';

  return (
    <Card className='w-100 bg-white border shadow-sm rounded-4 p-4'>
      <div className='d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 mb-4'>
        <div>
          <h4 className='fw-bold mb-1'>Detail Presensi</h4>
          <p className='text-secondary mb-0 small'>
            Rekap presensi periode{' '}
            <span className='fw-semibold text-dark'>{periodeLabel}</span>.
          </p>
        </div>
      </div>
      <div className='row g-4'>
        <div className='col-12 col-xl-4'>
          <div className='d-flex flex-column gap-4'>
            <div className='border rounded-4 p-4 bg-light-subtle'>
              <div className='d-flex align-items-center gap-3 mb-4'>
                <div
                  className='d-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary flex-shrink-0'
                  style={{ width: 60, height: 60 }}
                >
                  <FiUser size={26} />
                </div>
                <div>
                  <h5 className='fw-bold mb-1'>{pegawai?.nama ?? '-'}</h5>
                  <div className='text-secondary small'>
                    {pegawai?.nip ?? '-'}
                  </div>
                </div>
              </div>
              <div className='d-flex flex-column gap-3'>
                <div>
                  <div className='small text-secondary mb-1'>Departemen</div>
                  <div className='fw-semibold'>
                    {DEPARTEMEN_LABEL[pegawai?.departemen ?? ''] ??
                      pegawai?.departemen ??
                      '-'}
                  </div>
                </div>
                <div>
                  <div className='small text-secondary mb-1'>Jabatan</div>
                  <div className='fw-semibold'>
                    {JABATAN_LABEL[pegawai?.jabatan ?? ''] ??
                      pegawai?.jabatan ??
                      '-'}
                  </div>
                </div>
              </div>
              <hr className='my-4' />
              <div className='d-flex flex-column gap-2'>
                <div
                  className='small fw-semibold text-uppercase text-secondary mb-1'
                  style={{ letterSpacing: 1 }}
                >
                  Ringkasan Periode
                </div>
                {[
                  { label: 'Hadir', value: hadir, color: '#16a34a' },
                  {
                    label: 'Hadir Terpenuhi',
                    value: terpenuhi,
                    color: '#059669',
                  },
                  { label: 'Cuti', value: cuti, color: '#0284c7' },
                  { label: 'Izin', value: izin, color: '#7c3aed' },
                  { label: 'Unpaid Leave', value: unpaid, color: '#b45309' },
                  { label: 'Alpha', value: alpha, color: '#dc2626' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className='d-flex justify-content-between align-items-center'
                  >
                    <span className='small text-secondary'>{s.label}</span>
                    <span
                      className='fw-bold'
                      style={{
                        color: s.color,
                        minWidth: 28,
                        textAlign: 'right',
                      }}
                    >
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className='border rounded-4 p-4'>
              <div className='d-flex align-items-center gap-2 mb-3'>
                <FiInfo className='text-primary flex-shrink-0' size={18} />
                <h6 className='fw-bold mb-0'>Aturan Presensi</h6>
              </div>
              <div className='d-flex flex-column gap-3'>
                <div>
                  <div
                    className='small fw-semibold text-uppercase text-secondary mb-2'
                    style={{ letterSpacing: 1, fontSize: 10 }}
                  >
                    Gedung
                  </div>
                  <div className='d-flex flex-column gap-1'>
                    {['Gedung Utama', 'Gedung A', 'Gedung B'].map((g) => (
                      <div
                        key={g}
                        className='d-flex align-items-center gap-2 small'
                      >
                        <FiMapPin
                          size={12}
                          className='text-secondary flex-shrink-0'
                        />
                        <span>{g}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div
                    className='small fw-semibold text-uppercase text-secondary mb-2'
                    style={{ letterSpacing: 1, fontSize: 10 }}
                  >
                    Jam Kerja
                  </div>
                  <div className='d-flex flex-column gap-1 small'>
                    <div className='d-flex justify-content-between'>
                      <span className='text-secondary'>Kerja</span>
                      <span className='fw-semibold'>08.00 – 17.00</span>
                    </div>
                    <div className='d-flex justify-content-between'>
                      <span className='text-secondary'>Istirahat</span>
                      <span className='fw-semibold'>12.00 – 13.00</span>
                    </div>
                    <div className='d-flex justify-content-between'>
                      <span className='text-secondary'>Minimal kerja</span>
                      <span className='fw-semibold'>8 jam</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div
                    className='small fw-semibold text-uppercase text-secondary mb-2'
                    style={{ letterSpacing: 1, fontSize: 10 }}
                  >
                    Keterlambatan
                  </div>
                  <div className='d-flex flex-column gap-1 small'>
                    <div className='d-flex align-items-start gap-2'>
                      <span
                        className='rounded-pill px-2 fw-semibold flex-shrink-0'
                        style={{
                          background: '#dcfce7',
                          color: '#16a34a',
                          fontSize: 11,
                        }}
                      >
                        ≤ 15 menit
                      </span>
                      <span className='text-secondary'>Dihitung masuk</span>
                    </div>
                    <div className='d-flex align-items-start gap-2'>
                      <span
                        className='rounded-pill px-2 fw-semibold flex-shrink-0'
                        style={{
                          background: '#fef3c7',
                          color: '#b45309',
                          fontSize: 11,
                        }}
                      >
                        &gt; 15 menit
                      </span>
                      <span className='text-secondary'>
                        Halfday (durasi tetap min. 8 jam)
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className='rounded-3 p-3 small'
                  style={{ background: '#f1f5f9' }}
                >
                  <div className='fw-semibold mb-1'>Catatan</div>
                  <div className='text-secondary' style={{ lineHeight: 1.6 }}>
                    Checkin dan checkout harus di{' '}
                    <strong>lokasi yang sama</strong>. Beda lokasi tidak
                    dihitung masuk. Kurang dari 8 jam kerja →{' '}
                    <strong>Tidak terpenuhi</strong>.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-12 col-xl-8'>
          <div className='border rounded-4 p-4'>
            <div className='d-flex align-items-center gap-2 mb-4'>
              <FiCalendar className='text-primary' size={20} />
              <h5 className='fw-bold mb-0'>Rincian Kehadiran</h5>
            </div>
            {list.length === 0 ? (
              <p className='text-secondary small mb-0'>
                Tidak ada data presensi pada periode ini.
              </p>
            ) : (
              <div className='table-responsive'>
                <table
                  className='table table-hover align-middle mb-0'
                  style={{ fontSize: 13 }}
                >
                  <thead>
                    <tr className='table-light'>
                      <th
                        className='rounded-start fw-semibold text-secondary'
                        style={{ fontSize: 11, letterSpacing: 0.5 }}
                      >
                        TANGGAL
                      </th>
                      <th
                        className='fw-semibold text-secondary'
                        style={{ fontSize: 11, letterSpacing: 0.5 }}
                      >
                        LOKASI
                      </th>
                      <th
                        className='fw-semibold text-secondary'
                        style={{ fontSize: 11, letterSpacing: 0.5 }}
                      >
                        KEHADIRAN
                      </th>
                      <th
                        className='fw-semibold text-secondary'
                        style={{ fontSize: 11, letterSpacing: 0.5 }}
                      >
                        DURASI
                      </th>
                      <th
                        className='fw-semibold text-secondary'
                        style={{ fontSize: 11, letterSpacing: 0.5 }}
                      >
                        STATUS
                      </th>
                      <th
                        className='fw-semibold text-secondary'
                        style={{ fontSize: 11, letterSpacing: 0.5 }}
                      >
                        VERIFIKASI
                      </th>
                      <th
                        className='rounded-end fw-semibold text-secondary'
                        style={{ fontSize: 11, letterSpacing: 0.5 }}
                      >
                        VERIFIKATOR
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div
                            className='fw-semibold'
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            {dateFormat(item.tanggal, 'DD MMM YYYY')}
                          </div>
                          <div
                            className='text-secondary'
                            style={{ fontSize: 11 }}
                          >
                            {dateFormat(item.tanggal, 'dddd')}
                          </div>
                          {item.waktuCheckin && (
                            <div
                              className='text-secondary'
                              style={{ fontSize: 11 }}
                            >
                              {formatWaktu(item.waktuCheckin)}
                              {item.waktuCheckout
                                ? ` – ${formatWaktu(item.waktuCheckout)}`
                                : ''}
                            </div>
                          )}
                        </td>
                        <td>
                          {item.lokasiCheckin ? (
                            <div className='d-flex align-items-center gap-1'>
                              <FiMapPin
                                size={12}
                                className='text-secondary flex-shrink-0'
                              />
                              <span>
                                {LOKASI_LABEL[item.lokasiCheckin] ??
                                  item.lokasiCheckin}
                              </span>
                            </div>
                          ) : (
                            <span className='text-secondary'>-</span>
                          )}
                          {item.lokasiCheckin &&
                            item.lokasiCheckout &&
                            item.lokasiCheckin !== item.lokasiCheckout && (
                              <div
                                className='d-flex align-items-center gap-1 mt-1'
                                style={{ color: '#dc2626', fontSize: 11 }}
                              >
                                <FiAlertCircle size={11} />
                                Beda lokasi checkout
                              </div>
                            )}
                        </td>
                        <td>
                          <StatusBadge status={item.statusKehadiran} />
                          {item.keterangan && (
                            <div
                              className='text-secondary mt-1'
                              style={{ fontSize: 11 }}
                            >
                              {item.keterangan}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className='fw-semibold'>
                            {formatDurasi(item.durasi)}
                          </span>
                        </td>
                        <td>
                          <TerpenuhiBadge
                            terpenuhi={item.statusTerpenuhi}
                            kehadiran={item.statusKehadiran}
                            halfday={item.isHalfday}
                          />
                        </td>
                        <td>
                          <VerifikasiBadge status={item.statusVerifikasi} />
                        </td>
                        <td>
                          <span className='text-secondary small'>
                            {VERIFIKATOR_LABEL[item.verifikator ?? ''] ??
                              item.verifikator ??
                              '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className='d-flex justify-content-end mt-4'>
        <button
          type='button'
          onClick={() => router.push('/presensi')}
          className='btn btn-outline-secondary rounded-4 px-4 py-2 fw-medium'
        >
          Kembali
        </button>
      </div>
    </Card>
  );
}
