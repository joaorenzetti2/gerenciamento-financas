"use client"

import DashboardLayout from '../dashboard/layout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NewTransactionDialog } from '@/components/transactions/new-transaction-dialog';
import { EditTransactionDialog } from '@/components/transactions/edit-transaction-dialog';
import { Trash2 } from 'lucide-react';

export default function TransactionsPage() {
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await api.get('/transactions');
      return res.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });

  const paymentMethodMap: Record<string, string> = {
    PIX: 'Pix / TED / Boleto',
    DEBIT_CARD: 'Cartão de Débito',
    CREDIT_CARD: 'Cartão de Crédito'
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Transações</h1>
          <p className="text-muted-foreground mt-1">Histórico completo de lançamentos e faturas ativas.</p>
        </div>
        <NewTransactionDialog />
      </div>

      <div className="border rounded-md bg-white dark:bg-slate-950 shadow-sm animate-in fade-in duration-700">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-900/50">
              <TableHead className="w-[120px]">Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Conta / Método</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-[100px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                  <div className="animate-pulse flex gap-2 items-center justify-center">
                    <div className="h-4 w-4 rounded-full bg-emerald-400"></div>
                    <div className="h-4 w-4 rounded-full bg-emerald-400"></div>
                    <div className="h-4 w-4 rounded-full bg-emerald-400"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : transactions?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Nenhuma transação encontrada no seu banco de dados.</TableCell></TableRow>
            ) : (
              transactions?.map((t: any) => (
                <TableRow key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <TableCell className="text-slate-500">{new Date(t.date).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="font-medium text-slate-800 dark:text-slate-200">{t.description}</TableCell>
                  <TableCell>
                    <span 
                      style={{ borderLeftColor: t.category?.color || '#ccc' }} 
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border-l-4 rounded-r-md text-xs font-medium"
                    >
                      {t.category?.name || 'Geral'}
                    </span>
                    {t.subcategory && <span className="ml-2 text-xs text-slate-400">({t.subcategory.name})</span>}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold">{t.account?.name}</span>
                    <br/><span className="text-[10px] uppercase text-muted-foreground tracking-widest">{paymentMethodMap[t.paymentMethod] || t.paymentMethod}</span>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900 dark:text-slate-100'}`}>
                    {t.type === 'INCOME' ? '+' : '-'} R$ {Number(t.amount).toFixed(2).replace('.', ',')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <EditTransactionDialog transaction={t} />
                      <button 
                        onClick={() => {
                          if(confirm('Tem certeza que deseja excluir esta transação? O saldo da carteira será estornado.')) {
                            deleteMutation.mutate(t.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="h-8 w-8 inline-flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                        title="Excluir transação"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
