type MarketingPlaceholderPageProps = {
  title: string;
};

export function MarketingPlaceholderPage({ title }: MarketingPlaceholderPageProps) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-161px)] max-w-7xl flex-col justify-center px-6 py-24">
      <h1 className="text-4xl font-black leading-tight text-white">
        {title}
      </h1>
      <p className="mt-3 text-lg leading-8 text-gray-300">
        Coming soon
      </p>
    </section>
  );
}
