# Flexible Slider and Carousel

A comprehensive WordPress plugin for creating beautiful sliders and carousels using Gutenberg blocks. Supports manual content, automatic post loading, and extensive customization options.

## Features

### 🎯 **Core Functionality**
- **Gutenberg Block Editor Integration** - Native WordPress block experience
- **Multiple Slider Types** - Slider, Carousel, Testimonial, Product, Video
- **Content Modes** - Manual content or automatic post loading
- **Post Template Functionality** - Use like native post loop blocks

### 🎨 **Design & Customization**
- **Theme Integration** - Automatically detects and uses theme CSS variables
- **Responsive Design** - Mobile-first approach with customizable breakpoints
- **No Rounded Corners/Shadows** - Clean, modern design as requested
- **Custom Colors** - Global and per-slider color settings
- **Border Controls** - Customizable borders independent of screen size

### 📱 **Responsive Features**
- **Breakpoint Management** - Desktop, Tablet, Phone with custom values
- **Responsive Layouts** - Separate padding/margin for each breakpoint
- **Touch Support** - Optional swipe gestures for mobile devices
- **Mobile Optimization** - Performance and UX optimized for mobile

### 🚀 **Performance & SEO**
- **Lazy Loading** - Optional image lazy loading
- **Intersection Observer** - Load sliders only when visible
- **SEO Friendly** - Proper HTML structure and accessibility
- **Performance Optimized** - Efficient asset loading and caching

### 🔧 **Advanced Features**
- **ACF Integration** - Support for Advanced Custom Fields
- **Custom Fields** - Display any post meta or custom fields
- **Animation Support** - Fade, slide, and other transition effects
- **Navigation Options** - Arrows, dots, thumbnails
- **Auto-play** - Configurable automatic sliding with loop options

### 📊 **Admin & Management**
- **Slider Overview** - See all sliders across the website
- **Global Settings** - Default colors, layouts, and animations
- **Import/Export** - Backup and restore slider configurations
- **Performance Optimization** - Bulk optimization tools

## Requirements

- **WordPress**: 6.5 or higher
- **PHP**: 8.1 or higher
- **Gutenberg**: Must be available (included in WordPress 5.0+)

## Installation

1. **Download** the plugin files
2. **Upload** to `/wp-content/plugins/flexible-slider-and-carousel/`
3. **Activate** the plugin through the 'Plugins' menu in WordPress
4. **Configure** global settings in 'Slider & Carousel' admin menu

## Development & Release

### 🚀 **Release Workflow**

This plugin uses automated versioning and release management:

```bash
# Check current status
npm run status

# Create releases
npm run release:patch    # 1.0.0 → 1.0.1
npm run release:minor    # 1.0.0 → 1.1.0  
npm run release:major    # 1.0.0 → 2.0.0

# Sync version across files
npm run version
```

**What happens during release:**
1. **Version bump** - Updates package.json and plugin files
2. **Build** - Compiles production assets
3. **Git operations** - Commit, tag, and push to GitHub
4. **GitHub Actions** - Automatically creates release with ZIP file
5. **WordPress Updates** - Plugin shows update notification in dashboard

### 📦 **Release Contents**

Only production files are included in releases:
- ✅ `flexible-slider-and-carousel.php` - Main plugin file
- ✅ `blocks/` - Compiled block files
- ✅ `assets/` - CSS/JS assets
- ✅ `README.md` - Documentation
- ✅ `CHANGELOG.md` - Change history
- ✅ `LICENSE` - License file
- ❌ `src/` - Source files (excluded)
- ❌ `webpack.config.js` - Build config (excluded)
- ❌ `node_modules/` - Dependencies (excluded)

## Quick Start

### Creating Your First Slider

1. **Add Block** - In any page/post editor, click the '+' button
2. **Search** for "Slider & Carousel" or "Slider"
3. **Select** the slider block
4. **Configure** settings in the right sidebar
5. **Add Frames** - Use the "Frame" block inside your slider

### Basic Configuration

```php
// Example: Basic image slider
- Slider Type: Slider
- Content Mode: Manual
- Show Navigation: Yes
- Show Dots: Yes
- Transition: Slide
- Auto-play: Optional
```

### Post Template Usage

```php
// Example: Automatic post slider
- Slider Type: Slider
- Content Mode: Automatic
- Post Type: Post
- Posts Per Page: 5
- Post Elements: Featured Image, Title, Excerpt, Date
```

## Block Types

### 🎠 **Slider Block**
The main container block that holds all slider functionality.

**Key Features:**
- Content mode selection (manual/automatic)
- Slider type configuration
- Navigation and display options
- Responsive settings
- Color and border customization

**Attributes:**
- `sliderType`: slider, carousel, testimonial, product, video
- `contentMode`: manual, automatic
- `autoPlay`: boolean
- `showNavigation`: boolean
- `responsiveSettings`: object with breakpoint-specific values

### 🖼️ **Frame Block**
Individual slide/frame blocks that contain the actual content.

**Content Types:**
- **Image** - Featured images with alt text and captions
- **Text** - Rich text content with formatting
- **Video** - MP4 files or embedded videos
- **Custom HTML** - Custom markup and content
- **ACF Fields** - Advanced Custom Fields integration
- **Mixed Content** - Combination of multiple content types

**Styling Options:**
- Background and text colors
- Padding and margin controls
- Border radius (optional)
- Box shadows (optional)
- Animation effects

## Configuration

### Global Settings

Access via **WordPress Admin → Slider & Carousel → Settings**

#### **Default Colors**
- Navigation Normal Color
- Navigation Hover Color
- Navigation Inactive Color
- Navigation Hidden Color

#### **Default Layout**
- Desktop Padding/Margin
- Tablet Padding/Margin
- Phone Padding/Margin

#### **Default Breakpoints**
- Desktop: 1024px
- Tablet: 768px
- Phone: 480px

#### **Default Animations**
- Transition Type: slide, fade
- Speed: 500ms
- Easing: ease-in-out

### Per-Slider Settings

Each slider can override global defaults with custom settings:

```php
// Example: Custom slider configuration
{
    "sliderType": "carousel",
    "autoPlay": true,
    "autoPlaySpeed": 3000,
    "transition": "fade",
    "colors": {
        "navigation_normal": "#007cba",
        "navigation_hover": "#005a87"
    }
}
```

## Theme Integration

### CSS Variables

The plugin automatically detects theme CSS variables and makes them available:

```css
:root {
    --fsc-theme-primary-color: #007cba;
    --fsc-theme-secondary-color: #6c757d;
    --fsc-theme-text-color: #333333;
    --fsc-theme-background-color: #ffffff;
}
```

### Custom Variables

Add custom CSS variables in the admin settings:

```css
:root {
    --fsc-custom-accent-color: #ff6b35;
    --fsc-custom-highlight-color: #f8f9fa;
}
```

### Theme Compatibility

Built-in support for popular themes:
- WordPress Default Themes (Twenty Twenty-Four, etc.)
- Astra
- OceanWP
- GeneratePress

## API & Hooks

### Filters

```php
// Modify theme colors
add_filter('fsc_theme_colors', function($colors) {
    $colors['custom_color'] = '#ff0000';
    return $colors;
});

// Modify theme breakpoints
add_filter('fsc_theme_breakpoints', function($breakpoints) {
    $breakpoints['custom'] = 1200;
    return $breakpoints;
});
```

### Actions

```php
// Custom slider initialization
add_action('fsc_slider_init', function($slider_id, $settings) {
    // Custom initialization code
}, 10, 2);

// After slider render
add_action('fsc_slider_rendered', function($slider_id, $output) {
    // Custom post-render code
}, 10, 2);
```

## Performance Optimization

### Lazy Loading

Enable lazy loading for images:

```php
// In slider settings
"loading": "lazy"
```

### Intersection Observer

Load sliders only when visible:

```php
// In slider settings
"intersectionObserver": true
```

### Asset Optimization

The plugin automatically:
- Loads CSS/JS only when needed
- Preloads critical assets
- Defers non-critical JavaScript
- Optimizes asset delivery

## Accessibility

### WCAG Compliance

- **Keyboard Navigation** - Full keyboard support
- **Screen Reader Support** - Proper ARIA labels
- **High Contrast Mode** - Respects user preferences
- **Reduced Motion** - Respects `prefers-reduced-motion`

### ARIA Labels

```html
<button class="fsc-slider__nav fsc-slider__nav--prev" 
        aria-label="Previous slide">
    &lt;
</button>
```

## Troubleshooting

### Common Issues

#### **Sliders Not Loading**
- Check PHP version (8.1+ required)
- Verify Gutenberg is available
- Check browser console for JavaScript errors

#### **Theme Conflicts**
- Disable theme integration temporarily
- Check for CSS conflicts
- Verify theme CSS variable format

#### **Performance Issues**
- Enable lazy loading
- Use intersection observer
- Optimize images before upload

### Debug Mode

Enable WordPress debug mode to see detailed error messages:

```php
// In wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```

## Development

### File Structure

```
flexible-slider-and-carousel/
├── plugin.php                 # Main plugin file
├── includes/                  # Core classes
│   ├── class-fsc-block-registry.php
│   ├── class-fsc-admin.php
│   ├── class-fsc-assets.php
│   ├── class-fsc-post-loader.php
│   ├── class-fsc-theme-integration.php
│   └── class-fsc-utilities.php
├── blocks/                    # Block definitions
│   ├── slider/
│   │   ├── block.json
│   │   ├── slider-editor.js
│   │   ├── slider-editor.css
│   │   ├── slider.css
│   │   └── render.php
│   └── frame/
│       ├── block.json
│       ├── frame-editor.js
│       ├── frame-editor.css
│       ├── frame.css
│       └── render.php
├── assets/                    # Frontend assets
│   ├── css/
│   ├── js/
│   └── images/
└── languages/                 # Translation files
```

### Building from Source

1. **Clone** the repository
2. **Install** dependencies: `npm install`
3. **Build** assets: `npm run build`
4. **Test** functionality

### Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

## Changelog

### Version 1.0.0
- Initial release
- Gutenberg block integration
- Theme integration system
- Responsive design support
- Performance optimization features

## Support

### Documentation
- [User Guide](docs/user-guide.md)
- [Developer Guide](docs/developer-guide.md)
- [API Reference](docs/api-reference.md)

### Support Channels
- [GitHub Issues](https://github.com/your-username/flexible-slider-and-carousel/issues)
- [WordPress.org Support](https://wordpress.org/support/plugin/flexible-slider-and-carousel)

## License

This plugin is licensed under the GPL v2 or later.

```
Copyright (C) 2024 Your Name

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
```

## Credits

- **WordPress** - For the amazing platform
- **Gutenberg** - For the block editor
- **Contributors** - For feedback and testing

---

**Made with ❤️ for the WordPress community** 