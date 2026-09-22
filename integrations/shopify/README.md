# Integración con Shopify

> Cumplimiento **Ley 21.719** de Protección de Datos Personales de Chile.
> El widget JS se carga una sola vez en tu tienda y habilita automáticamente el banner de cookies y el formulario ARSOP+.

---

## Opción 1: Via `theme.liquid` (recomendado)

Esta es la forma más sencilla y robusta de instalar el widget.

1. Ve a tu panel de Shopify → **Online Store → Themes**
2. Haz clic en **"Edit code"** en tu tema activo
3. Abre el archivo **`layout/theme.liquid`**
4. Antes del cierre `</head>`, agrega el siguiente fragmento:

```html
<!-- Cumplimiento Ley 21.719 — inicio -->
<script
  src="https://privacy.tudominio.com/widget.js"
  data-tenant="TU-TENANT-ID"
  data-api="https://privacy.tudominio.com"
  data-color="#2563eb"
  data-privacy-url="{{ routes.root_url }}pages/politica-de-privacidad"
  data-name="{{ shop.name | escape }}">
</script>
<!-- Cumplimiento Ley 21.719 — fin -->
```

> **Reemplaza** `TU-TENANT-ID` con el slug de tu tienda (lo encuentras en el panel de administración del sistema).

---

## Opción 2: Via Shopify Script Tags API (headless / sin acceso al theme)

Útil si gestionas la tienda de forma programática o si usas un storefront headless.

```bash
curl -X POST \
  "https://TU-TIENDA.myshopify.com/admin/api/2024-01/script_tags.json" \
  -H "X-Shopify-Access-Token: TU-ACCESS-TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "script_tag": {
      "event": "onload",
      "src": "https://privacy.tudominio.com/widget.js"
    }
  }'
```

> **Nota:** La API Script Tags no permite añadir atributos `data-*` al tag.
> Por eso debes inyectar la configuración antes del widget usando un segundo script tag o la variable global:

```bash
# Primero inyecta la configuración
curl -X POST \
  "https://TU-TIENDA.myshopify.com/admin/api/2024-01/script_tags.json" \
  -H "X-Shopify-Access-Token: TU-ACCESS-TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "script_tag": {
      "event": "onload",
      "src": "https://privacy.tudominio.com/config/TU-TENANT-ID.js"
    }
  }'
```

O bien, agrega este bloque en tu `theme.liquid` antes del widget:

```html
<script>
  window.LEY21719_CONFIG = {
    tenant:     "TU-TENANT-ID",
    api:        "https://privacy.tudominio.com",
    color:      "#2563eb",
    privacyUrl: "{{ routes.root_url }}pages/politica-de-privacidad",
    name:       {{ shop.name | json }}
  };
</script>
```

---

## Formulario ARSOP+ en Shopify

El formulario de ejercicio de derechos (Acceso, Rectificación, Supresión, Oposición, Portabilidad, Bloqueo) se inyecta automáticamente en cualquier elemento con `id="ley21719-rights-form"`.

### Pasos

1. En tu panel de Shopify, ve a **Online Store → Pages → Add page**
2. Asigna el título: **"Mis derechos de datos personales"** (o similar)
3. Cambia el editor a modo **HTML** (`<>`) e inserta:

```html
<div id="ley21719-rights-form"></div>
```

4. Publica la página.
5. El widget detecta el `div` en cada carga y renderiza el formulario completo con validación y envío al sistema.

---

## Política de Privacidad

### Opción A — Página Shopify con contenido del sistema

Crea una página en `/pages/politica-de-privacidad` con el siguiente HTML:

```html
<div id="ley21719-policy"></div>
```

> **Nota:** El soporte de renderizado de políticas en el cliente (div `#ley21719-policy`) puede requerir configuración adicional en el sistema. Consulta la documentación de la API.

### Opción B — Iframe del endpoint público

```html
<iframe
  src="https://privacy.tudominio.com/api/policy/TU-TENANT-ID/embed"
  width="100%"
  height="800"
  frameborder="0"
  style="border:none;">
</iframe>
```

### Opción C — Endpoint JSON directo

Consume la política programáticamente:

```
GET https://privacy.tudominio.com/api/policy/TU-TENANT-ID
```

Respuesta:
```json
{
  "tenant_slug": "TU-TENANT-ID",
  "version": "1.0",
  "updated_at": "2026-09-01T00:00:00Z",
  "content_html": "<h1>Política de Privacidad</h1>..."
}
```

---

## Verificación de la instalación

Abre la consola de tu tienda (F12) y ejecuta:

```javascript
// ¿El widget cargó correctamente?
console.log(window.LEY21719);

// ¿Hay consentimiento guardado?
console.log(window.LEY21719.getConsent());

// Reabrir el banner manualmente
window.LEY21719.showBanner();

// Revocar consentimiento (para pruebas)
window.LEY21719.withdraw();
```

---

## Integración con Google Tag Manager

El widget dispara automáticamente eventos al `dataLayer` de GTM:

| Evento | Cuándo |
|--------|--------|
| `ley21719_consent_update` | Al aceptar, rechazar o cambiar preferencias |

Variables disponibles en el evento:
- `consent_analytics` — `true` / `false`
- `consent_marketing` — `true` / `false`
- `consent_personalization` — `true` / `false`

Configura tus tags de GA4, Meta Pixel, etc. con las **condiciones de activación** basadas en estos valores.

---

## Soporte

¿Problemas con la integración? Contacta a tu agencia o abre un issue en el repositorio del sistema.
