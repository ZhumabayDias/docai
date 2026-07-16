import {
  Boxes,
  CheckCircle2,
  Github,
  GraduationCap,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { useAuth } from "../contexts/AuthContext";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: Github,
    title: "GitHub Integration",
    description: "Secure GitHub OAuth authentication. Import repositories directly from your GitHub account.",
  },
  {
    icon: Rocket,
    title: "One-click Deployment",
    description: "Deploy projects with a single click. No manual server configuration.",
  },
  {
    icon: Boxes,
    title: "Docker Powered",
    description: "Every deployment runs inside an isolated Docker container. Consistent environments.",
  },
  {
    icon: Workflow,
    title: "Live Deployment Status",
    description: "Track deployment progress through CREATED, BUILDING, RUNNING and FAILED states.",
  },
  {
    icon: RefreshCw,
    title: "Automatic Cleanup",
    description: "Redeployments automatically replace previous containers. Unused resources are cleaned safely.",
  },
  {
    icon: ShieldCheck,
    title: "Production Ready",
    description: "Modern architecture, secure authentication and Docker-based deployment designed for future scalability.",
  },
];

const reasons: Feature[] = [
  {
    icon: CheckCircle2,
    title: "Simple",
    description: "Deploy in minutes. No infrastructure knowledge required.",
  },
  {
    icon: ShieldCheck,
    title: "Reliable",
    description: "Docker-based deployments. Clean deployment lifecycle.",
  },
  {
    icon: GraduationCap,
    title: "Built for Learning",
    description: "Perfect for students, developers and personal projects.",
  },
];

export function FeaturesPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-[#09090B]">
      <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl flex-col justify-center px-6 py-24">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-black leading-tight text-white md:text-6xl">
            Powerful Cloud Deployment for Modern Developers
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-300">
            Deploy your GitHub repositories with a simple workflow. DocAI Cloud
            automates building, deployment and container management so you can
            focus on development.
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
              onClick={() => navigate("/docs")}
            >
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20" aria-labelledby="features-grid-title">
        <div className="max-w-2xl">
          <h2 id="features-grid-title" className="text-4xl font-black leading-tight text-white">
            Everything you need to deploy with confidence
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card
              key={title}
              className="group min-h-56 rounded-lg border-white/10 bg-white/[0.04] p-6 transition duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"
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

      <section className="mx-auto max-w-7xl px-6 py-20" aria-labelledby="why-docai-title">
        <div className="max-w-2xl">
          <h2 id="why-docai-title" className="text-4xl font-black leading-tight text-white">
            Why Choose DocAI Cloud?
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {reasons.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-lg border border-white/10 bg-surface-raised p-6">
              <Icon className="h-6 w-6 text-white" aria-hidden="true" />
              <h3 className="mt-5 text-xl font-bold text-white">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-gray-400">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24" aria-labelledby="features-cta-title">
        <div className="rounded-lg border border-white/10 bg-surface-raised px-6 py-16 text-center shadow-glow">
          <h2 id="features-cta-title" className="text-4xl font-black leading-tight text-white">
            Start Deploying Today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-gray-300">
            Connect your GitHub account and deploy your first project in minutes.
          </p>
          <div className="mt-8">
            <Button
              icon={<Github className="h-5 w-5" />}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              onClick={login}
            >
              Continue with GitHub
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
