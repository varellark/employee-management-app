import React from 'react';

interface AvatarProps {
  name: string;
  size?: number;
}

export default function avatarAlphabet({ name, size = 90 }: AvatarProps) {
  const letter = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div
      className='d-flex align-items-center justify-content-center rounded-circle text-white fw-bold shadow-sm avatar-alphabet'
      style={{
        width: size,
        height: size,
        fontSize: size / 2.9,
        letterSpacing: '0.5px',
      }}
    >
      <span
        style={{
          position: 'relative',
          zIndex: 2,
        }}
      >
        {letter}
      </span>
    </div>
  );
}
