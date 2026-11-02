import React, { useState, useEffect } from 'react';
import { Obra, RDO, UserSession, ParsedRDOFromAI } from './types';
import {
  getStoredUser,
  setStoredUser,
  getStoredObras,
  saveStoredObra,
  deleteStoredObra,
  getStoredRdos,
  saveStoredRdo,
  deleteStoredRdo,
  createBlankRdo,
} from './utils/storage';
import { generateRdoPdf } from './utils/pdfGenerator';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { PasswordRecoveryModal } from './components/PasswordRecoveryModal';
import { ObraModal } from './components/ObraModal';
import { ObrasList } from './components/ObrasList';
import { RdoList } from './components/RdoList';
import { RdoEditor } from './components/RdoEditor';
import { AiVoiceModal } from './components/AiVoiceModal';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { DEFAULT_USER } from './data/mockData';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => getStoredUser());
  const [obras, setObras] = useState<Obra[]>(() => getStoredObras());
  const [rdos, setRdos] = useState<RDO[]>(() => getStoredRdos());

  const [currentView, setCurrentView] = useState<'obras' | 'rdos' | 'editor'>('obras');
  const [selectedObraFilter, setSelectedObraFilter] = useState<string | null>(null);

  // Active RDO being edited
  const [activeRdo, setActiveRdo] = useState<RDO | null>(null);

  // Modals state
  const [isPasswordRecoveryOpen, setIsPasswordRecoveryOpen] = useState(false);
  const [isObraModalOpen, setIsObraModalOpen] = useState(false);
  const [obraToEdit, setObraToEdit] = useState<Obra | null>(null);
  const [isAiVoiceModalOpen, setIsAiVoiceModalOpen] = useState(false);
  const [isPdfPreviewModalOpen, setIsPdfPreviewModalOpen] = useState(false);
  const [pdfPreviewRdo, setPdfPreviewRdo] = useState<RDO | null>(null);

  // Refresh lists from storage on mount
  useEffect(() => {
    setObras(getStoredObras());
    setRdos(getStoredRdos());
  }, []);

  // Authentication handlers
  const handleLogin = (user: UserSession) => {
    setStoredUser(user);
    setCurrentUser(user);
    setCurrentView('obras');
  };

  const handleLogout = () => {
    setStoredUser(null);
    setCurrentUser(null);
    setActiveRdo(null);
    setCurrentView('obras');
  };

  // Obra handlers
  const handleSaveObra = (obra: Obra) => {
    const updated = saveStoredObra(obra);
    setObras(updated);
  };

  const handleDeleteObra = (obraId: string) => {
    const updated = deleteStoredObra(obraId);
    setObras(updated);
    if (selectedObraFilter === obraId) {
      setSelectedObraFilter(null);
    }
  };

  const handleOpenEditObra = (obra: Obra) => {
    setObraToEdit(obra);
    setIsObraModalOpen(true);
  };

  const handleOpenNewObra = () => {
    setObraToEdit(null);
    setIsObraModalOpen(true);
  };

  // RDO handlers
  const handleStartNewRdo = (targetObra?: Obra) => {
    if (!currentUser) return;
    const obra = targetObra || (obras.length > 0 ? obras[0] : null);
    if (!obra) {
      handleOpenNewObra();
      return;
    }

    const blank = createBlankRdo(obra, currentUser);
    const updatedList = saveStoredRdo(blank);
    setRdos(updatedList);
    setActiveRdo(blank);
    setCurrentView('editor');
  };

  const handleEditRdo = (rdo: RDO) => {
    setActiveRdo(rdo);
    setCurrentView('editor');
  };

  const handleSaveRdoChanges = (updatedRdo: RDO) => {
    const updatedList = saveStoredRdo(updatedRdo);
    setRdos(updatedList);
    setActiveRdo(updatedRdo);
  };

  const handleDeleteRdo = (id: string) => {
    const updatedList = deleteStoredRdo(id);
    setRdos(updatedList);
    if (activeRdo?.id === id) {
      setActiveRdo(null);
      setCurrentView('rdos');
    }
  };

  const handleViewPdf = (rdo: RDO) => {
    setPdfPreviewRdo(rdo);
    setIsPdfPreviewModalOpen(true);
  };

  const handleDownloadPdf = (rdo: RDO) => {
    const obra = obras.find((o) => o.id === rdo.obraId) || obras[0];
    if (obra) {
      generateRdoPdf(rdo, obra);
    }
  };

  // Navigation handlers
  const handleViewRdosOfObra = (obra: Obra) => {
    setSelectedObraFilter(obra.id);
    setCurrentView('rdos');
  };

  // Apply parsed AI Data into current or new RDO
  const handleApplyAiData = (parsed: ParsedRDOFromAI, mode: 'merge' | 'replace') => {
    let targetRdo = activeRdo;

    if (!targetRdo) {
      // Create new RDO for the first work or currently filtered work
      const obra = (selectedObraFilter && obras.find((o) => o.id === selectedObraFilter)) || obras[0];
      if (!obra || !currentUser) return;
      targetRdo = createBlankRdo(obra, currentUser);
    }

    const newAtividades = parsed.atividades.map((a, i) => ({
      id: `ativ-${Date.now()}-${i}`,
      descricao: a.descricao,
      percentualExecutado: a.percentualExecutado || '100%',
      localizacao: a.localizacao || '',
    }));

    const newMaoDeObra = parsed.maoDeObra.map((m, i) => ({
      id: `mo-${Date.now()}-${i}`,
      funcao: m.funcao,
      quantidade: m.quantidade,
    }));

    const newEquipamentos = (parsed.equipamentos || []).map((e, i) => ({
      id: `eq-${Date.now()}-${i}`,
      nome: e.nome,
      quantidade: e.quantidade || 1,
      status: (e.status as any) || 'Operacional',
    }));

    const newMateriais = (parsed.materiais || []).map((m, i) => ({
      id: `mat-${Date.now()}-${i}`,
      descricao: m.descricao,
      quantidade: m.quantidade || '',
    }));

    let updated: RDO;

    if (mode === 'replace') {
      updated = {
        ...targetRdo,
        climaManha: parsed.climaManha || targetRdo.climaManha,
        climaTarde: parsed.climaTarde || targetRdo.climaTarde,
        observacaoClima: parsed.observacaoClima || targetRdo.observacaoClima,
        atividades: newAtividades.length > 0 ? newAtividades : targetRdo.atividades,
        maoDeObra: newMaoDeObra.length > 0 ? newMaoDeObra : targetRdo.maoDeObra,
        equipamentos: newEquipamentos.length > 0 ? newEquipamentos : targetRdo.equipamentos,
        materiais: newMateriais.length > 0 ? newMateriais : targetRdo.materiais,
        ocorrenciasParalisacoes: parsed.ocorrenciasParalisacoes || targetRdo.ocorrenciasParalisacoes,
        segurancaTrabalho: parsed.segurancaTrabalho || targetRdo.segurancaTrabalho,
        observacoesGerais: parsed.observacoesGerais || targetRdo.observacoesGerais,
        relatoOriginalIA: parsed.transcricaoIdentificada,
        atualizadoEm: new Date().toISOString(),
      };
    } else {
      // Merge
      updated = {
        ...targetRdo,
        climaManha: parsed.climaManha || targetRdo.climaManha,
        climaTarde: parsed.climaTarde || targetRdo.climaTarde,
        observacaoClima: [targetRdo.observacaoClima, parsed.observacaoClima].filter(Boolean).join('. '),
        atividades: [...targetRdo.atividades, ...newAtividades],
        maoDeObra: [...targetRdo.maoDeObra, ...newMaoDeObra],
        equipamentos: [...targetRdo.equipamentos, ...newEquipamentos],
        materiais: [...targetRdo.materiais, ...newMateriais],
        ocorrenciasParalisacoes: [targetRdo.ocorrenciasParalisacoes, parsed.ocorrenciasParalisacoes]
          .filter(Boolean)
          .join('\n'),
        segurancaTrabalho: [targetRdo.segurancaTrabalho, parsed.segurancaTrabalho]
          .filter(Boolean)
          .join('\n'),
        observacoesGerais: [targetRdo.observacoesGerais, parsed.observacoesGerais]
          .filter(Boolean)
          .join('\n'),
        relatoOriginalIA: parsed.transcricaoIdentificada,
        atualizadoEm: new Date().toISOString(),
      };
    }

    const updatedList = saveStoredRdo(updated);
    setRdos(updatedList);
    setActiveRdo(updated);
    setCurrentView('editor');
  };

  // If user is not logged in: show LoginView directly (no landing page, as per PDF requirements)
  if (!currentUser) {
    return (
      <>
        <LoginView
          onLogin={handleLogin}
          onOpenPasswordRecovery={() => setIsPasswordRecoveryOpen(true)}
        />
        <PasswordRecoveryModal
          isOpen={isPasswordRecoveryOpen}
          onClose={() => setIsPasswordRecoveryOpen(false)}
          defaultEmail={DEFAULT_USER.email}
        />
      </>
    );
  }

  // Obra for active RDO
  const activeObra = obras.find((o) => o.id === activeRdo?.obraId) || obras[0];
  const previewObra = obras.find((o) => o.id === pdfPreviewRdo?.obraId) || obras[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          if (view === 'obras') {
            setSelectedObraFilter(null);
          }
        }}
        onNovoRdo={() => handleStartNewRdo()}
        onOpenAiVoice={() => setIsAiVoiceModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main View Container */}
      <main className="flex-1 pb-16">
        {currentView === 'obras' && (
          <ObrasList
            obras={obras}
            rdos={rdos}
            onSelectObraForRdo={(obra) => handleStartNewRdo(obra)}
            onViewRdosOfObra={handleViewRdosOfObra}
            onOpenNewObraModal={handleOpenNewObra}
            onEditObra={handleOpenEditObra}
            onDeleteObra={handleDeleteObra}
          />
        )}

        {currentView === 'rdos' && (
          <RdoList
            rdos={rdos}
            obras={obras}
            selectedObraFilter={selectedObraFilter}
            onSelectObraFilter={setSelectedObraFilter}
            onNovoRdo={() => handleStartNewRdo()}
            onOpenAiVoice={() => setIsAiVoiceModalOpen(true)}
            onEditRdo={handleEditRdo}
            onViewPdf={handleViewPdf}
            onDownloadPdf={handleDownloadPdf}
            onDeleteRdo={handleDeleteRdo}
          />
        )}

        {currentView === 'editor' && activeRdo && activeObra && (
          <RdoEditor
            rdo={activeRdo}
            obra={activeObra}
            obras={obras}
            currentUser={currentUser}
            onSave={handleSaveRdoChanges}
            onBack={() => setCurrentView('rdos')}
            onOpenAiVoice={() => setIsAiVoiceModalOpen(true)}
            onViewPdf={() => handleViewPdf(activeRdo)}
            onDownloadPdf={() => handleDownloadPdf(activeRdo)}
          />
        )}
      </main>

      {/* Modals */}
      <PasswordRecoveryModal
        isOpen={isPasswordRecoveryOpen}
        onClose={() => setIsPasswordRecoveryOpen(false)}
        defaultEmail={currentUser.email}
      />

      <ObraModal
        isOpen={isObraModalOpen}
        onClose={() => setIsObraModalOpen(false)}
        onSave={handleSaveObra}
        obraToEdit={obraToEdit}
        currentUser={currentUser}
      />

      <AiVoiceModal
        isOpen={isAiVoiceModalOpen}
        onClose={() => setIsAiVoiceModalOpen(false)}
        onApplyParsedData={handleApplyAiData}
        currentObraName={activeObra?.nome}
      />

      <PdfPreviewModal
        isOpen={isPdfPreviewModalOpen}
        onClose={() => setIsPdfPreviewModalOpen(false)}
        rdo={pdfPreviewRdo}
        obra={previewObra}
      />
    </div>
  );
}
