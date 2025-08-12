<?php

/**
 * Theme Integration Class
 *
 * Handles CSS variable detection and theme compatibility.
 *
 * @package FlexibleSliderCarousel
 * @since 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * FSC_Theme_Integration class
 */
class FSC_Theme_Integration
{

    /**
     * Constructor
     */
    public function __construct()
    {
        add_action('wp_head', array($this, 'add_theme_css_variables'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_theme_compatibility'));
        add_filter('fsc_theme_colors', array($this, 'get_theme_colors'));
        add_filter('fsc_theme_breakpoints', array($this, 'get_theme_breakpoints'));
    }

    /**
     * Add theme CSS variables to head
     */
    public function add_theme_css_variables()
    {
        if (!$this->should_add_theme_variables()) {
            return;
        }

        $theme_vars = $this->extract_theme_css_variables();
        $custom_vars = $this->get_custom_css_variables();

        if (empty($theme_vars) && empty($custom_vars)) {
            return;
        }

        echo '<style type="text/css" id="fsc-theme-variables">' . "\n";
        echo ":root {\n";

        // Add theme variables
        foreach ($theme_vars as $var => $value) {
            echo "  --fsc-theme-{$var}: {$value};\n";
        }

        // Add custom variables
        foreach ($custom_vars as $var => $value) {
            echo "  --fsc-custom-{$var}: {$value};\n";
        }

        echo "}\n";
        echo '</style>' . "\n";
    }

    /**
     * Check if theme variables should be added
     */
    private function should_add_theme_variables()
    {
        // Only add if we have sliders on the page
        if (!$this->has_sliders_on_page()) {
            return false;
        }

        // Check if theme integration is enabled
        $integration_enabled = get_option('fsc_theme_integration_enabled', true);
        if (!$integration_enabled) {
            return false;
        }

        return true;
    }

    /**
     * Check if page has sliders
     */
    private function has_sliders_on_page()
    {
        global $post;

        if (!$post) {
            return false;
        }

        // Check if post content contains slider blocks
        if (
            has_block('flexible-slider-carousel/slider', $post) ||
            has_block('flexible-slider-carousel/frame', $post)
        ) {
            return true;
        }

        return false;
    }

    /**
     * Extract CSS variables from theme
     */
    private function extract_theme_css_variables()
    {
        $theme = wp_get_theme();
        $theme_css_file = $theme->get_stylesheet_directory() . '/style.css';

        if (!file_exists($theme_css_file)) {
            return array();
        }

        $css_content = file_get_contents($theme_css_file);
        if (!$css_content) {
            return array();
        }

        $variables = array();

        // Extract CSS custom properties
        preg_match_all('/--([^:]+):\s*([^;]+);/', $css_content, $matches);

        if (!empty($matches[1])) {
            foreach ($matches[1] as $index => $var_name) {
                $var_name = trim($var_name);
                $var_value = trim($matches[2][$index]);

                // Only include color and spacing variables
                if ($this->is_relevant_variable($var_name, $var_value)) {
                    $variables[$var_name] = $var_value;
                }
            }
        }

        // Extract common color values
        $color_vars = $this->extract_color_values($css_content);
        $variables = array_merge($variables, $color_vars);

        return $variables;
    }

    /**
     * Check if variable is relevant for sliders
     */
    private function is_relevant_variable($name, $value)
    {
        // Include color variables
        if (strpos($name, 'color') !== false || strpos($name, 'bg') !== false) {
            return true;
        }

        // Include spacing variables
        if (strpos($name, 'spacing') !== false || strpos($name, 'margin') !== false || strpos($name, 'padding') !== false) {
            return true;
        }

        // Include border variables
        if (strpos($name, 'border') !== false) {
            return true;
        }

        // Include typography variables (for text colors)
        if (strpos($name, 'font') !== false || strpos($name, 'text') !== false) {
            return true;
        }

        return false;
    }

    /**
     * Extract color values from CSS
     */
    private function extract_color_values($css_content)
    {
        $colors = array();

        // Look for common color patterns
        $color_patterns = array(
            'primary' => '/(?:--)?primary(?:-color)?:\s*([^;]+);/i',
            'secondary' => '/(?:--)?secondary(?:-color)?:\s*([^;]+);/i',
            'accent' => '/(?:--)?accent(?:-color)?:\s*([^;]+);/i',
            'text' => '/(?:--)?text(?:-color)?:\s*([^;]+);/i',
            'background' => '/(?:--)?background(?:-color)?:\s*([^;]+);/i',
            'border' => '/(?:--)?border(?:-color)?:\s*([^;]+);/i'
        );

        foreach ($color_patterns as $color_name => $pattern) {
            if (preg_match($pattern, $css_content, $matches)) {
                $color_value = trim($matches[1]);
                if ($this->is_valid_color($color_value)) {
                    $colors[$color_name . '-color'] = $color_value;
                }
            }
        }

        return $colors;
    }

    /**
     * Check if value is a valid color
     */
    private function is_valid_color($value)
    {
        // Hex colors
        if (preg_match('/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/', $value)) {
            return true;
        }

        // RGB/RGBA colors
        if (preg_match('/^rgba?\([^)]+\)$/', $value)) {
            return true;
        }

        // HSL/HSLA colors
        if (preg_match('/^hsla?\([^)]+\)$/', $value)) {
            return true;
        }

        // Named colors
        $named_colors = array(
            'red',
            'green',
            'blue',
            'yellow',
            'orange',
            'purple',
            'pink',
            'black',
            'white',
            'gray',
            'grey',
            'brown',
            'cyan',
            'magenta',
            'transparent',
            'currentColor',
            'inherit'
        );

        if (in_array(strtolower($value), $named_colors)) {
            return true;
        }

        return false;
    }

    /**
     * Get custom CSS variables
     */
    private function get_custom_css_variables()
    {
        $custom_vars = get_option('fsc_custom_css_variables', array());
        $result = array();

        foreach ($custom_vars as $var => $value) {
            if (!empty($value)) {
                $result[$var] = sanitize_text_field($value);
            }
        }

        return $result;
    }

    /**
     * Enqueue theme compatibility styles
     */
    public function enqueue_theme_compatibility()
    {
        if (!$this->has_sliders_on_page()) {
            return;
        }

        // Get current theme
        $theme = wp_get_theme();
        $theme_name = strtolower($theme->get('Name'));

        // Check for specific theme compatibility
        $compatibility_file = $this->get_theme_compatibility_file($theme_name);

        if ($compatibility_file) {
            wp_enqueue_style(
                'fsc-theme-' . sanitize_title($theme_name),
                $compatibility_file,
                array('fsc-slider-style'),
                FSC_PLUGIN_VERSION
            );
        }

        // Theme compatibility is now included in frontend.css
        // No need to enqueue separate theme-compatibility.css
    }

    /**
     * Get theme compatibility file
     */
    private function get_theme_compatibility_file($theme_name)
    {
        $compatibility_dir = FSC_PLUGIN_DIR . 'assets/css/themes/';

        // Check for exact theme name
        $exact_file = $compatibility_dir . sanitize_title($theme_name) . '.css';
        if (file_exists($exact_file)) {
            return FSC_PLUGIN_URL . 'assets/css/themes/' . sanitize_title($theme_name) . '.css';
        }

        // Check for parent theme
        $parent_theme = wp_get_theme()->parent();
        if ($parent_theme) {
            $parent_name = strtolower($parent_theme->get('Name'));
            $parent_file = $compatibility_dir . sanitize_title($parent_name) . '.css';
            if (file_exists($parent_file)) {
                return FSC_PLUGIN_URL . 'assets/css/themes/' . sanitize_title($parent_name) . '.css';
            }
        }

        return false;
    }

    /**
     * Get theme colors filter
     */
    public function get_theme_colors($default_colors)
    {
        $theme_colors = $this->extract_theme_css_variables();

        // Map theme colors to slider colors
        $mapped_colors = array();

        if (isset($theme_colors['primary-color'])) {
            $mapped_colors['navigation_normal'] = $theme_colors['primary-color'];
        }

        if (isset($theme_colors['secondary-color'])) {
            $mapped_colors['navigation_hover'] = $theme_colors['secondary-color'];
        }

        if (isset($theme_colors['text-color'])) {
            $mapped_colors['navigation_inactive'] = $theme_colors['text-color'];
        }

        if (isset($theme_colors['background-color'])) {
            $mapped_colors['navigation_hidden'] = $theme_colors['background-color'];
        }

        // Merge with defaults
        return array_merge($default_colors, $mapped_colors);
    }

    /**
     * Get theme breakpoints filter
     */
    public function get_theme_breakpoints($default_breakpoints)
    {
        $theme_breakpoints = $this->extract_theme_breakpoints();

        if (!empty($theme_breakpoints)) {
            return array_merge($default_breakpoints, $theme_breakpoints);
        }

        return $default_breakpoints;
    }

    /**
     * Extract breakpoints from theme
     */
    private function extract_theme_breakpoints()
    {
        $theme = wp_get_theme();
        $theme_css_file = $theme->get_stylesheet_directory() . '/style.css';

        if (!file_exists($theme_css_file)) {
            return array();
        }

        $css_content = file_get_contents($theme_css_file);
        if (!$css_content) {
            return array();
        }

        $breakpoints = array();

        // Look for common breakpoint patterns
        $breakpoint_patterns = array(
            'desktop' => '/(?:--)?desktop(?:-breakpoint)?:\s*(\d+)px/i',
            'tablet' => '/(?:--)?tablet(?:-breakpoint)?:\s*(\d+)px/i',
            'phone' => '/(?:--)?phone(?:-breakpoint)?:\s*(\d+)px/i',
            'mobile' => '/(?:--)?mobile(?:-breakpoint)?:\s*(\d+)px/i'
        );

        foreach ($breakpoint_patterns as $breakpoint_name => $pattern) {
            if (preg_match($pattern, $css_content, $matches)) {
                $breakpoint_value = intval($matches[1]);
                if ($breakpoint_value > 0) {
                    $breakpoints[$breakpoint_name] = $breakpoint_value;
                }
            }
        }

        // Map mobile to phone if found
        if (isset($breakpoints['mobile']) && !isset($breakpoints['phone'])) {
            $breakpoints['phone'] = $breakpoints['mobile'];
        }

        return $breakpoints;
    }

    /**
     * Generate theme compatibility CSS
     */
    public function generate_theme_compatibility_css()
    {
        $theme = wp_get_theme();
        $theme_name = strtolower($theme->get('Name'));

        $css = $this->get_base_theme_compatibility_css();
        $css .= $this->get_theme_specific_css($theme_name);

        return $css;
    }

    /**
     * Get base theme compatibility CSS
     */
    private function get_base_theme_compatibility_css()
    {
        return "
/* Base Theme Compatibility */
.fsc-slider {
    /* Ensure proper stacking context */
    position: relative;
    z-index: 1;
}

.fsc-slider__content {
    /* Ensure content is properly contained */
    overflow: hidden;
}

.fsc-slider__slides {
    /* Ensure slides are properly positioned */
    position: relative;
}

.fsc-slider__nav {
    /* Ensure navigation is clickable */
    z-index: 10;
    cursor: pointer;
}

.fsc-slider__dots {
    /* Ensure dots are properly positioned */
    z-index: 10;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .fsc-slider {
        /* Ensure mobile compatibility */
        max-width: 100%;
    }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
    .fsc-slider__nav {
        border: 2px solid currentColor;
    }
    
    .fsc-slider__dots button {
        border: 2px solid currentColor;
    }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
    .fsc-slider * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
";
    }

    /**
     * Get theme-specific CSS
     */
    private function get_theme_specific_css($theme_name)
    {
        $css = '';

        // Add theme-specific adjustments
        switch ($theme_name) {
            case 'twentytwentyfour':
            case 'twentytwentythree':
            case 'twentytwentytwo':
                $css .= "
/* WordPress Default Theme Compatibility */
.fsc-slider {
    margin: var(--wp--preset--spacing--40, 1.5rem) 0;
}

.fsc-slider__nav {
    background: var(--wp--preset--color--primary, #007cba);
    color: var(--wp--preset--color--background, #ffffff);
}
";
                break;

            case 'astra':
                $css .= "
/* Astra Theme Compatibility */
.fsc-slider {
    margin: 2em 0;
}

.fsc-slider__nav {
    background: var(--ast-global-color-0, #007cba);
    color: var(--ast-global-color-5, #ffffff);
}
";
                break;

            case 'oceanwp':
                $css .= "
/* OceanWP Theme Compatibility */
.fsc-slider {
    margin: 2em 0;
}

.fsc-slider__nav {
    background: var(--ocean-primary-color, #007cba);
    color: var(--ocean-white-color, #ffffff);
}
";
                break;

            case 'generatepress':
                $css .= "
/* GeneratePress Theme Compatibility */
.fsc-slider {
    margin: 2em 0;
}

.fsc-slider__nav {
    background: var(--gp-primary-color, #007cba);
    color: var(--gp-white-color, #ffffff);
}
";
                break;
        }

        return $css;
    }

    /**
     * Save custom CSS variables
     */
    public function save_custom_css_variables($variables)
    {
        if (!is_array($variables)) {
            return false;
        }

        $sanitized = array();
        foreach ($variables as $var => $value) {
            $sanitized[sanitize_key($var)] = sanitize_text_field($value);
        }

        return update_option('fsc_custom_css_variables', $sanitized);
    }

    /**
     * Get theme information
     */
    public function get_theme_info()
    {
        $theme = wp_get_theme();

        return array(
            'name' => $theme->get('Name'),
            'version' => $theme->get('Version'),
            'author' => $theme->get('Author'),
            'description' => $theme->get('Description'),
            'stylesheet' => $theme->get_stylesheet(),
            'template' => $theme->get_template(),
            'parent' => $theme->parent() ? $theme->parent()->get('Name') : false,
            'supports' => get_theme_support('custom-logo'),
            'has_customizer' => current_theme_supports('custom-logo'),
            'css_variables' => $this->extract_theme_css_variables(),
            'breakpoints' => $this->extract_theme_breakpoints()
        );
    }
}
