import { Card } from "../components/Card";

type PlaceholderPageProps = {
  title: string;
};

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-7xl">
      <Card>
        <h2 className="text-xl font-bold text-brand">{title}</h2>
        <p className="mt-2 text-sm text-brand-muted">This section will be added in the next milestone.</p>
      </Card>
    </div>
  );
}
