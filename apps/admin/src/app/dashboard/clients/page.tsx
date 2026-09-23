import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Building2,
  ExternalLink,
  Settings,
  TrendingUp,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 0;

interface Tenant {
  id: string;
  name: string;
  platform: string;
  compliance_score?: number | null;
  plan: string | null;
  is_active: boolean;
  slug: string;
  shop_domain: string | null;
  email_contacto: string | null;
}

const platformStyles: Record<string, { label: string; className: string }> = {
  shopify: {
    label: 'Shopify',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  woocommerce: {
    label: 'WooCommerce',
    className: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  other: {
    label: 'Otro',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  },
};

const planStyles: Record<string, string> = {
  basic: 'bg-slate-100 text-slate-600',
  pro: 'bg-blue-100 text-blue-700',
  enterprise: 'bg-amber-100 text-amber-700',
};

function ScorePill({ score }: { score: number }) {
  const color =
    score >= 80 ? 'text-green-700 bg-green-50 border-green-200'
    : score >= 60 ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-red-700 bg-red-50 border-red-200';

  return (
    <div className="flex items-center gap-2">
      <div className="w-24 bg-gray-100 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${
            score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded border ${color}`}>
        {score}%
      </span>
    </div>
  );
}

export default async function ClientsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'agency_admin') {
    redirect('/dashboard');
  }

  const { data: tenants, error } = await supabase
    .from('tenants')
    .select('id, name, platform, plan, is_active, slug, shop_domain, email_contacto')
    .order('name');

  if (error) {
    console.error('Error fetching tenants:', error);
  }

  const list: Tenant[] = tenants ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {list.length} tienda{list.length !== 1 ? 's' : ''} registrada{list.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/dashboard/clients/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-500/25"
        >
          <Plus className="w-4 h-4" />
          Nuevo cliente
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] overflow-hidden">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-gray-100 rounded-full p-4 mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Sin clientes</h3>
            <p className="text-gray-400 text-sm mb-5">
              Agrega tu primer cliente para comenzar.
            </p>
            <Link
              href="/dashboard/clients/new"
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo cliente
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Nombre</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Plataforma</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                    <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Score</span>
                  </th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Plan</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Estado</th>
                  <th className="text-right px-5 py-3.5 font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {list.map(tenant => {
                  const platform = (tenant.platform ?? 'other').toLowerCase();
                  const platformInfo = platformStyles[platform] ?? platformStyles.other;
                  const plan = (tenant.plan ?? 'basic').toLowerCase();
                  const score = tenant.compliance_score ?? 85;

                  return (
                    <tr key={tenant.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{tenant.name}</p>
                          {tenant.email_contacto && (
                            <p className="text-xs text-gray-400 mt-0.5">{tenant.email_contacto}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${platformInfo.className}`}
                        >
                          {platformInfo.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <ScorePill score={score} />
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                            planStyles[plan] ?? planStyles.basic
                          }`}
                        >
                          {plan}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium ${
                            tenant.is_active ? 'text-green-600' : 'text-gray-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              tenant.is_active ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          />
                          {tenant.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/clients/${tenant.id}`}
                            className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Ver detalle
                          </Link>
                          <Link
                            href={`/dashboard/clients/${tenant.id}/widget`}
                            className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            Widget
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
