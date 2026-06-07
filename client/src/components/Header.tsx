import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import logoImg from "@/assets/logo-40.png";

interface HeaderProps {
  startLocation?: string;
  endLocation?: string;
  onStartChange?: (v: string) => void;
  onEndChange?: (v: string) => void;
  onCalculate?: () => void;
  isCalculating?: boolean;
}

export function Header({
  startLocation = "",
  endLocation = "",
  onStartChange,
  onEndChange,
  onCalculate,
  isCalculating,
}: HeaderProps) {
  const isMobile = useMobile();
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative bg-gradient-to-r from-slate-950 via-[#0d1626] to-slate-950 text-white h-16 flex items-center px-4 shadow-xl z-10 gap-3">
      {/* Orange accent line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-80" />

      {/* Left: logo + title */}
      <div className="flex items-center gap-2.5 shrink-0">
        <img src={logoImg} alt="MotoRoute Europe logo" className="h-9 w-9 rounded-full ring-1 ring-orange-500/40" />
        <Link href="/" className="font-montserrat font-black text-lg sm:text-xl md:text-2xl tracking-tight truncate">
          Moto<span className="text-orange-500">Route</span> Europe
        </Link>
      </div>

      {/* Center: start / destination inputs (hidden on mobile) */}
      <div className="hidden md:flex flex-1 items-center justify-center gap-2 min-w-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Start point…"
            value={startLocation}
            onChange={(e) => onStartChange?.(e.target.value)}
            className="h-8 w-36 lg:w-44 bg-slate-800/80 border border-slate-600 rounded-md text-sm text-white placeholder:text-slate-500 pl-2.5 pr-7 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-2 top-2 h-4 w-4 text-slate-500 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Arrow separator */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>

        <div className="relative">
          <input
            type="text"
            placeholder="Destination…"
            value={endLocation}
            onChange={(e) => onEndChange?.(e.target.value)}
            className="h-8 w-36 lg:w-44 bg-slate-800/80 border border-slate-600 rounded-md text-sm text-white placeholder:text-slate-500 pl-2.5 pr-7 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-2 top-2 h-4 w-4 text-slate-500 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </div>

        <button
          onClick={onCalculate}
          disabled={isCalculating || !startLocation.trim() || !endLocation.trim()}
          className="h-8 px-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold rounded-md transition flex items-center gap-1.5 shrink-0 shadow-md hover:shadow-orange-500/30"
        >
          {isCalculating ? (
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
          Go
        </button>
      </div>

      {/* Right: sign in / menu */}
      <div className="flex items-center gap-2 ml-auto shrink-0">
        <button
          id="mobile-menu-btn"
          className="md:hidden flex items-center justify-center p-2 rounded-md hover:bg-slate-800 transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        <div className="hidden md:flex items-center gap-3">
          <Button
            onClick={() => setLocation("/login")}
            className="bg-orange-500 hover:bg-orange-400 text-white px-5 py-2 rounded font-bold tracking-wide transition shadow-lg hover:shadow-orange-500/30"
          >
            Sign In
          </Button>
          <Button
            variant="ghost"
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </Button>
        </div>
      </div>

      {isMobile && menuOpen && (
        <div className="absolute top-16 right-0 left-0 bg-slate-950 border-t border-slate-800 z-50 shadow-2xl">
          <div className="flex flex-col p-4 gap-2">
            <Button
              onClick={() => { setLocation("/login"); setMenuOpen(false); }}
              className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 w-full rounded font-bold tracking-wide transition"
            >
              Sign In
            </Button>
            <Button
              variant="outline"
              onClick={() => { setLocation("/saved-routes"); setMenuOpen(false); }}
              className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Saved Routes
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
