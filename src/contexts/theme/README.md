# Theme System Documentation

## Overview

The theme system provides comprehensive dark mode, light mode, and custom theme color support with user preference persistence. It's built using React Context and CSS custom properties for seamless theme switching.

## Features

- **Dark/Light Mode**: Automatic system preference detection with manual override
- **Custom Themes**: Pre-defined color themes (Light, Dark, Ocean Blue, Royal Purple, Forest Green)
- **User Preference Persistence**: Settings saved to localStorage
- **CSS Variables**: Dynamic theme application via CSS custom properties
- **TypeScript Support**: Full type safety for theme development
- **Responsive Design**: Mobile-friendly theme controls

## Files Structure

```
src/contexts/theme/
├── SpaceThemeContext.ts          # TypeScript interfaces and types
├── spaceThemeContextProvider.tsx  # Theme provider implementation
└── useSpaceTheme.ts              # Hook exports

src/components/
└── ThemeToggle.jsx               # Theme toggle component

src/styles/
└── theme.css                    # Theme CSS variables and utilities
```

## Usage

### 1. Wrap your app with the ThemeProvider

```jsx
import React from 'react';
import { SpaceThemeProvider } from './contexts/theme';
import App from './App';

function Root() {
  return (
    <SpaceThemeProvider>
      <App />
    </SpaceThemeProvider>
  );
}

export default Root;
```

### 2. Use the theme hook in components

```jsx
import React from 'react';
import { useSpaceTheme } from './contexts/theme';

const MyComponent = () => {
  const { 
    theme, 
    themeMode, 
    isDarkMode, 
    setThemeMode, 
    toggleTheme,
    availableThemes 
  } = useSpaceTheme();

  return (
    <div className="theme-card">
      <h1 className="theme-text">Current Theme: {theme.name}</h1>
      <button onClick={toggleTheme} className="theme-button">
        Toggle Theme
      </button>
    </div>
  );
};
```

### 3. Use CSS variables in your styles

```css
.my-component {
  background-color: var(--theme-background);
  color: var(--theme-text);
  border: 1px solid var(--theme-border);
}

.my-button {
  background-color: var(--theme-primary);
  color: white;
}
```

## API Reference

### useSpaceTheme Hook

Returns an object with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| `theme` | `Theme` | Current active theme object |
| `themeMode` | `'light' | 'dark' | 'system'` | Current theme mode |
| `isDarkMode` | `boolean` | Whether dark mode is active |
| `setThemeMode` | `(mode: ThemeMode) => void` | Set theme mode |
| `toggleTheme` | `() => void` | Toggle between light/dark |
| `availableThemes` | `Theme[]` | Array of available themes |

### Theme Interface

```typescript
interface Theme {
  name: string;
  colors: ThemeColors;
  isDark: boolean;
}

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
}
```

## Available Themes

1. **Light** - Clean, bright theme
2. **Dark** - Dark theme for low-light environments
3. **Ocean Blue** - Blue-tinted light theme
4. **Royal Purple** - Purple-tinted light theme
5. **Forest Green** - Green-tinted light theme

## CSS Variables

The theme system automatically sets the following CSS custom properties:

- `--theme-primary` - Primary brand color
- `--theme-secondary` - Secondary text color
- `--theme-background` - Main background color
- `--theme-surface` - Card/surface background
- `--theme-text` - Primary text color
- `--theme-text-secondary` - Secondary text color
- `--theme-border` - Border color
- `--theme-accent` - Accent color
- `--theme-success` - Success state color
- `--theme-warning` - Warning state color
- `--theme-error` - Error state color

## ThemeToggle Component

A ready-to-use theme toggle component is included:

```jsx
import ThemeToggle from './components/ThemeToggle';

// Simple toggle button
<ThemeToggle />

// With custom className
<ThemeToggle className="my-custom-class" />
```

The component provides:
- Simple toggle button (sun/moon icon)
- Advanced theme selector with radio buttons
- Color theme preview buttons
- Current theme information display

## Integration with Existing Components

To make existing components theme-aware:

1. **Replace hardcoded colors with CSS variables**:
   ```css
   /* Before */
   .button { background-color: #3B82F6; }
   
   /* After */
   .button { background-color: var(--theme-primary); }
   ```

2. **Add dark mode classes**:
   ```css
   .card {
     background-color: white;
     color: black;
   }
   
   [data-theme="dark"] .card {
     background-color: #1F2937;
     color: white;
   }
   ```

3. **Use theme hook for conditional rendering**:
   ```jsx
   const { isDarkMode } = useSpaceTheme();
   
   return (
     <div className={isDarkMode ? 'dark-styles' : 'light-styles'}>
       Content
     </div>
   );
   ```

## Best Practices

1. **Use CSS variables** for colors, backgrounds, borders
2. **Test with all themes** to ensure good contrast
3. **Provide smooth transitions** for theme switching
4. **Respect system preferences** by defaulting to 'system' mode
5. **Persist user choices** in localStorage (handled automatically)

## Custom Themes

To add custom themes:

1. **Create theme object**:
   ```javascript
   const myCustomTheme = {
     name: 'My Theme',
     isDark: false,
     colors: {
       primary: '#FF6B6B',
       secondary: '#4ECDC4',
       background: '#F8F9FA',
       surface: '#FFFFFF',
       text: '#2C3E50',
       textSecondary: '#7F8C8D',
       border: '#DEE2E6',
       accent: '#E74C3C',
       success: '#27AE60',
       warning: '#F39C12',
       error: '#E74C3C',
     }
   };
   ```

2. **Use setCustomTheme**:
   ```javascript
   const { setCustomTheme } = useSpaceTheme();
   setCustomTheme(myCustomTheme);
   ```

## Migration Guide

To migrate existing components:

1. **Import theme hook**: `import { useSpaceTheme } from './contexts/theme';`
2. **Replace static colors**: Use CSS variables or theme hook values
3. **Add theme provider**: Wrap app with `SpaceThemeProvider`
4. **Test all themes**: Ensure good UX across all theme options

## Troubleshooting

### Theme not applying
- Ensure `SpaceThemeProvider` wraps your component
- Check CSS variables are properly referenced
- Verify theme CSS is imported

### Flickering on load
- Theme initialization happens client-side
- Consider a loading state or SSR solution

### Custom colors not working
- Check CSS variable names match theme properties
- Ensure theme CSS is loaded before component styles
