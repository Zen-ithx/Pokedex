// src/app/layout.js
import "./globals.css";
import "./style.css";

import Providers from "./providers";            // SessionProvider wrapper (client)
import PokeFrame from "./shell/PokeFrame";
import Image from "next/image";
import localFont from "next/font/local";
import AuthButton from "./components/AuthButton.client"; // NOTE: ../ (not ./)

// Optional: viewport & metadata
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata = {
  title: "Pokédex",
  description: "Phone-as-Pokédex: the window is the screen; HUD hugs the edges.",
};

// Load your custom font once; apply className on <body>
const pokedex = localFont({
  src: [{ path: "/fonts/pokemon-b-w.woff2", weight: "400", style: "normal" }],
  display: "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-dvh">
      <body className={`${pokedex.className} h-dvh overflow-hidden bg-black text-white`}>
        <Providers>
          {/* Auth UI; move/style as you like */}
          <div style={{ padding: 12, position: "fixed", zIndex: 2000 }}>
            <AuthButton />
          </div>

          {/* Device frame + notch image */}
          <PokeFrame
            notch={
              <Image
                src="/game.png"
                alt="Pokeball"
                height={128}
                width={128}
                priority
                className="pf-notch-img"
              />
            }
          >
            {children}
          </PokeFrame>
        </Providers>
      </body>
    </html>
  );
}
