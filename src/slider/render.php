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
    data-breakpoint-phone="<?php echo esc_attr($breakpoints['phone']); ?>">

    <div class="fsc-slider__frames">
        <?php echo $content; ?>
    </div>
</div>