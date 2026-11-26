import { Dados, Status } from './models';

export function demonstracao(): Dados {
    const nomes = [
        'Ana Ribeiro',
        'Bruno Lima',
        'Carolina Moura',
        'Davi Rocha',
        'Elisa Costa',
        'Felipe Melo',
        'Gabriela Sá',
        'Hugo Andrade',
    ];
    const tutores = nomes.map((nome, i) => ({
        id: 't' + i,
        nome,
        contato: 'tutor' + (i + 1) + '@example.test',
        telefone: '(81) 99990-000' + i,
        endereco: 'Rua das Acácias, ' + (10 + i) + ' — Recife, PE',
    }));
    const pets = [
        ['Amora', 'Cão', 'Shih-tzu', 'Fêmea'],
        ['Bento', 'Cão', 'Golden retriever', 'Macho'],
        ['Luna', 'Gato', 'Siamês', 'Fêmea'],
        ['Thor', 'Cão', 'SRD', 'Macho'],
        ['Mel', 'Cão', 'Poodle', 'Fêmea'],
        ['Chico', 'Gato', 'SRD', 'Macho'],
        ['Nina', 'Cão', 'Spitz', 'Fêmea'],
        ['Simba', 'Gato', 'Persa', 'Macho'],
        ['Pipoca', 'Coelho', 'Mini lop', 'Fêmea'],
        ['Sol', 'Gato', 'SRD', 'Macho'],
    ].map(([nome, especie, raca, sexo], i) => ({
        id: 'p' + i,
        nome,
        especie,
        raca,
        sexo,
        tutorId: tutores[i % nomes.length].id,
    }));
    const servicos = [
        { nome: 'Banho', descricao: 'Higienização e secagem da pelagem.', preco: 65 },
        { nome: 'Tosa', descricao: 'Corte da pelagem e acabamento.', preco: 85 },
        { nome: 'Consulta', descricao: 'Atendimento veterinário agendado.', preco: 140 },
        { nome: 'Vacinação', descricao: 'Serviço de vacinação agendado.', preco: 95 },
    ].map((v, i) => ({ ...v, id: 's' + i }));
    const produtos = [
        {
            nome: 'Ração para gatos',
            descricao: 'Pacote de 1 kg para gatos adultos.',
            preco: 42.9,
            estoque: 3,
        },
        {
            nome: 'Shampoo neutro',
            descricao: 'Frasco de 500 ml para cães.',
            preco: 32.5,
            estoque: 0,
        },
        {
            nome: 'Bola de borracha',
            descricao: 'Brinquedo de porte médio.',
            preco: 18,
            estoque: 15,
        },
        {
            nome: 'Ração para cães',
            descricao: 'Pacote de 3 kg para cães adultos.',
            preco: 89.9,
            estoque: 22,
        },
        { nome: 'Antipulgas', descricao: 'Produto de uso veterinário.', preco: 54.9, estoque: 4 },
        { nome: 'Guia de passeio', descricao: 'Guia ajustável de nylon.', preco: 40, estoque: 8 },
    ].map((v, i) => ({ ...v, id: 'r' + i }));
    const turnos: [number, number, number, Status][] = [
        [0, 8, 30, 'Concluído'],
        [0, 9, 0, 'Em atendimento'],
        [0, 10, 0, 'Confirmado'],
        [0, 11, 30, 'Agendado'],
        [0, 14, 0, 'Confirmado'],
        [0, 15, 30, 'Agendado'],
        [1, 9, 0, 'Agendado'],
        [1, 14, 0, 'Confirmado'],
        [2, 10, 30, 'Agendado'],
        [-1, 13, 0, 'Cancelado'],
        [3, 9, 30, 'Agendado'],
    ];
    const agendamentos = turnos.map(([offset, h, m, status], i) => {
        const dt = new Date();
        dt.setDate(dt.getDate() + offset);
        dt.setHours(h, m, 0, 0);
        const pet = pets[i % pets.length];
        return {
            id: 'a' + i,
            petId: pet.id,
            tutorId: pet.tutorId,
            servicoId: servicos[i % servicos.length].id,
            dataHora: dt.toISOString(),
            status,
        };
    });
    return { tutores, pets, servicos, produtos, agendamentos };
}
