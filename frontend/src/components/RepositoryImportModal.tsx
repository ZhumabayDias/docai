import { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

import { Button } from "./Button";
import { Card } from "./Card";
import { LoadingSpinner } from "./LoadingSpinner";
import { getRepositories, importProject } from "../services/projects";
import type { GitHubRepository } from "../types/project";

type RepositoryImportModalProps = {
  open: boolean;
  onClose: () => void;
  onImported: () => Promise<void>;
};

export function RepositoryImportModal({ open, onClose, onImported }: RepositoryImportModalProps) {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [loading, setLoading] = useState(false);
  const [importingId, setImportingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let isActive = true;

    const loadRepositories = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getRepositories();
        if (isActive) {
          setRepositories(data);
        }
      } catch (caughtError) {
        if (isActive) {
          setError(getFriendlyErrorMessage(caughtError));
          setRepositories([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadRepositories();

    return () => {
      isActive = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setRepositories([]);
      setError(null);
      setLoading(false);
      setImportingId(null);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleImport = async (repositoryId: number) => {
    if (importingId !== null) {
      return;
    }

    setImportingId(repositoryId);
    setError(null);

    try {
      await importProject(repositoryId);
      onClose();
      await onImported();
    } catch (caughtError) {
      setError(getFriendlyErrorMessage(caughtError));
    } finally {
      setImportingId(null);
    }
  };

  const isEmpty = !loading && !error && repositories.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-base/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl">
        <Card className="max-h-[80vh] overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
            <div>
              <h2 className="text-xl font-bold text-brand">Import Project</h2>
              <p className="mt-1 text-sm text-brand-muted">
                Choose a GitHub repository to import into DocAI Cloud.
              </p>
            </div>
            <Button
              aria-label="Close import modal"
              className="px-3"
              onClick={onClose}
              variant="ghost"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-[calc(80vh-5rem)] overflow-y-auto p-5">
            {loading ? (
              <div className="flex min-h-56 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <Card className="border-accent-red/30 bg-accent-red/10 text-accent-red">
                <p className="font-semibold">Could not load repositories</p>
                <p className="mt-2 text-sm">{error}</p>
              </Card>
            ) : isEmpty ? (
              <Card>
                <p className="text-lg font-bold text-brand">
                  All GitHub repositories have already been imported.
                </p>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {repositories.map((repository) => (
                  <Card className="flex flex-col justify-between gap-4" key={repository.id}>
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-bold text-brand">{repository.name}</h3>
                          <p className="mt-1 text-sm text-brand-muted">Repository ID {repository.id}</p>
                        </div>
                        <span className="rounded-full border border-surface-border bg-surface-subtle px-3 py-1 text-xs font-semibold text-brand-muted">
                          {repository.private ? "Private" : "Public"}
                        </span>
                      </div>

                      <p className="text-sm text-brand-muted">
                        Default branch: <span className="font-semibold text-brand">{repository.default_branch}</span>
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        disabled={importingId !== null}
                        onClick={() => {
                          void handleImport(repository.id);
                        }}
                      >
                        {importingId === repository.id ? "Importing..." : "Import"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function getFriendlyErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 409) {
      return "Repository already imported.";
    }

    return "Could not load repositories. Please try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while importing repositories.";
}
