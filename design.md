# E-Waste Management Website — Design Specification

> **Project**: New website for an e-waste management company  
> **Stack**: Next.js 14 (App Router) · TypeScript · TailwindCSS v4 · Framer Motion · Lucide Icons  
> **Inspiration Source**: Aatomate codebase — patterns are adapted and elevated, not copied verbatim

---

## 1. Brand Identity

### 1.1 Company Concept
An e-waste management company that collects, refurbishes, and responsibly recycles electronic devices. The brand should feel:

- **Trustworthy** — government & enterprise clients must feel confidence
- **Forward-thinking** — tech-adjacent, not dusty "green charity" vibes
- **Urgent but optimistic** — the problem is serious; the solution is exciting

### 1.2 Naming Candidates (choose one)
| Name | Feel |
|------|------|
| **Verdex** | Tech + verdant. Short, memorable. |
| **Recyronik** | Playful blend of recycle + electronic |
| **Looptek** | Loop = circular economy; tek = tech |
| **Nullwaste** | Hacker aesthetic, zero-to-null mental model |

---

## 2. Color System

### 2.1 Palette

```css
@theme {
  /* Backgrounds */
  --color-void:          #080A08;   /* near-black with green tint — hero bg */
  --color-obsidian:      #0F110F;   /* section dark bg */
  --color-surface:       #161A16;   /* card bg on dark */
  --color-mist:          #F4F6F2;   /* light page bg */
  --color-paper:         #FFFFFF;

  /* Brand Greens */
  --color-circuit:       #2ECC71;   /* primary action — vivid eco-green */
  --color-pulse:         #00FF88;   /* glow / highlight */
  --color-leaf:          #1A9E50;   /* secondary green */
  --color-moss:          #4A7C59;   /* muted green */

  /* Accent */
  --color-amber:         #F5A623;   /* warning / highlight for urgency stats */
  --color-cobalt:        #3B82F6;   /* data / tech accent */
  --color-poison:        #B8FF3A;   /* neon yellow-green — use sparingly for pop */

  /* Neutrals */
  --color-ash:           #6B7280;
  --color-smoke:         #374151;
  --color-chalk:         #E5E7EB;
}
```

### 2.2 Usage Rules
| Context | Color |
|---------|-------|
| Page background (dark sections) | `void` / `obsidian` |
| Page background (light sections) | `mist` |
| Primary CTA buttons | `circuit` (#2ECC71) |
| Glow effects behind icons | `pulse` with 15–20% opacity |
| Urgency stats (tonnes of e-waste) | `amber` |
| Data visualizations | `cobalt` |
| Neon pop accents (1 per section max) | `poison` |
| Body text on dark | `white/80` |
| Muted text on dark | `white/40` |

---

## 3. Typography

### 3.1 Font Stack
```css
/* Display — bold, editorial impact */
--font-display: 'Bebas Neue', sans-serif;       /* Headlines */

/* Sans — clean, modern UI */
--font-sans: 'Inter', sans-serif;                /* Body, UI */

/* Mono — technical data, labels */
--font-mono: 'IBM Plex Mono', monospace;         /* Stats, code, tags */
```

### 3.2 Type Scale

| Token | Size | Use |
|-------|------|-----|
| `display` | 120–160px | Hero mega-headline |
| `display-sm` | 64–80px | Section hero headlines |
| `heading-lg` | 48–56px | Section titles |
| `heading` | 32–40px | Card titles |
| `subheading` | 20–24px | Sub-labels |
| `body-lg` | 18–20px | Lead paragraphs |
| `body` | 15–16px | Default body |
| `caption` | 11–13px | Tags, mono labels |

---

## 4. Page Architecture

### Section Order (Single-Page)

```
1.  Navbar
2.  Hero
3.  Impact Counter Bar  (statistics strip)
4.  Problem Visualizer  (scroll-animated waste accumulation)
5.  How It Works        (3-step process cards)
6.  Services            (interactive hover list — lifted from Aatomate)
7.  Device Categories   (grid of accepted e-waste cards)
8.  Impact Dashboard    (live-style stats / case studies)
9.  Industries Served
10. Testimonials
11. FAQ
12. CTA / Contact
13. Footer
```

---

## 5. Component Design Specifications

### 5.1 Navbar

**Behavior**: Identical to Aatomate — hide on scroll-down, reveal on scroll-up. Float pill with glassmorphism.

```
Layout: Logo left · Nav pills center (absolute) · CTA button right
Scroll state: bg white/10 backdrop-blur-md → bg white/95 backdrop-blur-xl
Logo mark: Recycle arrow icon + wordmark
CTA: "Book a Pickup" — solid #2ECC71 button
Mobile: Hamburger → animated drawer from top
```

**Links**: Services · How It Works · Impact · Industries · Contact

---

### 5.2 Hero Section

**Concept**: Full-viewport dark scene with a **floating 3D circuit-board card** visual on the right, text on the left.

#### Layout
```
Left (60%):
  — Eyebrow badge: "🌍 India's #1 Certified E-Waste Partner"
  — H1 (Bebas Neue 130px): "TURN OLD TECH" [br] "INTO A [green]GREENER[/green]" [br] "FUTURE."
  — Body 18px: We collect, refurbish, and responsibly recycle
    your outdated electronics — giving them a second life.
  — CTA Row: [Book a Pickup →] [See How It Works]
  — Small trust badges: ISO 14001 · CPCB Certified · 50,000+ Devices Recycled

Right (40%):
  — 3D animated card visual (see 5.2.1)
```

#### 5.2.1 Hero Visual: "E-Waste Terminal"

This replaces the WhatsApp mockup from Aatomate. A **dark glassmorphic terminal/dashboard card** that simulates a real-time e-waste processing feed.

```tsx
// Animation sequence (looping, same pattern as Aatomate's chatSequence)
const feedSequence = [
  { id: 1, type: "intake",   device: "MacBook Pro 2017",  weight: "1.8 kg",  status: "Received",    color: "#3B82F6" },
  { id: 2, type: "scan",     device: "iPhone 11 (batch)", weight: "4.2 kg",  status: "Scanning...", color: "#F5A623" },
  { id: 3, type: "sort",     device: "HP Inkjet Printer", weight: "3.1 kg",  status: "Sorted",      color: "#2ECC71" },
  { id: 4, type: "process",  device: "Dell Monitor x3",   weight: "12.6 kg", status: "Processed",   color: "#B8FF3A" },
  { id: 5, type: "metric",   text: "CO₂ Saved Today: 4.2 tonnes",            color: "#00FF88" },
];
```

**Card UI structure**:
```
┌──────────────────────────────────────────────┐
│  ⬤ ⬤ ⬤   VERDEX PROCESSING NODE — LIVE      │
├──────────────────────────────────────────────┤
│  [🔵] MacBook Pro 2017      1.8 kg  Received │  ← slides in from bottom
│  [🟡] iPhone 11 (batch)     4.2 kg  Scanning │  ← animated dots
│  [🟢] HP Inkjet Printer     3.1 kg  Sorted   │
│  [💚] Dell Monitor x3      12.6 kg  Processed│
│                                              │
│  ╔══════════════════════════════════════╗    │
│  ║  CO₂ Saved Today:   4.2 tonnes      ║    │ ← glowing highlight row
│  ╚══════════════════════════════════════╝    │
└──────────────────────────────────────────────┘
```

**Floating satellite card** (top-left of visual, pops in after 2s):
```
┌──────────────────────────┐
│  ♻️  Devices This Month   │
│     12,847               │  ← counter animates up
│     ▲ +23% vs last month │
└──────────────────────────┘
```

**Background glow**: `radial-gradient(circle, rgba(46,204,113,0.12) center, transparent 60%)`
**Animation**: same `rotateY: 15 → 0, rotateX: 5 → 0, scale: 0.9 → 1` entrance as Aatomate

---

### 5.3 Impact Counter Bar (Statistics)

Lifted directly from Aatomate's `Statistics.tsx` — dark pill, 4 stats, hover glow. Updated content:

```
┌──────────────────────────────────────────────────────────────────────┐
│  [♻️]           [🌱]              [🏭]             [💰]              │
│  50,000+        820 tonnes        98%              ₹4.2Cr            │
│  DEVICES        CO₂ OFFSET        RECOVERY RATE    CLIENT SAVINGS    │
└──────────────────────────────────────────────────────────────────────┘
```

- Overlaps hero (negative margin-top: -96px), z-index above hero
- On hover: icon turns `circuit` green, value scales up 1.05x
- Entrance: stagger `opacity: 0 → 1, y: 30 → 0` with 0.1s delay each

---

### 5.4 Problem Visualizer Section

**Concept**: A split-screen section. Left = scrolling text. Right = animated "waste accumulation" visual.

#### Layout
```
Background: mist (#F4F6F2) — light section contrast
Left (45%):
  — Eyebrow: "THE PROBLEM"
  — H2: "50 Million Tonnes of E-Waste Generated Every Year."
  — Paragraphs describing toxic metals, landfill leaching, etc.
  — Animated urgency badge with pulse: "India generates 1.6M tonnes annually"

Right (55%):
  — "E-Waste Pile" visual (see 5.4.1)
```

#### 5.4.1 Waste Pile Visual

A stacked-card animation. Each card represents a device category with icon. Cards drop in one by one with a slight rotation, like a pile forming.

```tsx
const wasteItems = [
  { icon: Laptop,     label: "Laptops & Computers",   count: "12M units/yr", color: "#3B82F6" },
  { icon: Smartphone, label: "Mobile Phones",          count: "7M units/yr",  color: "#F5A623" },
  { icon: Tv,         label: "Televisions",            count: "8M units/yr",  color: "#8B5CF6" },
  { icon: Printer,    label: "Printers & Peripherals", count: "4M units/yr",  color: "#EF4444" },
  { icon: Battery,    label: "Batteries",              count: "18M units/yr", color: "#2ECC71" },
];
```

**Animation**: Using `useInView` + staggered `motion.div` with `rotate: [random(-5, 5)deg]`, `y: [0 → stacked offset]`. Cards fan out on hover. This is the "realistic card stack" you mentioned.

**Card design per item** (pure CSS, no AI-generated imagery):
```
w-[320px] h-[90px] bg-white border border-black/8 rounded-[20px]
shadow-[0_8px_24px_rgba(0,0,0,0.06)]
flex items-center gap-4 px-6
absolute positioned, staggered translateY
```

---

### 5.5 How It Works — Process Section

Same interactive tabbed layout as Aatomate's `Process.tsx`. Four steps with auto-play and unique visual per step.

#### Steps

| # | Title | Description | Visual |
|---|-------|-------------|--------|
| 01 | **Schedule Pickup** | Book online or call — we come to you within 48 hours | Calendar widget UI mockup |
| 02 | **Device Audit** | Our team weighs, scans, and grades each device on-site | Scanning animation (laser line) |
| 03 | **Responsible Processing** | Certified dismantling, hazardous material isolation, refurb or shred | Flowchart node diagram |
| 04 | **Receive Your Report** | Get a verified Certificate of Recycling + CO₂ offset report | PDF certificate card |

**Tab color accents**: `#F5A623` · `#2ECC71` · `#3B82F6` · `#B8FF3A`

**Visual 01 — Calendar Mockup**:
```
Dark rounded card with mini calendar grid.
Selected date glows green.
"Pickup Confirmed" badge fades in below.
```

**Visual 02 — Scanning Animation**:
Laser line sweeping top-to-bottom (same `motion.div animate={{ top: ["0%","100%","0%"] }}`) over a stylized device icon grid.

**Visual 03 — Flowchart**:
Node-and-line diagram (same SVG line pathLength animation as Aatomate step 2).
Nodes: `Intake → Hazmat Check → Refurb / Shred → Metals Recovery → Report`

**Visual 04 — Certificate Card**:
A skeuomorphic certificate with a green seal, company logo placeholder, device count, CO₂ saved. Subtle paper texture. Appears with a `rotateX: -10 → 0` entrance.

---

### 5.6 Services — Interactive List

**Identical interaction model to Aatomate's `Services.tsx`** (hover left list → right panel updates). Dark section.

#### Services List

```
01  Corporate E-Waste Audits
02  Scheduled Bulk Pickups
03  ITAD (IT Asset Disposition)
04  Data Destruction & Certificates
05  Device Refurbishment & Resale
06  CSR Compliance Reporting
07  Battery & Hazardous Waste Management
```

**Right panel**:
- Dynamic gradient background (green shades for eco brand)
- Floating icon (animated `y: [0, -8, 0]` loop)
- Service title (Bebas Neue 56px)
- Short description
- 3 key benefits with `CheckCircle2` icons (animated stagger)
- "Learn More →" button

**Section background**: `#080A08` (void) with grain texture overlay.

---

### 5.7 Device Categories — Accept Grid

**New section unique to this site**. A bento-style grid of accepted e-waste types.

#### Layout
```
Section bg: mist (#F4F6F2)
Heading: "We Accept Everything Electronic."

Bento grid (CSS Grid):
┌─────────────┬─────────────┬─────────────────────────┐
│   Phones    │   Laptops   │     TVs & Monitors       │
│  (1×1)      │  (1×1)      │       (2×1)              │
├─────────────┴─────────────┼─────────────┬────────────┤
│  Servers & Data Centers   │  Batteries  │ Appliances │
│        (2×1)              │   (1×1)     │   (1×1)    │
└───────────────────────────┴─────────────┴────────────┘
```

#### Card Design (The "Realistic Animation Cards" you asked for)

Each card uses **3D tilt physics** — same `useMotionValue` + `useSpring` + `rotateX/rotateY` as Aatomate's `InteractivePhone`.

```tsx
// Per card:
const x = useMotionValue(0);
const y = useMotionValue(0);
const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);
```

**Card anatomy**:
```
bg: white  border: 1px solid black/6  border-radius: 28px
shadow: 0 20px 50px rgba(0,0,0,0.06)
padding: 32px
style="transform-style: preserve-3d"

┌──────────────────────────────────┐
│  [Icon — 64×64 rounded square]   │
│   Background: brand color /10    │
│   Icon: brand color              │
│                                  │
│  [Category Name — 28px bold]     │
│  [Accepts N+ device types]       │
│                                  │
│  [Count badge — devices recycled]│
│  ─────────────────────────────── │
│  [Hover: "Schedule Pickup →"]    │  ← slides up from bottom on hover
└──────────────────────────────────┘
```

**Hover state** (CSS + Framer):
- Card lifts: `translateZ: 40px` (transform-style: preserve-3d)
- Subtle radial glow appears behind icon
- A shimmer line sweeps left-to-right (same as Aatomate's workflow visual)
- Bottom CTA fades in (`opacity: 0 → 1`, `y: 8 → 0`)

**Entrance animation**: `whileInView` stagger, each card `opacity: 0, y: 40 → opacity: 1, y: 0` with 0.08s delay per item.

---

### 5.8 Impact Dashboard (Case Studies)

**Same horizontal scroll carousel as Aatomate's `Results.tsx`**, adapted for e-waste impact stories.

#### Card Colors
```
Card 1: bg-[#d8f5e3]  visual-bg: bg-[#c5ecd4]   (green — recovery)
Card 2: bg-[#d9f2ff]  visual-bg: bg-[#c5e5f5]   (blue — data destruction)
Card 3: bg-[#fef3d0]  visual-bg: bg-[#f5e9b5]   (amber — CSR compliance)
Card 4: bg-[#f0d9ff]  visual-bg: bg-[#e1c5f5]   (purple — battery mgmt)
```

#### Sample Case Studies

**Card 1 — Corporate Bulk Pickup**
```
Industry: Fortune 500 Technology Firm
Problem: 3,000+ decommissioned laptops sitting in warehouse risking data breach.
Solution: Verdex collected, audited, and issued NIST 800-88 data wipe certificates.
Result: "12,847 kg diverted from landfill. Zero data breach incidents."
```

**Card 2 — ITAD for Healthcare**
```
Industry: Multi-location Hospital Chain
Problem: Medical devices and workstations with patient data, no compliant disposal path.
Solution: On-site secure data destruction + certified recycling for 1,200 devices.
Result: "100% HIPAA-compliant disposal. ₹18L saved vs. vendor quote."
```

**Visuals per card** (replace Aatomate's WhatsApp/Workflow visuals):

- **Card 1**: Animated weight counter widget (kg collected) + truck icon pulsing
- **Card 2**: Data wipe progress bar UI (same scanning animation as Process step 2)
- **Card 3**: CO₂ offset badge + tree-growth micro-animation
- **Card 4**: Battery health grid (colored cells appearing one by one)

---

### 5.9 Testimonials

Use Aatomate's testimonial carousel structure. Cards with:
- Client avatar (initials circle if no photo)
- Company + role
- Star rating (5 stars, gold)
- Quote text
- Tag badge: "Corporate Client" / "NGO Partner" / "Government"

---

### 5.10 FAQ

Same accordion as Aatomate's `FAQ.tsx`. Sample questions:
- What types of devices do you accept?
- Is there a minimum quantity for pickup?
- How is our data securely destroyed?
- Do you provide a certificate of recycling?
- What happens to devices that can't be refurbished?
- Are your processes CPCB certified?

---

### 5.11 Contact / CTA Section

**Split layout**:

```
Left (dark bg #080A08):
  — H2 (Bebas): "START YOUR RECYCLING JOURNEY."
  — Sub: "Book a free pickup consultation. No minimum quantity."
  — Contact form: Name · Company · Number of Devices · Device Type · Message
  — CTA: "Book Free Pickup →" (circuit green button)
  — Trust logos: CPCB · ISO 14001 · Data Security badges

Right (bg circuit green #2ECC71):
  — Large stylized "♻" mark
  — "Or WhatsApp us at +91 XXXXXXXXXX"
  — Quick stat: "48hr average pickup time"
```

---

## 6. Micro-Animations & Motion Language

### 6.1 Core Principles
1. **Physics-based** — use `spring` with `stiffness: 200–400, damping: 25–30` for organic feel
2. **Purposeful** — animations communicate state, not decoration
3. **No AI slop** — no generic fade-in-fade-out everywhere; motion is tied to meaning
4. **Performance** — use `will-change: transform` on tilt cards; GPU-composited only

### 6.2 Animation Catalog

| Effect | When | Implementation |
|--------|------|----------------|
| 3D Card Tilt | Device category cards on mouse move | `useMotionValue + useSpring + rotateX/Y` |
| Feed Row Slide | Hero terminal rows appearing | `opacity: 0, y: 10 → 1, 0` with spring |
| Scanning Laser | Process step 2 visual | `animate={{ top: ["0%", "100%", "0%"] }}` loop |
| Counter Up | Impact stats | `useMotionValue(0) + animate to N` on `useInView` |
| Auto-tab | Process section tabs | `setInterval 6s`, pauses on hover |
| Card Stack Drop | Problem section waste pile | staggered `y + rotate` entrance |
| Shimmer Sweep | Card hover state | `left: ["-100%", "100%"]` via `motion.div` |
| Satellite Float | Hero floating sub-card | `y: [0, -8, 0]` loop (same as Aatomate) |
| Blob Background | Services section, hero | CSS `radial-gradient` + opacity pulse |
| Progress Bar | Data wipe / recovery visual | `scaleX: 0 → 1` on view |
| Path Draw | Flowchart connector lines | SVG `pathLength: 0 → 1` (same as Aatomate step 2) |

### 6.3 Scroll Behavior
- Use `useInView` with `margin: "-100px"` for slightly-delayed trigger
- Use `once: true` for entrance animations, `once: false` for looping visuals
- Section parallax: optional subtle `useScroll + useTransform` on hero background

---

## 7. Design Tokens — Extended

### 7.1 Shadows
```css
--shadow-card:    0 8px 24px rgba(0, 0, 0, 0.06);
--shadow-card-lg: 0 20px 50px rgba(0, 0, 0, 0.10);
--shadow-glow-green: 0 0 40px rgba(46, 204, 113, 0.25);
--shadow-glow-neon:  0 0 60px rgba(184, 255, 58, 0.20);
--shadow-dark-xl: 0 30px 80px rgba(0, 0, 0, 0.50);
```

### 7.2 Border Radius
```css
--radius-card:    24px   /* standard cards */
--radius-card-lg: 32px   /* large bento cards */
--radius-hero:    48px   /* hero visual */
--radius-pill:    999px  /* buttons, tags */
--radius-icon:    16px   /* icon boxes */
```

### 7.3 Spacing
Follow 8px base grid. Key values: 8 · 16 · 24 · 32 · 48 · 64 · 80 · 96 · 128px.

---

## 8. Section-Level Background Strategy

| Section | Background | Purpose |
|---------|------------|---------|
| Navbar | Transparent → glass on scroll | Clean start |
| Hero | `#080A08` + green radial glow | Impact, dark premium |
| Statistics strip | Dark `#0A0A0A` pill card on light bg | Float effect |
| Problem Visualizer | `#F4F6F2` mist | Light contrast, breath |
| How It Works | `#050505` obsidian + grain texture | Dark, focus on content |
| Services | `#030303` + subtle noise overlay | Same dark, distinct |
| Device Categories | `#F4F6F2` mist | Alternating light |
| Impact Dashboard | White `#FFFFFF` | Clean for case study cards |
| Industries | `#F4F6F2` mist | Light |
| Testimonials | White | Neutral, trustworthy |
| FAQ | `#F4F6F2` mist | |
| Contact CTA | Split: `#080A08` / `#2ECC71` | Bold statement close |
| Footer | `#080A08` | Matches hero, full circle |

---

## 9. Responsive Design Notes

### Breakpoints
```css
sm:  640px   /* mobile landscape */
md:  768px   /* tablet */
lg:  1024px  /* desktop */
xl:  1280px  /* wide */
2xl: 1400px  /* ultra-wide max content width */
```

### Mobile Adaptations
| Desktop | Mobile |
|---------|--------|
| 12-col hero grid | Single column, visual below text |
| Process tabs + right panel | Horizontal scroll tabs, panel below |
| Services hover list + sticky right | Click-expand accordion |
| Bento grid 3-col | 1 col, vertical stack |
| Case study carousel (multi-visible) | Single card + swipe |
| Contact split | Single column stack |

### Touch Interactions
- 3D tilt cards: disable on `(pointer: coarse)`, fallback to `whileInView` entrance only
- Carousels: `snap-x snap-mandatory` with momentum scroll
- Process tabs: horizontal scroll on mobile

---

## 10. Implementation Patterns (from Aatomate codebase)

### 10.1 Patterns to Directly Reuse

| Pattern | Source File | Adapt For |
|---------|-------------|-----------|
| Auto-playing tabbed process | `Process.tsx` | How It Works section |
| Interactive hover service list | `Services.tsx` | Services section |
| Horizontal scroll carousel + dots | `Results.tsx` | Impact/Case studies |
| 3D phone tilt physics | `Products.tsx` | Device category cards |
| Statistics dark pill | `Statistics.tsx` | Impact counter bar |
| Chat feed loop animation | `Hero.tsx` | E-waste terminal feed |
| Smart navbar hide/show | `Navbar.tsx` | Navbar |
| Floating satellite card | `Hero.tsx` | Hero device counter |
| Preloader | `Preloader.tsx` | Page load preloader |

### 10.2 Global CSS Additions

```css
/* Custom scrollbar hiding */
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { scrollbar-width: none; ms-overflow-style: none; }

/* Grain texture overlay (reuse from Aatomate) */
.grain::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('https://grainy-gradients.vercel.app/noise.svg');
  opacity: 0.025;
  mix-blend-mode: overlay;
  pointer-events: none;
}

/* 3D perspective context */
.perspective-1000 { perspective: 1000px; }
.perspective-2000 { perspective: 2000px; }
```

### 10.3 Shared Layout Rules
```tsx
// Max content width container
<div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

// Section with dark background + rounded corners + margin
<section className="py-24 md:py-32 bg-[#030303] rounded-[48px] lg:rounded-[64px] mx-2 lg:mx-4 border border-white/5">

// Eyebrow badge (mono font, uppercase, pill)
<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
  <span className="font-mono text-[11px] text-circuit uppercase tracking-widest font-bold">
    Eyebrow Label
  </span>
</div>
```

---

## 11. Cards — Detailed Spec (The Main Focus)

### 11.1 Device Category Card (Bento — 3D Tilt)

```tsx
// Full implementation spec
<motion.div
  onMouseMove={handleMouseMove}
  onMouseLeave={handleMouseLeave}
  style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.08, type: "spring", stiffness: 180, damping: 20 }}
  className="relative bg-white border border-black/6 rounded-[28px] p-8
             shadow-[0_8px_24px_rgba(0,0,0,0.06)] overflow-hidden cursor-pointer
             hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] transition-shadow duration-500
             group"
>
  {/* Shimmer on hover */}
  <motion.div
    animate={{ left: ["-100%", "100%"] }}
    transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
    className="absolute top-0 -left-full w-1/2 h-full
               bg-gradient-to-r from-transparent via-white/20 to-transparent
               pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
  />

  {/* Icon */}
  <div
    className="w-16 h-16 rounded-[18px] flex items-center justify-center mb-6
               transition-transform duration-500 group-hover:scale-110"
    style={{ backgroundColor: `${category.color}15` }}
  >
    <category.Icon className="w-8 h-8" style={{ color: category.color }} />
  </div>

  {/* 3D lifted layer — text */}
  <div style={{ transform: "translateZ(20px)" }}>
    <h3 className="font-display text-[32px] uppercase tracking-tight text-black mb-1">
      {category.name}
    </h3>
    <p className="text-[14px] text-black/50 font-medium mb-4">
      {category.subtitle}
    </p>
    <div className="font-mono text-[11px] text-black/30 uppercase tracking-widest">
      {category.devicesRecycled} devices recycled
    </div>
  </div>

  {/* CTA — appears on hover */}
  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100
                  translate-y-2 group-hover:translate-y-0 transition-all duration-300">
    <span className="text-[13px] font-bold text-[#2ECC71] flex items-center gap-1">
      Schedule Pickup <ArrowRight className="w-4 h-4" />
    </span>
  </div>
</motion.div>
```

### 11.2 Case Study Carousel Card

Same structure as Aatomate `Results.tsx` but:
- Left panel: Problem → Solution → Key Impact (with `TrendingUp` icon)
- Right panel: Custom visual (weight counter, certificate, CO₂ offset, battery grid)
- Color palette: green-warm tones instead of Aatomate's blue/purple/orange

### 11.3 Process Step Visual Cards (dark bg)

Dark rounded container (same as Aatomate's `Process.tsx` right panel), each step has a unique animated sub-component.

### 11.4 Service Preview Card

Dark `#0A0A0A` sticky card (same right panel sticky behavior as Aatomate).
- Animated SVG blob background rotates 360° in 60s
- Service icon floats with `y: [0, -8, 0]`
- Benefits list staggers in on `AnimatePresence` change

### 11.5 Hero E-Waste Terminal Card

```tsx
// Structure:
// - Dark glassmorphic rounded card (bg-[#111]/95 border border-white/10)
// - Terminal header bar (traffic lights + "VERDEX PROCESSING NODE — LIVE")
// - Feed rows: each row = motion.div with slide-in animation from bottom
// - Each row: colored dot + device name + weight + status chip
// - Bottom "CO₂ Saved" highlight row: bg-[#2ECC71]/10 border border-[#2ECC71]/30
// - Floating satellite card: absolute positioned, spring entrance

const terminalCard = {
  className: "w-full max-w-[420px] bg-[#111111]/95 rounded-[28px] border border-white/10 overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl"
};

const feedRow = {
  initial: { opacity: 0, y: 16, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { type: "spring", stiffness: 300, damping: 25 }
};
```

---

## 12. Footer

**Layout** (dark, `#080A08`):
```
Top: Logo + tagline | Newsletter signup
Mid: Links grid — Services · Industries · Company · Legal
Bot: "© 2025 Verdex · ISO 14001 Certified · CPCB Authorized"
     Social icons: LinkedIn · Twitter/X · Instagram
     "Designed & Built with ♻️ in India"
```

---

## 13. Open Questions / Design Decisions

> [!IMPORTANT]
> These need your input before build starts:

1. **Company name & logo** — which name do you want? Will you provide a logo or should we design a mark?
2. **Color confirmation** — the `#2ECC71` circuit green is the primary. Is this the right shade, or do you want something more muted/vibrant?
3. **Dark vs. light default** — the design alternates dark/light sections. Should the hero be dark (as specced) or should we try a light hero?
4. **Real card images** — you mentioned you'll generate images. Which sections need them? (Hero? Device categories? Case studies?)
5. **What e-waste services do you actually offer?** — to write real copy for Services section.
6. **Do you have real case studies or should we use placeholder data similar to Aatomate?**
7. **Supabase integration** — services, case studies, testimonials, FAQs from DB same as Aatomate? Or static for now?

---

## 14. File Structure Plan

```
src/
├── app/
│   ├── layout.tsx            (fonts: Bebas Neue, Inter, IBM Plex Mono)
│   ├── page.tsx              (same dynamic import pattern as Aatomate)
│   └── globals.css           (design tokens, base styles)
├── components/
│   ├── Navbar.tsx
│   ├── Hero.tsx              (E-waste terminal visual)
│   ├── ImpactCounter.tsx     (dark stats pill)
│   ├── ProblemVisualizer.tsx
│   ├── HowItWorks.tsx        (Process.tsx pattern)
│   ├── Services.tsx          (Services.tsx pattern)
│   ├── DeviceCategories.tsx  (new — bento 3D tilt cards)
│   ├── ImpactDashboard.tsx   (Results.tsx pattern)
│   ├── Industries.tsx
│   ├── Testimonials.tsx
│   ├── FAQ.tsx
│   ├── ContactSection.tsx
│   └── Footer.tsx
```

---

*Last updated: 2026-08-01 · Version 1.0 · For Verdex E-Waste Management*
