# King Pet — API

API REST do sistema King Pet (petshop), em NestJS + Prisma + PostgreSQL.

## Como rodar

1. Suba o banco (na raiz do monorepo):

```bash
docker compose up -d
```

2. Crie o arquivo de ambiente da API:

```bash
cp apps/api/.env.example apps/api/.env
```

Preencha `JWT_SECRET` com qualquer string secreta para o ambiente local.

3. Aplique as migrations e popule o catálogo de serviços:

```bash
npm run db:deploy -w api
npm run db:seed -w api
```

4. Suba a API em modo de desenvolvimento (na raiz):

```bash
npm run dev:api
```

A API fica em `http://localhost:3000` e a documentação Swagger em
`http://localhost:3000/docs`.

## Scripts úteis (`-w api`)

| Script        | O que faz                                         |
| ------------- | ------------------------------------------------- |
| `start:dev`   | API em watch mode                                 |
| `build`       | Compila para `dist/`                              |
| `test`        | Testes unitários (Jest)                           |
| `db:generate` | Gera o Prisma Client em `src/generated/prisma`    |
| `db:migrate`  | Cria/aplica migration em desenvolvimento          |
| `db:deploy`   | Aplica as migrations existentes                   |
| `db:seed`     | Popula o catálogo de serviços                     |
| `db:reset`    | Recria o banco do zero                            |

## Modelo de dados

```
Usuario 1—1 Tutor 1—N Pet 1—N Agendamento N—1 Servico
```

- **Usuario** — credenciais (e-mail + hash da senha).
- **Tutor** — dados pessoais do dono do pet.
- **Pet** — pertence a um tutor; espécie, raça, porte, nascimento, observações.
- **Servico** — catálogo do petshop: nome, preço, duração em minutos, ativo.
- **Agendamento** — liga pet e serviço em uma data/hora, com status
  `AGENDADO`, `CONCLUIDO` ou `CANCELADO`.

## Endpoints

Tudo que não está marcado como público exige o header
`Authorization: Bearer <access_token>`.

### Status

| Método | Rota      | Descrição                           |
| ------ | --------- | ----------------------------------- |
| GET    | `/`       | Identificação da API (público)      |
| GET    | `/health` | Checa API + conexão com o banco     |

### Autenticação (`/auth`)

| Método | Rota             | Descrição                            |
| ------ | ---------------- | ------------------------------------ |
| POST   | `/auth/register` | Cadastra usuário + tutor (público)   |
| POST   | `/auth/login`    | Devolve o `access_token` (público)   |
| GET    | `/auth/me`       | Dados do usuário autenticado         |

### Tutores (`/tutores`)

| Método | Rota            | Descrição                       |
| ------ | --------------- | ------------------------------- |
| GET    | `/tutores/me`   | Perfil do tutor autenticado     |
| PATCH  | `/tutores/me`   | Atualiza nome/telefone/endereço |

### Pets (`/pets`)

| Método | Rota         | Descrição                      |
| ------ | ------------ | ------------------------------ |
| POST   | `/pets`      | Cadastra um pet                |
| GET    | `/pets`      | Lista os pets do tutor         |
| GET    | `/pets/:id`  | Consulta um pet                |
| PATCH  | `/pets/:id`  | Atualiza um pet                |
| DELETE | `/pets/:id`  | Exclui um pet (204)            |

Um tutor só enxerga e altera os próprios pets.

### Serviços (`/servicos`)

| Método | Rota             | Descrição                                   |
| ------ | ---------------- | ------------------------------------------- |
| GET    | `/servicos`      | Catálogo (público). `?ativo=false` mostra os inativos |
| GET    | `/servicos/:id`  | Consulta um serviço (público)               |
| POST   | `/servicos`      | Cadastra um serviço                         |
| PATCH  | `/servicos/:id`  | Atualiza um serviço                         |
| DELETE | `/servicos/:id`  | Desativa o serviço (não apaga o histórico)  |

### Agendamentos (`/agendamentos`)

| Método | Rota                        | Descrição                           |
| ------ | --------------------------- | ----------------------------------- |
| POST   | `/agendamentos`             | Agenda um serviço para um pet       |
| GET    | `/agendamentos`             | Lista os agendamentos do tutor. `?status=AGENDADO` |
| GET    | `/agendamentos/:id`         | Consulta um agendamento             |
| PATCH  | `/agendamentos/:id`         | Remarca data/hora, troca serviço    |
| PATCH  | `/agendamentos/:id/cancelar`| Cancela (status `CANCELADO`)        |
| PATCH  | `/agendamentos/:id/concluir`| Conclui (status `CONCLUIDO`)        |

Regras aplicadas ao agendar:

- o pet precisa ser do tutor autenticado;
- o serviço precisa existir e estar ativo;
- a data/hora precisa ser no futuro;
- o mesmo pet não pode ter dois agendamentos abertos no mesmo horário;
- só agendamento `AGENDADO` pode ser remarcado, cancelado ou concluído.
