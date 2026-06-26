# Asistencia SENA — Design System (MASTER)

> Generated using UI UX Pro Max Skill v2.5.0
> Product Type: Educational App
> Generated: 2026-06-12

---

## Design System Overview

+----------------------------------------------------------------------------------------+
|  TARGET: Asistencia SENA - RECOMMENDED DESIGN SYSTEM                                    |
+----------------------------------------------------------------------------------------+
|                                                                                        |
|  PATTERN: Feature-Rich Dashboard                                                        |
|     Conversion: Task-focused with clear CTAs                                           |
|     CTA: Primary actions prominent, secondary actions subtle                           |
|     Sections:                                                                          |
|       1. Header (Navigation + User Info)                                               |
|       2. Dashboard (Today's Summary)                                                   |
|       3. Quick Actions (Scan, Import, Export)                                          |
|       4. Data Tables (Aprendices, Asistencias)                                         |
|       5. Statistics (Charts + Reports)                                                 |
|                                                                                        |
|  STYLE: Claymorphism + Micro-interactions                                              |
|     Keywords: Soft 3D, chunky, playful, toy-like, bubbly, thick borders (3-4px),       |
|               double shadows, rounded (16-24px), micro-animations                      |
|     Best For: Educational apps, children's apps, SaaS platforms, creative tools        |
|     Performance: Excellent | Accessibility: WCAG AA                                    |
|                                                                                        |
|  COLORS:                                                                               |
|     Primary:    #4F46E5 (Indigo 600)                                                   |
|     Secondary:  #818CF8 (Indigo 400)                                                   |
|     CTA:        #F97316 (Orange 500)                                                   |
|     Background: #EEF2FF (Indigo 50)                                                    |
|     Surface:    #FFFFFF (White)                                                         |
|     Text:       #1E1B4B (Indigo 950)                                                   |
|     Text Light: #6B7280 (Gray 500)                                                     |
|     Success:    #22C55E (Green 500)                                                    |
|     Warning:    #F59E0B (Amber 500)                                                    |
|     Error:      #EF4444 (Red 500)                                                      |
|     Notes: Playful indigo palette with energetic orange for CTAs                       |
|                                                                                        |
|  TYPOGRAPHY: Fredoka + Nunito                                                          |
|     Heading: Fredoka (500-700 weight) - Rounded, friendly                              |
|     Body: Nunito (400-600 weight) - Clean, readable                                    |
|     Mood: Playful, friendly, fun, creative, warm, approachable                         |
|     Best For: Children's apps, educational, gaming, creative tools                     |
|     Google Fonts: https://fonts.google.com/share?selection.family=Fredoka:wght@400;500;600;700|Nunito:wght@300;400;500;600;700 |
|                                                                                        |
|  KEY EFFECTS:                                                                          |
|     Claymorphism: Soft 3D, chunky elements, double shadows                             |
|     Micro-interactions: Small 50-100ms animations, hover states                        |
|     Border radius: 16-24px                                                             |
|     Borders: 3-4px solid                                                               |
|     Shadows: Inner + outer (subtle, no hard lines)                                     |
|                                                                                        |
|  AVOID (Anti-patterns):                                                                |
|     - Formal corporate, professional services, data-critical                           |
|     - Serious/medical, legal apps, finance                                             |
|     - Dark mode (use light mode with playful colors)                                   |
|     - Harsh animations                                                                 |
|     - Sharp corners (< 12px)                                                           |
|                                                                                        |
|  PRE-DELIVERY CHECKLIST:                                                               |
|     [ ] No emojis as icons (use SVG: Heroicons/Lucide)                                 |
|     [ ] cursor-pointer on all clickable elements                                       |
|     [ ] Hover states with smooth transitions (150-300ms)                               |
|     [ ] Light mode: text contrast 4.5:1 minimum                                        |
|     [ ] Focus states visible for keyboard nav                                          |
|     [ ] prefers-reduced-motion respected                                               |
|     [ ] Responsive: 375px, 768px, 1024px, 1440px                                       |
|                                                                                        |
+----------------------------------------------------------------------------------------+

---

## Color Palette

```css
:root {
  /* Primary Colors */
  --color-primary: #4F46E5;        /* Indigo 600 */
  --color-primary-light: #818CF8;  /* Indigo 400 */
  --color-primary-dark: #3730A3;   /* Indigo 800 */
  
  /* Secondary Colors */
  --color-secondary: #818CF8;      /* Indigo 400 */
  
  /* CTA Colors */
  --color-cta: #F97316;            /* Orange 500 */
  --color-cta-hover: #EA580C;      /* Orange 600 */
  
  /* Background Colors */
  --color-background: #EEF2FF;     /* Indigo 50 */
  --color-surface: #FFFFFF;        /* White */
  --color-surface-alt: #F9FAFB;    /* Gray 50 */
  
  /* Text Colors */
  --color-text: #1E1B4B;           /* Indigo 950 */
  --color-text-light: #6B7280;     /* Gray 500 */
  --color-text-muted: #9CA3AF;     /* Gray 400 */
  
  /* Status Colors */
  --color-success: #22C55E;        /* Green 500 */
  --color-warning: #F59E0B;        /* Amber 500 */
  --color-error: #EF4444;          /* Red 500 */
  --color-info: #3B82F6;           /* Blue 500 */
  
  /* Border Colors */
  --color-border: #E5E7EB;         /* Gray 200 */
  --color-border-light: #F3F4F6;   /* Gray 100 */
}
```

---

## Typography

```css
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@300;400;500;600;700&display=swap');

:root {
  /* Font Families */
  --font-heading: 'Fredoka', sans-serif;
  --font-body: 'Nunito', sans-serif;
  
  /* Font Sizes */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  
  /* Font Weights */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}
```

---

## Spacing & Layout

```css
:root {
  /* Spacing Scale */
  --space-1: 0.25rem;     /* 4px */
  --space-2: 0.5rem;      /* 8px */
  --space-3: 0.75rem;     /* 12px */
  --space-4: 1rem;        /* 16px */
  --space-5: 1.25rem;     /* 20px */
  --space-6: 1.5rem;      /* 24px */
  --space-8: 2rem;        /* 32px */
  --space-10: 2.5rem;     /* 40px */
  --space-12: 3rem;       /* 48px */
  --space-16: 4rem;       /* 64px */
  
  /* Border Radius (Claymorphism) */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
  
  /* Borders (Claymorphism) */
  --border-width: 3px;
  --border-width-lg: 4px;
  
  /* Shadows (Claymorphism) */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  
  /* Claymorphism Shadows */
  --shadow-clay: inset -2px -2px 8px rgba(0, 0, 0, 0.1), 4px 4px 8px rgba(0, 0, 0, 0.1);
  --shadow-clay-sm: inset -1px -1px 4px rgba(0, 0, 0, 0.1), 2px 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-clay-lg: inset -3px -3px 12px rgba(0, 0, 0, 0.1), 6px 6px 12px rgba(0, 0, 0, 0.1);
}
```

---

## Components

### Buttons

```css
.btn {
  font-family: var(--font-body);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-lg);
  border: var(--border-width) solid transparent;
  cursor: pointer;
  transition: all 200ms ease-out;
  box-shadow: var(--shadow-clay-sm);
}

.btn:active {
  transform: scale(0.98);
  box-shadow: inset -1px -1px 4px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  color: white;
  border-color: var(--color-primary-dark);
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary));
  box-shadow: var(--shadow-clay);
}

.btn-cta {
  background: linear-gradient(135deg, var(--color-cta), #FB923C);
  color: white;
  border-color: #C2410C;
}

.btn-cta:hover {
  background: linear-gradient(135deg, var(--color-cta-hover), var(--color-cta));
  box-shadow: var(--shadow-clay);
}
```

### Cards

```css
.card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  border: var(--border-width) solid var(--color-border);
  box-shadow: var(--shadow-clay);
  padding: var(--space-6);
  transition: all 200ms ease-out;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-clay-lg);
}

.card-header {
  font-family: var(--font-heading);
  font-weight: var(--font-semibold);
  font-size: var(--text-xl);
  color: var(--color-text);
  margin-bottom: var(--space-4);
}

.card-body {
  font-family: var(--font-body);
  color: var(--color-text-light);
  line-height: var(--leading-relaxed);
}
```

### Forms

```css
.input {
  font-family: var(--font-body);
  font-size: var(--text-base);
  border-radius: var(--radius-lg);
  border: var(--border-width) solid var(--color-border);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  color: var(--color-text);
  transition: all 200ms ease-out;
  box-shadow: var(--shadow-clay-sm);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-clay), 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.input::placeholder {
  color: var(--color-text-muted);
}

.label {
  font-family: var(--font-body);
  font-weight: var(--font-medium);
  font-size: var(--text-sm);
  color: var(--color-text);
  margin-bottom: var(--space-2);
  display: block;
}
```

### Navigation

```css
.nav {
  background: var(--color-surface);
  border-bottom: var(--border-width) solid var(--color-border);
  box-shadow: var(--shadow-clay-sm);
}

.nav-item {
  font-family: var(--font-body);
  font-weight: var(--font-medium);
  color: var(--color-text-light);
  padding: var(--space-4) var(--space-6);
  border-bottom: var(--border-width) solid transparent;
  transition: all 200ms ease-out;
  cursor: pointer;
}

.nav-item:hover {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary-light);
}

.nav-item.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: var(--font-semibold);
}
```

---

## Micro-interactions

```css
/* Hover Effects */
.hover-lift {
  transition: transform 200ms ease-out, box-shadow 200ms ease-out;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-clay-lg);
}

/* Press Effects */
.press-scale {
  transition: transform 100ms ease-out;
}

.press-scale:active {
  transform: scale(0.98);
}

/* Loading Spinner */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}

/* Success Animation */
@keyframes success-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.success-animate {
  animation: success-bounce 300ms ease-out;
}

/* Fade In */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fade-in 300ms ease-out;
}
```

---

## Responsive Breakpoints

```css
/* Mobile First Approach */
/* Base: 375px (iPhone SE) */

/* Small devices (landscape phones, 576px and up) */
@media (min-width: 576px) { ... }

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) { ... }

/* Large devices (desktops, 992px and up) */
@media (min-width: 992px) { ... }

/* Extra large devices (large desktops, 1200px and up) */
@media (min-width: 1200px) { ... }

/* XXL devices (larger desktops, 1400px and up) */
@media (min-width: 1400px) { ... }
```

---

## Accessibility

- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus States**: Visible focus rings for keyboard navigation
- **Reduced Motion**: Respect `prefers-reduced-motion` media query
- **Semantic HTML**: Use proper heading hierarchy and landmarks
- **Alt Text**: Provide descriptive alt text for images
- **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible

---

## Usage Guidelines

### Do's
- Use claymorphism for playful, educational interfaces
- Implement micro-interactions for feedback
- Use the primary indigo palette for consistency
- Apply orange CTAs for important actions
- Maintain 4.5:1 color contrast ratio
- Use Fredoka for headings, Nunito for body text
- Apply 16-24px border radius
- Use 3-4px borders with double shadows

### Don'ts
- Use for formal corporate or medical applications
- Apply dark mode (use light mode with playful colors)
- Use harsh animations or sharp corners
- Skip focus states or keyboard navigation
- Ignore reduced motion preferences
- Use emojis as icons (use SVG icons instead)

---

## Files Structure

```
design-system/
├── MASTER.md                    # This file (Global Source of Truth)
├── pages/                       # Page-specific overrides
│   ├── home.md                  # Dashboard page overrides
│   ├── scan.md                  # QR Scan page overrides
│   ├── aprendices.md            # Students page overrides
│   ├── historial.md             # History page overrides
│   └── estadisticas.md          # Statistics page overrides
└── assets/                      # Design assets
    ├── colors.css               # Color variables
    ├── typography.css           # Typography styles
    └── components.css           # Component styles
```

---

*Generated by UI UX Pro Max Skill v2.5.0*
*Last updated: 2026-06-12*
