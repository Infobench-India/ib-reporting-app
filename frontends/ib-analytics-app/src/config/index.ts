

export const description = 'Infobench Boilerplate with React and Redux with Redux Saga';
export const name = 'Infobench React Redux Saga Boilerplate';
import { loadEnv } from "vite";
export const Config = {
  auth: {
    publicURL:
    import.meta.env.VITE_REACT_APP_KRATOS_PUBLIC_URL ||
      "http://127.0.0.1:4455/.ory/kratos/public",
    adminURL: import.meta.env.VITE_REACT_APP_KRATOS_PUBLIC_URL || "http://127.0.0.1:4434",
  },
};