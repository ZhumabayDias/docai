import {
  BookOpen,
  Boxes,
  ChevronDown,
  ChevronRight,
  Github,
  HelpCircle,
  Layers3,
  Rocket,
  SquareStack,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../utils/cn";

type QuickStartStep = {
  title: string;
  description: string;
};

type DocumentationCategory = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

const quickStartSteps: QuickStartStep[] = [
  {
    title: "Sign in using GitHub.",
    description: "Authorize Docai Cloud with your GitHub account.",
  },
  {
    title: "Import a repository.",
    description: "Choose the project repository you want to deploy.",
  },
  {
    title: "Deploy your project.",
    description: "Docai Cloud builds and starts your application.",
  },
  {
    title: "Open your live application.",
    description: "Use the deployment URL once your project is running.",
  },
];

const documentationCategories: DocumentationCategory[] = [
  {
    icon: BookOpen,
    title: "Getting Started",
    description: "Learn how to create your first deployment.",
  },
  {
    icon: Github,
    title: "GitHub Integration",
    description: "Authenticate and import repositories.",
  },
  {
    icon: Rocket,
    title: "Deployments",
    description: "Understand how deployments work.",
  },
  {
    icon: SquareStack,
    title: "Projects",
    description: "Manage, redeploy and remove projects.",
  },
  {
    icon: Boxes,
    title: "Supported Technologies",
    description: "Current support: React, Vite and Docker.",
  },
  {
    icon: HelpCircle,
    title: "Frequently Asked Questions",
    description: "Common questions and answers.",
  },
];

const faqs: FaqItem[] = [
  {
    question: "What is Docai Cloud?",
    answer: "Docai Cloud is a deployment platform for importing GitHub repositories and running supported applications in Docker containers.",
  },
  {
    question: "How do I deploy my first project?",
    answer: "Sign in with GitHub, import a repository, start a deployment and open the generated deployment URL when it is running.",
  },
  {
    question: "Which frameworks are currently supported?",
    answer: "Current support is focused on React and Vite projects deployed with Docker.",
  },
  {
    question: "Can I deploy private repositories?",
    answer: "Private repository access depends on the permissions you grant through GitHub OAuth.",
  },
  {
    question: "Is Docker required on my computer?",
    answer: "No. Docker is used by Docai Cloud on the deployment server, so you do not need Docker installed locally.",
  },
  {
    question: "What features are coming next?",
    answer: "Planned work includes broader framework support, deployment logs, environment variables and custom domains.",
  },
];

export function DocumentationPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="bg-[#09090B]">
      <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl flex-col justify-center px-6 py-24">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-black leading-tight text-white md:text-6xl">
            Documentation for Every Developer
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-300">
            Everything you need to deploy, configure, and manage your applications with Docai Cloud.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              icon={<Github className="h-5 w-5" />}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              onClick={login}
            >
              Get Started
            </Button>
            <Button
              variant="secondary"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              onClick={() => navigate("/deploy")}
            >
              Deploy Guide
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20" aria-labelledby="quick-start-title">
        <div className="max-w-2xl">
          <h2 id="quick-start-title" className="text-4xl font-black leading-tight text-white">
            Quick Start
          </h2>
        </div>
        <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {quickStartSteps.map((step, index) => (
            <li key={step.title} className="relative">
              {index < quickStartSteps.length - 1 ? (
                <ChevronRight
                  className="absolute -right-4 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 text-white/25 lg:block"
                  aria-hidden="true"
                />
              ) : null}
              <Card className="min-h-56 rounded-lg border-white/10 bg-white/[0.04] p-6 transition duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-accent-green/30 bg-accent-green/10 text-sm font-black text-accent-green">
                  {index + 1}
                </div>
                <h3 className="mt-6 text-xl font-bold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-gray-400">
                  {step.description}
                </p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20" aria-labelledby="browse-docs-title">
        <div className="max-w-2xl">
          <h2 id="browse-docs-title" className="text-4xl font-black leading-tight text-white">
            Browse Documentation
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {documentationCategories.map(({ icon: Icon, title, description }) => (
            <Card
              key={title}
              className="group flex min-h-64 flex-col rounded-lg border-white/10 bg-white/[0.04] p-6 transition duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"
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

      <section className="mx-auto max-w-7xl px-6 py-20" aria-labelledby="documentation-faq-title">
        <div className="max-w-2xl">
          <h2 id="documentation-faq-title" className="text-4xl font-black leading-tight text-white">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="mt-10 space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            const answerId = `documentation-faq-answer-${index}`;

            return (
              <div key={faq.question} className="rounded-lg border border-white/10 bg-surface-raised">
                <h3>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 rounded-lg px-5 py-4 text-left text-base font-semibold text-white transition hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  >
                    {faq.question}
                    <ChevronDown
                      className={cn("h-5 w-5 shrink-0 text-gray-400 transition", isOpen && "rotate-180")}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <div id={answerId} hidden={!isOpen} className="px-5 pb-5 text-sm leading-7 text-gray-400">
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24" aria-labelledby="documentation-cta-title">
        <div className="rounded-lg border border-white/10 bg-surface-raised px-6 py-16 text-center shadow-glow">
          <Layers3 className="mx-auto h-8 w-8 text-accent-green" aria-hidden="true" />
          <h2 id="documentation-cta-title" className="mt-5 text-4xl font-black leading-tight text-white">
            Ready to Deploy Your First Project?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-gray-300">
            Connect your GitHub account and deploy your application in minutes.
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
              View Features
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
