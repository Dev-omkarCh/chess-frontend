import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class", // Crucial for next-themes
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}", // <--- Make sure this matches your folder name
    ],
    theme: {
        extend: {
            colors: {
                border: "hsl(var(--border))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
            },
        },
    },
    plugins: [],
};
export default config;