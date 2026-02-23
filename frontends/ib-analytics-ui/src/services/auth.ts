import { Configuration, FrontendApi } from "@ory/client";
import { Config } from "../config";

export const AuthPublicAPI = new FrontendApi(
  new Configuration({
    basePath: Config.auth.publicURL,
    baseOptions: {
      withCredentials: true, // we need to include cookies
    },
  })
);
