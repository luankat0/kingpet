export interface Tutor {
    id: string;
    nome: string;
    contato: string;
    telefone: string;
    endereco: string;
}
export interface Pet {
    id: string;
    nome: string;
    especie: string;
    raca: string;
    sexo: string;
    tutorId: string;
}
export interface Servico {
    id: string;
    nome: string;
    descricao: string;
    preco: number;
}
export interface Produto extends Servico {
    estoque: number;
}
export const STATUS = [
    'Agendado',
    'Confirmado',
    'Em atendimento',
    'Concluído',
    'Cancelado',
] as const;
export type Status = (typeof STATUS)[number];
export interface Agendamento {
    id: string;
    tutorId: string;
    petId: string;
    servicoId: string;
    dataHora: string;
    status: Status;
}
export interface Usuario {
    id: string;
    nome: string;
    email: string;
    funcao: string;
}
export interface Sessao {
    usuarioId: string;
    inicio: string;
}
export interface Entidades {
    tutores: Tutor;
    pets: Pet;
    servicos: Servico;
    produtos: Produto;
    agendamentos: Agendamento;
}
export type Tipo = keyof Entidades;
export type Registro = Entidades[Tipo];
export type Dados = { [K in Tipo]: Entidades[K][] };
export const TIPOS: Tipo[] = ['tutores', 'pets', 'servicos', 'produtos', 'agendamentos'];
export const LIMITE_ESTOQUE = 5;
export function disponibilidade(n: number) {
    return n === 0 ? 'Sem estoque' : n <= LIMITE_ESTOQUE ? 'Estoque baixo' : 'Em estoque';
}
export const moeda = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const dia = (v: string | Date) => new Date(v).toLocaleDateString('pt-BR');
export const hora = (v: string) =>
    new Date(v).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
export function semAcentos(v: string) {
    return v
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pt-BR')
        .trim();
}
