"use client"

import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

export function NewTransactionDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const [type, setType] = useState('EXPENSE');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [error, setError] = useState('');
  
  // Inline subcategory creation state
  const [isCreatingSub, setIsCreatingSub] = useState(false);
  const [newSubName, setNewSubName] = useState('');

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => (await api.get('/accounts')).data,
    enabled: open,
  });
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data,
    enabled: open,
  });
  const { data: subcategories } = useQuery({
    queryKey: ['subcategories', categoryId],
    queryFn: async () => (await api.get(`/categories/${categoryId}/subcategories`)).data,
    enabled: !!categoryId,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => await api.post('/transactions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setOpen(false);
      setAmount(''); setDescription(''); setCategoryId(''); setSubcategoryId(''); setAccountId(''); setError('');
      setIsCreatingSub(false); setNewSubName('');
    },
    onError: (err: any) => {
      console.error('Erro ao criar transação:', err);
      setError(err?.response?.data?.message || 'Erro ao criar transação. Tente novamente.');
    }
  });

  const createSubMutation = useMutation({
    mutationFn: async (name: string) => await api.post(`/categories/${categoryId}/subcategories`, { name }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['subcategories', categoryId] });
      setSubcategoryId(res.data.id);
      setIsCreatingSub(false);
      setNewSubName('');
    },
    onError: () => {
      setError('Erro ao criar subcategoria. Tente novamente.');
      setIsCreatingSub(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!accountId) { setError('Selecione uma carteira'); return; }
    if (!amount) { setError('Informe o valor'); return; }
    mutation.mutate({
      type,
      amount: Number(amount),
      description,
      date: new Date(date).toISOString(),
      accountId,
      categoryId: categoryId || undefined,
      subcategoryId: subcategoryId || undefined,
      paymentMethod,
    });
  };

  const selectClass = "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer transition-colors";

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-emerald-700 hover:bg-emerald-800 text-white shadow-md px-6 transition-all active:scale-95"
      >
        <Plus className="h-4 w-4 mr-2" /> Novo Lançamento
      </Button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-emerald-100 relative max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="p-6 border-b border-emerald-100 sticky top-0 bg-white rounded-t-2xl">
                <h3 className="text-xl font-bold text-slate-900">Nova Transação</h3>
                <p className="text-sm text-slate-500 mt-1">Cadastre movimentos na sua carteira.</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {error && (
                  <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}

                {/* Type + Amount */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Operação</Label>
                    <select value={type} onChange={e => setType(e.target.value)} className={selectClass}>
                      <option value="EXPENSE">Despesa (Saída)</option>
                      <option value="INCOME">Receita (Entrada)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Valor (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0.00"
                      required
                      className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Descrição</Label>
                  <Input
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Ex: Mercado Livre, Salário..."
                    required
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>

                {/* Account + Payment Method */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Carteira</Label>
                    <select value={accountId} onChange={e => setAccountId(e.target.value)} required className={selectClass}>
                      <option value="">Selecione...</option>
                      {accounts?.map((a: any) => (
                        <option key={a.id} value={a.id}>
                          {a.name} (R$ {Number(a.balance).toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Método</Label>
                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className={selectClass}>
                      <option value="PIX">Pix / TED / Boleto</option>
                      <option value="DEBIT_CARD">Cartão de Débito</option>
                      <option value="CREDIT_CARD">Cartão de Crédito</option>
                    </select>
                  </div>
                </div>

                {/* Category + Subcategory */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Categoria</Label>
                    <select
                      value={categoryId}
                      onChange={e => { setCategoryId(e.target.value); setSubcategoryId(''); }}
                      className={selectClass}
                    >
                      <option value="">(Nenhuma)</option>
                      {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  {categoryId && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-slate-700 font-medium">Subcategoria</Label>
                        {!isCreatingSub && (
                          <button 
                            type="button" 
                            onClick={() => setIsCreatingSub(true)}
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center transition-colors"
                          >
                            <Plus className="h-3 w-3 mr-1" /> Nova
                          </button>
                        )}
                      </div>

                      {isCreatingSub ? (
                        <div className="flex gap-2">
                          <Input 
                            value={newSubName} 
                            onChange={e => setNewSubName(e.target.value)} 
                            placeholder="Ex: Pão de Açúcar..."
                            className="border-slate-200 focus:border-emerald-500 text-sm h-[42px]"
                            autoFocus
                          />
                          <Button 
                            type="button" 
                            onClick={() => {
                              if (newSubName.trim()) createSubMutation.mutate(newSubName.trim());
                              else setIsCreatingSub(false);
                            }}
                            disabled={createSubMutation.isPending}
                            className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:text-emerald-800 h-[42px] px-3 transition-colors shadow-none"
                          >
                            {createSubMutation.isPending ? '...' : 'Salvar'}
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => { setIsCreatingSub(false); setNewSubName(''); }}
                            className="h-[42px] px-2 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <select value={subcategoryId} onChange={e => setSubcategoryId(e.target.value)} className={selectClass}>
                          <option value="">Padrão da Categoria</option>
                          {subcategories?.map((sc: any) => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                        </select>
                      )}
                    </div>
                  )}
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Data</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-md py-3 text-base font-semibold rounded-xl transition-all active:scale-[0.98]"
                >
                  {mutation.isPending ? 'Salvando...' : '✓ Confirmar Lançamento'}
                </Button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
