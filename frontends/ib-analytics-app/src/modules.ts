import { loadEnv } from "vite";

process.env = {
  ...process.env,
  ...loadEnv(import.meta.env.NODE_ENV || "development", process.cwd()),
};

export default {
  analytics_web_app: import.meta.env.VITE_analytics_web_app || "",
};
