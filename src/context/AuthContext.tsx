import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  tenantId: string;
  tenantName?: string;
  branchId: string;
}

interface AuthContextValue {
  token: string | null;
  user:  AuthUser | null;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  token:   null,
  user:    null,
  isReady: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token,   setToken]   = useState<string | null>(null);
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const requested = useRef(false);

  const handleMessage = useCallback((event: MessageEvent) => {
    if (!event.data?.type) return;

    if (event.data.type === 'AUTH_DATA' && event.data.token && event.data.user) {
      const currentToken = localStorage.getItem('_at');
      // Solo actualizar si el token cambió
      if (currentToken !== event.data.token) {
        localStorage.removeItem('_at');
        localStorage.setItem('_at', event.data.token);
        setToken(event.data.token);
        setUser(event.data.user);
      }
      setIsReady(true);
    }

    if (event.data.type === 'AUTH_LOGOUT') {
      localStorage.removeItem('_at');
      setToken(null);
      setUser(null);
      setIsReady(false);
      window.parent.postMessage({ type: 'LOGOUT_CONFIRMED' }, '*');
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleMessage);

    if (!requested.current) {
      requested.current = true;
      window.parent.postMessage({ type: 'REQUEST_AUTH' }, '*');
    }

    // Timeout 3s — si el padre no responde, mostrar UI igual
    const t = setTimeout(() => setIsReady(true), 3000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(t);
    };
  }, [handleMessage]);

  return (
    <AuthContext.Provider value={{ token, user, isReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
