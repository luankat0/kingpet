-- CreateEnum
CREATE TYPE "especie" AS ENUM ('CACHORRO', 'GATO', 'AVE', 'ROEDOR', 'OUTRO');

-- CreateEnum
CREATE TYPE "porte" AS ENUM ('PEQUENO', 'MEDIO', 'GRANDE');

-- CreateEnum
CREATE TYPE "status_agendamento" AS ENUM ('AGENDADO', 'CONCLUIDO', 'CANCELADO');

-- CreateTable
CREATE TABLE "pets" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "especie" "especie" NOT NULL,
    "raca" TEXT,
    "porte" "porte",
    "data_nascimento" DATE,
    "observacoes" TEXT,
    "tutor_id" UUID NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicos" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" DECIMAL(10,2) NOT NULL,
    "duracao_minutos" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agendamentos" (
    "id" UUID NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL,
    "status" "status_agendamento" NOT NULL DEFAULT 'AGENDADO',
    "observacoes" TEXT,
    "pet_id" UUID NOT NULL,
    "servico_id" UUID NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agendamentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pets_tutor_id_idx" ON "pets"("tutor_id");

-- CreateIndex
CREATE UNIQUE INDEX "servicos_nome_key" ON "servicos"("nome");

-- CreateIndex
CREATE INDEX "agendamentos_pet_id_idx" ON "agendamentos"("pet_id");

-- CreateIndex
CREATE INDEX "agendamentos_servico_id_idx" ON "agendamentos"("servico_id");

-- CreateIndex
CREATE INDEX "agendamentos_data_hora_idx" ON "agendamentos"("data_hora");

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "servicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
