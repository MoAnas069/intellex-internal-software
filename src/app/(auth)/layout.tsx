'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Home, Briefcase, Users, IndianRupee, Search, BarChart3,
  Bell, LogOut, Menu, X, ChevronRight, Settings, FileText,
  Award, UserCheck
} from 'lucide-react';
import CommandBar from '@/components/CommandBar';
import QuickActions from '@/components/QuickActions';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
}

const OWNER_NAV: NavItem[] = [
  { label: 'Home', icon: Home, href: '/owner' },
  { label: 'Works', icon: Briefcase, href: '/works' },
  { label: 'Students', icon: Users, href: '/students' },
  { label: 'Finance', icon: IndianRupee, href: '/finance' },
];

const MANAGER_NAV: NavItem[] = [
  { label: 'Home', icon: Home, href: '/manager' },
  { label: 'Students', icon: Users, href: '/students' },
  { label: 'Works', icon: Briefcase, href: '/works' },
  { label: 'Performance', icon: BarChart3, href: '/performance' },
];

const OWNER_SIDEBAR_EXTRA: NavItem[] = [
  { label: 'Clients', icon: UserCheck, href: '/clients' },
  { label: 'Reports', icon: FileText, href: '/reports' },
  { label: 'Alerts', icon: Bell, href: '/alerts' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

const MANAGER_SIDEBAR_EXTRA: NavItem[] = [
  { label: 'Points', icon: Award, href: '/points' },
  { label: 'Alerts', icon: Bell, href: '/alerts' },
  { label: 'Reports', icon: FileText, href: '/reports' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, mounted } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandBarOpen, setCommandBarOpen] = useState(false);

  useEffect(() => {
    if (mounted && !user) {
      router.push('/');
    }
  }, [user, mounted, router]);

  // Don't render until client has hydrated and checked localStorage
  if (!mounted || !user) return null;

  const isOwner = user.role === 'owner';
  const bottomNav = isOwner ? OWNER_NAV : MANAGER_NAV;
  const sidebarExtra = isOwner ? OWNER_SIDEBAR_EXTRA : MANAGER_SIDEBAR_EXTRA;
  const allNav = [...(isOwner ? OWNER_NAV : MANAGER_NAV), ...sidebarExtra];

  const isActive = (href: string) => {
    if (href === '/owner' || href === '/manager') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-ix-bg">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 glass border-b border-ix-border">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-ix-text-secondary hover:text-ix-text transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-ix-green flex items-center justify-center">
                <span className="text-ix-bg font-bold text-xs">IX</span>
              </div>
              <span className="font-semibold text-sm hidden sm:block">INTELLEX</span>
            </div>
          </div>

          {/* Center - Search trigger */}
          <button
            onClick={() => setCommandBarOpen(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-ix-surface border border-ix-border text-ix-text-muted text-sm hover:border-ix-border-light transition-colors max-w-xs w-full mx-4"
          >
            <Search className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Search or type @command...</span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-ix-text-muted bg-ix-bg rounded border border-ix-border ml-auto">
              /
            </kbd>
          </button>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/alerts')}
              className="relative p-2 text-ix-text-secondary hover:text-ix-text transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-ix-danger" />
            </button>
            <button
              onClick={logout}
              className="p-2 text-ix-text-secondary hover:text-ix-danger transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-14 bottom-0 w-60 flex-col border-r border-ix-border bg-ix-bg z-30 overflow-y-auto">
        <nav className="flex-1 p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-semibold text-ix-text-muted uppercase tracking-widest">
            Main
          </div>
          {(isOwner ? OWNER_NAV : MANAGER_NAV).map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-ix-green-dim text-ix-green border border-ix-green/20'
                  : 'text-ix-text-secondary hover:text-ix-text hover:bg-ix-surface'
              }`}
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </button>
          ))}

          <div className="px-3 py-2 mt-4 text-[10px] font-semibold text-ix-text-muted uppercase tracking-widest">
            More
          </div>
          {sidebarExtra.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-ix-green-dim text-ix-green border border-ix-green/20'
                  : 'text-ix-text-secondary hover:text-ix-text hover:bg-ix-surface'
              }`}
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-ix-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-ix-green-dim flex items-center justify-center text-ix-green text-xs font-bold">
              {user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-ix-text-muted truncate">
                {isOwner ? 'Owner' : 'Student Manager'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-ix-bg border-r border-ix-border animate-slide-down overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-ix-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-ix-green flex items-center justify-center">
                  <span className="text-ix-bg font-bold text-xs">IX</span>
                </div>
                <span className="font-semibold text-sm">INTELLEX</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-ix-text-secondary hover:text-ix-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-3 space-y-1">
              {allNav.map((item) => (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? 'bg-ix-green-dim text-ix-green'
                      : 'text-ix-text-secondary hover:text-ix-text hover:bg-ix-surface'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </button>
              ))}
            </nav>

            <div className="p-4 mt-auto border-t border-ix-border">
              <button
                onClick={() => {
                  logout();
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-ix-danger hover:bg-ix-danger-dim transition-all"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-60 pb-20 lg:pb-6">
        <div className="max-w-6xl mx-auto p-4 lg:p-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-ix-border safe-bottom">
        <div className="flex items-center justify-around h-16">
          {bottomNav.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive(item.href) ? 'text-ix-green' : 'text-ix-text-muted'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setCommandBarOpen(true)}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-ix-text-muted transition-colors"
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-medium">Search</span>
          </button>
        </div>
      </nav>

      {/* Command Bar */}
      <CommandBar
        isOpen={commandBarOpen}
        onClose={() => setCommandBarOpen(false)}
      />

      {/* Quick Actions FAB */}
      <QuickActions />
    </div>
  );
}
