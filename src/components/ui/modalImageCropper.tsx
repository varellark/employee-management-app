'use client';

import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';

type Props = {
  show: boolean;
  image: string;
  aspect?: number | null;
  onCancelAction: () => void;
  onFinishAction: (croppedBlob: Blob) => void;
};

export default function ModalImageCropper({
  show,
  image,
  aspect = 1,
  onCancelAction,
  onFinishAction,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, cropped: Area) => {
    setCroppedAreaPixels(cropped);
  }, []);

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return;

    const blob = await getCroppedImg(image, croppedAreaPixels);
    onFinishAction(blob);
  };

  if (!show) return null;

  return (
    <div className='modal fade show d-block' tabIndex={-1}>
      <div className='modal-backdrop fade show' onClick={onCancelAction} />
      <div className='modal-dialog modal-dialog-centered modal-lg'>
        <div className='modal-content rounded-4 shadow'>
          <div className='modal-header'>
            <h5 className='modal-title fw-semibold'>Crop Gambar</h5>
            <button
              type='button'
              className='btn-close'
              onClick={onCancelAction}
            />
          </div>
          <div className='modal-body p-0'>
            <div className='position-relative bg-light' style={{ height: 360 }}>
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={aspect ?? undefined}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className='p-3 border-top'>
              <label className='form-label small text-muted'>Zoom</label>
              <input
                type='range'
                className='form-range'
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </div>
          </div>
          <div className='modal-footer'>
            <button
              className='btn btn-outline-secondary'
              onClick={onCancelAction}
            >
              Batal
            </button>
            <button className='btn btn-primary' onClick={createCroppedImage}>
              Crop & Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getCroppedImg(
  imageSrc: string,
  cropPixels: Area
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Canvas 2D context not supported');

  canvas.width = cropPixels.width;
  canvas.height = cropPixels.height;

  ctx.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    cropPixels.width,
    cropPixels.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob as Blob);
    }, 'image/jpeg');
  });
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img: HTMLImageElement = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}
