"use client"

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DonutChart } from '@/components/dashboard/donut-chart';
import { useState } from 'react';

const formatMoney = (val: number) => `R$ ${Number(val).toFixed(2).replace('.', ',')}`;

export default function DashboardPage() {
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const { data: transactions, isLoading: isTxLoading } = useQuery({
    queryKey: ['transactions', month, year],
    queryFn: async () => {
      const res = await api.get('/transactions', { params: { month, year } });
      return res.data;
    }
  });

  const { data: accounts, isLoading: isAccLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      const res = await api.get('/accounts');
      return res.data;
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories')).data,
  });

  if (isTxLoading || isAccLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mb-4"></div>
          <p className="text-slate-500">Sincronizando dados...</p>
        </div>
      </div>
    );
  }

  // Aggregate Data
  // Aggregate Data
  const filteredTransactions = transactions?.filter((t: any) => 
    selectedCategories.length === 0 || selectedCategories.includes(t.category?.id)
  ) || [];

  const expenses = filteredTransactions.filter((t: any) => t.type === 'EXPENSE');
  const income = filteredTransactions.filter((t: any) => t.type === 'INCOME');

  const totalExpenses = expenses.reduce((acc: number, t: any) => acc + Number(t.amount), 0);
  const totalIncome = income.reduce((acc: number, t: any) => acc + Number(t.amount), 0);
  const totalBalance = accounts?.reduce((acc: number, a: any) => acc + Number(a.balance), 0) || 0;

  // Build Chart Data (Group by Category grouping Credit Cards perfectly)
  const categoryMap = new Map<string, { value: number, color: string }>();
  
  expenses.forEach((t: any) => {
    const catName = t.category?.name || 'Outros Extras';
    const catColor = t.category?.color || '#CBD5E1';
    const amount = Number(t.amount);

    if (categoryMap.has(catName)) {
      categoryMap.get(catName)!.value += amount;
    } else {
      categoryMap.set(catName, { value: amount, color: catColor });
    }
  });

  const chartData = Array.from(categoryMap.entries()).map(([name, { value, color }]) => ({
    name, value, color
  })).sort((a, b) => b.value - a.value);

  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Visão Geral</h1>
          <p className="text-muted-foreground mt-1">Acompanhe a saúde da sua carteira e faturas de cartão.</p>
        </div>
        <div className="flex space-x-2 bg-white dark:bg-slate-950 p-1 rounded-lg border shadow-sm items-center flex-wrap gap-y-2 sm:gap-y-0 relative">
          <div className="relative">
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="bg-transparent text-sm border-0 focus:ring-0 cursor-pointer font-medium p-2 text-emerald-700 dark:text-emerald-400 w-full sm:w-auto truncate"
            >
              {selectedCategories.length === 0 
                ? 'Todas Categorias' 
                : `${selectedCategories.length} categorias`}
            </button>
            {isCategoryOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                <div className="absolute top-full mt-2 left-0 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-50 py-2">
                  <div className="max-h-64 overflow-y-auto px-1">
                    {categories?.map((c: any) => (
                      <label key={c.id} className="flex items-center px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(c.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, c.id]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(id => id !== c.id));
                            }
                          }}
                          className="mr-3 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{c.name}</span>
                      </label>
                    ))}
                  </div>
                  {selectedCategories.length > 0 && (
                    <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2 px-3">
                      <button 
                        onClick={() => { setSelectedCategories([]); setIsCategoryOpen(false); }}
                        className="w-full text-xs text-center py-1.5 bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md transition-colors font-medium"
                      >
                        Limpar seleção
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
          <select 
            value={month} 
            onChange={(e) => setMonth(e.target.value)} 
            className="bg-transparent text-sm border-0 focus:ring-0 cursor-pointer font-medium p-2 w-full sm:w-auto"
          >
            {months.map((m, i) => (
              <option key={i} value={(i + 1).toString()}>{m}</option>
            ))}
          </select>
          <select 
            value={year} 
            onChange={(e) => setYear(e.target.value)} 
            className="bg-transparent text-sm border-0 focus:ring-0 cursor-pointer font-medium p-2"
          >
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Saldo em Contas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">{formatMoney(totalBalance)}</div>
            <p className="text-xs text-muted-foreground mt-1">Soma de todas as carteiras (Pix/Débito)</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-emerald-100 dark:border-emerald-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-500">Receitas Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">{formatMoney(totalIncome)}</div>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">Entradas processadas no período</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-red-100 dark:border-red-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-500">Despesas & Faturas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-500">{formatMoney(totalExpenses)}</div>
            <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-1">Total englobando cartões de crédito</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Composição de Despesas por Categoria</CardTitle>
            <CardDescription>Visualização em tempo real dos seus maiores ralos de gastos.</CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col justify-center">
            <DonutChart data={chartData} />
          </CardContent>
        </Card>
        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas {transactions?.slice(0,5).length} transações lançadas.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {transactions?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma transação encontrada</p>
              ) : (
                transactions?.slice(0, 6).map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                        {t.description} 
                        {t.paymentMethod === 'CREDIT_CARD' && <span className="ml-2 text-[10px] uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-sm">Crédito</span>}
                      </p>
                      <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className={`font-bold text-sm bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-md ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-700 dark:text-slate-300'}`}>
                      {t.type === 'INCOME' ? '+' : '-'} {formatMoney(Number(t.amount))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
