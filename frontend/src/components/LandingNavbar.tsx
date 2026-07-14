import { Github } from "lucide-react";

import { Button } from "./Button";
import { useAuth } from "../contexts/AuthContext";

import logo from "../assets/images/logo.png";

export function LandingNavbar() {
  const { login } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="DocAI Cloud"
            className="h-10 w-10 object-contain"
          />

          <span className="text-xl font-bold text-white">
             DocAI Cloud
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm text-gray-300 transition hover:text-white"
          >
            Features
          </a>

          <a
            href="#deploy"
            className="text-sm text-gray-300 transition hover:text-white"
          >
            Deploy
          </a>

          <a
            href="#pricing"
            className="text-sm text-gray-300 transition hover:text-white"
          >
            Pricing
          </a>

          <a
            href="#docs"
            className="text-sm text-gray-300 transition hover:text-white"
          >
            Docs
          </a>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">

          <Button
            variant="ghost"
            className="hidden md:inline-flex"
            onClick={login}
          >
            Login
          </Button>

          <Button
            icon={<Github className="h-4 w-4" />}
            onClick={login}
          >
            Continue with GitHub
          </Button>

        </div>

      </div>
    </header>
  );
}