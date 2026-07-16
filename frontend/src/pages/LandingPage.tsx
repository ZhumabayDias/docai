import { ArrowRight, Github } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";

import heroBackground from "../assets/images/hero-background.png";
import { LandingNavbar } from "../components/LandingNavbar";

const placeholderSections = [
  { id: "features", title: "Features" },
  { id: "deploy", title: "Deploy" },
  { id: "pricing", title: "Pricing" },
  { id: "docs", title: "Docs" },
  { id: "contact", title: "Contact" },
];

export function LandingPage() {
  const { loading, isAuthenticated, login } = useAuth();
  const [activeSection, setActiveSection] = useState("");
  const [isHeroVisible, setIsHeroVisible] = useState(true);

  useEffect(() => {
    const sectionIds = placeholderSections.map((section) => section.id);
    const sections = sectionIds
      .map((sectionId) => document.getElementById(sectionId))
      .filter((section): section is HTMLElement => Boolean(section));

    const activeObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

        if (visibleEntry) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-64px 0px -55% 0px",
        threshold: [0.2, 0.4, 0.6, 0.8],
      },
    );

    sections.forEach((section) => activeObserver.observe(section));

    const hero = document.getElementById("hero");
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        setIsHeroVisible(entry.isIntersecting);

        if (entry.isIntersecting) {
          setActiveSection("");
        }
      },
      {
        rootMargin: "-64px 0px 0px 0px",
        threshold: 0.2,
      },
    );

    if (hero) {
      heroObserver.observe(hero);
    }

    return () => {
      activeObserver.disconnect();
      heroObserver.disconnect();
    };
  }, []);

  const scrollToHero = () => {
    document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090B]">
        <LoadingSpinner />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{
        backgroundImage: `url(${heroBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/65" />

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-[#09090B]" />

      {/* Everything visible */}
      <div className="relative z-10">
        {/* Navbar */}
        <LandingNavbar activeSection={activeSection} />

        {/* Hero */}
        <div className="pt-16">
          <section
            id="hero"
            className="mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl scroll-mt-16 items-center px-6"
          >
            <div className="grid w-full gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              {/* LEFT */}
              <section className="space-y-8">
                <div>
                  <h1 className="mt-3 text-6xl font-black leading-tight text-white">
                    Deploy your GitHub projects in seconds
                  </h1>
                </div>

                <p className="max-w-2xl text-lg leading-8 text-gray-300">
                  Import repositories directly from GitHub, deploy them with one
                  click, monitor builds and manage your deployments from one clean
                  dashboard.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Button icon={<Github className="h-5 w-5" />} onClick={login}>
                    Continue with GitHub
                  </Button>

                  <Button
                    variant="secondary"
                    icon={<ArrowRight className="h-5 w-5" />}
                    onClick={login}
                  >
                    Get Started
                  </Button>
                </div>
              </section>

              {/* RIGHT */}
              <Card className="border-white/10 bg-black/35 backdrop-blur-xl">
                <div className="space-y-5">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                    <h3 className="text-lg font-bold text-white">
                      Import
                    </h3>

                    <p className="mt-2 text-gray-400">
                      Connect GitHub repositories instantly.
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                    <h3 className="text-lg font-bold text-white">
                      Deploy
                    </h3>

                    <p className="mt-2 text-gray-400">
                      Build and deploy applications automatically.
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                    <h3 className="text-lg font-bold text-white">
                      Monitor
                    </h3>

                    <p className="mt-2 text-gray-400">
                      Follow deployment logs and runtime status.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        </div>

        {placeholderSections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="mx-auto flex min-h-[55vh] max-w-7xl scroll-mt-20 flex-col justify-center px-6 py-24"
          >
            <h2 className="text-4xl font-black leading-tight text-white">
              {section.title}
            </h2>
            <p className="mt-3 text-lg leading-8 text-gray-300">
              Coming in the next update
            </p>
          </section>
        ))}

        <button
          type="button"
          aria-label="Back to top"
          className={`fixed bottom-6 right-6 z-50 inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/10 bg-black/70 text-white shadow-glow backdrop-blur-xl transition duration-300 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
            isHeroVisible ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          onClick={scrollToHero}
        >
          <ArrowRight className="h-5 w-5 -rotate-90" />
        </button>
      </div>
    </main>
  );

}
