import React, { useState, useEffect } from 'react';
import { X, Building2, Save, HardHat, FileText } from 'lucide-react';
import { Obra, UserSession } from '../types';

interface ObraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (obra: Obra) => void;
  obraToEdit?: Obra | null;
  currentUser: UserSession;
}

export const ObraModal: React.FC<ObraModalProps> = ({
  isOpen,
  onClose,
  onSave,
  obraToEdit,
  currentUser,
}) => {
  const [nome, setNome] = useState('');
  const [cliente, setCliente] = useState('');
  const [endereco, setEndereco] = useState('');
  const [responsavelTecnico, setResponsavelTecnico] = useState('');
  const [creaCau, setCreaCau] = useState('');
  const [artRrt, setArtRrt] = useState('');
  const [status, setStatus] = useState<Obra['status']>('Em andamento');
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (obraToEdit) {
      setNome(obraToEdit.nome);
      setCliente(obraToEdit.cliente);
      setEndereco(obraToEdit.endereco);
      setResponsavelTecnico(obraToEdit.responsavelTecnico);
      setCreaCau(obraToEdit.creaCau);
      setArtRrt(obraToEdit.artRrt || '');
      setStatus(obraToEdit.status);
      setDataInicio(obraToEdit.dataInicio || new Date().toISOString().split('T')[0]);
    } else {
      setNome('');
      setCliente('');
      setEndereco('');
      setResponsavelTecnico(currentUser.nome);
      setCreaCau(currentUser.crea);
      setArtRrt('');
      setStatus('Em andamento');
      setDataInicio(new Date().toISOString().split('T')[0]);
    }
  }, [obraToEdit, isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !cliente.trim()) return;

    const obra: Obra = {
      id: obraToEdit?.id || `obra-${Date.now()}`,
      nome: nome.trim(),
      cliente: cliente.trim(),
      endereco: endereco.trim(),
      responsavelTecnico: responsavelTecnico.trim() || currentUser.nome,
      creaCau: creaCau.trim() || currentUser.crea,
      artRrt: artRrt.trim(),
      status,
      dataInicio,
      criadoEm: obraToEdit?.criadoEm || new Date().toISOString(),
    };

    onSave(obra);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="p-3 bg-amber-500/15 rounded-xl text-amber-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {obraToEdit ? 'Editar Dados da Obra' : 'Cadastrar Nova Obra'}
            </h3>
            <p className="text-xs text-slate-400">Informações para cabeçalho dos Relatórios Diários</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Nome da Obra / Empreendimento *
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Residencial Parque das Flores - Bloco B"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Cliente / Contratante *
              </label>
              <input
                type="text"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Ex: Incorporadora Alfa S/A"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Status da Obra
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Obra['status'])}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Em andamento">Em andamento</option>
                <option value="Paralisada">Paralisada</option>
                <option value="Concluída">Concluída</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Endereço Completo da Obra
            </label>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Ex: Av. Brasil, 1200 - Centro, Campinas/SP"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Responsável Técnico
              </label>
              <input
                type="text"
                value={responsavelTecnico}
                onChange={(e) => setResponsavelTecnico(e.target.value)}
                placeholder="Ex: Engª Larissa Freitas"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                CREA / CAU
              </label>
              <input
                type="text"
                value={creaCau}
                onChange={(e) => setCreaCau(e.target.value)}
                placeholder="Ex: CREA-SP 5069871234/D"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Nº da ART / RRT (Opcional)
              </label>
              <input
                type="text"
                value={artRrt}
                onChange={(e) => setArtRrt(e.target.value)}
                placeholder="Ex: ART 28027230..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Data de Início
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-4 rounded-lg text-sm shadow-md flex items-center justify-center space-x-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Obra</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
