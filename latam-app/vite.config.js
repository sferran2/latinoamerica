import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "src", 
  publicDir: resolve(__dirname, "src/public"),
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        country: resolve(__dirname, "src/country.html"),
        wishlist: resolve(__dirname, "src/wishlist.html"),
      },
    },
  },
  server: {
    open: "/index.html", 
  },
});
