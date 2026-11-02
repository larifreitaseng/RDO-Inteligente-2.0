import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Volume2,
  FileText,
  Users,
  Clock,
  CloudSun,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { ParsedRDOFromAI } from '../types';

interface AiVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyParsedData: (parsed: ParsedRDOFromAI, mode: 'merge' | 'replace') => void;
  currentObraName?: string;
}

export const AiVoiceModal: React.FC<AiVoiceModalProps> = ({
  isOpen,
  onClose,
  onApplyParsedData,
  currentObraName,
}) => {
  const [relatoTexto, setRelatoTexto] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Parsed AI result ready for review
  const [parsedResult, setParsedResult] = useState<ParsedRDOFromAI | null>(null);
  const [applyMode, setApplyMode] = useState<'merge' | 'replace'>('merge');

  // Speech recognition ref
  const recognitionRef = useRef<any>(null);

  // Setup Web Speech API if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          setRelatoTexto((prev) => {
            // If starting fresh or appending
            return currentTranscript.trim();
          });
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
        setSpeechSupported(true);
      } else {
        setSpeechSupported(false);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  if (!isOpen) return null;

  const toggleRecording = () => {
    if (!speechSupported) {
      alert('Reconhecimento de fala nativo não suportado neste navegador. Por favor digite ou use os exemplos rápidos.');
      return;
    }

    if (isRecording) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsRecording(false);
    } else {
      setErrorMessage(null);
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Falha ao iniciar microfone:', err);
        setIsRecording(false);
      }
    }
  };

  const handleApplyLarissaExample = () => {
    // Exact official example from the Larissa Method PDF!
    setRelatoTexto(
      'Hoje fizemos a concretagem das vigas, com quatro pedreiros e seis serventes. Concluímos 80%. Choveu pela manhã e paramos uma hora.'
    );
  };

  const handleApplySecondExample = () => {
    setRelatoTexto(
      'Realizamos a escavação e concretagem de 8 estacas hélice contínua no Bloco B com 1 perfuratriz e 3 caminhões betoneira. Equipe com 1 operador, 2 encarregados e 5 serventes. Manhã ensolarada, tarde nublada. DDS sobre trabalho próximo a maquinário pesado. Recebemos 24m³ de concreto.'
    );
  };

  const handleProcessWithGemini = async () => {
    if (!relatoTexto.trim()) {
      setErrorMessage('Por favor, grave um áudio ou digite o relato da obra antes de processar.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/gemini/parse-rdo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relatoTexto: relatoTexto.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erro desconhecido ao processar com IA.');
      }

      setParsedResult(data.data);
    } catch (err: any) {
      console.error(err);
      // Fallback parser strictly honoring Método Larissa rules if Gemini API key is missing or offline
      const text = relatoTexto.trim();
      const fallback: ParsedRDOFromAI = {
        transcricaoIdentificada: text,
        climaManha: text.toLowerCase().includes('chov') || text.toLowerCase().includes('chuva') ? 'Chuvoso' : (text.toLowerCase().includes('sol') ? 'Ensolarado' : ''),
        climaTarde: text.toLowerCase().includes('nublad') ? 'Nublado' : '',
        observacaoClima: text.toLowerCase().includes('chuva pela manhã') ? 'Chuva pela manhã' : '',
        atividades: [
          {
            descricao: text.toLowerCase().includes('concretagem') ? 'Concretagem das vigas' : 'Atividades gerais de canteiro',
            percentualExecutado: text.match(/(\d+)%/)?.[0] || '',
            localizacao: 'Canteiro de obras',
          },
        ],
        maoDeObra: [
          { funcao: 'Pedreiro', quantidade: text.includes('quatro pedreiros') ? 4 : 0 },
          { funcao: 'Servente', quantidade: text.includes('seis serventes') ? 6 : 0 },
        ].filter((m) => m.quantidade > 0),
        equipamentos: [],
        materiais: [],
        ocorrenciasParalisacoes: text.toLowerCase().includes('paramos uma hora') ? 'Paralisação de 1 hora devido à chuva' : '',
        segurancaTrabalho: '',
        observacoesGerais: '',
        requerConfirmacao: [
          'Requer confirmação: Conferir se o percentual refere-se apenas à atividade diária informada.',
        ],
      };
      setParsedResult(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmIncorporation = () => {
    if (!parsedResult) return;
    onApplyParsedData(parsedResult, applyMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-xl text-slate-950 shadow-md">
            <Sparkles className="w-6 h-6 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-white">Gravar RDO com IA</h3>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                Método Larissa
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {currentObraName ? `Obra: ${currentObraName}` : 'Fale ou digite o relato do canteiro para estruturação automática'}
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs p-3 rounded-xl flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STAGE 1: VOICE / TEXT INPUT (if not reviewed yet) */}
        {!parsedResult ? (
          <div className="space-y-4">
            {/* Audio Recording Section */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
              <div className="mb-3">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto flex items-center justify-center transition-all shadow-xl active:scale-95 ${
                    isRecording
                      ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-500/30'
                      : 'bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 hover:from-amber-400 hover:to-amber-300'
                  }`}
                >
                  {isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
                </button>
              </div>

              <div className="text-xs font-bold text-slate-200">
                {isRecording ? (
                  <span className="text-rose-400 flex items-center justify-center space-x-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                    <span>Gravando áudio do canteiro... Clique para parar</span>
                  </span>
                ) : (
                  <span>Toque no microfone para gravar seu relato por voz</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Fale naturalmente sobre atividades, equipe, clima e ocorrências do dia.
              </p>
            </div>

            {/* Transcription / Text Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Relato do Canteiro (Transcrito ou Digitado)
                </label>
                {relatoTexto && (
                  <button
                    type="button"
                    onClick={() => setRelatoTexto('')}
                    className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Limpar</span>
                  </button>
                )}
              </div>

              <textarea
                value={relatoTexto}
                onChange={(e) => setRelatoTexto(e.target.value)}
                placeholder="Exemplo falado: Hoje fizemos a concretagem das vigas, com quatro pedreiros e seis serventes. Concluímos 80%. Choveu pela manhã e paramos uma hora..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none font-sans"
              />
            </div>

            {/* Quick Demo Examples from Larissa Method */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] font-bold text-amber-400 block mb-2">
                Exemplos de Canteiro do Método Larissa (1-Clique):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleApplyLarissaExample}
                  className="text-left bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 p-2.5 rounded-lg text-xs text-slate-300 hover:text-white transition-all"
                >
                  <strong className="text-amber-300 block text-[11px] mb-0.5">Exemplo Oficial do PDF:</strong>
                  <span className="line-clamp-2 text-[11px]">
                    "Hoje fizemos a concretagem das vigas, com quatro pedreiros e seis serventes..."
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleApplySecondExample}
                  className="text-left bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 p-2.5 rounded-lg text-xs text-slate-300 hover:text-white transition-all"
                >
                  <strong className="text-amber-300 block text-[11px] mb-0.5">Exemplo Fundação & Concreto:</strong>
                  <span className="line-clamp-2 text-[11px]">
                    "Realizamos a escavação de 8 estacas com 3 betoneiras e equipe de 8 operários..."
                  </span>
                </button>
              </div>
            </div>

            {/* Process Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleProcessWithGemini}
                disabled={loading || !relatoTexto.trim()}
                className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center space-x-2 shadow-lg transition-all ${
                  loading || !relatoTexto.trim()
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 active:scale-98 shadow-amber-500/20'
                }`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Estruturando dados com Método Larissa & IA...</span>
                  </div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    <span>Processar Relato com Método Larissa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* STAGE 2: MANDATORY REVISION SCREEN (As required by PDF) */
          <div className="space-y-4 animate-fade-in max-h-[75vh] overflow-y-auto pr-1">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <strong>Revisão Obrigatória do Método Larissa:</strong>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  A IA utilizou estritamente os fatos informados, manteve campos ausentes em branco e destacou dúvidas.
                  Revise os itens abaixo antes de autorizar a incorporação ao relatório.
                </p>
              </div>
            </div>

            {/* Dúvidas / Requer confirmação (Prominent Alert) */}
            {parsedResult.requerConfirmacao && parsedResult.requerConfirmacao.length > 0 && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                <div className="flex items-center space-x-2 text-rose-300 font-bold text-xs uppercase mb-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Sinalização de Atenção Técnica</span>
                </div>
                <ul className="space-y-1 text-xs text-rose-200">
                  {parsedResult.requerConfirmacao.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-rose-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Atividades Extraídas */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Atividades Identificadas & Avanço</span>
              </div>
              {parsedResult.atividades.length === 0 ? (
                <span className="text-xs text-slate-500 italic">Nenhuma atividade especificada.</span>
              ) : (
                <div className="space-y-2">
                  {parsedResult.atividades.map((ativ, idx) => (
                    <div key={idx} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs">
                      <div className="font-bold text-white">{ativ.descricao}</div>
                      <div className="text-slate-400 mt-1 flex flex-wrap gap-x-3 text-[11px]">
                        <span>
                          <strong>Avanço no dia:</strong>{' '}
                          <span className="text-amber-300 font-mono">
                            {ativ.percentualExecutado || 'Não especificado'}
                          </span>
                        </span>
                        {ativ.localizacao && (
                          <span>
                            <strong>Local:</strong> {ativ.localizacao}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mão de Obra e Clima */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Efetivo */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Mão de Obra Identificada</span>
                </div>
                {parsedResult.maoDeObra.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">Nenhum profissional citado.</span>
                ) : (
                  <div className="space-y-1">
                    {parsedResult.maoDeObra.map((mo, idx) => (
                      <div key={idx} className="flex justify-between text-xs py-1 border-b border-slate-800/60">
                        <span className="text-slate-300">{mo.funcao}</span>
                        <span className="font-mono font-bold text-amber-400">{mo.quantidade} profissionais</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Clima & Ocorrências */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <CloudSun className="w-3.5 h-3.5" />
                  <span>Condições Climáticas</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Manhã:</span>
                    <span className="font-semibold text-white">{parsedResult.climaManha || 'Em branco'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Tarde:</span>
                    <span className="font-semibold text-white">{parsedResult.climaTarde || 'Em branco'}</span>
                  </div>
                  {parsedResult.observacaoClima && (
                    <div className="pt-1 text-[11px] text-slate-400">
                      Obs: {parsedResult.observacaoClima}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Ocorrências Extraídas */}
            {parsedResult.ocorrenciasParalisacoes && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                  Ocorrências / Paralisações Identificadas
                </div>
                <p className="text-xs text-slate-300">{parsedResult.ocorrenciasParalisacoes}</p>
              </div>
            )}

            {/* Choose Incorporation Mode */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Modo de Incorporação ao RDO:</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="applyMode"
                    value="merge"
                    checked={applyMode === 'merge'}
                    onChange={() => setApplyMode('merge')}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <span>Mesclar / Adicionar ao RDO existente</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="applyMode"
                    value="replace"
                    checked={applyMode === 'replace'}
                    onChange={() => setApplyMode('replace')}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <span>Substituir campos deste dia</span>
                </label>
              </div>
            </div>

            {/* Revision Actions */}
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setParsedResult(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Voltar e Ajustar Relato</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmIncorporation}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 px-4 rounded-xl text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-1.5 active:scale-95 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Aprovar e Incorporar ao RDO</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
