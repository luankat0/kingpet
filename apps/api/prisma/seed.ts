import 'dotenv/config';

import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client';

/**
 * Deixa o sistema usável na primeira execução:
 * - a conta de acesso da equipe (sem ela não há como entrar na tela);
 * - o catálogo de serviços do petshop.
 *
 * Não cria tutores, pets nem agendamentos: esses são dados reais, cadastrados
 * pela equipe na própria tela.
 *
 * Roda quantas vezes quiser: tudo é upsert.
 */
const EQUIPE = {
    nome: process.env.SEED_USUARIO_NOME ?? 'Equipe KingPet',
    email: (process.env.SEED_USUARIO_EMAIL ?? 'equipe@kingpet.test').toLowerCase(),
    senha: process.env.SEED_USUARIO_SENHA ?? 'KingPet2026',
    funcao: process.env.SEED_USUARIO_FUNCAO ?? 'Administração',
};

const SERVICOS = [
    { nome: 'Banho', descricao: 'Higienização e secagem da pelagem.', preco: 65 },
    { nome: 'Tosa', descricao: 'Corte da pelagem e acabamento.', preco: 85 },
    { nome: 'Banho e tosa', descricao: 'Banho completo com tosa e acabamento.', preco: 120 },
    { nome: 'Consulta', descricao: 'Atendimento veterinário agendado.', preco: 140 },
    { nome: 'Vacinação', descricao: 'Aplicação de vacina em horário agendado.', preco: 95 },
];

async function main() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error('DATABASE_URL não configurada. Copie o .env.example para .env.');
    }

    const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

    try {
        const senhaHash = await bcrypt.hash(EQUIPE.senha, 12);

        await prisma.usuario.upsert({
            where: { email: EQUIPE.email },
            update: { nome: EQUIPE.nome, funcao: EQUIPE.funcao },
            create: {
                nome: EQUIPE.nome,
                email: EQUIPE.email,
                funcao: EQUIPE.funcao,
                senhaHash,
            },
        });

        for (const servico of SERVICOS) {
            await prisma.servico.upsert({
                where: { nome: servico.nome },
                update: servico,
                create: servico,
            });
        }

        console.log(`Seed concluído: conta ${EQUIPE.email} e ${SERVICOS.length} serviços.`);
        console.log('Troque a senha padrão antes de usar fora do ambiente local.');
    } finally {
        await prisma.$disconnect();
    }
}

void main();
