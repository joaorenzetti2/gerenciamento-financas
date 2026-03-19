"use client"

import DashboardLayout from '../dashboard/layout';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletCards } from 'lucide-react';
import { NewAccountDialog } from '@/components/accounts/new-account-dialog';

export default function AccountsPage() {
  const { data: accounts, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const res = await api.get('/accounts');
      return res.data;
    }
  });

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Carteiras</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas contas, bancos disponíveis e saldos reais.</p>
        </div>
        <NewAccountDialog />
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
            <div className="animate-pulse h-8 w-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3 animate-in fade-in duration-700">
          {accounts?.map((acc: any) => (
            <Card key={acc.id} className="shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group border-slate-200 dark:border-slate-800">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 group-hover:w-1.5 transition-all"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">{acc.name}</CardTitle>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-full text-emerald-500">
                  <WalletCards className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                  <span className="text-xl text-slate-400 font-normal mr-1">R$</span>
                  {Number(acc.balance).toFixed(2).replace('.', ',')}
                </div>
                {acc.institution && <CardDescription className="mt-2 line-clamp-1">{acc.institution}</CardDescription>}
              </CardContent>
            </Card>
          ))}

        </div>
      )}
    </DashboardLayout>
  );
}
