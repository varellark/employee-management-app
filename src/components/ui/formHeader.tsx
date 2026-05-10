import React from 'react';

type FormHeaderProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
};

export default function FormHeader({
  title,
  description,
  icon,
}: FormHeaderProps) {
  return (
    <div className='d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4'>
      <div>
        <h1
          className='fw-bold text-dark mb-1'
          style={{
            fontSize: '1.5rem',
            letterSpacing: '-0.5px',
          }}
        >
          {title}
        </h1>
        {description && (
          <p className='text-secondary small mb-0'>{description}</p>
        )}
      </div>
      {icon && (
        <div className='d-none d-md-flex align-items-center'>
          <div
            className='d-flex align-items-center justify-content-center rounded-4 shadow-sm'
            style={{
              width: '72px',
              height: '72px',
              background:
                'linear-gradient(135deg, rgba(13,42,148,0.12) 0%, rgba(30,64,175,0.08) 100%)',
              border: '1px solid rgba(30,64,175,0.12)',
            }}
          >
            <div
              className='d-flex align-items-center justify-content-center rounded-4'
              style={{
                width: '56px',
                height: '56px',
                background: '#ffffff',
                color: '#0d2a94',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              {icon}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
