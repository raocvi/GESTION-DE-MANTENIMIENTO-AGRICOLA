import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './@core/**/*.{ts,tsx}'
  ],
  prefix: "",
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input:  "hsl(var(--input))",
        ring:   "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary:     { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary:   { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted:   { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent:  { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card:    { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        brand: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#0052cc",
          700: "#0044b3",
          800: "#003799",
          900: "#1e3a5f",
          950: "#0f1c2e",
        },
        sidebar: {
          DEFAULT: "#0f1c2e",
          hover:   "#1a2d44",
          active:  "#1e3a5f",
          border:  "rgba(255,255,255,0.06)",
          text:    "#94a3b8",
          accent:  "#3b82f6",
        },
      },
      borderRadius: {
        lg:   "var(--radius)",
        md:   "calc(var(--radius) - 2px)",
        sm:   "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      boxShadow: {
        "card":       "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 6px rgba(0,0,0,0.04), 0 8px 24px rgba(0,82,204,0.08)",
        "kpi":        "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)",
        "sidebar":    "4px 0 24px rgba(0,0,0,0.15)",
        "topbar":     "0 1px 0 rgba(0,0,0,0.06), 0 2px 16px rgba(0,0,0,0.04)",
        "modal":      "0 16px 48px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "2xs": ["0.65rem", { lineHeight: "1rem" }],
        "xs":  ["0.75rem", { lineHeight: "1rem" }],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
      animation: {
        "fade-in":    "fadeSlideIn 0.3s ease forwards",
        "count-up":   "countUp 0.4s ease forwards",
        "pulse-ring": "pulseRing 2s ease-in-out infinite",
        "slide-left": "slideLeft 0.25s ease forwards",
      },
      keyframes: {
        fadeSlideIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        countUp: {
          from: { opacity: "0", transform: "scale(0.92)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        pulseRing: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(59,130,246,0.4)" },
          "50%":      { boxShadow: "0 0 0 6px rgba(59,130,246,0)" },
        },
        slideLeft: {
          from: { opacity: "0", transform: "translateX(12px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
