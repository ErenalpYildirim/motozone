/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                moto: {
                    dark: '#121212',
                    card: '#1e1e1e',
                    accent: '#ef4444', // Red for speed/danger/moto vibe
                    muted: '#a1a1aa'
                }
            }
        },
    },
    plugins: [],
}
