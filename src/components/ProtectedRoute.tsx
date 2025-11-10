import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar sessão no Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Se há sessão mas não tem usuário no localStorage, atualizar
          const user = localStorage.getItem("currentUser");
          if (!user) {
            localStorage.setItem("currentUser", JSON.stringify({
              id: session.user.id,
              email: session.user.email,
              fullName: session.user.user_metadata?.full_name || "Usuário"
            }));
          }
          setIsAuthenticated(true);
        } else {
          // Não há sessão ativa
          localStorage.removeItem("currentUser");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        localStorage.removeItem("currentUser");
        setIsAuthenticated(false);
      }
    };

    checkAuth();

    // Ouvir mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN' && session) {
          // Usuário fez login
          localStorage.setItem("currentUser", JSON.stringify({
            id: session.user.id,
            email: session.user.email,
            fullName: session.user.user_metadata?.full_name || "Usuário"
          }));
          setIsAuthenticated(true);
        } else if (event === 'SIGNED_OUT') {
          // Usuário fez logout
          localStorage.removeItem("currentUser");
          setIsAuthenticated(false);
        } else if (event === 'TOKEN_REFRESHED') {
          // Token foi atualizado, manter autenticado
          setIsAuthenticated(true);
        } else if (event === 'USER_UPDATED') {
          // Informações do usuário foram atualizadas
          if (session) {
            localStorage.setItem("currentUser", JSON.stringify({
              id: session.user.id,
              email: session.user.email,
              fullName: session.user.user_metadata?.full_name || "Usuário"
            }));
          }
        }
      }
    );

    // Cleanup da subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Estado de carregamento
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span className="ml-3 text-lg">Verificando autenticação...</span>
      </div>
    );
  }

  // Redirecionar para login se não autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Renderizar children se autenticado
  return <>{children}</>;
};

export default ProtectedRoute;