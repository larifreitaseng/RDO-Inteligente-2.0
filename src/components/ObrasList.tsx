import React, { useState } from 'react';
import {
  Building2,
  Plus,
  FileText,
  MapPin,
  UserCheck,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  ArrowRight,
  Search,
} from 'lucide-react';
import { Obra, RDO } from '../types';

interface ObrasListProps {
  obras: Obra[];
  rdos: RDO[];
  onSelectObraForRdo: (obra: Obra) => void;
  onViewRdosOfObra: (obra: Obra) => void;
  onOpenNewObraModal: () => void;
  onEditObra: (obra: Obra) => void;
  onDeleteObra: (obraId: string) => void;
  onOpenAiVoiceWithObra?: (obra?: Obra) => void;
}

export const ObrasList: React.FC<ObrasListProps> = ({
  obras,
  rdos,
  onSelectObraForRdo,
  onViewRdosOfObra,
  onOpenNewObraModal,
  onEditObra,
  onDeleteObra,
  onOpenAiVoiceWithObra,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  const filteredObras = obras.filter((obra) => {
    const matchesSearch =
      obra.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obra.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obra.endereco.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'todos' || obra.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getRdoCountForObra = (obraId: string) => {
    return rdos.filter((r) => r.obraId === obraId).length;
  };

  const getStatusBadge = (status: Obra['status']) => {
    switch (status) {
      case 'Em andamento':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Paralisada':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Concluída':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner & Primary CTA */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Canteiros de Obra Cadastrados</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Selecione a Obra para Elaborar o RDO
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Gere relatórios diários com preenchimento manual rápido ou por comando de voz com IA no canteiro.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => {
              if (obras.length > 0) {
                onSelectObraForRdo(obras[0]);
              } else {
                onOpenNewObraModal();
              }
            }}
            className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-3 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 active:scale-95 transition-all text-sm"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>Novo RDO</span>
          </button>

          <button
            onClick={onOpenNewObraModal}
            className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-semibold px-4 py-3 rounded-xl flex items-center justify-center space-x-2 active:scale-95 transition-all text-sm"
          >
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>+ Cadastrar Obra</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar obra por nome, cliente ou endereço..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap pl-1">Status:</span>
          {['todos', 'Em andamento', 'Paralisada', 'Concluída'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {status === 'todos' ? 'Todas as Obras' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Works Grid */}
      {filteredObras.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800/80 p-8">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Nenhuma obra encontrada</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
            {searchTerm || filterStatus !== 'todos'
              ? 'Tente ajustar os filtros ou a busca digitada.'
              : 'Cadastre sua primeira obra para começar a emitir os Relatórios Diários de Obra.'}
          </p>
          <button
            onClick={onOpenNewObraModal}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Obra Agora</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredObras.map((obra) => {
            const rdoCount = getRdoCountForObra(obra.id);
            return (
              <div
                key={obra.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all hover:shadow-xl group"
              >
                <div>
                  {/* Card Header: Name & Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                        obra.status
                      )}`}
                    >
                      {obra.status}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onEditObra(obra)}
                        title="Editar obra"
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Deseja realmente remover a obra "${obra.nome}"?`)) {
                            onDeleteObra(obra.id);
                          }
                        }}
                        title="Excluir obra"
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 mb-1.5">
                    {obra.nome}
                  </h3>

                  <div className="text-xs text-amber-300 font-semibold mb-3">
                    Cliente: {obra.cliente}
                  </div>

                  {/* Details List */}
                  <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800/80 pt-3 mb-4">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{obra.endereco || 'Endereço não informado'}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">
                        {obra.responsavelTecnico} ({obra.creaCau})
                      </span>
                    </div>

                    {obra.artRrt && (
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
                        <span>{obra.artRrt}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="border-t border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span className="flex items-center space-x-1">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>{rdoCount} {rdoCount === 1 ? 'RDO emitido' : 'RDOs emitidos'}</span>
                    </span>
                    <button
                      onClick={() => onViewRdosOfObra(obra)}
                      className="text-amber-400 hover:text-amber-300 font-medium hover:underline text-xs"
                    >
                      Ver histórico
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectObraForRdo(obra)}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md active:scale-95 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Criar RDO</span>
                    </button>

                    <button
                      onClick={() => onViewRdosOfObra(obra)}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Listar RDOs</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
