"use client"

import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, X, Plus } from 'lucide-react';

export function EditTransactionDialog({ transaction }: { transaction: any }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const [description, setDescription] = useState(transaction.description);
  const [date, setDate] = useState(new Date(transaction.date).toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState(transaction.category?.id || '');
  const [subcategoryId, setSubcategoryId] = useState(transaction.subcategory?.id || '');
  const [error, setError] = useState('');
  
  const [isCreatingSub, setIsCreatingSub] = useState(false);
  const [newSubName, setNewSubName] = useState('');

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
    mutationFn: async (data: any) => await api.patch(`/transactions/${transaction.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setOpen(false);
      setError('');
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message || 'Erro ao atualizar transação.');
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
    mutation.mutate({
      description,
      date: new Date(date).toISOString(),
      categoryId: categoryId || undefined,
      subcategoryId: subcategoryId || undefined,
    });
  };

  const selectClass = "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none cursor-pointer transition-colors";

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full"
      >
        <Pencil className="h-4 w-4" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

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
                <h3 className="text-xl font-bold text-slate-900">Editar Transação</h3>
                <p className="text-sm text-slate-500 mt-1 break-words whitespace-normal leading-relaxed pr-2">
                  Nota: Valor e conta bancária não podem ser alterados para manter a integridade do saldo.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {error && (
                  <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}

                {/* Type + Amount (Disabled) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium flex justify-between">Operação <span className="text-xs text-slate-400 font-normal">(Inalterável)</span></Label>
                    <select disabled value={transaction.type} className={selectClass + " bg-slate-50 opacity-70 text-slate-500"}>
                      <option value="EXPENSE">Despesa (Saída)</option>
                      <option value="INCOME">Receita (Entrada)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium flex justify-between">Valor (R$) <span className="text-xs text-slate-400 font-normal">(Inalterável)</span></Label>
                    <Input
                      disabled
                      value={transaction.amount}
                      className="bg-slate-50 opacity-70 text-slate-500 border-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Descrição</Label>
                  <Input
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>

                {/* Account + Payment Method (Disabled) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium flex justify-between">Carteira <span className="text-xs text-slate-400 font-normal">(Inalterável)</span></Label>
                    <Input disabled value={transaction.account?.name || ''} className="bg-slate-50 opacity-70 text-slate-500 border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium flex justify-between">Método <span className="text-xs text-slate-400 font-normal">(Inalterável)</span></Label>
                    <select disabled value={transaction.paymentMethod} className={selectClass + " bg-slate-50 opacity-70 text-slate-500"}>
                      <option value="PIX">Pix / TED / Boleto</option>
                      <option value="DEBIT_CARD">Cartão de Débito</option>
                      <option value="CREDIT_CARD">Cartão de Crédito</option>
                    </select>
                  </div>
                </div>

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
                            placeholder="Nome..."
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
                            className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 h-[42px] px-3 shadow-none"
                          >
                            {createSubMutation.isPending ? '...' : 'Salvar'}
                          </Button>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => { setIsCreatingSub(false); setNewSubName(''); }}
                            className="h-[42px] px-2 text-slate-400 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <select value={subcategoryId || ''} onChange={e => setSubcategoryId(e.target.value)} className={selectClass}>
                          <option value="">Padrão da Categoria</option>
                          {subcategories?.map((sc: any) => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                        </select>
                      )}
                    </div>
                  )}
                </div>

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

                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3 text-base rounded-xl transition-all active:scale-[0.98]"
                >
                  {mutation.isPending ? 'Salvando...' : '✓ Salvar Alterações'}
                </Button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
