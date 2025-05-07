import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useMobile } from "@/hooks/use-mobile";
import { useState } from "react";

export function Header() {
  const isMobile = useMobile();
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="bg-primary text-white h-16 flex items-center justify-between px-4 shadow-md z-10">
      <div className="flex items-center">
        <div className="mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 10.364a9 9 0 11-12.728 0M15 15l-4.243-4.243M14 8h-4a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2v-4a2 2 0 00-2-2z" />
          </svg>
        </div>
        <Link href="/">
          <a className="font-montserrat font-bold text-xl md:text-2xl">MotoRoute Europe</a>
        </Link>
      </div>
      <div className="flex items-center">
        <button 
          id="mobile-menu-btn" 
          className="md:hidden flex items-center justify-center p-2"
          onClick={toggleMenu}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        <div className="hidden md:flex items-center space-x-4">
          <Button onClick={() => setLocation("/login")} className="bg-accent hover:bg-accent-light px-4 py-2 rounded-md font-medium transition duration-150">
            Sign In
          </Button>
          <div className="relative">
            <Button variant="ghost" className="p-2 rounded-full bg-primary-light hover:bg-blue-700 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
      
      {isMobile && menuOpen && (
        <div className="absolute top-16 right-0 left-0 bg-primary z-50 shadow-lg">
          <div className="flex flex-col p-4 space-y-2">
            <Button onClick={() => {
              setLocation("/login");
              setMenuOpen(false);
            }} className="bg-accent hover:bg-accent-light px-4 py-2 w-full rounded-md font-medium transition duration-150">
              Sign In
            </Button>
            <Button variant="outline" onClick={() => {
              setLocation("/saved-routes");
              setMenuOpen(false);
            }} className="w-full">
              Saved Routes
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
