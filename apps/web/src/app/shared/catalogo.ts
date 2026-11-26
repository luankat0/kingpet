import { Dados, Registro, Tipo, disponibilidade, moeda, dia, hora } from '../core/models';

export const catalogo = {
    tutores: {
        nome: 'Tutores',
        singular: 'Tutor',
        novo: 'Novo tutor',
        icone: 'users',
        descricao: 'Contatos, endereços e pets de cada tutor.',
        colunas: ['nome', 'contato', 'telefone'],
    },
    pets: {
        nome: 'Pets',
        singular: 'Pet',
        novo: 'Novo pet',
        icone: 'heart',
        descricao: 'Identificação dos pets e vínculo com seus tutores.',
        colunas: ['nome', 'especie', 'raca', 'sexo', 'tutor'],
    },
    servicos: {
        nome: 'Serviços',
        singular: 'Serviço',
        novo: 'Novo serviço',
        icone: 'briefcase',
        descricao: 'Serviços disponíveis para agendamento e seus preços.',
        colunas: ['nome', 'descricao', 'preco'],
    },
    produtos: {
        nome: 'Produtos',
        singular: 'Produto',
        novo: 'Novo produto',
        icone: 'box',
        descricao: 'Catálogo de produtos e disponibilidade no estoque.',
        colunas: ['nome', 'preco', 'estoque', 'situacao'],
    },
    agendamentos: {
        nome: 'Agendamentos',
        singular: 'Agendamento',
        novo: 'Novo agendamento',
        icone: 'calendar',
        descricao: 'Organize horários e acompanhe a situação dos atendimentos.',
        colunas: ['dataHora', 'pet', 'tutor', 'servico', 'status'],
    },
} as const;
export const rotulos: Record<string, string> = {
    nome: 'Nome',
    contato: 'Contato',
    telefone: 'Telefone',
    endereco: 'Endereço',
    especie: 'Espécie',
    raca: 'Raça',
    sexo: 'Sexo',
    tutor: 'Tutor',
    pet: 'Pet',
    servico: 'Serviço',
    descricao: 'Descrição',
    preco: 'Preço',
    estoque: 'Estoque',
    situacao: 'Disponibilidade',
    dataHora: 'Data e hora',
    status: 'Status',
    tutorId: 'Tutor',
    petId: 'Pet',
    servicoId: 'Serviço',
};
export type Linha = Record<string, string | number> & { id: string };
export function linha(row: Registro, db: Dados): Linha {
    const out: Linha = { ...row };
    if ('tutorId' in row) out['tutor'] = db.tutores.find((t) => t.id === row.tutorId)?.nome ?? '—';
    if ('petId' in row) {
        out['pet'] = db.pets.find((p) => p.id === row.petId)?.nome ?? '—';
        out['servico'] = db.servicos.find((s) => s.id === row.servicoId)?.nome ?? '—';
    }
    if ('estoque' in row) out['situacao'] = disponibilidade(row.estoque);
    return out;
}
export function exibir(key: string, v: string | number) {
    if (key === 'preco') return moeda(Number(v));
    if (key === 'dataHora') return dia(v.toString()) + ' · ' + hora(v.toString());
    return v;
}
export function tituloRegistro(tipo: Tipo, row: Linha) {
    return String(
        tipo === 'agendamentos'
            ? row['pet'] + ' · ' + exibir('dataHora', row['dataHora'])
            : row['nome'],
    );
}
export function tom(v: string | number) {
    switch (v) {
        case 'Concluído':
        case 'Em estoque':
            return 'success';
        case 'Em atendimento':
        case 'Estoque baixo':
            return 'warn';
        case 'Sem estoque':
            return 'danger';
        case 'Confirmado':
            return 'info';
        case 'Cancelado':
            return 'secondary';
        default:
            return 'contrast';
    }
}
