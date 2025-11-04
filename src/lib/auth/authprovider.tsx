import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { keycloak } from './keycloak';

type AuthContextType = {
  initialized: boolean;
  authenticated: boolean;
  token?: string;
  profile?: Keycloak.KeycloakProfile | null;
  login: () => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
  bootAuthenticated: boolean;
}> = ({ children, bootAuthenticated }) => {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(bootAuthenticated);
  const [profile, setProfile] = useState<Keycloak.KeycloakProfile | null>(null);

  const refreshTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    async function afterInit() {
      try {
        if (authenticated) {
          try {
            const p = await keycloak.loadUserProfile();
            if (!cancelled) setProfile(p);
          } catch {
            /* ignore profile load failure */
          }
          const schedule = async () => {
            try {
              await keycloak.updateToken(60);
            } catch {
              if (!cancelled) {
                setAuthenticated(false);
              }
            } finally {
              if (!cancelled) {
                const expMs = keycloak.tokenParsed?.exp
                  ? keycloak.tokenParsed.exp * 1000
                  : Date.now() + 60000;
                const delay = Math.max(10000, expMs - Date.now() - 45000);
                refreshTimerRef.current = window.setTimeout(
                  schedule,
                  delay
                ) as unknown as number;
              }
            }
          };

          schedule();
        }
      } finally {
        if (!cancelled) setInitialized(true);
      }
    }

    afterInit();

    return () => {
      cancelled = true;
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }
    };
  }, [authenticated]);

  const value = useMemo<AuthContextType>(
    () => ({
      initialized,
      authenticated,
      token: keycloak.token ?? undefined,
      profile,
      login: () =>
        keycloak.login({
          redirectUri: window.location.href,
        }),
      logout: () =>
        keycloak.logout({
          redirectUri: window.location.origin,
        }),
      hasRole: (role: string) => {
        const realmRoles = keycloak?.realmAccess?.roles ?? [];
        const clientRoles = Object.values(
          keycloak.resourceAccess ?? {}
        ).flatMap((r) => r?.roles ?? []);
        return realmRoles.includes(role) || clientRoles.includes(role);
      },
    }),
    [initialized, authenticated, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
