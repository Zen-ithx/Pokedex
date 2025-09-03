import React from "react";


/**
 * PokeFrame (solid HUD)
 * - Solid bright-red frame on all four edges (fixed).
 * - Outward circular notch/socket centered on the top edge (for a Pokéball icon).
 * - Bottom “shoulders” on left/right that intrude into the screen and merge into the bottom bar.
 * - Content ALWAYS stays inside: we pad for frame + shoulders + device safe-areas.
 * - Content scales with device using vmin-based font sizing.
 */

type PokeFrameProps = {
  children: React.ReactNode;
  /** Optional content to render inside the top circular notch (e.g., Pokéball icon) */
  notch?: React.ReactNode;
  className?: string;
};

export default function PokeFrame({ children, notch, className = "" }: PokeFrameProps) {
  return (
    <div className={`pf-root h-screen-fix w-screen overflow-hidden bg-black text-white ${className}`}>
      {/* Four solid borders that hug the window */}
      <div className="pf-frame pf-top" aria-hidden />
      <div className="pf-frame pf-right" aria-hidden />
      <div className="pf-frame pf-bottom" aria-hidden />
      <div className="pf-frame pf-left" aria-hidden />

      {/* Outward circular notch socket (hollow ring) */}
      <div className="pf-notch" aria-hidden />
      {notch ? <div className="pf-notch-slot">{notch}</div> : null}

      {/* Bottom “shoulders” that intrude and merge into the bottom bar */}
      <div className="pf-shoulder pf-shoulder-left" aria-hidden />
      <div className="pf-shoulder pf-shoulder-right" aria-hidden />

      {/* Content wrapper: keep everything inside the frame/shoulders; only inner screen scrolls */}
      <div className="pf-content">
        <div className="pf-screen">
          {/* Tip: put your page padding INSIDE here, not on body/html */}
          <div className="pf-screen-inner">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
