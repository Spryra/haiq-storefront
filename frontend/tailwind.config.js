/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── HAIQ Palette — extracted directly from HAIQPallette.png ──────────
        'haiq-amber':    '#B8752A',  // col 1 — warm copper/amber
        'haiq-tan':      '#D4A574',  // col 2 — golden tan
        'haiq-cream':    '#F2EAD8',  // col 3 — off-white cream
        'haiq-espresso': '#1A0A00',  // col 4 — near-black espresso
        'haiq-brown':    '#3D1A00',  // col 5 — deep dark brown
        'haiq-mocha':    '#8C7355',  // col 6 — warm taupe/mocha
        'haiq-gold':     '#E8C88A',  // col 7 — light golden wheat
        'haiq-sienna':   '#7A3B1E',  // col 8 — rich burnt sienna

        // ── Semantic aliases used throughout ─────────────────────────────────
        primary:   '#B8752A',
        secondary: '#D4A574',
        light:     '#F2EAD8',
        dark:      '#1A0A00',
        dark2:     '#3D1A00',
        muted:     '#8C7355',
        gold:      '#E8C88A',
        sienna:    '#7A3B1E',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        scrollDot: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(200%)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bannerFade: {
          '0%,100%': { opacity: '0' },
          '10%,90%': { opacity: '1' },
        },
      },
      animation: {
        scrollDot:  'scrollDot 1.8s ease-in-out infinite',
        fadeUp:     'fadeUp 0.6s ease forwards',
        shimmer:    'shimmer 2s linear infinite',
        bannerFade: 'bannerFade 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
