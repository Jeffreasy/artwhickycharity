import type { Config } from "tailwindcss"
import plugin from "tailwindcss/plugin"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./globalComponents/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
        white: {
          DEFAULT: '#ffffff',
          transparent: 'var(--white)',
        },
        black: {
          DEFAULT: '#000000',
          custom: 'var(--black)',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      height: {
        'screen': '100vh',
        'full-screen': 'var(--full-screen)',
      },
      keyframes: {
        carousel: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(var(--translate-value))' }
        },
        hueGlow: {
          '0%': { 
            borderColor: 'rgba(255,0,0,0.8)',
            boxShadow: '0 0 60px 0px rgba(255,0,0,0.5)'
          },
          '16.67%': {
            borderColor: 'rgba(255,165,0,0.8)',
            boxShadow: '0 0 60px 0px rgba(255,165,0,0.5)'
          },
          '33.33%': {
            borderColor: 'rgba(255,255,0,0.8)',
            boxShadow: '0 0 60px 0px rgba(255,255,0,0.5)'
          },
          '50%': {
            borderColor: 'rgba(0,255,0,0.8)',
            boxShadow: '0 0 60px 0px rgba(0,255,0,0.5)'
          },
          '66.67%': {
            borderColor: 'rgba(0,0,255,0.8)',
            boxShadow: '0 0 60px 0px rgba(0,0,255,0.5)'
          },
          '83.33%': {
            borderColor: 'rgba(238,130,238,0.8)',
            boxShadow: '0 0 60px 0px rgba(238,130,238,0.5)'
          },
          '100%': {
            borderColor: 'rgba(255,0,0,0.8)',
            boxShadow: '0 0 60px 0px rgba(255,0,0,0.5)'
          }
        },
        textGlow: {
          '0%': { textShadow: '0 0 10px rgba(255,0,0,0.5)' },
          '16.67%': { textShadow: '0 0 10px rgba(255,165,0,0.5)' },
          '33.33%': { textShadow: '0 0 10px rgba(255,255,0,0.5)' },
          '50%': { textShadow: '0 0 10px rgba(0,255,0,0.5)' },
          '66.67%': { textShadow: '0 0 10px rgba(0,0,255,0.5)' },
          '83.33%': { textShadow: '0 0 10px rgba(238,130,238,0.5)' },
          '100%': { textShadow: '0 0 10px rgba(255,0,0,0.5)' }
        },
        rotate: {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' }
        },
        rainbowGlow: {
          '0%': {
            background: 'rgba(255, 0, 0, 0.2)',
            boxShadow: '0 0 60px 0px rgba(255, 0, 0, 0.8)'
          },
          '16.67%': {
            background: 'rgba(255, 165, 0, 0.2)',
            boxShadow: '0 0 60px 0px rgba(255, 165, 0, 0.8)'
          },
          '33.33%': {
            background: 'rgba(255, 255, 0, 0.2)',
            boxShadow: '0 0 60px 0px rgba(255, 255, 0, 0.8)'
          },
          '50%': {
            background: 'rgba(0, 255, 0, 0.2)',
            boxShadow: '0 0 60px 0px rgba(0, 255, 0, 0.8)'
          },
          '66.67%': {
            background: 'rgba(0, 0, 255, 0.2)',
            boxShadow: '0 0 60px 0px rgba(0, 0, 255, 0.8)'
          },
          '83.33%': {
            background: 'rgba(238, 130, 238, 0.2)',
            boxShadow: '0 0 60px 0px rgba(238, 130, 238, 0.8)'
          },
          '100%': {
            background: 'rgba(255, 0, 0, 0.2)',
            boxShadow: '0 0 60px 0px rgba(255, 0, 0, 0.8)'
          }
        },
        amberGlow: {
          '0%, 100%': {
            background: 'rgba(218, 165, 32, 0.2)',
            boxShadow: '0 0 60px 0px rgba(218, 165, 32, 0.8)'
          },
          '50%': {
            background: 'rgba(218, 165, 32, 0.3)',
            boxShadow: '0 0 80px 0px rgba(218, 165, 32, 0.9)'
          }
        },
        blueGlow: {
          '0%, 100%': {
            background: 'rgba(3, 117, 255, 0.2)',
            boxShadow: '0 0 60px 0px rgba(3, 117, 255, 0.8)'
          },
          '50%': {
            background: 'rgba(3, 117, 255, 0.3)',
            boxShadow: '0 0 80px 0px rgba(3, 117, 255, 0.9)'
          }
        }
      },
      animation: {
        'carousel': 'carousel var(--duration) linear infinite',
        'hueGlow': 'hueGlow 5s linear infinite',
        'textGlow': 'textGlow 5s linear infinite'
      }
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    plugin(({ addVariant }) => {
      addVariant('nth-2', '&:nth-child(2)')
      addVariant('nth-3', '&:nth-child(3)')
      addVariant('nth-4', '&:nth-child(4)')
    })
  ],
}

export default config 