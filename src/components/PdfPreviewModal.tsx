import React from 'react';
import { X, Download, Printer, HardHat, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import { RDO, Obra } from '../types';
import { formatRdoNumber, generateRdoPdf } from '../utils/pdfGenerator';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  rdo: RDO | null;
  obra: Obra | null;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  rdo,
  obra,
}) => {
  if (!isOpen || !rdo || !obra) return null;

  const handleDownload = () => {
    generateRdoPdf(rdo, obra);
  };

  const handlePrint = () => {
    window.print();
  };

  const isFinalizado = rdo.status === 'Finalizado';
  const totalEfetivo = rdo.maoDeObra.reduce((acc, curr) => acc + (Number(curr.quantidade) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl relative my-4 max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Visualização do Documento Oficial (PDF)
              </h3>
              <p className="text-xs text-slate-400">
                RDO #{formatRdoNumber(rdo.numeroSequencial)} • {obra.nome}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 shadow-md active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Baixar PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="hidden sm:flex bg-slate-800 hover:bg-slate-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable / Viewable A4 Sheet */}
        <div className="flex-1 overflow-y-auto py-4 px-1 sm:px-4">
          <div className="bg-white text-slate-900 rounded-lg shadow-xl p-6 sm:p-10 max-w-[780px] mx-auto text-xs font-sans leading-relaxed border border-slate-200">
            {/* Header Document */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900 mb-5">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-slate-900 rounded flex items-center justify-center text-amber-400">
                  <HardHat className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-slate-950 uppercase">
                    Relatório Diário de Obra (RDO)
                  </h1>
                  <p className="text-[10px] text-slate-600 font-medium">
                    Sistema RDO Inteligente • Método Larissa de Engenharia Civil • Resolução CONFEA nº 1.094
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-block bg-slate-900 text-amber-400 px-3 py-1 rounded text-sm font-black font-mono">
                  Nº {formatRdoNumber(rdo.numeroSequencial)}
                </div>
                <div className="text-[10px] font-bold text-slate-700 mt-1 uppercase">
                  Status: {rdo.status}
                </div>
              </div>
            </div>

            {/* 1. Identificação da Obra e do Relatório */}
            <div className="mb-5 bg-slate-50 border border-slate-200 rounded p-3">
              <h2 className="text-[11px] font-black uppercase text-slate-950 mb-2 border-b border-slate-200 pb-1">
                1. Identificação da Obra e do Relatório
              </h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                <div>
                  <span className="font-bold text-slate-700">Obra:</span> {obra.nome}
                </div>
                <div>
                  <span className="font-bold text-slate-700">Data do RDO:</span> {rdo.data.split('-').reverse().join('/')}
                </div>
                <div>
                  <span className="font-bold text-slate-700">Cliente / Contratante:</span> {obra.cliente}
                </div>
                <div>
                  <span className="font-bold text-slate-700">Responsável Técnico:</span> {rdo.responsavel} ({rdo.creaCau})
                </div>
                <div className="col-span-2">
                  <span className="font-bold text-slate-700">Endereço da Obra:</span> {obra.endereco || 'Não informado'}
                </div>
                <div>
                  <span className="font-bold text-slate-700">Horário de Expediente:</span> {rdo.horarioTrabalho}
                </div>
                {obra.artRrt && (
                  <div>
                    <span className="font-bold text-slate-700">ART / RRT:</span> {obra.artRrt}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Condições Climáticas */}
            <div className="mb-5">
              <h2 className="text-[11px] font-black uppercase text-slate-950 mb-2 border-b border-slate-200 pb-1">
                2. Condições Climáticas
              </h2>
              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="font-bold text-slate-700">Período da Manhã:</span> {rdo.climaManha || 'Não informado'}
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="font-bold text-slate-700">Período da Tarde:</span> {rdo.climaTarde || 'Não informado'}
                </div>
              </div>
              {rdo.observacaoClima && (
                <div className="text-[10px] text-slate-600 mt-1 italic">
                  Observações de tempo: {rdo.observacaoClima}
                </div>
              )}
            </div>

            {/* 3. Atividades Desenvolvidas & Avanço Físico */}
            <div className="mb-5">
              <h2 className="text-[11px] font-black uppercase text-slate-950 mb-2 border-b border-slate-200 pb-1">
                3. Atividades Desenvolvidas e Avanço Físico Diário
              </h2>
              {rdo.atividades.length === 0 ? (
                <p className="text-slate-500 italic text-[11px]">Nenhuma atividade registrada.</p>
              ) : (
                <table className="w-full text-left border-collapse border border-slate-200 text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800">
                      <th className="border border-slate-200 p-2 font-bold w-10">Item</th>
                      <th className="border border-slate-200 p-2 font-bold">Descrição da Atividade</th>
                      <th className="border border-slate-200 p-2 font-bold w-40">Local / Elemento</th>
                      <th className="border border-slate-200 p-2 font-bold w-32">Avanço no Dia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rdo.atividades.map((ativ, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="border border-slate-200 p-2 font-mono text-center">{idx + 1}</td>
                        <td className="border border-slate-200 p-2 font-medium">{ativ.descricao}</td>
                        <td className="border border-slate-200 p-2 text-slate-600">{ativ.localizacao || '-'}</td>
                        <td className="border border-slate-200 p-2 font-bold text-slate-900">{ativ.percentualExecutado || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* 4. Mão de Obra e Efetivo */}
            <div className="mb-5">
              <h2 className="text-[11px] font-black uppercase text-slate-950 mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span>4. Efetivo de Mão de Obra</span>
                <span className="text-[10px] font-mono text-slate-700">Total: {totalEfetivo} profissionais</span>
              </h2>
              {rdo.maoDeObra.length === 0 ? (
                <p className="text-slate-500 italic text-[11px]">Sem registro de efetivo.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {rdo.maoDeObra.map((mo, idx) => (
                    <div key={idx} className="border border-slate-200 bg-slate-50 p-2 rounded flex justify-between">
                      <span className="text-slate-700">{mo.funcao}:</span>
                      <span className="font-bold font-mono text-slate-950">{mo.quantidade}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 5. Equipamentos e Materiais */}
            <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h3 className="text-[11px] font-black uppercase text-slate-950 mb-1.5 border-b border-slate-200 pb-1">
                  5.1 Equipamentos
                </h3>
                {rdo.equipamentos.length === 0 ? (
                  <p className="text-slate-500 italic text-[10px]">Sem equipamentos registrados.</p>
                ) : (
                  <ul className="space-y-1 text-[11px]">
                    {rdo.equipamentos.map((eq, idx) => (
                      <li key={idx} className="flex justify-between border-b border-slate-100 py-0.5">
                        <span>{eq.nome}</span>
                        <span className="text-slate-600 font-mono">
                          {eq.quantidade}x ({eq.status})
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 className="text-[11px] font-black uppercase text-slate-950 mb-1.5 border-b border-slate-200 pb-1">
                  5.2 Materiais Recebidos / Aplicados
                </h3>
                {rdo.materiais.length === 0 ? (
                  <p className="text-slate-500 italic text-[10px]">Sem materiais registrados.</p>
                ) : (
                  <ul className="space-y-1 text-[11px]">
                    {rdo.materiais.map((mat, idx) => (
                      <li key={idx} className="flex justify-between border-b border-slate-100 py-0.5">
                        <span>{mat.descricao}</span>
                        <span className="text-slate-600 font-mono">{mat.quantidade}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* 6. Ocorrências e Segurança */}
            <div className="mb-5 space-y-3">
              <div>
                <h2 className="text-[11px] font-black uppercase text-slate-950 mb-1 border-b border-slate-200 pb-1">
                  6. Ocorrências e Paralisações
                </h2>
                <p className="text-[11px] text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200">
                  {rdo.ocorrenciasParalisacoes || 'Sem interrupções ou ocorrências anormais no período.'}
                </p>
              </div>

              <div>
                <h2 className="text-[11px] font-black uppercase text-slate-950 mb-1 border-b border-slate-200 pb-1">
                  7. Segurança do Trabalho & DDS
                </h2>
                <p className="text-[11px] text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200">
                  {rdo.segurancaTrabalho || 'Procedimentos de segurança e uso regular de EPIs fiscalizados em conformidade com as normas vigentes.'}
                </p>
              </div>

              {rdo.observacoesGerais && (
                <div>
                  <h2 className="text-[11px] font-black uppercase text-slate-950 mb-1 border-b border-slate-200 pb-1">
                    8. Observações Gerais da Engenharia
                  </h2>
                  <p className="text-[11px] text-slate-800 bg-slate-50 p-2.5 rounded border border-slate-200">
                    {rdo.observacoesGerais}
                  </p>
                </div>
              )}
            </div>

            {/* 7. Registro Fotográfico */}
            {rdo.fotos.length > 0 && (
              <div className="mb-6">
                <h2 className="text-[11px] font-black uppercase text-slate-950 mb-2 border-b border-slate-200 pb-1">
                  9. Registro Fotográfico Anexo ({rdo.fotos.length} registros)
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {rdo.fotos.map((foto, idx) => (
                    <div key={idx} className="border border-slate-200 rounded p-2 bg-slate-50">
                      <div className="h-32 bg-slate-200 rounded overflow-hidden mb-1.5 flex items-center justify-center">
                        <img
                          src={foto.url}
                          alt={foto.legenda}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <p className="text-[10px] font-semibold text-slate-900 leading-tight">
                        {foto.legenda || `Foto ${idx + 1}`}
                      </p>
                      <p className="text-[9px] text-slate-500 mt-0.5">
                        Registro: {foto.dataHora}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. Assinaturas */}
            <div className="pt-8 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-center mt-6">
              <div>
                <div className="border-b border-slate-600 mb-1 w-48 mx-auto" />
                <p className="font-bold text-[11px] text-slate-900">{rdo.responsavel}</p>
                <p className="text-[10px] text-slate-600">Responsável Técnico • {rdo.creaCau}</p>
              </div>

              <div>
                <div className="border-b border-slate-600 mb-1 w-48 mx-auto" />
                <p className="font-bold text-[11px] text-slate-900">Fiscalização / Contratante</p>
                <p className="text-[10px] text-slate-600">{obra.cliente}</p>
              </div>
            </div>

            <div className="mt-8 text-center text-[9px] text-slate-400 border-t border-slate-100 pt-3">
              Documento assinado e emitido digitalmente via RDO Inteligente - Método Larissa.
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-400">
            Formato de impressão em folha A4 em conformidade técnica.
          </span>
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-lg text-xs"
            >
              Fechar
            </button>
            <button
              onClick={handleDownload}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center space-x-1.5 shadow-md active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Arquivo PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
