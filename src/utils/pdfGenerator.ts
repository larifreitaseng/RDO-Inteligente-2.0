import jsPDF from 'jspdf';
import { RDO, Obra } from '../types';

export function formatRdoNumber(seq: number): string {
  return String(seq).padStart(3, '0');
}

export function generateRdoPdf(rdo: RDO, obra: Obra): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage();
      y = margin;
      drawHeaderCompact();
    }
  };

  const drawHeaderCompact = () => {
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text(`RDO INTELIGENTE | ${obra.nome} | RDO Nº ${formatRdoNumber(rdo.numeroSequencial)}`, margin + 3, y + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${rdo.data.split('-').reverse().join('/')}`, pageWidth - margin - 3, y + 5.5, { align: 'right' });
    y += 11;
  };

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('RELATÓRIO DIÁRIO DE OBRA (RDO)', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text('Sistema RDO Inteligente • Método Larissa • Engenharia Civil', margin + 6, y + 16);

  // Status & Number Badge
  doc.setFillColor(245, 158, 11); // amber-500
  doc.roundedRect(pageWidth - margin - 45, y + 4, 40, 14, 2, 2, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`RDO Nº ${formatRdoNumber(rdo.numeroSequencial)}`, pageWidth - margin - 25, y + 10, { align: 'center' });
  doc.setFontSize(7.5);
  doc.text(`STATUS: ${rdo.status.toUpperCase()}`, pageWidth - margin - 25, y + 15, { align: 'center' });

  y += 26;

  // 1. Identificação da Obra
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 26, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('1. IDENTIFICAÇÃO DA OBRA E DO RELATÓRIO', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  const col1 = margin + 4;
  const col2 = margin + contentWidth / 2;

  doc.text(`Obra: ${obra.nome}`, col1, y + 12);
  doc.text(`Cliente / Contratante: ${obra.cliente}`, col1, y + 17);
  doc.text(`Endereço: ${obra.endereco}`, col1, y + 22);

  doc.text(`Data do RDO: ${rdo.data.split('-').reverse().join('/')}`, col2, y + 12);
  doc.text(`Responsável Técnico: ${rdo.responsavel} (${rdo.creaCau})`, col2, y + 17);
  doc.text(`Horário de Expediente: ${rdo.horarioTrabalho} ${obra.artRrt ? `| ${obra.artRrt}` : ''}`, col2, y + 22);

  y += 30;

  // 2. Condições Climáticas
  checkPageBreak(22);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. CONDIÇÕES CLIMÁTICAS', margin + 3, y + 4.5);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(`• Manhã: ${rdo.climaManha || 'Não informado'}    |    • Tarde: ${rdo.climaTarde || 'Não informado'}`, margin + 4, y);
  y += 5;
  if (rdo.observacaoClima) {
    doc.text(`• Observação climática: ${rdo.observacaoClima}`, margin + 4, y);
    y += 5;
  }
  y += 3;

  // 3. Atividades Desenvolvidas
  checkPageBreak(30);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. ATIVIDADES DESENVOLVIDAS E AVANÇO FÍSICO DIÁRIO', margin + 3, y + 4.5);
  y += 9;

  if (rdo.atividades.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Nenhuma atividade registrada no dia.', margin + 4, y);
    y += 6;
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Descrição da Atividade', margin + 4, y);
    doc.text('Local / Setor', margin + 110, y);
    doc.text('Avanço no Dia', margin + 155, y);
    y += 4;
    doc.setDrawColor(203, 213, 225);
    doc.line(margin + 4, y - 1, margin + contentWidth - 4, y - 1);
    y += 3;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    rdo.atividades.forEach((ativ, idx) => {
      checkPageBreak(10);
      const descLines = doc.splitTextToSize(`${idx + 1}. ${ativ.descricao}`, 100);
      doc.text(descLines, margin + 4, y);
      doc.text(ativ.localizacao || '-', margin + 110, y);
      doc.text(ativ.percentualExecutado || '-', margin + 155, y);
      y += Math.max(descLines.length * 4.5, 6);
    });
  }
  y += 4;

  // 4. Efetivo / Mão de Obra
  checkPageBreak(25);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('4. EFETIVO DE MÃO DE OBRA NO CANTEIRO', margin + 3, y + 4.5);
  y += 9;

  if (rdo.maoDeObra.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Sem registro de efetivo.', margin + 4, y);
    y += 6;
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);

    const totalHomens = rdo.maoDeObra.reduce((acc, curr) => acc + (Number(curr.quantidade) || 0), 0);
    const moText = rdo.maoDeObra.map((m) => `${m.funcao}: ${m.quantidade}`).join('  |  ');
    const moLines = doc.splitTextToSize(moText, contentWidth - 8);
    doc.text(moLines, margin + 4, y);
    y += moLines.length * 4.5 + 2;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`Total de trabalhadores presentes no dia: ${totalHomens} profissionais`, margin + 4, y);
    y += 7;
  }

  // 5. Equipamentos & Materiais
  checkPageBreak(25);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('5. EQUIPAMENTOS E MATERIAIS RECEBIDOS / UTILIZADOS', margin + 3, y + 4.5);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Equipamentos:', margin + 4, y);
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  if (rdo.equipamentos.length === 0) {
    doc.text('Nenhum equipamento registrado.', margin + 4, y);
    y += 5;
  } else {
    const eqText = rdo.equipamentos.map((e) => `${e.nome} (${e.quantidade}x - ${e.status})`).join('  |  ');
    const eqLines = doc.splitTextToSize(eqText, contentWidth - 8);
    doc.text(eqLines, margin + 4, y);
    y += eqLines.length * 4.5 + 2;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Materiais:', margin + 4, y);
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  if (rdo.materiais.length === 0) {
    doc.text('Nenhum material registrado.', margin + 4, y);
    y += 5;
  } else {
    const matText = rdo.materiais
      .map((m) => `${m.descricao} (${m.quantidade}${m.fornecedor ? ` - ${m.fornecedor}` : ''})`)
      .join('  |  ');
    const matLines = doc.splitTextToSize(matText, contentWidth - 8);
    doc.text(matLines, margin + 4, y);
    y += matLines.length * 4.5 + 2;
  }
  y += 3;

  // 6. Ocorrências, Segurança e Observações
  checkPageBreak(35);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('6. OCORRÊNCIAS, SEGURANÇA DO TRABALHO E OBSERVAÇÕES', margin + 3, y + 4.5);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Ocorrências e Paralisações:', margin + 4, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const ocorrenciasText = rdo.ocorrenciasParalisacoes || 'Sem interrupções ou paralisações reportadas.';
  const ocorrenciasLines = doc.splitTextToSize(ocorrenciasText, contentWidth - 8);
  doc.text(ocorrenciasLines, margin + 4, y);
  y += ocorrenciasLines.length * 4.5 + 3;

  checkPageBreak(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Segurança do Trabalho & DDS:', margin + 4, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  const segText = rdo.segurancaTrabalho || 'Procedimentos de segurança e uso de EPIs mantidos de acordo com as normas NR-18.';
  const segLines = doc.splitTextToSize(segText, contentWidth - 8);
  doc.text(segLines, margin + 4, y);
  y += segLines.length * 4.5 + 3;

  if (rdo.observacoesGerais) {
    checkPageBreak(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Observações Técnicas Gerais:', margin + 4, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    const obsLines = doc.splitTextToSize(rdo.observacoesGerais, contentWidth - 8);
    doc.text(obsLines, margin + 4, y);
    y += obsLines.length * 4.5 + 3;
  }
  y += 4;

  // 7. Registro Fotográfico (se houver fotos)
  if (rdo.fotos && rdo.fotos.length > 0) {
    checkPageBreak(40);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`7. REGISTRO FOTOGRÁFICO (${rdo.fotos.length} ${rdo.fotos.length === 1 ? 'imagem' : 'imagens'})`, margin + 3, y + 4.5);
    y += 9;

    rdo.fotos.forEach((foto, i) => {
      checkPageBreak(16);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(`Foto ${i + 1}: ${foto.legenda || 'Sem legenda'}`, margin + 4, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Horário de registro: ${foto.dataHora} ${foto.etiqueta ? `| Categoria: ${foto.etiqueta}` : ''}`, margin + 4, y);
      y += 6;
    });
  }

  // 8. Assinaturas
  checkPageBreak(35);
  y += 5;
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, margin + contentWidth, y);
  y += 14;

  const signWidth = 75;
  const signCol1 = margin + 10;
  const signCol2 = pageWidth - margin - signWidth - 10;

  // Assinatura 1
  doc.setDrawColor(100, 116, 139);
  doc.line(signCol1, y, signCol1 + signWidth, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(rdo.responsavel, signCol1 + signWidth / 2, y + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Responsável Técnico - ${rdo.creaCau}`, signCol1 + signWidth / 2, y + 8, { align: 'center' });

  // Assinatura 2
  doc.line(signCol2, y, signCol2 + signWidth, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Fiscalização / Contratante', signCol2 + signWidth / 2, y + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(obra.cliente, signCol2 + signWidth / 2, y + 8, { align: 'center' });

  // Footer / Metadados
  y += 18;
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Documento emitido eletronicamente pelo Sistema RDO Inteligente (Método Larissa) em ${new Date().toLocaleString('pt-BR')}`,
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  );

  // Trigger download
  const fileName = `RDO_${formatRdoNumber(rdo.numeroSequencial)}_${obra.nome.replace(/\s+/g, '_')}_${rdo.data}.pdf`;
  doc.save(fileName);
}
