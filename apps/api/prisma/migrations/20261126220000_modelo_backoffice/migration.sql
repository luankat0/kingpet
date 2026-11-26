-- Alinha o banco ao modelo usado pelo front end (back-office do petshop):
-- a equipe faz login (usuarios) e administra tutores, pets, serviços,
-- produtos e agendamentos. O tutor passa a ser um cliente sem login.
--
-- As colunas novas e obrigatórias entram com DEFAULT temporário para a
-- migration também rodar em um banco que já tenha registros de teste.

-- DropForeignKey
ALTER TABLE "tutores" DROP CONSTRAINT "tutores_usuario_id_fkey";

-- DropIndex
DROP INDEX "tutores_usuario_id_key";

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "funcao" TEXT NOT NULL DEFAULT 'Atendimento',
ADD COLUMN     "nome" TEXT NOT NULL DEFAULT 'Equipe KingPet';

-- AlterTable
ALTER TABLE "tutores" DROP COLUMN "usuario_id",
ADD COLUMN     "contato" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "endereco" SET DEFAULT '';
UPDATE "tutores" SET "endereco" = '' WHERE "endereco" IS NULL;
ALTER TABLE "tutores" ALTER COLUMN "endereco" SET NOT NULL;

-- CreateTable
CREATE TABLE "pets" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "especie" TEXT NOT NULL,
    "raca" TEXT NOT NULL,
    "sexo" TEXT NOT NULL,
    "tutor_id" UUID NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicos" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "servicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "estoque" INTEGER NOT NULL DEFAULT 0,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agendamentos" (
    "id" UUID NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Agendado',
    "tutor_id" UUID NOT NULL,
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
CREATE UNIQUE INDEX "produtos_nome_key" ON "produtos"("nome");

-- CreateIndex
CREATE INDEX "agendamentos_tutor_id_idx" ON "agendamentos"("tutor_id");

-- CreateIndex
CREATE INDEX "agendamentos_pet_id_idx" ON "agendamentos"("pet_id");

-- CreateIndex
CREATE INDEX "agendamentos_servico_id_idx" ON "agendamentos"("servico_id");

-- CreateIndex
CREATE INDEX "agendamentos_data_hora_idx" ON "agendamentos"("data_hora");

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_pet_id_fkey" FOREIGN KEY ("pet_id") REFERENCES "pets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos" ADD CONSTRAINT "agendamentos_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "servicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Remove os defaults temporários: a partir daqui a API sempre envia os campos.
ALTER TABLE "usuarios" ALTER COLUMN "nome" DROP DEFAULT;
ALTER TABLE "tutores" ALTER COLUMN "contato" DROP DEFAULT;
ALTER TABLE "tutores" ALTER COLUMN "endereco" DROP DEFAULT;
