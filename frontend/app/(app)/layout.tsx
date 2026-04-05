'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, initializeAuth } from '@/lib/store';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    // Initialize auth from localStorage on mount
    initializeAuth();
  }, []);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated && !token) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, token, router]);

  if (!isAuthenticated && !token) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="h-14 border-b border-border flex items-center px-6 gap-4 bg-card/50">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
