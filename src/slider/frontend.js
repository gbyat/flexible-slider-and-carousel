/**
 * Flexible Slider & Carousel Frontend Script
 * @package FlexibleSliderCarousel
 */

(function () {
    'use strict';

    class FlexibleSlider {
        constructor(element) {
            this.slider = element;
            this.frames = this.slider.querySelectorAll('.fsc-frame');
            this.framesContainer = this.slider.querySelector('.fsc-slider__frames');
            this.currentSlide = 0;
            this.totalSlides = this.frames.length;
            this.isAnimating = false;
            this.autoPlayInterval = null;

            // Get slider settings from data attributes
            this.settings = this.getSliderSettings();

            // Initialize
            this.init();
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
                    desktop: parseInt(this.slider.dataset.slidesDesktop) || 1,
                    tablet: parseInt(this.slider.dataset.slidesTablet) || 1,
                    phone: parseInt(this.slider.dataset.slidesPhone) || 1
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
                tabTextColorActive: this.slider.dataset.tabTextColorActive || '#ffffff',
                tabBackgroundColor: this.slider.dataset.tabBackgroundColor || '#f5f5f5',
                tabBackgroundColorActive: this.slider.dataset.tabBackgroundColorActive || '#007cba',
                tabBorderColor: this.slider.dataset.tabBorderColor || '#dddddd',
                tabBorderColorActive: this.slider.dataset.tabBorderColorActive || '#007cba',
                tabBoxShadow: this.slider.dataset.tabBoxShadow || '0 1px 3px rgba(0,0,0,0.1)',
                tabBoxShadowActive: this.slider.dataset.tabBoxShadowActive || '0 2px 6px rgba(0,0,0,0.2)'
            };
        }

        init() {
            if (this.totalSlides <= 1) return;

            // Wait for DOM to be ready
            if (this.framesContainer) {
                this.createNavigation();
                this.setupResponsiveBehavior();
                this.setupTouchEvents();
                this.startAutoPlay();
                this.updateNavigation();
            } else {
                // Retry after a short delay
                setTimeout(() => this.init(), 100);
            }
        }

        createNavigation() {
            // Create navigation arrows only if enabled
            if (this.settings.showNavigation) {
                const prevBtn = document.createElement('button');
                prevBtn.className = 'fsc-slider__nav fsc-slider__nav--prev';
                prevBtn.innerHTML = '‹';
                prevBtn.addEventListener('click', () => this.prevSlide());

                const nextBtn = document.createElement('button');
                nextBtn.className = 'fsc-slider__nav fsc-slider__nav--next';
                nextBtn.innerHTML = '›';
                nextBtn.addEventListener('click', () => this.nextSlide());

                this.slider.appendChild(prevBtn);
                this.slider.appendChild(nextBtn);
            }

            // Create dots navigation if enabled
            if (this.settings.showDots && this.totalSlides > 1) {
                const dotsContainer = document.createElement('div');
                dotsContainer.className = 'fsc-slider__dots';

                for (let i = 0; i < this.totalSlides; i++) {
                    const dot = document.createElement('button');
                    dot.className = 'fsc-slider__dot';
                    dot.dataset.slide = i;
                    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                    dot.addEventListener('click', () => this.goToSlide(i));
                    dotsContainer.appendChild(dot);
                }

                this.slider.appendChild(dotsContainer);
                this.dots = this.slider.querySelectorAll('.fsc-slider__dot');
            }

            // Create text navigation if enabled
            if (this.settings.showTextNavigation) {
                this.createTextNavigation();
            }
        }

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

                titleBtn.addEventListener('click', () => this.goToSlide(i));
                frameTitlesContainer.appendChild(titleBtn);
            }

            textNavContainer.appendChild(frameTitlesContainer);

            // Position text navigation
            if (this.settings.textNavigationPosition === 'above') {
                this.slider.insertBefore(textNavContainer, this.framesContainer);
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

        setupResponsiveBehavior() {
            const updateResponsiveSettings = () => {
                const windowWidth = window.innerWidth;
                let slidesToShow = 1;
                let slidesToScroll = 1;
                let breakpoint = 'phone';

                if (windowWidth >= this.settings.breakpoints.desktop) {
                    slidesToShow = this.settings.slidesToShow.desktop;
                    slidesToScroll = this.settings.slidesToScroll.desktop;
                    breakpoint = 'desktop';
                } else if (windowWidth >= this.settings.breakpoints.tablet) {
                    slidesToShow = this.settings.slidesToShow.tablet;
                    slidesToScroll = this.settings.slidesToScroll.tablet;
                    breakpoint = 'tablet';
                } else {
                    slidesToShow = this.settings.slidesToShow.phone;
                    slidesToScroll = this.settings.slidesToScroll.phone;
                    breakpoint = 'phone';
                }

                this.currentSlidesToShow = slidesToShow;
                this.currentSlidesToScroll = slidesToScroll;
                this.maxSlide = Math.max(0, this.totalSlides - slidesToShow);

                // Update slider layout and position
                this.updateSliderLayout();
                this.updateSliderPosition();
            };

            // Initial setup
            updateResponsiveSettings();

            // Listen for window resize
            window.addEventListener('resize', updateResponsiveSettings);
        }

        updateSliderLayout() {
            if (!this.framesContainer) return;

            const gap = this.getCurrentGap();
            const containerWidth = this.framesContainer.offsetWidth;
            const frameWidth = (containerWidth - (this.currentSlidesToShow - 1) * gap) / this.currentSlidesToShow;

            // Set styles for each frame
            this.frames.forEach((frame, index) => {
                frame.style.flex = '0 0 auto';
                frame.style.width = frameWidth + 'px';
                frame.style.minWidth = frameWidth + 'px';
                frame.style.maxWidth = frameWidth + 'px';
                frame.style.boxSizing = 'border-box';
                // Don't hide frames - let them be visible for proper layout
                frame.style.display = 'block';
            });

            // Set container styles
            this.framesContainer.style.gap = gap + 'px';
            this.framesContainer.style.boxSizing = 'border-box';
            this.framesContainer.style.width = '100%';
        }

        getCurrentGap() {
            const windowWidth = window.innerWidth;
            if (windowWidth >= this.settings.breakpoints.desktop) {
                return 20;
            } else if (windowWidth >= this.settings.breakpoints.tablet) {
                return 15;
            } else {
                return 10;
            }
        }

        setupTouchEvents() {
            if (!this.settings.touchSwipe) return;

            let startX = 0;
            let startY = 0;
            let isSwiping = false;

            this.framesContainer.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                isSwiping = true;
            });

            this.framesContainer.addEventListener('touchmove', (e) => {
                if (!isSwiping) return;

                const currentX = e.touches[0].clientX;
                const currentY = e.touches[0].clientY;
                const diffX = startX - currentX;
                const diffY = startY - currentY;

                // Check if horizontal swipe is more significant than vertical
                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                    e.preventDefault();

                    if (diffX > 0) {
                        this.nextSlide();
                    } else {
                        this.prevSlide();
                    }

                    isSwiping = false;
                }
            });

            this.framesContainer.addEventListener('touchend', () => {
                isSwiping = false;
            });
        }

        nextSlide() {
            if (this.isAnimating) return;

            const nextSlide = Math.min(this.currentSlide + this.currentSlidesToScroll, this.maxSlide);
            this.goToSlide(nextSlide);
        }

        prevSlide() {
            if (this.isAnimating) return;

            const prevSlide = Math.max(this.currentSlide - this.currentSlidesToScroll, 0);
            this.goToSlide(prevSlide);
        }

        goToSlide(slideIndex) {
            if (this.isAnimating) return;

            // Clamp slide index to valid range
            slideIndex = Math.min(slideIndex, this.maxSlide);
            slideIndex = Math.max(0, slideIndex);

            if (slideIndex !== this.currentSlide) {
                this.currentSlide = slideIndex;

                // Update layout and position
                this.updateSliderLayout();
                this.updateSliderPosition();
                this.updateNavigation();
            }
        }

        updateSliderPosition() {
            if (!this.framesContainer) return;

            const gap = this.getCurrentGap();
            const containerWidth = this.framesContainer.offsetWidth;
            const frameWidth = (containerWidth - (this.currentSlidesToShow - 1) * gap) / this.currentSlidesToShow;

            // Calculate the center offset to keep slider centered
            const totalSliderWidth = this.totalSlides * frameWidth + (this.totalSlides - 1) * gap;
            const centerOffset = (containerWidth - totalSliderWidth) / 2;

            // Calculate translateX position with proper centering
            const translateX = centerOffset - this.currentSlide * (frameWidth + gap);

            // Apply transform
            this.framesContainer.style.transform = `translateX(${translateX}px)`;
            this.framesContainer.style.transition = `transform ${this.settings.transitionSpeed}ms ease-in-out`;

            console.log('Slider Position:', {
                currentSlide: this.currentSlide,
                translateX: translateX + 'px',
                frameWidth: frameWidth,
                gap: gap,
                centerOffset: centerOffset + 'px',
                totalSliderWidth: totalSliderWidth + 'px',
                containerWidth: containerWidth + 'px'
            });
        }

        updateNavigation() {
            const currentSlide = this.currentSlide;
            const lastVisibleSlide = Math.min(currentSlide + this.currentSlidesToShow - 1, this.totalSlides - 1);

            // Update dots
            if (this.dots) {
                this.dots.forEach((dot, index) => {
                    const isActive = index >= currentSlide && index <= lastVisibleSlide;
                    dot.classList.toggle('fsc-slider__dot--active', isActive);
                });
            }

            // Update frame titles
            if (this.frameTitles) {
                this.frameTitles.forEach((title, index) => {
                    const isActive = index >= currentSlide && index <= lastVisibleSlide;
                    title.classList.toggle('fsc-slider__frame-title--active', isActive);
                    this.applyTabStyling(title, isActive);
                });
            }

            // Update navigation buttons
            const prevBtn = this.slider.querySelector('.fsc-slider__nav--prev');
            const nextBtn = this.slider.querySelector('.fsc-slider__nav--next');

            if (prevBtn) {
                prevBtn.disabled = currentSlide === 0;
                prevBtn.style.opacity = currentSlide === 0 ? '0.5' : '1';
            }

            if (nextBtn) {
                nextBtn.disabled = currentSlide === this.maxSlide;
                nextBtn.style.opacity = currentSlide === this.maxSlide ? '0.5' : '1';
            }
        }

        startAutoPlay() {
            if (!this.settings.autoPlay || this.totalSlides <= 1) return;

            this.autoPlayInterval = setInterval(() => {
                if (this.currentSlide >= this.maxSlide) {
                    if (this.settings.loop) {
                        this.goToSlide(0);
                    } else {
                        this.stopAutoPlay();
                    }
                } else {
                    this.nextSlide();
                }
            }, this.settings.autoPlaySpeed);
        }

        stopAutoPlay() {
            if (this.autoPlayInterval) {
                clearInterval(this.autoPlayInterval);
                this.autoPlayInterval = null;
            }
        }

        destroy() {
            this.stopAutoPlay();

            if (this.framesContainer) {
                this.framesContainer.removeEventListener('touchstart', null);
                this.framesContainer.removeEventListener('touchmove', null);
                this.framesContainer.removeEventListener('touchend', null);
            }

            window.removeEventListener('resize', null);
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