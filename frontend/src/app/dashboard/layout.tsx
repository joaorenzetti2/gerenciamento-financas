"use client"

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, Receipt, WalletCards, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/transactions', label: 'Transações', icon: Receipt },
    { href: '/accounts', label: 'Carteiras', icon: WalletCards },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white flex flex-col shadow-2xl">
        {/* Logo */}
        <div className="px-6 py-7 border-b border-emerald-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-400/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Gestão</h2>
              <span className="text-emerald-400 text-sm font-medium tracking-wider">Financeira</span>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 shadow-inner'
                    : 'text-emerald-100/70 hover:bg-emerald-800/40 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-emerald-800/50">
          <Button
            variant="ghost"
            className="w-full justify-start text-emerald-300/70 hover:text-red-300 hover:bg-red-950/30 text-base py-3"
            onClick={logout}
          >
            <LogOut className="h-5 w-5 mr-3" /> Sair da Conta
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-50">
        <div className="mx-auto max-w-6xl p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
