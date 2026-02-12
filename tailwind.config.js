/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pixel-pink': '#FFB3D9',
        'pixel-blue': '#A8E6FF',
        'pixel-yellow': '#FFF4A3',
        'pixel-green': '#B8F4B8',
        'pixel-purple': '#E0B3FF',
        'pixel-orange': '#FFD4A3',
      },
      animation: {
        'pixel-pulse': 'pixelPulse 0.3s ease-in-out',
        'pixel-bounce': 'pixelBounce 0.5s ease-in-out',
      },
      keyframes: {
        pixelPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        pixelBounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
