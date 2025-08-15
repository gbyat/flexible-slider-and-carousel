<?php

/**
 * Frame Block Renderer
 * @package FlexibleSliderCarousel
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Get block attributes
$align = isset($attributes['align']) ? $attributes['align'] : 'center';
$className = isset($attributes['className']) ? $attributes['className'] : '';

// Frame title attribute
$frameTitle = isset($attributes['frameTitle']) ? $attributes['frameTitle'] : '';

// Generate unique ID
$frame_id = 'fsc-frame-' . uniqid();

// Build CSS classes
$css_classes = ['fsc-frame'];
if (!empty($align)) {
    $css_classes[] = 'align-' . $align;
}
if (!empty($className)) {
    $css_classes[] = $className;
}

// Build inline styles
$inline_styles = '';
if (!empty($align)) {
    $inline_styles .= "text-align: {$align};";
}
?>

<div id="<?php echo esc_attr($frame_id); ?>"
    class="<?php echo esc_attr(implode(' ', $css_classes)); ?>"
    style="<?php echo esc_attr($inline_styles); ?>"
    data-frame-title="<?php echo esc_attr($frameTitle); ?>">

    <div class="fsc-frame__content">
        <?php echo $content; ?>
    </div>
</div>