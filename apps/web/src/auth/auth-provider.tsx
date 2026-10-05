'use client';

import type { KeycloakInstance } from 'keycloak-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getKeycloakSession } from './keycloak-session';

interface AuthContextValue {
  isLoading: boolean;
  isAuthenticated: boolean;
  userName?: string;
  error?: string;
  login: () => Promise<void>;
  register: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const keycloakRef = useRef<KeycloakInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>();
  const [error, setError] = useState<string>();

  const endLocalSession = useCallback(() => {
    keycloakRef.current?.clearToken();
    setIsAuthenticated(false);
    setUserName(undefined);
  }, []);

  const refresh = useCallback(async (minimumValidity = 30): Promise<void> => {
    const keycloak = keycloakRef.current;
    if (!keycloak?.authenticated) throw new Error('You are signed out. Please sign in again.');
    try {
      // Keycloak exchanges its in-memory refresh token for a new access token when needed.
      await keycloak.updateToken(minimumValidity);
    } catch {
      endLocalSession();
      throw new Error('Your session expired. Please sign in again.');
    }
  }, [endLocalSession]);

  useEffect(() => {
    let active = true;
    const { keycloak, initialized } = getKeycloakSession();
    keycloakRef.current = keycloak;

    keycloak.onTokenExpired = () => {
      if (active) void refresh(30).catch(() => undefined);
    };

    void initialized.then(() => {
      if (!active) return;
      setIsAuthenticated(Boolean(keycloak.authenticated));
      setUserName(keycloak.tokenParsed?.preferred_username ?? keycloak.tokenParsed?.name);
      setIsLoading(false);
    }).catch(() => {
      if (!active) return;
      setError('Could not connect to the identity provider. Check that Keycloak is running.');
      setIsLoading(false);
    });

    const refreshTimer = window.setInterval(() => {
      if (keycloak.authenticated) void refresh(45).catch(() => undefined);
    }, 30_000);

    return () => {
      active = false;
      window.clearInterval(refreshTimer);
      keycloak.onTokenExpired = undefined;
      keycloakRef.current = null;
    };
  }, [refresh]);

  const login = useCallback(async () => {
    setError(undefined);
    await keycloakRef.current?.login();
  }, []);

  const register = useCallback(async () => {
    setError(undefined);
    await keycloakRef.current?.register();
  }, []);

  const logout = useCallback(async () => {
    const keycloak = keycloakRef.current;
    if (!keycloak) return;
    await keycloak.logout({ redirectUri: window.location.origin });
  }, []);

  const getAccessToken = useCallback(async () => {
    await refresh(30);
    const token = keycloakRef.current?.token;
    if (!token) throw new Error('No access token is available. Please sign in again.');
    return token;
  }, [refresh]);

  const value = useMemo(() => ({
    isLoading,
    isAuthenticated,
    userName,
    error,
    login,
    register,
    logout,
    getAccessToken,
  }), [isLoading, isAuthenticated, userName, error, login, register, logout, getAccessToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
