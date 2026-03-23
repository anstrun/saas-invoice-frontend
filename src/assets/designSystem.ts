/**
 * Design System - FacturaSaaS
 * 
 * Fuente unica de verdad para colores, spacing, tipografia, radii y sombras.
 * Todos los componentes deben referenciar estos tokens en lugar de valores hardcoded.
 */

export const ds = {
  // ─── COLORES (Clases Tailwind) ────────────────────────────────
  colors: {
    // Marca
    brand: {
      bg: "bg-primary",
      text: "text-primary",
      textOnPrimary: "text-primary-foreground",
      bgLight: "bg-accent",
      textDark: "text-accent-foreground",
    },

    // Superficies - Light (app principal)
    surface: {
      page: "bg-background",
      card: "bg-card",
      input: "bg-input",
      border: "border-border",
    },

    // Superficies - Dark (login, secciones oscuras)
    dark: {
      bg: "bg-slate-950",
      bgAlt: "bg-slate-900",
      surface: "bg-slate-800",
      border: "border-slate-700",
      subtle: "border-slate-600",
      text: "text-white",
      textMuted: "text-slate-400",
      textSubtle: "text-slate-300",
    },

    // Texto
    text: {
      primary: "text-foreground",
      secondary: "text-muted-foreground",
      onPrimary: "text-primary-foreground",
    },

    // Estados
    success: {
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-200",
    },
    warning: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-100",
    },
    error: {
      bg: "bg-red-50",
      text: "text-red-500",
      border: "border-red-200",
    },
  },

  // ─── TIPOGRAFIA ──────────────────────────────────────────────
  typography: {
    fontFamily: "'Inter', sans-serif",

    pageTitle: "text-2xl font-bold",
    sectionHeading: "text-base font-semibold",
    cardHeading: "text-lg font-semibold",
    body: "text-sm font-medium",
    bodyRegular: "text-sm font-normal",
    label: "text-xs font-medium uppercase tracking-wider",
    formLabel: "text-xs font-medium",
    caption: "text-xs",
    heroTitle: "text-4xl font-bold leading-tight",
    heroSubtitle: "text-base font-normal",
    price: "text-2xl font-bold",
    code: "text-sm font-mono",
  },

  // ─── SPACING ─────────────────────────────────────────────────
  spacing: {
    page: {
      x: "px-6 md:px-10",
      y: "py-5",
      bottom: "pb-28",
    },
    card: {
      padding: "p-6",
      paddingCompact: "p-5",
    },
    section: {
      gap: "gap-6",
      stack: "space-y-6",
    },
    element: {
      gap: "gap-2",
      gapMd: "gap-3",
      gapLg: "gap-4",
    },
    form: {
      fieldGap: "space-y-4",
      labelGap: "mt-1.5",
      headingMargin: "mb-5",
    },
    input: {
      iconOffset: "pl-10",
      height: "h-8",
    },
  },

  // ─── RADII ───────────────────────────────────────────────────
  radius: {
    card: "rounded-xl",
    interactive: "rounded-lg",
    button: "rounded-xl",
    buttonSm: "rounded-md",
    badge: "rounded-full",
    input: "rounded-lg",
  },

  // ─── SOMBRAS ─────────────────────────────────────────────────
  shadows: {
    card: "shadow-sm",
    stickyBar: "shadow-[0_-4px_20px_rgba(0,0,0,0.06)]",
    none: "shadow-none",
  },

  // ─── SIZING ───────────────────────────────────────────────────
  sizing: {
    sidebar: {
      collapsed: "w-16",
      expanded: "w-60",
    },
    icon: {
      sm: "h-3.5 w-3.5",
      md: "h-4 w-4",
      lg: "h-5 w-5",
      xl: "h-6 w-6",
    },
    avatar: {
      sm: "h-8 w-8",
      md: "h-12 w-12",
    },
    actionButton: "h-7 w-7",
  },

  // ─── LAYOUTS ─────────────────────────────────────────────────
  layouts: {
    twoColumns: "grid gap-6 lg:grid-cols-2",
    splitScreen: "min-h-screen grid lg:grid-cols-2",
    productGrid: "grid grid-cols-[56px_1fr_96px_96px_72px] gap-2",
  },

  // ─── TRANSICIONES ─────────────────────────────────────────────
  transitions: {
    default: "transition-colors",
    all: "transition-all duration-300",
    ease: "transition-all duration-300 ease-in-out",
  },
} as const;

export type DesignSystem = typeof ds;
