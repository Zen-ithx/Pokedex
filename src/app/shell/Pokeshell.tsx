
import React from "react";

type Props = { children: React.ReactNode; title?: string };

export default function PokedexShell({ children, title = "Pokédex" }: Props) {
  return (
    <div className="min-h-svh w-full bg-[radial-gradient(ellipse_at_top,_#ffd1d1_0%,#ffb0b0_40%,#ff8b8b_100%)] dark:bg-[radial-gradient(ellipse_at_top,_#200506_0%,#2a0709_40%,#3a0b0e_100%)]">
      <div className="mx-auto max-w-[1000px] px-4 py-8 md:py-12">
        {/* DEVICE BODY */}
        <div className="relative rounded-[28px] bg-[#d12c2c] shadow-2xl ring-1 ring-black/25">
          {/* thin outer outline */}
          <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-black/35" />

          {/* === TOP STRIP WITH DIAGONAL SEAM === */}
          <div
            className="relative h-24 rounded-t-[28px] bg-[#c62828]"
            style={{
              // diagonal seam that slopes down toward the right
              clipPath:
                "polygon(0 0, 100% 0, 100% 520%, 73% 63%, 0 63%)",
            }}
          >
            {/* seam highlight */}
            <div
              className="absolute inset-0 opacity-100"

              style={{
                clipPath:
                  "polygon(0 50%, 100% 38%, 100% 52%, 73% 63%, 0 63%)",
                background:
                  "linear-gradient(90deg, rgba(0,0,0,0.25), rgba(255,255,255,0.15))",
              }}
            />
          </div>

          {/* === CORNER CAMERA + LEDS === */}
          {/* Big cyan camera in top-left corner */}
          <div className="absolute left-4 top-4 h-12 w-12 rounded-full bg-[#2fa9e3] ring-4 ring-white ring-offset-2 ring-offset-[#d12c2c] shadow-md">
            <div className="absolute inset-0 rounded-full ring-1 ring-black/40" />
            <div className="absolute right-1.5 top-1.5 h-3 w-3 rounded-full bg-white/85" />
          </div>
          {/* three LEDs near the top (green, yellow, red) */}
          <div className="absolute right-6 top-5 flex gap-2">
            <span className="h-3.5 w-3.5 rounded-full bg-[#54d869] ring-1 ring-black/40" />
            <span className="h-3.5 w-3.5 rounded-full bg-[#ffe14a] ring-1 ring-black/40" />
            <span className="h-3.5 w-3.5 rounded-full bg-[#ff5a5a] ring-1 ring-black/40" />
          </div>

          {/* === MAIN PANEL === */}
          <div className="relative px-6 pb-8 pt-4 md:px-8">
            {/* left & right shallow bezels for depth */}
            <div className="pointer-events-none absolute -left-3 top-20 hidden h-[calc(100%-120px)] w-3 rounded-l-2xl bg-black/15 md:block" />
            <div className="pointer-events-none absolute -right-3 top-20 hidden h-[calc(100%-120px)] w-3 rounded-r-2xl bg-black/15 md:block" />

            {/* SCREEN + BEZEL block */}
            <div className="mx-auto mt-4 w-[88%] max-w-[780px] rounded-[18px] bg-white p-3 ring-2 ring-black/30">
              {/* inner dark screen – your page content lives here */}
              <div className="rounded-lg bg-[#262626] ring-1 ring-black/40 overflow-hidden aspect-[4/3]">
                <div className="h-full w-full">{children}</div>
              </div>

              {/* bezel controls: red button (left), speaker slits (right) */}
              <div className="mt-2 flex items-center justify-between">
                <div className="h-4 w-4 rounded-full bg-[#e23e3e] ring-2 ring-black/50" />
                <div className="flex items-center gap-1">
                  <span className="block h-1 w-8 rounded bg-black/65" />
                  <span className="block h-1 w-8 rounded bg-black/65" />
                  <span className="block h-1 w-8 rounded bg-black/65" />
                </div>
              </div>
            </div>

            {/* LOWER CONTROL AREA (buttons, panel, d-pad) */}
            <div className="mx-auto mt-6 flex w-[88%] max-w-[780px] items-end justify-between">
              {/* left: blue button + small dot */}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#2fa9e3] ring-2 ring-black/40" />
                <div className="h-3.5 w-12 rounded-[10px] bg-black/35" />
              </div>

              {/* center: green info panel */}
              <div className="h-9 w-40 rounded-[10px] bg-[#2fbf4a] ring-2 ring-black/35" />

              {/* right: two rect buttons + d-pad */}
              <div className="flex items-end gap-3">
                <div className="flex flex-col gap-2">
                  <div className="h-2 w-10 rounded bg-black/65" />
                  <div className="h-2 w-10 rounded bg-black/65" />
                </div>
                {/* D-pad */}
                <div className="relative h-14 w-14">
                  <div className="absolute left-1/2 top-0 h-5 w-4 -translate-x-1/2 rounded bg-[#3a3a3a] ring-1 ring-black/40" />
                  <div className="absolute left-0 top-1/2 h-4 w-5 -translate-y-1/2 rounded bg-[#3a3a3a] ring-1 ring-black/40" />
                  <div className="absolute right-0 top-1/2 h-4 w-5 -translate-y-1/2 rounded bg-[#3a3a3a] ring-1 ring-black/40" />
                  <div className="absolute left-1/2 bottom-0 h-5 w-4 -translate-x-1/2 rounded bg-[#3a3a3a] ring-1 ring-black/40" />
                  <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded bg-[#2f2f2f] ring-1 ring-black/50" />
                </div>
              </div>
            </div>

            {/* bottom hinges */}
            <div className="mx-auto mt-4 flex w-[88%] max-w-[780px] items-end justify-center gap-6">
              <div className="h-3 w-24 rounded-full bg-black/25" />
              <div className="h-5 w-16 rounded-b-lg bg-black/30" />
              <div className="h-3 w-24 rounded-full bg-black/25" />
            </div>
          </div>
        </div>

        {/* small label (optional) */}
        <p className="mt-3 text-center text-xs text-black/60 dark:text-white/50">{title}</p>
      </div>
    </div>
  );
}
