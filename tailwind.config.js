/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2a9d8f",
        clay: "#e76f51",
        surface: "#FFFFFF",
        "text-primary": "#191F28",
        "text-secondary": "#8B95A1",
        "text-tertiary": "#B0B8C1",
        divider: "#F4F4F4",
        gear: "#2a9d8f"
      },
      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.04)",
      },
      fontFamily: {
        sans: ['"Pretendard"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Pretendard"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'scale-bounce-in': 'scale-bounce-in 0.5s ease-out both',
        'slide-in-right': 'slide-in-right 0.3s ease-out both',
        'slide-in-left': 'slide-in-left 0.3s ease-out both',
        'slide-in-down': 'slide-in-down 0.3s ease-out both',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-bounce-in': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '60%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-left': {
          from: { transform: 'translateX(-100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-down': {
          from: { transform: 'translateY(-100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
