<?php

/**
 * Assets Class
 *
 * Handles loading of CSS, JavaScript, and other assets for the plugin.
 *
 * @package FlexibleSliderCarousel
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * FSC_Assets class
 */
class FSC_Assets
{

    /**
     * Constructor
     */
    public function __construct()
    {
        // Assets werden automatisch von block.json geladen
        // Hier nur das Nötigste für Admin-Seiten
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
    }

    /**
     * Enqueue admin assets
     */
    public function enqueue_admin_assets($hook)
    {
        // Nur auf Plugin-Seiten laden
        if (strpos($hook, 'flexible-slider-carousel') !== false) {
            // WordPress Color Picker
            wp_enqueue_style('wp-color-picker');
            wp_enqueue_script('wp-color-picker');

            wp_enqueue_style(
                'fsc-admin-style',
                FSC_PLUGIN_URL . 'assets/css/admin.css',
                array(),
                FSC_PLUGIN_VERSION
            );
        }
    }
}
