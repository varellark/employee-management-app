import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`card border-0 shadow-sm rounded-4 w-100 ${className}`}>
      {children}
    </div>
  );
}
