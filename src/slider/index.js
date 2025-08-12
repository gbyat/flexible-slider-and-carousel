import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InnerBlocks,
    InspectorControls,
    useInnerBlocksProps,
    BlockControls,
    AlignmentToolbar
} from '@wordpress/block-editor';
import {
    PanelBody,
    SelectControl,
    ToggleControl,
    RangeControl,
    ColorPicker,
    TextControl,
    Button,
    Notice,
    Spinner
} from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as coreDataStore } from '@wordpress/core-data';
import apiFetch from '@wordpress/api-fetch';

const ALLOWED_BLOCKS = ['flexible-slider-carousel/frame'];
const TEMPLATE = [
    ['flexible-slider-carousel/frame', {}]
];

const SliderBlock = ({ attributes, setAttributes, clientId }) => {
    const {
        sliderType,
        autoPlay,
        autoPlaySpeed,
        touchSwipe,
        navigation,
        navigationArrows,
        navigationDots,
        navigationThumbnails,
        responsiveSettings,
        animationType,
        animationSpeed,
        animationEasing,
        loop,
        lazyLoading,
        intersectionObserver,
        align,
        customCSS
    } = attributes;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const blockProps = useBlockProps({
        className: `fsc-slider fsc-slider--${sliderType}`,
        style: {
            textAlign: align
        },
        'data-slides-desktop': responsiveSettings?.slidesToShow?.desktop || 3,
        'data-slides-tablet': responsiveSettings?.slidesToShow?.tablet || 2,
        'data-slides-phone': responsiveSettings?.slidesToShow?.phone || 1
    });

    const innerBlocksProps = useInnerBlocksProps(
        { className: 'fsc-slider__frames' },
        {
            allowedBlocks: ALLOWED_BLOCKS,
            template: TEMPLATE,
            renderAppender: () => (
                <div className="fsc-slider__add-frame">
                    <Button
                        isPrimary
                        onClick={() => {
                            const newFrame = wp.blocks.createBlock('flexible-slider-carousel/frame', {});
                            wp.data.dispatch('core/block-editor').insertBlock(newFrame, undefined, clientId);
                        }}
                    >
                        {__('Add Frame', 'flexible-slider-carousel')}
                    </Button>
                </div>
            )
        }
    );

    // Get frame count for validation
    const frameCount = useSelect(select => {
        const block = select('core/block-editor').getBlock(clientId);
        return block ? block.innerBlocks.length : 0;
    }, [clientId]);

    // Validate minimum frames
    useEffect(() => {
        if (frameCount < 1) {
            setError(__('Slider must have at least one frame.', 'flexible-slider-carousel'));
        } else {
            setError('');
        }
    }, [frameCount]);

    return (
        <>
            <BlockControls>
                <AlignmentToolbar
                    value={align}
                    onChange={(newAlign) => setAttributes({ align: newAlign })}
                />
            </BlockControls>

            <InspectorControls>
                <PanelBody title={__('Slider Settings', 'flexible-slider-carousel')} initialOpen={true}>
                    <SelectControl
                        label={__('Slider Type', 'flexible-slider-carousel')}
                        value={sliderType}
                        options={[
                            { label: __('Image Slider', 'flexible-slider-carousel'), value: 'image' },
                            { label: __('Text Slider', 'flexible-slider-carousel'), value: 'text' },
                            { label: __('Mixed Content', 'flexible-slider-carousel'), value: 'mixed' },
                            { label: __('Testimonial', 'flexible-slider-carousel'), value: 'testimonial' },
                            { label: __('Product', 'flexible-slider-carousel'), value: 'product' },
                            { label: __('Image Carousel', 'flexible-slider-carousel'), value: 'carousel' }
                        ]}
                        onChange={(value) => setAttributes({ sliderType: value })}
                    />

                    <div className="fsc-slider__info">
                        <p>{__('Add frames manually using the + button below to create your slider content.', 'flexible-slider-carousel')}</p>
                    </div>
                </PanelBody>

                <PanelBody title={__('Animation & Behavior', 'flexible-slider-carousel')} initialOpen={false}>
                    <ToggleControl
                        label={__('Auto Play', 'flexible-slider-carousel')}
                        checked={autoPlay}
                        onChange={(value) => setAttributes({ autoPlay: value })}
                    />

                    {autoPlay && (
                        <RangeControl
                            label={__('Auto Play Speed (seconds)', 'flexible-slider-carousel')}
                            value={autoPlaySpeed}
                            onChange={(value) => setAttributes({ autoPlaySpeed: value })}
                            min={1}
                            max={10}
                            step={0.5}
                        />
                    )}

                    <ToggleControl
                        label={__('Touch/Swipe Support', 'flexible-slider-carousel')}
                        checked={touchSwipe}
                        onChange={(value) => setAttributes({ touchSwipe: value })}
                    />

                    <ToggleControl
                        label={__('Loop', 'flexible-slider-carousel')}
                        checked={loop}
                        onChange={(value) => setAttributes({ loop: value })}
                    />

                    <SelectControl
                        label={__('Animation Type', 'flexible-slider-carousel')}
                        value={animationType}
                        options={[
                            { label: __('Fade', 'flexible-slider-carousel'), value: 'fade' },
                            { label: __('Slide', 'flexible-slider-carousel'), value: 'slide' }
                        ]}
                        onChange={(value) => setAttributes({ animationType: value })}
                    />

                    <RangeControl
                        label={__('Animation Speed (ms)', 'flexible-slider-carousel')}
                        value={animationSpeed}
                        onChange={(value) => setAttributes({ animationSpeed: value })}
                        min={200}
                        max={2000}
                        step={100}
                    />

                    <SelectControl
                        label={__('Animation Easing', 'flexible-slider-carousel')}
                        value={animationEasing}
                        options={[
                            { label: __('Ease', 'flexible-slider-carousel'), value: 'ease' },
                            { label: __('Ease-in', 'flexible-slider-carousel'), value: 'ease-in' },
                            { label: __('Ease-out', 'flexible-slider-carousel'), value: 'ease-out' },
                            { label: __('Ease-in-out', 'flexible-slider-carousel'), value: 'ease-in-out' },
                            { label: __('Linear', 'flexible-slider-carousel'), value: 'linear' }
                        ]}
                        onChange={(value) => setAttributes({ animationEasing: value })}
                    />
                </PanelBody>

                <PanelBody title={__('Navigation', 'flexible-slider-carousel')} initialOpen={false}>
                    <ToggleControl
                        label={__('Show Navigation', 'flexible-slider-carousel')}
                        checked={navigation}
                        onChange={(value) => setAttributes({ navigation: value })}
                    />

                    {navigation && (
                        <>
                            <ToggleControl
                                label={__('Navigation Arrows', 'flexible-slider-carousel')}
                                checked={navigationArrows}
                                onChange={(value) => setAttributes({ navigationArrows: value })}
                            />

                            <ToggleControl
                                label={__('Navigation Dots', 'flexible-slider-carousel')}
                                checked={navigationDots}
                                onChange={(value) => setAttributes({ navigationDots: value })}
                            />

                            <ToggleControl
                                label={__('Navigation Thumbnails', 'flexible-slider-carousel')}
                                checked={navigationThumbnails}
                                onChange={(value) => setAttributes({ navigationThumbnails: value })}
                            />
                        </>
                    )}
                </PanelBody>

                <PanelBody title={__('Performance & SEO', 'flexible-slider-carousel')} initialOpen={false}>
                    <ToggleControl
                        label={__('Lazy Loading', 'flexible-slider-carousel')}
                        checked={lazyLoading}
                        onChange={(value) => setAttributes({ lazyLoading: value })}
                    />

                    <ToggleControl
                        label={__('Intersection Observer', 'flexible-slider-carousel')}
                        checked={intersectionObserver}
                        onChange={(value) => setAttributes({ intersectionObserver: value })}
                        help={__('Only load slider when it comes into view', 'flexible-slider-carousel')}
                    />
                </PanelBody>

                <PanelBody title={__('Responsive Settings', 'flexible-slider-carousel')} initialOpen={false}>
                    <ResponsiveSettings
                        settings={responsiveSettings}
                        slidesToShow={attributes.slidesToShow}
                        slidesToScroll={attributes.slidesToScroll}
                        onChange={(settings) => setAttributes({ responsiveSettings: settings })}
                        onSlidesToShowChange={(slidesToShow) => setAttributes({ slidesToShow })}
                        onSlidesToScrollChange={(slidesToScroll) => setAttributes({ slidesToScroll })}
                    />
                </PanelBody>

                <PanelBody title={__('Custom CSS', 'flexible-slider-carousel')} initialOpen={false}>
                    <TextControl
                        label={__('Custom CSS Classes', 'flexible-slider-carousel')}
                        value={customCSS}
                        onChange={(value) => setAttributes({ customCSS: value })}
                        help={__('Additional CSS classes for custom styling', 'flexible-slider-carousel')}
                    />
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                {error && (
                    <Notice status="error" isDismissible={false}>
                        {error}
                    </Notice>
                )}

                <div className="fsc-slider__preview">
                    <div className="fsc-slider__preview-header">
                        <h4>{__('Slider Preview', 'flexible-slider-carousel')}</h4>
                        <div className="fsc-slider__preview-badges">
                            <span className="fsc-slider__badge fsc-slider__badge--type">
                                {sliderType.charAt(0).toUpperCase() + sliderType.slice(1)}
                            </span>
                        </div>
                    </div>

                    <div className="fsc-slider__preview-content">
                        <div className="fsc-slider__frames-container">
                            <div {...innerBlocksProps} />

                            {/* Editor Navigation Arrows */}
                            <button
                                className="fsc-slider__nav-editor fsc-slider__nav-editor--prev"
                                onClick={() => {
                                    const framesContainer = document.querySelector(`[data-block="${clientId}"] .fsc-slider__frames-container`);
                                    if (framesContainer) {
                                        const frameWidth = framesContainer.querySelector('.fsc-frame')?.offsetWidth || 0;
                                        const gap = 20;
                                        framesContainer.scrollLeft -= (frameWidth + gap);
                                    }
                                }}
                            >
                                ‹
                            </button>

                            <button
                                className="fsc-slider__nav-editor fsc-slider__nav-editor--next"
                                onClick={() => {
                                    const framesContainer = document.querySelector(`[data-block="${clientId}"] .fsc-slider__frames-container`);
                                    if (framesContainer) {
                                        const frameWidth = framesContainer.querySelector('.fsc-frame')?.offsetWidth || 0;
                                        const gap = 20;
                                        framesContainer.scrollLeft += (frameWidth + gap);
                                    }
                                }}
                            >
                                ›
                            </button>
                        </div>

                        {/* Editor Navigation Dots */}
                        <div className="fsc-slider__dots-editor">
                            {Array.from({ length: Math.max(1, frameCount) }, (_, i) => (
                                <button
                                    key={i}
                                    className={`fsc-slider__dot-editor ${i === 0 ? 'fsc-slider__dot-editor--active' : ''}`}
                                    onClick={() => {
                                        const framesContainer = document.querySelector(`[data-block="${clientId}"] .fsc-slider__frames-container`);
                                        if (framesContainer) {
                                            const frameWidth = framesContainer.querySelector('.fsc-frame')?.offsetWidth || 0;
                                            const gap = 20;
                                            framesContainer.scrollLeft = i * (frameWidth + gap);
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="fsc-slider__preview-info">
                        <p><strong>{__('Configuration:', 'flexible-slider-carousel')}</strong></p>
                        <ul>
                            <li>{__('Type:', 'flexible-slider-carousel')} {sliderType}</li>
                            <li>{__('Content:', 'flexible-slider-carousel')} {__('Manual Frames', 'flexible-slider-carousel')}</li>
                            <li>{__('Animation:', 'flexible-slider-carousel')} {animationType}</li>
                            {autoPlay && <li>{__('Auto Play:', 'flexible-slider-carousel')} {autoPlaySpeed}s</li>}
                            {navigation && <li>{__('Navigation:', 'flexible-slider-carousel')} {navigationArrows ? __('Arrows', 'flexible-slider-carousel') : ''} {navigationDots ? __('Dots', 'flexible-slider-carousel') : ''} {navigationThumbnails ? __('Thumbnails', 'flexible-slider-carousel') : ''}</li>}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
};

// Post Query Controls Component
const PostQueryControls = ({ attributes, setAttributes, postTypes, taxonomies }) => {
    const { postQuery } = attributes;

    const updateQuery = (key, value) => {
        setAttributes({
            postQuery: {
                ...postQuery,
                [key]: value
            }
        });
    };

    return (
        <div className="fsc-post-query-controls">
            <SelectControl
                label={__('Post Type', 'flexible-slider-carousel')}
                value={postQuery.postType || 'post'}
                options={postTypes.map(type => ({
                    label: type.name,
                    value: type.slug
                }))}
                onChange={(value) => updateQuery('postType', value)}
            />

            <TextControl
                label={__('Posts Per Page', 'flexible-slider-carousel')}
                type="number"
                value={postQuery.postsPerPage || 5}
                onChange={(value) => updateQuery('postsPerPage', parseInt(value))}
                min={1}
                max={20}
            />

            <SelectControl
                label={__('Order By', 'flexible-slider-carousel')}
                value={postQuery.orderBy || 'date'}
                options={[
                    { label: __('Date', 'flexible-slider-carousel'), value: 'date' },
                    { label: __('Title', 'flexible-slider-carousel'), value: 'title' },
                    { label: __('Menu Order', 'flexible-slider-carousel'), value: 'menu_order' },
                    { label: __('Random', 'flexible-slider-carousel'), value: 'rand' }
                ]}
                onChange={(value) => updateQuery('orderBy', value)}
            />

            <SelectControl
                label={__('Order', 'flexible-slider-carousel')}
                value={postQuery.order || 'DESC'}
                options={[
                    { label: __('Descending', 'flexible-slider-carousel'), value: 'DESC' },
                    { label: __('Ascending', 'flexible-slider-carousel'), value: 'ASC' }
                ]}
                onChange={(value) => updateQuery('order', value)}
            />
        </div>
    );
};

// Responsive Settings Component
const ResponsiveSettings = ({ settings, onChange, slidesToShow, slidesToScroll, onSlidesToShowChange, onSlidesToScrollChange }) => {
    const updateBreakpoint = (breakpoint, key, value) => {
        onChange({
            ...settings,
            [breakpoint]: {
                ...settings[breakpoint],
                [key]: value
            }
        });
    };

    const updateSlidesToShow = (breakpoint, value) => {
        onSlidesToShowChange({
            ...slidesToShow,
            [breakpoint]: value
        });
    };

    const updateSlidesToScroll = (breakpoint, value) => {
        onSlidesToScrollChange({
            ...slidesToScroll,
            [breakpoint]: value
        });
    };

    return (
        <div className="fsc-responsive-settings">
            {['desktop', 'tablet', 'phone'].map(breakpoint => (
                <div key={breakpoint} className={`fsc-breakpoint fsc-breakpoint--${breakpoint}`}>
                    <h4>{breakpoint.charAt(0).toUpperCase() + breakpoint.slice(1)}</h4>

                    <RangeControl
                        label={__('Min Width (px)', 'flexible-slider-carousel')}
                        value={settings[breakpoint]?.minWidth || 0}
                        onChange={(value) => updateBreakpoint(breakpoint, 'minWidth', value)}
                        min={0}
                        max={2000}
                        step={10}
                    />

                    <RangeControl
                        label={__('Inner Padding (px)', 'flexible-slider-carousel')}
                        value={settings[breakpoint]?.innerPadding || 0}
                        onChange={(value) => updateBreakpoint(breakpoint, 'innerPadding', value)}
                        min={0}
                        max={100}
                        step={5}
                    />

                    <RangeControl
                        label={__('Outer Margin (px)', 'flexible-slider-carousel')}
                        value={settings[breakpoint]?.outerMargin || 0}
                        onChange={(value) => updateBreakpoint(breakpoint, 'outerMargin', value)}
                        min={0}
                        max={100}
                        step={5}
                    />

                    <RangeControl
                        label={__('Slides To Show', 'flexible-slider-carousel')}
                        value={slidesToShow[breakpoint] || 1}
                        onChange={(value) => updateSlidesToShow(breakpoint, value)}
                        min={1}
                        max={5}
                        step={1}
                    />

                    <RangeControl
                        label={__('Slides To Scroll', 'flexible-slider-carousel')}
                        value={slidesToScroll[breakpoint] || 1}
                        onChange={(value) => updateSlidesToScroll(breakpoint, value)}
                        min={1}
                        max={5}
                        step={1}
                    />
                </div>
            ))}
        </div>
    );
};

// Export for block.json
export const edit = SliderBlock;
export const save = () => <InnerBlocks.Content />;

// Block registrieren
registerBlockType('flexible-slider-carousel/slider', {
    edit: SliderBlock,
    save: () => <InnerBlocks.Content />
}); 