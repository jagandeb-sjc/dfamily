/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'float-slow': 'float 12s ease-in-out infinite',
        'float-rise': 'floatRise 10s ease-in-out infinite',
        'float-drift': 'floatDrift 9s ease-in-out infinite',
        'pop': 'pop 0.5s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(30px, -25px)' },
          '50%': { transform: 'translate(-15px, -40px)' },
          '75%': { transform: 'translate(25px, -15px)' },
        },
        floatRise: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-20px, -40px) scale(1.15)' },
        },
        floatDrift: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '33%': { transform: 'translate(40px, -20px)' },
          '66%': { transform: 'translate(-25px, -35px)' },
        },
        pop: {
          '0%': { transform: 'scale(1)', opacity: 0.8 },
          '100%': { transform: 'scale(2)', opacity: 0 },
        },
      },
    },
  },
  plugins: [],
};
