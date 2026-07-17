export const ENV = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string ?? 'http://localhost:8080',
  appTitle: import.meta.env.VITE_APP_TITLE as string ?? 'Kommunale Entscheidungsplattform',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  enableMocks: import.meta.env.VITE_ENABLE_MOCKS === 'true',
} as const;
