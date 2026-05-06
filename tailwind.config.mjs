/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Slightly warmer than pure #0a0a0a — adds subliminal warmth without
        // sacrificing contrast. Surface follows the same shift.
        bg:        '#0b0b0d',
        surface:   '#131316',
        border:    '#23232a',
        primary:   '#f0f0f0',
        secondary: '#888888',
        // Bumped from #444 → #737373 to clear WCAG AA contrast on the
        // #0a0a0a background (was 3.7:1, now ~4.7:1). Used for footer
        // copy, scroll hints, "label" text — needs to remain readable.
        hint:      '#737373',
        accent:    '#00d4aa',
        'accent-glow': 'rgba(0,212,170,0.12)',
        error:     '#ff4444',
        'coming-soon': '#333333',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-up':   'fadeUp 0.7s ease forwards',
        'fade-in':   'fadeIn 0.5s ease forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(0,212,170,0.3)' },
          '50%':      { boxShadow: '0 0 28px rgba(0,212,170,0.6)' },
        },
      },
    },
  },
  plugins: [],
};
