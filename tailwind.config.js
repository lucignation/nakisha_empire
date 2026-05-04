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
          50: "#fff7f8",
          100: "#fce8ef",
          200: "#f6d2dd",
          300: "#ecb8cb",
          400: "#dd92ae",
          500: "#c96d92"
        },
        lavender: {
          50: "#f8f6fc",
          100: "#f1ecf8",
          200: "#dbd1ef",
          300: "#c6b5e4",
          400: "#a997d1"
        },
        gold: {
          100: "#f6eccc",
          200: "#eadbae",
          300: "#ddc37f",
          400: "#c9a84c",
          500: "#9c7530"
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
        glow: "0 22px 70px rgba(168, 116, 142, 0.18)",
        soft: "0 14px 35px rgba(90, 65, 76, 0.08)"
      },
      backgroundImage: {
        "hero-glow":
          "linear-gradient(135deg, rgba(252, 232, 239, 0.96), rgba(253, 248, 244, 0.92) 58%, rgba(241, 236, 248, 0.96))",
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
