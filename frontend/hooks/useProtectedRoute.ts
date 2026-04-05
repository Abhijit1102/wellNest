import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export function useProtectedRoute() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated && !token) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, token, router]);

  return {
    isAuthenticated,
    token,
  };
}
