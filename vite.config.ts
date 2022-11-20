import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  return {
    server: {
      port: 3001,
    },
  };
});
