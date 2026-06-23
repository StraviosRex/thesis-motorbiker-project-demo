import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import logoImg from "@/assets/logo-40.png";
import { useUser, useLogout } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  startLocation?: string;
  endLocation?: string;
  onStartChange?: (v: string) => void;
  onEndChange?: (v: string) => void;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (v: string) => void;
  onEndDateChange?: (v: string) => void;
  onCalculate?: () => void;
  isCalculating?: boolean;
}

type ThemeId = "emerald" | "midnight" | "alpine" | "desert";

const THEMES: Array<{ id: ThemeId; name: string; description: string }> = [
  { id: "emerald", name: "Emerald Atlas", description: "Forest green and warm paper" },
  { id: "midnight", name: "Midnight Rider", description: "Deep navy for night planning" },
  { id: "alpine", name: "Alpine", description: "Glacier blue and crisp white" },
  { id: "desert", name: "Desert Run", description: "Umber, sand, and sunbaked clay" },
];

function ThemeOptions({
  theme,
  onSelect,
  compact = false,
}: {
  theme: ThemeId;
  onSelect: (theme: ThemeId) => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "grid grid-cols-2 gap-1.5" : "space-y-1"}>
      {THEMES.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-pressed={theme === item.id}
          onClick={() => onSelect(item.id)}
          className={`theme-option w-full flex items-center gap-2 rounded-lg p-2 text-left transition ${compact ? "min-h-[54px]" : ""}`}
        >
          <span className={`theme-swatch theme-swatch--${item.id} h-7 w-7 rounded-md shrink-0`} aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-bold leading-tight">{item.name}</span>
            {!compact && <span className="theme-option-description block mt-0.5 text-[10px] leading-snug">{item.description}</span>}
          </span>
          {!compact && theme === item.id && (
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-label="Selected">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
}
export function Header({
  startLocation = "",
  endLocation = "",
  onStartChange,
  onEndChange,
  startDate = "",
  endDate = "",
  onStartDateChange,
  onEndDateChange,
  onCalculate,
  isCalculating,
}: HeaderProps) {
  const isMobile = useMobile();
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeId>("emerald");
  const { data: user } = useUser();
  const logout = useLogout();
  const { toast } = useToast();

  const handleLogout = async () => {
    await logout.mutateAsync();
    toast({ title: "Signed out", description: "See you on the road!" });
    setMenuOpen(false);
  };

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("moto-route-theme") as ThemeId | null;
    const validTheme = THEMES.some((item) => item.id === savedTheme) ? savedTheme! : "emerald";
    setTheme(validTheme);
    document.documentElement.dataset.theme = validTheme;
  }, []);

  const selectTheme = (nextTheme: ThemeId) => {
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("moto-route-theme", nextTheme);
  };

  return (
    <header className="app-header relative text-white h-16 flex items-center px-4 shadow-xl z-30 gap-3">
      {/* Orange accent line at bottom */}
      <div className="header-accent absolute bottom-0 left-0 right-0 h-[2px] opacity-80" />

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
            className="h-8 w-36 lg:w-44 header-search border rounded-md text-sm text-white placeholder:text-slate-500 pl-2.5 pr-7 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
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
            className="h-8 w-36 lg:w-44 header-search border rounded-md text-sm text-white placeholder:text-slate-500 pl-2.5 pr-7 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-2 top-2 h-4 w-4 text-slate-500 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 shrink-0">
          <input
            type="date"
            aria-label="Trip start date"
            value={startDate}
            onChange={(e) => onStartDateChange?.(e.target.value)}
            className="header-search header-date h-8 w-32 border rounded-md px-2 text-xs text-white focus:outline-none"
          />
          <span className="text-slate-500 text-xs">to</span>
          <input
            type="date"
            aria-label="Trip end date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => onEndDateChange?.(e.target.value)}
            className="header-search header-date h-8 w-32 border rounded-md px-2 text-xs text-white focus:outline-none"
          />
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
          <div className="relative">
            <button
              type="button"
              className="theme-trigger inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition"
              onClick={() => setThemeOpen((open) => !open)}
              aria-expanded={themeOpen}
              aria-haspopup="menu"
            >
              <span className={`theme-swatch theme-swatch--${theme} h-4 w-4 rounded-sm`} aria-hidden="true" />
              Theme
              <svg className={`h-3.5 w-3.5 transition-transform ${themeOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {themeOpen && (
              <div className="theme-menu absolute right-0 top-full z-50 mt-2 w-64 rounded-xl p-2" role="menu">
                <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-widest opacity-70">Choose appearance</p>
                <ThemeOptions theme={theme} onSelect={(nextTheme) => { selectTheme(nextTheme); setThemeOpen(false); }} />
              </div>
            )}
          </div>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-300 font-medium hidden lg:block">{user.username}</span>
              <Button
                onClick={handleLogout}
                disabled={logout.isPending}
                variant="ghost"
                className="text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-semibold px-3 py-2 rounded transition"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setLocation("/login")}
              className="bg-orange-500 hover:bg-orange-400 text-white px-5 py-2 rounded font-bold tracking-wide transition shadow-lg hover:shadow-orange-500/30"
            >
              Sign In
            </Button>
          )}
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
            <div className="theme-menu rounded-xl p-2">
              <p className="px-1 pb-1.5 text-[10px] font-bold uppercase tracking-widest opacity-70">Choose appearance</p>
              <ThemeOptions theme={theme} compact onSelect={(nextTheme) => { selectTheme(nextTheme); setMenuOpen(false); }} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                Start date
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartDateChange?.(e.target.value)}
                  className="header-search header-date mt-1 h-9 w-full rounded-md border px-2 text-xs text-white"
                />
              </label>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                End date
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => onEndDateChange?.(e.target.value)}
                  className="header-search header-date mt-1 h-9 w-full rounded-md border px-2 text-xs text-white"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={() => { onCalculate?.(); setMenuOpen(false); }}
              disabled={isCalculating || !startLocation.trim() || !endLocation.trim()}
              className="bg-orange-500 hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40 text-white h-10 w-full rounded-md text-sm font-bold transition"
            >
              {isCalculating ? "Calculating..." : "Go"}
            </button>
            {user ? (
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-slate-300 font-medium">{user.username}</span>
                <Button
                  onClick={handleLogout}
                  disabled={logout.isPending}
                  variant="ghost"
                  className="text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-semibold px-3 py-2 rounded transition"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => { setLocation("/login"); setMenuOpen(false); }}
                className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 w-full rounded font-bold tracking-wide transition"
              >
                Sign In
              </Button>
            )}
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
