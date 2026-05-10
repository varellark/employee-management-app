'use client';

import {
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

type OtpInputProps = {
  length?: number;
  value: string;
  onChangeAction: (value: string) => void;
  disabled?: boolean;
  error?: string;
};

export default function OtpInput({
  length = 6,
  value,
  onChangeAction,
  disabled = false,
  error,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpValues, setOtpValues] = useState<string[]>(Array(length).fill(''));

  useEffect(() => {
    const values = value.split('').slice(0, length);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOtpValues([...values, ...Array(length - values.length).fill('')]);
  }, [value, length]);

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  };

  const updateOtp = (values: string[]) => {
    setOtpValues(values);
    onChangeAction(values.join(''));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const inputValue = e.target.value.replace(/\D/g, '');

    if (!inputValue) {
      const updated = [...otpValues];
      updated[index] = '';
      updateOtp(updated);
      return;
    }

    const chars = inputValue.split('');
    const updated = [...otpValues];

    chars.forEach((char, i) => {
      const nextIndex = index + i;

      if (nextIndex < length) {
        updated[nextIndex] = char;
      }
    });

    updateOtp(updated);
    const focusIndex = Math.min(index + chars.length, length - 1);
    focusInput(focusIndex);

    if (updated.every((item) => item !== '')) {
      inputRefs.current[focusIndex]?.blur();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    const key = e.key;

    if (key === 'Backspace') {
      e.preventDefault();
      const updated = [...otpValues];
      if (updated[index]) {
        updated[index] = '';
        updateOtp(updated);
        return;
      }

      if (index > 0) {
        updated[index - 1] = '';
        updateOtp(updated);
        focusInput(index - 1);
      }
    }

    if (key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      focusInput(index - 1);
    }

    if (key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      focusInput(index + 1);
    }

    if (key.length === 1 && !/^\d$/.test(key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (
    e: ClipboardEvent<HTMLInputElement>,
    index: number
  ) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length);

    if (!pasted) return;

    const updated = [...otpValues];

    pasted.split('').forEach((char, i) => {
      const nextIndex = index + i;

      if (nextIndex < length) {
        updated[nextIndex] = char;
      }
    });

    updateOtp(updated);

    const focusIndex = Math.min(index + pasted.length, length - 1);

    if (updated.every((item) => item !== '')) {
      inputRefs.current[focusIndex]?.blur();
    } else {
      focusInput(focusIndex);
    }
  };

  return (
    <div>
      <div
        className='d-flex justify-content-between gap-2'
        style={{
          width: '100%',
        }}
      >
        {otpValues.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type='text'
            inputMode='numeric'
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={(e) => handlePaste(e, index)}
            onFocus={(e) => e.target.select()}
            className={`form-control text-center fw-bold ${
              error ? 'is-invalid' : ''
            }`}
            style={{
              width: '100%',
              minWidth: 40,
              maxWidth: 58,
              height: 58,
              fontSize: 22,
              borderRadius: 14,
              fontFamily: 'monospace',
              padding: 0,
            }}
          />
        ))}
      </div>
      {error && (
        <div className='text-danger mt-2' style={{ fontSize: 13 }}>
          {error}
        </div>
      )}
    </div>
  );
}
