/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_ETH_RPC_URL: string
  readonly VITE_TRON_RPC_URL: string
  readonly VITE_BSC_RPC_URL: string
  readonly VITE_CONTRACT_ADDRESS: string
  readonly VITE_ENABLE_RUSSIA_MODULE: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_NOTIFICATIONS: string
  readonly VITE_APP_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 全局API配置
declare global {
  interface Window {
    API_BASE_URL: string;
  }
}
