<?php

/**
 * Slider Block Renderer
 * @package FlexibleSliderCarousel
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Generate unique ID
$slider_id = 'fsc-slider-' . uniqid();

// Build CSS classes
$css_classes = ['fsc-slider'];
if (!empty($attributes['className'])) {
    $css_classes[] = $attributes['className'];
}
if (!empty($attributes['align'])) {
    $css_classes[] = 'align' . $attributes['align'];
}

// Safe defaults for all attributes
$slides_to_show = [
    'desktop' => isset($attributes['slidesToShow']['desktop']) ? $attributes['slidesToShow']['desktop'] : 1,
    'tablet' => isset($attributes['slidesToShow']['tablet']) ? $attributes['slidesToShow']['tablet'] : 1,
    'phone' => isset($attributes['slidesToShow']['phone']) ? $attributes['slidesToShow']['phone'] : 1
];

$slides_to_scroll = [
    'desktop' => isset($attributes['slidesToScroll']['desktop']) ? $attributes['slidesToScroll']['desktop'] : 1,
    'tablet' => isset($attributes['slidesToScroll']['tablet']) ? $attributes['slidesToScroll']['tablet'] : 1,
    'phone' => isset($attributes['slidesToScroll']['phone']) ? $attributes['slidesToScroll']['phone'] : 1
];

$breakpoints = [
    'desktop' => isset($attributes['breakpoints']['desktop']) ? $attributes['breakpoints']['desktop'] : 1140,
    'tablet' => isset($attributes['breakpoints']['tablet']) ? $attributes['breakpoints']['tablet'] : 1024,
    'phone' => isset($attributes['breakpoints']['phone']) ? $attributes['breakpoints']['phone'] : 768
];

// Navigation settings
$show_navigation = isset($attributes['showNavigation']) ? $attributes['showNavigation'] : true;
$show_dots = isset($attributes['showDots']) ? $attributes['showDots'] : true;
$show_text_navigation = isset($attributes['showTextNavigation']) ? $attributes['showTextNavigation'] : false;
$text_navigation_position = isset($attributes['textNavigationPosition']) ? $attributes['textNavigationPosition'] : 'below';

// Tab Styling settings
$tab_font_size = isset($attributes['tabFontSize']) ? $attributes['tabFontSize'] : 14;
$tab_font_weight = isset($attributes['tabFontWeight']) ? $attributes['tabFontWeight'] : 'normal';
$tab_text_align = isset($attributes['tabTextAlign']) ? $attributes['tabTextAlign'] : 'center';
$tab_padding = isset($attributes['tabPadding']) ? $attributes['tabPadding'] : 8;
$tab_border_radius = isset($attributes['tabBorderRadius']) ? $attributes['tabBorderRadius'] : 4;
$tab_border_width = isset($attributes['tabBorderWidth']) ? $attributes['tabBorderWidth'] : 1;
$tab_text_color = isset($attributes['tabTextColor']) ? $attributes['tabTextColor'] : '#333333';
$tab_text_color_active = isset($attributes['tabTextColorActive']) ? $attributes['tabTextColorActive'] : '#ffffff';
$tab_background_color = isset($attributes['tabBackgroundColor']) ? $attributes['tabBackgroundColor'] : '#f5f5f5';
$tab_background_color_active = isset($attributes['tabBackgroundColorActive']) ? $attributes['tabBackgroundColorActive'] : '#007cba';
$tab_border_color = isset($attributes['tabBorderColor']) ? $attributes['tabBorderColor'] : '#dddddd';
$tab_border_color_active = isset($attributes['tabBorderColorActive']) ? $attributes['tabBorderColorActive'] : '#007cba';
$tab_box_shadow = isset($attributes['tabBoxShadow']) ? $attributes['tabBoxShadow'] : '0 1px 3px rgba(0,0,0,0.1)';
$tab_box_shadow_active = isset($attributes['tabBoxShadowActive']) ? $attributes['tabBoxShadowActive'] : '0 2px 6px rgba(0,0,0,0.2)';
?>

<div id="<?php echo esc_attr($slider_id); ?>"
    class="<?php echo esc_attr(implode(' ', $css_classes)); ?>"
    data-slides-desktop="<?php echo esc_attr($slides_to_show['desktop']); ?>"
    data-slides-tablet="<?php echo esc_attr($slides_to_show['tablet']); ?>"
    data-slides-phone="<?php echo esc_attr($slides_to_show['phone']); ?>"
    data-slides-scroll-desktop="<?php echo esc_attr($slides_to_scroll['desktop']); ?>"
    data-slides-scroll-tablet="<?php echo esc_attr($slides_to_scroll['tablet']); ?>"
    data-slides-scroll-phone="<?php echo esc_attr($slides_to_scroll['phone']); ?>"
    data-breakpoint-desktop="<?php echo esc_attr($breakpoints['desktop']); ?>"
    data-breakpoint-tablet="<?php echo esc_attr($breakpoints['tablet']); ?>"
    data-breakpoint-phone="<?php echo esc_attr($breakpoints['phone']); ?>"
    data-show-navigation="<?php echo esc_attr($show_navigation ? 'true' : 'false'); ?>"
    data-show-dots="<?php echo esc_attr($show_dots ? 'true' : 'false'); ?>"
    data-show-text-navigation="<?php echo esc_attr($show_text_navigation ? 'true' : 'false'); ?>"
    data-text-navigation-position="<?php echo esc_attr($text_navigation_position); ?>"
    data-tab-font-size="<?php echo esc_attr($tab_font_size); ?>"
    data-tab-font-weight="<?php echo esc_attr($tab_font_weight); ?>"
    data-tab-text-align="<?php echo esc_attr($tab_text_align); ?>"
    data-tab-padding="<?php echo esc_attr($tab_padding); ?>"
    data-tab-border-radius="<?php echo esc_attr($tab_border_radius); ?>"
    data-tab-border-width="<?php echo esc_attr($tab_border_width); ?>"
    data-tab-text-color="<?php echo esc_attr($tab_text_color); ?>"
    data-tab-text-color-active="<?php echo esc_attr($tab_text_color_active); ?>"
    data-tab-background-color="<?php echo esc_attr($tab_background_color); ?>"
    data-tab-background-color-active="<?php echo esc_attr($tab_background_color_active); ?>"
    data-tab-border-color="<?php echo esc_attr($tab_border_color); ?>"
    data-tab-border-color-active="<?php echo esc_attr($tab_border_color_active); ?>"
    data-tab-box-shadow="<?php echo esc_attr($tab_box_shadow); ?>"
    data-tab-box-shadow-active="<?php echo esc_attr($tab_box_shadow_active); ?>">

    <div class="fsc-slider__frames">
        <?php echo $content; ?>
    </div>
</div>