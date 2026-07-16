import { Github, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";

import { Button } from "./Button";
import { useAuth } from "../contexts/AuthContext";

import logo from "../assets/images/logo.png";

const landingNavigation = [
  { label: "Home", to: "/" },
  { label: "Features", to: "/features" },
  { label: "Deploy", to: "/deploy" },
  { label: "Pricing", to: "/pricing" },
  { label: "Docs", to: "/docs" },
  { label: "Contact", to: "/contact" },
];

export function LandingNavbar() {
  const { login } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const renderNavLink = ({ label, to }: (typeof landingNavigation)[number]) => (
    <NavLink
      key={to}
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `relative rounded-sm text-sm transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
          isActive ? "text-white after:w-full after:opacity-100" : "text-gray-300 hover:text-white after:w-0 after:opacity-0"
        } after:absolute after:-bottom-2 after:left-0 after:h-px after:bg-white after:transition-all after:duration-300`
      }
      onClick={() => setIsMenuOpen(false)}
    >
      {label}
    </NavLink>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <NavLink
          to="/"
          className="flex items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          aria-label="DocAI Cloud home"
          onClick={() => setIsMenuOpen(false)}
        >
          <img
            src={logo}
            alt="DocAI Cloud"
            className="h-10 w-10 object-contain"
          />

          <span className="text-xl font-bold text-white">
             DocAI Cloud
          </span>
        </NavLink>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Marketing navigation">
          {landingNavigation.map(renderNavLink)}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">

          <Button
            variant="ghost"
            className="hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black md:inline-flex"
            onClick={login}
          >
            Login
          </Button>

          <Button
            icon={<Github className="h-4 w-4" />}
            className="hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:inline-flex"
            onClick={login}
          >
            Continue with GitHub
          </Button>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black md:hidden"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            aria-controls="landing-mobile-menu"
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>

      </div>

      <nav
        id="landing-mobile-menu"
        aria-label="Landing page navigation"
        className={`border-t border-white/10 bg-black/80 px-6 py-4 backdrop-blur-xl transition md:hidden ${
          isMenuOpen ? "block" : "hidden"
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4">
          {landingNavigation.map(renderNavLink)}
          <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
            <Button
              variant="ghost"
              className="justify-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              onClick={() => {
                setIsMenuOpen(false);
                login();
              }}
            >
              Login
            </Button>
            <Button
              icon={<Github className="h-4 w-4" />}
              className="justify-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              onClick={() => {
                setIsMenuOpen(false);
                login();
              }}
            >
              Continue with GitHub
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}
