export interface MiroConfig {
  contexts: MiroContext[];
  defaultContext: string;
}

export interface MiroApp {
  clientId: string;
  clientSecret?: string; 
}

export interface MiroContext {
  name: string;
  env: string;
  organizationId: string;
  app: MiroApp;
}

export interface RootOptions {
  context?: string
}

export interface ResolvedMiroContext extends MiroContext {
  
}

export interface MiroSettings {
  cliPort: number;
  envs: MiroEnv[];
}

export interface MiroEnv {
  name: string;
  apiUrl: string;
}

export interface AuthenticatedContext {
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: Date,
}

export interface SessionState {
  userId: string,
  expiresAt: Date,
  expired: boolean,
}

export interface StoredSession {
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: Date,
}