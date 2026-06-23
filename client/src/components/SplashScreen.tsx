import { useEffect, useState } from "react";
import logoImg from "@/assets/logo-192.png";

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Start fade-out after 2 s, then notify parent once the transition ends
    const fadeTimer = setTimeout(() => setFading(true), 2000);
    const doneTimer = setTimeout(() => onDone(), 2500);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <div
      className="splash-screen fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500"
      style={{ opacity: fading ? 0 : 1, pointerEvents: fading ? "none" : "auto" }}
    >
      {/* Subtle vignette ring */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-6 select-none">
        {/* Logo with pulsing orange ring */}
        <div className="relative">
          <div className="absolute -inset-3 rounded-full bg-orange-500/20 animate-ping" />
          <div className="absolute -inset-1.5 rounded-full bg-orange-500/10" />
          <img
            src={logoImg}
            alt="MotoRoute Europe"
            className="relative w-40 h-40 rounded-full ring-2 ring-orange-500/60 shadow-2xl shadow-orange-500/20"
          />
        </div>

        {/* App name */}
        <div className="flex flex-col items-center gap-1.5">
          <h1 className="font-montserrat font-black text-4xl tracking-tight text-white">
            Moto<span className="text-orange-500">Route</span> Europe
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">
            Your European Riding Guide
          </p>
        </div>

        {/* Loading bar with bike */}
        <div className="mt-2 w-64 flex flex-col gap-2">
          {/* Bike emoji riding along the bar */}
          <div className="relative h-6">
            <span
              className="absolute -top-0.5 text-xl leading-none"
              style={{ animation: "splash-bike 1.85s cubic-bezier(0.4,0,0.6,1) forwards", display: "inline-block", transform: "scaleX(-1)" }}
            >
              🏍️
            </span>
          </div>

          {/* Track */}
          <div className="relative h-[3px] w-full rounded-full bg-slate-700/80 overflow-hidden">
            {/* Glowing fill */}
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: "linear-gradient(90deg, #f97316 0%, #fb923c 80%, #fff7ed 100%)",
                boxShadow: "0 0 8px 2px rgba(249,115,22,0.55)",
                animation: "splash-fill 1.85s cubic-bezier(0.4,0,0.6,1) forwards",
              }}
            />
          </div>
        </div>
      </div>

      {/* Orange accent line at bottom, matching header */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-60" />

      <style>{`
        @keyframes splash-fill {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes splash-bike {
          from { left: -8px; }
          to   { left: calc(100% - 20px); }
        }
      `}</style>
    </div>
  );
}
