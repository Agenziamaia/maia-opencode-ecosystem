# MAIA Hero Section

A brutalist, retro-futuristic hero section showcasing 21 autonomous agents.

## Features

- **21 Agent Cards** with status indicators (operational/degraded/critical)
- **Interactive Hover States** revealing agent capabilities
- **Responsive Grid** (1-7 columns depending on screen size)
- **Animated Entry** with staggered reveals
- **Retro-Futuristic Aesthetic** with sharp edges, monospace typography, and vibrant accents

## Design Principles

- **Brutalist Style**: Bold colors, sharp edges, no rounded corners
- **Monospace Typography**: Uses system monospace fonts for that raw tech feel
- **Vibrant Accent Colors**: Cyan (#00ffff) and electric green (#00ff66) against deep black
- **Visual Depth**: Grid patterns, scanlines, and glowing effects
- **Performance-Optimized**: CSS animations, lazy-loaded with React Suspense

## Status Indicators

- Green (#00ff66): Fully operational
- Amber (#ff9500): Degraded performance
- Red (#ff3366): Critical status requiring attention

## Usage

```tsx
import { HeroSection } from '@/components';

export default function LandingPage() {
  return <HeroSection />;
}
```

## Dependencies

- React 18+
- Tailwind CSS 3.4+
- Framer Motion 10+

## Customization

Modify the `agents` array to update agent data:

```tsx
const agents = [
  {
    name: 'AGENT_NAME',
    role: 'Role Description',
    status: 'alive' | 'slow' | 'risky',
    capabilities: ['Capability 1', 'Capability 2', ...]
  },
  // ... more agents
];
```

## Responsive Breakpoints

- Mobile: 1 column
- Small tablet: 2 columns
- Tablet: 3 columns
- Desktop: 4 columns
- Large desktop: 7 columns

## Browser Support

Modern browsers with ES2022+ support:
- Chrome 115+
- Firefox 115+
- Safari 16.4+
- Edge 115+
