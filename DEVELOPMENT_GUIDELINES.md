# Flexible Slider & Carousel - Development Guidelines

## 🚀 WordPress-First Development Approach

### **ALWAYS use WordPress built-in functionality when available**

**Core Principle:** WordPress provides secure, tested, and user-familiar components. Custom implementations increase complexity, security risks, and maintenance burden.

**Why This Rule:**
- ✅ **Security** - WordPress components follow security best practices
- ✅ **Consistency** - Users recognize familiar WordPress UI patterns  
- ✅ **Maintenance** - Less custom code to maintain and debug
- ✅ **Performance** - WordPress components are optimized
- ✅ **Accessibility** - Built-in accessibility features

**Implementation Guidelines:**
1. **Use WordPress components** instead of custom HTML/CSS when possible
2. **Follow WordPress security guidelines** (sanitization, escaping, nonces, permissions)
3. **Keep it simple** - avoid over-engineering
4. **Maintain consistency** with WordPress UI/UX patterns

**Examples:**
```javascript
// ✅ CORRECT - Use WordPress ColorPalette
<ColorPalette value={color} onChange={setColor} />

// ❌ WRONG - Custom color picker implementation
<div className="custom-color-picker">...</div>
```

---

## Color Selection Components

### 🎨 ALWAYS use `ColorPalette` instead of `ColorPicker`

**Rule:** In this plugin, we exclusively use `ColorPalette` components for color selection.

**Why:**

- ✅ **Consistent WordPress Look** - Round color swatches like everywhere else in WordPress
- ✅ **Theme Colors** - Automatically shows available theme colors
- ✅ **User-Friendly** - No complex color picker wheels
- ✅ **WordPress Standard** - Matches the rest of the UI

**Implementation:**

```javascript
// ✅ CORRECT - Use ColorPalette
import { ColorPalette } from "@wordpress/components";

<ColorPalette
  label="Text Color"
  value={textColor}
  onChange={(color) => setAttributes({ textColor: color })}
/>;

// ❌ WRONG - Don't use ColorPicker
import { ColorPicker } from "@wordpress/components";

<ColorPicker
  color={textColor}
  onChangeComplete={(color) => setAttributes({ textColor: color.hex })}
/>;
```

**Note:** The only exception is `wpColorPicker()` in PHP admin files, which is WordPress-specific and appropriate for backend settings.

## Import Statement

Always import `ColorPalette` in your component files:

```javascript
import { ColorPalette } from "@wordpress/components";
```

## Benefits

1. **Consistent UI** - All color selectors look the same
2. **Theme Integration** - Users see their theme colors immediately
3. **Better UX** - Simpler, more intuitive color selection
4. **WordPress Native** - Follows WordPress design patterns

---

_This rule applies to all new development and should be maintained when updating existing code._
