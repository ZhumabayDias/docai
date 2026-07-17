import {
    ArrowRight,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
  } from "lucide-react";
  
  import { Button } from "../components/Button";
  import { Card } from "../components/Card";
  import { MarketingFooter } from "../components/MarketingFooter";
  
  type ContactItem = {
    icon: React.ReactNode;
    title: string;
    value: string;
    description: string;
    href?: string;
  };
  
  const contactItems: ContactItem[] = [
    {
      icon: <MapPin className="h-7 w-7 text-accent-blue" />,
      title: "Address",
      value: "Kyzylorda Hub",
      description: "Айтеке би 29А, Kyzylorda, Kazakhstan",
    },
    {
      icon: <Phone className="h-7 w-7 text-accent-green" />,
      title: "Phone",
      value: "+7 776 670 5960",
      description: "Available during business hours.",
      href: "tel:+77766705960",
    },
    {
      icon: <MessageCircle className="h-7 w-7 text-sky-400" />,
      title: "Telegram",
      value: "@hguoq",
      description: "Fastest way to reach us.",
      href: "https://t.me/hguoq",
    },
    {
      icon: <Mail className="h-7 w-7 text-yellow-400" />,
      title: "Email",
      value: "contact@docai.site",
      description: "General questions and support.",
      href: "mailto:contact@docai.site",
    },
  ];
  
  export function ContactPage() {
    return (
      <>
        <div className="bg-[#09090B]">
  
          {/* ---------------- HERO ---------------- */}
  
          <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl flex-col justify-center px-6 py-24">
  
            <div className="mx-auto max-w-3xl text-center">
  
              <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold text-white">
                Contact
              </span>
  
              <h1 className="mt-6 text-5xl md:text-6xl font-black leading-tight text-white">
                We'd Love to Hear From You
              </h1>
  
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-300">
                Whether you have questions, ideas, feedback, or simply want to
                learn more about DocAI Cloud, feel free to reach out.
                We're always happy to connect with developers,
                students and the open-source community.
              </p>
  
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
  
                <Button
                  icon={<ArrowRight className="h-4 w-4" />}
                  className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Continue with GitHub
                </Button>
  
                <Button
                  variant="secondary"
                  className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  View Documentation
                </Button>
  
              </div>
  
            </div>
  
          </section>
  
          {/* ---------------- CONTACT CARDS ---------------- */}
  
          <section className="mx-auto max-w-7xl px-6 py-20">
  
            <div className="mb-12 text-center">
  
              <h2 className="text-4xl font-black leading-tight text-white">
                Get in Touch
              </h2>
  
              <p className="mt-4 text-gray-400">
                Multiple ways to contact the DocAI Cloud team.
              </p>
  
            </div>
  
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-2">
  
              {contactItems.map((item) => (
                <Card
                  key={item.title}
                  className="rounded-lg border-white/10 bg-white/[0.04] p-6 transition duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"
                >
  
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                    {item.icon}
                  </div>
  
                  <h3 className="text-lg font-bold text-white">
                    {item.title}
                  </h3>
  
                  {item.href ? (
                    <a
                      href={item.href}
                      target={
                        item.href.startsWith("http")
                          ? "_blank"
                          : undefined
                      }
                      rel="noreferrer"
                      className="mt-2 block text-lg font-semibold text-accent-blue hover:underline"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="mt-2 text-lg font-semibold text-white">
                      {item.value}
                    </p>
                  )}
  
                  <p className="mt-3 text-sm leading-6 text-gray-400">
                    {item.description}
                  </p>
  
                </Card>
              ))}
  
            </div>
  
          </section>
  
          {/* ---------------- GOOGLE MAP ---------------- */}
  
          <section className="mx-auto max-w-7xl px-6 pb-20">
            <Card className="rounded-lg border border-white/10 bg-white/[0.04] p-3 overflow-hidden">
              <iframe
                title="Kyzylorda Hub"
                src="https://www.google.com/maps?q=Kyzylorda+Hub,+Айтеке+би+29А,+Кызылорда&output=embed"
                width="100%"
                height="450"
                loading="lazy"
                allowFullScreen
                className="rounded-lg border-0"
              />
            </Card>
          </section>
  
          {/* ---------------- QUESTIONS OR FEEDBACK ---------------- */}
  
          <section className="mx-auto max-w-5xl px-6 pb-24">
            <Card className="rounded-lg border border-white/10 bg-surface-raised px-6 py-16 text-center shadow-glow">
              <h2 className="text-3xl font-black text-white">
                Questions or Feedback?
              </h2>
              <p className="mt-6 max-w-3xl mx-auto text-lg leading-8 text-gray-400">
                Whether you have questions, ideas, bug reports, or feature requests,
                feel free to contact the DocAI Cloud team. We're here to help and
                eager to improve the platform with your input.
              </p>
            </Card>
          </section>
  
          {/* ---------------- CTA ---------------- */}
  
          <section className="mx-auto max-w-7xl px-6 pb-24">
            <Card className="rounded-lg border border-white/10 bg-surface-raised px-6 py-16 text-center shadow-glow">
              <h2 className="text-4xl font-black text-white">
                Ready to Deploy Your Next Project?
              </h2>
              <p className="mt-5 max-w-3xl mx-auto text-lg leading-8 text-gray-400">
                Connect your GitHub account and deploy your first application
                with DocAI Cloud in just a few minutes.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Button
                  icon={<ArrowRight className="h-4 w-4" />}
                  className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Continue with GitHub
                </Button>
                <Button
                  variant="secondary"
                  className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  View Documentation
                </Button>
              </div>
            </Card>
          </section>  
        </div>
      </>
    );
  }