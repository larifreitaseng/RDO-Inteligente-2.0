import React, { useState } from 'react';
import { HardHat, Lock, Mail, ArrowRight, ShieldCheck, KeyRound, Sparkles, CheckCircle2 } from 'lucide-react';
import { UserSession } from '../types';
import { DEFAULT_USER } from '../data/mockData';

interface LoginViewProps {
  onLogin: (user: UserSession) => void;
  onOpenPasswordRecovery: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onOpenPasswordRecovery }) => {
  const [email, setEmail] = useState(DEFAULT_USER.email);
  const [password, setPassword] = useState('eng123456');
  const [nome, setNome] = useState(DEFAULT_USER.nome);
  const [crea, setCrea] = useState(DEFAULT_USER.crea);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, informe seu e-mail e sua senha de acesso.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve conter no mínimo 6 dígitos.');
      return;
    }

    // Authenticate
    onLogin({
      email,
      nome: nome.trim() || 'Engenheiro Responsável',
      crea: crea.trim() || 'CREA-SP / CAU',
      cargo: 'Engenheiro Civil Residente',
    });
  };

  const handleQuickDemoLogin = () => {
    onLogin(DEFAULT_USER);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Workshop Header Banner */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Oficina Prática: IA na Engenharia Civil</span>
        </div>

        <div className="mx-auto h-16 w-16 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 mb-3">
          <HardHat className="h-9 w-9 stroke-[2.3]" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          RDO Inteligente
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Método Larissa • Diário de Obra com IA por Voz
        </p>
      </div>

      {/* Login Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-800 py-8 px-5 sm:px-8 shadow-2xl rounded-2xl">
          {error && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-lg flex items-center space-x-2">
              <span className="font-bold">Atenção:</span>
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Access Button */}
          <div className="mb-6 p-3.5 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent border border-amber-500/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-300 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Acesso Rápido de Demonstração</span>
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-200 px-1.5 py-0.5 rounded font-mono">
                1-Clique
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2.5">
              Entre diretamente com o perfil oficial da <strong>Engª Larissa Freitas</strong> cadastrado para a oficina.
            </p>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-4 rounded-lg text-sm shadow-md flex items-center justify-center space-x-2 active:scale-98 transition-all"
            >
              <span>Entrar como Engª Larissa Freitas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-3 text-slate-300 font-medium">
                Ou acesse com suas credenciais
              </span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {isRegisterMode && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Nome Completo do Engenheiro(a)
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Eng. Carlos Silva"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Registro Profissional (CREA / CAU)
                  </label>
                  <input
                    type="text"
                    value={crea}
                    onChange={(e) => setCrea(e.target.value)}
                    placeholder="Ex: CREA-SP 5069871234/D"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                E-mail Profissional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engenheiro@obra.com.br"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Senha
                </label>
                {!isRegisterMode && (
                  <button
                    type="button"
                    onClick={onOpenPasswordRecovery}
                    className="text-xs text-amber-400 hover:text-amber-300 hover:underline transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3 px-4 rounded-lg text-sm flex items-center justify-center space-x-2 active:scale-98 transition-all mt-4"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>{isRegisterMode ? 'Cadastrar e Acessar Canteiro' : 'Acessar Canteiro de Obras'}</span>
            </button>
          </form>

          {/* Toggle Register / Login */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError(null);
              }}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              {isRegisterMode
                ? 'Já possui cadastro? Clique para entrar'
                : 'Novo responsável técnico? Clique para cadastrar sua conta'}
            </button>
          </div>

          {/* Institutional Footer */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <div className="flex items-center justify-center space-x-4 text-[11px] text-slate-300 font-bold tracking-wider uppercase">
              <span>CONFEA</span>
              <span>•</span>
              <span>CREA-SP</span>
              <span>•</span>
              <span>MÚTUA</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Tecnologia certificada para Diários de Obra em conformidade com a Resolução CONFEA nº 1.094.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
