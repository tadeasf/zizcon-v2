import { create, StateCreator } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';

interface Auth0Config {
  domain: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  audience: string;
  mgmtIdentifier: string;
  callbackUrl: string;
  postLogoutRedirectUri: string;
  secret: string;
}

interface DirectusConfig {
  url: string;
  token: string;
  adminEmail: string;
  adminPassword: string;
  internalUrl?: string;
}

interface AppConfig {
  baseUrl: string;
  environment: 'development' | 'production';
}

interface ConfigState {
  isLoaded: boolean;
  loadError: string | null;
  auth0: Auth0Config | null;
  directus: DirectusConfig | null;
  app: AppConfig | null;
  // Actions
  loadConfig: () => Promise<void>;
  validateConfig: () => boolean;
  getAuth0Config: () => Auth0Config;
  getDirectusConfig: () => DirectusConfig;
  getAppConfig: () => AppConfig;
}

const REQUIRED_ENV_VARS = [
  'AUTH0_DOMAIN',
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET',
  'AUTH0_SCOPE',
  'AUTH0_AUDIENCE',
  'AUTH0_MGMT_IDENTIFIER',
  'AUTH0_CALLBACK_URL',
  'AUTH0_POST_LOGOUT_REDIRECT_URI',
  'AUTH0_SECRET',
  'NEXT_PUBLIC_DIRECTUS_URL',
  'DIRECTUS_STATIC_TOKEN',
  'NEXT_PUBLIC_APP_URL',
] as const;

type ConfigStorePersist = (
  config: StateCreator<ConfigState, [], []>,
  options: PersistOptions<ConfigState>
) => StateCreator<ConfigState, [], []>;

const getEnvOrDefault = (key: string, defaultValue: string = ''): string => {
  const value = process.env[key];
  if (!value && defaultValue === '') {
    console.warn(`Environment variable ${key} is not set`);
  }
  return value || defaultValue;
};

const DEFAULT_CONFIG = {
  auth0: {
    domain: getEnvOrDefault('AUTH0_DOMAIN'),
    clientId: getEnvOrDefault('AUTH0_CLIENT_ID'),
    clientSecret: getEnvOrDefault('AUTH0_CLIENT_SECRET'),
    scope: getEnvOrDefault('AUTH0_SCOPE', 'openid profile email'),
    audience: getEnvOrDefault('AUTH0_AUDIENCE'),
    mgmtIdentifier: getEnvOrDefault('AUTH0_MGMT_IDENTIFIER'),
    callbackUrl: getEnvOrDefault('AUTH0_CALLBACK_URL'),
    postLogoutRedirectUri: getEnvOrDefault('AUTH0_POST_LOGOUT_REDIRECT_URI'),
    secret: getEnvOrDefault('AUTH0_SECRET'),
  },
  directus: {
    url: getEnvOrDefault('NEXT_PUBLIC_DIRECTUS_URL'),
    token: getEnvOrDefault('DIRECTUS_STATIC_TOKEN'),
    adminEmail: getEnvOrDefault('DIRECTUS_ADMIN_EMAIL', 'admin@example.com'),
    adminPassword: getEnvOrDefault('DIRECTUS_ADMIN_PASSWORD', 'admin123'),
    internalUrl: getEnvOrDefault('DIRECTUS_INTERNAL_URL'),
  },
  app: {
    baseUrl: getEnvOrDefault('NEXT_PUBLIC_APP_URL'),
    environment: (process.env.NODE_ENV as 'development' | 'production') || 'development',
  }
} as const;

export const useConfigStore = create<ConfigState>()(
  (persist as ConfigStorePersist)(
    (set, get) => ({
      isLoaded: true, // Start with true since we have defaults
      loadError: null,
      auth0: DEFAULT_CONFIG.auth0,
      directus: DEFAULT_CONFIG.directus,
      app: DEFAULT_CONFIG.app,

      loadConfig: async () => {
        try {
          // Validate required environment variables
          const missingVars = REQUIRED_ENV_VARS.filter(
            (key) => !process.env[key]
          );

          if (missingVars.length > 0) {
            console.warn(`Missing environment variables: ${missingVars.join(', ')}`);
          }

          // Load Auth0 config
          const auth0Config: Auth0Config = {
            domain: getEnvOrDefault('AUTH0_DOMAIN'),
            clientId: getEnvOrDefault('AUTH0_CLIENT_ID'),
            clientSecret: getEnvOrDefault('AUTH0_CLIENT_SECRET'),
            scope: getEnvOrDefault('AUTH0_SCOPE', 'openid profile email'),
            audience: getEnvOrDefault('AUTH0_AUDIENCE'),
            mgmtIdentifier: getEnvOrDefault('AUTH0_MGMT_IDENTIFIER'),
            callbackUrl: getEnvOrDefault('AUTH0_CALLBACK_URL'),
            postLogoutRedirectUri: getEnvOrDefault('AUTH0_POST_LOGOUT_REDIRECT_URI'),
            secret: getEnvOrDefault('AUTH0_SECRET'),
          };

          // Load Directus config
          const directusConfig: DirectusConfig = {
            url: getEnvOrDefault('NEXT_PUBLIC_DIRECTUS_URL'),
            token: getEnvOrDefault('DIRECTUS_STATIC_TOKEN'),
            adminEmail: getEnvOrDefault('DIRECTUS_ADMIN_EMAIL', 'admin@example.com'),
            adminPassword: getEnvOrDefault('DIRECTUS_ADMIN_PASSWORD', 'admin123'),
            internalUrl: getEnvOrDefault('DIRECTUS_INTERNAL_URL'),
          };

          // Load App config
          const appConfig: AppConfig = {
            baseUrl: getEnvOrDefault('NEXT_PUBLIC_APP_URL'),
            environment: (process.env.NODE_ENV as 'development' | 'production') || 'development',
          };

          set({
            isLoaded: true,
            loadError: null,
            auth0: auth0Config,
            directus: directusConfig,
            app: appConfig,
          });
        } catch (error) {
          console.error('Error loading configuration:', error);
          set({
            loadError: error instanceof Error ? error.message : 'Failed to load configuration',
            // Keep the existing config instead of setting to null
            isLoaded: true,
          });
        }
      },

      validateConfig: () => {
        const state = get();
        let isValid = true;
        const errors: string[] = [];

        // Validate Auth0 domain format
        if (state.auth0?.domain) {
          const domainPattern = /^[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+\.auth0\.com$/;
          if (!domainPattern.test(state.auth0.domain)) {
            errors.push('Invalid Auth0 domain format');
            isValid = false;
          }
        }

        // Validate URLs
        try {
          if (state.auth0?.callbackUrl) new URL(state.auth0.callbackUrl);
          if (state.auth0?.postLogoutRedirectUri) new URL(state.auth0.postLogoutRedirectUri);
          if (state.directus?.url) new URL(state.directus.url);
          if (state.app?.baseUrl) new URL(state.app.baseUrl);
        } catch {
          errors.push('Invalid URL format in configuration');
          isValid = false;
        }

        if (!isValid) {
          set({ loadError: errors.join(', ') });
        }

        return isValid;
      },

      getAuth0Config: () => {
        const state = get();
        return state.auth0 || DEFAULT_CONFIG.auth0;
      },

      getDirectusConfig: () => {
        const state = get();
        return state.directus || DEFAULT_CONFIG.directus;
      },

      getAppConfig: () => {
        const state = get();
        return state.app || DEFAULT_CONFIG.app;
      },
    }),
    {
      name: 'config-storage',
      skipHydration: true // Important for SSR
    }
  )
); 