import { Dados, Registro, STATUS, TIPOS, Tipo } from './models';

export function validar(tipo: Tipo, item: Registro, db: Dados) {
    const r: Record<string, unknown> = { ...item };
    const obrigatorios = {
        tutores: ['nome', 'contato', 'telefone', 'endereco'],
        pets: ['nome', 'especie', 'raca', 'sexo', 'tutorId'],
        servicos: ['nome', 'descricao'],
        produtos: ['nome', 'descricao'],
        agendamentos: ['tutorId', 'petId', 'servicoId', 'dataHora', 'status'],
    };
    for (const campo of ['id', ...obrigatorios[tipo]]) {
        if (typeof r[campo] !== 'string' || !r[campo].trim())
            throw Error('Preencha os campos obrigatórios.');
    }
    if (tipo === 'tutores' && !/^\d{10,11}$/.test(String(r['telefone']).replace(/\D/g, '')))
        throw Error('Informe um telefone válido com DDD.');
    if (tipo === 'produtos' || tipo === 'servicos') {
        const preco = r['preco'];
        if (typeof preco !== 'number' || !Number.isFinite(preco) || preco < 0)
            throw Error('Informe um preço válido.');
    }
    if (tipo === 'produtos') {
        const estoque = r['estoque'];
        if (typeof estoque !== 'number' || !Number.isSafeInteger(estoque) || estoque < 0)
            throw Error('O estoque deve ser um inteiro positivo ou zero.');
    }
    if (
        (tipo === 'pets' || tipo === 'agendamentos') &&
        !db.tutores.some((t) => t.id === r['tutorId'])
    )
        throw Error('Selecione um tutor existente.');
    if (tipo === 'agendamentos') {
        if (!db.pets.some((p) => p.id === r['petId'] && p.tutorId === r['tutorId']))
            throw Error('O pet deve pertencer ao tutor selecionado.');
        if (!db.servicos.some((s) => s.id === r['servicoId']))
            throw Error('Selecione um serviço existente.');
        if (
            !STATUS.some((s) => s === r['status']) ||
            !Number.isFinite(Date.parse(String(r['dataHora'])))
        )
            throw Error('Revise a data e a situação do agendamento.');
    }
}
export function conferirDados(value: unknown): asserts value is Dados {
    if (!value || typeof value !== 'object') throw Error('Dados locais inválidos.');
    const db = value as Dados;
    for (const k of TIPOS) if (!Array.isArray(db[k])) throw Error('Coleção local inválida.');
    for (const k of TIPOS) {
        const ids = new Set<string>();
        for (const row of db[k]) {
            validar(k, row, db);
            if (ids.has(row.id)) throw Error('Identificador duplicado.');
            ids.add(row.id);
        }
    }
}
