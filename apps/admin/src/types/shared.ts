// All shared types for the Ley 21.719 compliance system

export type Platform = 'shopify' | 'woocommerce' | 'other';
export type Plan = 'basic' | 'pro' | 'enterprise';
export type UserRole = 'agency_admin' | 'client_operator' | 'client_viewer';
export type RightsType = 'access' | 'rectify' | 'suppress' | 'oppose' | 'portability' | 'block';
export type RightsStatus = 'received' | 'acknowledged' | 'in_progress' | 'resolved' | 'rejected';
export type LegalBasis =
  | 'consent'
  | 'contract'
  | 'legal_obligation'
  | 'vital_interests'
  | 'legitimate_interest'
  | 'public_interest';
export type RiskLevel = 'normal' | 'high' | 'very_high';
export type BreachRisk = 'low' | 'medium' | 'high' | 'critical';
export type BreachStatus = 'open' | 'investigating' | 'contained' | 'closed';

// ============================================
// TENANT CONFIG
// ============================================

export type BadgePosition = 'middle-right' | 'middle-left' | 'bottom-right' | 'bottom-left';
export type BadgeStyle = 'retracted' | 'floating';

export interface BannerConfig {
  position: 'bottom' | 'top' | 'bottom-left' | 'bottom-right';
  primaryColor: string;
  textColor: string;
  backgroundColor: string;
  language: 'es' | 'en';
  badgePosition?: BadgePosition;
  badgeStyle?: BadgeStyle;
}

export interface CategoriesConfig {
  essential: boolean; // always true
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

export interface TenantConfig {
  banner: BannerConfig;
  categories: CategoriesConfig;
}

// ============================================
// DATABASE ENTITY TYPES
// ============================================

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  platform: Platform;
  shop_domain: string | null;
  rut_empresa: string | null;
  razon_social: string | null;
  email_contacto: string;
  email_dpo: string | null;
  address: string | null;
  website: string | null;
  config: TenantConfig;
  plan: Plan;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  tenant_id: string | null;
  role: UserRole;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConsentCategories {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

export interface Consent {
  id: string;
  tenant_id: string;
  session_id: string;
  ip_hash: string | null;
  categories: ConsentCategories;
  policy_version: string;
  user_agent: string | null;
  created_at: string;
}

export interface RightsRequest {
  id: string;
  tenant_id: string;
  type: RightsType;
  requester_email: string;
  requester_name: string | null;
  requester_rut: string | null;
  description: string | null;
  status: RightsStatus;
  received_at: string;
  acknowledged_at: string | null;
  resolved_at: string | null;
  assigned_to: string | null;
  resolution_note: string | null;
  evidence_url: string | null;
  /** Computed column: received_at + 5 business days */
  ack_deadline: string;
  /** Computed column: received_at + 30 days */
  resolution_deadline: string;
  created_at: string;
  updated_at: string;
}

export interface RatTreatment {
  id: string;
  tenant_id: string;
  name: string;
  purpose: string;
  legal_basis: LegalBasis;
  legal_basis_detail: string | null;
  data_categories: string[];
  data_subjects: string[];
  recipients: string[];
  third_countries: string[];
  retention_period: string | null;
  security_measures: string[];
  risk_level: RiskLevel;
  requires_eipd: boolean;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface PrivacyPolicy {
  id: string;
  tenant_id: string;
  version: string;
  content_html: string;
  effective_date: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface BreachIncident {
  id: string;
  tenant_id: string;
  title: string;
  detected_at: string;
  description: string;
  affected_count: number | null;
  data_types: string[];
  risk_level: BreachRisk;
  notified_apdp: boolean;
  notified_apdp_at: string | null;
  apdp_reference: string | null;
  notified_holders: boolean;
  notified_holders_at: string | null;
  status: BreachStatus;
  evidence_urls: string[];
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// COMPLIANCE SCORE
// ============================================

export interface ComplianceScore {
  tenant_id: string;
  /** Overall score 0–100 */
  total: number;
  breakdown: {
    /** 0–20: banner activo y configurado */
    cmp: number;
    /** 0–20: RAT con >= 5 tratamientos */
    rat: number;
    /** 0–20: política vigente publicada */
    policy: number;
    /** 0–20: sin solicitudes de derechos vencidas */
    rights: number;
    /** 0–20: sin brechas sin reportar */
    breach: number;
  };
  alerts: ComplianceAlert[];
}

export interface ComplianceAlert {
  type: 'warning' | 'error';
  module: 'cmp' | 'rat' | 'policy' | 'rights' | 'breach';
  message: string;
  entity_id?: string;
  deadline?: string;
}

// ============================================
// API TYPES
// ============================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface ConsentPostBody {
  tenant_slug: string;
  session_id: string;
  categories: ConsentCategories;
  policy_version: string;
}

export interface RightsRequestPostBody {
  tenant_slug: string;
  type: RightsType;
  requester_email: string;
  requester_name?: string;
  requester_rut?: string;
  description?: string;
}

// ============================================
// LABEL MAPS (UI display helpers)
// ============================================

export const RIGHTS_TYPE_LABELS: Record<RightsType, string> = {
  access: 'Acceso',
  rectify: 'Rectificación',
  suppress: 'Supresión',
  oppose: 'Oposición',
  portability: 'Portabilidad',
  block: 'Bloqueo',
};

export const RIGHTS_STATUS_LABELS: Record<RightsStatus, string> = {
  received: 'Recibida',
  acknowledged: 'Acusada',
  in_progress: 'En progreso',
  resolved: 'Resuelta',
  rejected: 'Rechazada',
};

export const LEGAL_BASIS_LABELS: Record<LegalBasis, string> = {
  consent: 'Consentimiento',
  contract: 'Ejecución de contrato',
  legal_obligation: 'Obligación legal',
  vital_interests: 'Intereses vitales',
  legitimate_interest: 'Interés legítimo',
  public_interest: 'Interés público',
};

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  normal: 'Normal',
  high: 'Alto',
  very_high: 'Muy alto',
};

export const BREACH_RISK_LABELS: Record<BreachRisk, string> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
  critical: 'Crítico',
};

export const BREACH_STATUS_LABELS: Record<BreachStatus, string> = {
  open: 'Abierto',
  investigating: 'Investigando',
  contained: 'Contenido',
  closed: 'Cerrado',
};

export const PLAN_LABELS: Record<Plan, string> = {
  basic: 'Básico',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

export const PLATFORM_LABELS: Record<Platform, string> = {
  shopify: 'Shopify',
  woocommerce: 'WooCommerce',
  other: 'Otro',
};
