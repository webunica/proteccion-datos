# Sistema de Cumplimiento Ley 21.719 — Chile 🇨🇱

Sistema SaaS multi-tenant para gestionar el cumplimiento de la **Ley 21.719 de Protección de Datos Personales** en tiendas Shopify y WooCommerce.

## Módulos del sistema

| Módulo | Descripción |
|--------|-------------|
| **CMP** | Cookie Management Platform — banner de consentimiento Ley 21.719 |
| **RAT** | Registro de Actividades de Tratamiento |
| **ARSOP+** | Gestión de derechos de titulares (Acceso, Rectificación, Supresión, Oposición, Portabilidad, Bloqueo) |
| **Políticas** | Editor y versionado de políticas de privacidad |
| **Brechas** | Registro y notificación de incidentes de seguridad |
| **Cumplimiento** | Score de cumplimiento 0–100 con alertas |

## Estructura del monorepo

```
sist-protec-datos/
├── apps/
│   ├── admin/          # Dashboard Next.js (App Router) — gestión multi-tenant
│   └── widget/         # Widget JS embebible — banner de consentimiento
├── packages/
│   ├── shared/         # Tipos TypeScript compartidos
│   └── supabase/       # Migraciones SQL y schema de Supabase
├── integrations/
│   ├── shopify/        # App de Shopify (OAuth + webhooks)
│   └── woocommerce/    # Plugin WooCommerce (REST API)
├── package.json        # pnpm workspaces root
├── pnpm-workspace.yaml
└── tsconfig.base.json  # TypeScript base config compartida
```

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript 5.4 |
| Estilos | Tailwind CSS |
| Base de datos | Supabase (PostgreSQL + Auth + Storage) |
| ORM | Supabase JS Client v2 |
| Package manager | pnpm 9 (workspaces) |
| Despliegue | Vercel |

## Requisitos previos

- **Node.js** >= 20
- **pnpm** >= 9 (`npm install -g pnpm`)
- **Supabase CLI** (`npm install -g supabase`)
- Cuenta en [Supabase](https://supabase.com) con proyecto creado

## Inicio rápido (desarrollo local)

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url>
cd sist-protec-datos
pnpm install
```

### 2. Configurar variables de entorno

Copiar el archivo de ejemplo en cada app:

```bash
# Admin app
cp apps/admin/.env.example apps/admin/.env.local
```

Variables requeridas en `apps/admin/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

### 3. Aplicar migraciones a Supabase

```bash
# Linkear al proyecto remoto
supabase link --project-ref <PROJECT_REF>

# Aplicar todas las migraciones
supabase db push

# Para desarrollo local con Docker
supabase start
supabase db reset
```

Ver [`packages/supabase/README.md`](./packages/supabase/README.md) para instrucciones detalladas.

### 4. Levantar el servidor de desarrollo

```bash
# Admin dashboard
pnpm dev

# Widget de consentimiento
pnpm widget:dev
```

## Comandos principales

```bash
pnpm dev             # Levantar admin en modo desarrollo
pnpm widget:dev      # Levantar widget en modo desarrollo
pnpm build           # Build completo (admin + widget)
pnpm widget:build    # Build solo del widget
```

## Roles de usuario

| Rol | Descripción |
|-----|-------------|
| `agency_admin` | Acceso total a todos los tenants — administrador de la agencia |
| `client_operator` | Gestión de su propio tenant — puede editar y resolver solicitudes |
| `client_viewer` | Solo lectura de su propio tenant |

## Planes disponibles

| Plan | Descripción |
|------|-------------|
| `basic` | Funcionalidades esenciales: CMP + RAT básico |
| `pro` | Todo lo básico + ARSOP+ + políticas + brechas |
| `enterprise` | Todo pro + soporte dedicado + SLA garantizado |

## Arquitectura de base de datos

```
tenants (1) ──< user_profiles
tenants (1) ──< consents
tenants (1) ──< rights_requests
tenants (1) ──< rat_treatments
tenants (1) ──< privacy_policies
tenants (1) ──< breach_incidents
tenants (1) ──< audit_logs
```

Row Level Security (RLS) asegura aislamiento completo entre tenants a nivel de base de datos.

## Despliegue en Vercel

1. Conectar el repositorio en [vercel.com](https://vercel.com)
2. Configurar el **Root Directory** como `apps/admin`
3. Agregar las variables de entorno de Supabase
4. Deploy automático en cada push a `main`

## Marco legal

Este sistema está diseñado para apoyar el cumplimiento de:

- 🇨🇱 **Ley 21.719** — Protección de Datos Personales (Chile, vigente desde diciembre 2026)
- 🛒 **Ley 19.496** — Protección al Consumidor (obligaciones de devolución y reembolso)
- 🔐 **Principios ARSOP+** — Acceso, Rectificación, Supresión, Oposición, Portabilidad y Bloqueo

> **⚠️ Aviso legal:** Este sistema es una herramienta de apoyo al cumplimiento. No reemplaza el asesoramiento legal especializado. Se recomienda consultar con un abogado especialista en protección de datos para validar la implementación específica de cada organización.

## Contribuir

1. Crear rama desde `main`: `git checkout -b feature/nombre-feature`
2. Hacer commits descriptivos
3. Abrir Pull Request hacia `main`
4. Requiere revisión de al menos 1 aprobador

## Licencia

Propietario — Todos los derechos reservados.
