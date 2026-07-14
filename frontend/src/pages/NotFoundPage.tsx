import { useNavigate } from "react-router-dom";

import { Button } from "../components/Button";
import { Card } from "../components/Card";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-muted">404</p>
        <h1 className="mt-3 text-2xl font-extrabold text-brand">Page not found</h1>
        <p className="mt-2 text-sm text-brand-muted">
          The page you requested is not available.
        </p>
        <div className="mt-6">
          <Button
            onClick={() => {
              navigate("/");
            }}
            variant="secondary"
          >
            Back to home
          </Button>
        </div>
      </Card>
    </main>
  );
}
