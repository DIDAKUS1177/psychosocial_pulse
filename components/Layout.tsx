import React, { useState } from 'react';
import { User } from '../types';
import { LayoutDashboard, ClipboardList, LogOut, Menu, X, Activity, HeartHandshake } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  currentView: string;
  onChangeView: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, currentView, onChangeView }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) {
    return <div className="min-h-screen bg-slate-50 flex flex-col">{children}</div>;
  }

  const NavItem = ({ view, icon: Icon, label }: { view: string, icon: any, label: string }) => (
    <button
      onClick={() => {
        onChangeView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
        currentView === view 
          ? 'bg-teal-600 text-white shadow-md' 
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-2">
          <div className="bg-teal-600 p-2 rounded-lg">
             <Activity className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">PsychoSocial</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Panel Principal" />
          <NavItem view="surveys" icon={ClipboardList} label="Encuestas" />
        </nav>

        <div className="p-4 border-t border-slate-100">
           {/* Branding Credit */}
           <div className="mb-6 flex items-center space-x-2 text-xs text-slate-400 justify-center">
             <HeartHandshake size={14} />
             <span>By Katerine Guañarita & Diego Hernandez</span>
           </div>

          <div className="mb-4 px-4">
            <p className="text-sm font-medium text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Activity className="text-teal-600" size={24} />
          <span className="font-bold text-slate-800">PsychoSocial</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-40 pt-20 px-4">
          <nav className="space-y-2">
            <NavItem view="dashboard" icon={LayoutDashboard} label="Panel Principal" />
            <NavItem view="surveys" icon={ClipboardList} label="Encuestas" />
            <div className="h-px bg-slate-100 my-4" />
            
             <div className="mb-4 text-center text-xs text-slate-400">
               By Katerine Guañarita & Diego Hernandez
             </div>

            <button
              onClick={onLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut size={20} />
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 mt-16 md:mt-0 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;