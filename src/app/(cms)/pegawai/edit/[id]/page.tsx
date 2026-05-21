'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { FiUsers, FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Card from '@/components/ui/card';
import Request from '@/utils/request';
import FormHeader from '@/components/ui/formHeader';
import FormActions from '@/components/ui/formActions';

type PendidikanItem = {
  jenjang: string;
  institusi: string;
  jurusan: string;
  tahunLulus: string;
};

type FormValues = {
  nip: string;
  nama: string;
  email: string;
  nomorHp: string;
  provinsiId: string;
  kabupatenId: string;
  kecamatanId: string;
  kalurahanId: string;
  alamatDetail: string;
  latitude: string;
  longitude: string;
  tempatLahirKabupatenId: string;
  tanggalLahir: string;
  gender: string;
  statusKawin: string;
  jumlahAnak: number;
  tanggalMasuk: string;
  jabatan: string;
  departemen: string;
  jenisPegawai: string;
  statusAktif: boolean;
  pendidikan: PendidikanItem[];
};

type Wilayah = { id: number; kode: string; nama: string };

function AutocompleteInput<T extends Wilayah>({
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  options,
  loading,
  error,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onSelect: (item: T) => void;
  options: T[];
  loading?: boolean;
  error?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(options.length > 0);
  }, [options]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <label className='form-label fw-semibold small'>{label}</label>
      <input
        type='text'
        className={`form-control rounded-3${error ? ' is-invalid' : ''}`}
        placeholder={placeholder}
        value={value}
        autoComplete='off'
        onChange={(e) => {
          onChange(e.target.value);
          if (!e.target.value) setOpen(false);
        }}
        onFocus={() => {
          if (options.length > 0) setOpen(true);
        }}
      />
      {error && <div className='invalid-feedback'>{error}</div>}
      {loading && (
        <small className='text-secondary mt-1 d-block'>Mencari...</small>
      )}
      {open && options.length > 0 && (
        <div
          className='bg-white border rounded-3 shadow-sm mt-1 overflow-auto'
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 50,
            maxHeight: 200,
          }}
        >
          {options.map((item) => (
            <button
              key={item.id}
              type='button'
              className='dropdown-item py-2 px-3 small'
              onClick={() => {
                onSelect(item);
                setOpen(false);
              }}
            >
              {item.nama}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h6
      className='fw-semibold text-uppercase text-secondary mb-3'
      style={{ fontSize: 11, letterSpacing: 1 }}
    >
      {children}
    </h6>
  );
}

function formatDateYYYYMMDD(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${y}-${m}-${d}`;
}

export default function EditPegawaiPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [kalurahanList, setKalurahanList] = useState<Wilayah[]>([]);
  const [, setKabupatenNama] = useState('');
  const [provinsiNama, setProvinsiNama] = useState('');
  const [tempatLahirKeyword, setTempatLahirKeyword] = useState('');
  const [tempatLahirOptions, setTempatLahirOptions] = useState<Wilayah[]>([]);
  const [selectedTempatLahir, setSelectedTempatLahir] =
    useState<Wilayah | null>(null);
  const [loadingTempatLahir, setLoadingTempatLahir] = useState(false);
  const [usia, setUsia] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      statusAktif: true,
      jumlahAnak: 0,
      pendidikan: [{ jenjang: '', institusi: '', jurusan: '', tahunLulus: '' }],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'pendidikan',
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const tanggalLahir = watch('tanggalLahir');
  const kecamatanId = watch('kecamatanId');
  const kalurahanId = watch('kalurahanId');

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    if (!tanggalLahir) { setUsia(''); return; }
    const birth = new Date(tanggalLahir);
    if (isNaN(birth.getTime())) { setUsia(''); return; }
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const mDiff = now.getMonth() - birth.getMonth();
    if (mDiff < 0 || (mDiff === 0 && now.getDate() < birth.getDate())) age--;
    setUsia(age > 0 ? `${age} tahun` : '');
  }, [tanggalLahir]);

  const [kabupatenKeyword, setKabupatenKeyword] = useState('');
  const [kabupatenOptions, setKabupatenOptions] = useState<
    (Wilayah & {
      provinsiId: number;
      provinsi: { id: number; nama: string };
    })[]
  >([]);
  const [selectedKabupaten, setSelectedKabupaten] = useState<
    | (Wilayah & {
        provinsiId: number;
        provinsi: { id: number; nama: string };
      })
    | null
  >(null);
  const [loadingKabupaten, setLoadingKabupaten] = useState(false);
  const [kecamatanList, setKecamatanList] = useState<Wilayah[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchPegawai = async () => {
      setFetching(true);
      try {
        const res = await Request.GET(`/pegawai/${id}`);
        if (!res.success) {
          toast.error(res.message || 'Gagal memuat data pegawai');
          router.push('/pegawai');
          return;
        }

        const p = res.data;

        reset({
          nip: p.nip ?? '',
          nama: p.nama ?? '',
          email: p.email ?? '',
          nomorHp: p.nomorHp ?? '',
          provinsiId: p.provinsiId ? String(p.provinsiId) : '',
          kabupatenId: p.kabupatenId ? String(p.kabupatenId) : '',
          kecamatanId: p.kecamatanId ? String(p.kecamatanId) : '',
          kalurahanId: p.kalurahanId ? String(p.kalurahanId) : '',
          alamatDetail: p.alamatDetail ?? '',
          latitude: p.latitude != null ? String(p.latitude) : '',
          longitude: p.longitude != null ? String(p.longitude) : '',
          tempatLahirKabupatenId: p.tempatLahirKabupatenId
            ? String(p.tempatLahirKabupatenId)
            : '',
          tanggalLahir: formatDateYYYYMMDD(p.tanggalLahir),
          gender: p.gender ?? '',
          statusKawin: p.statusKawin ?? '',
          jumlahAnak: p.jumlahAnak ?? 0,
          tanggalMasuk: formatDateYYYYMMDD(p.tanggalMasuk),
          jabatan: p.jabatan ?? '',
          departemen: p.departemen ?? '',
          jenisPegawai: p.jenisPegawai ?? '',
          statusAktif: p.statusAktif === 'ACTIVE',
          pendidikan:
            Array.isArray(p.pendidikan) && p.pendidikan.length > 0
              ? p.pendidikan
              : [{ jenjang: '', institusi: '', jurusan: '', tahunLulus: '' }],
        });

        if (Array.isArray(p.pendidikan) && p.pendidikan.length > 0) {
          replace(p.pendidikan);
        }

        if (p.tempatLahirKabupaten) {
          setSelectedTempatLahir(p.tempatLahirKabupaten);
          setTempatLahirKeyword(p.tempatLahirKabupaten.nama);
        }

        if (p.kabupaten) {
          const kab = {
            ...p.kabupaten,
            provinsiId: p.provinsiId,
            provinsi: p.provinsi ?? { id: p.provinsiId, nama: '' },
          };
          setSelectedKabupaten(kab);
          setKabupatenKeyword(p.kabupaten.nama);
          setKabupatenNama(p.kabupaten.nama);
          setProvinsiNama(p.provinsi?.nama ?? '');

          const kecRes = await Request.GET(
            `/wilayah/kecamatan?kabupatenId=${p.kabupatenId}`
          );
          if (kecRes.success) {
            setKecamatanList(kecRes.data);
            setValue('kecamatanId', p.kecamatanId ? String(p.kecamatanId) : '');

            if (p.kecamatanId) {
              const kelRes = await Request.GET(
                `/wilayah/kalurahan?kecamatanId=${p.kecamatanId}`
              );
              if (kelRes.success) {
                setKalurahanList(kelRes.data);
                setValue('kalurahanId', p.kalurahanId ? String(p.kalurahanId) : '');
              }
            }
          }
        }
      } catch {
        toast.error('Gagal terhubung ke server');
        router.push('/pegawai');
      } finally {
        setFetching(false);
      }
    };

    fetchPegawai();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (selectedKabupaten && kabupatenKeyword === selectedKabupaten.nama)
      return;
    const timer = setTimeout(async () => {
      if (kabupatenKeyword.trim().length < 2) {
        setKabupatenOptions([]);
        return;
      }
      setLoadingKabupaten(true);
      try {
        const res = await Request.GET(
          `/wilayah/kabupaten?q=${encodeURIComponent(kabupatenKeyword)}`
        );
        if (res.success) setKabupatenOptions(res.data);
      } finally {
        setLoadingKabupaten(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [kabupatenKeyword, selectedKabupaten]);

  const handleSelectKabupaten = async (
    kab: (typeof kabupatenOptions)[number]
  ) => {
    setSelectedKabupaten(kab);
    setKabupatenKeyword(kab.nama);
    setKabupatenOptions([]);
    setKabupatenNama(kab.nama);
    setProvinsiNama(kab.provinsi?.nama || '');
    setValue('kabupatenId', String(kab.id));
    setValue('provinsiId', String(kab.provinsiId));
    setValue('kecamatanId', '');
    setValue('kalurahanId', '');
    setKecamatanList([]);
    setKalurahanList([]);
    const res = await Request.GET(`/wilayah/kecamatan?kabupatenId=${kab.id}`);
    if (res.success) setKecamatanList(res.data);
  };

  const handleKecamatanChange = async (kecamatanId: string) => {
    setValue('kecamatanId', kecamatanId);
    setValue('kalurahanId', '');
    setKalurahanList([]);
    if (!kecamatanId) return;
    const res = await Request.GET(
      `/wilayah/kalurahan?kecamatanId=${kecamatanId}`
    );
    if (res.success) setKalurahanList(res.data);
  };

  useEffect(() => {
    if (selectedTempatLahir && tempatLahirKeyword === selectedTempatLahir.nama)
      return;
    const timer = setTimeout(async () => {
      if (tempatLahirKeyword.trim().length < 2) {
        setTempatLahirOptions([]);
        return;
      }
      setLoadingTempatLahir(true);
      try {
        const res = await Request.GET(
          `/wilayah/kabupaten?q=${encodeURIComponent(tempatLahirKeyword)}`
        );
        if (res.success) setTempatLahirOptions(res.data);
      } finally {
        setLoadingTempatLahir(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [tempatLahirKeyword, selectedTempatLahir]);

  const onSubmit = async (data: FormValues) => {
    if (!selectedTempatLahir) {
      toast.error('Silakan pilih tempat lahir');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        nip: data.nip,
        nama: data.nama,
        email: data.email,
        nomorHp: data.nomorHp,
        provinsiId: Number(data.provinsiId) || undefined,
        kabupatenId: Number(data.kabupatenId) || undefined,
        kecamatanId: Number(data.kecamatanId) || undefined,
        kalurahanId: Number(data.kalurahanId) || undefined,
        alamatDetail: data.alamatDetail || undefined,
        latitude: data.latitude ? parseFloat(data.latitude) : undefined,
        longitude: data.longitude ? parseFloat(data.longitude) : undefined,
        tempatLahirKabupatenId: selectedTempatLahir.id,
        tanggalLahir: formatDate(data.tanggalLahir),
        gender: data.gender,
        statusKawin: data.statusKawin,
        jumlahAnak: Number(data.jumlahAnak),
        tanggalMasuk: formatDate(data.tanggalMasuk),
        jabatan: data.jabatan,
        departemen: data.departemen,
        jenisPegawai: data.jenisPegawai,
        statusAktif: data.statusAktif ? 'ACTIVE' : 'NON_ACTIVE',
        pendidikan: data.pendidikan.filter((p) => p.jenjang),
      };

      const response = await Request.PUT(`/pegawai/${id}`, payload);
      if (response.success) {
        toast.success(response.message || 'Data pegawai berhasil diperbarui');
        router.push('/pegawai');
      } else {
        if (response.errors && typeof response.errors === 'object') {
          const msgs = Object.values(response.errors).join(', ');
          toast.error(msgs || response.message || 'Validasi gagal');
        } else {
          toast.error(response.message || 'Gagal memperbarui pegawai');
        }
      }
    } catch {
      toast.error('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (err?: { message?: string }) =>
    `form-control rounded-3${err ? ' is-invalid' : ''}`;

  if (fetching) {
    return (
      <Card className='w-100 bg-white border shadow-sm rounded-4 p-4'>
        <div className='d-flex align-items-center gap-3 mb-4'>
          <div
            className='rounded-3 bg-light'
            style={{ width: 48, height: 48 }}
          />
          <div>
            <div
              className='rounded bg-light mb-2'
              style={{ width: 180, height: 20 }}
            />
            <div
              className='rounded bg-light'
              style={{ width: 260, height: 14 }}
            />
          </div>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className='mb-5'>
            <div
              className='rounded bg-light mb-3'
              style={{ width: 140, height: 12 }}
            />
            <div className='row g-3'>
              {[1, 2].map((j) => (
                <div key={j} className='col-12 col-md-6'>
                  <div
                    className='rounded bg-light mb-2'
                    style={{ width: 80, height: 12 }}
                  />
                  <div className='rounded-3 bg-light' style={{ height: 38 }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>
    );
  }

  return (
    <Card className='w-100 bg-white border shadow-sm rounded-4 p-4'>
      <FormHeader
        title='Edit Pegawai'
        description='Perbarui data pegawai yang sudah ada dalam sistem.'
        icon={<FiUsers size={32} />}
      />
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <section className='mb-5'>
          <SectionTitle>Data Pribadi</SectionTitle>
          <div className='row g-3'>
            <div className='col-12 col-md-6'>
              <label className='form-label fw-semibold small'>NIP</label>
              <input
                type='text'
                inputMode='numeric'
                className={inputCls(errors.nip)}
                placeholder='Minimal 8 digit angka'
                maxLength={20}
                {...register('nip', {
                  required: 'NIP wajib diisi',
                  minLength: {
                    value: 8,
                    message: 'Minimal 8 digit',
                  },
                  pattern: {
                    value: /^\d+$/,
                    message: 'Hanya boleh angka, tanpa spasi',
                  },
                })}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(/\D/g, '');
                }}
              />
              {errors.nip && (
                <div className='invalid-feedback'>{errors.nip.message}</div>
              )}
            </div>
            <div className='col-12 col-md-6'>
              <label className='form-label fw-semibold small'>
                Nama Pegawai
              </label>
              <input
                type='text'
                className={inputCls(errors.nama)}
                placeholder='Nama lengkap pegawai'
                {...register('nama', {
                  required: 'Nama wajib diisi',
                  pattern: {
                    value: /^[a-zA-Z0-9 ']+$/,
                    message: "Hanya huruf, angka, spasi, dan tanda petik (')",
                  },
                })}
              />
              {errors.nama && (
                <div className='invalid-feedback'>{errors.nama.message}</div>
              )}
            </div>
            <div className='col-12 col-md-6'>
              <label className='form-label fw-semibold small'>Email</label>
              <input
                type='email'
                className={inputCls(errors.email)}
                placeholder='contoh@email.com'
                {...register('email', {
                  required: 'Email wajib diisi',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Format email tidak valid',
                  },
                })}
              />
              {errors.email && (
                <div className='invalid-feedback'>{errors.email.message}</div>
              )}
            </div>
            <div className='col-12 col-md-6'>
              <label className='form-label fw-semibold small'>Nomor HP</label>
              <input
                type='text'
                inputMode='numeric'
                className={inputCls(errors.nomorHp)}
                placeholder='+6282218458888'
                maxLength={16}
                {...register('nomorHp', {
                  required: 'Nomor HP wajib diisi',
                  pattern: {
                    value: /^\+[1-9]\d{6,14}$/,
                    message: 'Format internasional, contoh: +6282218458888',
                  },
                })}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  let value = target.value;
                  value = value.replace(/[^\d+]/g, '');
                  if (value.includes('+')) {
                    value =
                      '+' + value.replace(/\+/g, '').replace(/[^\d]/g, '');
                  }
                  if (value && !value.startsWith('+')) {
                    value = '+' + value.replace(/[^\d]/g, '');
                  }
                  target.value = value;
                }}
              />
              {errors.nomorHp && (
                <div className='invalid-feedback'>{errors.nomorHp.message}</div>
              )}
              <small className='text-secondary'>
                Format internasional, contoh: +6282218458888
              </small>
            </div>
            <div className='col-12 col-md-6'>
              <label className='form-label fw-semibold small'>
                Jenis Kelamin
              </label>
              <select
                className={inputCls(errors.gender)}
                {...register('gender', {
                  required: 'Jenis kelamin wajib dipilih',
                })}
              >
                <option value=''>Pilih Jenis Kelamin</option>
                <option value='PRIA'>Pria</option>
                <option value='WANITA'>Wanita</option>
              </select>
              {errors.gender && (
                <div className='invalid-feedback'>{errors.gender.message}</div>
              )}
            </div>
            <div className='col-12 col-md-6'>
              <label className='form-label fw-semibold small'>
                Status Kawin
              </label>
              <div className='d-flex gap-4 pt-2'>
                <div className='form-check'>
                  <input
                    type='radio'
                    className='form-check-input'
                    id='kawin'
                    value='KAWIN'
                    {...register('statusKawin', {
                      required: 'Status kawin wajib dipilih',
                    })}
                  />
                  <label className='form-check-label' htmlFor='kawin'>
                    Kawin
                  </label>
                </div>
                <div className='form-check'>
                  <input
                    type='radio'
                    className='form-check-input'
                    id='tidakKawin'
                    value='TIDAK_KAWIN'
                    {...register('statusKawin', {
                      required: 'Status kawin wajib dipilih',
                    })}
                  />
                  <label className='form-check-label' htmlFor='tidakKawin'>
                    Tidak Kawin
                  </label>
                </div>
              </div>
              {errors.statusKawin && (
                <div className='text-danger small mt-1'>
                  {errors.statusKawin.message}
                </div>
              )}
            </div>
            <div className='col-12 col-md-6'>
              <label className='form-label fw-semibold small'>
                Jumlah Anak
              </label>
              <input
                type='text'
                inputMode='numeric'
                maxLength={2}
                className={inputCls(errors.jumlahAnak)}
                placeholder='0'
                {...register('jumlahAnak', {
                  required: 'Jumlah anak wajib diisi',
                  pattern: {
                    value: /^(0|[1-9][0-9]?)$/,
                    message: 'Hanya angka 0 - 99',
                  },
                  validate: (value) => Number(value) <= 99 || 'Maksimal 99',
                })}
                onInput={(e) => {
                  const target = e.target as HTMLInputElement;
                  target.value = target.value.replace(/\D/g, '');
                  if (target.value.length > 2) {
                    target.value = target.value.slice(0, 2);
                  }
                }}
              />
              {errors.jumlahAnak && (
                <div className='invalid-feedback'>
                  {errors.jumlahAnak.message}
                </div>
              )}
            </div>
            <div className='col-12 col-md-6'>
              <AutocompleteInput
                label='Tempat Lahir (Kabupaten)'
                placeholder='Ketik minimal 2 huruf...'
                value={tempatLahirKeyword}
                loading={loadingTempatLahir}
                options={tempatLahirOptions}
                error={undefined}
                onChange={(v) => {
                  setTempatLahirKeyword(v);
                  if (selectedTempatLahir) setSelectedTempatLahir(null);
                }}
                onSelect={(item) => {
                  setSelectedTempatLahir(item);
                  setTempatLahirKeyword(item.nama);
                  setTempatLahirOptions([]);
                  setValue('tempatLahirKabupatenId', String(item.id));
                }}
              />
              <input type='hidden' {...register('tempatLahirKabupatenId')} />
            </div>
            <div className='col-12 col-md-6'>
              <label className='form-label fw-semibold small'>
                Tanggal Lahir
              </label>
              <input
                type='date'
                className={inputCls(errors.tanggalLahir)}
                max={new Date().toISOString().split('T')[0]}
                {...register('tanggalLahir', {
                  required: 'Tanggal lahir wajib diisi',
                  validate: (v) => {
                    const date = new Date(v);
                    if (isNaN(date.getTime())) return 'Tanggal tidak valid';
                    if (date >= new Date()) return 'Tanggal lahir harus di masa lalu';
                    return true;
                  },
                })}
              />
              {errors.tanggalLahir && (
                <div className='invalid-feedback'>
                  {errors.tanggalLahir.message}
                </div>
              )}
            </div>
            <div className='col-12 col-md-6'>
              <label className='form-label fw-semibold small'>Usia</label>
              <input
                type='text'
                className='form-control rounded-3 bg-light'
                disabled
                value={usia}
                placeholder='Terisi otomatis'
              />
            </div>
          </div>
        </section>
        <section className='mb-5'>
          <SectionTitle>Alamat Domisili</SectionTitle>
          <div className='row g-3'>
            <div className='col-12 col-md-6'>
              <AutocompleteInput
                label='Kabupaten / Kota'
                placeholder='Ketik nama kabupaten...'
                value={kabupatenKeyword}
                loading={loadingKabupaten}
                options={kabupatenOptions}
                onChange={(v) => {
                  setKabupatenKeyword(v);
                  if (selectedKabupaten) {
                    setSelectedKabupaten(null);
                    setKabupatenNama('');
                    setProvinsiNama('');
                    setValue('kabupatenId', '');
                    setValue('provinsiId', '');
                    setValue('kecamatanId', '');
                    setValue('kalurahanId', '');
                    setKecamatanList([]);
                    setKalurahanList([]);
                  }
                }}
                onSelect={handleSelectKabupaten}
              />
              <input type='hidden' {...register('kabupatenId')} />
            </div>
            <div className='col-12 col-md-6'>
              <label className='form-label fw-semibold small'>Provinsi</label>
              <input
                type='text'
                className='form-control rounded-3 bg-light'
                disabled
                value={provinsiNama}
                placeholder='Terisi otomatis'
              />
              <input type='hidden' {...register('provinsiId')} />
            </div>
            <div className='col-12 col-md-6'>
              <label className='form-label fw-semibold small'>Kecamatan</label>
              <input type='hidden' {...register('kecamatanId')} />
              <select
                className='form-select rounded-3'
                disabled={kecamatanList.length === 0}
                value={kecamatanId}
                onChange={(e) => handleKecamatanChange(e.target.value)}
              >
                <option value=''>
                  {kecamatanList.length === 0
                    ? 'Pilih kabupaten terlebih dahulu'
                    : 'Pilih Kecamatan'}
                </option>
                {kecamatanList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </div>
            <div className='col-12 col-md-6'>
              <label className='form-label fw-semibold small'>
                Kalurahan / Desa
              </label>
              <input type='hidden' {...register('kalurahanId')} />
              <select
                className='form-select rounded-3'
                disabled={kalurahanList.length === 0}
                value={kalurahanId}
                onChange={(e) => setValue('kalurahanId', e.target.value)}
              >
                <option value=''>
                  {kalurahanList.length === 0
                    ? 'Pilih kecamatan terlebih dahulu'
                    : 'Pilih Kalurahan'}
                </option>
                {kalurahanList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </div>
            <div className='col-12'>
              <label className='form-label fw-semibold small'>
                Detail Alamat
              </label>
              <textarea
                className='form-control rounded-3'
                rows={3}
                placeholder='Nama jalan, RT/RW, nomor rumah, dll.'
                {...register('alamatDetail')}
              />
            </div>
            <div className='col-12 col-md-6'>
              <label className='form-label fw-semibold small'>Latitude</label>
              <input
                type='text'
                className={inputCls(errors.latitude)}
                placeholder='-7.123456'
                {...register('latitude', {
                  pattern: {
                    value: /^-?([1-8]?\d(\.\d+)?|90(\.0+)?)$/,
                    message: 'Latitude tidak valid (rentang -90 s.d. 90)',
                  },
                })}
              />
              {errors.latitude && (
                <div className='invalid-feedback'>
                  {errors.latitude.message}
                </div>
              )}
            </div>
            <div className='col-12 col-md-6'>
              <label className='form-label fw-semibold small'>Longitude</label>
              <input
                type='text'
                className={inputCls(errors.longitude)}
                placeholder='110.123456'
                {...register('longitude', {
                  pattern: {
                    value: /^-?(1[0-7]\d(\.\d+)?|[1-9]?\d(\.\d+)?|180(\.0+)?)$/,
                    message: 'Longitude tidak valid (rentang -180 s.d. 180)',
                  },
                })}
              />
              {errors.longitude && (
                <div className='invalid-feedback'>
                  {errors.longitude.message}
                </div>
              )}
            </div>
          </div>
        </section>
        <section className='mb-5'>
          <SectionTitle>Data Pekerjaan</SectionTitle>
          <div className='row g-3'>
            <div className='col-12 col-md-6'>
              <label className='form-label fw-semibold small'>
                Tanggal Masuk
              </label>
              <input
                type='date'
                className={inputCls(errors.tanggalMasuk)}
                {...register('tanggalMasuk', {
                  required: 'Tanggal masuk wajib diisi',
                  validate: (v) => {
                    const date = new Date(v);
                    if (isNaN(date.getTime())) return 'Tanggal tidak valid';
                    return true;
                  },
                })}
              />
              {errors.tanggalMasuk && (
                <div className='invalid-feedback'>
                  {errors.tanggalMasuk.message}
                </div>
              )}
            </div>
            <div className='col-12 col-md-6'>
              <label className='form-label fw-semibold small'>Jabatan</label>
              <select
                className={inputCls(errors.jabatan)}
                {...register('jabatan', { required: 'Jabatan wajib dipilih' })}
              >
                <option value=''>Pilih Jabatan</option>
                <option value='MANAGER'>Manager</option>
                <option value='STAF'>Staf</option>
                <option value='MAGANG'>Magang</option>
                <option value='KARYAWAN'>Karyawan</option>
              </select>
              {errors.jabatan && (
                <div className='invalid-feedback'>{errors.jabatan.message}</div>
              )}
            </div>
            <div className='col-12 col-md-6'>
              <label className='form-label fw-semibold small'>Departemen</label>
              <select
                className={inputCls(errors.departemen)}
                {...register('departemen', {
                  required: 'Departemen wajib dipilih',
                })}
              >
                <option value=''>Pilih Departemen</option>
                <option value='MARKETING'>Marketing</option>
                <option value='HRD'>HRD</option>
                <option value='PRODUCTION'>Production</option>
                <option value='EXECUTIVE'>Executive</option>
                <option value='COMMISSIONER'>Commissioner</option>
              </select>
              {errors.departemen && (
                <div className='invalid-feedback'>
                  {errors.departemen.message}
                </div>
              )}
            </div>
            <div className='col-12 col-md-6'>
              <label className='form-label fw-semibold small'>
                Jenis Pegawai
              </label>
              <select
                className={inputCls(errors.jenisPegawai)}
                {...register('jenisPegawai', {
                  required: 'Jenis pegawai wajib dipilih',
                })}
              >
                <option value=''>Pilih Jenis</option>
                <option value='TETAP'>Tetap</option>
                <option value='KONTRAK'>Kontrak</option>
                <option value='MAGANG'>Magang</option>
              </select>
              {errors.jenisPegawai && (
                <div className='invalid-feedback'>
                  {errors.jenisPegawai.message}
                </div>
              )}
            </div>
            <div className='col-12'>
              <div className='form-check'>
                <input
                  type='checkbox'
                  className='form-check-input'
                  id='statusAktif'
                  {...register('statusAktif')}
                />
                <label
                  htmlFor='statusAktif'
                  className='form-check-label fw-medium small'
                >
                  Aktif
                </label>
              </div>
              <small className='text-secondary'>
                Pegawai aktif dapat menggunakan sistem absensi.
              </small>
            </div>
          </div>
        </section>
        <section className='mb-5'>
          <div className='d-flex align-items-center justify-content-between mb-3'>
            <SectionTitle>Riwayat Pendidikan</SectionTitle>
            <button
              type='button'
              onClick={() =>
                append({
                  jenjang: '',
                  institusi: '',
                  jurusan: '',
                  tahunLulus: '',
                })
              }
              className='btn btn-sm btn-outline-primary d-flex align-items-center gap-1 rounded-3'
            >
              <FiPlus size={13} />
              Tambah
            </button>
          </div>
          <div className='d-flex flex-column gap-3'>
            {fields.map((field, index) => (
              <div key={field.id} className='border rounded-3 p-3'>
                <div className='row g-3 align-items-end'>
                  <div className='col-12 col-md-3'>
                    <label className='form-label fw-semibold small'>
                      Jenjang
                    </label>
                    <select
                      className='form-select rounded-3 form-select-sm'
                      {...register(`pendidikan.${index}.jenjang`)}
                    >
                      <option value=''>Pilih</option>
                      <option value='SD'>SD</option>
                      <option value='SMP'>SMP</option>
                      <option value='SMA/SMK'>SMA/SMK</option>
                      <option value='D3'>D3</option>
                      <option value='S1'>S1</option>
                      <option value='S2'>S2</option>
                      <option value='S3'>S3</option>
                    </select>
                  </div>
                  <div className='col-12 col-md-3'>
                    <label className='form-label fw-semibold small'>
                      Institusi
                    </label>
                    <input
                      type='text'
                      className='form-control form-control-sm rounded-3'
                      placeholder='Nama sekolah / kampus'
                      {...register(`pendidikan.${index}.institusi`)}
                    />
                  </div>
                  <div className='col-12 col-md-3'>
                    <label className='form-label fw-semibold small'>
                      Jurusan
                    </label>
                    <input
                      type='text'
                      className='form-control form-control-sm rounded-3'
                      placeholder='Jurusan / Program Studi'
                      {...register(`pendidikan.${index}.jurusan`)}
                    />
                  </div>
                  <div className='col-12 col-md-2'>
                    <label className='form-label fw-semibold small'>
                      Tahun Lulus
                    </label>
                    <input
                      type='text'
                      className='form-control form-control-sm rounded-3'
                      placeholder='2020'
                      maxLength={4}
                      {...register(`pendidikan.${index}.tahunLulus`, {
                        pattern: {
                          value: /^\d{4}$/,
                          message: '4 digit tahun',
                        },
                      })}
                    />
                  </div>
                  <div className='col-12 col-md-1 d-flex align-items-end'>
                    {fields.length > 1 && (
                      <button
                        type='button'
                        onClick={() => remove(index)}
                        className='btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center'
                        style={{ width: 32, height: 32, padding: 0 }}
                        title='Hapus'
                      >
                        <FiTrash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <div className='border-top pt-4'>
          <FormActions
            cancelTo='/pegawai'
            submitLabel='Simpan Perubahan'
            loading={loading}
            disabled={loading}
          />
        </div>
      </form>
    </Card>
  );
}
