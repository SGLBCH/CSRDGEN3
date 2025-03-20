import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6edf5',
          100: '#ccdaeb',
          200: '#99b5d7',
          300: '#6690c3',
          400: '#336baf',
          500: '#00509d',
          600: '#00407e',
          700: '#00336b',
          800: '#00296b', // Main primary color
          900: '#001a45',
        },
        secondary: {
          50: '#e6f0f9',
          100: '#cce1f3',
          200: '#99c3e7',
          300: '#66a5db',
          400: '#3387cf',
          500: '#00509d', // Main secondary color
          600: '#00407e',
          700: '#00346b',
          800: '#002754',
          900: '#001933',
        },
        tertiary: {
          50: '#fef9e6',
          100: '#fef3cc',
          200: '#fde799',
          300: '#fddb66',
          400: '#fcd033',
          500: '#fdc500', // Main tertiary color (yellow)
          600: '#ca9e00',
          700: '#a88400',
          800: '#806400',
          900: '#664f00',
        },
        background: '#fffdf7',
      },
      backgroundColor: {
        page: '#fffdf7', // Page background color
      },
      animation: {
        blob: "blob 7s infinite",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
      utilities: {
        ".animation-delay-2000": {
          "animation-delay": "2s",
        },
        ".animation-delay-4000": {
          "animation-delay": "4s",
        },
      },
    },
  },
  plugins: [],
}

export default config 