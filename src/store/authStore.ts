'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserLogin } from '@/types/auth';
import { removeAuthToken, setAuthToken } from '@/utils/auth';

interface AuthState {
  token: string | null;
  user: UserLogin | null;
  login: (token: string, user: UserLogin) => void;
  logout: () => void;
  updateUser: (user: Partial<UserLogin>) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      login: (token, user) => {
        setAuthToken(token);

        set({
          token,
          user,
        });
      },

      logout: () => {
        removeAuthToken();

        set({
          token: null,
          user: null,
        });
      },

      updateUser: (newUser) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                ...newUser,
              }
            : null,
        })),
    }),

    {
      name: 'employee-management-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);

export default useAuthStore;
