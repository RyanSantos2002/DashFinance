import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';

import { Loader2 } from 'lucide-react';
import { useAuth } from './AuthProvider';

export const SubscriptionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useStore();
    const { loading: authLoading } = useAuth();
    const location = useLocation();

    // 1. Se o AuthProvider ainda está resolvendo a sessão ou o perfil, esperamos.
    // Isso impede redirecionamentos precipitados antes do perfil existir no Zustand.
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    // 2. Se não tem usuário e não está carregando, o AuthGuard cuidaria disso, 
    // mas por segurança, evitamos renderizar o conteúdo.
    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Lógica de Assinatura
    const isPremium = currentUser.isPremium === true;
    const trialStart = currentUser.trialStart ? new Date(currentUser.trialStart) : new Date();
    const now = new Date();
    const hoursSinceStart = (now.getTime() - trialStart.getTime()) / (1000 * 60 * 60);

    const isTrialExpired = !isPremium && hoursSinceStart > 24;

    // 4. Evita loop: Se já estivermos na página de planos, não redireciona.
    if (isTrialExpired && location.pathname !== '/plan') {
        return <Navigate to="/plan" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};