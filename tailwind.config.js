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
          50: "#f7f2fd",
          100: "#efe5fa",
          200: "#e6d6f7",
          300: "#ff70bf",
          400: "#d552a3",
          500: "#831c91"
        },
        lavender: {
          50: "#f7f2fd",
          100: "#ede1fa",
          200: "#dcc8f4",
          300: "#b988dc",
          400: "#831c91"
        },
        gold: {
          100: "#f7f2fd",
          200: "#efe5fa",
          300: "#ff70bf",
          400: "#d552a3",
          500: "#831c91"
        },
        sage: {
          100: "#f1ebfb",
          200: "#e1d2f5",
          300: "#c8ade8",
          400: "#462c7d"
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
        glow: "0 22px 70px rgba(213, 82, 163, 0.22)",
        soft: "0 14px 35px rgba(70, 44, 125, 0.08)"
      },
      backgroundImage: {
        "hero-glow":
          "linear-gradient(135deg, rgba(247, 242, 253, 0.96), rgba(239, 229, 250, 0.92) 58%, rgba(230, 214, 247, 0.96))",
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
