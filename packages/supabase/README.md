# @sist-protec-datos/supabase

Migrations SQL para el proyecto de cumplimiento **Ley 21.719** (Chile).

## Estructura de migraciones

```
migrations/
├── 001_initial_schema.sql   # Tablas principales, índices, RLS, triggers
├── 002_seed_templates.sql   # Templates de RAT para e-commerce (8 tratamientos)
└── 003_seed_dev_tenants.sql # 3 tenants de prueba (solo desarrollo)
```

## Cómo ejecutar las migraciones

### Opción A — Supabase CLI (recomendado)

1. Instalar Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Iniciar el proyecto Supabase (primera vez):
   ```bash
   supabase init
   ```

3. Linkear al proyecto remoto:
   ```bash
   supabase link --project-ref <PROJECT_REF>
   ```

4. Aplicar todas las migraciones en orden:
   ```bash
   supabase db push
   ```

5. Para entorno local con Docker:
   ```bash
   supabase start
   supabase db reset   # aplica todas las migrations desde cero
   ```

### Opción B — SQL Editor de Supabase

1. Ir a **Supabase Dashboard → SQL Editor**
2. Ejecutar en orden:
   - `001_initial_schema.sql`
   - `002_seed_templates.sql`
   - `003_seed_dev_tenants.sql` *(solo en desarrollo)*

> **⚠️ Importante:** La migración `003_seed_dev_tenants.sql` solo debe ejecutarse en entornos de **desarrollo/staging**. Nunca en producción.

## Tablas creadas

| Tabla              | Descripción                                              |
|--------------------|----------------------------------------------------------|
| `tenants`          | Clientes / tiendas registradas en el sistema             |
| `user_profiles`    | Perfiles vinculados a Supabase Auth                      |
| `consents`         | Registro de consentimientos de cookies (CMP)             |
| `rights_requests`  | Solicitudes ARSOP+ de titulares de datos                 |
| `rat_treatments`   | Registro de Actividades de Tratamiento (RAT)             |
| `privacy_policies` | Versiones de políticas de privacidad                     |
| `breach_incidents` | Incidentes de brechas de seguridad                       |
| `audit_logs`       | Log de auditoría de acciones de usuarios                 |
| `rat_templates`    | Templates de RAT para e-commerce (seed)                  |

## Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con las siguientes reglas:

- **`agency_admin`**: acceso total a todos los tenants.
- **`client_operator` / `client_viewer`**: acceso restringido únicamente a su propio tenant.
- **Widget / API pública**: el widget de consentimiento usa la **service role key** del servidor Next.js, que bypasea RLS de forma segura.

## Funciones auxiliares de RLS

- `is_agency_admin()` — verifica si el usuario actual es administrador de agencia
- `get_user_tenant_id()` — retorna el `tenant_id` del usuario actual
- `get_user_role()` — retorna el rol del usuario actual

## Trigger: Auto-creación de perfil

Al registrarse un nuevo usuario en Supabase Auth, el trigger `on_auth_user_created` crea automáticamente un registro en `user_profiles` usando los metadatos del usuario (`role`, `full_name`).

## Variables de entorno necesarias

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```
