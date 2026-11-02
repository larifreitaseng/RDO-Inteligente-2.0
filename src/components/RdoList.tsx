import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Sparkles,
  Calendar,
  Eye,
  Download,
  Trash2,
  Edit3,
  Building2,
  CloudSun,
  Users,
  Search,
  Filter,
} from 'lucide-react';
import { RDO, Obra } from '../types';
import { formatRdoNumber } from '../utils/pdfGenerator';

interface RdoListProps {
  rdos: RDO[];
  obras: Obra[];
  selectedObraFilter?: string | null;
  onSelectObraFilter: (obraId: string | null) => void;
  onNovoRdo: () => void;
  onOpenAiVoice: () => void;
  onEditRdo: (rdo: RDO) => void;
  onViewPdf: (rdo: RDO) => void;
  onDownloadPdf: (rdo: RDO) => void;
  onDeleteRdo: (id: string) => void;
}

export const RdoList: React.FC<RdoListProps> = ({
  rdos,
  obras,
  selectedObraFilter,
  onSelectObraFilter,
  onNovoRdo,
  onOpenAiVoice,
  onEditRdo,
  onViewPdf,
  onDownloadPdf,
  onDeleteRdo,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'Rascunho' | 'Finalizado'>('todos');
  const [dateFilter, setDateFilter] = useState('');

  const filteredRdos = rdos.filter((rdo) => {
    const matchesObra = !selectedObraFilter || rdo.obraId === selectedObraFilter;
    const matchesStatus = statusFilter === 'todos' || rdo.status === statusFilter;
    const matchesDate = !dateFilter || rdo.data === dateFilter;

    const obra = obras.find((o) => o.id === rdo.obraId);
    const searchLow = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      rdo.responsavel.toLowerCase().includes(searchLow) ||
      (obra && obra.nome.toLowerCase().includes(searchLow)) ||
      String(rdo.numeroSequencial).includes(searchLow) ||
      rdo.atividades.some((a) => a.descricao.toLowerCase().includes(searchLow));

    return matchesObra && matchesStatus && matchesDate && matchesSearch;
  });

  const getObra = (obraId: string) => obras.find((o) => o.id === obraId);

  const totalRascunhos = rdos.filter((r) => r.status === 'Rascunho').length;
  const totalFinalizados = rdos.filter((r) => r.status === 'Finalizado').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Action Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Relatórios Diários de Obra</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Consultar e Gerenciar RDOs
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Controle de rascunhos em andamento, finalização técnica e emissão de PDFs oficiais.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Main Action: Gravar RDO com IA */}
          <button
            onClick={onOpenAiVoice}
            className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold px-4 py-3 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 active:scale-95 transition-all text-sm"
          >
            <Sparkles className="w-5 h-5 fill-slate-950" />
            <span>Gravar RDO com IA</span>
          </button>

          {/* Action: Novo RDO Manual */}
          <button
            onClick={onNovoRdo}
            className="flex-1 sm:flex-none bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold px-4 py-3 rounded-xl flex items-center justify-center space-x-2 active:scale-95 transition-all text-sm"
          >
            <Plus className="w-5 h-5 text-amber-400" />
            <span>Novo RDO Manual</span>
          </button>
        </div>
      </div>

      {/* Quick Status Counters */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <div className="text-[11px] font-bold text-slate-400 uppercase">Total de RDOs</div>
          <div className="text-xl sm:text-2xl font-black text-white mt-1">{rdos.length}</div>
        </div>
        <div className="bg-slate-900 border border-amber-500/30 p-3.5 rounded-xl bg-amber-500/5">
          <div className="text-[11px] font-bold text-amber-400 uppercase">Rascunhos</div>
          <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1">{totalRascunhos}</div>
        </div>
        <div className="bg-slate-900 border border-emerald-500/30 p-3.5 rounded-xl bg-emerald-500/5">
          <div className="text-[11px] font-bold text-emerald-400 uppercase">Finalizados</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-1">{totalFinalizados}</div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Obra selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Filtrar por Obra</label>
            <select
              value={selectedObraFilter || ''}
              onChange={(e) => onSelectObraFilter(e.target.value || null)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Todas as obras</option>
              {obras.map((obra) => (
                <option key={obra.id} value={obra.id}>
                  {obra.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Status selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="todos">Todos os status</option>
              <option value="Rascunho">Apenas Rascunhos</option>
              <option value="Finalizado">Apenas Finalizados</option>
            </select>
          </div>

          {/* Date selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Data Específica</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Search query */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Busca Textual</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar atividade, responsável..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {(selectedObraFilter || statusFilter !== 'todos' || dateFilter || searchTerm) && (
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <span>Resultados encontrados: {filteredRdos.length}</span>
            <button
              onClick={() => {
                onSelectObraFilter(null);
                setStatusFilter('todos');
                setDateFilter('');
                setSearchTerm('');
              }}
              className="text-amber-400 hover:text-amber-300 hover:underline"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>

      {/* RDOs List / Cards */}
      {filteredRdos.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 p-8">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Nenhum RDO encontrado</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
            Crie um novo relatório ou utilize o recurso de gravação por comando de voz com IA para gerar o RDO em segundos.
          </p>
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={onOpenAiVoice}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-xs flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Gravar com IA</span>
            </button>
            <button
              onClick={onNovoRdo}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2.5 rounded-lg text-xs"
            >
              Criar Manual
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredRdos.map((rdo) => {
            const obra = getObra(rdo.obraId);
            const isRascunho = rdo.status === 'Rascunho';
            const totalEfetivo = rdo.maoDeObra.reduce((sum, item) => sum + (Number(item.quantidade) || 0), 0);

            return (
              <div
                key={rdo.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                {/* Left Section: Identification & Summary */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-extrabold text-sm sm:text-base text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/30">
                      RDO #{formatRdoNumber(rdo.numeroSequencial)}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                        isRascunho
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {rdo.status}
                    </span>

                    <span className="text-xs text-slate-400 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{rdo.data.split('-').reverse().join('/')}</span>
                    </span>
                  </div>

                  {/* Obra & Client */}
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors flex items-center space-x-2">
                      <span>{obra?.nome || 'Obra não identificada'}</span>
                    </h3>
                    <div className="text-xs text-slate-400">
                      Cliente: <span className="text-slate-300">{obra?.cliente || '-'}</span> • Responsável: <span className="text-slate-300">{rdo.responsavel}</span>
                    </div>
                  </div>

                  {/* Highlights (Activities / Climate / Workers) */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                    {rdo.atividades.length > 0 && (
                      <span className="line-clamp-1 max-w-md">
                        <strong className="text-slate-300">Atividades:</strong> {rdo.atividades.map((a) => `${a.descricao} (${a.percentualExecutado || 'ok'})`).join(', ')}
                      </span>
                    )}

                    <div className="flex items-center space-x-1 text-slate-400">
                      <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                      <span>M: {rdo.climaManha} / T: {rdo.climaTarde}</span>
                    </div>

                    <div className="flex items-center space-x-1 text-slate-400">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{totalEfetivo} trabalhadores</span>
                    </div>

                    {rdo.fotos.length > 0 && (
                      <span className="text-xs text-amber-300 font-medium">
                        📷 {rdo.fotos.length} fotos
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Section: Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                  <button
                    onClick={() => onEditRdo(rdo)}
                    className="flex-1 md:flex-none bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md active:scale-95 transition-all"
                    title={isRascunho ? 'Continuar editando rascunho' : 'Ver e editar RDO'}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isRascunho ? 'Editar Rascunho' : 'Editar RDO'}</span>
                  </button>

                  <button
                    onClick={() => onViewPdf(rdo)}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-3 py-2 rounded-xl text-xs flex items-center justify-center space-x-1 active:scale-95 transition-all"
                    title="Visualizar documento em formato PDF"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Visualizar</span>
                  </button>

                  <button
                    onClick={() => onDownloadPdf(rdo)}
                    className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/20 font-semibold px-3 py-2 rounded-xl text-xs flex items-center justify-center space-x-1 active:scale-95 transition-all"
                    title="Baixar arquivo PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Baixar</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Deseja realmente excluir o RDO #${formatRdoNumber(rdo.numeroSequencial)}?`)) {
                        onDeleteRdo(rdo.id);
                      }
                    }}
                    className="text-slate-500 hover:text-rose-400 p-2 rounded-xl hover:bg-slate-800 transition-colors"
                    title="Excluir RDO"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
