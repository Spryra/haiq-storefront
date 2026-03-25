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
        light:   '#F2EAD8',
        muted:   '#8C7355',
        border:  'rgba(184,117,42,0.2)',

        // 10% — amber accent (CTAs, highlights, active states)
        primary:   '#B8752A',
        secondary: '#D4A574',
        gold:      '#E8C88A',
        sienna:    '#7A3B1E',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
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
