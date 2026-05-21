'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  FiBriefcase,
  FiCalendar,
  FiDownload,
  FiEdit2,
  FiMapPin,
  FiPhone,
  FiMail,
  FiUser,
  FiBookOpen,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import Card from '@/components/ui/card';
import Request from '@/utils/request';
import { dateFormat } from '@/utils/date';
import { UserLogin } from '@/types/auth';
import useAuthStore from '@/store/authStore';
import { Role } from '@prisma/client';

type PendidikanItem = {
  jenjang: string;
  institusi: string;
  jurusan: string;
  tahunLulus: string;
};

type DetailPegawai = {
  id: number;
  nip: string;
  nama: string;
  email: string;
  nomorHp: string;
  foto?: string | null;
  alamatDetail?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  tanggalLahir: string;
  gender: string;
  statusKawin: string;
  jumlahAnak: number;
  tanggalMasuk: string;
  jabatan: string;
  departemen: string;
  jenisPegawai: string;
  statusAktif: string;
  pendidikan?: PendidikanItem[] | null;
  createDate: string;
  updateDate: string;
  provinsi?: { id: number; nama: string } | null;
  kabupaten?: { id: number; nama: string } | null;
  kecamatan?: { id: number; nama: string } | null;
  kalurahan?: { id: number; nama: string } | null;
  tempatLahirKabupaten?: { id: number; nama: string } | null;
};

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>
      <div className='small text-secondary mb-1'>{label}</div>
      <div className='fw-semibold'>{value ?? '-'}</div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={`border rounded-4 p-3 h-100${accent ? ' border-primary' : ''}`}
    >
      <div className='small text-secondary mb-1'>{label}</div>
      <div className={`fw-bold fs-5${accent ? ' text-primary' : ''}`}>
        {value}
      </div>
    </div>
  );
}

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

const JENIS_PEGAWAI_LABEL: Record<string, string> = {
  TETAP: 'Tetap',
  KONTRAK: 'Kontrak',
  MAGANG: 'Magang',
};

function hitungUsia(tanggalLahir: string): string {
  const date = new Date(tanggalLahir);
  if (isNaN(date.getTime())) return '-';
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const m = now.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < date.getDate())) age--;
  return age > 0 ? `${age} tahun` : '-';
}

function buildAlamat(data: DetailPegawai): string {
  const parts = [
    data.kalurahan?.nama,
    data.kecamatan?.nama,
    data.kabupaten?.nama,
    data.provinsi?.nama,
  ].filter(Boolean);
  if (data.alamatDetail) parts.unshift(data.alamatDetail);
  return parts.length > 0 ? parts.join(', ') : '-';
}

export default function DetailPegawaiPage() {
  const user: UserLogin | null = useAuthStore((state) => state.user);
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DetailPegawai | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await Request.GET(`/pegawai/${id}`);
        if (response.success) {
          setData(response.data);
        } else {
          toast.error(response.message || 'Gagal memuat detail pegawai');
          router.push('/pegawai');
        }
      } catch {
        toast.error('Gagal terhubung ke server');
        router.push('/pegawai');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id, router]);

  const handleExport = async (id: number) => {
    try {
      setLoading(true);
      toast.info('Sedang menyiapkan PDF...');
      const token = useAuthStore.getState().token;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FETCH_URL}/pegawai/${id}/export`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        toast.error(err?.message || 'Gagal export PDF');
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const filename = `pegawai-${id}-${timestamp}.pdf`;

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success('PDF berhasil diunduh!');
    } catch {
      toast.error('Gagal export data');
    } finally {
      setLoading(false);
    }
  };

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

  if (!data) return null;

  const pendidikan = Array.isArray(data.pendidikan)
    ? data.pendidikan.filter((p) => p.jenjang)
    : [];

  return (
    <Card className='w-100 bg-white border shadow-sm rounded-4 p-4'>
      <div className='d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 mb-4'>
        <div>
          <h4 className='fw-bold mb-1'>Detail Pegawai</h4>
          <p className='text-secondary mb-0 small'>
            Informasi lengkap data pegawai.
          </p>
        </div>
        <div className='d-flex gap-2 flex-wrap'>
          {user?.role === Role.ADMIN_HRD && (
            <button
              type='button'
              onClick={() => router.push(`/pegawai/edit/${id}`)}
              className='btn text-white fw-semibold d-inline-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded-4 shadow-sm'
              style={{
                background: 'linear-gradient(135deg, #0d2a94 0%, #1e40af 100%)',
                border: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <FiEdit2 size={15} />
              Edit
            </button>
          )}
          <button
            type='button'
            onClick={() => handleExport(data.id)}
            className='btn fw-semibold d-inline-flex align-items-center justify-content-center gap-2 px-4 py-2 rounded-4 shadow-sm'
            style={{
              background: 'linear-gradient(135deg, #475569 0%, #64748b 100%)',
              border: 'none',
              color: '#fff',
              transition: 'all 0.2s ease',
            }}
          >
            <FiDownload size={15} />
            Export PDF
          </button>
        </div>
      </div>
      <div className='row g-4'>
        <div className='col-12 col-xl-4'>
          <div className='border rounded-4 p-4 h-100 bg-light-subtle'>
            <div className='d-flex align-items-center gap-3 mb-4'>
              <div
                className='rounded-circle overflow-hidden border bg-light d-flex align-items-center justify-content-center flex-shrink-0'
                style={{ width: 72, height: 72 }}
              >
                {data.foto ? (
                  <Image
                    src={data.foto}
                    alt={data.nama}
                    width={72}
                    height={72}
                    style={{
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%',
                    }}
                  />
                ) : (
                  <FiUser size={30} className='text-secondary' />
                )}
              </div>
              <div>
                <h5 className='fw-bold mb-1'>{data.nama}</h5>
                <div className='text-secondary small'>{data.nip}</div>
                <span
                  className={`badge rounded-pill mt-1 ${
                    data.statusAktif === 'ACTIVE'
                      ? 'bg-success-subtle text-success'
                      : 'bg-danger-subtle text-danger'
                  }`}
                  style={{ fontSize: 11 }}
                >
                  {data.statusAktif === 'ACTIVE' ? 'Aktif' : 'Non-Aktif'}
                </span>
              </div>
            </div>
            <div className='d-flex flex-column gap-3 mb-4'>
              <div className='d-flex align-items-center gap-2'>
                <FiMail size={14} className='text-secondary flex-shrink-0' />
                <span className='small text-break'>{data.email}</span>
              </div>
              <div className='d-flex align-items-center gap-2'>
                <FiPhone size={14} className='text-secondary flex-shrink-0' />
                <span className='small'>{data.nomorHp}</span>
              </div>
            </div>
            <hr className='my-3' />
            <div className='d-flex flex-column gap-3'>
              <InfoRow
                label='Jenis Kelamin'
                value={data.gender === 'PRIA' ? 'Pria' : 'Wanita'}
              />
              <InfoRow
                label='Status Kawin'
                value={data.statusKawin === 'KAWIN' ? 'Kawin' : 'Tidak Kawin'}
              />
              <InfoRow label='Jumlah Anak' value={`${data.jumlahAnak} orang`} />
              <InfoRow
                label='Tanggal Bergabung'
                value={dateFormat(data.tanggalMasuk, 'DD MMMM YYYY')}
              />
              <InfoRow
                label='Data Diperbarui'
                value={dateFormat(data.updateDate, 'DD MMMM YYYY')}
              />
            </div>
          </div>
        </div>
        <div className='col-12 col-xl-8'>
          <div className='d-flex flex-column gap-4'>
            <div className='border rounded-4 p-4'>
              <div className='d-flex align-items-center gap-2 mb-4'>
                <FiBriefcase className='text-primary' size={20} />
                <h5 className='fw-bold mb-0'>Data Pekerjaan</h5>
              </div>
              <div className='row g-3'>
                <div className='col-md-4'>
                  <StatCard
                    label='Jabatan'
                    value={JABATAN_LABEL[data.jabatan] ?? data.jabatan}
                    accent
                  />
                </div>
                <div className='col-md-4'>
                  <StatCard
                    label='Departemen'
                    value={DEPARTEMEN_LABEL[data.departemen] ?? data.departemen}
                  />
                </div>
                <div className='col-md-4'>
                  <StatCard
                    label='Jenis Pegawai'
                    value={
                      JENIS_PEGAWAI_LABEL[data.jenisPegawai] ??
                      data.jenisPegawai
                    }
                  />
                </div>
              </div>
            </div>
            <div className='border rounded-4 p-4'>
              <div className='d-flex align-items-center gap-2 mb-4'>
                <FiCalendar className='text-primary' size={20} />
                <h5 className='fw-bold mb-0'>Data Pribadi</h5>
              </div>
              <div className='row g-4'>
                <div className='col-md-6'>
                  <InfoRow
                    label='Tempat Lahir'
                    value={data.tempatLahirKabupaten?.nama}
                  />
                </div>
                <div className='col-md-6'>
                  <InfoRow
                    label='Tanggal Lahir'
                    value={dateFormat(data.tanggalLahir, 'DD MMMM YYYY')}
                  />
                </div>
                <div className='col-md-6'>
                  <InfoRow label='Usia' value={hitungUsia(data.tanggalLahir)} />
                </div>
              </div>
            </div>
            <div className='border rounded-4 p-4'>
              <div className='d-flex align-items-center gap-2 mb-4'>
                <FiMapPin className='text-primary' size={20} />
                <h5 className='fw-bold mb-0'>Alamat Domisili</h5>
              </div>
              <div className='row g-4'>
                <div className='col-12'>
                  <InfoRow label='Alamat Lengkap' value={buildAlamat(data)} />
                </div>
                {(data.latitude != null || data.longitude != null) && (
                  <>
                    <div className='col-md-6'>
                      <InfoRow
                        label='Latitude'
                        value={
                          data.latitude != null
                            ? String(data.latitude)
                            : undefined
                        }
                      />
                    </div>
                    <div className='col-md-6'>
                      <InfoRow
                        label='Longitude'
                        value={
                          data.longitude != null
                            ? String(data.longitude)
                            : undefined
                        }
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className='border rounded-4 p-4'>
              <div className='d-flex align-items-center gap-2 mb-4'>
                <FiBookOpen className='text-primary' size={20} />
                <h5 className='fw-bold mb-0'>Riwayat Pendidikan</h5>
              </div>
              {pendidikan.length === 0 ? (
                <p className='text-secondary small mb-0'>
                  Belum ada data pendidikan.
                </p>
              ) : (
                <div className='d-flex flex-column gap-3'>
                  {pendidikan.map((p, i) => (
                    <div
                      key={i}
                      className='border rounded-4 p-3 d-flex align-items-start gap-3'
                    >
                      <div
                        className='d-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary fw-bold flex-shrink-0 text-center'
                        style={{
                          width: 48,
                          height: 48,
                          fontSize: p.jenjang?.length > 2 ? 10 : 12,
                          lineHeight: 1.1,
                          padding: 4,
                        }}
                      >
                        <span>{p.jenjang}</span>
                      </div>
                      <div className='flex-grow-1'>
                        <div className='fw-semibold'>{p.institusi || '-'}</div>
                        <div className='small text-secondary'>
                          {p.jurusan || '-'}
                          {p.tahunLulus ? ` · Lulus ${p.tahunLulus}` : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className='d-flex justify-content-end mt-4'>
        <button
          type='button'
          onClick={() => router.push('/pegawai')}
          className='btn btn-outline-secondary rounded-4 px-4 py-2 fw-medium'
        >
          Kembali
        </button>
      </div>
    </Card>
  );
}
