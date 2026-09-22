-- ============================================
-- Sistema Cumplimiento Ley 21.719 Chile
-- Schema inicial con Row Level Security
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TENANTS (Clientes / Tiendas)
-- ============================================
CREATE TABLE tenants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  platform      TEXT NOT NULL CHECK (platform IN ('shopify', 'woocommerce', 'other')),
  shop_domain   TEXT,
  rut_empresa   TEXT,
  razon_social  TEXT,
  email_contacto TEXT NOT NULL,
  email_dpo     TEXT,
  address       TEXT,
  website       TEXT,
  config        JSONB NOT NULL DEFAULT '{
    "banner": {
      "position": "bottom",
      "primaryColor": "#1a56db",
      "textColor": "#111827",
      "backgroundColor": "#ffffff",
      "language": "es"
    },
    "categories": {
      "essential": true,
      "analytics": true,
      "marketing": true,
      "personalization": false
    }
  }',
  plan          TEXT NOT NULL DEFAULT 'basic' CHECK (plan IN ('basic', 'pro', 'enterprise')),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- USER PROFILES (vinculados a Supabase Auth)
-- ============================================
CREATE TABLE user_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,  -- NULL = agency_admin
  role        TEXT NOT NULL DEFAULT 'client_operator'
              CHECK (role IN ('agency_admin', 'client_operator', 'client_viewer')),
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CONSENTS (Registro de consentimiento cookies)
-- ============================================
CREATE TABLE consents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  session_id      TEXT NOT NULL,
  ip_hash         TEXT,
  categories      JSONB NOT NULL,
  policy_version  TEXT NOT NULL,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consents_tenant_id ON consents(tenant_id);
CREATE INDEX idx_consents_session_id ON consents(session_id);
CREATE INDEX idx_consents_created_at ON consents(created_at);

-- ============================================
-- RIGHTS REQUESTS (Solicitudes ARSOP+)
-- ============================================
CREATE TABLE rights_requests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type             TEXT NOT NULL CHECK (type IN ('access', 'rectify', 'suppress', 'oppose', 'portability', 'block')),
  requester_email  TEXT NOT NULL,
  requester_name   TEXT,
  requester_rut    TEXT,
  description      TEXT,
  status           TEXT NOT NULL DEFAULT 'received'
                   CHECK (status IN ('received', 'acknowledged', 'in_progress', 'resolved', 'rejected')),
  received_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at  TIMESTAMPTZ,
  resolved_at      TIMESTAMPTZ,
  assigned_to      UUID REFERENCES auth.users(id),
  resolution_note  TEXT,
  evidence_url     TEXT,
  -- SLA tracking
  ack_deadline     TIMESTAMPTZ GENERATED ALWAYS AS (received_at + INTERVAL '5 business days') STORED,
  resolution_deadline TIMESTAMPTZ GENERATED ALWAYS AS (received_at + INTERVAL '30 days') STORED,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rights_requests_tenant_id ON rights_requests(tenant_id);
CREATE INDEX idx_rights_requests_status ON rights_requests(status);
CREATE INDEX idx_rights_requests_received_at ON rights_requests(received_at);

-- ============================================
-- RAT TREATMENTS (Registro Actividades Tratamiento)
-- ============================================
CREATE TABLE rat_treatments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  purpose             TEXT NOT NULL,
  legal_basis         TEXT NOT NULL CHECK (legal_basis IN (
                        'consent', 'contract', 'legal_obligation',
                        'vital_interests', 'legitimate_interest', 'public_interest'
                      )),
  legal_basis_detail  TEXT,
  data_categories     TEXT[] NOT NULL DEFAULT '{}',
  data_subjects       TEXT[] NOT NULL DEFAULT '{}',
  recipients          TEXT[] NOT NULL DEFAULT '{}',
  third_countries     TEXT[] NOT NULL DEFAULT '{}',
  retention_period    TEXT,
  security_measures   TEXT[] NOT NULL DEFAULT '{}',
  risk_level          TEXT NOT NULL DEFAULT 'normal' CHECK (risk_level IN ('normal', 'high', 'very_high')),
  requires_eipd       BOOLEAN NOT NULL DEFAULT FALSE,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  order_index         INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rat_treatments_tenant_id ON rat_treatments(tenant_id);
CREATE INDEX idx_rat_treatments_is_active ON rat_treatments(is_active);

-- ============================================
-- PRIVACY POLICIES (Políticas de privacidad)
-- ============================================
CREATE TABLE privacy_policies (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  version        TEXT NOT NULL,
  content_html   TEXT NOT NULL,
  effective_date DATE NOT NULL,
  is_active      BOOLEAN NOT NULL DEFAULT FALSE,
  created_by     UUID REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_privacy_policies_tenant_id ON privacy_policies(tenant_id);
CREATE INDEX idx_privacy_policies_is_active ON privacy_policies(is_active);

-- ============================================
-- BREACH INCIDENTS (Brechas de seguridad)
-- ============================================
CREATE TABLE breach_incidents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  detected_at         TIMESTAMPTZ NOT NULL,
  description         TEXT NOT NULL,
  affected_count      INTEGER,
  data_types          TEXT[] NOT NULL DEFAULT '{}',
  risk_level          TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  notified_apdp       BOOLEAN NOT NULL DEFAULT FALSE,
  notified_apdp_at    TIMESTAMPTZ,
  apdp_reference      TEXT,
  notified_holders    BOOLEAN NOT NULL DEFAULT FALSE,
  notified_holders_at TIMESTAMPTZ,
  status              TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'contained', 'closed')),
  evidence_urls       TEXT[] NOT NULL DEFAULT '{}',
  resolution_notes    TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_breach_incidents_tenant_id ON breach_incidents(tenant_id);

-- ============================================
-- AUDIT LOG (Trazabilidad de acciones)
-- ============================================
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id),
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   UUID,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rights_requests_updated_at BEFORE UPDATE ON rights_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rat_treatments_updated_at BEFORE UPDATE ON rat_treatments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_breach_incidents_updated_at BEFORE UPDATE ON breach_incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Helper function: get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: get current user tenant_id
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: is agency admin
CREATE OR REPLACE FUNCTION is_agency_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'agency_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE rights_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rat_treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE breach_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- TENANTS policies
CREATE POLICY "agency_admin_all_tenants" ON tenants
  FOR ALL USING (is_agency_admin());

CREATE POLICY "client_own_tenant" ON tenants
  FOR SELECT USING (id = get_user_tenant_id());

-- USER PROFILES policies
CREATE POLICY "agency_admin_all_profiles" ON user_profiles
  FOR ALL USING (is_agency_admin());

CREATE POLICY "client_own_profile" ON user_profiles
  FOR SELECT USING (id = auth.uid());

-- CONSENTS policies
CREATE POLICY "tenant_isolation_consents" ON consents
  FOR ALL USING (
    is_agency_admin() OR tenant_id = get_user_tenant_id()
  );

-- API key access for widget (service role bypasses RLS)
-- RIGHTS REQUESTS policies
CREATE POLICY "tenant_isolation_rights" ON rights_requests
  FOR ALL USING (
    is_agency_admin() OR tenant_id = get_user_tenant_id()
  );

-- RAT TREATMENTS policies
CREATE POLICY "tenant_isolation_rat" ON rat_treatments
  FOR ALL USING (
    is_agency_admin() OR tenant_id = get_user_tenant_id()
  );

-- PRIVACY POLICIES policies
CREATE POLICY "tenant_isolation_policies" ON privacy_policies
  FOR ALL USING (
    is_agency_admin() OR tenant_id = get_user_tenant_id()
  );

-- Public read for active policies (for the widget)
CREATE POLICY "public_read_active_policy" ON privacy_policies
  FOR SELECT USING (is_active = TRUE);

-- BREACH INCIDENTS policies
CREATE POLICY "tenant_isolation_breaches" ON breach_incidents
  FOR ALL USING (
    is_agency_admin() OR tenant_id = get_user_tenant_id()
  );

-- AUDIT LOGS policies
CREATE POLICY "tenant_isolation_audit" ON audit_logs
  FOR ALL USING (
    is_agency_admin() OR tenant_id = get_user_tenant_id()
  );

-- ============================================
-- TRIGGER: Auto-create user_profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client_operator'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
