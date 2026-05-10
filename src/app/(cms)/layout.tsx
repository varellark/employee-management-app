'use client';

import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import useAuthStore from '@/store/authStore';
import type { UserLogin } from '@/types/auth';
import Sidebar from '@/components/cmsLayout/sidebar/sidebar';
import Navbar from '@/components/cmsLayout/navbar/navbar';
import Footer from '@/components/cmsLayout/footer/footer';
import 'react-toastify/dist/ReactToastify.css';

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  const user: UserLogin | null = useAuthStore((state) => state.user);
  const [open, setOpen] = useState(false);
  const closeSidebarAction = () => setOpen(false);
  const toggleSidebarAction = () => setOpen((prev) => !prev);

  useEffect(() => {
    const loginSuccess = sessionStorage.getItem('loginSuccess');
    if (loginSuccess && user) {
      toast.info(`Selamat datang ${user.username}`);
      setTimeout(() => {
        sessionStorage.removeItem('loginSuccess');
      }, 100);
    }
  }, [user]);

  return (
    <>
      <div className='bg-body-tertiary vh-100 d-flex overflow-hidden'>
        <Sidebar
          user={user}
          open={open}
          closeSidebarAction={closeSidebarAction}
        />
        <div className='cms-wrapper d-flex flex-column flex-grow-1 overflow-hidden'>
          <Navbar user={user} toggleSidebarAction={toggleSidebarAction} />
          <main className='flex-grow-1 d-flex flex-column overflow-auto cms-scroll'>
            <div className='flex-grow-1 p-4'>{children}</div>
            <Footer />
          </main>
        </div>
      </div>
      <ToastContainer position='top-right' autoClose={3000} />
    </>
  );
}
