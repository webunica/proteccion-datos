'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Shield,
  LayoutDashboard,
  Building2,
  Inbox,
  ClipboardList,
  FileText,
  AlertTriangle,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/dashboard/clients',
    label: 'Clientes',
    icon: Building2,
    roles: ['agency_admin'],
  },
  {
    href: '/dashboard/rights',
    label: 'ARSOP+',
    icon: Inbox,
  },
  {
    href: '/dashboard/rat',
    label: 'RAT',
    icon: ClipboardList,
  },
  {
    href: '/dashboard/policy',
    label: 'Política de Privacidad',
    icon: FileText,
  },
  {
    href: '/dashboard/breach',
    label: 'Brechas',
    icon: AlertTriangle,
  },
  {
    href: '/dashboard/settings',
    label: 'Configuración',
    icon: Settings,
  },
];

interface SidebarNavProps {
  userEmail: string;
  displayName: string;
  role: string;
}

export default function SidebarNav({ userEmail, displayName, role }: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  }

  const visibleItems = navItems.filter(
    item => !item.roles || item.roles.includes(role)
  );

  // Avatar initials
  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <aside className="w-60 min-h-screen bg-brand-900 flex flex-col border-r border-brand-700/50 shadow-xl">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-brand-700/50">
        <div className="flex items-center gap-2.5">
          <div className="bg-white/10 rounded-lg p-1.5">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Ley 21.719</p>
            <p className="text-brand-200 text-[10px] leading-tight">Cumplimiento Datos</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map(item => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-brand-200 hover:bg-white/10 hover:text-white'
              )}
            >
              <item.icon
                className={cn(
                  'w-4 h-4 flex-shrink-0 transition-colors',
                  isActive ? 'text-white' : 'text-brand-300 group-hover:text-white'
                )}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3 h-3 text-white/50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Role badge */}
      <div className="px-5 py-2">
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide',
            role === 'agency_admin'
              ? 'bg-amber-400/20 text-amber-300'
              : 'bg-brand-500/20 text-brand-300'
          )}
        >
          {role === 'agency_admin' ? 'Agencia Admin' : role}
        </span>
      </div>

      {/* User info */}
      <div className="px-3 pb-4 border-t border-brand-700/50 pt-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors">
          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{displayName}</p>
            <p className="text-brand-300 text-[10px] truncate">{userEmail}</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-lg text-brand-300 hover:bg-white/10 hover:text-white text-sm transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
