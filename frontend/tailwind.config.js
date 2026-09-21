/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 60% — dominant dark backgrounds
        dark:    '#1A0A00',
        dark2:   '#0E0600',

        // 30% — secondary surfaces and text
        surface: '#2A1200',
        light:   '#F5EAD8',
        muted:   '#8C7355',
        border:  'rgba(166,124,82,0.2)',

        // 10% — bakery tan accent, pulled from the HAIQ logo itself
        // (was #B8752A — read as "brewery"; this is the logo's own tan)
        primary:   '#A67C52',
        secondary: '#D4C4A8',
        gold:      '#E8D9C3',
        sienna:    '#6B4423',
      },
      fontFamily: {
        // Poppins throughout — bold for headings/labels/buttons,
        // regular weight for body copy (set per-element, not here)
        serif: ['Poppins', 'system-ui', 'sans-serif'],
        sans:  ['Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      animation: {
        scrollDot: 'scrollDot 1.8s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        scrollDot: {
          '0%':   { transform: 'translateY(-100%)', opacity: '0' },
          '30%':  { opacity: '1' },
          '70%':  { opacity: '1' },
          '100%': { transform: 'translateY(200%)', opacity: '0' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
