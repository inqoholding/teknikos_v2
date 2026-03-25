import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": new URL("./src", import.meta.url).pathname,
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ["react", "react-dom", "react-router-dom", "better-auth"],
                    ui: ["framer-motion", "lucide-react", "clsx", "tailwind-merge"],
                    query: ["@tanstack/react-query", "axios"],
                    pdf: ["jspdf", "jspdf-autotable"],
                },
            },
        },
    },
    server: {
        host: "0.0.0.0",
        port: 5173,
        allowedHosts: true,
        proxy: {
            "/api": {
                target: "http://127.0.0.1:3001",
                changeOrigin: true,
            },
        },
    },
    preview: {
        host: "0.0.0.0",
        port: 4173,
        allowedHosts: true,
        proxy: {
            "/api": {
                target: "http://127.0.0.1:3001",
                changeOrigin: true,
            },
        },
    },
});
