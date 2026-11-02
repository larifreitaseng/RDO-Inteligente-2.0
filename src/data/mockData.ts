import { Obra, RDO, UserSession } from '../types';

export const DEFAULT_USER: UserSession = {
  email: 'larifreitaseng@gmail.com',
  nome: 'Engª Larissa Freitas',
  crea: 'CREA-SP 5069871234/D',
  cargo: 'Engenheira Civil Responsável',
};

export const INITIAL_OBRAS: Obra[] = [
  {
    id: 'obra-1',
    nome: 'Residencial Bela Vista - Torres A e B',
    cliente: 'Incorporadora Horizonte Brasil S/A',
    endereco: 'Av. Engenheiro Luís Carlos Berrini, 1450 - Brooklin, São Paulo/SP',
    responsavelTecnico: 'Engª Larissa Freitas',
    creaCau: 'CREA-SP 5069871234/D',
    artRrt: 'ART 2802723023456789',
    status: 'Em andamento',
    dataInicio: '2025-02-10',
    dataPrevisaoTermino: '2026-12-20',
    criadoEm: '2025-02-10T08:00:00.000Z',
  },
  {
    id: 'obra-2',
    nome: 'Centro Logístico Bandeirantes - Módulo 03',
    cliente: 'Grupo LogSul Empreendimentos',
    endereco: 'Rodovia dos Bandeirantes, km 72 - Itupeva/SP',
    responsavelTecnico: 'Engª Larissa Freitas',
    creaCau: 'CREA-SP 5069871234/D',
    artRrt: 'ART 2802723098765432',
    status: 'Em andamento',
    dataInicio: '2025-06-01',
    dataPrevisaoTermino: '2027-03-30',
    criadoEm: '2025-06-01T08:00:00.000Z',
  },
  {
    id: 'obra-3',
    nome: 'Retrofit e Reforço Estrutural Edifício Mercúrio',
    cliente: 'Condomínio Comercial Mercúrio',
    endereco: 'Rua Augusta, 850 - Consolação, São Paulo/SP',
    responsavelTecnico: 'Engª Larissa Freitas',
    creaCau: 'CREA-SP 5069871234/D',
    artRrt: 'ART 2802723045612378',
    status: 'Concluída',
    dataInicio: '2024-08-15',
    dataPrevisaoTermino: '2025-05-10',
    criadoEm: '2024-08-15T08:00:00.000Z',
  },
];

export const INITIAL_RDOS: RDO[] = [
  {
    id: 'rdo-1',
    obraId: 'obra-1',
    numeroSequencial: 1,
    data: new Date().toISOString().split('T')[0],
    responsavel: 'Engª Larissa Freitas',
    creaCau: 'CREA-SP 5069871234/D',
    cargo: 'Engenheira Civil Responsável',
    status: 'Rascunho',
    horarioTrabalho: '07:00 às 17:00',
    climaManha: 'Chuvoso',
    climaTarde: 'Nublado',
    observacaoClima: 'Chuva pela manhã (08:30 às 09:30). Tempo estável no período da tarde.',
    atividades: [
      {
        id: 'ativ-1',
        descricao: 'Concretagem das vigas e laje de transição',
        percentualExecutado: '80% da etapa programada',
        localizacao: '2º Pavimento - Bloco A',
      },
      {
        id: 'ativ-2',
        descricao: 'Montagem de armadura positiva e espaçadores',
        percentualExecutado: '100%',
        localizacao: 'Vigas V12 a V18',
      },
    ],
    maoDeObra: [
      { id: 'mo-1', funcao: 'Pedreiro', quantidade: 4 },
      { id: 'mo-2', funcao: 'Servente', quantidade: 6 },
      { id: 'mo-3', funcao: 'Carpinteiro de Fôrmas', quantidade: 2 },
      { id: 'mo-4', funcao: 'Armador', quantidade: 2 },
      { id: 'mo-5', funcao: 'Encarregado Geral', quantidade: 1 },
    ],
    equipamentos: [
      { id: 'eq-1', nome: 'Caminhão Betoneira 8m³', quantidade: 2, status: 'Operacional' },
      { id: 'eq-2', nome: 'Bomba de Lança para Concreto', quantidade: 1, status: 'Operacional' },
      { id: 'eq-3', nome: 'Vibrador de Imersão 45mm', quantidade: 2, status: 'Operacional' },
    ],
    materiais: [
      { id: 'mat-1', descricao: 'Concreto Usinado fck 35 MPa com brita 1', quantidade: '16 m³', fornecedor: 'Polimix Concreto' },
      { id: 'mat-2', descricao: 'Espaçadores plásticos tipo cadeirinha', quantidade: '300 un', fornecedor: 'Gerdau' },
    ],
    ocorrenciasParalisacoes: 'Paralisação das atividades externas durante 1 hora no período matutino devido à chuva forte. Equipe remanejada para preparo de armações na área coberta.',
    segurancaTrabalho: 'DDS matutino com foco em "Concretagem Segura e Trabalho Próximo a Bordas de Laje". Verificação de linha de vida e guarda-corpo. Zero incidentes registrados.',
    observacoesGerais: 'Slump test conferido no caminhão betoneira (12 ± 2 cm). Corpos de prova moldados (4 amostras por caminhão) para ensaios aos 7 e 28 dias.',
    fotos: [
      {
        id: 'foto-1',
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=800&q=80',
        legenda: 'Concretagem das vigas V14 e V15 do 2º pavimento com bomba de lança',
        dataHora: `${new Date().toISOString().split('T')[0]} 10:45`,
        etiqueta: 'Estrutura',
      },
      {
        id: 'foto-2',
        url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
        legenda: 'Equipe de armadores e conferência de espaçadores plásticos',
        dataHora: `${new Date().toISOString().split('T')[0]} 08:15`,
        etiqueta: 'Armação',
      },
    ],
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
];
