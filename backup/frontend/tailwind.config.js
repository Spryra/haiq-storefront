/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Extracted directly from HAIQPallette.png ────────────────────
        'haiq-amber':    '#B8752A',  // warm copper/amber
        'haiq-tan':      '#D4A574',  // golden tan
        'haiq-cream':    '#F2EAD8',  // off-white cream
        'haiq-espresso': '#1A0A00',  // near-black espresso
        'haiq-brown':    '#3D1A00',  // deep dark brown
        'haiq-mocha':    '#8C7355',  // warm taupe/mocha
        'haiq-gold':     '#E8C88A',  // light golden wheat
        'haiq-sienna':   '#7A3B1E',  // rich burnt sienna

        // ── Semantic aliases used throughout the app ────────────────────
        primary:  '#B8752A',   // haiq-amber  — buttons, highlights, CTAs
        secondary:'#D4A574',   // haiq-tan    — hover states, secondary accents
        dark:     '#1A0A00',   // haiq-espresso — dark backgrounds, text
        dark2:    '#3D1A00',   // haiq-brown  — cards on dark bg
        light:    '#F2EAD8',   // haiq-cream  — light page backgrounds
        muted:    '#8C7355',   // haiq-mocha  — subdued text, borders
        gold:     '#E8C88A',   // haiq-gold   — premium highlights, loyalty
        sienna:   '#7A3B1E',   // haiq-sienna — hover darks, deep accents

        // ── Admin palette ────────────────────────────────────────────────
        ink:     '#1A0A00',
        surface: '#2A1200',
        panel:   '#0E0600',
        border:  '#3D1A00',
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
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        scrollDot: 'scrollDot 1.8s ease-in-out infinite',
        fadeUp:    'fadeUp 0.6s ease forwards',
        shimmer:   'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}
