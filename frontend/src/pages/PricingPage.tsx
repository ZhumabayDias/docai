import { CheckCircle2, ChevronDown, Github, MinusCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../utils/cn";

type Plan = {
  name: string;
  badge: string;
  price: string;
  description: string;
  itemsTitle: string;
  items: string[];
  buttonLabel: string;
  available: boolean;
  recommended?: boolean;
};

type ComparisonRow = {
  feature: string;
  free: boolean;
  pro: boolean;
  enterprise: boolean;
};

type Faq = {
  question: string;
  answer: string;
};

const plans: Plan[] = [
  {
    name: "Free",
    badge: "Available Now",
    price: "$0 / month",
    description: "Perfect for learning, personal projects and MVP development.",
    itemsTitle: "Included",
    items: [
      "GitHub OAuth",
      "Repository Import",
      "React + Vite Deployment",
      "Docker Containers",
      "Deployment URL",
      "Redeployment",
      "Project Deletion",
      "Community Support",
    ],
    buttonLabel: "Get Started",
    available: true,
    recommended: true,
  },
  {
    name: "Pro",
    badge: "Coming Soon",
    price: "Coming Soon",
    description: "Advanced deployment tools for individual developers.",
    itemsTitle: "Planned Features",
    items: [
      "Environment Variables",
      "Deployment Logs",
      "Runtime Controls",
      "Custom Domains",
      "Priority Support",
    ],
    buttonLabel: "Coming Soon",
    available: false,
  },
  {
    name: "Enterprise",
    badge: "Coming Soon",
    price: "Contact Us",
    description: "Deployment infrastructure for teams and organizations.",
    itemsTitle: "Planned Features",
    items: [
      "Team Workspaces",
      "RBAC",
      "Monitoring",
      "Dedicated Infrastructure",
      "Enterprise Support",
    ],
    buttonLabel: "Coming Soon",
    available: false,
  },
];

const comparisonRows: ComparisonRow[] = [
  { feature: "GitHub OAuth", free: true, pro: true, enterprise: true },
  { feature: "Repository Import", free: true, pro: true, enterprise: true },
  { feature: "React Deployment", free: true, pro: true, enterprise: true },
  { feature: "Docker Deployment", free: true, pro: true, enterprise: true },
  { feature: "Deployment URL", free: true, pro: true, enterprise: true },
  { feature: "Redeploy", free: true, pro: true, enterprise: true },
  { feature: "Delete Deployment", free: true, pro: true, enterprise: true },
  { feature: "Environment Variables", free: false, pro: false, enterprise: false },
  { feature: "Deployment Logs", free: false, pro: false, enterprise: false },
  { feature: "Runtime Controls", free: false, pro: false, enterprise: false },
  { feature: "Custom Domains", free: false, pro: false, enterprise: false },
  { feature: "Monitoring", free: false, pro: false, enterprise: false },
  { feature: "Team Workspaces", free: false, pro: false, enterprise: false },
];

const faqs: Faq[] = [
  {
    question: "Is DocAI Cloud free?",
    answer: "Yes. The Free plan is available now for learning, personal projects and MVP development.",
  },
  {
    question: "Can I deploy private repositories?",
    answer: "DocAI Cloud uses GitHub OAuth, so repository access depends on the permissions granted through your GitHub account.",
  },
  {
    question: "Which frameworks are currently supported?",
    answer: "Current deployment support is focused on React + Vite projects running in Docker containers.",
  },
  {
    question: "Do I need Docker installed locally?",
    answer: "No. Docker image creation and container deployment are handled by DocAI Cloud on the deployment server.",
  },
  {
    question: "When will Pro become available?",
    answer: "Pro is planned for a future release. It is not available yet, and unavailable features are marked as Coming Soon.",
  },
];

function AvailabilityCell({ available }: { available: boolean }) {
  if (available) {
    return (
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
        <CheckCircle2 className="h-4 w-4 text-accent-green" aria-hidden="true" />
        Available
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400">
      <MinusCircle className="h-4 w-4" aria-hidden="true" />
      Coming Soon
    </span>
  );
}

export function PricingPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="bg-[#09090B]">
      <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl flex-col justify-center px-6 py-24">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-black leading-tight text-white md:text-6xl">
            Simple Pricing for Every Developer
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-300">
            Start with the free plan and grow with DocAI Cloud as new capabilities
            become available.
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

      <section className="mx-auto max-w-7xl px-6 py-20" aria-labelledby="pricing-plans-title">
        <div className="max-w-2xl">
          <h2 id="pricing-plans-title" className="text-4xl font-black leading-tight text-white">
            Pricing Plans
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                "relative flex min-h-[34rem] flex-col rounded-lg border-white/10 bg-white/[0.04] p-6 transition duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]",
                plan.recommended && "border-accent-green/50 shadow-glow",
              )}
            >
              {plan.recommended ? (
                <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-md border border-accent-green/30 bg-accent-green/10 px-3 py-1 text-xs font-semibold text-accent-green">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Recommended for Students & Personal Projects
                </div>
              ) : null}
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-2xl font-bold text-white">
                  {plan.name}
                </h3>
                <span
                  className={cn(
                    "rounded-md border px-3 py-1 text-xs font-semibold",
                    plan.available
                      ? "border-accent-green/30 bg-accent-green/10 text-accent-green"
                      : "border-white/10 bg-surface-subtle text-gray-400",
                  )}
                >
                  {plan.badge}
                </span>
              </div>
              <p className="mt-6 text-4xl font-black leading-tight text-white">
                {plan.price}
              </p>
              <p className="mt-4 text-sm leading-7 text-gray-400">
                {plan.description}
              </p>
              <div className="mt-8">
                <p className="text-sm font-semibold text-white">
                  {plan.itemsTitle}
                </p>
                <ul className="mt-4 space-y-3">
                  {plan.items.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-gray-300">
                      <CheckCircle2
                        className={cn("mt-1 h-4 w-4 shrink-0", plan.available ? "text-accent-green" : "text-gray-500")}
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto pt-8">
                <Button
                  className="w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  disabled={!plan.available}
                  onClick={login}
                >
                  {plan.buttonLabel}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20" aria-labelledby="pricing-comparison-title">
        <div className="max-w-2xl">
          <h2 id="pricing-comparison-title" className="text-4xl font-black leading-tight text-white">
            Feature Comparison
          </h2>
        </div>
        <div className="mt-10 overflow-x-auto rounded-lg border border-white/10">
          <table className="min-w-[760px] w-full border-collapse bg-surface-raised text-left">
            <caption className="sr-only">
              Compare Free, Pro and Enterprise availability across DocAI Cloud features.
            </caption>
            <thead>
              <tr className="border-b border-white/10">
                <th scope="col" className="px-5 py-4 text-sm font-semibold text-white">
                  Feature
                </th>
                <th scope="col" className="px-5 py-4 text-sm font-semibold text-white">
                  Free
                </th>
                <th scope="col" className="px-5 py-4 text-sm font-semibold text-white">
                  Pro
                </th>
                <th scope="col" className="px-5 py-4 text-sm font-semibold text-white">
                  Enterprise
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.feature} className="border-b border-white/10 last:border-b-0">
                  <th scope="row" className="px-5 py-4 text-sm font-semibold text-gray-200">
                    {row.feature}
                  </th>
                  <td className="px-5 py-4">
                    <AvailabilityCell available={row.free} />
                  </td>
                  <td className="px-5 py-4">
                    <AvailabilityCell available={row.pro} />
                  </td>
                  <td className="px-5 py-4">
                    <AvailabilityCell available={row.enterprise} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20" aria-labelledby="pricing-faq-title">
        <div className="max-w-2xl">
          <h2 id="pricing-faq-title" className="text-4xl font-black leading-tight text-white">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="mt-10 space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            const answerId = `pricing-faq-answer-${index}`;

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

      <section className="mx-auto max-w-7xl px-6 py-24" aria-labelledby="pricing-cta-title">
        <div className="rounded-lg border border-white/10 bg-surface-raised px-6 py-16 text-center shadow-glow">
          <h2 id="pricing-cta-title" className="text-4xl font-black leading-tight text-white">
            Start Deploying Today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-gray-300">
            Create your first deployment in just a few minutes using your GitHub account.
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
              onClick={() => navigate("/docs")}
            >
              View Documentation
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
