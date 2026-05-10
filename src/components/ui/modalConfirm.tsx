'use client';

interface ModalConfirmProps {
  show: boolean;
  title?: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  buttonConfirm?: string;
}

export default function modalConfirm({
  show,
  title = 'Konfirmasi?',
  message,
  onCancel,
  onConfirm,
  buttonConfirm = 'Konfirmasi',
}: ModalConfirmProps) {
  if (!show) return null;

  return (
    <>
      <div className='modal fade show d-block'>
        <div className='modal-dialog modal-dialog-centered'>
          <div className='modal-content border-0 rounded-4 shadow-lg'>
            <div className='modal-body text-center p-4'>
              <h5 className='fw-semibold mb-3'>{title}</h5>
              <p className='text-muted small mb-4'>{message}</p>
              <div className='d-flex justify-content-center gap-2'>
                <button
                  type='button'
                  onClick={onCancel}
                  className='btn btn-light border px-4 rounded-3'
                >
                  Batal
                </button>
                <button
                  type='button'
                  onClick={onConfirm}
                  className='btn btn-danger px-4 rounded-3'
                >
                  {buttonConfirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='modal-backdrop fade show' />
    </>
  );
}
