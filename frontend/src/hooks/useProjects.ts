import axios from "axios";
import { useCallback, useEffect, useState } from "react";

import { getProjects } from "../services/projects";
import type { Project } from "../types/project";

type UseProjectsState = {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useProjects(): UseProjectsState {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProjects();
      setProjects(data);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    projects,
    loading,
    error,
    refetch,
  };
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data;

    if (typeof detail === "object" && detail !== null && "detail" in detail) {
      return String(detail.detail);
    }

    if (error.response?.status === 401) {
      return "You are not authenticated. Please log in with GitHub.";
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Could not load projects.";
}
