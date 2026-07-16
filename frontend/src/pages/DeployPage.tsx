import {
  CheckCircle2,
  Container,
  Download,
  Github,
  Globe,
  Package,
  Search,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { useAuth } from "../contexts/AuthContext";

type DeployItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const pipeline: DeployItem[] = [
  {
    icon: Github,
    title: "GitHub Repository",
    description: "Connect your GitHub account and choose the repository you want to deploy.",
  },
  {
    icon: Download,
    title: "Repository Import",
    description: "DocAI securely clones your repository to the deployment server.",
  },
  {
    icon: Search,
    title: "Project Detection",
    description: "The platform automatically detects the project type and validates the required files. Current support: React + Vite.",
  },
  {
    icon: Package,
    title: "Docker Build",
    description: "Dependencies are installed and a production Docker image is built.",
  },
  {
    icon: Container,
    title: "Container Deployment",
    description: "A dedicated Docker container is created and started.",
  },
  {
    icon: Globe,
    title: "Running Application",
    description: "Your application becomes available through its deployment URL.",
  },
];

const behindTheScenes: DeployItem[] = [
  {
    icon: Github,
    title: "Git Clone",
    description: "The repository is cloned from GitHub.",
  },
  {
    icon: Download,
    title: "Dependency Installation",
    description: "Required packages are installed automatically.",
  },
  {
    icon: Search,
    title: "Project Validation",
    description: "The project structure is validated before deployment.",
  },
  {
    icon: Package,
    title: "Docker Image",
    description: "A production image is created.",
  },
  {
    icon: Container,
    title: "Container Startup",
    description: "A dedicated container is started.",
  },
  {
    icon: CheckCircle2,
    title: "Health Check",
    description: "Deployment is verified before becoming available.",
  },
];

const supportedToday = ["React", "Vite", "Docker"];
const comingSoon = ["Flask", "FastAPI", "Django", "Vue", "Next.js", "Angular"];

export function DeployPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-[#09090B]">
      <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl flex-col justify-center px-6 py-24">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-black leading-tight text-white md:text-6xl">
            Deploy Your Application in Minutes
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-300">
            From GitHub repository to a live application. DocAI Cloud automates
            repository import, project detection, Docker image creation and deployment.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              icon={<Github className="h-5 w-5" />}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              onClick={login}
            >
              Continue with GitHub
            </Button>
            <Button
              variant="secondary"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              onClick={() => navigate("/features")}
            >
              View Features
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20" aria-labelledby="deployment-pipeline-title">
        <div className="max-w-2xl">
          <h2 id="deployment-pipeline-title" className="text-4xl font-black leading-tight text-white">
            How Deployment Works
          </h2>
        </div>
        <ol className="relative mt-12 grid gap-5 lg:grid-cols-6">
          {pipeline.map(({ icon: Icon, title, description }, index) => (
            <li key={title} className="relative">
              {index < pipeline.length - 1 ? (
                <div className="absolute left-5 top-11 hidden h-px w-[calc(100%+1.25rem)] bg-white/10 lg:block" />
              ) : null}
              <Card className="relative min-h-64 rounded-lg border-white/10 bg-white/[0.04] p-5 transition duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Step {index + 1}
                </p>
                <h3 className="mt-2 text-lg font-bold text-white">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-gray-400">
                  {description}
                </p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20" aria-labelledby="behind-scenes-title">
        <div className="max-w-2xl">
          <h2 id="behind-scenes-title" className="text-4xl font-black leading-tight text-white">
            What Happens Behind the Scenes?
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {behindTheScenes.map(({ icon: Icon, title, description }) => (
            <Card
              key={title}
              className="group min-h-48 rounded-lg border-white/10 bg-surface-raised p-6 transition duration-200 hover:-translate-y-1 hover:border-white/20"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white transition group-hover:border-white/20">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-gray-400">
                {description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20" aria-labelledby="supported-technologies-title">
        <div className="max-w-2xl">
          <h2 id="supported-technologies-title" className="text-4xl font-black leading-tight text-white">
            Current Platform Support
          </h2>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <Card className="rounded-lg border-white/10 bg-white/[0.04] p-6">
            <h3 className="text-xl font-bold text-white">
              Supported Today
            </h3>
            <div className="mt-5 flex flex-wrap gap-3">
              {supportedToday.map((technology) => (
                <span
                  key={technology}
                  className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  {technology}
                </span>
              ))}
            </div>
          </Card>

          <Card className="rounded-lg border-white/10 bg-white/[0.04] p-6">
            <h3 className="text-xl font-bold text-white">
              Coming Soon
            </h3>
            <div className="mt-5 flex flex-wrap gap-3">
              {comingSoon.map((technology) => (
                <span
                  key={technology}
                  className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-surface-subtle px-3 py-2 text-sm font-semibold text-gray-300"
                >
                  {technology}
                  <span className="rounded-sm border border-white/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Coming Soon
                  </span>
                </span>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24" aria-labelledby="deploy-cta-title">
        <div className="rounded-lg border border-white/10 bg-surface-raised px-6 py-16 text-center shadow-glow">
          <h2 id="deploy-cta-title" className="text-4xl font-black leading-tight text-white">
            Ready to Deploy?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-gray-300">
            Connect your GitHub account and launch your first project in just a few minutes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              icon={<Github className="h-5 w-5" />}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              onClick={login}
            >
              Continue with GitHub
            </Button>
            <Button
              variant="secondary"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              onClick={() => navigate("/features")}
            >
              Browse Features
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
