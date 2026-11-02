export interface Obra {
  id: string;
  nome: string;
  cliente: string;
  endereco: string;
  responsavelTecnico: string;
  creaCau: string;
  artRrt?: string;
  status: 'Em andamento' | 'Paralisada' | 'Concluída';
  dataInicio: string;
  dataPrevisaoTermino?: string;
  criadoEm: string;
}

export interface AtividadeItem {
  id: string;
  descricao: string;
  percentualExecutado: string; // Ex: "80% da etapa", "100%", "25%"
  localizacao?: string; // Ex: "Vigas do 2º pavimento", "Bloco A"
}

export interface MaoDeObraItem {
  id: string;
  funcao: string;
  quantidade: number;
}

export interface EquipamentoItem {
  id: string;
  nome: string;
  quantidade: number;
  status: 'Operacional' | 'Parado' | 'Em Manutenção';
}

export interface MaterialItem {
  id: string;
  descricao: string;
  quantidade: string;
  fornecedor?: string;
}

export interface FotoRDO {
  id: string;
  url: string; // data URL or image path
  legenda: string;
  dataHora: string;
  etiqueta?: string;
}

export type StatusRDO = 'Rascunho' | 'Finalizado';

export interface RDO {
  id: string;
  obraId: string;
  numeroSequencial: number; // Ex: 1 -> "001"
  data: string; // YYYY-MM-DD
  responsavel: string;
  creaCau: string;
  cargo: string;
  status: StatusRDO;
  horarioTrabalho: string;

  // Clima
  climaManha: 'Ensolarado' | 'Nublado' | 'Chuvoso' | 'Impraticável' | string;
  climaTarde: 'Ensolarado' | 'Nublado' | 'Chuvoso' | 'Impraticável' | string;
  observacaoClima: string;

  // Atividades
  atividades: AtividadeItem[];

  // Mão de obra, Equipamentos, Materiais
  maoDeObra: MaoDeObraItem[];
  equipamentos: EquipamentoItem[];
  materiais: MaterialItem[];

  // Ocorrências, Segurança, Observações
  ocorrenciasParalisacoes: string;
  segurancaTrabalho: string;
  observacoesGerais: string;

  // Fotos
  fotos: FotoRDO[];

  // Assinaturas
  assinaturaResponsavel?: string;
  assinaturaFiscalizacao?: string;

  // Metadados
  criadoEm: string;
  atualizadoEm: string;
  relatoOriginalIA?: string;
}

export interface ParsedRDOFromAI {
  transcricaoIdentificada?: string;
  climaManha?: string;
  climaTarde?: string;
  observacaoClima?: string;
  atividades: {
    descricao: string;
    percentualExecutado?: string;
    localizacao?: string;
  }[];
  maoDeObra: {
    funcao: string;
    quantidade: number;
  }[];
  equipamentos?: {
    nome: string;
    quantidade?: number;
    status?: string;
  }[];
  materiais?: {
    descricao: string;
    quantidade?: string;
  }[];
  ocorrenciasParalisacoes?: string;
  segurancaTrabalho?: string;
  observacoesGerais?: string;
  requerConfirmacao: string[];
}

export interface UserSession {
  email: string;
  nome: string;
  crea: string;
  cargo: string;
}
