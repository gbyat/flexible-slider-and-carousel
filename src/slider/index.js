import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InnerBlocks,
    InspectorControls,
    useInnerBlocksProps,
    BlockControls,
    AlignmentToolbar,
    ColorPalette
} from '@wordpress/block-editor';
import {
    PanelBody,
    SelectControl,
    ToggleControl,
    RangeControl,
    TextControl,
    Button,
    Notice,
    Spinner,
    ColorIndicator,
    Popover
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
        sliderDesign,
        autoPlay,
        autoPlaySpeed,
        touchSwipe,
        showNavigation,
        showDots,
        showTextNavigation,
        textNavigationPosition,
        responsiveSettings,
        slidesToShow,
        slidesToScroll,
        loading,
        // Swiper.js specific attributes
        sliderType,
        gap,
        animationDuration,
        animationTimingFunc,
        animationType,
        animationDirection,
        animationIntensity,
        centeredSlides,

        keyboard,
        touchRatio,
        intersectionObserver,
        align,
        customCSS,
        // Tab Styling Attributes
        tabFontSize,
        tabFontWeight,
        tabTextAlign,
        tabPadding,
        tabBorderRadius,
        tabBorderWidth,
        tabTextColor,
        tabTextColorHover,
        tabTextColorActive,
        tabBackgroundColor,
        tabBackgroundColorHover,
        tabBackgroundColorActive,
        tabBorderColor,
        tabBorderColorHover,
        tabBorderColorActive,
        tabBoxShadow,
        tabBoxShadowActive,
        // Frame Styling Attributes
        frameBorderRadius,
        frameBorderWidth,
        frameBorderColor,
        frameBoxShadow,
        // Navigation Colors
        arrowBackgroundColor,
        arrowBackgroundColorHover,
        arrowTextColor,
        dotBackgroundColor,
        dotBackgroundColorHover,
        dotBackgroundColorActive,
        // Grid Settings
        gridRows,
        gridFill
    } = attributes;

    // Use slidesToShow and slidesToScroll from attributes, with fallbacks
    const currentSlidesToShow = slidesToShow || { desktop: 1, tablet: 1, phone: 1 };
    const currentSlidesToScroll = slidesToScroll || { desktop: 1, tablet: 1, phone: 1 };

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeColorPicker, setActiveColorPicker] = useState(null);
    const [previewBreakpoint, setPreviewBreakpoint] = useState('desktop');

    const blockProps = useBlockProps({
        className: `fsc-slider fsc-slider--${sliderDesign || 'default'}`,
        style: {
            textAlign: align
        },
        'data-slides-desktop': slidesToShow?.desktop || 1,
        'data-slides-tablet': slidesToShow?.tablet || 1,
        'data-slides-phone': slidesToShow?.phone || 1,
        'data-slides-scroll-desktop': slidesToScroll?.desktop || 1,
        'data-slides-scroll-tablet': slidesToScroll?.tablet || 1,
        'data-slides-scroll-phone': slidesToScroll?.phone || 1,
        'data-slider-type': sliderType || 'carousel',
        'data-gap': gap || 10,
        'data-animation-duration': animationDuration || 800,
        'data-animation-timing-func': animationTimingFunc || 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
        'data-animation-type': animationType || 'slide',
        'data-animation-direction': animationDirection || 'horizontal',
        'data-animation-intensity': animationIntensity || 50,
        // Removed focusAt - using centeredSlides instead
        'data-centered-slides': centeredSlides !== false ? 'true' : 'false',

        'data-keyboard': keyboard !== false ? 'true' : 'false',
        'data-touch-ratio': touchRatio || 0.5,
        // Navigation Colors
        'data-arrow-background-color': arrowBackgroundColor || '#007cba',
        'data-arrow-background-color-hover': arrowBackgroundColorHover || '#005a87',
        'data-arrow-text-color': arrowTextColor || '#ffffff',
        'data-dot-background-color': dotBackgroundColor || '#dddddd',
        'data-dot-background-color-hover': dotBackgroundColorHover || '#00a0d2',
        'data-dot-background-color-active': dotBackgroundColorActive || '#007cba',
        // Tab Colors
        'data-tab-text-color': tabTextColor || '#333333',
        'data-tab-text-color-hover': tabTextColorHover || '#ffffff',
        'data-tab-text-color-active': tabTextColorActive || '#ffffff',
        'data-tab-background-color': tabBackgroundColor || '#f5f5f5',
        'data-tab-background-color-hover': tabBackgroundColorHover || '#00a0d2',
        'data-tab-background-color-active': tabBackgroundColorActive || '#007cba',
        'data-tab-border-color': tabBorderColor || '#dddddd',
        'data-tab-border-color-hover': tabBorderColorHover || '#00a0d2',
        'data-tab-border-color-active': tabBorderColorActive || '#007cba',
        // Frame Styling
        'data-frame-border-radius': frameBorderRadius !== undefined ? frameBorderRadius : 8,
        'data-frame-border-width': frameBorderWidth !== undefined ? frameBorderWidth : 0,
        'data-frame-border-color': frameBorderColor !== undefined ? frameBorderColor : '#dddddd',
        'data-frame-box-shadow': frameBoxShadow !== undefined ? frameBoxShadow : 'none',
        // Responsive Settings
        'data-inner-padding-desktop': responsiveSettings?.desktop?.innerPadding !== undefined ? responsiveSettings.desktop.innerPadding : 10,
        'data-inner-padding-tablet': responsiveSettings?.tablet?.innerPadding !== undefined ? responsiveSettings.tablet.innerPadding : 10,
        'data-inner-padding-phone': responsiveSettings?.phone?.innerPadding !== undefined ? responsiveSettings.phone.innerPadding : 10
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

    // Get visible frames for editor preview based on slidesToShow setting
    const visibleFrames = useSelect(select => {
        const block = select('core/block-editor').getBlock(clientId);
        if (!block) return [];

        const frames = block.innerBlocks || [];
        // Use slidesToShow directly (no division needed)
        const slidesToShowCount = Math.ceil((slidesToShow?.desktop || 1) * frames.length);

        // Return only the first N frames based on slidesToShow setting
        return frames.slice(0, slidesToShowCount);
    }, [clientId, slidesToShow]);

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

    // Auto-set responsive settings to 1 frame for 3D effects
    useEffect(() => {
        console.log('🎯 useEffect triggered with animationType:', animationType);
        console.log('Current slidesToShow:', slidesToShow);
        console.log('Current slidesToScroll:', slidesToScroll);

        const is3DEffect = ['flip', 'creative', 'cube', 'fade'].includes(animationType);

        if (is3DEffect) {
            console.log('🎯 3D effect detected!');

            // Check if current settings are not already 1 frame
            const currentSlidesToShow = slidesToShow || { desktop: 1, tablet: 1, phone: 1 };
            const currentSlidesToScroll = slidesToScroll || { desktop: 1, tablet: 1, phone: 1 };

            const needsUpdate = currentSlidesToShow.desktop !== 1 || currentSlidesToShow.tablet !== 1 || currentSlidesToShow.phone !== 1 ||
                currentSlidesToScroll.desktop !== 1 || currentSlidesToScroll.tablet !== 1 || currentSlidesToScroll.phone !== 1;

            console.log('Needs update?', needsUpdate);
            console.log('Current slidesToShow:', currentSlidesToShow);
            console.log('Current slidesToScroll:', currentSlidesToScroll);

            if (needsUpdate) {
                console.log('🎯 Updating slides to 1 frame...');
                setAttributes({
                    slidesToShow: { desktop: 1, tablet: 1, phone: 1 },
                    slidesToScroll: { desktop: 1, tablet: 1, phone: 1 }
                });
                console.log('✅ Update completed');
            } else {
                console.log('✅ No update needed - already set to 1 frame');
            }
        } else {
            console.log('🎯 Not a 3D effect, no update needed');

            // Special handling for cards effect - removed minimum frame restriction
            if (animationType === 'cards') {
                // Allow any number of frames for cards effect
                console.log('🎯 Cards effect detected - allowing any frame count');
            } else {
                // For other non-3D effects, ensure we have proper default values
                if (!slidesToShow) {
                    setAttributes({
                        slidesToShow: { desktop: 3, tablet: 2, phone: 1 },
                        slidesToScroll: { desktop: 1, tablet: 1, phone: 1 }
                    });
                    console.log('✅ Set default slidesToShow for non-3D effect');
                }
            }
        }
    }, [animationType, slidesToShow, slidesToScroll, setAttributes]);

    // Force re-render when tab styling attributes change
    useEffect(() => {
        // This will trigger a re-render when tab styling changes
    }, [tabFontSize, tabFontWeight, tabTextAlign, tabPadding, tabBorderRadius, tabBorderWidth,
        tabTextColor, tabTextColorHover, tabTextColorActive, tabBackgroundColor, tabBackgroundColorHover, tabBackgroundColorActive,
        tabBorderColor, tabBorderColorHover, tabBorderColorActive, tabBoxShadow, tabBoxShadowActive]);

    // Update CSS variables in editor when colors change
    useEffect(() => {
        console.log('🎨 Color useEffect triggered with:', {
            arrowBackgroundColor,
            arrowBackgroundColorHover,
            arrowTextColor,
            dotBackgroundColor,
            dotBackgroundColorHover,
            dotBackgroundColorActive,
            tabBackgroundColor,
            tabBackgroundColorHover,
            tabBackgroundColorActive,
            tabTextColor,
            tabTextColorHover,
            tabTextColorActive,
            tabBorderColor,
            tabBorderColorHover,
            tabBorderColorActive
        });

        // Find the current slider block in the editor
        const currentBlock = wp.data.select('core/block-editor').getBlock(clientId);
        if (currentBlock) {
            console.log('🔍 Current block found:', currentBlock);

            // Find the DOM element for this specific block
            const blockElement = document.querySelector(`[data-block="${clientId}"]`);
            console.log('🔍 Block element search result:', blockElement);

            if (blockElement) {
                console.log('🔍 Block element found, using it directly for CSS variables');

                // The block element itself has all the data attributes, so use it directly
                const sliderElement = blockElement; // Use the block element itself
                console.log('🎯 Using block element as slider element:', sliderElement);

                // Also find the frames container for additional CSS variable setting
                const framesContainer = blockElement.querySelector('.fsc-slider__frames');

                // Update arrow colors - set on both slider and frames container
                if (arrowBackgroundColor) {
                    sliderElement.style.setProperty('--arrow-background-color', arrowBackgroundColor, 'important');
                    if (framesContainer) framesContainer.style.setProperty('--arrow-background-color', arrowBackgroundColor, 'important');
                    console.log('✅ Set --arrow-background-color:', arrowBackgroundColor);

                    // Also set directly on navigation elements
                    const prevButton = blockElement.querySelector('.swiper-button-prev');
                    const nextButton = blockElement.querySelector('.swiper-button-next');
                    if (prevButton) prevButton.style.backgroundColor = arrowBackgroundColor;
                    if (nextButton) nextButton.style.backgroundColor = arrowBackgroundColor;
                    console.log('🎯 Set direct background on buttons:', arrowBackgroundColor);
                }
                if (arrowBackgroundColorHover) {
                    sliderElement.style.setProperty('--arrow-background-color-hover', arrowBackgroundColorHover, 'important');
                    if (framesContainer) framesContainer.style.setProperty('--arrow-background-color-hover', arrowBackgroundColorHover, 'important');
                    console.log('✅ Set --arrow-background-color-hover:', arrowBackgroundColorHover);
                }
                if (arrowTextColor) {
                    sliderElement.style.setProperty('--arrow-text-color', arrowTextColor, 'important');
                    if (framesContainer) framesContainer.style.setProperty('--arrow-text-color', arrowTextColor, 'important');
                    console.log('✅ Set --arrow-text-color:', arrowTextColor);

                    // Also set directly on navigation elements
                    const prevButton = blockElement.querySelector('.swiper-button-prev');
                    const nextButton = blockElement.querySelector('.swiper-button-next');
                    if (prevButton) prevButton.style.color = arrowTextColor;
                    if (nextButton) nextButton.style.color = arrowTextColor;
                    console.log('🎯 Set direct color on buttons:', arrowTextColor);
                }

                // Update dot colors - set on both slider and frames container
                if (dotBackgroundColor) {
                    sliderElement.style.setProperty('--dot-background-color', dotBackgroundColor, 'important');
                    if (framesContainer) framesContainer.style.setProperty('--dot-background-color', dotBackgroundColor, 'important');
                    console.log('✅ Set --dot-background-color:', dotBackgroundColor);
                }
                if (dotBackgroundColorHover) {
                    sliderElement.style.setProperty('--dot-background-color-hover', dotBackgroundColorHover, 'important');
                    if (framesContainer) framesContainer.style.setProperty('--dot-background-color-hover', dotBackgroundColorHover, 'important');
                    console.log('✅ Set --dot-background-color-hover:', dotBackgroundColorHover);
                }
                if (dotBackgroundColorActive) {
                    sliderElement.style.setProperty('--dot-background-color-active', dotBackgroundColorActive, 'important');
                    if (framesContainer) framesContainer.style.setProperty('--dot-background-color-active', dotBackgroundColorActive, 'important');
                    console.log('✅ Set --dot-background-color-active:', dotBackgroundColorActive);
                }

                // Update tab colors
                if (tabBackgroundColor) {
                    sliderElement.style.setProperty('--tab-background-color', tabBackgroundColor, 'important');
                    console.log('✅ Set --tab-background-color:', tabBackgroundColor);
                }
                if (tabBackgroundColorHover) {
                    sliderElement.style.setProperty('--tab-background-color-hover', tabBackgroundColorHover, 'important');
                    console.log('✅ Set --tab-background-color-hover:', tabBackgroundColorHover);
                }
                if (tabBackgroundColorActive) {
                    sliderElement.style.setProperty('--tab-background-color-active', tabBackgroundColorActive, 'important');
                    console.log('✅ Set --tab-background-color-active:', tabBackgroundColorActive);
                }
                if (tabTextColor) {
                    sliderElement.style.setProperty('--tab-text-color', tabTextColor, 'important');
                    console.log('✅ Set --tab-text-color:', tabTextColor);
                }
                if (tabTextColorHover) {
                    sliderElement.style.setProperty('--tab-text-color-hover', tabTextColorHover, 'important');
                    console.log('✅ Set --tab-text-color-hover:', tabTextColorHover);
                }
                if (tabTextColorActive) {
                    sliderElement.style.setProperty('--tab-text-color-active', tabTextColorActive, 'important');
                    console.log('✅ Set --tab-text-color-active:', tabTextColorActive);
                }
                if (tabBorderColor) {
                    sliderElement.style.setProperty('--tab-border-color', tabBorderColor, 'important');
                    console.log('✅ Set --tab-border-color:', tabBorderColor);
                }
                if (tabBorderColorHover) {
                    sliderElement.style.setProperty('--tab-border-color-hover', tabBorderColorHover, 'important');
                    console.log('✅ Set --tab-border-color-hover:', tabBorderColorHover);
                }
                if (tabBorderColorActive) {
                    sliderElement.style.setProperty('--tab-border-color-active', tabBorderColorActive, 'important');
                    console.log('✅ Set --tab-border-color-active:', tabBorderColorActive);
                }
            } else {
                console.log('❌ Block element not found for clientId:', clientId);
            }
        } else {
            console.log('❌ Current block not found');
        }
    }, [
        arrowBackgroundColor, arrowBackgroundColorHover, arrowTextColor,
        dotBackgroundColor, dotBackgroundColorHover, dotBackgroundColorActive,
        tabBackgroundColor, tabBackgroundColorHover, tabBackgroundColorActive,
        tabTextColor, tabTextColorHover, tabTextColorActive, tabBorderColor, tabBorderColorHover, tabBorderColorActive
    ]);

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
                        label={__('Slider Design', 'flexible-slider-carousel')}
                        value={sliderDesign}
                        options={[
                            { label: __('Default', 'flexible-slider-carousel'), value: 'default' },
                            { label: __('Minimal', 'flexible-slider-carousel'), value: 'minimal' },
                            { label: __('Modern', 'flexible-slider-carousel'), value: 'modern' },
                            { label: __('Classic', 'flexible-slider-carousel'), value: 'classic' },
                            { label: __('Card', 'flexible-slider-carousel'), value: 'card' }
                        ]}
                        onChange={(value) => setAttributes({ sliderDesign: value })}
                    />

                    <div className="fsc-slider__info">
                        <p>{__('Add frames manually using the + button below to create your slider content.', 'flexible-slider-carousel')}</p>
                    </div>

                    <PanelBody title={__('Frame Styling', 'flexible-slider-carousel')} initialOpen={false}>
                        <RangeControl
                            label={__('Border Radius (px)', 'flexible-slider-carousel')}
                            value={frameBorderRadius !== undefined ? frameBorderRadius : 8}
                            onChange={(value) => setAttributes({ frameBorderRadius: value })}
                            min={0}
                            max={50}
                            step={1}
                            help={__('Rounded corners for frames (Standard: 8px)', 'flexible-slider-carousel')}
                        />

                        <RangeControl
                            label={__('Border Width (px)', 'flexible-slider-carousel')}
                            value={frameBorderWidth !== undefined ? frameBorderWidth : 0}
                            onChange={(value) => setAttributes({ frameBorderWidth: value })}
                            min={0}
                            max={10}
                            step={1}
                            help={__('Frame border thickness (Standard: 0px)', 'flexible-slider-carousel')}
                        />

                        <div className="fsc-color-control">
                            <label className="components-base-control__label">{__('Border Color', 'flexible-slider-carousel')}</label>
                            <div className="fsc-color-indicator-wrapper">
                                <ColorIndicator
                                    colorValue={frameBorderColor}
                                    onClick={() => setActiveColorPicker('frameBorderColor')}
                                />
                                <Button
                                    className="fsc-color-button"
                                    onClick={() => setAttributes({ frameBorderColor: undefined })}
                                >
                                    {__('Clear', 'flexible-slider-carousel')}
                                </Button>
                            </div>
                            {activeColorPicker === 'frameBorderColor' && (
                                <Popover
                                    position="bottom center"
                                    onClose={() => setActiveColorPicker(null)}
                                >
                                    <ColorPalette
                                        value={frameBorderColor}
                                        onChange={(color) => {
                                            setAttributes({ frameBorderColor: color });
                                            setActiveColorPicker(null);
                                        }}
                                    />
                                </Popover>
                            )}
                        </div>

                        <TextControl
                            label={__('Box Shadow', 'flexible-slider-carousel')}
                            value={frameBoxShadow || 'none'}
                            onChange={(value) => setAttributes({ frameBoxShadow: value })}
                            help={__('CSS box-shadow value (e.g., "0 2px 8px rgba(0,0,0,0.1)" or "none")', 'flexible-slider-carousel')}
                            placeholder="none"
                        />

                    </PanelBody>
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

                    <SelectControl
                        label={__('Slider Type', 'flexible-slider-carousel')}
                        value={sliderType || 'carousel'}
                        options={[
                            { label: __('Carousel (Endless Loop)', 'flexible-slider-carousel'), value: 'carousel' },
                            { label: __('Slider (Finite)', 'flexible-slider-carousel'), value: 'slider' }
                        ]}
                        onChange={(value) => setAttributes({ sliderType: value })}
                        help={__('Carousel loops endlessly, Slider stops at boundaries (Standard: Carousel)', 'flexible-slider-carousel')}
                    />

                    <RangeControl
                        label={__('Gap Between Frames (px)', 'flexible-slider-carousel')}
                        value={gap !== undefined ? gap : 10}
                        onChange={(value) => setAttributes({ gap: value })}
                        min={0}
                        max={50}
                        step={1}
                        help={__('Standard: 10px', 'flexible-slider-carousel')}
                    />

                    <RangeControl
                        label={__('Animation Duration (ms)', 'flexible-slider-carousel')}
                        value={animationDuration || 400}
                        onChange={(value) => setAttributes({ animationDuration: value })}
                        min={100}
                        max={2000}
                        step={50}
                        help={__('Standard: 400ms', 'flexible-slider-carousel')}
                    />

                    <SelectControl
                        label={__('Animation Timing Function', 'flexible-slider-carousel')}
                        value={animationTimingFunc || 'cubic-bezier(0.165, 0.840, 0.440, 1.000)'}
                        options={[
                            { label: __('Default (Smooth)', 'flexible-slider-carousel'), value: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)' },
                            { label: __('Linear', 'flexible-slider-carousel'), value: 'linear' },
                            { label: __('Ease', 'flexible-slider-carousel'), value: 'ease' },
                            { label: __('Ease-in', 'flexible-slider-carousel'), value: 'ease-in' },
                            { label: __('Ease-out', 'flexible-slider-carousel'), value: 'ease-out' },
                            { label: __('Ease-in-out', 'flexible-slider-carousel'), value: 'ease-in-out' }
                        ]}
                        onChange={(value) => setAttributes({ animationTimingFunc: value })}
                        help={__('Standard: Default (Smooth)', 'flexible-slider-carousel')}
                    />

                    <SelectControl
                        label={__('Animation Type', 'flexible-slider-carousel')}
                        value={animationType || 'slide'}
                        options={[
                            { label: __('Slide (Standard)', 'flexible-slider-carousel'), value: 'slide' },
                            { label: __('Fade', 'flexible-slider-carousel'), value: 'fade' },
                            { label: __('Flip (1 Frame)', 'flexible-slider-carousel'), value: 'flip' },
                            { label: __('Coverflow', 'flexible-slider-carousel'), value: 'coverflow' },
                            { label: __('Creative (1 Frame)', 'flexible-slider-carousel'), value: 'creative' },
                            { label: __('Cube (1 Frame)', 'flexible-slider-carousel'), value: 'cube' },
                            { label: __('Cards', 'flexible-slider-carousel'), value: 'cards' }
                        ]}
                        onChange={(value) => setAttributes({ animationType: value })}
                        help={__('Art der Slide-Animation (Standard: Slide)', 'flexible-slider-carousel')}
                    />

                    {/* Animation Direction - only for slide effect */}
                    {animationType === 'slide' && (
                        <SelectControl
                            label={__('Animation Direction', 'flexible-slider-carousel')}
                            value={animationDirection || 'horizontal'}
                            options={[
                                { label: __('Horizontal (Standard)', 'flexible-slider-carousel'), value: 'horizontal' },
                                { label: __('Vertical', 'flexible-slider-carousel'), value: 'vertical' }
                            ]}
                            onChange={(value) => setAttributes({ animationDirection: value })}
                            help={__('Richtung der Slide-Bewegung (Standard: Horizontal)', 'flexible-slider-carousel')}
                        />
                    )}

                    {/* Focus Position removed - using Centered Slides instead */}



                    <ToggleControl
                        label={__('Centered Slides', 'flexible-slider-carousel')}
                        checked={centeredSlides !== false}
                        onChange={(value) => setAttributes({ centeredSlides: value })}
                        help={__('Center the active slide (works great with 1.5+ frames)', 'flexible-slider-carousel')}
                    />

                    <ToggleControl
                        label={__('Keyboard Navigation', 'flexible-slider-carousel')}
                        checked={keyboard !== false}
                        onChange={(value) => setAttributes({ keyboard: value })}
                        help={__('Use arrow keys to navigate (Standard: Aktiviert)', 'flexible-slider-carousel')}
                    />

                    <RangeControl
                        label={__('Touch/Swipe Sensitivity', 'flexible-slider-carousel')}
                        value={touchRatio || 0.5}
                        onChange={(value) => setAttributes({ touchRatio: value })}
                        min={0.1}
                        max={2.0}
                        step={0.1}
                        help={__('Higher values = more sensitive touch/swipe (Standard: 0.5)', 'flexible-slider-carousel')}
                    />

                    {animationType === 'slide' && (
                        <>
                            <RangeControl
                                label="Grid Rows"
                                value={gridRows}
                                onChange={(value) => setAttributes({ gridRows: value })}
                                min={1}
                                max={4}
                                step={1}
                            />
                            {gridRows > 1 && (
                                <SelectControl
                                    label="Grid Fill"
                                    value={gridFill}
                                    options={[
                                        { label: 'Column', value: 'column' },
                                        { label: 'Row', value: 'row' }
                                    ]}
                                    onChange={(value) => setAttributes({ gridFill: value })}
                                />
                            )}
                        </>
                    )}

                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
                        <Button
                            isSecondary
                            onClick={() => {
                                setAttributes({
                                    // Swiper.js settings
                                    sliderType: 'carousel',
                                    gap: 15,
                                    animationDuration: 800,
                                    animationTimingFunc: 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
                                    animationType: 'slide',
                                    animationDirection: 'horizontal',
                                    animationIntensity: 50,
                                    centeredSlides: true,
                                    keyboard: true,
                                    touchRatio: 0.5
                                });
                            }}
                            style={{ width: '100%' }}
                        >
                            {__('Auf Standardwerte zurücksetzen', 'flexible-slider-carousel')}
                        </Button>
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '8px', textAlign: 'center' }}>
                            {__('Setzt alle Swiper.js Optionen auf Standardwerte zurück', 'flexible-slider-carousel')}
                        </p>
                    </div>
                </PanelBody>

                <PanelBody title={__('Navigation', 'flexible-slider-carousel')} initialOpen={false}>
                    <ToggleControl
                        label={__('Navigation Arrows', 'flexible-slider-carousel')}
                        checked={showNavigation}
                        onChange={(value) => setAttributes({ showNavigation: value })}
                    />

                    <ToggleControl
                        label={__('Navigation Dots', 'flexible-slider-carousel')}
                        checked={showDots}
                        onChange={(value) => setAttributes({ showDots: value })}
                    />

                    <ToggleControl
                        label={__('Text Navigation', 'flexible-slider-carousel')}
                        checked={showTextNavigation}
                        onChange={(value) => setAttributes({ showTextNavigation: value })}
                        help={__('Show frame titles as navigation tabs', 'flexible-slider-carousel')}
                    />

                    {showTextNavigation && (
                        <SelectControl
                            label={__('Text Navigation Position', 'flexible-slider-carousel')}
                            value={textNavigationPosition}
                            options={[
                                { label: __('Above Slider', 'flexible-slider-carousel'), value: 'above' },
                                { label: __('Below Slider', 'flexible-slider-carousel'), value: 'below' }
                            ]}
                            onChange={(value) => setAttributes({ textNavigationPosition: value })}
                        />
                    )}

                    {showTextNavigation && (
                        <>
                            <PanelBody title={__('Tab Typography', 'flexible-slider-carousel')} initialOpen={false}>
                                <SelectControl
                                    label={__('Text Align', 'flexible-slider-carousel')}
                                    value={tabTextAlign}
                                    options={[
                                        { label: __('Left', 'flexible-slider-carousel'), value: 'left' },
                                        { label: __('Center', 'flexible-slider-carousel'), value: 'center' },
                                        { label: __('Right', 'flexible-slider-carousel'), value: 'right' }
                                    ]}
                                    onChange={(value) => setAttributes({ tabTextAlign: value })}
                                />

                                <RangeControl
                                    label={__('Font Size (px)', 'flexible-slider-carousel')}
                                    value={tabFontSize}
                                    onChange={(value) => setAttributes({ tabFontSize: value })}
                                    min={12}
                                    max={48}
                                    step={1}
                                />

                                <SelectControl
                                    label={__('Font Weight', 'flexible-slider-carousel')}
                                    value={tabFontWeight}
                                    options={[
                                        { label: __('Normal', 'flexible-slider-carousel'), value: 'normal' },
                                        { label: __('Bold', 'flexible-slider-carousel'), value: 'bold' },
                                        { label: __('Light', 'flexible-slider-carousel'), value: '300' },
                                        { label: __('Medium', 'flexible-slider-carousel'), value: '500' },
                                        { label: __('Semi Bold', 'flexible-slider-carousel'), value: '600' }
                                    ]}
                                    onChange={(value) => setAttributes({ tabFontWeight: value })}
                                />
                            </PanelBody>

                            <PanelBody title={__('Tab Colors - Normal State', 'flexible-slider-carousel')} initialOpen={false}>
                                <div className="fsc-color-control">
                                    <label className="components-base-control__label">{__('Text Color', 'flexible-slider-carousel')}</label>
                                    <div className="fsc-color-indicator-wrapper">
                                        <ColorIndicator
                                            colorValue={tabTextColor}
                                            onClick={() => setActiveColorPicker('tabTextColor')}
                                        />
                                        <Button
                                            className="fsc-color-button"
                                            onClick={() => setAttributes({ tabTextColor: undefined })}
                                        >
                                            {__('Clear', 'flexible-slider-carousel')}
                                        </Button>
                                    </div>
                                    {activeColorPicker === 'tabTextColor' && (
                                        <Popover
                                            position="bottom center"
                                            onClose={() => setActiveColorPicker(null)}
                                        >
                                            <ColorPalette
                                                value={tabTextColor}
                                                onChange={(color) => {
                                                    setAttributes({ tabTextColor: color });
                                                    setActiveColorPicker(null);
                                                }}
                                            />
                                        </Popover>
                                    )}
                                </div>

                                <div className="fsc-color-control">
                                    <label className="components-base-control__label">{__('Background Color', 'flexible-slider-carousel')}</label>
                                    <div className="fsc-color-indicator-wrapper">
                                        <ColorIndicator
                                            colorValue={tabBackgroundColor}
                                            onClick={() => setActiveColorPicker('tabBackgroundColor')}
                                        />
                                        <Button
                                            className="fsc-color-button"
                                            onClick={() => setAttributes({ tabBackgroundColor: undefined })}
                                        >
                                            {__('Clear', 'flexible-slider-carousel')}
                                        </Button>
                                    </div>
                                    {activeColorPicker === 'tabBackgroundColor' && (
                                        <Popover
                                            position="bottom center"
                                            onClose={() => setActiveColorPicker(null)}
                                        >
                                            <ColorPalette
                                                value={tabBackgroundColor}
                                                onChange={(color) => {
                                                    setAttributes({ tabBackgroundColor: color });
                                                    setActiveColorPicker(null);
                                                }}
                                            />
                                        </Popover>
                                    )}
                                </div>

                                <div className="fsc-color-control">
                                    <label className="components-base-control__label">{__('Border Color', 'flexible-slider-carousel')}</label>
                                    <div className="fsc-color-indicator-wrapper">
                                        <ColorIndicator
                                            colorValue={tabBorderColor}
                                            onClick={() => setActiveColorPicker('tabBorderColor')}
                                        />
                                        <Button
                                            className="fsc-color-button"
                                            onClick={() => setAttributes({ tabBorderColor: undefined })}
                                        >
                                            {__('Clear', 'flexible-slider-carousel')}
                                        </Button>
                                    </div>
                                    {activeColorPicker === 'tabBorderColor' && (
                                        <Popover
                                            position="bottom center"
                                            onClose={() => setActiveColorPicker(null)}
                                        >
                                            <ColorPalette
                                                value={tabBorderColor}
                                                onChange={(color) => {
                                                    setAttributes({ tabBorderColor: color });
                                                    setActiveColorPicker(null);
                                                }}
                                            />
                                        </Popover>
                                    )}
                                </div>
                            </PanelBody>

                            <PanelBody title={__('Tab Colors - Active State', 'flexible-slider-carousel')} initialOpen={false}>
                                <div className="fsc-color-control">
                                    <label className="components-base-control__label">{__('Text Color (Active)', 'flexible-slider-carousel')}</label>
                                    <div className="fsc-color-indicator-wrapper">
                                        <ColorIndicator
                                            colorValue={tabTextColorActive}
                                            onClick={() => setActiveColorPicker('tabTextColorActive')}
                                        />
                                        <Button
                                            className="fsc-color-button"
                                            onClick={() => setAttributes({ tabTextColorActive: undefined })}
                                        >
                                            {__('Clear', 'flexible-slider-carousel')}
                                        </Button>
                                    </div>
                                    {activeColorPicker === 'tabTextColorActive' && (
                                        <Popover
                                            position="bottom center"
                                            onClose={() => setActiveColorPicker(null)}
                                        >
                                            <ColorPalette
                                                value={tabTextColorActive}
                                                onChange={(color) => {
                                                    setAttributes({ tabTextColorActive: color });
                                                    setActiveColorPicker(null);
                                                }}
                                            />
                                        </Popover>
                                    )}
                                </div>

                                <div className="fsc-color-control">
                                    <label className="components-base-control__label">{__('Background Color (Active)', 'flexible-slider-carousel')}</label>
                                    <div className="fsc-color-indicator-wrapper">
                                        <ColorIndicator
                                            colorValue={tabBackgroundColorActive}
                                            onClick={() => setActiveColorPicker('tabBackgroundColorActive')}
                                        />
                                        <Button
                                            className="fsc-color-button"
                                            onClick={() => setAttributes({ tabBackgroundColorActive: undefined })}
                                        >
                                            {__('Clear', 'flexible-slider-carousel')}
                                        </Button>
                                    </div>
                                    {activeColorPicker === 'tabBackgroundColorActive' && (
                                        <Popover
                                            position="bottom center"
                                            onClose={() => setActiveColorPicker(null)}
                                        >
                                            <ColorPalette
                                                value={tabBackgroundColorActive}
                                                onChange={(color) => {
                                                    setAttributes({ tabBackgroundColorActive: color });
                                                    setActiveColorPicker(null);
                                                }}
                                            />
                                        </Popover>
                                    )}
                                </div>

                                <div className="fsc-color-control">
                                    <label className="components-base-control__label">{__('Border Color (Active)', 'flexible-slider-carousel')}</label>
                                    <div className="fsc-color-indicator-wrapper">
                                        <ColorIndicator
                                            colorValue={tabBorderColorActive}
                                            onClick={() => setActiveColorPicker('tabBorderColorActive')}
                                        />
                                        <Button
                                            className="fsc-color-button"
                                            onClick={() => setAttributes({ tabBorderColorActive: undefined })}
                                        >
                                            {__('Clear', 'flexible-slider-carousel')}
                                        </Button>
                                    </div>
                                    {activeColorPicker === 'tabBorderColorActive' && (
                                        <Popover
                                            position="bottom center"
                                            onClose={() => setActiveColorPicker(null)}
                                        >
                                            <ColorPalette
                                                value={tabBorderColorActive}
                                                onChange={(color) => {
                                                    setAttributes({ tabBorderColorActive: color });
                                                    setActiveColorPicker(null);
                                                }}
                                            />
                                        </Popover>
                                    )}
                                </div>
                            </PanelBody>

                            <PanelBody title={__('Tab Layout & Effects', 'flexible-slider-carousel')} initialOpen={false}>
                                <RangeControl
                                    label={__('Padding (px)', 'flexible-slider-carousel')}
                                    value={tabPadding}
                                    onChange={(value) => setAttributes({ tabPadding: value })}
                                    min={0}
                                    max={40}
                                    step={1}
                                />

                                <RangeControl
                                    label={__('Border Radius (px)', 'flexible-slider-carousel')}
                                    value={tabBorderRadius}
                                    onChange={(value) => setAttributes({ tabBorderRadius: value })}
                                    min={0}
                                    max={20}
                                    step={1}
                                />

                                <RangeControl
                                    label={__('Border Width (px)', 'flexible-slider-carousel')}
                                    value={tabBorderWidth}
                                    onChange={(value) => setAttributes({ tabBorderWidth: value })}
                                    min={0}
                                    max={10}
                                    step={1}
                                />

                                <TextControl
                                    label={__('Box Shadow', 'flexible-slider-carousel')}
                                    value={tabBoxShadow}
                                    onChange={(value) => setAttributes({ tabBoxShadow: value })}
                                    placeholder="0 2px 4px rgba(0,0,0,0.1)"
                                    help={__('CSS box-shadow value (e.g., 0 2px 4px rgba(0,0,0,0.1))', 'flexible-slider-carousel')}
                                />

                                <TextControl
                                    label={__('Box Shadow (Active)', 'flexible-slider-carousel')}
                                    value={tabBoxShadowActive}
                                    onChange={(value) => setAttributes({ tabBoxShadowActive: value })}
                                    placeholder="0 4px 8px rgba(0,0,0,0.2)"
                                    help={__('CSS box-shadow value for active state', 'flexible-slider-carousel')}
                                />
                            </PanelBody>
                        </>
                    )}

                    <PanelBody title={__('Navigation Colors', 'flexible-slider-carousel')} initialOpen={false}>
                        <h4>{__('Arrow Colors', 'flexible-slider-carousel')}</h4>

                        <div className="fsc-color-control">
                            <label className="components-base-control__label">{__('Background Color', 'flexible-slider-carousel')}</label>
                            <div className="fsc-color-indicator-wrapper">
                                <ColorIndicator
                                    colorValue={arrowBackgroundColor}
                                    onClick={() => setActiveColorPicker('arrowBackgroundColor')}
                                />
                                <Button
                                    className="fsc-color-button"
                                    onClick={() => setAttributes({ arrowBackgroundColor: undefined })}
                                >
                                    {__('Clear', 'flexible-slider-carousel')}
                                </Button>
                            </div>
                            {activeColorPicker === 'arrowBackgroundColor' && (
                                <Popover
                                    position="bottom center"
                                    onClose={() => setActiveColorPicker(null)}
                                >
                                    <ColorPalette
                                        value={arrowBackgroundColor}
                                        onChange={(color) => {
                                            setAttributes({ arrowBackgroundColor: color });
                                            setActiveColorPicker(null);
                                        }}
                                    />
                                </Popover>
                            )}
                        </div>

                        <div className="fsc-color-control">
                            <label className="components-base-control__label">{__('Background Color (Hover)', 'flexible-slider-carousel')}</label>
                            <div className="fsc-color-indicator-wrapper">
                                <ColorIndicator
                                    colorValue={arrowBackgroundColorHover}
                                    onClick={() => setActiveColorPicker('arrowBackgroundColorHover')}
                                />
                                <Button
                                    className="fsc-color-button"
                                    onClick={() => setAttributes({ arrowBackgroundColorHover: undefined })}
                                >
                                    {__('Clear', 'flexible-slider-carousel')}
                                </Button>
                            </div>
                            {activeColorPicker === 'arrowBackgroundColorHover' && (
                                <Popover
                                    position="bottom center"
                                    onClose={() => setActiveColorPicker(null)}
                                >
                                    <ColorPalette
                                        value={arrowBackgroundColorHover}
                                        onChange={(color) => {
                                            setAttributes({ arrowBackgroundColorHover: color });
                                            setActiveColorPicker(null);
                                        }}
                                    />
                                </Popover>
                            )}
                        </div>

                        <div className="fsc-color-control">
                            <label className="components-base-control__label">{__('Arrow Color', 'flexible-slider-carousel')}</label>
                            <div className="fsc-color-indicator-wrapper">
                                <ColorIndicator
                                    colorValue={arrowTextColor}
                                    onClick={() => setActiveColorPicker('arrowTextColor')}
                                />
                                <Button
                                    className="fsc-color-button"
                                    onClick={() => setAttributes({ arrowTextColor: undefined })}
                                >
                                    {__('Clear', 'flexible-slider-carousel')}
                                </Button>
                            </div>
                            {activeColorPicker === 'arrowTextColor' && (
                                <Popover
                                    position="bottom center"
                                    onClose={() => setActiveColorPicker(null)}
                                >
                                    <ColorPalette
                                        value={arrowTextColor}
                                        onChange={(color) => {
                                            setAttributes({ arrowTextColor: color });
                                            setActiveColorPicker(null);
                                        }}
                                    />
                                </Popover>
                            )}
                        </div>

                        <h4>{__('Dot Colors', 'flexible-slider-carousel')}</h4>

                        <div className="fsc-color-control">
                            <label className="components-base-control__label">{__('Background Color (Normal)', 'flexible-slider-carousel')}</label>
                            <div className="fsc-color-indicator-wrapper">
                                <ColorIndicator
                                    colorValue={dotBackgroundColor}
                                    onClick={() => setActiveColorPicker('dotBackgroundColor')}
                                />
                                <Button
                                    className="fsc-color-button"
                                    onClick={() => setAttributes({ dotBackgroundColor: undefined })}
                                >
                                    {__('Clear', 'flexible-slider-carousel')}
                                </Button>
                            </div>
                            {activeColorPicker === 'dotBackgroundColor' && (
                                <Popover
                                    position="bottom center"
                                    onClose={() => setActiveColorPicker(null)}
                                >
                                    <ColorPalette
                                        value={dotBackgroundColor}
                                        onChange={(color) => {
                                            setAttributes({ dotBackgroundColor: color });
                                            setActiveColorPicker(null);
                                        }}
                                    />
                                </Popover>
                            )}
                        </div>

                        <div className="fsc-color-control">
                            <label className="components-base-control__label">{__('Background Color (Hover)', 'flexible-slider-carousel')}</label>
                            <div className="fsc-color-indicator-wrapper">
                                <ColorIndicator
                                    colorValue={dotBackgroundColorHover}
                                    onClick={() => setActiveColorPicker('dotBackgroundColorHover')}
                                />
                                <Button
                                    className="fsc-color-button"
                                    onClick={() => setAttributes({ dotBackgroundColorHover: undefined })}
                                >
                                    {__('Clear', 'flexible-slider-carousel')}
                                </Button>
                            </div>
                            {activeColorPicker === 'dotBackgroundColorHover' && (
                                <Popover
                                    position="bottom center"
                                    onClose={() => setActiveColorPicker(null)}
                                >
                                    <ColorPalette
                                        value={dotBackgroundColorHover}
                                        onChange={(color) => {
                                            setAttributes({ dotBackgroundColorHover: color });
                                            setActiveColorPicker(null);
                                        }}
                                    />
                                </Popover>
                            )}
                        </div>

                        <div className="fsc-color-control">
                            <label className="components-base-control__label">{__('Background Color (Active)', 'flexible-slider-carousel')}</label>
                            <div className="fsc-color-indicator-wrapper">
                                <ColorIndicator
                                    colorValue={dotBackgroundColorActive}
                                    onClick={() => setActiveColorPicker('dotBackgroundColorActive')}
                                />
                                <Button
                                    className="fsc-color-button"
                                    onClick={() => setAttributes({ dotBackgroundColorActive: undefined })}
                                >
                                    {__('Clear', 'flexible-slider-carousel')}
                                </Button>
                            </div>
                            {activeColorPicker === 'dotBackgroundColorActive' && (
                                <Popover
                                    position="bottom center"
                                    onClose={() => setActiveColorPicker(null)}
                                >
                                    <ColorPalette
                                        value={dotBackgroundColorActive}
                                        onChange={(color) => {
                                            setAttributes({ dotBackgroundColorActive: color });
                                            setActiveColorPicker(null);
                                        }}
                                    />
                                </Popover>
                            )}
                        </div>


                    </PanelBody>

                </PanelBody>

                <PanelBody title={__('Performance & SEO', 'flexible-slider-carousel')} initialOpen={false}>
                    <ToggleControl
                        label={__('Lazy Loading', 'flexible-slider-carousel')}
                        checked={loading}
                        onChange={(value) => setAttributes({ loading: value })}
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
                        previewBreakpoint={previewBreakpoint}
                        onPreviewBreakpointChange={setPreviewBreakpoint}
                        is3DEffect={['flip', 'creative', 'cube'].includes(animationType)}
                    />
                </PanelBody>


            </InspectorControls>

            <div {...blockProps}>
                {error && (
                    <Notice status="error" isDismissible={false}>
                        {error}
                    </Notice>
                )}

                {/* Text Navigation Above Slider */}
                {showTextNavigation && textNavigationPosition === 'above' && (
                    <div className="fsc-slider__text-nav-editor fsc-slider__text-nav-editor--above">
                        <div className="fsc-slider__frame-titles-editor">
                            {Array.from({ length: Math.max(1, frameCount) }, (_, i) => {
                                const frameBlock = wp.data.select('core/block-editor').getBlock(clientId)?.innerBlocks[i];
                                const frameTitle = frameBlock?.attributes?.frameTitle;
                                const title = frameTitle ||
                                    frameBlock?.attributes?.content?.replace(/<[^>]*>/g, '').substring(0, 20) ||
                                    `${__('Frame', 'flexible-slider-carousel')} ${i + 1}`;

                                return (
                                    <button
                                        key={i}
                                        className="fsc-slider__frame-title-editor"
                                        style={{
                                            fontSize: `${tabFontSize}px`,
                                            fontWeight: tabFontWeight,
                                            textAlign: tabTextAlign,
                                            padding: `${tabPadding}px`,
                                            borderRadius: `${tabBorderRadius}px`,
                                            borderWidth: `${tabBorderWidth}px`,
                                            borderStyle: 'solid',
                                            color: tabTextColor,
                                            backgroundColor: tabBackgroundColor,
                                            borderColor: tabBorderColor,
                                            boxShadow: tabBoxShadow
                                        }}
                                        onClick={() => {
                                            const framesContainer = document.querySelector(`[data-block="${clientId}"] .fsc-slider__frames-editor`);
                                            if (framesContainer) {
                                                const frameWidth = framesContainer.querySelector('.fsc-frame')?.offsetWidth || 0;
                                                const currentGap = gap || 10;
                                                const containerWidth = framesContainer.offsetWidth;

                                                if (centeredSlides !== false) {
                                                    // Center the target frame
                                                    const targetScroll = i * (frameWidth + currentGap);
                                                    const centerOffset = (containerWidth - frameWidth) / 2;
                                                    framesContainer.scrollLeft = targetScroll - centerOffset;
                                                } else {
                                                    // Standard left-aligned scrolling
                                                    framesContainer.scrollLeft = i * (frameWidth + currentGap);
                                                }
                                            }
                                        }}
                                    >
                                        {title}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="fsc-slider__preview">
                    <div className="fsc-slider__preview-header">
                        <h4>{__('Slider Preview', 'flexible-slider-carousel')}</h4>
                        <div className="fsc-slider__preview-badges">
                            <span className="fsc-slider__badge fsc-slider__badge--design">
                                {sliderDesign ? sliderDesign.charAt(0).toUpperCase() + sliderDesign.slice(1) : 'Default'}
                            </span>
                        </div>
                    </div>

                    <div className="fsc-slider__preview-content">
                        <div className="fsc-slider__frames-container">
                            {/* Show only the configured number of frames in editor preview */}
                            <div
                                {...innerBlocksProps}
                                style={{
                                    display: 'flex',
                                    gap: `${gap || 10}px`,
                                    overflow: 'hidden',
                                    width: '100%'
                                }}
                                className="fsc-slider__frames-editor"
                                data-slides-to-show={slidesToShow?.desktop || 1}
                            />

                            {/* Apply slidesToShow styling to frames */}
                            <style>
                                {`
                                    [data-block="${clientId}"] .fsc-slider__frames-editor .fsc-frame {
                                        flex: 0 0 calc((100% - ${((slidesToShow?.desktop || 1) - 1) * (gap || 10)}px) / ${slidesToShow?.desktop || 1}) !important;
                                        min-width: calc((100% - ${((slidesToShow?.desktop || 1) - 1) * (gap || 10)}px) / ${slidesToShow?.desktop || 1}) !important;
                                        max-width: calc((100% - ${((slidesToShow?.desktop || 1) - 1) * (gap || 10)}px) / ${slidesToShow?.desktop || 1}) !important;
                                    }
                                `}
                            </style>

                            {/* Editor Navigation Arrows - Only show if enabled */}
                            {showNavigation && (
                                <>
                                    <button
                                        className="swiper-button-prev"
                                        style={{
                                            backgroundColor: arrowBackgroundColor || '#007cba',
                                            color: arrowTextColor || '#ffffff',
                                            position: 'absolute',
                                            left: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            zIndex: 10
                                        }}
                                        onClick={() => {
                                            const framesContainer = document.querySelector(`[data-block="${clientId}"] .fsc-slider__frames-editor`);
                                            if (framesContainer) {
                                                const frameWidth = framesContainer.querySelector('.fsc-frame')?.offsetWidth || 0;
                                                const currentGap = gap || 10;
                                                const containerWidth = framesContainer.offsetWidth;

                                                if (centeredSlides !== false) {
                                                    // Center the previous frame
                                                    const scrollPosition = framesContainer.scrollLeft - (frameWidth + currentGap);
                                                    const centerOffset = (containerWidth - frameWidth) / 2;
                                                    framesContainer.scrollLeft = scrollPosition - centerOffset;
                                                } else {
                                                    // Standard left-aligned scrolling
                                                    framesContainer.scrollLeft -= (frameWidth + currentGap);
                                                }
                                            }
                                        }}
                                    >
                                        ‹
                                    </button>

                                    <button
                                        className="swiper-button-next"
                                        style={{
                                            backgroundColor: arrowBackgroundColor || '#007cba',
                                            color: arrowTextColor || '#ffffff',
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            zIndex: 10
                                        }}
                                        onClick={() => {
                                            const framesContainer = document.querySelector(`[data-block="${clientId}"] .fsc-slider__frames-editor`);
                                            if (framesContainer) {
                                                const frameWidth = framesContainer.querySelector('.fsc-frame')?.offsetWidth || 0;
                                                const currentGap = gap || 10;
                                                const containerWidth = framesContainer.offsetWidth;

                                                if (centeredSlides !== false) {
                                                    // Center the next frame
                                                    const scrollPosition = framesContainer.scrollLeft + (frameWidth + currentGap);
                                                    const centerOffset = (containerWidth - frameWidth) / 2;
                                                    framesContainer.scrollLeft = scrollPosition - centerOffset;
                                                } else {
                                                    // Standard right-aligned scrolling
                                                    framesContainer.scrollLeft += (frameWidth + currentGap);
                                                }
                                            }
                                        }}
                                    >
                                        ›
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Editor Navigation Dots - Only show if enabled */}
                        {showDots && (
                            <div className="swiper-pagination">
                                {Array.from({ length: Math.max(1, frameCount) }, (_, i) => (
                                    <button
                                        key={i}
                                        className="swiper-pagination-bullet"
                                        style={{
                                            backgroundColor: dotBackgroundColor || '#007cba'
                                        }}
                                        onClick={() => {
                                            const framesContainer = document.querySelector(`[data-block="${clientId}"] .fsc-slider__frames-editor`);
                                            if (framesContainer) {
                                                const frameWidth = framesContainer.querySelector('.fsc-frame')?.offsetWidth || 0;
                                                const currentGap = gap || 10;
                                                const containerWidth = framesContainer.offsetWidth;

                                                if (centeredSlides !== false) {
                                                    // Center the target frame
                                                    const targetScroll = i * (frameWidth + currentGap);
                                                    const centerOffset = (containerWidth - frameWidth) / 2;
                                                    framesContainer.scrollLeft = targetScroll - centerOffset;
                                                } else {
                                                    // Standard left-aligned scrolling
                                                    framesContainer.scrollLeft = i * (frameWidth + currentGap);
                                                }
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Editor Text Navigation Below Slider */}
                        {showTextNavigation && textNavigationPosition === 'below' && (
                            <div className="fsc-slider__text-nav-editor fsc-slider__text-nav-editor--below">
                                <div className="fsc-slider__frame-titles-editor">
                                    {Array.from({ length: Math.max(1, frameCount) }, (_, i) => {
                                        const frameBlock = wp.data.select('core/block-editor').getBlock(clientId)?.innerBlocks[i];
                                        const frameTitle = frameBlock?.attributes?.frameTitle;
                                        const title = frameTitle ||
                                            frameBlock?.attributes?.content?.replace(/<[^>]*>/g, '').substring(0, 20) ||
                                            `${__('Frame', 'flexible-slider-carousel')} ${i + 1}`;

                                        return (
                                            <button
                                                key={i}
                                                className="fsc-slider__frame-title-editor"
                                                style={{
                                                    fontSize: `${tabFontSize}px`,
                                                    fontWeight: tabFontWeight,
                                                    textAlign: tabTextAlign,
                                                    padding: `${tabPadding}px`,
                                                    borderRadius: `${tabBorderRadius}px`,
                                                    borderWidth: `${tabBorderWidth}px`,
                                                    borderStyle: 'solid',
                                                    color: tabTextColor,
                                                    backgroundColor: tabBackgroundColor,
                                                    borderColor: tabBorderColor,
                                                    boxShadow: tabBoxShadow
                                                }}
                                                onClick={() => {
                                                    const framesContainer = document.querySelector(`[data-block="${clientId}"] .fsc-slider__frames-editor`);
                                                    if (framesContainer) {
                                                        const frameWidth = framesContainer.querySelector('.fsc-frame')?.offsetWidth || 0;
                                                        const currentGap = gap || 10;
                                                        framesContainer.scrollLeft = i * (frameWidth + currentGap);
                                                    }
                                                }}
                                            >
                                                {title}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="fsc-slider__preview-info">
                        <p><strong>{__('Configuration:', 'flexible-slider-carousel')}</strong></p>
                        <ul>
                            <li>{__('Design:', 'flexible-slider-carousel')} {sliderDesign || 'Default'}</li>
                            <li>{__('Content:', 'flexible-slider-carousel')} {__('Manual Frames', 'flexible-slider-carousel')}</li>
                            <li>{__('Animation:', 'flexible-slider-carousel')} {/* transition */}</li>
                            {autoPlay && <li>{__('Auto Play:', 'flexible-slider-carousel')} {autoPlaySpeed}s</li>}
                            {(showNavigation || showDots || showTextNavigation) && <li>{__('Navigation:', 'flexible-slider-carousel')} {showNavigation ? __('Arrows', 'flexible-slider-carousel') : ''} {showDots ? __('Dots', 'flexible-slider-carousel') : ''} {showTextNavigation ? __('Text', 'flexible-slider-carousel') : ''}</li>}
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
const ResponsiveSettings = ({ settings, onChange, slidesToShow, slidesToScroll, onSlidesToShowChange, onSlidesToScrollChange, previewBreakpoint, onPreviewBreakpointChange, is3DEffect }) => {
    const [activeTab, setActiveTab] = useState('desktop');

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

    const renderBreakpointSettings = (breakpoint) => (
        <div className="fsc-breakpoint-settings">
            {breakpoint !== 'phone' && (
                <RangeControl
                    label={__('Min Width (px)', 'flexible-slider-carousel')}
                    value={settings[breakpoint]?.minWidth !== undefined ? settings[breakpoint].minWidth : 0}
                    onChange={(value) => updateBreakpoint(breakpoint, 'minWidth', value)}
                    min={0}
                    max={2000}
                    step={10}
                />
            )}

            <RangeControl
                label={__('Inner Padding (px)', 'flexible-slider-carousel')}
                value={settings[breakpoint]?.innerPadding !== undefined ? settings[breakpoint].innerPadding : 10}
                onChange={(value) => updateBreakpoint(breakpoint, 'innerPadding', value)}
                min={0}
                max={100}
                step={5}
                help={__('Padding inside frames (Standard: 10px)', 'flexible-slider-carousel')}
            />

            {is3DEffect ? (
                <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
                    <RangeControl
                        label={__('Slides To Show (Fixed at 1 for 3D effects)', 'flexible-slider-carousel')}
                        value={1}
                        min={1}
                        max={1}
                        step={1}
                        disabled={true}
                    />
                    <RangeControl
                        label={__('Slides To Scroll (Fixed at 1 for 3D effects)', 'flexible-slider-carousel')}
                        value={1}
                        min={1}
                        max={1}
                        step={1}
                        disabled={true}
                    />
                </div>
            ) : (
                <>
                    <RangeControl
                        label={__('Slides To Show', 'flexible-slider-carousel')}
                        value={Math.round((slidesToShow[breakpoint] || 1) * 10)}
                        onChange={(value) => updateSlidesToShow(breakpoint, value / 10)}
                        min={10}
                        max={50}
                        step={1}
                        help={__('10 = 1.0 frames, 15 = 1.5 frames, 23 = 2.3 frames, etc. Use for precise peek control.', 'flexible-slider-carousel')}
                    />

                    <RangeControl
                        label={__('Slides To Scroll', 'flexible-slider-carousel')}
                        value={slidesToScroll[breakpoint] || 1}
                        onChange={(value) => updateSlidesToScroll(breakpoint, value)}
                        min={1}
                        max={5}
                        step={1}
                    />
                </>
            )}
        </div>
    );

    return (
        <div className="fsc-responsive-settings">
            {/* Tab Navigation */}
            <div className="fsc-responsive-tabs">
                {['desktop', 'tablet', 'phone'].map(breakpoint => (
                    <button
                        key={breakpoint}
                        className={`fsc-responsive-tab ${activeTab === breakpoint ? 'fsc-responsive-tab--active' : ''}`}
                        onClick={() => {
                            setActiveTab(breakpoint);
                            onPreviewBreakpointChange(breakpoint);
                        }}
                    >
                        {breakpoint.charAt(0).toUpperCase() + breakpoint.slice(1)}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="fsc-responsive-tab-content">
                {activeTab === 'desktop' && renderBreakpointSettings('desktop')}
                {activeTab === 'tablet' && renderBreakpointSettings('tablet')}
                {activeTab === 'phone' && renderBreakpointSettings('phone')}
            </div>
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