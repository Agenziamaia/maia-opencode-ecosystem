# MAIA Skills Demo

Interactive demonstration cards showcasing MAIA agentic capabilities.

## Features

This demo showcases 5 core MAIA skills:

### 1. React Component Generator
- Live code editor with syntax highlighting
- Instant preview panel
- Copy code functionality
- Template-based component generation

### 2. Algorithmic Art
- p5.js integration for generative art
- Seeded randomness for reproducible artwork
- Save as PNG functionality
- Regenerate button for new creations

### 3. Internal Communications
- Multiple report templates (Weekly, Sprint, Incident)
- Form-based report generation
- PDF export capability
- Professional formatting

### 4. PDF Form Filler
- Dynamic form field management
- Real-time validation
- PDF generation with jsPDF
- Professional document output

### 5. Vibe Kanban Board
- Drag-and-drop task management
- 4-column layout (Backlog, To Do, In Progress, Done)
- Visual progress tracking
- Task priority indicators

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Generative Art**: p5.js
- **PDF Generation**: jsPDF
- **Language**: TypeScript

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Design Philosophy

This demo follows the **frontend-design** skill principles:
- Bold, distinctive aesthetics
- Custom MAIA color palette (orange, blue, cream, dark)
- Glassmorphism card effects
- Smooth micro-animations
- Generous spacing and visual hierarchy
- No generic AI templates

## Project Structure

```
maia-landing-page/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── Modal.tsx          # Shared modal component
│   ├── ReactComponentDemo.tsx
│   ├── AlgorithmicArtDemo.tsx
│   ├── InternalCommsDemo.tsx
│   ├── PdfDemo.tsx
│   └── VibeKanbanDemo.tsx
├── lib/                   # Utility functions
├── tailwind.config.js     # Tailwind configuration
├── next.config.js        # Next.js configuration
└── tsconfig.json         # TypeScript configuration
```

## Key Features

### Interactive Cards
- Hover animations with shadow effects
- Modal-based demos
- Independent functionality per card
- No complex state management required

### Styling
- Custom MAIA brand colors
- Glassmorphism effects
- Gradient backgrounds
- Responsive grid layout
- Custom scrollbar styling

### Performance
- Static page generation
- Optimized images
- Code splitting
- Minimal bundle size

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

Part of the MAIA Ecosystem.
