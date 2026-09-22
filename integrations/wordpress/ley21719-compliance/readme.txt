=== Cumplimiento Ley 21.719 — Protección de Datos ===
Contributors: tuagencia
Tags: ley 21719, proteccion de datos, gdpr, chile, cookies, arsop, woocommerce
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 8.0
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Cumplimiento integral de la Ley N° 21.719 de Protección de Datos Personales de Chile para tiendas WordPress y WooCommerce.

== Description ==

Este plugin conecta tu sitio web o tienda WooCommerce con la plataforma centralizada de cumplimiento de la **Ley 21.719** de Chile.

Permite:
* Inyectar automáticamente el banner de consentimiento de cookies (CMP) con categorías (Esenciales, Analítica, Marketing).
* Integrar el formulario interactivo para que los clientes ejerzan sus derechos **ARSOP+** (Acceso, Rectificación, Supresión, Oposición, Portabilidad y Bloqueo) mediante el shortcode `[arsop_form]`.
* Publicar la política de privacidad estandarizada mediante el shortcode `[politica_privacidad]`.
* Mantener la trazabilidad del consentimiento conforme a las exigencias de la Agencia de Protección de Datos Personales (APDP).

== Installation ==

1. Sube la carpeta `ley21719-compliance` al directorio `/wp-content/plugins/` de tu servidor o sube el archivo `.zip` desde tu panel de WordPress.
2. Activa el plugin desde el menú 'Plugins' en WordPress.
3. Ve a **Ajustes > Ley 21.719** e ingresa el **Tenant ID** proporcionado para tu tienda en el panel de administración.
4. Guarda los cambios. El banner de cookies comenzará a mostrarse automáticamente.

== Shortcodes ==

* `[arsop_form]` — Inserta el formulario de solicitud de derechos de los titulares.
* `[politica_privacidad]` — Muestra la política de privacidad actualizada en tiempo real desde la plataforma.

== Changelog ==

= 1.0.0 =
* Versión inicial de lanzamiento con soporte para Ley 21.719, WooCommerce y consentimiento granular.
