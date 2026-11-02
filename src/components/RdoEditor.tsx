import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Save,
  CheckCircle2,
  Eye,
  Download,
  Plus,
  Trash2,
  Sun,
  Cloud,
  CloudRain,
  AlertOctagon,
  Users,
  Wrench,
  Package,
  AlertTriangle,
  Camera,
  Image as ImageIcon,
  Check,
  Calendar,
  Building2,
  HardHat,
  ChevronRight,
  Info,
} from 'lucide-react';
import { RDO, Obra, UserSession, AtividadeItem, MaoDeObraItem, EquipamentoItem, MaterialItem, FotoRDO } from '../types';
import { formatRdoNumber } from '../utils/pdfGenerator';

interface RdoEditorProps {
  rdo: RDO;
  obra: Obra;
  obras: Obra[];
  currentUser: UserSession;
  onSave: (updatedRdo: RDO) => void;
  onBack: () => void;
  onOpenAiVoice: () => void;
  onViewPdf: () => void;
  onDownloadPdf: () => void;
}

export const RdoEditor: React.FC<RdoEditorProps> = ({
  rdo: initialRdo,
  obra: currentObra,
  obras,
  currentUser,
  onSave,
  onBack,
  onOpenAiVoice,
  onViewPdf,
  onDownloadPdf,
}) => {
  const [rdo, setRdo] = useState<RDO>(initialRdo);
  const [activeTab, setActiveTab] = useState<'dados' | 'registro' | 'fotos'>('dados');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Common role presets for quick addition in field
  const standardRoles = ['Pedreiro', 'Servente', 'Carpinteiro', 'Armador', 'Eletricista', 'Encarregado', 'Mestre de Obras'];

  const triggerSaveNotification = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleUpdateRdo = (field: keyof RDO, value: any) => {
    const updated = { ...rdo, [field]: value, atualizadoEm: new Date().toISOString() };
    setRdo(updated);
    onSave(updated);
  };

  const handleSaveDraft = () => {
    const updated: RDO = { ...rdo, status: 'Rascunho', atualizadoEm: new Date().toISOString() };
    setRdo(updated);
    onSave(updated);
    triggerSaveNotification();
  };

  const handleFinalizeRdo = () => {
    const updated: RDO = { ...rdo, status: 'Finalizado', atualizadoEm: new Date().toISOString() };
    setRdo(updated);
    onSave(updated);
    triggerSaveNotification();
  };

  // Activity handlers
  const handleAddAtividade = () => {
    const newAtiv: AtividadeItem = {
      id: `ativ-${Date.now()}`,
      descricao: '',
      percentualExecutado: '100%',
      localizacao: '',
    };
    handleUpdateRdo('atividades', [...rdo.atividades, newAtiv]);
  };

  const handleUpdateAtividade = (id: string, key: keyof AtividadeItem, val: string) => {
    const list = rdo.atividades.map((item) => (item.id === id ? { ...item, [key]: val } : item));
    handleUpdateRdo('atividades', list);
  };

  const handleRemoveAtividade = (id: string) => {
    handleUpdateRdo(
      'atividades',
      rdo.atividades.filter((a) => a.id !== id)
    );
  };

  // Mão de Obra handlers
  const handleUpdateMaoDeObraCount = (funcao: string, delta: number) => {
    const list = [...rdo.maoDeObra];
    const index = list.findIndex((m) => m.funcao.toLowerCase() === funcao.toLowerCase());
    if (index >= 0) {
      const newQty = Math.max(0, list[index].quantidade + delta);
      if (newQty === 0 && !standardRoles.slice(0, 2).includes(funcao)) {
        list.splice(index, 1);
      } else {
        list[index].quantidade = newQty;
      }
    } else if (delta > 0) {
      list.push({ id: `mo-${Date.now()}`, funcao, quantidade: delta });
    }
    handleUpdateRdo('maoDeObra', list);
  };

  const handleAddCustomMaoDeObra = (funcao: string) => {
    if (!funcao.trim()) return;
    const exists = rdo.maoDeObra.some((m) => m.funcao.toLowerCase() === funcao.toLowerCase().trim());
    if (!exists) {
      handleUpdateRdo('maoDeObra', [
        ...rdo.maoDeObra,
        { id: `mo-${Date.now()}`, funcao: funcao.trim(), quantidade: 1 },
      ]);
    }
  };

  // Equipamentos handlers
  const handleAddEquipamento = () => {
    const newEq: EquipamentoItem = {
      id: `eq-${Date.now()}`,
      nome: '',
      quantidade: 1,
      status: 'Operacional',
    };
    handleUpdateRdo('equipamentos', [...rdo.equipamentos, newEq]);
  };

  const handleUpdateEquipamento = (id: string, key: keyof EquipamentoItem, val: any) => {
    const list = rdo.equipamentos.map((e) => (e.id === id ? { ...e, [key]: val } : e));
    handleUpdateRdo('equipamentos', list);
  };

  const handleRemoveEquipamento = (id: string) => {
    handleUpdateRdo(
      'equipamentos',
      rdo.equipamentos.filter((e) => e.id !== id)
    );
  };

  // Materiais handlers
  const handleAddMaterial = () => {
    const newMat: MaterialItem = {
      id: `mat-${Date.now()}`,
      descricao: '',
      quantidade: '',
    };
    handleUpdateRdo('materiais', [...rdo.materiais, newMat]);
  };

  const handleUpdateMaterial = (id: string, key: keyof MaterialItem, val: string) => {
    const list = rdo.materiais.map((m) => (m.id === id ? { ...m, [key]: val } : m));
    handleUpdateRdo('materiais', list);
  };

  const handleRemoveMaterial = (id: string) => {
    handleUpdateRdo(
      'materiais',
      rdo.materiais.filter((m) => m.id !== id)
    );
  };

  // Photos handling
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newFoto: FotoRDO = {
          id: `foto-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          url: base64,
          legenda: 'Registro fotográfico da atividade',
          dataHora: `${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
          etiqueta: 'Geral',
        };
        handleUpdateRdo('fotos', [...(rdo.fotos || []), newFoto]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUpdatePhotoLegenda = (id: string, legenda: string) => {
    const list = rdo.fotos.map((f) => (f.id === id ? { ...f, legenda } : f));
    handleUpdateRdo('fotos', list);
  };

  const handleRemovePhoto = (id: string) => {
    handleUpdateRdo(
      'fotos',
      rdo.fotos.filter((f) => f.id !== id)
    );
  };

  const totalHomens = rdo.maoDeObra.reduce((sum, item) => sum + (Number(item.quantidade) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
      {/* Top Bar with sticky header for mobile friendliness */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-3.5 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Back & Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors active:scale-95"
            title="Voltar à lista"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-black text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-lg border border-amber-400/30 text-sm">
                RDO #{formatRdoNumber(rdo.numeroSequencial)}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                  rdo.status === 'Rascunho'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {rdo.status}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-sm sm:max-w-md">
              {currentObra.nome}
            </h2>
          </div>
        </div>

        {/* Central High-Priority CTA: Gravar RDO com IA */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onOpenAiVoice}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 active:scale-95 transition-all text-xs sm:text-sm"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>Gravar RDO com IA</span>
          </button>
        </div>

        {/* Right Actions: Salvar / PDF */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 active:scale-95 transition-all"
            title="Salvar rascunho para continuar depois"
          >
            <Save className="w-3.5 h-3.5 text-amber-400" />
            <span>Salvar Rascunho</span>
          </button>

          <button
            type="button"
            onClick={onViewPdf}
            className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 active:scale-95 transition-all"
            title="Visualizar documento em formato PDF"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>Visualizar PDF</span>
          </button>

          <button
            type="button"
            onClick={onDownloadPdf}
            className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/20 font-semibold px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 active:scale-95 transition-all"
            title="Baixar arquivo PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar PDF</span>
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      {savedSuccess && (
        <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs py-2 px-4 rounded-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Alterações do RDO salvas com sucesso no banco de dados local!</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">Persistido</span>
        </div>
      )}

      {/* The 3 Tabs Navigation Required by PDF: Dados | Registro do dia | Fotos e revisão */}
      <div className="flex rounded-xl bg-slate-900/90 border border-slate-800 p-1.5 gap-1.5 shadow-md">
        <button
          onClick={() => setActiveTab('dados')}
          className={`flex-1 py-3 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'dados'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>1. Dados</span>
        </button>

        <button
          onClick={() => setActiveTab('registro')}
          className={`flex-1 py-3 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'registro'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <HardHat className="w-4 h-4" />
          <span>2. Registro do Dia</span>
        </button>

        <button
          onClick={() => setActiveTab('fotos')}
          className={`flex-1 py-3 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'fotos'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>3. Fotos e Revisão</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* ABA 1: DADOS */}
      {/* ======================================================== */}
      {activeTab === 'dados' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5 animate-fade-in">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Identificação da Obra e Metadados do RDO</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Dados contratuais da obra, responsável técnico e numeração sequencial.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Obra Selecionada */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Obra Vinculada
              </label>
              <select
                value={rdo.obraId}
                onChange={(e) => handleUpdateRdo('obraId', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {obras.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Número Sequencial */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Número Sequencial do RDO
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={rdo.numeroSequencial}
                  onChange={(e) => handleUpdateRdo('numeroSequencial', Number(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-amber-400">
                  RDO #{formatRdoNumber(rdo.numeroSequencial)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Data do RDO */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Data do Relatório *
              </label>
              <input
                type="date"
                value={rdo.data}
                onChange={(e) => handleUpdateRdo('data', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            {/* Horário de expediente */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Horário de Expediente
              </label>
              <input
                type="text"
                value={rdo.horarioTrabalho}
                onChange={(e) => handleUpdateRdo('horarioTrabalho', e.target.value)}
                placeholder="Ex: 07:00 às 17:00"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Status do RDO */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Status do RDO
              </label>
              <select
                value={rdo.status}
                onChange={(e) => handleUpdateRdo('status', e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Rascunho">Rascunho (Em elaboração)</option>
                <option value="Finalizado">Finalizado (Concluído)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Responsável Técnico */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Responsável Técnico
              </label>
              <input
                type="text"
                value={rdo.responsavel}
                onChange={(e) => handleUpdateRdo('responsavel', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* CREA / CAU */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Registro CREA / CAU
              </label>
              <input
                type="text"
                value={rdo.creaCau}
                onChange={(e) => handleUpdateRdo('creaCau', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Cargo */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Cargo / Atribuição
              </label>
              <input
                type="text"
                value={rdo.cargo}
                onChange={(e) => handleUpdateRdo('cargo', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Obra Summary Box */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="text-slate-300 font-bold mb-1">Resumo Contratual da Obra:</div>
            <div><strong>Cliente:</strong> {currentObra.cliente}</div>
            <div><strong>Endereço:</strong> {currentObra.endereco || 'Não informado'}</div>
            {currentObra.artRrt && <div><strong>ART / RRT:</strong> {currentObra.artRrt}</div>}
          </div>

          {/* Advance CTA */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setActiveTab('registro')}
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-6 rounded-xl text-sm flex items-center justify-center space-x-2 shadow-md active:scale-95 transition-all"
            >
              <span>Avançar para Registro do Dia</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ABA 2: REGISTRO DO DIA */}
      {/* ======================================================== */}
      {activeTab === 'registro' && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Voice / AI helper banner inside the day log */}
          <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Preenchimento Rápido com IA por Voz</h4>
                <p className="text-xs text-slate-400">
                  Economize tempo no canteiro falando sobre as tarefas e equipes do dia.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenAiVoice}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              <span>Gravar com IA</span>
            </button>
          </div>

          {/* 1. CONDIÇÕES CLIMÁTICAS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Condições Climáticas</span>
                </h3>
                <p className="text-xs text-slate-400">Selecione o tempo no canteiro nos períodos</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Manhã */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Período da Manhã
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: 'Ensolarado', icon: Sun },
                    { label: 'Nublado', icon: Cloud },
                    { label: 'Chuvoso', icon: CloudRain },
                    { label: 'Impraticável', icon: AlertOctagon },
                  ].map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleUpdateRdo('climaManha', label)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                        rdo.climaManha === label
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-102'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] truncate">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tarde */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Período da Tarde
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: 'Ensolarado', icon: Sun },
                    { label: 'Nublado', icon: Cloud },
                    { label: 'Chuvoso', icon: CloudRain },
                    { label: 'Impraticável', icon: AlertOctagon },
                  ].map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleUpdateRdo('climaTarde', label)}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                        rdo.climaTarde === label
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-102'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] truncate">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Observação Climática (Opcional)
              </label>
              <input
                type="text"
                value={rdo.observacaoClima}
                onChange={(e) => handleUpdateRdo('observacaoClima', e.target.value)}
                placeholder="Ex: Chuva pela manhã das 08h30 às 09h30 com paralisação temporária."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* 2. ATIVIDADES & % EXECUTADO */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <HardHat className="w-4 h-4 text-amber-400" />
                  <span>Atividades Desenvolvidas e Percentual Executado</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Descreva cada serviço do dia e o percentual de conclusão desta etapa.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddAtividade}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 active:scale-95 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Atividade</span>
              </button>
            </div>

            {/* Larissa Method Explicit Rule Banner */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start space-x-2">
              <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <span>
                <strong>Critério Método Larissa:</strong> O percentual refere-se estritamente à execução DA ATIVIDADE descrita no dia, nunca ao avanço total global da obra.
              </span>
            </div>

            {rdo.atividades.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl">
                <p className="text-xs text-slate-400 mb-2">Nenhuma atividade registrada ainda para hoje.</p>
                <button
                  type="button"
                  onClick={handleAddAtividade}
                  className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold px-3 py-1.5 rounded-lg text-xs inline-flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Primeira Atividade</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {rdo.atividades.map((ativ, idx) => (
                  <div
                    key={ativ.id}
                    className="bg-slate-950 p-3 sm:p-4 rounded-xl border border-slate-800 space-y-2 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-amber-400">
                        Atividade #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAtividade(ativ.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                        title="Remover atividade"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-6">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                          Descrição da Atividade *
                        </label>
                        <input
                          type="text"
                          value={ativ.descricao}
                          onChange={(e) => handleUpdateAtividade(ativ.id, 'descricao', e.target.value)}
                          placeholder="Ex: Concretagem das vigas V12 a V18"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                          Avanço no Dia (% ou etapa)
                        </label>
                        <input
                          type="text"
                          value={ativ.percentualExecutado}
                          onChange={(e) => handleUpdateAtividade(ativ.id, 'percentualExecutado', e.target.value)}
                          placeholder="Ex: 80% da etapa, 100%"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-amber-300 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                          Local / Elemento
                        </label>
                        <input
                          type="text"
                          value={ativ.localizacao || ''}
                          onChange={(e) => handleUpdateAtividade(ativ.id, 'localizacao', e.target.value)}
                          placeholder="Ex: 2º Pavimento - Bloco A"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. MÃO DE OBRA / EFETIVO */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Efetivo de Mão de Obra no Canteiro</span>
                </h3>
                <p className="text-xs text-slate-400">Contadores rápidos com toques de 1 clique</p>
              </div>

              <span className="font-mono text-xs font-bold bg-amber-400/10 text-amber-300 px-3 py-1 rounded-lg border border-amber-400/30">
                Total: {totalHomens} operários
              </span>
            </div>

            {/* Standard Quick Role Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {standardRoles.map((role) => {
                const item = rdo.maoDeObra.find((m) => m.funcao.toLowerCase() === role.toLowerCase());
                const count = item ? item.quantidade : 0;

                return (
                  <div
                    key={role}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between"
                  >
                    <span className="text-xs font-bold text-slate-200">{role}</span>
                    <div className="flex items-center justify-between mt-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateMaoDeObraCount(role, -1)}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-base flex items-center justify-center active:scale-95 transition-all"
                      >
                        -
                      </button>

                      <span className="font-mono text-base font-bold text-amber-400">{count}</span>

                      <button
                        type="button"
                        onClick={() => handleUpdateMaoDeObraCount(role, 1)}
                        className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base flex items-center justify-center active:scale-95 transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. EQUIPAMENTOS & MATERIAIS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Equipamentos */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>Equipamentos</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddEquipamento}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar</span>
                </button>
              </div>

              {rdo.equipamentos.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">Nenhum equipamento adicionado.</p>
              ) : (
                <div className="space-y-2">
                  {rdo.equipamentos.map((eq) => (
                    <div key={eq.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                      <input
                        type="text"
                        value={eq.nome}
                        onChange={(e) => handleUpdateEquipamento(eq.id, 'nome', e.target.value)}
                        placeholder="Ex: Betoneira 400L"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                      <input
                        type="number"
                        value={eq.quantidade}
                        onChange={(e) => handleUpdateEquipamento(eq.id, 'quantidade', Number(e.target.value) || 1)}
                        className="w-14 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-center font-mono text-amber-400"
                      />
                      <select
                        value={eq.status}
                        onChange={(e) => handleUpdateEquipamento(eq.id, 'status', e.target.value as any)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                      >
                        <option value="Operacional">Operacional</option>
                        <option value="Parado">Parado</option>
                        <option value="Em Manutenção">Em Manutenção</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveEquipamento(eq.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Materiais */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Package className="w-4 h-4 text-amber-400" />
                  <span>Materiais Recebidos / Aplicados</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddMaterial}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar</span>
                </button>
              </div>

              {rdo.materiais.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">Nenhum material registrado.</p>
              ) : (
                <div className="space-y-2">
                  {rdo.materiais.map((mat) => (
                    <div key={mat.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
                      <input
                        type="text"
                        value={mat.descricao}
                        onChange={(e) => handleUpdateMaterial(mat.id, 'descricao', e.target.value)}
                        placeholder="Ex: Concreto Usinado fck 30 MPa"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={mat.quantidade}
                        onChange={(e) => handleUpdateMaterial(mat.id, 'quantidade', e.target.value)}
                        placeholder="Ex: 16 m³"
                        className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-center font-mono text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(mat.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 5. OCORRÊNCIAS, SEGURANÇA E OBSERVAÇÕES */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
              Ocorrências, Segurança do Trabalho e Observações
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Ocorrências e Paralisações
                </label>
                <textarea
                  value={rdo.ocorrenciasParalisacoes}
                  onChange={(e) => handleUpdateRdo('ocorrenciasParalisacoes', e.target.value)}
                  placeholder="Ex: Chuva pela manhã com paralisação das 08h30 às 09h30. Atraso na entrega de caminhão betoneira..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Segurança do Trabalho & DDS
                </label>
                <textarea
                  value={rdo.segurancaTrabalho}
                  onChange={(e) => handleUpdateRdo('segurancaTrabalho', e.target.value)}
                  placeholder="Ex: DDS realizado às 07h15 sobre trabalho em altura. EPIs 100% conferidos. Zero acidentes..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Observações Técnicas Gerais
                </label>
                <textarea
                  value={rdo.observacoesGerais}
                  onChange={(e) => handleUpdateRdo('observacoesGerais', e.target.value)}
                  placeholder="Ex: Moldagem de 4 corpos de prova para teste de resistência aos 7 e 28 dias..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Advance CTA */}
          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('dados')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 px-4 rounded-xl text-xs"
            >
              ← Voltar aos Dados
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('fotos')}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-6 rounded-xl text-sm flex items-center space-x-2 shadow-md active:scale-95 transition-all"
            >
              <span>Avançar para Fotos e Revisão</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ABA 3: FOTOS E REVISÃO */}
      {/* ======================================================== */}
      {activeTab === 'fotos' && (
        <div className="space-y-6 animate-fade-in">
          {/* Fotos Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Registro Fotográfico do Dia ({rdo.fotos?.length || 0} fotos)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Fotos com legenda vinculadas ao RDO para composição do relatório e do PDF
                </p>
              </div>

              {/* Upload Controls */}
              <div className="flex items-center space-x-2">
                <label className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shadow-md active:scale-95 transition-all">
                  <Camera className="w-4 h-4" />
                  <span>Tirar / Enviar Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Photos Grid */}
            {(!rdo.fotos || rdo.fotos.length === 0) ? (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl">
                <ImageIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 mb-3">Nenhuma foto adicionada ao relatório.</p>
                <label className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-3 py-2 rounded-lg text-xs inline-flex items-center space-x-1.5 cursor-pointer">
                  <Camera className="w-4 h-4" />
                  <span>Selecionar Fotos do Canteiro</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rdo.fotos.map((foto, idx) => (
                  <div
                    key={foto.id}
                    className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between"
                  >
                    <div className="relative aspect-video bg-slate-900 overflow-hidden">
                      <img
                        src={foto.url}
                        alt={foto.legenda}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded">
                        Foto #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(foto.id)}
                        className="absolute top-2 right-2 bg-rose-500/80 hover:bg-rose-500 text-white p-1 rounded transition-colors"
                        title="Remover foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-3 space-y-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                          Legenda Descritiva da Foto *
                        </label>
                        <input
                          type="text"
                          value={foto.legenda}
                          onChange={(e) => handleUpdatePhotoLegenda(foto.id, e.target.value)}
                          placeholder="Ex: Concretagem das vigas V14..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div className="text-[10px] text-slate-500">Horário: {foto.dataHora}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Consolidated Review & Final Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
              Revisão e Finalização do RDO
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-amber-400">Status Atual do Relatório:</div>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="finalStatus"
                      value="Rascunho"
                      checked={rdo.status === 'Rascunho'}
                      onChange={() => handleUpdateRdo('status', 'Rascunho')}
                      className="text-amber-500 focus:ring-amber-500"
                    />
                    <span>Rascunho (Salvar e continuar depois)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="finalStatus"
                      value="Finalizado"
                      checked={rdo.status === 'Finalizado'}
                      onChange={() => handleUpdateRdo('status', 'Finalizado')}
                      className="text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-emerald-400 font-bold">Finalizado</span>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs text-slate-400">
                <div className="font-bold text-slate-300 mb-1">Checklist Técnico:</div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Obra e Responsável identificados</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{rdo.atividades.length} atividades informadas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{totalHomens} trabalhadores no efetivo</span>
                </div>
              </div>
            </div>

            {/* Big Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold py-3.5 px-6 rounded-xl text-sm flex items-center justify-center space-x-2 active:scale-95 transition-all"
              >
                <Save className="w-4 h-4 text-amber-400" />
                <span>Salvar Rascunho</span>
              </button>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onViewPdf}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-5 rounded-xl text-sm flex items-center justify-center space-x-2 active:scale-95 transition-all"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Visualizar PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleFinalizeRdo();
                    onDownloadPdf();
                  }}
                  className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black py-3.5 px-6 rounded-xl text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4 stroke-[3]" />
                  <span>Finalizar & Baixar PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
