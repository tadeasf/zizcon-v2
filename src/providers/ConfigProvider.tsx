'use client';

import { useEffect } from 'react';
import { useConfigStore } from '@/stores/configStore';

interface ConfigProviderProps {
  children: React.ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const { loadConfig, validateConfig, isLoaded, loadError } = useConfigStore();

  useEffect(() => {
    const initConfig = async () => {
      await loadConfig();
      validateConfig();
    };

    initConfig();
  }, [loadConfig, validateConfig]);

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md p-6 bg-card rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-destructive mb-4">Configuration Error</h2>
          <p className="text-muted-foreground">{loadError}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading configuration...</div>
      </div>
    );
  }

  return children;
} 