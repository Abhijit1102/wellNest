'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Smile,
  BookOpen,
  MessageCircle,
  BarChart3,
  Leaf,
  LogOut,
  User,
} from 'lucide-react';
import Link from 'next/link';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/mood', label: 'Mood Tracker', icon: Smile },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export function AppSidebar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  console.log(user)

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <Leaf className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg text-foreground">WellNest</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-4 py-6 h-auto"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary-foreground">
                  {user?.full_name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-sm truncate text-foreground">{user?.full_name}</p>
                <p className="text-xs truncate text-muted-foreground">{user?.email}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/settings/profile" className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                <span>Profile Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
