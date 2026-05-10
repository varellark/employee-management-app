'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiCalendar, FiDownload, FiMapPin, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Card from '@/components/ui/card';
import Request from '@/utils/request';
import { dateFormat } from '@/utils/date';
import { formatRupiah } from '@/utils/format';

type DetailTunjangan = {
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

export default function DetailTunjanganPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DetailTunjangan | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const response = await Request.GET(`/tunjangan/${id}`);
        if (response.success) {
          setData(response.data);
        } else {
          toast.error(response.message || 'Gagal memuat detail tunjangan');
          router.push('/tunjangan');
        }
      } catch {
        toast.error('Gagal terhubung ke server');
        router.push('/tunjangan');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetail();
    }
  }, [id, router]);

  const handleExport = async () => {
    try {
      toast.info('Fitur export PDF dalam pengembangan.');
    } catch {
      toast.error('Gagal export data');
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

  if (!data) {
    return null;
  }

  return (
    <Card className='w-100 bg-white border shadow-sm rounded-4 p-4'>
      <div className='d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3 mb-4'>
        <div className='d-flex align-items-center gap-2 mb-2'>
          <div>
            <h4 className='fw-bold mb-1'>Detail Tunjangan Transport</h4>
            <p className='text-secondary mb-0 small'>
              Informasi lengkap data tunjangan pegawai.
            </p>
          </div>
        </div>
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
          Export PDF
        </button>
      </div>
      <div className='row g-4'>
        <div className='col-12 col-xl-4'>
          <div className='border rounded-4 p-4 h-100 bg-light-subtle'>
            <div className='d-flex align-items-center gap-3 mb-4'>
              <div
                className='d-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary'
                style={{
                  width: 60,
                  height: 60,
                }}
              >
                <FiUser size={26} />
              </div>
              <div>
                <h5 className='fw-bold mb-1'>{data.pegawai.nama}</h5>
                <div className='text-secondary small'>{data.pegawai.nip}</div>
              </div>
            </div>
            <div className='d-flex flex-column gap-3'>
              <div>
                <div className='small text-secondary mb-1'>Departemen</div>
                <div className='fw-semibold'>
                  {data.pegawai.departemen || '-'}
                </div>
              </div>
              <div>
                <div className='small text-secondary mb-1'>Jabatan</div>
                <div className='fw-semibold'>{data.pegawai.jabatan || '-'}</div>
              </div>
              <div>
                <div className='small text-secondary mb-1'>Tanggal Dibuat</div>
                <div className='fw-semibold'>
                  {dateFormat(data.createDate, 'DD MMMM YYYY')}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='col-12 col-xl-8'>
          <div className='border rounded-4 p-4 h-100'>
            <div className='d-flex align-items-center gap-2 mb-4'>
              <FiCalendar className='text-primary' size={20} />
              <h5 className='fw-bold mb-0'>Informasi Tunjangan</h5>
            </div>
            <div className='row g-4'>
              <div className='col-md-6'>
                <div className='border rounded-4 p-3 h-100'>
                  <div className='small text-secondary mb-1'>Periode</div>
                  <div className='fw-bold fs-5'>{data.periode}</div>
                </div>
              </div>
              <div className='col-md-6'>
                <div className='border rounded-4 p-3 h-100'>
                  <div className='small text-secondary mb-1'>
                    Jumlah Hari Masuk
                  </div>
                  <div className='fw-bold fs-5'>
                    {data.jumlahHariMasuk} Hari
                  </div>
                </div>
              </div>
              <div className='col-md-6'>
                <div className='border rounded-4 p-3 h-100'>
                  <div className='d-flex align-items-center gap-2 mb-1'>
                    <FiMapPin size={14} className='text-danger' />
                    <div className='small text-secondary'>Jarak Tempuh</div>
                  </div>
                  <div className='fw-bold fs-5'>{data.jarakKm} KM</div>
                </div>
              </div>
              <div className='col-md-6'>
                <div className='border rounded-4 p-3 h-100'>
                  <div className='small text-secondary mb-1'>Base Fare</div>
                  <div className='fw-bold fs-5 text-primary'>
                    {formatRupiah(Number(data.baseFare))}
                  </div>
                </div>
              </div>
              <div className='col-12'>
                <div
                  className='rounded-4 p-4 text-white'
                  style={{
                    background:
                      'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  }}
                >
                  <div className='small opacity-75 mb-2'>Total Tunjangan</div>
                  <div
                    className='fw-bold'
                    style={{
                      fontSize: '2rem',
                    }}
                  >
                    {formatRupiah(Number(data.totalTunjangan))}
                  </div>
                </div>
              </div>
              <div className='col-12'>
                <div className='border rounded-4 p-3'>
                  <div className='small text-secondary mb-2'>Keterangan</div>
                  <div className='text-dark'>{data.keterangan || '-'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='d-flex justify-content-end mt-4'>
        <button
          type='button'
          onClick={() => router.push('/tunjangan')}
          className='btn btn-outline-secondary rounded-4 px-4 py-2 fw-medium'
          disabled={loading}
        >
          Kembali
        </button>
      </div>
    </Card>
  );
}
