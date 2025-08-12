<?php

/**
 * Admin Class
 *
 * Handles WordPress admin interface, settings page, and slider management.
 *
 * @package FlexibleSliderCarousel
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * FSC_Admin class
 */
class FSC_Admin
{

    /**
     * Constructor
     */
    public function __construct()
    {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'init_settings'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_action('wp_ajax_fsc_save_slider_settings', array($this, 'save_slider_settings'));
        add_action('wp_ajax_fsc_get_slider_overview', array($this, 'get_slider_overview'));
        add_action('wp_ajax_fsc_export_slider_config', array($this, 'export_slider_config'));
        add_action('wp_ajax_fsc_import_slider_config', array($this, 'import_slider_config'));
        add_action('wp_ajax_fsc_optimize_all_sliders', array($this, 'optimize_all_sliders'));
    }

    /**
     * Add admin menu
     */
    public function add_admin_menu()
    {
        add_menu_page(
            __('Flexible Slider & Carousel', 'flexible-slider-carousel'),
            __('Slider & Carousel', 'flexible-slider-carousel'),
            'manage_options',
            'flexible-slider-carousel',
            array($this, 'admin_page'),
            'dashicons-slides',
            30
        );

        add_submenu_page(
            'flexible-slider-carousel',
            __('Settings', 'flexible-slider-carousel'),
            __('Settings', 'flexible-slider-carousel'),
            'manage_options',
            'flexible-slider-carousel',
            array($this, 'admin_page')
        );

        add_submenu_page(
            'flexible-slider-carousel',
            __('Slider Overview', 'flexible-slider-carousel'),
            __('Slider Overview', 'flexible-slider-carousel'),
            'manage_options',
            'fsc-slider-overview',
            array($this, 'slider_overview_page')
        );

        add_submenu_page(
            'flexible-slider-carousel',
            __('Import/Export', 'flexible-slider-carousel'),
            __('Import/Export', 'flexible-slider-carousel'),
            'manage_options',
            'fsc-import-export',
            array($this, 'import_export_page')
        );
    }

    /**
     * Initialize settings
     */
    public function init_settings()
    {
        // Register settings
        register_setting('fsc_settings', 'fsc_default_colors');
        register_setting('fsc_settings', 'fsc_default_layout');
        register_setting('fsc_settings', 'fsc_default_loading');
        register_setting('fsc_settings', 'fsc_default_breakpoints');
        register_setting('fsc_settings', 'fsc_default_animations');

        // Add settings sections
        add_settings_section(
            'fsc_colors_section',
            __('Default Colors', 'flexible-slider-carousel'),
            array($this, 'colors_section_callback'),
            'fsc_settings'
        );

        add_settings_section(
            'fsc_layout_section',
            __('Default Layout', 'flexible-slider-carousel'),
            array($this, 'layout_section_callback'),
            'fsc_settings'
        );

        add_settings_section(
            'fsc_breakpoints_section',
            __('Default Breakpoints', 'flexible-slider-carousel'),
            array($this, 'breakpoints_section_callback'),
            'fsc_settings'
        );

        add_settings_section(
            'fsc_animations_section',
            __('Default Animations', 'flexible-slider-carousel'),
            array($this, 'animations_section_callback'),
            'fsc_settings'
        );

        // Add settings fields
        $this->add_settings_fields();
    }

    /**
     * Add settings fields
     */
    private function add_settings_fields()
    {
        // Colors fields
        add_settings_field(
            'fsc_navigation_normal',
            __('Navigation Normal Color', 'flexible-slider-carousel'),
            array($this, 'color_field_callback'),
            'fsc_settings',
            'fsc_colors_section',
            array('field' => 'navigation_normal')
        );

        add_settings_field(
            'fsc_navigation_hover',
            __('Navigation Hover Color', 'flexible-slider-carousel'),
            array($this, 'color_field_callback'),
            'fsc_settings',
            'fsc_colors_section',
            array('field' => 'navigation_hover')
        );

        add_settings_field(
            'fsc_navigation_inactive',
            __('Navigation Inactive Color', 'flexible-slider-carousel'),
            array($this, 'color_field_callback'),
            'fsc_settings',
            'fsc_colors_section',
            array('field' => 'navigation_inactive')
        );

        add_settings_field(
            'fsc_navigation_hidden',
            __('Navigation Hidden Color', 'flexible-slider-carousel'),
            array($this, 'color_field_callback'),
            'fsc_settings',
            'fsc_colors_section',
            array('field' => 'navigation_hidden')
        );

        // Layout fields
        $breakpoints = array('desktop', 'tablet', 'phone');
        foreach ($breakpoints as $breakpoint) {
            add_settings_field(
                'fsc_' . $breakpoint . '_padding',
                sprintf(__('%s Padding (px)', 'flexible-slider-carousel'), ucfirst($breakpoint)),
                array($this, 'number_field_callback'),
                'fsc_settings',
                'fsc_layout_section',
                array('field' => $breakpoint . '_padding')
            );

            add_settings_field(
                'fsc_' . $breakpoint . '_margin',
                sprintf(__('%s Margin (px)', 'flexible-slider-carousel'), ucfirst($breakpoint)),
                array($this, 'number_field_callback'),
                'fsc_settings',
                'fsc_layout_section',
                array('field' => $breakpoint . '_margin')
            );
        }

        // Breakpoints fields
        add_settings_field(
            'fsc_desktop_breakpoint',
            __('Desktop Breakpoint (px)', 'flexible-slider-carousel'),
            array($this, 'number_field_callback'),
            'fsc_settings',
            'fsc_breakpoints_section',
            array('field' => 'desktop_breakpoint')
        );

        add_settings_field(
            'fsc_tablet_breakpoint',
            __('Tablet Breakpoint (px)', 'flexible-slider-carousel'),
            array($this, 'number_field_callback'),
            'fsc_settings',
            'fsc_breakpoints_section',
            array('field' => 'tablet_breakpoint')
        );

        add_settings_field(
            'fsc_phone_breakpoint',
            __('Phone Breakpoint (px)', 'flexible-slider-carousel'),
            array($this, 'number_field_callback'),
            'fsc_settings',
            'fsc_breakpoints_section',
            array('field' => 'phone_breakpoint')
        );

        // Animations fields
        add_settings_field(
            'fsc_default_transition',
            __('Default Transition', 'flexible-slider-carousel'),
            array($this, 'select_field_callback'),
            'fsc_settings',
            'fsc_animations_section',
            array(
                'field' => 'default_transition',
                'options' => array(
                    'slide' => __('Slide', 'flexible-slider-carousel'),
                    'fade' => __('Fade', 'flexible-slider-carousel')
                )
            )
        );

        add_settings_field(
            'fsc_default_speed',
            __('Default Speed (ms)', 'flexible-slider-carousel'),
            array($this, 'number_field_callback'),
            'fsc_settings',
            'fsc_animations_section',
            array('field' => 'default_speed')
        );

        add_settings_field(
            'fsc_default_easing',
            __('Default Easing', 'flexible-slider-carousel'),
            array($this, 'select_field_callback'),
            'fsc_settings',
            'fsc_animations_section',
            array(
                'field' => 'default_easing',
                'options' => array(
                    'ease-in-out' => __('Ease In Out', 'flexible-slider-carousel'),
                    'ease-in' => __('Ease In', 'flexible-slider-carousel'),
                    'ease-out' => __('Ease Out', 'flexible-slider-carousel'),
                    'linear' => __('Linear', 'flexible-slider-carousel')
                )
            )
        );
    }

    /**
     * Admin page callback
     */
    public function admin_page()
    {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'flexible-slider-carousel'));
        }

        // Color Picker wird bereits in der Assets-Klasse geladen
?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>

            <form method="post" action="options.php">
                <?php
                settings_fields('fsc_settings');
                do_settings_sections('fsc_settings');
                submit_button();
                ?>
            </form>

            <div class="fsc-admin-info">
                <h2><?php _e('Quick Start Guide', 'flexible-slider-carousel'); ?></h2>
                <p><?php _e('To create a slider or carousel:', 'flexible-slider-carousel'); ?></p>
                <ol>
                    <li><?php _e('Go to any page or post editor', 'flexible-slider-carousel'); ?></li>
                    <li><?php _e('Add a new block and search for "Slider" or "Carousel"', 'flexible-slider-carousel'); ?></li>
                    <li><?php _e('Configure your slider settings in the block sidebar', 'flexible-slider-carousel'); ?></li>
                    <li><?php _e('Build your slider by adding Frame blocks inside', 'flexible-slider-carousel'); ?></li>
                </ol>
            </div>
        </div>

        <script type="text/javascript">
            jQuery(document).ready(function($) {
                // Initialize WordPress color picker
                $('.fsc-color-picker').wpColorPicker();
            });
        </script>
    <?php
    }

    /**
     * Slider overview page
     */
    public function slider_overview_page()
    {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'flexible-slider-carousel'));
        }

        $sliders = $this->get_all_sliders();
    ?>
        <div class="wrap">
            <h1><?php _e('Slider Overview', 'flexible-slider-carousel'); ?></h1>

            <div class="fsc-overview-stats">
                <div class="fsc-stat-box">
                    <h3><?php _e('Total Sliders', 'flexible-slider-carousel'); ?></h3>
                    <span class="fsc-stat-number"><?php echo count($sliders); ?></span>
                </div>

                <div class="fsc-stat-box">
                    <h3><?php _e('Total Views', 'flexible-slider-carousel'); ?></h3>
                    <span class="fsc-stat-number"><?php echo $this->get_total_views(); ?></span>
                </div>
            </div>

            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th><?php _e('Slider ID', 'flexible-slider-carousel'); ?></th>
                        <th><?php _e('Type', 'flexible-slider-carousel'); ?></th>
                        <th><?php _e('Location', 'flexible-slider-carousel'); ?></th>
                        <th><?php _e('Content Mode', 'flexible-slider-carousel'); ?></th>
                        <th><?php _e('Views', 'flexible-slider-carousel'); ?></th>
                        <th><?php _e('Actions', 'flexible-slider-carousel'); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($sliders as $slider): ?>
                        <tr>
                            <td><?php echo esc_html($slider['id']); ?></td>
                            <td><?php echo esc_html($slider['type']); ?></td>
                            <td>
                                <a href="<?php echo esc_url($slider['edit_url']); ?>" target="_blank">
                                    <?php echo esc_html($slider['title']); ?>
                                </a>
                            </td>
                            <td><?php echo esc_html($slider['content_mode']); ?></td>
                            <td><?php echo intval($slider['views']); ?></td>
                            <td>
                                <a href="<?php echo esc_url($slider['edit_url']); ?>" class="button button-small">
                                    <?php _e('Edit', 'flexible-slider-carousel'); ?>
                                </a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    <?php
    }

    /**
     * Import/Export page
     */
    public function import_export_page()
    {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'flexible-slider-carousel'));
        }

    ?>
        <div class="wrap">
            <h1><?php _e('Import/Export Slider Configurations', 'flexible-slider-carousel'); ?></h1>

            <div class="fsc-import-export-container">
                <div class="fsc-export-section">
                    <h2><?php _e('Export', 'flexible-slider-carousel'); ?></h2>
                    <p><?php _e('Export all slider configurations and settings to a JSON file.', 'flexible-slider-carousel'); ?></p>
                    <button type="button" class="button button-primary" id="fsc-export-config">
                        <?php _e('Export Configuration', 'flexible-slider-carousel'); ?>
                    </button>
                </div>

                <div class="fsc-import-section">
                    <h2><?php _e('Import', 'flexible-slider-carousel'); ?></h2>
                    <p><?php _e('Import slider configurations from a previously exported JSON file.', 'flexible-slider-carousel'); ?></p>
                    <input type="file" id="fsc-import-file" accept=".json" />
                    <button type="button" class="button button-primary" id="fsc-import-config">
                        <?php _e('Import Configuration', 'flexible-slider-carousel'); ?>
                    </button>
                </div>
            </div>

            <div class="fsc-optimization-section">
                <h2><?php _e('Performance Optimization', 'flexible-slider-carousel'); ?></h2>
                <p><?php _e('Optimize all sliders for better performance.', 'flexible-slider-carousel'); ?></p>
                <button type="button" class="button button-secondary" id="fsc-optimize-all">
                    <?php _e('Optimize All Sliders', 'flexible-slider-carousel'); ?>
                </button>
            </div>
        </div>
<?php
    }

    /**
     * Enqueue admin scripts
     */
    public function enqueue_admin_scripts($hook)
    {
        if (strpos($hook, 'flexible-slider-carousel') === false) {
            return;
        }

        wp_enqueue_script(
            'fsc-admin',
            FSC_PLUGIN_URL . 'assets/js/admin.js',
            array('jquery'),
            FSC_PLUGIN_VERSION,
            true
        );

        wp_localize_script('fsc-admin', 'fscAdminData', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('fsc_admin_nonce'),
            'strings' => array(
                'exportSuccess' => __('Configuration exported successfully!', 'flexible-slider-carousel'),
                'importSuccess' => __('Configuration imported successfully!', 'flexible-slider-carousel'),
                'optimizationSuccess' => __('All sliders optimized successfully!', 'flexible-slider-carousel'),
                'error' => __('An error occurred. Please try again.', 'flexible-slider-carousel')
            )
        ));

        wp_enqueue_style(
            'fsc-admin-style',
            FSC_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            FSC_PLUGIN_VERSION
        );
    }

    /**
     * Get all sliders from the database
     */
    private function get_all_sliders()
    {
        global $wpdb;

        // This is a simplified version - in a real implementation,
        // you would scan all posts for slider blocks and extract their data
        $sliders = array();

        // Get posts that contain slider blocks
        $posts = get_posts(array(
            'post_type' => 'any',
            'post_status' => 'publish',
            'posts_per_page' => -1,
            'meta_query' => array(
                array(
                    'key' => '_fsc_has_slider',
                    'value' => '1',
                    'compare' => '='
                )
            )
        ));

        foreach ($posts as $post) {
            $sliders[] = array(
                'id' => 'slider-' . $post->ID,
                'type' => 'slider',
                'title' => $post->post_title,
                'edit_url' => get_edit_post_link($post->ID),
                'content_mode' => 'manual',
                'views' => $this->get_slider_views('slider-' . $post->ID)
            );
        }

        return $sliders;
    }

    /**
     * Get total views for all sliders
     */
    private function get_total_views()
    {
        global $wpdb;

        $table_name = $wpdb->prefix . 'fsc_slider_stats';
        $result = $wpdb->get_var("SELECT SUM(views) FROM $table_name");

        return intval($result) ?: 0;
    }

    /**
     * Get views for a specific slider
     */
    private function get_slider_views($slider_id)
    {
        global $wpdb;

        $table_name = $wpdb->prefix . 'fsc_slider_stats';
        $result = $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(views) FROM $table_name WHERE slider_id = %s",
            $slider_id
        ));

        return intval($result) ?: 0;
    }

    /**
     * Save slider settings via AJAX
     */
    public function save_slider_settings()
    {
        check_ajax_referer('fsc_admin_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to perform this action.', 'flexible-slider-carousel'));
        }

        $settings = $_POST['settings'] ?? array();

        if (empty($settings)) {
            wp_send_json_error(__('No settings provided.', 'flexible-slider-carousel'));
        }

        // Sanitize and save settings
        foreach ($settings as $key => $value) {
            $option_name = 'fsc_' . sanitize_key($key);
            $sanitized_value = $this->sanitize_setting_value($key, $value);
            update_option($option_name, $sanitized_value);
        }

        wp_send_json_success(__('Settings saved successfully!', 'flexible-slider-carousel'));
    }

    /**
     * Get slider overview via AJAX
     */
    public function get_slider_overview()
    {
        check_ajax_referer('fsc_admin_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to perform this action.', 'flexible-slider-carousel'));
        }

        $sliders = $this->get_all_sliders();
        wp_send_json_success($sliders);
    }

    /**
     * Export slider configuration via AJAX
     */
    public function export_slider_config()
    {
        check_ajax_referer('fsc_admin_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to perform this action.', 'flexible-slider-carousel'));
        }

        $config = array(
            'version' => FSC_PLUGIN_VERSION,
            'export_date' => current_time('mysql'),
            'settings' => array(
                'colors' => get_option('fsc_default_colors', array()),
                'layout' => get_option('fsc_default_layout', array()),
                'breakpoints' => get_option('fsc_default_breakpoints', array()),
                'animations' => get_option('fsc_default_animations', array())
            ),
            'sliders' => $this->get_all_sliders()
        );

        wp_send_json_success($config);
    }

    /**
     * Import slider configuration via AJAX
     */
    public function import_slider_config()
    {
        check_ajax_referer('fsc_admin_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to perform this action.', 'flexible-slider-carousel'));
        }

        $config = $_POST['config'] ?? array();

        if (empty($config)) {
            wp_send_json_error(__('No configuration provided.', 'flexible-slider-carousel'));
        }

        // Validate and import configuration
        if (isset($config['settings'])) {
            foreach ($config['settings'] as $key => $value) {
                $option_name = 'fsc_' . sanitize_key($key);
                update_option($option_name, $value);
            }
        }

        wp_send_json_success(__('Configuration imported successfully!', 'flexible-slider-carousel'));
    }

    /**
     * Optimize all sliders via AJAX
     */
    public function optimize_all_sliders()
    {
        check_ajax_referer('fsc_admin_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to perform this action.', 'flexible-slider-carousel'));
        }

        // Perform optimization tasks
        $this->optimize_slider_performance();

        wp_send_json_success(__('All sliders optimized successfully!', 'flexible-slider-carousel'));
    }

    /**
     * Optimize slider performance
     */
    private function optimize_slider_performance()
    {
        // Clear any cached slider data
        if (function_exists('wp_cache_flush')) {
            wp_cache_flush();
        }

        // Optimize database queries
        global $wpdb;
        $wpdb->query("OPTIMIZE TABLE {$wpdb->prefix}fsc_slider_stats");

        // Update optimization timestamp
        update_option('fsc_last_optimization', current_time('mysql'));
    }

    /**
     * Sanitize setting value
     */
    private function sanitize_setting_value($key, $value)
    {
        switch ($key) {
            case 'colors':
                return array_map('sanitize_hex_color', $value);
            case 'layout':
            case 'breakpoints':
                return array_map('intval', $value);
            case 'animations':
                return array_map('sanitize_text_field', $value);
            default:
                return sanitize_text_field($value);
        }
    }

    /**
     * Settings section callbacks
     */
    public function colors_section_callback()
    {
        echo '<p>' . __('Configure default colors for navigation elements.', 'flexible-slider-carousel') . '</p>';
    }

    public function layout_section_callback()
    {
        echo '<p>' . __('Configure default layout settings for different screen sizes.', 'flexible-slider-carousel') . '</p>';
    }

    public function breakpoints_section_callback()
    {
        echo '<p>' . __('Configure default breakpoints for responsive design.', 'flexible-slider-carousel') . '</p>';
    }

    public function animations_section_callback()
    {
        echo '<p>' . __('Configure default animation settings.', 'flexible-slider-carousel') . '</p>';
    }

    /**
     * Field callbacks
     */
    public function color_field_callback($args)
    {
        $field = $args['field'];
        $option_name = 'fsc_default_colors';
        $colors = get_option($option_name, array());
        $value = $colors[$field] ?? '#333333';

        printf(
            '<input type="text" id="%s" name="%s[%s]" value="%s" class="fsc-color-picker" />',
            esc_attr($field),
            esc_attr($option_name),
            esc_attr($field),
            esc_attr($value)
        );
    }

    public function number_field_callback($args)
    {
        $field = $args['field'];
        $option_name = 'fsc_default_' . str_replace('_', '', $field);
        $value = get_option($option_name, 0);

        printf(
            '<input type="number" id="%s" name="%s" value="%s" min="0" step="1" />',
            esc_attr($field),
            esc_attr($option_name),
            esc_attr($value)
        );
    }

    public function select_field_callback($args)
    {
        $field = $args['field'];
        $options = $args['options'];
        $option_name = 'fsc_default_' . str_replace('_', '', $field);
        $value = get_option($option_name, '');

        printf('<select id="%s" name="%s">', esc_attr($field), esc_attr($option_name));
        foreach ($options as $option_value => $option_label) {
            printf(
                '<option value="%s" %s>%s</option>',
                esc_attr($option_value),
                selected($value, $option_value, false),
                esc_html($option_label)
            );
        }
        echo '</select>';
    }
}
