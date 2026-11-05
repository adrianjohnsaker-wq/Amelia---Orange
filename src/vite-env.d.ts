/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AMELIA_LOCAL_ONLY?: string;
  readonly VITE_AMELIA_RESEARCH_NAMESPACE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
