import { Obra, RDO, UserSession } from '../types';
import { INITIAL_OBRAS, INITIAL_RDOS, DEFAULT_USER } from '../data/mockData';

const KEY_USER = 'rdo_inteligente_user';
const KEY_OBRAS = 'rdo_inteligente_obras';
const KEY_RDOS = 'rdo_inteligente_rdos';

export function getStoredUser(): UserSession | null {
  try {
    const raw = localStorage.getItem(KEY_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: UserSession | null): void {
  if (user) {
    localStorage.setItem(KEY_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(KEY_USER);
  }
}

export function getStoredObras(): Obra[] {
  try {
    const raw = localStorage.getItem(KEY_OBRAS);
    if (!raw) {
      localStorage.setItem(KEY_OBRAS, JSON.stringify(INITIAL_OBRAS));
      return INITIAL_OBRAS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_OBRAS;
  }
}

export function saveStoredObra(obra: Obra): Obra[] {
  const obras = getStoredObras();
  const index = obras.findIndex((o) => o.id === obra.id);
  let updated: Obra[];
  if (index >= 0) {
    updated = [...obras];
    updated[index] = obra;
  } else {
    updated = [obra, ...obras];
  }
  localStorage.setItem(KEY_OBRAS, JSON.stringify(updated));
  return updated;
}

export function deleteStoredObra(obraId: string): Obra[] {
  const obras = getStoredObras().filter((o) => o.id !== obraId);
  localStorage.setItem(KEY_OBRAS, JSON.stringify(obras));
  return obras;
}

export function getStoredRdos(obraId?: string): RDO[] {
  try {
    const raw = localStorage.getItem(KEY_RDOS);
    let list: RDO[] = [];
    if (!raw) {
      list = INITIAL_RDOS;
      localStorage.setItem(KEY_RDOS, JSON.stringify(INITIAL_RDOS));
    } else {
      list = JSON.parse(raw);
    }
    if (obraId) {
      return list.filter((r) => r.obraId === obraId);
    }
    return list;
  } catch {
    return INITIAL_RDOS;
  }
}

export function getStoredRdoById(id: string): RDO | undefined {
  const list = getStoredRdos();
  return list.find((r) => r.id === id);
}

export function saveStoredRdo(rdo: RDO): RDO[] {
  const list = getStoredRdos();
  const index = list.findIndex((r) => r.id === rdo.id);
  let updated: RDO[];
  const rdoWithTimestamp = {
    ...rdo,
    atualizadoEm: new Date().toISOString(),
  };

  if (index >= 0) {
    updated = [...list];
    updated[index] = rdoWithTimestamp;
  } else {
    updated = [rdoWithTimestamp, ...list];
  }
  localStorage.setItem(KEY_RDOS, JSON.stringify(updated));
  return updated;
}

export function deleteStoredRdo(id: string): RDO[] {
  const list = getStoredRdos().filter((r) => r.id !== id);
  localStorage.setItem(KEY_RDOS, JSON.stringify(list));
  return list;
}

export function getNextRdoSequencial(obraId: string): number {
  const rdos = getStoredRdos(obraId);
  if (rdos.length === 0) return 1;
  const max = Math.max(...rdos.map((r) => r.numeroSequencial || 0));
  return max + 1;
}

export function createBlankRdo(obra: Obra, user: UserSession): RDO {
  const seq = getNextRdoSequencial(obra.id);
  const hoje = new Date().toISOString().split('T')[0];

  return {
    id: `rdo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    obraId: obra.id,
    numeroSequencial: seq,
    data: hoje,
    responsavel: user.nome,
    creaCau: user.crea,
    cargo: user.cargo || 'Engenheiro Civil',
    status: 'Rascunho',
    horarioTrabalho: '07:00 às 17:00',
    climaManha: 'Ensolarado',
    climaTarde: 'Ensolarado',
    observacaoClima: '',
    atividades: [],
    maoDeObra: [
      { id: 'mo-1', funcao: 'Pedreiro', quantidade: 0 },
      { id: 'mo-2', funcao: 'Servente', quantidade: 0 },
    ],
    equipamentos: [],
    materiais: [],
    ocorrenciasParalisacoes: '',
    segurancaTrabalho: 'DDS realizado. Uso de EPIs fiscalizado. Sem acidentes.',
    observacoesGerais: '',
    fotos: [],
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };
}
