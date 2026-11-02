import React, { useState } from 'react';
import { Mail, CheckCircle2, X, ArrowLeft, HardHat } from 'lucide-react';

interface PasswordRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const PasswordRecoveryModal: React.FC<PasswordRecoveryModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                <HardHat className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Recuperação de Acesso</h3>
                <p className="text-xs text-slate-400">Redefinição de senha do responsável técnico</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-5">
              Informe o e-mail cadastrado no sistema. Enviaremos um link seguro para você redefinir sua senha de acesso.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  E-mail Cadastrado
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@obra.com.br"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-4 rounded-lg text-sm shadow-md transition-colors"
                >
                  Enviar Instruções
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-3">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Instruções Enviadas!</h3>
            <p className="text-sm text-slate-300 mb-4">
              Enviamos um link de redefinição para <strong className="text-amber-400">{email}</strong>.
            </p>
            <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800 mb-6">
              Em conformidade com a segurança do Firebase Authentication, o link expira em 1 hora.
            </p>
            <button
              onClick={handleReset}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-lg text-sm flex items-center justify-center space-x-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Login</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
