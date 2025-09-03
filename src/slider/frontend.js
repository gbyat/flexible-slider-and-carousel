/**
 * Flexible Slider & Carousel Frontend Script with Swiper.js
 * @package FlexibleSliderCarousel
 */

import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay, Keyboard, EffectFade, EffectFlip, EffectCoverflow, EffectCreative, EffectCube, EffectCards, Grid } from 'swiper/modules';
// We provide our own CSS; no direct Swiper CSS imports to avoid loader conflicts

(function () {
    'use strict';

    class FlexibleSlider {
        constructor(element) {
            this.slider = element;
            this.frames = this.slider.querySelectorAll('.fsc-frame');
            this.totalSlides = this.frames.length;

            // Get slider settings from data attributes
            this.settings = this.getSliderSettings();

            // Initialize Swiper.js
            this.initSwiper();
        }



        getSliderSettings() {
            return {
                autoPlay: this.slider.dataset.autoPlay === 'true',
                autoPlaySpeed: parseInt(this.slider.dataset.autoPlaySpeed) || 5000,
                loop: this.slider.dataset.loop === 'true',
                touchSwipe: this.slider.dataset.touchSwipe === 'true',
                transition: this.slider.dataset.transition || 'slide',
                transitionSpeed: parseInt(this.slider.dataset.transitionSpeed) || 500,
                showNavigation: this.slider.dataset.showNavigation === 'true',
                showDots: this.slider.dataset.showDots === 'true',
                showTextNavigation: this.slider.dataset.showTextNavigation === 'true',
                textNavigationPosition: this.slider.dataset.textNavigationPosition || 'below',
                breakpoints: {
                    desktop: parseInt(this.slider.dataset.breakpointDesktop) || 1140,
                    tablet: parseInt(this.slider.dataset.breakpointTablet) || 1024,
                    phone: parseInt(this.slider.dataset.breakpointPhone) || 768
                },
                slidesToShow: {
                    desktop: parseFloat(this.slider.dataset.slidesDesktop) || 1,
                    tablet: parseFloat(this.slider.dataset.slidesTablet) || 1,
                    phone: parseFloat(this.slider.dataset.slidesPhone) || 1
                },
                slidesToScroll: {
                    desktop: parseInt(this.slider.dataset.slidesScrollDesktop) || 1,
                    tablet: parseInt(this.slider.dataset.slidesScrollTablet) || 1,
                    phone: parseInt(this.slider.dataset.slidesScrollPhone) || 1
                },
                // Tab Styling Settings
                tabFontSize: parseInt(this.slider.dataset.tabFontSize) || 14,
                tabFontWeight: this.slider.dataset.tabFontWeight || 'normal',
                tabTextAlign: this.slider.dataset.tabTextAlign || 'center',
                tabPadding: parseInt(this.slider.dataset.tabPadding) || 8,
                tabBorderRadius: parseInt(this.slider.dataset.tabBorderRadius) || 4,
                tabBorderWidth: parseInt(this.slider.dataset.tabBorderWidth) || 1,
                tabTextColor: this.slider.dataset.tabTextColor || '#333333',
                tabTextColorHover: this.slider.dataset.tabTextColorHover || '#ffffff',
                tabTextColorActive: this.slider.dataset.tabTextColorActive || '#ffffff',
                tabBackgroundColor: this.slider.dataset.tabBackgroundColor || '#f5f5f5',
                tabBackgroundColorHover: this.slider.dataset.tabBackgroundColorHover || '#00a0d2',
                tabBackgroundColorActive: this.slider.dataset.tabBackgroundColorActive || '#007cba',
                tabBorderColor: this.slider.dataset.tabBorderColor || '#dddddd',
                tabBorderColorHover: this.slider.dataset.tabBorderColorHover || '#00a0d2',
                tabBorderColorActive: this.slider.dataset.tabBorderColorActive || '#007cba',
                tabBoxShadow: this.slider.dataset.tabBoxShadow || '0 1px 3px rgba(0,0,0,0.1)',
                tabBoxShadowActive: this.slider.dataset.tabBoxShadowActive || '0 2px 6px rgba(0,0,0,0.2)',
                // Frame Styling Settings
                frameBorderRadius: this.slider.dataset.frameBorderRadius !== undefined ? parseInt(this.slider.dataset.frameBorderRadius) : 8,
                frameBorderWidth: this.slider.dataset.frameBorderWidth !== undefined ? parseInt(this.slider.dataset.frameBorderWidth) : 0,
                frameBorderColor: this.slider.dataset.frameBorderColor || '#dddddd',
                frameBoxShadow: this.slider.dataset.frameBoxShadow || 'none',
                // Navigation Colors
                arrowBackgroundColor: this.slider.dataset.arrowBackgroundColor || '#007cba',
                arrowBackgroundColorHover: this.slider.dataset.arrowBackgroundColorHover || '#005a87',
                arrowTextColor: this.slider.dataset.arrowTextColor || '#ffffff',
                dotBackgroundColor: this.slider.dataset.dotBackgroundColor || '#dddddd',
                dotBackgroundColorHover: this.slider.dataset.dotBackgroundColorHover || '#00a0d2',
                dotBackgroundColorActive: this.slider.dataset.dotBackgroundColorActive || '#007cba',
                // Arrow sizing
                arrowSize: this.slider.dataset.arrowSize !== undefined ? parseInt(this.slider.dataset.arrowSize) : 40,
                arrowPadding: this.slider.dataset.arrowPadding !== undefined ? parseInt(this.slider.dataset.arrowPadding) : 10,
                arrowBorderRadius: this.slider.dataset.arrowBorderRadius !== undefined ? parseInt(this.slider.dataset.arrowBorderRadius) : 4,
                // Swiper related defaults mapped from data-* attributes
                sliderType: this.slider.dataset.sliderType || 'carousel',
                gap: this.slider.dataset.gap !== undefined ? parseInt(this.slider.dataset.gap) : 10,
                animationDuration: parseInt(this.slider.dataset.animationDuration) || 400,
                // Responsive Settings
                innerPaddingDesktop: parseInt(this.slider.dataset.responsiveDesktopPadding) || 10,
                innerPaddingTablet: parseInt(this.slider.dataset.responsiveTabletPadding) || 10,
                innerPaddingPhone: parseInt(this.slider.dataset.responsivePhonePadding) || 10,
                animationTimingFunc: this.slider.dataset.animationTimingFunc || 'cubic-bezier(0.165, 0.840, 0.440, 1.000)',
                animationType: this.slider.dataset.animationType || 'slide',
                animationDirection: this.slider.dataset.animationDirection || 'horizontal',
                animationIntensity: parseInt(this.slider.dataset.animationIntensity) || 50,
                focusAt: this.slider.dataset.focusAt || 'center',
                peek: parseInt(this.slider.dataset.peek) || 0,
                keyboard: this.slider.dataset.keyboard === 'true',
                touchRatio: parseFloat(this.slider.dataset.touchRatio) || 0.5,
                centeredSlides: this.slider.dataset.centeredSlides === 'true',
                gridRows: parseInt(this.slider.dataset.gridRows) || 1,
                gridFill: this.slider.dataset.gridFill || 'row'
            };
        }


        initSwiper() {
            console.log('Initializing Swiper with', this.totalSlides, 'slides');
            console.log('Slider settings:', this.settings);

            // Debug specific settings
            console.log('=== SWIPER SETTINGS DEBUG ===');
            console.log('Slider Type:', this.settings.sliderType, 'Loop:', this.settings.sliderType === 'carousel');
            console.log('Autoplay:', this.settings.autoPlay, 'Speed:', this.settings.autoPlaySpeed);
            console.log('Peek:', this.settings.peek);
            console.log('Keyboard:', this.settings.keyboard);
            console.log('Raw data attributes:');
            console.log('- data-slider-type:', this.slider.dataset.sliderType);
            console.log('- data-auto-play:', this.slider.dataset.autoPlay);
            console.log('- data-auto-play-speed:', this.slider.dataset.autoPlaySpeed);
            console.log('- data-peek:', this.slider.dataset.peek);
            console.log('- data-keyboard:', this.slider.dataset.keyboard);
            console.log('================================');

            if (this.totalSlides <= 1) {
                console.log('Not enough slides, skipping Swiper initialization');
                return;
            }

            try {
                // Prepare HTML structure for Swiper.js
                this.prepareSwiperStructure();
                console.log('Swiper structure prepared');

                // Create text navigation if enabled
                if (this.settings.showTextNavigation) {
                    this.createTextNavigation();
                    console.log('Text navigation created');
                }

                // Initialize Swiper with responsive breakpoints
                const effectMap = {
                    slide: 'slide',
                    fade: 'fade',
                    flip: 'flip',
                    coverflow: 'coverflow',
                    creative: 'creative',
                    cube: 'cube',
                    cards: 'cards'
                };

                // Handle navigation elements visibility and positioning
                const navigationElements = this.slider.querySelectorAll('.swiper-button-prev, .swiper-button-next');
                navigationElements.forEach(element => {
                    if (this.settings.showNavigation) {
                        element.style.display = 'flex';
                        element.style.position = 'absolute';
                        element.style.top = '50%';
                        element.style.transform = 'translateY(-50%)';
                        element.style.zIndex = '10';
                        // Use Swiper CSS variables for size & color
                        element.style.setProperty('--swiper-navigation-size', this.settings.arrowSize + 'px');
                        element.style.setProperty('--swiper-navigation-color', this.settings.arrowTextColor);
                        // Add visible text arrows if empty
                        if (!element.textContent || element.textContent.trim() === '') {
                            element.textContent = element.classList.contains('swiper-button-prev') ? '‹' : '›';
                        }
                        // Apply sizing and shape
                        element.style.width = this.settings.arrowSize + 'px';
                        element.style.height = this.settings.arrowSize + 'px';
                        element.style.padding = this.settings.arrowPadding + 'px';
                        element.style.borderRadius = this.settings.arrowBorderRadius + 'px';
                        element.style.alignItems = 'center';
                        element.style.justifyContent = 'center';
                        element.style.border = 'none';
                        element.style.cursor = 'pointer';
                        element.style.backgroundColor = this.settings.arrowBackgroundColor;
                        element.style.color = this.settings.arrowTextColor;
                        // Scale icon based on available inner box size
                        element.style.fontSize = this.settings.arrowSize + 'px';
                        element.style.lineHeight = '1';
                    } else {
                        element.style.display = 'none';
                    }
                });

                // For fade effect, if user wants to show multiple slides, fallback to slide effect
                let effect = effectMap[this.settings.animationType];
                if (effect === 'fade' && this.settings.slidesToShow.desktop > 1) {
                    console.log('⚠️ Fade effect requested but slidesToShow > 1, falling back to slide effect');
                    effect = 'slide';
                }

                // Cards effect - removed minimum frame restriction, allowing any frame count
                if (effect === 'cards') {
                    console.log('🎯 Cards effect detected - allowing any frame count');
                }

                // Set data-effect attribute for CSS targeting
                const swiperElement = this.slider.querySelector('.swiper');
                if (effect && effect !== 'slide') {
                    swiperElement.setAttribute('data-effect', effect);
                }

                // Removed peek distance - using only Swiper's native features

                // Set CSS variables for colors on both the main slider container and swiper element
                if (this.settings.arrowBackgroundColor) {
                    this.slider.style.setProperty('--arrow-background-color', this.settings.arrowBackgroundColor);
                    swiperElement.style.setProperty('--arrow-background-color', this.settings.arrowBackgroundColor);
                }
                if (this.settings.arrowBackgroundColorHover) {
                    this.slider.style.setProperty('--arrow-background-color-hover', this.settings.arrowBackgroundColorHover);
                    swiperElement.style.setProperty('--arrow-background-color-hover', this.settings.arrowBackgroundColorHover);
                }
                if (this.settings.arrowTextColor) {
                    this.slider.style.setProperty('--arrow-text-color', this.settings.arrowTextColor);
                    swiperElement.style.setProperty('--arrow-text-color', this.settings.arrowTextColor);
                }
                if (this.settings.dotBackgroundColor) {
                    this.slider.style.setProperty('--dot-background-color', this.settings.dotBackgroundColor);
                    swiperElement.style.setProperty('--dot-background-color', this.settings.dotBackgroundColor);
                }
                if (this.settings.dotBackgroundColorHover) {
                    this.slider.style.setProperty('--dot-background-color-hover', this.settings.dotBackgroundColorHover);
                    swiperElement.style.setProperty('--dot-background-color-hover', this.settings.dotBackgroundColorHover);
                }
                if (this.settings.dotBackgroundColorActive) {
                    this.slider.style.setProperty('--dot-background-color-active', this.settings.dotBackgroundColorActive);
                    swiperElement.style.setProperty('--dot-background-color-active', this.settings.dotBackgroundColorActive);
                }

                // Set CSS variables for tab colors
                if (this.settings.tabTextColor) {
                    this.slider.style.setProperty('--tab-text-color', this.settings.tabTextColor);
                }
                if (this.settings.tabTextColorHover) {
                    this.slider.style.setProperty('--tab-text-color-hover', this.settings.tabTextColorHover);
                }
                if (this.settings.tabTextColorActive) {
                    this.slider.style.setProperty('--tab-text-color-active', this.settings.tabTextColorActive);
                }
                if (this.settings.tabBackgroundColor) {
                    this.slider.style.setProperty('--tab-background-color', this.settings.tabBackgroundColor);
                }

                // Apply frame styling function
                const applyFrameStyling = () => {
                    const frames = this.slider.querySelectorAll('.fsc-frame');
                    console.log('🔍 Found frames:', frames.length);
                    console.log('🔍 Frame border settings:', {
                        width: this.settings.frameBorderWidth,
                        color: this.settings.frameBorderColor,
                        shouldShowBorder: this.settings.frameBorderWidth > 0
                    });

                    frames.forEach((frame, index) => {
                        console.log('🔍 Processing frame ' + index + ':', frame);

                        if (this.settings.frameBorderRadius !== undefined) {
                            frame.style.borderRadius = this.settings.frameBorderRadius + 'px';
                            console.log('🎨 Set frame ' + index + ' borderRadius:', this.settings.frameBorderRadius + 'px');
                        }

                        if (this.settings.frameBorderWidth !== undefined && this.settings.frameBorderWidth > 0) {
                            frame.style.borderWidth = this.settings.frameBorderWidth + 'px';
                            frame.style.borderStyle = 'solid';
                            frame.style.borderColor = this.settings.frameBorderColor || '#dddddd';
                            console.log('🎨 Set frame ' + index + ' border:', this.settings.frameBorderWidth + 'px solid', this.settings.frameBorderColor);
                        } else {
                            frame.style.border = 'none';
                            console.log('🎨 Removed frame ' + index + ' border');
                        }

                        if (this.settings.frameBoxShadow !== undefined) {
                            frame.style.boxShadow = this.settings.frameBoxShadow;
                            console.log('🎨 Set frame ' + index + ' boxShadow:', this.settings.frameBoxShadow);
                        }
                    });
                };

                // Apply styling initially
                applyFrameStyling();

                // Set up MutationObserver to reapply styling when DOM changes
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                            // New frames added, reapply styling
                            setTimeout(applyFrameStyling, 100);
                        }
                    });
                });

                observer.observe(this.slider, { childList: true, subtree: true });

                // Set CSS variables for responsive settings
                if (this.settings.innerPaddingDesktop !== undefined) {
                    this.slider.style.setProperty('--inner-padding-desktop', this.settings.innerPaddingDesktop + 'px');
                }
                if (this.settings.innerPaddingTablet !== undefined) {
                    this.slider.style.setProperty('--inner-padding-tablet', this.settings.innerPaddingTablet + 'px');
                }
                if (this.settings.innerPaddingPhone !== undefined) {
                    this.slider.style.setProperty('--inner-padding-phone', this.settings.innerPaddingPhone + 'px');
                }


                if (this.settings.tabBackgroundColorHover) {
                    this.slider.style.setProperty('--tab-background-color-hover', this.settings.tabBackgroundColorHover);
                }
                if (this.settings.tabBackgroundColorActive) {
                    this.slider.style.setProperty('--tab-background-color-active', this.settings.tabBackgroundColorActive);
                }
                if (this.settings.tabBorderColor) {
                    this.slider.style.setProperty('--tab-border-color', this.settings.tabBorderColor);
                }
                if (this.settings.tabBorderColorHover) {
                    this.slider.style.setProperty('--tab-border-color-hover', this.settings.tabBorderColorHover);
                }
                if (this.settings.tabBorderColorActive) {
                    this.slider.style.setProperty('--tab-border-color-active', this.settings.tabBorderColorActive);
                }

                // Debug logging for colors
                console.log('=== COLOR VARIABLES DEBUG ===');
                console.log('Arrow Background:', this.settings.arrowBackgroundColor);
                console.log('Arrow Background Hover:', this.settings.arrowBackgroundColorHover);
                console.log('Arrow Text:', this.settings.arrowTextColor);
                console.log('Dot Background:', this.settings.dotBackgroundColor);
                console.log('Dot Background Hover:', this.settings.dotBackgroundColorHover);
                console.log('Dot Background Active:', this.settings.dotBackgroundColorActive);
                console.log('Tab Text:', this.settings.tabTextColor);
                console.log('Tab Text Active:', this.settings.tabTextColorActive);
                console.log('Tab Background:', this.settings.tabBackgroundColor);
                console.log('Tab Background Active:', this.settings.tabBackgroundColorActive);
                console.log('Tab Border:', this.settings.tabBorderColor);
                console.log('Tab Border Active:', this.settings.tabBorderColorActive);
                console.log('=============================');

                // Log the effect type for debugging
                console.log('🔍 Effect type determined:', effect);

                // Load required modules based on settings
                const modules = [];

                if (this.settings.showNavigation) {
                    modules.push(Navigation);
                }
                if (this.settings.showDots) {
                    modules.push(Pagination);
                }
                if (this.settings.autoPlay) {
                    modules.push(Autoplay);
                }

                // Add Keyboard module if keyboard navigation is enabled
                if (this.settings.keyboard) {
                    modules.push(Keyboard);
                }

                // Add Grid module if multiple rows are configured
                if (this.settings.gridRows > 1) {
                    modules.push(Grid);
                }

                // Add effect modules based on animation type
                if (['flip', 'coverflow', 'creative', 'cube', 'cards'].includes(this.settings.animationType)) {
                    if (this.settings.animationType === 'flip') {
                        modules.push(EffectFlip);
                    } else if (this.settings.animationType === 'coverflow') {
                        modules.push(EffectCoverflow);
                    } else if (this.settings.animationType === 'creative') {
                        modules.push(EffectCreative);
                    } else if (this.settings.animationType === 'cube') {
                        modules.push(EffectCube);
                    } else if (this.settings.animationType === 'cards') {
                        modules.push(EffectCards);
                    }
                }

                this.swiper = new Swiper(swiperElement, {
                    modules: modules,
                    loop: this.settings.sliderType === 'carousel', // Endless loop for carousel, finite for slider
                    slidesPerView: this.settings.slidesToShow.desktop,
                    slidesPerGroup: this.settings.slidesToScroll.desktop,
                    spaceBetween: this.settings.gap,
                    speed: this.settings.animationDuration,
                    effect: effect,
                    centeredSlides: this.settings.centeredSlides,
                    keyboard: { enabled: !!this.settings.keyboard },
                    allowTouchMove: this.settings.touchSwipe,
                    touchRatio: this.settings.touchRatio,
                    autoplay: this.settings.autoPlay ? { delay: this.settings.autoPlaySpeed * 1000, disableOnInteraction: false, pauseOnMouseEnter: true } : undefined,
                    navigation: this.settings.showNavigation ? { nextEl: this.slider.querySelector('.swiper-button-next'), prevEl: this.slider.querySelector('.swiper-button-prev') } : undefined,
                    pagination: this.settings.showDots ? { el: this.slider.querySelector('.swiper-pagination'), clickable: true } : undefined,
                    grid: this.settings.gridRows > 1 ? {
                        rows: this.settings.gridRows,
                        fill: this.settings.gridFill
                    } : undefined,

                    // Peek distance - will be handled after Swiper initialization
                    // Swiper doesn't have native peek distance, we'll implement it manually

                    // Custom animation timing function
                    on: {
                        init: () => {
                            this.applyCustomTiming();
                        },
                        slideChangeTransitionStart: () => {
                            this.applyCustomTiming();
                        }
                    },

                    // Effect-specific options
                    ...(effect === 'fade' && {
                        fadeEffect: {
                            crossFade: true
                        },
                        // Override slidesPerView for fade effect to show multiple slides
                        slidesPerView: this.settings.slidesToShow.desktop,
                        slidesPerGroup: this.settings.slidesToScroll.desktop
                    }),
                    ...(effect === 'flip' && {
                        flipEffect: {
                            limitRotation: true,
                            slideShadows: true
                        }
                    }),

                    ...(effect === 'coverflow' && {
                        coverflowEffect: {
                            rotate: 50,
                            stretch: 0,
                            depth: 100,
                            modifier: 1,
                            slideShadows: true
                        }
                    }),
                    ...(effect === 'creative' && {
                        creativeEffect: {
                            prev: {
                                shadow: true,
                                translate: [0, 0, -400]
                            },
                            next: {
                                translate: ['100%', 0, 0]
                            }
                        }
                    }),

                    breakpoints: {
                        [this.settings.breakpoints.desktop]: {
                            slidesPerView: this.settings.slidesToShow.desktop,
                            slidesPerGroup: this.settings.slidesToScroll.desktop,
                            spaceBetween: this.settings.gap,
                            centeredSlides: this.settings.centeredSlides !== false
                        },
                        [this.settings.breakpoints.tablet]: {
                            slidesPerView: this.settings.slidesToShow.tablet,
                            slidesPerGroup: this.settings.slidesToScroll.tablet,
                            spaceBetween: Math.max(this.settings.gap - 5, 0),
                            centeredSlides: this.settings.centeredSlides !== false
                        },
                        [this.settings.breakpoints.phone]: {
                            slidesPerView: this.settings.slidesToShow.phone,
                            slidesPerGroup: this.settings.slidesToScroll.phone,
                            spaceBetween: Math.max(this.settings.gap - 10, 0),
                            centeredSlides: this.settings.centeredSlides !== false
                        }
                    }
                });

                console.log('🎯 Swiper instance created successfully!');
                console.log('🔍 About to create animation transformers...');
                console.log('Settings object:', this.settings);
                console.log('Animation type from settings:', this.settings.animationType);
                console.log('🔍 Using Swiper native effects only');
                console.log('🔍 Effect type:', effect);
                console.log('🔍 Using Swiper native features only');

                console.log('=====================================');

                // Add custom navigation if enabled
                // Swiper renders arrows/pagination via CSS selectors we added in structure
                console.log('Swiper mounted successfully');

                // Apply custom animation timing function
                this.applyAnimationTiming();

                // Peek distance removed - using only Swiper's native features

                // Apply custom styling to text navigation
                this.updateTextNavigation();

            } catch (error) {
                console.error('Swiper initialization failed:', error);
                console.log('Falling back to basic slider functionality');

                // Fallback: Basic slider functionality
                this.initFallbackSlider();
            }
        }

        initFallbackSlider() {
            console.log('Initializing fallback slider');

            // Show all frames in a basic layout
            this.frames.forEach((frame, index) => {
                frame.style.display = 'block';
                frame.style.width = '100%';
                frame.style.marginBottom = '20px';
            });

            // Add basic navigation
            if (this.settings.showNavigation) {
                this.addBasicNavigation();
            }

            // Add dots using the same custom dots helper
            if (this.settings.showDots) {
                this.addCustomDots();
            }

            // Add text navigation if enabled
            if (this.settings.showTextNavigation) {
                this.createTextNavigation();
            }
        }

        addBasicNavigation() {
            const arrows = document.createElement('div');
            arrows.className = 'fsc-slider__nav-container';

            const prevBtn = document.createElement('button');
            prevBtn.className = 'fsc-slider__nav fsc-slider__nav--prev';
            prevBtn.innerHTML = '‹';
            prevBtn.style.position = 'absolute';
            prevBtn.style.left = '10px';
            prevBtn.style.top = '50%';
            prevBtn.style.transform = 'translateY(-50%)';
            prevBtn.style.zIndex = '1000';

            const nextBtn = document.createElement('button');
            nextBtn.className = 'fsc-slider__nav fsc-slider__nav--next';
            nextBtn.innerHTML = '›';
            nextBtn.style.position = 'absolute';
            nextBtn.style.right = '10px';
            nextBtn.style.top = '50%';
            nextBtn.style.transform = 'translateY(-50%)';
            nextBtn.style.zIndex = '1000';

            // Add click handlers for basic navigation
            prevBtn.addEventListener('click', () => {
                if (this.swiper) {
                    this.swiper.slidePrev();
                }
            });
            nextBtn.addEventListener('click', () => {
                if (this.swiper) {
                    this.swiper.slideNext();
                }
            });

            arrows.appendChild(prevBtn);
            arrows.appendChild(nextBtn);
            this.slider.appendChild(arrows);
        }

        prepareSwiperStructure() {
            // Store original frames for later restoration if needed
            this.originalFrames = Array.from(this.frames).map(frame => frame.cloneNode(true));

            // Build Swiper markup
            const container = document.createElement('div');
            container.className = 'swiper';

            const wrapper = document.createElement('div');
            wrapper.className = 'swiper-wrapper';

            // Convert frames to Swiper slides and hide original frames
            this.frames.forEach((frame) => {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';

                // Inner wrapper to allow 3D transforms per slide content
                const inner = document.createElement('div');
                inner.className = 'fsc-slide-inner';

                const frameClone = frame.cloneNode(true);
                if (frameClone && frameClone.style) frameClone.style.display = '';
                inner.appendChild(frameClone);
                slide.appendChild(inner);
                wrapper.appendChild(slide);

                frame.style.display = 'none';
            });

            container.appendChild(wrapper);

            // Optional controls per settings
            if (this.settings.showNavigation) {
                const prev = document.createElement('button');
                prev.className = 'swiper-button-prev';
                prev.textContent = '‹';
                const next = document.createElement('button');
                next.className = 'swiper-button-next';
                next.textContent = '›';
                container.appendChild(prev);
                container.appendChild(next);
            }

            if (this.settings.showDots) {
                const pagination = document.createElement('div');
                pagination.className = 'swiper-pagination';
                container.appendChild(pagination);
            }

            this.slider.appendChild(container);
        }

        addCustomNavigation() { }

        addCustomDots() { }

        createTextNavigation() {
            const textNavContainer = document.createElement('div');
            textNavContainer.className = `fsc-slider__text-nav fsc-slider__text-nav--${this.settings.textNavigationPosition}`;

            const frameTitlesContainer = document.createElement('div');
            frameTitlesContainer.className = 'fsc-slider__frame-titles';

            // Create title buttons for each frame
            for (let i = 0; i < this.totalSlides; i++) {
                const frame = this.frames[i];
                const title = frame.dataset.frameTitle ||
                    frame.querySelector('h1, h2, h3, h4, h5, h6')?.textContent ||
                    frame.querySelector('img')?.alt ||
                    `Frame ${i + 1}`;

                const titleBtn = document.createElement('button');
                titleBtn.className = 'fsc-slider__frame-title';
                titleBtn.textContent = title;
                titleBtn.dataset.slide = i;
                titleBtn.dataset.frameIndex = i;

                // Apply initial styling
                this.applyTabStyling(titleBtn, false);

                // Add click handler to navigate to slide
                titleBtn.addEventListener('click', () => {
                    if (this.swiper) {
                        this.swiper.slideToLoop(i);
                    }
                });

                frameTitlesContainer.appendChild(titleBtn);
            }

            textNavContainer.appendChild(frameTitlesContainer);

            // Position text navigation
            if (this.settings.textNavigationPosition === 'above') {
                this.slider.insertBefore(textNavContainer, this.slider.querySelector('.swiper'));
            } else {
                this.slider.appendChild(textNavContainer);
            }

            this.frameTitles = this.slider.querySelectorAll('.fsc-slider__frame-title');
        }

        applyTabStyling(element, isActive) {
            const suffix = isActive ? 'Active' : '';

            element.style.fontSize = this.settings.tabFontSize + 'px';
            element.style.fontWeight = this.settings.tabFontWeight;
            element.style.textAlign = this.settings.tabTextAlign;
            element.style.color = this.settings[`tabTextColor${suffix}`];
            element.style.backgroundColor = this.settings[`tabBackgroundColor${suffix}`];
            element.style.borderColor = this.settings[`tabBorderColor${suffix}`];
            element.style.padding = this.settings.tabPadding + 'px';
            element.style.borderRadius = this.settings.tabBorderRadius + 'px';
            element.style.borderWidth = this.settings.tabBorderWidth + 'px';
            element.style.borderStyle = 'solid';
            element.style.boxShadow = this.settings[`tabBoxShadow${suffix}`];
        }

        applyCustomTiming() {
            if (!this.swiper) return;

            // Get the Swiper wrapper element
            const wrapper = this.slider.querySelector('.swiper-wrapper');
            if (!wrapper) return;

            // Apply custom timing function using CSS custom properties
            wrapper.style.setProperty('--swiper-transition-timing', this.settings.animationTimingFunc);

            // Force the timing function with higher specificity
            wrapper.style.transitionTimingFunction = this.settings.animationTimingFunc;

            // Set data attribute for CSS targeting
            const timingKey = this.getTimingKey(this.settings.animationTimingFunc);
            wrapper.setAttribute('data-timing', timingKey);

            // Debug logging
            console.log('=== CUSTOM TIMING APPLIED ===');
            console.log('Timing function:', this.settings.animationTimingFunc);
            console.log('Duration:', this.settings.animationDuration);
            console.log('Data timing:', timingKey);
            console.log('=============================');
        }

        applyAnimationTiming() {
            // Legacy function - now calls the new one
            this.applyCustomTiming();
        }

        getTimingKey(timingFunc) {
            if (timingFunc === 'linear') return 'linear';
            if (timingFunc === 'ease') return 'ease';
            if (timingFunc === 'ease-in') return 'ease-in';
            if (timingFunc === 'ease-out') return 'ease-out';
            if (timingFunc === 'ease-in-out') return 'ease-in-out';
            if (timingFunc.includes('cubic-bezier')) return 'cubic-bezier';
            return 'default';
        }

        updateTextNavigation() {
            if (!this.frameTitles || !this.swiper) return;

            // Set initial active state (first tab should be active by default)
            const updateActiveState = () => {
                const currentSlide = this.swiper.realIndex ?? this.swiper.activeIndex ?? 0;

                this.frameTitles.forEach((title, index) => {
                    // Only the currently active slide is highlighted (native Swiper behavior)
                    const isActive = index === currentSlide;
                    title.classList.toggle('fsc-slider__frame-title--active', isActive);
                    this.applyTabStyling(title, isActive);
                });
            };

            // Listen for Swiper events to update text navigation and animation timing
            this.swiper.on('slideChangeTransitionStart', () => {
                updateActiveState();
                // Re-apply animation timing after each slide change
                this.applyAnimationTiming();
            });

            // Removed peek distance resize listener - using only Swiper's native features

            // Set initial state immediately (first tab active)
            updateActiveState();
        }



        destroy() {
            if (this.swiper) {
                this.swiper.destroy(true, true);
            }

            // Restore original frames
            if (this.originalFrames) {
                this.frames.forEach((frame, index) => {
                    if (this.originalFrames[index]) {
                        frame.style.display = '';
                        frame.innerHTML = this.originalFrames[index].innerHTML;
                    }
                });
            }

            // Remove Swiper structure
            const track = this.slider.querySelector('.swiper');
            if (track) {
                track.remove();
            }

            // Remove Swiper class
            this.slider.classList.remove('swiper');
        }
    }

    // Initialize all sliders on the page
    function initSliders() {
        document.querySelectorAll('.fsc-slider').forEach(slider => {
            new FlexibleSlider(slider);
        });
    }

    // Initialize sliders for dynamically added content
    function initDynamicSliders() {
        if (!document.body || document.body.classList.contains('wp-admin')) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.classList.contains('fsc-slider')) {
                            new FlexibleSlider(node);
                        }
                        // Check for sliders within added nodes
                        node.querySelectorAll('.fsc-slider').forEach(slider => {
                            new FlexibleSlider(slider);
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSliders);
    } else {
        initSliders();
    }

    // Initialize dynamic content observer
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDynamicSliders);
    } else {
        setTimeout(initDynamicSliders, 100);
    }

})(); 