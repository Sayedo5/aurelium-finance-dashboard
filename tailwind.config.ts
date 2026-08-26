import type { Config } from "tailwindcss";

/**
 * Aurelium design system.
 *
 * Everything a component can reach for is declared here, so a page never
 * invents a one-off radius, shadow or colour. Surface colours resolve through
 * CSS variables (see app/globals.css) so light and dark share one set of class
 * names; brand and semantic colours are literal because gold reads the same in
 * both themes.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"]
      },

      colors: {
        /* Surfaces and text — theme-aware via CSS variables. */
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        surfaceMuted: "var(--surface-muted)",
        surfaceRaised: "var(--surface-raised)",
        line: "var(--line)",
        lineStrong: "var(--line-strong)",
        ink: "var(--ink)",
        inkMuted: "var(--ink-muted)",
        inkSubtle: "var(--ink-subtle)",

        /* Aurelium gold — the single accent. */
        aurum: {
          50: "#fdf9ed",
          100: "#faf0d2",
          200: "#f4dfa1",
          300: "#eec969",
          400: "#e8b34a",
          500: "#d99a29",
          600: "#bf7a1f",
          700: "#9d5b1c",
          800: "#80481e",
          900: "#6a3c1c",
          950: "#3d1f0c"
        },

        /* Semantic money colours. Gain green, loss red — never reused for UI chrome. */
        gain: {
          50: "#eefbf3",
          100: "#d5f5e1",
          200: "#aeeac7",
          300: "#79d7a6",
          400: "#43bd81",
          500: "#1fa163",
          600: "#13814f",
          700: "#116742",
          800: "#115237",
          900: "#0f442f"
        },
        loss: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d"
        },
        caution: {
          100: "#fef3c7",
          300: "#fcd34d",
          500: "#f59e0b",
          700: "#b45309",
          900: "#78350f"
        },
        info: {
          100: "#dbeafe",
          300: "#93c5fd",
          500: "#3b82f6",
          700: "#1d4ed8",
          900: "#1e3a8a"
        }
      },

      /* One radius scale. `control` for inputs/buttons, `card` for panels. */
      borderRadius: {
        control: "0.625rem",
        card: "1rem",
        panel: "1.25rem",
        pill: "9999px"
      },

      /* Depth ladder: raised sits under card, card under overlay. */
      boxShadow: {
        raised: "0 1px 2px rgba(9, 13, 20, 0.06), 0 1px 3px rgba(9, 13, 20, 0.04)",
        card: "0 1px 2px rgba(9, 13, 20, 0.05), 0 8px 24px -12px rgba(9, 13, 20, 0.14)",
        lift: "0 2px 4px rgba(9, 13, 20, 0.06), 0 18px 40px -20px rgba(9, 13, 20, 0.28)",
        overlay: "0 24px 60px -20px rgba(9, 13, 20, 0.45)",
        glow: "0 0 0 1px rgba(232, 179, 74, 0.35), 0 8px 28px -10px rgba(232, 179, 74, 0.4)"
      },

      fontSize: {
        /* Labels sit above their value, so they get their own tracked-out size. */
        label: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.06em" }],
        metric: ["1.875rem", { lineHeight: "2.25rem", letterSpacing: "-0.02em" }],
        metricLg: ["2.25rem", { lineHeight: "2.5rem", letterSpacing: "-0.025em" }]
      },

      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        fade: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" }
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        },
        spinSlow: {
          "100%": { transform: "rotate(360deg)" }
        }
      },
      animation: {
        rise: "rise 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
        fade: "fade 0.3s ease both",
        shimmer: "shimmer 1.6s infinite",
        slideInRight: "slideInRight 0.3s cubic-bezier(0.22, 1, 0.36, 1) both",
        spinSlow: "spinSlow 0.9s linear infinite"
      },

      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)"
      }
    }
  },
  plugins: []
};

export default config;
