import { ArrowRight, Github } from "lucide-react";
import { Navigate } from "react-router-dom";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";

import heroBackground from "../assets/images/hero-background.png";

export function LandingPage() {
  const { loading, isAuthenticated, login } = useAuth();

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
    <section
      className="relative min-h-[calc(100vh-64px)] overflow-hidden"
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
        {/* Hero */}
        <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl items-center px-6">
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
        </div>
      </div>
    </section>
  );
}
