import { Github, Menu, X } from "lucide-react";
import { useState } from "react";

import { Button } from "./Button";
import { useAuth } from "../contexts/AuthContext";

import logo from "../assets/images/logo.png";

const landingNavigation = [
  { label: "Features", href: "#features", id: "features" },
  { label: "Deploy", href: "#deploy", id: "deploy" },
  { label: "Pricing", href: "#pricing", id: "pricing" },
  { label: "Docs", href: "#docs", id: "docs" },
  { label: "Contact", href: "#contact", id: "contact" },
];

type LandingNavbarProps = {
  activeSection: string;
};

export function LandingNavbar({ activeSection }: LandingNavbarProps) {
  const { login } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  const renderNavLink = ({ label, href, id }: (typeof landingNavigation)[number]) => {
    const isActive = activeSection === id;

    return (
      <a
        key={id}
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={`relative rounded-sm text-sm transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
          isActive ? "text-white" : "text-gray-300 hover:text-white"
        }`}
        onClick={(event) => {
          event.preventDefault();
          handleNavigate(id);
        }}
      >
        {label}
        <span
          className={`absolute -bottom-2 left-0 h-px bg-white transition-all duration-300 ${
            isActive ? "w-full opacity-100" : "w-0 opacity-0"
          }`}
        />
      </a>
    );
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <a
          href="#hero"
          className="flex items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          aria-label="DocAI Cloud home"
          onClick={(event) => {
            event.preventDefault();
            handleNavigate("hero");
          }}
        >
          <img
            src={logo}
            alt="DocAI Cloud"
            className="h-10 w-10 object-contain"
          />

          <span className="text-xl font-bold text-white">
             DocAI Cloud
          </span>
        </a>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
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
        </div>
      </nav>
    </header>
  );
}
