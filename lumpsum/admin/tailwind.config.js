/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── HAIQ Palette (same as frontend) ─────────────────────────────────
        'haiq-amber':    '#B8752A',
        'haiq-tan':      '#D4A574',
        'haiq-cream':    '#F2EAD8',
        'haiq-espresso': '#1A0A00',
        'haiq-brown':    '#3D1A00',
        'haiq-mocha':    '#8C7355',
        'haiq-gold':     '#E8C88A',
        'haiq-sienna':   '#7A3B1E',

        primary:   '#B8752A',
        secondary: '#D4A574',
        dark:      '#1A0A00',
        dark2:     '#3D1A00',
        light:     '#F2EAD8',
        muted:     '#8C7355',
        gold:      '#E8C88A',
        sienna:    '#7A3B1E',

        // ── Admin surface tokens ─────────────────────────────────────────────
        ink:     '#1A0A00',
        surface: '#2A1200',
        panel:   '#0E0600',
        border:  '#3D1A00',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
