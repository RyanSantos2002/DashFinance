import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import type { Session } from '@supabase/supabase-js';

interface AuthContextData {
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({
  session: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { setCurrentUser } = useStore();

  useEffect(() => {
    let mounted = true;

    const fetchProfileAndSetUser = async (session: Session | null) => {
        if (!session?.user) {
            if (mounted) setCurrentUser(null);
            return;
        }

        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            
            if (mounted) {
                setCurrentUser({
                    id: session.user.id,
                    name: profile?.full_name || session.user.user_metadata.full_name || 'Usuário',
                    avatar: profile?.avatar_url || session.user.user_metadata.avatar_url,
                    isPremium: profile?.is_premium,
                    trialStart: profile?.trial_start
                });
            }
        } catch (e) {
            console.error('Profile fetch failed:', e);
            if (mounted) {
                setCurrentUser({
                    id: session.user.id,
                    name: session.user.user_metadata.full_name || 'Usuário',
                    avatar: session.user.user_metadata.avatar_url,
                });
            }
        }
    };

    const init = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log("AuthProvider: Init session", data.session?.user?.id); // DEBUG
        if (mounted) {
            setSession(data.session);
            await fetchProfileAndSetUser(data.session);
        }
      } catch (error) {
        console.error('AuthProvider: Init failed', error);
      } finally {
        console.log("AuthProvider: Init finished, loading false"); // DEBUG
        if (mounted) setLoading(false);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AuthProvider: Auth event", event, session?.user?.id); // DEBUG
      if (mounted) {
        setSession(session);
        await fetchProfileAndSetUser(session);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setCurrentUser]);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
