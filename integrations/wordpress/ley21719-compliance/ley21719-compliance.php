<?php
/**
 * Plugin Name: Cumplimiento Ley 21.719 — Protección de Datos
 * Plugin URI:  https://github.com/tuagencia/sist-protec-datos
 * Description: Integra el sistema de cumplimiento de la Ley 21.719 de Protección de Datos Personales en tu sitio WordPress / WooCommerce. Instala el banner de cookies, el formulario ARSOP+ y enlaza la política de privacidad.
 * Version:     1.0.0
 * Author:      Tu Agencia
 * Author URI:  https://tuagencia.cl
 * License:     GPL-2.0+
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: ley21719
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP:      8.0
 *
 * @package Ley21719
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

define( 'LEY21719_VERSION',    '1.0.0' );
define( 'LEY21719_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'LEY21719_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// ============================================================================
// ENQUEUE WIDGET SCRIPT
// ============================================================================

add_action( 'wp_enqueue_scripts', 'ley21719_enqueue_widget' );

/**
 * Loads the remote widget.js and injects tenant configuration as an inline
 * script that runs *before* the widget, exposing window.LEY21719_CONFIG.
 *
 * We also attempt to stamp data attributes onto the script tag via a second
 * inline snippet for maximum compatibility with widget bootstrap strategies.
 */
function ley21719_enqueue_widget(): void {
    $tenant_slug     = get_option( 'ley21719_tenant_slug', '' );
    $api_url         = get_option( 'ley21719_api_url', 'https://privacy.tudominio.com' );
    $color           = get_option( 'ley21719_color', '#2563eb' );
    $privacy_page_id = (int) get_option( 'ley21719_privacy_page_id', 0 );

    // Do nothing if not configured.
    if ( empty( $tenant_slug ) ) {
        return;
    }

    $privacy_url = $privacy_page_id
        ? (string) get_permalink( $privacy_page_id )
        : '#politica-privacidad';

    $site_name = get_bloginfo( 'name' );
    $api_base  = rtrim( $api_url, '/' );

    wp_enqueue_script(
        'ley21719-widget',
        trailingslashit( $api_url ) . 'widget.js',
        [],          // no WP dependencies
        LEY21719_VERSION,
        false        // load in <head> so the banner appears before page paint
    );

    /*
     * Inject configuration as window.LEY21719_CONFIG BEFORE the widget loads.
     * The widget reads this object as a fallback when data attributes are
     * unavailable (e.g. when the script is enqueued by WordPress rather than
     * written inline with attributes).
     */
    wp_add_inline_script(
        'ley21719-widget',
        sprintf(
            'window.LEY21719_CONFIG = { tenant: %s, api: %s, color: %s, privacyUrl: %s, name: %s };',
            wp_json_encode( $tenant_slug ),
            wp_json_encode( $api_base ),
            wp_json_encode( $color ),
            wp_json_encode( $privacy_url ),
            wp_json_encode( $site_name )
        ),
        'before'
    );
}

// ============================================================================
// SHORTCODES
// ============================================================================

// [arsop_form] — Renders the ARSOP+ rights request form.
add_shortcode( 'arsop_form', 'ley21719_arsop_form_shortcode' );

/**
 * @param array<string,string>|string $atts Shortcode attributes.
 * @return string HTML output.
 */
function ley21719_arsop_form_shortcode( $atts ): string {
    $atts = shortcode_atts( [ 'class' => '' ], $atts, 'arsop_form' );

    return sprintf(
        '<div id="ley21719-rights-form" class="%s" data-ley21719-rights="true"></div>',
        esc_attr( (string) $atts['class'] )
    );
}

// [politica_privacidad] — Fetches and renders the live privacy policy HTML.
add_shortcode( 'politica_privacidad', 'ley21719_policy_shortcode' );

/**
 * @param array<string,string>|string $atts Shortcode attributes (unused).
 * @return string HTML output.
 */
function ley21719_policy_shortcode( $atts ): string {
    $api_url     = get_option( 'ley21719_api_url', '' );
    $tenant_slug = get_option( 'ley21719_tenant_slug', '' );

    if ( empty( $api_url ) || empty( $tenant_slug ) ) {
        return '<p><em>' . esc_html__( 'Política de privacidad no configurada.', 'ley21719' ) . '</em></p>';
    }

    $url       = trailingslashit( $api_url ) . 'api/policy/' . rawurlencode( $tenant_slug );
    $cache_key = 'ley21719_policy_' . md5( $tenant_slug );
    $cached    = get_transient( $cache_key );

    if ( false !== $cached ) {
        return (string) $cached;
    }

    $response = wp_remote_get( $url, [ 'timeout' => 10 ] );

    if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
        return '<p>' . esc_html__( 'No se pudo cargar la política de privacidad. Por favor intenta más tarde.', 'ley21719' ) . '</p>';
    }

    $body = wp_remote_retrieve_body( $response );
    $data = json_decode( $body, true );

    if ( empty( $data['content_html'] ) ) {
        return '<p>' . esc_html__( 'Política de privacidad no encontrada.', 'ley21719' ) . '</p>';
    }

    $html = '<div class="ley21719-policy-content">' . wp_kses_post( (string) $data['content_html'] ) . '</div>';

    // Cache for 1 hour to avoid hammering the remote API.
    set_transient( $cache_key, $html, HOUR_IN_SECONDS );

    return $html;
}

// ============================================================================
// ADMIN SETTINGS PAGE
// ============================================================================

add_action( 'admin_menu', 'ley21719_add_settings_page' );

function ley21719_add_settings_page(): void {
    add_options_page(
        __( 'Ley 21.719 — Cumplimiento', 'ley21719' ),
        __( 'Ley 21.719', 'ley21719' ),
        'manage_options',
        'ley21719-settings',
        'ley21719_render_settings_page'
    );
}

add_action( 'admin_init', 'ley21719_register_settings' );

function ley21719_register_settings(): void {
    register_setting( 'ley21719_settings', 'ley21719_tenant_slug', [
        'type'              => 'string',
        'sanitize_callback' => 'sanitize_text_field',
        'default'           => '',
    ] );

    register_setting( 'ley21719_settings', 'ley21719_api_url', [
        'type'              => 'string',
        'sanitize_callback' => 'esc_url_raw',
        'default'           => 'https://privacy.tudominio.com',
    ] );

    register_setting( 'ley21719_settings', 'ley21719_color', [
        'type'              => 'string',
        'sanitize_callback' => 'sanitize_hex_color',
        'default'           => '#2563eb',
    ] );

    register_setting( 'ley21719_settings', 'ley21719_privacy_page_id', [
        'type'              => 'integer',
        'sanitize_callback' => 'absint',
        'default'           => 0,
    ] );
}

function ley21719_render_settings_page(): void {
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }

    $tenant_slug     = get_option( 'ley21719_tenant_slug', '' );
    $api_url         = get_option( 'ley21719_api_url', 'https://privacy.tudominio.com' );
    $color           = get_option( 'ley21719_color', '#2563eb' );
    $privacy_page_id = (int) get_option( 'ley21719_privacy_page_id', 0 );
    ?>
    <div class="wrap">

        <h1 style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:24px;">🛡️</span>
            <?php esc_html_e( 'Ley 21.719 — Cumplimiento Protección de Datos', 'ley21719' ); ?>
        </h1>

        <?php if ( empty( $tenant_slug ) ) : ?>
        <div class="notice notice-warning is-dismissible">
            <p>
                <strong><?php esc_html_e( 'Configuración incompleta:', 'ley21719' ); ?></strong>
                <?php esc_html_e( 'Ingresa tu Tenant ID para activar el sistema de cumplimiento.', 'ley21719' ); ?>
            </p>
        </div>
        <?php endif; ?>

        <!-- Info banner -->
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px 20px;margin:16px 0;max-width:720px;">
            <strong style="color:#1e40af;">
                ℹ️ <?php esc_html_e( 'La Ley 21.719 entra en vigencia el 1 de diciembre de 2026.', 'ley21719' ); ?>
            </strong>
            <p style="margin:8px 0 0;color:#1e3a8a;font-size:13px;">
                <?php esc_html_e( 'Este plugin integra el banner de consentimiento de cookies, el formulario de derechos ARSOP+ y la política de privacidad en tu tienda.', 'ley21719' ); ?>
            </p>
        </div>

        <!-- Settings form -->
        <form method="post" action="options.php" style="max-width:720px;margin-top:24px;">
            <?php settings_fields( 'ley21719_settings' ); ?>

            <table class="form-table" role="presentation">

                <!-- Tenant ID -->
                <tr>
                    <th scope="row">
                        <label for="ley21719_tenant_slug">
                            <?php esc_html_e( 'Tenant ID', 'ley21719' ); ?>
                            <span style="color:#dc2626;" aria-hidden="true">*</span>
                        </label>
                    </th>
                    <td>
                        <input
                            type="text"
                            id="ley21719_tenant_slug"
                            name="ley21719_tenant_slug"
                            value="<?php echo esc_attr( (string) $tenant_slug ); ?>"
                            class="regular-text"
                            placeholder="mi-tienda-cl"
                            required
                        />
                        <p class="description">
                            <?php esc_html_e( 'El identificador único de tu tienda. Lo encuentras en el panel de administración del sistema.', 'ley21719' ); ?>
                        </p>
                    </td>
                </tr>

                <!-- API URL -->
                <tr>
                    <th scope="row">
                        <label for="ley21719_api_url">
                            <?php esc_html_e( 'URL del sistema', 'ley21719' ); ?>
                        </label>
                    </th>
                    <td>
                        <input
                            type="url"
                            id="ley21719_api_url"
                            name="ley21719_api_url"
                            value="<?php echo esc_attr( (string) $api_url ); ?>"
                            class="regular-text"
                            placeholder="https://privacy.tudominio.com"
                        />
                        <p class="description">
                            <?php esc_html_e( 'URL base del sistema de cumplimiento (sin barra al final).', 'ley21719' ); ?>
                        </p>
                    </td>
                </tr>

                <!-- Primary color -->
                <tr>
                    <th scope="row">
                        <label for="ley21719_color">
                            <?php esc_html_e( 'Color principal del banner', 'ley21719' ); ?>
                        </label>
                    </th>
                    <td>
                        <input
                            type="color"
                            id="ley21719_color"
                            name="ley21719_color"
                            value="<?php echo esc_attr( (string) $color ); ?>"
                        />
                        <span style="margin-left:8px;font-size:13px;color:#6b7280;">
                            <?php esc_html_e( 'Color para los botones del banner de cookies', 'ley21719' ); ?>
                        </span>
                    </td>
                </tr>

                <!-- Privacy policy page -->
                <tr>
                    <th scope="row">
                        <label for="ley21719_privacy_page_id">
                            <?php esc_html_e( 'Página de Política de Privacidad', 'ley21719' ); ?>
                        </label>
                    </th>
                    <td>
                        <?php
                        wp_dropdown_pages( [
                            'name'              => 'ley21719_privacy_page_id',
                            'id'                => 'ley21719_privacy_page_id',
                            'selected'          => $privacy_page_id,
                            'show_option_none'  => '— ' . __( 'Seleccionar página', 'ley21719' ) . ' —',
                            'option_none_value' => '0',
                        ] );
                        ?>
                        <p class="description">
                            <?php esc_html_e( 'Selecciona la página donde está o estará tu política de privacidad.', 'ley21719' ); ?>
                        </p>
                    </td>
                </tr>

            </table>

            <?php submit_button( __( 'Guardar configuración', 'ley21719' ) ); ?>
        </form>

        <!-- Shortcodes & script tag reference (only when configured) -->
        <?php if ( ! empty( $tenant_slug ) ) : ?>
        <div style="margin-top:32px;padding:20px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;max-width:720px;">

            <h3 style="margin:0 0 12px;">📋 <?php esc_html_e( 'Shortcodes disponibles', 'ley21719' ); ?></h3>
            <p style="margin:0 0 6px;font-size:13px;">
                <code>[arsop_form]</code> —
                <?php esc_html_e( 'Inserta el formulario de derechos ARSOP+ en cualquier página.', 'ley21719' ); ?>
            </p>
            <p style="margin:0 0 6px;font-size:13px;">
                <code>[politica_privacidad]</code> —
                <?php esc_html_e( 'Carga automáticamente la política de privacidad vigente desde el sistema.', 'ley21719' ); ?>
            </p>

            <h3 style="margin:20px 0 12px;">🔧 <?php esc_html_e( 'Script tag manual (instalación sin plugin)', 'ley21719' ); ?></h3>
            <code style="display:block;background:#1e293b;color:#e2e8f0;padding:12px 16px;border-radius:6px;font-size:12px;white-space:pre-wrap;word-break:break-all;">&lt;script
  src="<?php echo esc_url( trailingslashit( $api_url ) ); ?>widget.js"
  data-tenant="<?php echo esc_attr( (string) $tenant_slug ); ?>"
  data-api="<?php echo esc_attr( rtrim( (string) $api_url, '/' ) ); ?>"
  data-color="<?php echo esc_attr( (string) $color ); ?>"&gt;
&lt;/script&gt;</code>

        </div>
        <?php endif; ?>

    </div>
    <?php
}

// ============================================================================
// ADMIN NOTICE — PROMPTS TO CONFIGURE WHEN TENANT ID IS MISSING
// ============================================================================

add_action( 'admin_notices', 'ley21719_admin_notice' );

function ley21719_admin_notice(): void {
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }

    // Don't show on the plugin's own settings page.
    $screen = get_current_screen();
    if ( $screen && 'settings_page_ley21719-settings' === $screen->id ) {
        return;
    }

    $tenant_slug = get_option( 'ley21719_tenant_slug', '' );

    if ( ! empty( $tenant_slug ) ) {
        return;
    }
    ?>
    <div class="notice notice-info" style="border-left-color:#2563eb;">
        <p>
            🛡️
            <strong><?php esc_html_e( 'Ley 21.719:', 'ley21719' ); ?></strong>
            <?php esc_html_e( 'El plugin de cumplimiento está instalado pero no configurado.', 'ley21719' ); ?>
            <a href="<?php echo esc_url( admin_url( 'options-general.php?page=ley21719-settings' ) ); ?>">
                <?php esc_html_e( 'Configura tu Tenant ID aquí →', 'ley21719' ); ?>
            </a>
        </p>
    </div>
    <?php
}

// ============================================================================
// WOOCOMMERCE INTEGRATION
// ============================================================================

/**
 * Appends a Ley 21.719 paragraph to WooCommerce's built-in privacy policy
 * content suggestion, visible in the WC privacy settings tab.
 */
add_action( 'woocommerce_privacy_policy_content', 'ley21719_wc_privacy_content' );

function ley21719_wc_privacy_content(): void {
    $privacy_page_id = (int) get_option( 'ley21719_privacy_page_id', 0 );
    $privacy_url     = $privacy_page_id
        ? (string) get_permalink( $privacy_page_id )
        : '#politica-privacidad';

    echo '<p>' .
        esc_html__( 'Esta tienda cumple con la Ley 21.719 de Protección de Datos Personales de Chile. ', 'ley21719' ) .
        esc_html__( 'Puedes ejercer tus derechos ARSOP+ a través del formulario disponible en nuestra ', 'ley21719' ) .
        '<a href="' . esc_url( $privacy_url ) . '">' .
        esc_html__( 'política de privacidad', 'ley21719' ) .
        '</a>.</p>';
}

/**
 * Hooks into the WooCommerce tracker data filter.
 *
 * Note: `woocommerce_tracker_data` controls *server-side* usage tracking
 * sent to WooCommerce.com, which is separate from browser cookie consent.
 * Cookie consent is handled entirely client-side by the JS widget.
 * This hook is a placeholder for future server-side data governance rules.
 *
 * @param array<string,mixed> $data
 * @return array<string,mixed>
 */
add_filter( 'woocommerce_tracker_data', 'ley21719_maybe_block_wc_tracking', 10, 1 );

function ley21719_maybe_block_wc_tracking( array $data ): array {
    // Currently a pass-through. Extend here to redact PII before tracking.
    return $data;
}

// ============================================================================
// PLUGIN ACTIVATION / DEACTIVATION HOOKS
// ============================================================================

register_activation_hook( __FILE__, 'ley21719_on_activate' );

function ley21719_on_activate(): void {
    // Set sensible defaults on first install.
    if ( false === get_option( 'ley21719_api_url' ) ) {
        add_option( 'ley21719_api_url', 'https://privacy.tudominio.com' );
    }
    if ( false === get_option( 'ley21719_color' ) ) {
        add_option( 'ley21719_color', '#2563eb' );
    }
}

register_deactivation_hook( __FILE__, 'ley21719_on_deactivate' );

function ley21719_on_deactivate(): void {
    // Clear cached privacy policy transients.
    $tenant_slug = get_option( 'ley21719_tenant_slug', '' );
    if ( $tenant_slug ) {
        delete_transient( 'ley21719_policy_' . md5( (string) $tenant_slug ) );
    }
}
