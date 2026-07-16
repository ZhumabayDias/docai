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
        <main className="min-h-screen bg-brand-dark text-white">
  
          {/* ---------------- HERO ---------------- */}
  
          <section className="mx-auto max-w-7xl px-6 pt-28 pb-20">
  
            <div className="mx-auto max-w-3xl text-center">
  
              <span className="inline-flex rounded-full border border-accent-blue/30 bg-accent-blue/10 px-4 py-1 text-sm font-semibold text-accent-blue">
                Contact
              </span>
  
              <h1 className="mt-6 text-5xl font-black leading-tight">
                We'd Love to Hear From You
              </h1>
  
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-brand-muted">
                Whether you have questions, ideas, feedback, or simply want to
                learn more about DocAI Cloud, feel free to reach out.
                We're always happy to connect with developers,
                students and the open-source community.
              </p>
  
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
  
                <Button
                  icon={<ArrowRight className="h-4 w-4" />}
                >
                  Continue with GitHub
                </Button>
  
                <Button
                  variant="secondary"
                >
                  View Documentation
                </Button>
  
              </div>
  
            </div>
  
          </section>
  
          {/* ---------------- CONTACT CARDS ---------------- */}
  
          <section className="mx-auto max-w-7xl px-6 pb-20">
  
            <div className="mb-12 text-center">
  
              <h2 className="text-3xl font-bold">
                Get in Touch
              </h2>
  
              <p className="mt-4 text-brand-muted">
                Multiple ways to contact the DocAI Cloud team.
              </p>
  
            </div>
  
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
  
              {contactItems.map((item) => (
                <Card
                  key={item.title}
                  className="group flex h-full flex-col rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-accent-blue/40"
                >
  
                  <div className="mb-5">
                    {item.icon}
                  </div>
  
                  <h3 className="text-xl font-bold">
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
                      className="mt-4 text-lg font-semibold text-accent-blue hover:underline"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="mt-4 text-lg font-semibold">
                      {item.value}
                    </p>
                  )}
  
                  <p className="mt-3 text-sm leading-6 text-brand-muted">
                    {item.description}
                  </p>
  
                </Card>
              ))}
  
            </div>
  
          </section>
  
          {/* Part 2 starts here */}

                  {/* ---------------- GOOGLE MAP ---------------- */}

        <section className="mx-auto max-w-7xl px-6 pb-20">
          <Card className="overflow-hidden rounded-3xl p-3">
            <iframe
              title="Kyzylorda Hub"
              src="https://www.google.com/maps?q=Kyzylorda+Hub,+Айтеке+би+29А,+Кызылорда&output=embed"
              width="100%"
              height="450"
              loading="lazy"
              allowFullScreen
              className="rounded-2xl border-0"
            />
          </Card>
        </section>

        {/* ---------------- GET IN TOUCH ---------------- */}

        <section className="mx-auto max-w-5xl px-6 pb-24 text-center">

          <span className="inline-flex rounded-full border border-accent-blue/30 bg-accent-blue/10 px-4 py-1 text-sm font-semibold text-accent-blue">
            Let's Build Together
          </span>

          <h2 className="mt-6 text-4xl font-black">
            We're Always Happy to Help
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-brand-muted">
            Whether you're testing DocAI Cloud, deploying your first
            application or sharing ideas for future features,
            we'd love to hear your feedback.
            Every suggestion helps improve the platform.
          </p>

        </section>

        {/* ---------------- CTA ---------------- */}

        <section className="mx-auto max-w-7xl px-6 pb-24">

          <Card className="overflow-hidden rounded-3xl border border-accent-blue/20 bg-gradient-to-br from-accent-blue/10 to-transparent p-10">

            <div className="mx-auto max-w-3xl text-center">

              <h2 className="text-4xl font-black">
                Ready to Deploy Your Next Project?
              </h2>

              <p className="mt-5 text-lg leading-8 text-brand-muted">
                Connect your GitHub account and deploy your first application
                with DocAI Cloud in just a few minutes.
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-4">

                <Button
                  icon={<ArrowRight className="h-4 w-4" />}
                >
                  Continue with GitHub
                </Button>

                <Button variant="secondary">
                  View Documentation
                </Button>

              </div>

            </div>

          </Card>

        </section>

        <MarketingFooter />

      </main>
    </>
  );
}