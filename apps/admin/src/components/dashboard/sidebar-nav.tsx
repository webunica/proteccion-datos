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
  FileCheck,
  Award,
  Scale,
  Settings,
  LogOut,
  ChevronRight,
  ExternalLink,
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
    label: 'Clientes & Tiendas',
    icon: Building2,
    roles: ['agency_admin'],
  },
  {
    href: '/dashboard/rights',
    label: 'Solicitudes ARSOP+',
    icon: Inbox,
  },
  {
    href: '/dashboard/rat',
    label: 'Registro RAT',
    icon: ClipboardList,
  },
  {
    href: '/dashboard/policy',
    label: 'Política de Privacidad',
    icon: FileText,
  },
  {
    href: '/dashboard/breach',
    label: 'Gestión de Brechas',
    icon: AlertTriangle,
  },
  {
    href: '/dashboard/dpa',
    label: 'Contratos Encargo (DPA)',
    icon: FileCheck,
  },
  {
    href: '/dashboard/certificate',
    label: 'Sello & Certificado',
    icon: Award,
  },
  {
    href: '/dashboard/eipd',
    label: 'Evaluación EIPD (Art. 25)',
    icon: Scale,
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

  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isAgency = role === 'agency_admin';

  return (
    <aside className="w-64 min-h-screen bg-[#0B1120] text-slate-300 flex flex-col border-r border-slate-800/80 shadow-2xl relative select-none">
      {/* Brand Header */}
      <div className="px-5 py-5 border-b border-slate-800/60 bg-gradient-to-b from-[#0e1628] to-[#0B1120]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-white/15">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-bold text-sm tracking-tight">Ley 21.719</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                PRO
              </span>
            </div>
            <p className="text-slate-400 text-[11px] font-medium leading-none mt-1">
              Cumplimiento de Datos
            </p>
          </div>
        </div>
      </div>

      {/* Role Indicator Banner */}
      <div className="px-4 pt-4 pb-1">
        <div className="px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800/70 flex items-center justify-between">
          <span className="text-xs text-slate-400">Rol activo</span>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border',
              isAgency
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/25'
            )}
          >
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                isAgency ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'
              )}
            />
            {isAgency ? 'Agencia Admin' : 'Operador'}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1.5 pt-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Menú Principal
        </div>
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
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                isActive
                  ? 'bg-blue-600/15 text-blue-400 font-semibold border border-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
              )}
            >
              <item.icon
                className={cn(
                  'w-4 h-4 flex-shrink-0 transition-colors',
                  isActive
                    ? 'text-blue-400'
                    : 'text-slate-400 group-hover:text-slate-200'
                )}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-sm shadow-blue-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-slate-900/60 border border-slate-800/70 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm text-white font-bold text-xs ring-1 ring-white/10">
            {initials || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate leading-tight">
              {displayName}
            </p>
            <p className="text-slate-400 text-[10px] truncate leading-tight mt-0.5 font-mono">
              {userEmail}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          type="button"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
