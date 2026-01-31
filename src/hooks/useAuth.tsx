import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { apiFetch } from '@/lib/apiClient';

type AppRole = 'super_admin' | 'admin' | 'instructor' | 'trainee';

interface AuthContextType {
  user: any | null;
  session: { token: string } | null;
  role: AppRole | null;
  profile: {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
    avatar_url?: string;
  } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role?: AppRole) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<{ token: string } | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<AuthContextType['profile']>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const resp: any = await apiFetch('/api/profile');
      setProfile(resp.profile || null);
      // role is not implemented server-side yet; keep null for now
      setRole((resp as any).role || null);
    } catch (error) {
      logger.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setSession({ token });
      apiFetch('/api/auth/me').then((data: any) => {
        setUser(data.user);
      }).catch((err) => {
        console.error('Error validating token', err);
        localStorage.removeItem('token');
        setSession(null);
        setUser(null);
      }).finally(() => {
        fetchUserData();
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    const resp: any = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    localStorage.setItem('token', resp.token);
    setSession({ token: resp.token });
    setUser(resp.user);
    await fetchUserData();
  };

  const signUp = async (email: string, password: string, fullName: string, role: AppRole = 'trainee') => {
    const resp: any = await apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name: fullName }) });
    localStorage.setItem('token', resp.token);
    setSession({ token: resp.token });
    setUser(resp.user);
    await fetchUserData();
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    setUser(null);
    setSession(null);
    setRole(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    await fetchUserData();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
