import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client';

/**
 * Popula o catálogo de serviços do petshop.
 * Roda quantas vezes quiser: usa upsert pelo nome do serviço.
 */
const SERVICOS = [
    {
        nome: 'Banho',
        descricao: 'Banho completo com secagem e perfume.',
        preco: 60,
        duracaoMinutos: 45,
    },
    {
        nome: 'Banho e tosa',
        descricao: 'Banho completo com tosa na máquina ou tesoura.',
        preco: 110,
        duracaoMinutos: 90,
    },
    {
        nome: 'Tosa higiênica',
        descricao: 'Tosa das patas, barriga e região íntima.',
        preco: 50,
        duracaoMinutos: 30,
    },
    {
        nome: 'Corte de unhas',
        descricao: 'Corte e lixamento das unhas.',
        preco: 25,
        duracaoMinutos: 15,
    },
    {
        nome: 'Consulta veterinária',
        descricao: 'Avaliação clínica com veterinário.',
        preco: 180,
        duracaoMinutos: 40,
    },
    {
        nome: 'Vacinação',
        descricao: 'Aplicação de vacina (valor da dose não incluso).',
        preco: 70,
        duracaoMinutos: 20,
    },
];

async function main() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error('DATABASE_URL não configurada. Copie o .env.example para .env.');
    }

    const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

    try {
        for (const servico of SERVICOS) {
            await prisma.servico.upsert({
                where: { nome: servico.nome },
                update: servico,
                create: servico,
            });
        }

        console.log(`Seed concluído: ${SERVICOS.length} serviços disponíveis.`);
    } finally {
        await prisma.$disconnect();
    }
}

void main();
