/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1280px"
      }
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        blush: {
          50: "#fcf8f8",
          100: "#fbefef",
          200: "#f9dfdf",
          300: "#f7c9c9",
          400: "#f5afaf",
          500: "#dd8d8d"
        },
        lavender: {
          50: "#f8f6fc",
          100: "#f1ecf8",
          200: "#dbd1ef",
          300: "#c6b5e4",
          400: "#a997d1"
        },
        gold: {
          100: "#fcf8f8",
          200: "#fbefef",
          300: "#f9dfdf",
          400: "#f7c9c9",
          500: "#f5afaf"
        },
        sage: {
          100: "#eef7f1",
          200: "#dcebe1",
          300: "#c1daca",
          400: "#7ca18b"
        }
      },
      fontFamily: {
        sans: ["var(--font-body)"],
        display: ["var(--font-display)"]
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      boxShadow: {
        glow: "0 22px 70px rgba(245, 175, 175, 0.22)",
        soft: "0 14px 35px rgba(114, 86, 86, 0.08)"
      },
      backgroundImage: {
        "hero-glow":
          "linear-gradient(135deg, rgba(252, 248, 248, 0.96), rgba(251, 239, 239, 0.92) 58%, rgba(249, 223, 223, 0.96))",
        "spotlight-radial":
          "radial-gradient(circle at center, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0) 70%)"
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 5s ease-in-out infinite",
        marquee: "marquee 24s linear infinite"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
