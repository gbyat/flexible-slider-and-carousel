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
        transition,
        transitionSpeed,
        easing,
        loop,
        loading,
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
        tabTextColorActive,
        tabBackgroundColor,
        tabBackgroundColorActive,
        tabBorderColor,
        tabBorderColorActive,
        tabBoxShadow,
        tabBoxShadowActive
    } = attributes;

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeColorPicker, setActiveColorPicker] = useState(null);
    const [previewBreakpoint, setPreviewBreakpoint] = useState('desktop');

    const blockProps = useBlockProps({
        className: `fsc-slider fsc-slider--${sliderDesign || 'default'}`,
        style: {
            textAlign: align
        },
        'data-slides-desktop': responsiveSettings?.slidesToShow?.desktop || 3,
        'data-slides-tablet': responsiveSettings?.slidesToShow?.tablet || 2,
        'data-slides-phone': responsiveSettings?.slidesToShow?.phone || 1,
        'data-preview-breakpoint': previewBreakpoint
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

    // Calculate current visible range for editor navigation
    const getCurrentVisibleRange = () => {
        const currentSlidesToShow = responsiveSettings?.slidesToShow?.desktop || 3;
        const startIndex = 0; // Editor always starts at 0
        const endIndex = Math.min(startIndex + currentSlidesToShow - 1, Math.max(0, frameCount - 1));
        return { startIndex, endIndex };
    };

    // Validate minimum frames
    useEffect(() => {
        if (frameCount < 1) {
            setError(__('Slider must have at least one frame.', 'flexible-slider-carousel'));
        } else {
            setError('');
        }
    }, [frameCount]);

    // Force re-render when tab styling attributes change
    useEffect(() => {
        // This will trigger a re-render when tab styling changes
    }, [tabFontSize, tabFontWeight, tabTextAlign, tabPadding, tabBorderRadius, tabBorderWidth,
        tabTextColor, tabTextColorActive, tabBackgroundColor, tabBackgroundColorActive,
        tabBorderColor, tabBorderColorActive, tabBoxShadow, tabBoxShadowActive]);

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
                        value={transition}
                        options={[
                            { label: __('Slide', 'flexible-slider-carousel'), value: 'slide' },
                            { label: __('Fade', 'flexible-slider-carousel'), value: 'fade' }
                        ]}
                        onChange={(value) => setAttributes({ transition: value })}
                        help={__('Slide is recommended for carousels', 'flexible-slider-carousel')}
                    />

                    <RangeControl
                        label={__('Animation Speed (ms)', 'flexible-slider-carousel')}
                        value={transitionSpeed}
                        onChange={(value) => setAttributes({ transitionSpeed: value })}
                        min={200}
                        max={2000}
                        step={100}
                    />

                    <SelectControl
                        label={__('Animation Easing', 'flexible-slider-carousel')}
                        value={easing}
                        options={[
                            { label: __('Ease', 'flexible-slider-carousel'), value: 'ease' },
                            { label: __('Ease-in', 'flexible-slider-carousel'), value: 'ease-in' },
                            { label: __('Ease-out', 'flexible-slider-carousel'), value: 'ease-out' },
                            { label: __('Ease-in-out', 'flexible-slider-carousel'), value: 'ease-in-out' },
                            { label: __('Linear', 'flexible-slider-carousel'), value: 'linear' }
                        ]}
                        onChange={(value) => setAttributes({ easing: value })}
                    />
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

                                const { startIndex, endIndex } = getCurrentVisibleRange();
                                const isInRange = i >= startIndex && i <= endIndex;

                                return (
                                    <button
                                        key={i}
                                        className={`fsc-slider__frame-title-editor ${isInRange ? 'fsc-slider__frame-title-editor--active' : ''}`}
                                        style={{
                                            fontSize: `${tabFontSize}px`,
                                            fontWeight: tabFontWeight,
                                            textAlign: tabTextAlign,
                                            padding: `${tabPadding}px`,
                                            borderRadius: `${tabBorderRadius}px`,
                                            borderWidth: `${tabBorderWidth}px`,
                                            borderStyle: 'solid',
                                            color: isInRange ? tabTextColorActive : tabTextColor,
                                            backgroundColor: isInRange ? tabBackgroundColorActive : tabBackgroundColor,
                                            borderColor: isInRange ? tabBorderColorActive : tabBorderColor,
                                            boxShadow: isInRange ? tabBoxShadowActive : tabBoxShadow
                                        }}
                                        onClick={() => {
                                            const framesContainer = document.querySelector(`[data-block="${clientId}"] .fsc-slider__frames`);
                                            if (framesContainer) {
                                                const frameWidth = framesContainer.querySelector('.fsc-frame')?.offsetWidth || 0;
                                                const gap = 20;
                                                framesContainer.scrollLeft = i * (frameWidth + gap);
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
                            <div {...innerBlocksProps} />

                            {/* Editor Navigation Arrows - Only show if enabled */}
                            {showNavigation && (
                                <>
                                    <button
                                        className="fsc-slider__nav-editor fsc-slider__nav-editor--prev"
                                        onClick={() => {
                                            const framesContainer = document.querySelector(`[data-block="${clientId}"] .fsc-slider__frames`);
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
                                            const framesContainer = document.querySelector(`[data-block="${clientId}"] .fsc-slider__frames`);
                                            if (framesContainer) {
                                                const frameWidth = framesContainer.querySelector('.fsc-frame')?.offsetWidth || 0;
                                                const gap = 20;
                                                framesContainer.scrollLeft += (frameWidth + gap);
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
                            <div className="fsc-slider__dots-editor">
                                {Array.from({ length: Math.max(1, frameCount) }, (_, i) => {
                                    const { startIndex, endIndex } = getCurrentVisibleRange();
                                    const isInRange = i >= startIndex && i <= endIndex;

                                    return (
                                        <button
                                            key={i}
                                            className={`fsc-slider__dot-editor ${isInRange ? 'fsc-slider__dot-editor--active' : ''}`}
                                            onClick={() => {
                                                const framesContainer = document.querySelector(`[data-block="${clientId}"] .fsc-slider__frames`);
                                                if (framesContainer) {
                                                    const frameWidth = framesContainer.querySelector('.fsc-frame')?.offsetWidth || 0;
                                                    const gap = 20;
                                                    framesContainer.scrollLeft = i * (frameWidth + gap);
                                                }
                                            }}
                                        />
                                    );
                                })}
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

                                        const { startIndex, endIndex } = getCurrentVisibleRange();
                                        const isInRange = i >= startIndex && i <= endIndex;

                                        return (
                                            <button
                                                key={i}
                                                className={`fsc-slider__frame-title-editor ${isInRange ? 'fsc-slider__frame-title-editor--active' : ''}`}
                                                style={{
                                                    fontSize: `${tabFontSize}px`,
                                                    fontWeight: tabFontWeight,
                                                    textAlign: tabTextAlign,
                                                    padding: `${tabPadding}px`,
                                                    borderRadius: `${tabBorderRadius}px`,
                                                    borderWidth: `${tabBorderWidth}px`,
                                                    borderStyle: 'solid',
                                                    color: isInRange ? tabTextColorActive : tabTextColor,
                                                    backgroundColor: isInRange ? tabBackgroundColorActive : tabBackgroundColor,
                                                    borderColor: isInRange ? tabBorderColorActive : tabBorderColor,
                                                    boxShadow: isInRange ? tabBoxShadowActive : tabBoxShadow
                                                }}
                                                onClick={() => {
                                                    const framesContainer = document.querySelector(`[data-block="${clientId}"] .fsc-slider__frames`);
                                                    if (framesContainer) {
                                                        const frameWidth = framesContainer.querySelector('.fsc-frame')?.offsetWidth || 0;
                                                        const gap = 20;
                                                        framesContainer.scrollLeft = i * (frameWidth + gap);
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
                            <li>{__('Animation:', 'flexible-slider-carousel')} {transition}</li>
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
const ResponsiveSettings = ({ settings, onChange, slidesToShow, slidesToScroll, onSlidesToShowChange, onSlidesToScrollChange, previewBreakpoint, onPreviewBreakpointChange }) => {
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
                    value={settings[breakpoint]?.minWidth || 0}
                    onChange={(value) => updateBreakpoint(breakpoint, 'minWidth', value)}
                    min={0}
                    max={2000}
                    step={10}
                />
            )}

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