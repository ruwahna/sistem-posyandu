/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'sans-serif'],
      },
      colors: {
        canvas: '#F8F9FA',      // Background utama
        saas: {
          primary: '#14B8A6',   // Toska aksen
          dark: '#0B0F19',      // Teks gelap utama
          muted: '#7E8B9B',     // Teks sekunder
          lightBg: '#FFFFFF',   // Latar belakang kartu
        },
        trend: {
          successBg: '#E2F7D6',
          successText: '#10B981',
          dangerBg: '#FEE2E2',
          dangerText: '#EF4444',
        }
      },
      borderRadius: {
        'card': '20px',         // Radius kartu besar sesuai referensi
        'input': '12px',        // Radius input & tombol
      },
      boxShadow: {
        'soft-card': '0px 4px 18px 0px rgba(11, 15, 25, 0.03)',
      }
    },
  },
  plugins: [],
}
