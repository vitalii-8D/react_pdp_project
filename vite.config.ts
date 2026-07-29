import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { config } from "dotenv";

config();

const host = process.env.HOST || "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 3003;

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port,
    allowedHosts: [host],
    host: "0.0.0.0",
  },
});
