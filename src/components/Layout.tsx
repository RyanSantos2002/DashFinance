import React, { useEffect } from 'react';
import { LayoutDashboard, Wallet, PieChart, Settings, Menu, LogOut, Moon, Sun, User } from 'lucide-react';
import { cn } from '../utils/cn';
import { useStore } from '../store/useStore';
import { MonthSelector } from './MonthSelector';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { theme, toggleTheme, currentUser, logout } = useStore();

  // Apply theme to body
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Wallet, label: 'Transações', active: false },
    { icon: PieChart, label: 'Relatórios', active: false },
    { icon: Settings, label: 'Configurações', active: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row transition-colors duration-200">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 min-h-screen p-6 transition-colors">
        <h1 className="text-2xl font-bold text-primary dark:text-blue-400 mb-8 flex items-center gap-2">
          <span className="bg-primary dark:bg-blue-600 text-white p-1 rounded">DF</span>
          DashFinance
        </h1>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={cn(
                "flex items-center gap-3 w-full p-3 rounded-lg transition-colors text-sm font-medium",
                item.active 
                  ? "bg-primary dark:bg-blue-600 text-white shadow-md" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="mt-auto pt-6 border-t dark:border-gray-700 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full">
              <User size={20} className="text-gray-600 dark:text-gray-300" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{currentUser?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pessoal</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Trocar Tema"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center z-20 relative">
         <h1 className="text-xl font-bold text-primary dark:text-blue-400">DashFinance</h1>
         <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 text-gray-600 dark:text-gray-300">
               {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 dark:text-gray-300">
              <Menu size={24} />
            </button>
         </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white dark:bg-gray-800 shadow-lg z-10 p-4 flex flex-col gap-2 md:hidden border-b dark:border-gray-700">
           {navItems.map((item) => (
            <button
              key={item.label}
              className="flex items-center gap-3 w-full p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
          <div className="border-t dark:border-gray-700 pt-2 mt-2">
             <button onClick={logout} className="flex items-center gap-3 w-full p-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                <LogOut size={20} />
                Sair ({currentUser?.name})
             </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 md:hidden">
             <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Mês:</span>
             <MonthSelector />
          </div>
          <div className="hidden md:flex justify-end mb-4">
            <MonthSelector />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};
