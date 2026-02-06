/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2a9d8f",       // 코트 그린
        clay: "#e76f51",          // 클레이 오렌지
        "background-light": "#f6f8f8",
        "background-dark": "#131f1e",
        gear: "#2a9d8f"
      },
      fontFamily: {
        // ▼▼▼ 여기가 핵심입니다! ▼▼▼
        sans: ['"Pretendard"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Pretendard"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}