/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        // Mobile: default (< 768px)
        'md': '768px',   // iPad: 768px - 1279px (834px target)
        'lg': '1024px',  // Large tablets: 1024px - 1279px
        'xl': '1280px',  // Desktop: 1280px+
        '2xl': '1536px', // Large desktop: 1536px+
      },
    },
  },
  plugins: [],
};
