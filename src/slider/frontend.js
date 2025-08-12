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
                animationType: this.slider.dataset.animationType || 'slide',
                animationSpeed: parseInt(this.slider.dataset.animationSpeed) || 500,
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
                }
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
            // Create navigation arrows
            if (this.settings.slidesToShow.desktop > 1 || this.settings.slidesToShow.tablet > 1 || this.settings.slidesToShow.phone > 1) {
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

            // Create navigation dots
            if (this.totalSlides > 1) {
                const dotsContainer = document.createElement('div');
                dotsContainer.className = 'fsc-slider__dots';

                for (let i = 0; i < this.totalSlides; i++) {
                    const dot = document.createElement('button');
                    dot.className = 'fsc-slider__dot';
                    dot.dataset.slide = i;
                    dot.addEventListener('click', () => this.goToSlide(i));
                    dotsContainer.appendChild(dot);
                }

                this.slider.appendChild(dotsContainer);
                this.dots = dotsContainer.querySelectorAll('.fsc-slider__dot');
            }
        }

        setupResponsiveBehavior() {
            const updateSlider = () => {
                const width = window.innerWidth;
                let slidesToShow = 1;
                let slidesToScroll = 1;
                let currentBreakpoint = 'phone';

                if (width >= this.settings.breakpoints.desktop) {
                    slidesToShow = this.settings.slidesToShow.desktop;
                    slidesToScroll = this.settings.slidesToScroll.desktop;
                    currentBreakpoint = 'desktop';
                } else if (width >= this.settings.breakpoints.phone) {
                    slidesToShow = this.settings.slidesToShow.tablet;
                    slidesToScroll = this.settings.slidesToScroll.tablet;
                    currentBreakpoint = 'tablet';
                } else {
                    slidesToShow = this.settings.slidesToShow.phone;
                    slidesToScroll = this.settings.slidesToScroll.phone;
                    currentBreakpoint = 'phone';
                }

                this.currentSlidesToShow = slidesToShow;
                this.currentSlidesToScroll = slidesToScroll;
                // Calculate the maximum slide index that can be shown
                // If we have 5 frames and show 3 at once, maxSlide should be 2 (showing frames 2,3,4)
                this.maxSlide = Math.max(0, this.totalSlides - slidesToShow);

                // Update CSS variables for breakpoints
                this.updateCSSBreakpoints();
                this.updateSliderPosition();
            };

            // Initial update
            updateSlider();

            // Update on resize
            window.addEventListener('resize', updateSlider);
        }

        updateCSSBreakpoints() {
            // Set CSS custom properties for breakpoints on the slider element
            this.slider.style.setProperty('--fsc-breakpoint-desktop', this.settings.breakpoints.desktop + 'px');
            this.slider.style.setProperty('--fsc-breakpoint-tablet', this.settings.breakpoints.tablet + 'px');
            this.slider.style.setProperty('--fsc-breakpoint-phone', this.settings.breakpoints.phone + 'px');

            // Generate dynamic CSS for responsive frame widths
            this.generateDynamicCSS();
        }

        generateDynamicCSS() {
            // Remove existing dynamic stylesheet if it exists
            const existingStyle = document.getElementById('fsc-dynamic-css');
            if (existingStyle) {
                existingStyle.remove();
            }

            // Create new stylesheet
            const style = document.createElement('style');
            style.id = 'fsc-dynamic-css';

            // Generate CSS rules for each breakpoint
            const breakpoints = [
                { name: 'desktop', minWidth: this.settings.breakpoints.desktop, gap: 20 },
                { name: 'tablet', minWidth: this.settings.breakpoints.phone, maxWidth: this.settings.breakpoints.desktop - 1, gap: 15 },
                { name: 'phone', maxWidth: this.settings.breakpoints.phone - 1, gap: 10 }
            ];

            let css = '';

            breakpoints.forEach(breakpoint => {
                const slidesToShow = this.settings.slidesToShow[breakpoint.name];
                const gap = breakpoint.gap;

                // Generate media query
                let mediaQuery = '';
                if (breakpoint.minWidth && breakpoint.maxWidth) {
                    mediaQuery = `@media (min-width: ${breakpoint.minWidth}px) and (max-width: ${breakpoint.maxWidth}px)`;
                } else if (breakpoint.minWidth) {
                    mediaQuery = `@media (min-width: ${breakpoint.minWidth}px)`;
                } else if (breakpoint.maxWidth) {
                    mediaQuery = `@media (max-width: ${breakpoint.maxWidth}px)`;
                }

                // Generate frame width rules
                let frameRules = '';
                for (let i = 1; i <= 5; i++) {
                    // Calculate gaps: for i frames, we need (i-1) gaps
                    const gaps = i > 1 ? (i - 1) * gap : 0;
                    // Ensure the last frame is fully visible by accounting for the right edge
                    const frameWidth = `calc((100% - ${gaps}px) / ${i})`;

                    frameRules += `
                    .fsc-slider[data-slides-${breakpoint.name}="${i}"] .fsc-frame {
                        flex: 0 0 ${frameWidth};
                        box-sizing: border-box;
                        max-width: ${frameWidth};
                    }`;
                }

                // Add gap rule
                frameRules += `
                .fsc-slider[data-slides-${breakpoint.name}="${slidesToShow}"] .fsc-slider__frames {
                    gap: ${gap}px;
                }`;

                css += `${mediaQuery} {${frameRules}}`;
            });

            style.textContent = css;
            document.head.appendChild(style);
        }

        setupTouchEvents() {
            if (!this.settings.touchSwipe) return;

            let startX = 0;
            let startY = 0;
            let isDragging = false;

            const handleStart = (e) => {
                startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
                startY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
                isDragging = true;
            };

            const handleMove = (e) => {
                if (!isDragging) return;

                const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
                const currentY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
                const diffX = startX - currentX;
                const diffY = startY - currentY;

                // Check if horizontal swipe
                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                    e.preventDefault();
                    if (diffX > 0) {
                        this.nextSlide();
                    } else {
                        this.prevSlide();
                    }
                    isDragging = false;
                }
            };

            const handleEnd = () => {
                isDragging = false;
            };

            // Mouse events
            this.slider.addEventListener('mousedown', handleStart);
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleEnd);

            // Touch events
            this.slider.addEventListener('touchstart', handleStart);
            this.slider.addEventListener('touchmove', handleMove);
            this.slider.addEventListener('touchend', handleEnd);
        }

        nextSlide() {
            if (this.isAnimating) return;

            const nextSlide = this.currentSlide + this.currentSlidesToScroll;
            if (nextSlide <= this.maxSlide || this.settings.loop) {
                this.goToSlide(nextSlide > this.maxSlide ? 0 : nextSlide);
            }
        }

        prevSlide() {
            if (this.isAnimating) return;

            const prevSlide = this.currentSlide - this.currentSlidesToScroll;
            if (prevSlide >= 0 || this.settings.loop) {
                this.goToSlide(prevSlide < 0 ? this.maxSlide : prevSlide);
            }
        }

        goToSlide(slideIndex) {
            if (this.isAnimating || slideIndex === this.currentSlide) return;

            this.isAnimating = true;
            // Ensure we don't go beyond the last valid slide
            this.currentSlide = Math.min(slideIndex, this.maxSlide);

            this.updateSliderPosition();
            this.updateNavigation();

            // Reset animation flag after transition
            setTimeout(() => {
                this.isAnimating = false;
            }, this.settings.animationSpeed);
        }

        updateSliderPosition() {
            // Calculate the width of each slide as a percentage
            // We need to account for gaps in the calculation
            const gap = this.getCurrentGap();
            const totalGaps = this.currentSlidesToShow > 1 ? this.currentSlidesToShow - 1 : 0;

            // Calculate slide width as percentage, accounting for gaps
            // Convert gap from pixels to percentage of container width
            const containerWidth = this.framesContainer.offsetWidth;
            const gapPercent = (gap / containerWidth) * 100;
            const slideWidth = (100 - (totalGaps * gapPercent)) / this.currentSlidesToShow;

            // Calculate translateX: negative value moves content left, positive moves right
            // When currentSlide is 0, translateX should be 0 (showing first frame)
            // When currentSlide is 1, translateX should be -(slideWidth + gapPercent) (showing second frame)
            const translateX = -(this.currentSlide * (slideWidth + gapPercent));

            // Ensure we don't scroll beyond the last frame
            const maxTranslateX = -(this.maxSlide * (slideWidth + gapPercent));

            // Clamp the translateX value:
            // - 0: first frame (no translation)
            // - maxTranslateX: last frame (maximum left translation)
            const clampedTranslateX = Math.max(maxTranslateX, Math.min(0, translateX));

            // Debug logging
            console.log('Slider Debug:', {
                currentSlide: this.currentSlide,
                slideWidth: slideWidth.toFixed(2) + '%',
                gap: gap + 'px',
                gapPercent: gapPercent.toFixed(2) + '%',
                translateX: translateX.toFixed(2) + '%',
                maxTranslateX: maxTranslateX.toFixed(2) + '%',
                clampedTranslateX: clampedTranslateX.toFixed(2) + '%'
            });

            this.framesContainer.style.transform = `translateX(${clampedTranslateX}%)`;
        }

        getCurrentGap() {
            const width = window.innerWidth;
            if (width >= this.settings.breakpoints.desktop) {
                return 20; // Desktop gap
            } else if (width >= this.settings.breakpoints.phone) {
                return 15; // Tablet gap
            } else {
                return 10; // Phone gap
            }
        }

        updateNavigation() {
            // Update dots
            if (this.dots) {
                this.dots.forEach((dot, index) => {
                    dot.classList.toggle('fsc-slider__dot--active', index === this.currentSlide);
                });
            }

            // Update navigation arrows
            const prevBtn = this.slider.querySelector('.fsc-slider__nav--prev');
            const nextBtn = this.slider.querySelector('.fsc-slider__nav--next');

            if (prevBtn) {
                prevBtn.style.display = (this.currentSlide === 0 && !this.settings.loop) ? 'none' : 'block';
            }

            if (nextBtn) {
                nextBtn.style.display = (this.currentSlide >= this.maxSlide && !this.settings.loop) ? 'none' : 'block';
            }
        }

        startAutoPlay() {
            if (!this.settings.autoPlay || this.totalSlides <= 1) return;

            this.autoPlayInterval = setInterval(() => {
                this.nextSlide();
            }, this.settings.autoPlaySpeed);

            // Pause on hover
            this.slider.addEventListener('mouseenter', () => {
                if (this.autoPlayInterval) {
                    clearInterval(this.autoPlayInterval);
                }
            });

            this.slider.addEventListener('mouseleave', () => {
                this.startAutoPlay();
            });
        }

        destroy() {
            if (this.autoPlayInterval) {
                clearInterval(this.autoPlayInterval);
            }
        }
    }

    // Initialize all sliders when DOM is ready
    function initSliders() {
        const sliders = document.querySelectorAll('.fsc-slider');
        sliders.forEach(slider => {
            new FlexibleSlider(slider);
        });
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSliders);
    } else {
        initSliders();
    }

    // Initialize on AJAX content load (for dynamic content)
    document.addEventListener('DOMContentLoaded', function () {
        // Observer for dynamically added sliders
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType === 1 && node.classList && node.classList.contains('fsc-slider')) {
                        new FlexibleSlider(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });

})();