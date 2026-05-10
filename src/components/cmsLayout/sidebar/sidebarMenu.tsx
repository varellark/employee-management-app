'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';

type SidebarMenuChildProps = {
  href?: string;
};

interface SidebarMenuProps {
  title: string;
  href?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export default function SidebarMenu({
  title,
  href,
  icon,
  children,
}: SidebarMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const hasActiveChild = React.Children.toArray(children).some((child) => {
    if (React.isValidElement<SidebarMenuChildProps>(child)) {
      const childHref = child.props.href;
      return childHref && pathname.startsWith(childHref);
    }
    return false;
  });

  const active = (href && pathname.startsWith(href)) || hasActiveChild;

  useEffect(() => {
    if (hasActiveChild) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
    }
  }, [hasActiveChild]);

  if (children) {
    return (
      <div className='mb-1'>
        <button
          type='button'
          onClick={() => setOpen(!open)}
          className={`btn w-100 d-flex align-items-center justify-content-between text-start rounded-4 px-3 py-2 border-0 sidebar-menu ${
            active ? 'sidebar-menu-active' : ''
          }`}
        >
          <div className='d-flex align-items-center gap-2'>
            {icon}
            <span className='small'>{title}</span>
          </div>
          {open ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
        </button>
        {open && (
          <div className='ms-4 mt-2 d-flex flex-column gap-2'>{children}</div>
        )}
      </div>
    );
  }

  return (
    <div className='mb-1'>
      <Link
        href={href || '#'}
        className={`btn w-100 d-flex align-items-center gap-2 text-start rounded-4 px-3 py-2 border-0 text-decoration-none sidebar-menu ${
          active ? 'sidebar-menu-active' : 'text-dark'
        }`}
      >
        {icon}
        <span className='small'>{title}</span>
      </Link>
    </div>
  );
}
