import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { config } from "dotenv";

config();

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 3003,
    allowedHosts: ["f247-157-245-67-12.ngrok-free.app"],
    host: "0.0.0.0",
  },
});
