import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tractor, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import heroImage from "@/assets/hero-farm.jpg";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
  fullName: z.string().trim().min(3, { message: "Nome deve ter no mínimo 3 caracteres" }).optional()
});

const Login = () => {
  const navigate = useNavigate();
  const { signUp, signIn, loading: authLoading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Verificar se já está autenticado
    const checkAuth = async () => {
      const user = localStorage.getItem("currentUser");
      if (user) {
        navigate("/");
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar entrada
      const validation = authSchema.safeParse({ 
        email, 
        password, 
        fullName: isSignUp ? fullName : undefined 
      });

      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setLoading(false);
        return;
      }

      if (isSignUp) {
        // Cadastro
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast.error(error);
          return;
        }
        
        toast.success("Cadastro realizado com sucesso! Verifique seu email para confirmar a conta.");
        setIsSignUp(false);
        setEmail("");
        setPassword("");
        setFullName("");
      } else {
        // Login
        const { data, error } = await signIn(email, password);
        if (error) {
          toast.error(error);
          return;
        }
        
        if (data.user) {
          // Salvar informações do usuário no localStorage
          localStorage.setItem("currentUser", JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            fullName: data.user.user_metadata?.full_name || "Usuário"
          }));
          
          toast.success("Login realizado com sucesso!");
          navigate("/");
        }
      }
    } catch (error: any) {
      toast.error("Ocorreu um erro. Tente novamente.");
      console.error("Auth error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-field opacity-80"></div>
      </div>

      {/* Auth Card */}
      <Card className="w-full max-w-md mx-4 relative z-10 shadow-strong border-primary/20 animate-fade-in">
        <CardHeader className="space-y-4 text-center">
          <CardTitle className="text-3xl font-bold text-primary">Orma</CardTitle>
          <CardDescription className="text-base">
            {isSignUp ? "Crie sua conta" : "Sistema de Gestão Agrícola"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-6">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="border-primary/30 focus:border-primary"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-primary/30 focus:border-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-primary/30 focus:border-primary pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              variant="default"
              disabled={loading || authLoading}
            >
              {loading || authLoading ? "Processando..." : (isSignUp ? "Cadastrar" : "Entrar")}
            </Button>
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary"
              >
                {isSignUp ? "Já tem conta? Fazer login" : "Não tem conta? Cadastre-se"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;