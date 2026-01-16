import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Session } from '@supabase/supabase-js';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const location = useLocation();
    const { setCurrentUser } = useStore();

    useEffect(() => {
        const syncUser = async (session: Session) => {
            if (!session?.user) return;
            
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                
                setCurrentUser({
                    id: session.user.id,
                    name: profile?.full_name || session.user.user_metadata.full_name || 'Usuário',
                    avatar: profile?.avatar_url || session.user.user_metadata.avatar_url,
                    isPremium: profile?.is_premium,
                    trialStart: profile?.trial_start,
                });
            } catch (error) {
                console.error("Profile sync error (background):", error);
                 setCurrentUser({
                    id: session.user.id,
                    name: session.user.user_metadata.full_name || 'Usuário',
                    avatar: session.user.user_metadata.avatar_url,
                });
            }
        };

        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session) {
                    setIsAuthenticated(true);
                    syncUser(session); 
                } else {
                    setIsAuthenticated(false);
                    setCurrentUser(null);
                }
            } catch (error) {
                console.error("Auth Check Error:", error);
                setIsAuthenticated(false);
                setCurrentUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
             if (session) {
                 setIsAuthenticated(true);
                 syncUser(session);
             } else {
                 setIsAuthenticated(false);
                 setCurrentUser(null);
             }
             setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [setCurrentUser]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};
