import axios from "axios";

export const backendBaseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "";

export const api = axios.create({
  baseURL: backendBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
