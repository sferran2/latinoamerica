import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "src",
  build: {
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
