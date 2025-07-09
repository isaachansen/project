export interface AppConfig {
  slack: {
    enabled: boolean;
  };
}

export function getAppConfig(): AppConfig {
  return {
    slack: {
      enabled: import.meta.env.VITE_SLACK_ENABLED === "true",
    },
  };
}
