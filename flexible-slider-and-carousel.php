<?php

/**
 * Plugin Name: Flexible Slider and Carousel
 * Plugin URI: https://github.com/your-username/flexible-slider-and-carousel
 * Description: A comprehensive WordPress plugin for creating beautiful sliders and carousels using Gutenberg blocks. Supports manual content, automatic post loading, and extensive customization options.
 * Version: 1.3.3
 * Author: webentwicklerin, Gabriele Laesser
 * Author URI: https://yoursite.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: flexible-slider-and-carousel
 * Domain Path: /languages
 * Requires at least: 6.5
 * Tested up to: 6.5
 * Requires PHP: 8.1
 * Network: false
 *
 * @package FlexibleSliderCarousel
 * @since 1.0.0
 */

// Prevent direct accessnp
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('FSC_PLUGIN_VERSION', '1.3.3');
define('FSC_PLUGIN_FILE', __FILE__);
define('FSC_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('FSC_PLUGIN_URL', plugin_dir_url(__FILE__));
define('FSC_PLUGIN_BASENAME', plugin_basename(__FILE__));
// GitHub repository (owner/repo) for auto-updates
define('FSC_GITHUB_REPO', 'gbyat/flexible-slider-and-carousel');

// Check PHP version
if (version_compare(PHP_VERSION, '8.1', '<')) {
    add_action('admin_notices', function () {
        echo '<div class="notice notice-error"><p>';
        echo sprintf(
            __('Flexible Slider and Carousel requires PHP version 8.1 or higher. You are running version %s.', 'flexible-slider-and-carousel'),
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
            __('Flexible Slider and Carousel requires WordPress version 6.5 or higher. You are running version %s.', 'flexible-slider-and-carousel'),
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
        _e('Flexible Slider and Carousel requires Gutenberg to be available.', 'flexible-slider-and-carousel');
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

        add_action('admin_init', array($this, 'check_for_updates'));
        // Auto-update hooks (mirror of custom-fields-block approach)
        add_filter('pre_set_site_transient_update_plugins', array($this, 'filter_update_plugins'));
        add_filter('plugins_api', array($this, 'plugins_api'), 10, 3);
        add_filter('upgrader_post_install', array($this, 'upgrader_post_install'), 10, 3);
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
        // Only load assets class - blocks are loaded via block.json
        require_once FSC_PLUGIN_DIR . 'includes/class-fsc-assets.php';
    }

    /**
     * Initialize plugin components
     */
    private function init_components()
    {
        // Initialize assets only
        new FSC_Assets();
    }


    /**
     * Plugin activation
     */
    public function activate()
    {
        // Flush rewrite rules only
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
     * Check for plugin updates from GitHub
     */
    public function check_for_updates()
    { /* kept for backward compat; no-op */
    }

    /**
     * Integrate with WP updates list (auto-update)
     */
    public function filter_update_plugins($transient)
    {
        if (empty($transient->checked)) {
            return $transient;
        }

        $plugin_slug = dirname(FSC_PLUGIN_BASENAME);
        $plugin_file = basename(FSC_PLUGIN_BASENAME);
        $plugin_path = $plugin_slug . '/' . $plugin_file;

        $latest = $this->get_latest_release();
        if ($latest && version_compare($latest['version'], FSC_PLUGIN_VERSION, '>')) {
            $transient->response[$plugin_path] = (object) array(
                'slug' => $plugin_slug,
                'new_version' => $latest['version'],
                'url' => 'https://github.com/' . FSC_GITHUB_REPO,
                'package' => $latest['download_url'],
                'requires' => '6.5',
                'requires_php' => '8.1',
                'tested' => '6.5',
                'last_updated' => $latest['published_at'],
                'sections' => array(
                    'description' => $latest['description'],
                    'changelog' => $latest['changelog']
                )
            );
        }

        return $transient;
    }

    /**
     * Plugin info modal
     */
    public function plugins_api($result, $action, $args)
    {
        if ($action !== 'plugin_information') {
            return $result;
        }

        $plugin_slug = dirname(FSC_PLUGIN_BASENAME);
        if (!isset($args->slug) || $args->slug !== $plugin_slug) {
            return $result;
        }

        $latest = $this->get_latest_release();
        if (!$latest) {
            return $result;
        }

        return (object) array(
            'name' => 'Flexible Slider and Carousel',
            'slug' => $plugin_slug,
            'version' => $latest['version'],
            'author' => 'webentwicklerin, Gabriele Laesser',
            'author_profile' => 'https://github.com/' . explode('/', FSC_GITHUB_REPO)[0],
            'last_updated' => $latest['published_at'],
            'requires' => '6.5',
            'requires_php' => '8.1',
            'tested' => '6.5',
            'download_link' => $latest['download_url'],
            'sections' => array(
                'description' => $latest['description'],
                'changelog' => $latest['changelog']
            )
        );
    }

    /**
     * Fetch latest GitHub release
     */
    private function get_latest_release()
    {
        $cache_key = 'fsc_latest_release';
        $cached = get_transient($cache_key);
        if ($cached !== false) {
            return $cached;
        }

        $api_url = 'https://api.github.com/repos/' . FSC_GITHUB_REPO . '/releases/latest';

        $headers = array(
            'User-Agent' => 'WordPress/' . get_bloginfo('version'),
            'Accept' => 'application/vnd.github.v3+json'
        );

        // Optional token support similar to CFB
        $token = get_option('fsc_github_token', '');
        if (!empty($token)) {
            $headers['Authorization'] = 'token ' . $token;
        }

        $response = wp_remote_get($api_url, array(
            'headers' => $headers,
            'timeout' => 15
        ));

        if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
            return false;
        }

        $release = json_decode(wp_remote_retrieve_body($response), true);
        if (!$release) return false;

        // Try to find packaged zip named after plugin folder
        $zip_name = dirname(FSC_PLUGIN_BASENAME) . '.zip';
        $download_url = '';
        if (!empty($release['assets']) && is_array($release['assets'])) {
            foreach ($release['assets'] as $asset) {
                if (isset($asset['name']) && $asset['name'] === $zip_name) {
                    $download_url = $asset['browser_download_url'];
                    break;
                }
            }
        }

        $data = array(
            'version' => ltrim($release['tag_name'], 'v'),
            'download_url' => $download_url,
            'published_at' => $release['published_at'],
            'description' => isset($release['body']) ? $release['body'] : '',
            'changelog' => isset($release['body']) ? $release['body'] : ''
        );

        set_transient($cache_key, $data, 12 * HOUR_IN_SECONDS);
        return $data;
    }

    /**
     * Post-install hook
     */
    public function upgrader_post_install($response, $hook_extra, $result)
    {
        if (isset($hook_extra['plugin']) && $hook_extra['plugin'] === FSC_PLUGIN_BASENAME) {
            delete_transient('fsc_latest_release');
        }
        return $response;
    }

    /**
     * Show update notification
     */
    public function show_update_notice()
    {
        $update_info = get_transient('fsc_update_info');
        if (!$update_info) {
            return;
        }

        echo '<div class="notice notice-warning is-dismissible">';
        echo '<p>';
        printf(
            __('<strong>Flexible Slider and Carousel</strong> version %s is available! <a href="%s" target="_blank">View details</a>', 'flexible-slider-and-carousel'),
            $update_info['version'],
            'https://github.com/your-username/flexible-slider-and-carousel/releases/latest'
        );
        echo '</p>';
        echo '</div>';
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
    load_plugin_textdomain(
        'flexible-slider-and-carousel',
        false,
        dirname(plugin_basename(__FILE__)) . '/languages'
    );
});
