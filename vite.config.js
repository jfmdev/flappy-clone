import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true
      },
      includeAssets: [
        "misc/background.jpg",
        "assets/images/*.png", 
        "assets/sound/*.wav", 
        "assets/spritesheet/*.png", 
      ],
      manifest: {
        name: "Flappy Clone",
        description: "A clone of the classic Flappy Bird game, implemented in HTML5 as a PWA",
        orientation: "any",
        icons: [
          {
            src: "misc/favicon.ico",
            sizes: "16x16"
          },
          {
            src: "misc/favicon-48.png",
            type: "image/png",
            sizes: "48x48"
          },
          {
            src: "misc/favicon-96.png",
            type: "image/png",
            sizes: "96x96"
          },
          {
            src: "misc/favicon-192.png",
            type: "image/png",
            sizes: "192x192"
          },
        ],
        screenshots: [
          {
            src: "misc/screenshot-wide-1.jpg",
            type: "image/jpg",
            sizes: "1280x720",
            form_factor: "wide"
          },
          {
            src: "misc/screenshot-wide-2.jpg",
            type: "image/jpg",
            sizes: "1280x720",
            form_factor: "wide"
          },
          {
            src: "misc/screenshot-wide-3.jpg",
            type: "image/jpg",
            sizes: "1280x720",
            form_factor: "wide"
          },
          {
            src: "misc/screenshot-narrow-1.jpg",
            type: "image/jpg",
            sizes: "425x876",
            form_factor: "narrow"
          },
          {
            src: "misc/screenshot-narrow-2.jpg",
            type: "image/jpg",
            sizes: "425x876",
            form_factor: "narrow"
          },
          {
            src: "misc/screenshot-narrow-3.jpg",
            type: "image/jpg",
            sizes: "425x876",
            form_factor: "narrow"
          }
        ]
      }
    })
  ]
});
