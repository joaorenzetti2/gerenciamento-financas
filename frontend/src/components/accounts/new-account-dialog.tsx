"use client"

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

export function NewAccountDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [institution, setInstitution] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/accounts', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setOpen(false);
      setName(''); setBalance(''); setInstitution(''); setError('');
    },
    onError: (err: any) => {
      console.error('Erro ao criar carteira:', err);
      setError(err?.response?.data?.message || 'Erro ao criar carteira. Tente novamente.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Nome é obrigatório'); return; }
    if (!balance) { setError('Saldo é obrigatório'); return; }
    mutation.mutate({ name: name.trim(), balance: Number(balance), institution: institution.trim() });
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-md px-6 transition-all active:scale-95"
      >
        <Plus className="h-4 w-4 mr-2" /> Nova Carteira
      </Button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-emerald-100 relative">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="p-6 border-b border-emerald-100">
                <h3 className="text-xl font-bold text-slate-900">Adicionar Carteira</h3>
                <p className="text-sm text-slate-500 mt-1">Crie uma nova conta bancária ou espaço para seu dinheiro.</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {error && (
                  <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="acc-name" className="text-slate-700 font-medium">Nome da Carteira</Label>
                  <Input
                    id="acc-name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Nubank, Bradesco..."
                    required
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acc-balance" className="text-slate-700 font-medium">Saldo Inicial (R$)</Label>
                  <Input
                    id="acc-balance"
                    type="number"
                    step="0.01"
                    value={balance}
                    onChange={e => setBalance(e.target.value)}
                    placeholder="0.00"
                    required
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acc-inst" className="text-slate-700 font-medium">Instituição/Anotação (Opcional)</Label>
                  <Input
                    id="acc-inst"
                    value={institution}
                    onChange={e => setInstitution(e.target.value)}
                    placeholder="Nubank, Itaú, Carteira..."
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-md py-3 text-base font-semibold rounded-xl transition-all active:scale-[0.98]"
                >
                  {mutation.isPending ? 'Cadastrando...' : '✓ Criar Carteira'}
                </Button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
