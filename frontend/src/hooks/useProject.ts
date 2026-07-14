import axios from "axios";
import { useCallback, useEffect, useState } from "react";

import { getProject } from "../services/projects";
import type { ProjectDetailResponse } from "../types/project";

type UseProjectState = {
  project: ProjectDetailResponse | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
  refetch: () => Promise<void>;
};

export function useProject(projectId: number | null): UseProjectState {
  const [project, setProject] = useState<ProjectDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const refetch = useCallback(async () => {
    if (projectId === null) {
      setProject(null);
      setError("Invalid project id.");
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setNotFound(false);
      const data = await getProject(projectId);
      setProject(data);
    } catch (caughtError) {
      setProject(null);
      setNotFound(isNotFoundError(caughtError));
      setError(getErrorMessage(caughtError));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    project,
    loading,
    error,
    notFound,
    refetch,
  };
}

function isNotFoundError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 404;
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

  return "Could not load project.";
}
