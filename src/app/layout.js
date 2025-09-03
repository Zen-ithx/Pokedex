import "./globals.css";
import PokeFrame from "./shell/PokeFrame";
import Image from "next/image";
import localFont from "next/font/local";



export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // unlocks env(safe-area-inset-*) on iOS
};


export const metadata = {
  title: "Pokédex",
  description: "Phone-as-Pokédex: the window is the screen; HUD hugs the edges.",
};



const pokedex =localFont({
  src : [
    {path :"/fonts/pokemon-b-w.woff2", weight : "400" , style : "normal"}
  ],
  display : "swap",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-dvh">
      // Apply font to all text 


      <body className={`${pokedex.className} h-dvh overflow-hidden bg-black text-white`}>
        <PokeFrame
          notch ={
            <Image 
                src = "/game.png"
                alt = "Pokeball"
                height ={128} width ={128}
                priority
                className="pf-notch-img"
            />
          }
        >
          {children}</PokeFrame>
      </body>
    </html>
  );
}
