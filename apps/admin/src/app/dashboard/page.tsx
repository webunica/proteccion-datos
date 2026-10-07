import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Inbox,
  AlertTriangle,
  ShieldCheck,
  Clock,
  TrendingUp,
  Plus,
  ClipboardList,
  Activity,
  CheckCircle2,
  XCircle,
  KeyRound,
  Sparkles,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 0;

interface StatCard {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  trend?: string;
}

interface ComplianceScore {
  tenant_id: string;
  name: string;
  score: number;
  platform: string;
}

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  created_at: string;
  status: string;
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div
        className={`${color} h-2 rounded-full transition-all`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

function StatCardComponent({
  title,
  value,
  description,
  icon: Icon,
  color,
  bg,
  trend,
}: StatCard) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className={`${bg} rounded-xl p-2.5`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        {trend && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
        <p className="text-sm font-semibold text-slate-700 mt-1">{title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, role, tenant_id')
    .eq('id', user.id)
    .maybeSingle();

  const role = profile?.role ?? 'client_operator';
  const firstName = (profile?.full_name ?? user.email ?? '').split(' ')[0];

  // Fetch stats — scoped by role
  let tenantFilter: { column: string; value: string } | null = null;
  if (role !== 'agency_admin' && profile?.tenant_id) {
    tenantFilter = { column: 'tenant_id', value: profile.tenant_id };
  }

  // ARSOP+ active requests
  let arsopQuery = supabase
    .from('rights_requests')
    .select('id, status', { count: 'exact', head: true })
    .in('status', ['received', 'acknowledged', 'in_progress']);
  if (tenantFilter) arsopQuery = arsopQuery.eq(tenantFilter.column, tenantFilter.value);
  const { count: arsopActive } = await arsopQuery;

  // Overdue requests (pending > 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  let overdueQuery = supabase
    .from('rights_requests')
    .select('id', { count: 'exact', head: true })
    .in('status', ['received', 'acknowledged', 'in_progress'])
    .lt('received_at', thirtyDaysAgo);
  if (tenantFilter) overdueQuery = overdueQuery.eq(tenantFilter.column, tenantFilter.value);
  const { count: overdueCount } = await overdueQuery;

  // Open breaches
  let breachQuery = supabase
    .from('breach_incidents')
    .select('id', { count: 'exact', head: true })
    .in('status', ['open', 'investigating']);
  if (tenantFilter) breachQuery = breachQuery.eq(tenantFilter.column, tenantFilter.value);
  const { count: openBreaches } = await breachQuery;

  // Compliance scores per tenant
  let tenantsQuery = supabase
    .from('tenants')
    .select('id, name, platform')
    .eq('is_active', true)
    .order('name');
  if (tenantFilter) tenantsQuery = tenantsQuery.eq('id', tenantFilter.value);
  const { data: rawTenants } = await tenantsQuery;

  const tenants = (rawTenants || []).map(t => ({
    ...t,
    compliance_score: 85,
  }));

  // Average compliance score
  const avgScore =
    tenants.length > 0
      ? Math.round(tenants.reduce((sum, t) => sum + (t.compliance_score ?? 85), 0) / tenants.length)
      : 85;

  // Recent activity
  let activityQuery = supabase
    .from('audit_logs')
    .select('id, action, description, created_at, status')
    .order('created_at', { ascending: false })
    .limit(8);
  if (tenantFilter) activityQuery = activityQuery.eq(tenantFilter.column, tenantFilter.value);
  const { data: recentActivity } = await activityQuery;

  const stats: StatCard[] = [
    {
      title: 'Solicitudes ARSOP+ Activas',
      value: arsopActive ?? 0,
      description: 'Solicitudes de derechos pendientes de respuesta',
      icon: Inbox,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      trend: 'Plazo 30 días',
    },
    {
      title: 'Solicitudes Vencidas',
      value: overdueCount ?? 0,
      description: 'Superaron el plazo legal de 30 días',
      icon: Clock,
      color: overdueCount ? 'text-red-600' : 'text-gray-400',
      bg: overdueCount ? 'bg-red-50' : 'bg-gray-50',
    },
    {
      title: 'Score de Cumplimiento',
      value: `${avgScore}%`,
      description: avgScore >= 80 ? 'Nivel de cumplimiento adecuado' : 'Requiere atención',
      icon: TrendingUp,
      color: avgScore >= 80 ? 'text-green-600' : avgScore >= 60 ? 'text-amber-600' : 'text-red-600',
      bg: avgScore >= 80 ? 'bg-green-50' : avgScore >= 60 ? 'bg-amber-50' : 'bg-red-50',
    },
    {
      title: 'Brechas Abiertas',
      value: openBreaches ?? 0,
      description: 'Incidentes de seguridad sin resolver',
      icon: AlertTriangle,
      color: openBreaches ? 'text-amber-600' : 'text-gray-400',
      bg: openBreaches ? 'bg-amber-50' : 'bg-gray-50',
    },
  ];

  const platformColors: Record<string, string> = {
    shopify: 'bg-green-100 text-green-700',
    woocommerce: 'bg-purple-100 text-purple-700',
    other: 'bg-gray-100 text-gray-600',
  };

  function formatTimeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    return `hace ${Math.floor(hrs / 24)}d`;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenido, {firstName} 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Panel de cumplimiento · Ley 21.719 Protección de Datos Personales
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/rights"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" />
            Nueva solicitud ARSOP+
          </Link>
          <Link
            href="/dashboard/rat"
            className="flex items-center gap-2 bg-white border border-slate-200/80 hover:border-slate-300 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <ClipboardList className="w-4 h-4 text-slate-500" />
            Actualizar RAT
          </Link>
        </div>
      </div>

      {/* Disclaimer de Confianza Webúnica */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md">
                <Shield className="w-3.5 h-3.5" />
                Infraestructura Oficial Webúnica
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Estándar APDP 2026 · Ley N° 21.719
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              &quot;No somos un estudio de abogados que cobra honorarios por hora: somos la plataforma de software e infraestructura creada por expertos en desarrollo web para que tu tienda y sitio web cumplan automáticamente las exigencias técnicas de la Ley 21.719.&quot;
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Resolvemos la carga de la prueba mediante sellado criptográfico HMAC-SHA256, auto-blocking previo de Meta Pixel / GA4 / TikTok y canal de derechos ARSOP+ verificado con OTP.
            </p>
          </div>
          <div className="flex sm:flex-col gap-2 shrink-0">
            <Link
              href="/dashboard/consents"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Evidencia HMAC
            </Link>
            <Link
              href="/dashboard/certificate"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all border border-white/15"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Sello & Certificado
            </Link>
          </div>
        </div>
      </div>

      {/* Puesta en Marcha en 3 Pasos */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
              Puesta en Marcha Inmediata
            </span>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Tu tienda protegida en 3 simples pasos
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Sin reuniones interminables ni desarrollos a medida.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 relative">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
              01
            </div>
            <h4 className="text-sm font-bold text-slate-900">Instala en 2 Minutos</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pega 1 sola línea de script en Shopify (<code>theme.liquid</code>) o activa el plugin para WooCommerce y WordPress.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard/clients"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Ver script de integración
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 relative">
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center">
              02
            </div>
            <h4 className="text-sm font-bold text-slate-900">Auto-Blocking & Google Consent Mode</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              El sistema pausa automáticamente Meta Pixel, GA4 y TikTok hasta el consentimiento libre del usuario, sin romper la compra.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                Consent Mode v2 Activo
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 relative">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
              03
            </div>
            <h4 className="text-sm font-bold text-slate-900">Blindaje Legal & Prueba HMAC</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cada decisión queda sellada con hash HMAC-SHA256 y marca de tiempo inmutable, lista para exportar en CSV ante la APDP.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard/consents"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
              >
                Auditar libro de pruebas
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <StatCardComponent key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance scores */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <h2 className="font-semibold text-gray-900">
                {role === 'agency_admin' ? 'Score de Cumplimiento por Cliente' : 'Score de Cumplimiento'}
              </h2>
            </div>
            {role === 'agency_admin' && (
              <Link
                href="/dashboard/clients"
                className="text-xs text-brand-600 hover:underline font-medium"
              >
                Ver todos →
              </Link>
            )}
          </div>

          <div className="divide-y divide-gray-50">
            {tenants && tenants.length > 0 ? (
              tenants.slice(0, 8).map(tenant => {
                const score = tenant.compliance_score ?? 0;
                const scoreColor =
                  score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-600';
                const platform = (tenant.platform ?? 'other').toLowerCase();

                return (
                  <div key={tenant.id} className="px-6 py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="text-sm font-medium text-gray-900 truncate">{tenant.name}</p>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase ${
                            platformColors[platform] ?? platformColors.other
                          }`}
                        >
                          {platform}
                        </span>
                      </div>
                      <ScoreBar score={score} />
                    </div>
                    <span className={`text-sm font-bold ${scoreColor} w-10 text-right`}>
                      {score}%
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="px-6 py-12 text-center text-gray-400 text-sm">
                No hay datos de cumplimiento disponibles
              </div>
            )}
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-50">
            <Activity className="w-4 h-4 text-brand-600" />
            <h2 className="font-semibold text-gray-900">Actividad Reciente</h2>
          </div>

          <div className="divide-y divide-gray-50">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map(item => (
                <div key={item.id} className="px-5 py-3.5 flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">
                    {item.status === 'success' || item.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : item.status === 'error' ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 line-clamp-2">{item.description ?? item.action}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatTimeAgo(item.created_at)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-center text-gray-400 text-sm">
                Sin actividad reciente
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
