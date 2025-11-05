import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tractor } from "lucide-react";
import { toast } from "sonner";
import heroImage from "@/assets/hero-farm.jpg";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres" }),
  fullName: z.string().trim().min(3, { message: "Nome deve ter no mínimo 3 caracteres" }).optional()
});

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redireciona se já estiver logado
    const user = localStorage.getItem("currentUser");
    if (user) {
      navigate("/");
    }
  }, [navigate]);

  const handleAuth = (e: React.FormEvent) => {
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

      const users = JSON.parse(localStorage.getItem("users") || "[]");

      if (isSignUp) {
        // Cadastro
        const userExists = users.find((u: any) => u.email === email);
        if (userExists) {
          toast.error("Usuário já cadastrado");
          setLoading(false);
          return;
        }

        const newUser = {
          id: Date.now().toString(),
          email: validation.data.email,
          password: validation.data.password,
          fullName: fullName || "Usuário",
          createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        toast.success("Cadastro realizado com sucesso! Você já pode fazer login.");
        setIsSignUp(false);
        setEmail("");
        setPassword("");
        setFullName("");
      } else {
        // Login
        const user = users.find((u: any) => u.email === email && u.password === password);
        
        if (!user) {
          toast.error("Email ou senha incorretos");
          setLoading(false);
          return;
        }

        localStorage.setItem("currentUser", JSON.stringify(user));
        toast.success("Login realizado com sucesso!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error("Ocorreu um erro. Tente novamente.");
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
          <div className="mx-auto bg-primary rounded-full p-4 w-20 h-20 flex items-center justify-center shadow-medium">
            <Tractor className="w-10 h-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Orna</CardTitle>
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
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-primary/30 focus:border-primary"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              variant="default"
              disabled={loading}
            >
              {loading ? "Processando..." : (isSignUp ? "Cadastrar" : "Entrar")}
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
