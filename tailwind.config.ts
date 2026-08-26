import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        panel: "var(--panel)",
        panelMuted: "var(--panel-muted)",
        line: "var(--line)",
        ink: "var(--ink)",
        inkMuted: "var(--ink-muted)",
        brand: {
          50: "#ebfdf4",
          100: "#d4f8e5",
          200: "#aaf0cc",
          300: "#76e2aa",
          400: "#40cb82",
          500: "#1fb36a",
          600: "#129154",
          700: "#0f7345",
          800: "#115b39",
          900: "#104b31"
        },
        accent: {
          50: "#edf5ff",
          100: "#d9eaff",
          200: "#bedbff",
          300: "#92c3ff",
          400: "#5fa1ff",
          500: "#367dff",
          600: "#215ef5",
          700: "#1e49df",
          800: "#213eb4",
          900: "#22378d"
        },
        success: "#14b86a",
        warning: "#f59e0b",
        danger: "#ef4444"
      },
      boxShadow: {
        luxe: "0 28px 80px -32px rgba(2, 8, 23, 0.45)",
        soft: "0 16px 40px -24px rgba(15, 23, 42, 0.35)"
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at top left, rgba(54,125,255,0.18), transparent 34%), radial-gradient(circle at top right, rgba(31,179,106,0.18), transparent 32%), linear-gradient(180deg, rgba(255,255,255,0.85), rgba(244,247,251,1))",
        "mesh-dark":
          "radial-gradient(circle at top left, rgba(54,125,255,0.24), transparent 30%), radial-gradient(circle at top right, rgba(31,179,106,0.18), transparent 28%), linear-gradient(180deg, rgba(3,7,18,1), rgba(11,18,32,1))"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        pulseLine: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        rise: "rise 0.6s ease forwards",
        pulseLine: "pulseLine 1.6s ease-in-out infinite"
      },
      borderRadius: {
        "4xl": "2rem"
      }
    }
  },
  plugins: []
};

export default config;
