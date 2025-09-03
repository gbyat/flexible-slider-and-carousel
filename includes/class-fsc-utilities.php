<?php

/**
 * Utilities Class
 *
 * Provides utility functions for the Flexible Slider and Carousel plugin.
 *
 * @package FlexibleSliderCarousel
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * FSC_Utilities class
 */
class FSC_Utilities
{

    /**
     * Generate unique slider ID
     */
    public static function generate_slider_id($prefix = 'slider')
    {
        return $prefix . '_' . uniqid();
    }

    /**
     * Sanitize hex color
     */
    public static function sanitize_hex_color($color)
    {
        if ('' === $color) {
            return '';
        }

        // 3 or 6 hex digits, or the empty string.
        if (preg_match('|^#([A-Fa-f0-9]{3}){1,2}$|', $color)) {
            return $color;
        }

        return '';
    }

    /**
     * Get responsive breakpoints
     */
    public static function get_breakpoints()
    {
        return array(
            'desktop' => 1024,
            'tablet' => 768,
            'phone' => 480
        );
    }

    /**
     * Get animation options
     */
    public static function get_animation_options()
    {
        return array(
            'slide' => __('Slide', 'flexible-slider-and-carousel'),
            'fade' => __('Fade', 'flexible-slider-and-carousel'),
            'zoom' => __('Zoom', 'flexible-slider-and-carousel'),
            'flip' => __('Flip', 'flexible-slider-and-carousel')
        );
    }

    /**
     * Get easing options
     */
    public static function get_easing_options()
    {
        return array(
            'ease' => __('Ease', 'flexible-slider-and-carousel'),
            'ease-in' => __('Ease In', 'flexible-slider-and-carousel'),
            'ease-out' => __('Ease Out', 'flexible-slider-and-carousel'),
            'ease-in-out' => __('Ease In Out', 'flexible-slider-and-carousel'),
            'linear' => __('Linear', 'flexible-slider-and-carousel')
        );
    }

    /**
     * Check if ACF is active
     */
    public static function is_acf_active()
    {
        return class_exists('ACF');
    }

    /**
     * Get post types for slider content
     */
    public static function get_available_post_types()
    {
        $post_types = get_post_types(array('public' => true), 'objects');
        $available = array();

        foreach ($post_types as $post_type) {
            $available[$post_type->name] = $post_type->labels->name;
        }

        return $available;
    }

    /**
     * Get taxonomies for filtering
     */
    public static function get_available_taxonomies()
    {
        $taxonomies = get_taxonomies(array('public' => true), 'objects');
        $available = array();

        foreach ($taxonomies as $taxonomy) {
            $available[$taxonomy->name] = $taxonomy->labels->name;
        }

        return $available;
    }

    /**
     * Format file size
     */
    public static function format_file_size($bytes)
    {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } elseif ($bytes > 1) {
            return $bytes . ' bytes';
        } elseif ($bytes == 1) {
            return $bytes . ' byte';
        } else {
            return '0 bytes';
        }
    }

    /**
     * Get plugin version
     */
    public static function get_plugin_version()
    {
        if (!function_exists('get_plugin_data')) {
            require_once(ABSPATH . 'wp-admin/includes/plugin.php');
        }

        $plugin_data = get_plugin_data(FSC_PLUGIN_FILE);
        return $plugin_data['Version'] ?? '1.0.0';
    }

    /**
     * Check if current user can manage sliders
     */
    public static function can_manage_sliders()
    {
        return current_user_can('manage_options') || current_user_can('edit_posts');
    }

    /**
     * Log debug information
     */
    public static function log($message, $type = 'info')
    {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            $log_entry = sprintf(
                '[%s] FSC %s: %s',
                current_time('Y-m-d H:i:s'),
                strtoupper($type),
                $message
            );
            error_log($log_entry);
        }
    }
}
