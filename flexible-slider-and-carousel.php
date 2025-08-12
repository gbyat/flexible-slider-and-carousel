<?php

/**
 * Plugin Name: Flexible Slider and Carousel
 * Plugin URI: https://github.com/your-username/flexible-slider-and-carousel
 * Description: A comprehensive WordPress plugin for creating beautiful sliders and carousels using Gutenberg blocks. Supports manual content, automatic post loading, and extensive customization options.
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://yoursite.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: flexible-slider-carousel
 * Domain Path: /languages
 * Requires at least: 6.5
 * Tested up to: 6.5
 * Requires PHP: 8.1
 * Network: false
 *
 * @package FlexibleSliderCarousel
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('FSC_PLUGIN_VERSION', '1.0.0');
define('FSC_PLUGIN_FILE', __FILE__);
define('FSC_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('FSC_PLUGIN_URL', plugin_dir_url(__FILE__));
define('FSC_PLUGIN_BASENAME', plugin_basename(__FILE__));

// Check PHP version
if (version_compare(PHP_VERSION, '8.1', '<')) {
    add_action('admin_notices', function () {
        echo '<div class="notice notice-error"><p>';
        echo sprintf(
            __('Flexible Slider and Carousel requires PHP version 8.1 or higher. You are running version %s.', 'flexible-slider-carousel'),
            PHP_VERSION
        );
        echo '</p></div>';
    });
    return;
}

// Check WordPress version
if (version_compare(get_bloginfo('version'), '6.5', '<')) {
    add_action('admin_notices', function () {
        echo '<div class="notice notice-error"><p>';
        echo sprintf(
            __('Flexible Slider and Carousel requires WordPress version 6.5 or higher. You are running version %s.', 'flexible-slider-carousel'),
            get_bloginfo('version')
        );
        echo '</p></div>';
    });
    return;
}

// Check if Gutenberg is available
if (!function_exists('register_block_type')) {
    add_action('admin_notices', function () {
        echo '<div class="notice notice-error"><p>';
        _e('Flexible Slider and Carousel requires Gutenberg to be available.', 'flexible-slider-carousel');
        echo '</p></div>';
    });
    return;
}

/**
 * Main plugin class
 */
class FlexibleSliderCarousel
{

    /**
     * Plugin instance
     */
    private static $instance = null;

    /**
     * Get plugin instance
     */
    public static function get_instance()
    {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct()
    {
        $this->init_hooks();
    }

    /**
     * Initialize hooks
     */
    private function init_hooks()
    {
        add_action('init', array($this, 'init'));
        add_action('plugins_loaded', array($this, 'load_textdomain'));
        // Entferne doppelte Hook-Registrierung - wird bereits in FSC_Block_Registry gemacht
        // add_action('init', array($this, 'register_blocks'));
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }

    /**
     * Initialize plugin
     */
    public function init()
    {
        try {
            // Load dependencies
            $this->load_dependencies();

            // Initialize components
            $this->init_components();

            // Blocks werden jetzt direkt in init_components registriert
            // $this->register_blocks();
        } catch (Exception $e) {
            add_action('admin_notices', function () use ($e) {
                echo '<div class="notice notice-error"><p>';
                echo '<strong>Flexible Slider & Carousel Error:</strong> ' . esc_html($e->getMessage());
                echo '</p></div>';
            });
        }
    }

    /**
     * Load plugin dependencies
     */
    private function load_dependencies()
    {
        // Core classes
        require_once FSC_PLUGIN_DIR . 'includes/class-fsc-admin.php';
        require_once FSC_PLUGIN_DIR . 'includes/class-fsc-assets.php';
        require_once FSC_PLUGIN_DIR . 'includes/class-fsc-post-loader.php';
        require_once FSC_PLUGIN_DIR . 'includes/class-fsc-theme-integration.php';
        require_once FSC_PLUGIN_DIR . 'includes/class-fsc-utilities.php';

        // Block classes werden über block.json automatisch geladen
    }

    /**
     * Initialize plugin components
     */
    private function init_components()
    {
        // Initialize admin
        if (is_admin()) {
            new FSC_Admin();
        }

        // Initialize assets
        new FSC_Assets();

        // Initialize theme integration
        new FSC_Theme_Integration();
    }

    /**
     * Load text domain
     */
    public function load_textdomain()
    {
        load_plugin_textdomain(
            'flexible-slider-carousel',
            false,
            dirname(plugin_basename(__FILE__)) . '/languages'
        );
    }

    /**
     * Plugin activation
     */
    public function activate()
    {
        // Create database tables if needed
        $this->create_tables();

        // Set default options
        $this->set_default_options();

        // Flush rewrite rules
        flush_rewrite_rules();
    }

    /**
     * Plugin deactivation
     */
    public function deactivate()
    {
        // Flush rewrite rules
        flush_rewrite_rules();
    }

    /**
     * Create database tables
     */
    private function create_tables()
    {
        global $wpdb;

        $charset_collate = $wpdb->get_charset_collate();

        // Table for slider statistics
        $table_name = $wpdb->prefix . 'fsc_slider_stats';

        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            slider_id varchar(255) NOT NULL,
            post_id bigint(20) NOT NULL,
            views int(11) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY slider_id (slider_id),
            KEY post_id (post_id)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    /**
     * Set default plugin options
     */
    private function set_default_options()
    {
        $defaults = array(
            'fsc_default_colors' => array(
                'navigation_normal' => '#333333',
                'navigation_hover' => '#666666',
                'navigation_inactive' => '#cccccc',
                'navigation_hidden' => 'transparent'
            ),
            'fsc_default_layout' => array(
                'desktop' => array(
                    'padding' => 20,
                    'margin' => 0
                ),
                'tablet' => array(
                    'padding' => 15,
                    'margin' => 0
                ),
                'phone' => array(
                    'padding' => 10,
                    'margin' => 0
                )
            ),
            'fsc_default_loading' => 'eager',
            'fsc_default_breakpoints' => array(
                'desktop' => 1024,
                'tablet' => 768,
                'phone' => 480
            ),
            'fsc_default_animations' => array(
                'transition' => 'slide',
                'speed' => 500,
                'easing' => 'ease-in-out'
            )
        );

        foreach ($defaults as $option => $value) {
            if (get_option($option) === false) {
                add_option($option, $value);
            }
        }
    }
}

// Initialize plugin
$flexible_slider_carousel = FlexibleSliderCarousel::get_instance();

// Activation/deactivation hooks
register_activation_hook(__FILE__, array($flexible_slider_carousel, 'activate'));
register_deactivation_hook(__FILE__, array($flexible_slider_carousel, 'deactivate'));


// Register blocks directly
add_action('init', function () {
    // Check if directories exist
    register_block_type(FSC_PLUGIN_DIR . 'blocks/slider');
    register_block_type(FSC_PLUGIN_DIR . 'blocks/frame');
});
