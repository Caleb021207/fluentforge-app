import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.5rem' }],
        'base': ['1rem', { lineHeight: '1.7rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.875rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        palavox: {
          primary: '#0B1C36',     // Deep navy
          accent: '#A3D5FF',      // Sky blue
          secondary: '#3A4E68',   // Slate blue
          teal: '#57D8A1',        // Mint
          white: '#FFFFFF',
          black: '#000000',
          lightBg: '#F7F9FC',
          darkBg: '#1D2B40',
        },
        /* Signature ramp: sky -> azure -> mint, plus the navy it sits on. */
        brand: {
          sky: '#A3D5FF',
          azure: '#6FD3C6',
          mint: '#57D8A1',
          deep: '#0B1C36',
          50:  '#EEF7FF',
          100: '#D8ECFF',
          200: '#A3D5FF',
          300: '#8ADCE0',
          400: '#6FD3C6',
          500: '#57D8A1',
          600: '#33B486',
          700: '#22826A',
          800: '#164F4A',
          900: '#0B1C36',
        },
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
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(100deg, #A3D5FF 0%, #6FD3C6 52%, #57D8A1 100%)',
        'brand-gradient-vertical': 'linear-gradient(180deg, #A3D5FF 0%, #57D8A1 100%)',
        'brand-radial': 'radial-gradient(circle at 30% 20%, #A3D5FF 0%, #6FD3C6 45%, #57D8A1 100%)',
        'brand-sheen': 'linear-gradient(100deg, transparent 20%, rgba(255,255,255,0.28) 46%, transparent 72%)',
      },
      boxShadow: {
        'brand': '0 10px 40px -12px rgba(163,213,255,0.5), 0 4px 22px -8px rgba(87,216,161,0.35)',
        'brand-lg': '0 24px 60px -18px rgba(163,213,255,0.55), 0 8px 30px -10px rgba(87,216,161,0.4)',
        'glass': '0 18px 40px -22px rgba(6,18,32,0.55)',
      },
      keyframes: {
        'gradient-pan': {
          '0%': { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '100% center' },
        },
        'aurora-drift': {
          '0%': { transform: 'translate3d(0,0,0) scale(1)' },
          '50%': { transform: 'translate3d(2%,-2%,0) scale(1.06)' },
          '100%': { transform: 'translate3d(-2%,2%,0) scale(1.02)' },
        },
        'sheen-sweep': {
          '0%, 65%': { transform: 'translateX(-120%) skewX(-12deg)' },
          '100%': { transform: 'translateX(220%) skewX(-12deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 22px -8px rgba(163,213,255,0.45)' },
          '50%': { boxShadow: '0 0 40px -6px rgba(87,216,161,0.6)' },
        },
        overlayShow: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        contentShow: {
          from: {
            opacity: "0",
            transform: "translate(-50%, -48%) scale(0.96)",
          },
          to: {
            opacity: "1",
            transform: "translate(-50%, -50%) scale(1)",
          },
        },
        slideUpAndFade: {
          from: { opacity: "0", transform: "translateY(2px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideRightAndFade: {
          from: { opacity: "0", transform: "translateX(-2px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-100vh) rotate(360deg)', opacity: '0' },
        },
        'success-bounce': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
        'slide-up-fade': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-10px)' },
          '75%': { transform: 'translateX(10px)' },
        },
        'expand-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
      },
      animation: {
        "gradient-pan": "gradient-pan 6s ease-in-out infinite alternate",
        "aurora-drift": "aurora-drift 22s ease-in-out infinite alternate",
        "sheen-sweep": "sheen-sweep 4.5s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        overlayShow: "overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        contentShow: "contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        slideUpAndFade: "slideUpAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        slideRightAndFade: "slideRightAndFade 400ms cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce": "bounce 1s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "confetti": "confetti 3s ease-out forwards",
        "success-bounce": "success-bounce 0.6s ease-out",
        "slide-up-fade": "slide-up-fade 0.3s ease-out",
        "shake": "shake 0.5s ease-in-out",
        "expand-ring": "expand-ring 0.8s ease-out forwards",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
