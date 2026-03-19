"use client"

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Renzas <span className="text-emerald-400">Finanças</span></h1>
        <p className="text-emerald-300/60 text-sm mt-1">Controle inteligente do seu dinheiro</p>
      </div>
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Entrar</CardTitle>
          <CardDescription>Acesse sua conta para gerenciar suas finanças</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="nome@exemplo.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {loginError && <p className="text-sm text-red-500">Credenciais inválidas. Tente novamente.</p>}
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoggingIn}>
              {isLoggingIn ? 'Entrando...' : 'Acessar Conta'}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground w-full text-center">
            Ainda não tem uma conta? <Link href="/register" className="text-emerald-600 hover:underline">Cadastre-se</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
