import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn — mantidos pra retrocompatibilidade
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Tokens portados literalmente de agendabela-mobile-app/constants/theme.ts
        // Single-source-of-truth do design system Agenda Bela.
        brand: {
          petroleo: "#213745",
          "petroleo-soft": "#2B4657",
          vinho: "#90496A",
          rosa: "#FF5B8E",
          "rosa-hover": "#F14A80",
          "rosa-claro": "#FF9FAD",
          "rosa-50": "#FFF1F5",
          "rosa-100": "#FFE0EA",
          creme: "#FFE3CC",
          "creme-soft": "#FFF4E6",
        },
        ink: {
          DEFAULT: "#2A2A2A",
          muted: "#6F6A6D",
          subtle: "#A39CA0",
          inverse: "#FFFFFF",
        },
        "surface-alt": {
          DEFAULT: "#FFEFE8",
          card: "#FFFDFB",
          border: "#F4D7DF",
        },
        "surface-subtle": "#FAF6F2",
      },
      fontFamily: {
        fraunces: ["var(--font-fraunces)", "Georgia", "serif"],
        inter: ["var(--font-inter)", "system-ui", "sans-serif"],
        "mono-brand": ["var(--font-space-mono)", "monospace"],
      },
      boxShadow: {
        // Convertido dos valores Shadow.{xs,sm,md,lg} do app
        // (offset/opacity/radius idênticos)
        "brand-xs": "0 1px 2px rgba(33, 55, 69, 0.04)",
        "brand-sm": "0 1px 3px rgba(33, 55, 69, 0.06)",
        "brand-md": "0 4px 12px rgba(33, 55, 69, 0.08)",
        "brand-lg": "0 12px 28px rgba(33, 55, 69, 0.12)",
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)",
        // Radius do app (16/20/22 px) — não usar arbitrary pra ser grep-friendly
        "app-md": "16px",
        "app-lg": "20px",
        "app-xl": "22px",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
