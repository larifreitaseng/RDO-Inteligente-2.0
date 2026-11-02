import React from 'react';
import { HardHat, Building2, FileText, LogOut, Sparkles, Plus } from 'lucide-react';
import { UserSession } from '../types';

interface NavbarProps {
  currentUser: UserSession;
  currentView: 'obras' | 'rdos' | 'editor';
  onNavigate: (view: 'obras' | 'rdos') => void;
  onNovoRdo: () => void;
  onOpenAiVoice: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onNovoRdo,
  onOpenAiVoice,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('obras')}>
            <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-inner shadow-amber-600/40">
              <HardHat className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">RDO Inteligente</span>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-400/30">
                  Método Larissa
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Diário de Obra com IA por Voz no Canteiro</p>
            </div>
          </div>

          {/* Navigation Menus: Obras | RDOs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => onNavigate('obras')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentView === 'obras'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Obras</span>
            </button>

            <button
              onClick={() => onNavigate('rdos')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentView === 'rdos'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>RDOs</span>
            </button>
          </nav>

          {/* Quick Action & User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick AI Voice Button */}
            <button
              onClick={onOpenAiVoice}
              title="Gravar RDO com Inteligência Artificial"
              className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg shadow-sm text-xs sm:text-sm active:scale-95 transition-all"
            >
              <Sparkles className="h-4 w-4 fill-slate-950" />
              <span className="hidden md:inline">Gravar RDO com IA</span>
              <span className="md:hidden">IA Voz</span>
            </button>

            {/* Novo RDO */}
            <button
              onClick={onNovoRdo}
              className="hidden lg:flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-semibold px-3 py-2 rounded-lg text-sm active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Novo RDO</span>
            </button>

            {/* User Profile & Sign Out */}
            <div className="flex items-center pl-2 border-l border-slate-800 space-x-2">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-white truncate max-w-[140px]">{currentUser.nome}</div>
                <div className="text-[10px] text-amber-400 font-mono truncate max-w-[140px]">{currentUser.crea}</div>
              </div>
              <button
                onClick={onLogout}
                title="Sair do aplicativo"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
