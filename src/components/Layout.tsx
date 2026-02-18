
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogOut, Menu, X, Sun, Moon, Bell, ChevronRight, User as UserIcon, Package } from 'lucide-react';
import { MENU_ITEMS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  if (!user) return null;

  const filteredMenu = MENU_ITEMS.filter(item => item.roles.includes(user.role));

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-slate-300 w-64 fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-50 flex flex-col`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Package size={24} />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">ALMOX 360°</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
          {filteredMenu.map((item) => {
            const isActive = location.pathname.endsWith(item.path);
            return (
              <Link
                key={item.path}
                to={`/${item.path}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'hover:bg-slate-800 hover:text-white'
                  }`}
              >
                {item.icon}
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && <ChevronRight size={16} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
              <UserIcon size={20} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950">
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden">
            <Menu size={24} />
          </button>

          <div className="flex-1 px-4 lg:px-8">
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 hidden md:block">
              {MENU_ITEMS.find(m => location.pathname.endsWith(m.path))?.label || 'Sistema'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              {theme === 'light' ? <Moon size={20} className="text-slate-600" /> : <Sun size={20} className="text-yellow-400" />}
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
              <Bell size={20} className="text-slate-600 dark:text-slate-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-slate-50 dark:bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
