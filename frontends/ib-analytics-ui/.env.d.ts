/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTHERIZATION_URL: string;
  readonly VITE_MES_API_URL: string;
  readonly VITE_REACT_APP_KRATOS_PUBLIC_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
