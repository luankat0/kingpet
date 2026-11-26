# King Pet

Sistema de petshop: cadastro de tutores, pets, catálogo de serviços e
agendamentos.

Monorepo com npm workspaces:

| Pasta      | O que é           | Stack                                  |
| ---------- | ----------------- | -------------------------------------- |
| `apps/web` | Front end         | Angular 21 + PrimeNG                   |
| `apps/api` | Back end (API)    | NestJS 11 + Prisma 7 + PostgreSQL 17   |

## Pré-requisitos

- **Node.js 22+** e **npm 11+** (`node -v`, `npm -v`)
- **Docker Desktop** (traz o `docker compose`)
- **Git**

## Jeito mais rápido: banco e API no Docker

Tudo a partir da **raiz do projeto**.

```powershell
docker compose up -d --build
```

Isso sobe:

| Serviço | Onde atende             | O que faz                                  |
| ------- | ----------------------- | ------------------------------------------ |
| `db`    | `localhost:5432`        | PostgreSQL com os dados em um volume       |
| `api`   | `localhost:3000`        | API; aplica as migrations sozinha ao subir |

Crie a conta de acesso e o catálogo de serviços (uma vez):

```powershell
docker compose exec api npm run db:seed
```

O seed cria **uma** conta para entrar no sistema:

| E-mail                | Senha         |
| --------------------- | ------------- |
| `equipe@kingpet.test` | `KingPet2026` |

Troque essa senha antes de usar fora da sua máquina (o seed aceita
`SEED_USUARIO_EMAIL` e `SEED_USUARIO_SENHA`). O seed **não** cria tutores,
pets nem agendamentos: esses você cadastra pelas telas.

Confira se está no ar:

```powershell
curl http://localhost:3000/health
```

A documentação das rotas (Swagger) fica em <http://localhost:3000/docs>.

Agora instale as dependências e suba o front end:

```powershell
npm install
```

```powershell
npm run dev:web
```

O site abre em <http://localhost:4200>. Ele conversa com a API pelo caminho
`/api`, que o servidor de desenvolvimento do Angular encaminha para
`localhost:3000` (veja `apps/web/proxy.conf.json`) — por isso a API precisa
estar de pé antes de você usar as telas.

### Comandos do dia a dia no Docker

```powershell
docker compose logs -f api
```

```powershell
docker compose restart api
```

```powershell
docker compose down
```

Para apagar também o banco (zera tudo):

```powershell
docker compose down -v
```

## Já tem PostgreSQL instalado na máquina?

Se você já tem um Postgres nativo rodando (o instalador do Windows, por
exemplo), pode usar ele e não subir o container do banco. Crie o usuário e o
banco **uma vez**, com o seu superusuário do Postgres:

```powershell
psql -U postgres -c "CREATE USER petshop WITH PASSWORD 'petshop_dev';"
```

```powershell
psql -U postgres -c "CREATE DATABASE petshop OWNER petshop;"
```

Depois siga o **Jeito alternativo** abaixo, pulando o
`docker compose up -d db`: o `DATABASE_URL` do `.env.example` já aponta para
`localhost:5432`. Assim você não precisa de Docker para nada.

Nesse caso **não** suba o container `db` junto, senão os dois disputam a porta
5432 — ou publique o container em outra porta com `DB_PORT` (veja Problemas
comuns).

## Jeito alternativo: só o banco no Docker, API e front na máquina

Útil para desenvolver no back end com hot reload.

1. Suba apenas o banco:

```powershell
docker compose up -d db
```

2. Instale as dependências (na raiz):

```powershell
npm install
```

3. Crie o `.env` da API a partir do exemplo:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

Abra `apps/api/.env` e preencha `JWT_SECRET` com qualquer texto secreto.

4. Gere o Prisma Client, aplique as migrations e crie a conta inicial:

```powershell
npm run db:generate -w api
```

```powershell
npm run db:deploy -w api
```

```powershell
npm run db:seed -w api
```

5. Suba a API e, em outro terminal, o front:

```powershell
npm run dev:api
```

```powershell
npm run dev:web
```

## Scripts da raiz

| Comando             | O que faz                                  |
| ------------------- | ------------------------------------------ |
| `npm run dev:api`   | API em watch mode (`localhost:3000`)       |
| `npm run dev:web`   | Front em watch mode (`localhost:4200`)     |
| `npm run build:api` | Compila a API em `apps/api/dist`           |
| `npm run build:web` | Compila o front                            |

Scripts do banco (rodam dentro do workspace da API, com `-w api`):
`db:generate`, `db:migrate`, `db:deploy`, `db:seed`, `db:reset`.

Testes:

```powershell
npm test -w api
```

```powershell
npm test -w web
```

## Variáveis de ambiente da API

Ficam em `apps/api/.env` (veja `apps/api/.env.example`). No Docker elas vêm
do `compose.yaml`.

| Variável       | Para que serve                                  |
| -------------- | ----------------------------------------------- |
| `DATABASE_URL` | Conexão com o PostgreSQL                        |
| `JWT_SECRET`   | Chave que assina os tokens de login             |
| `PORT`         | Porta da API (padrão `3000`)                    |
| `WEB_ORIGIN`   | Origem liberada no CORS (padrão `:4200`)        |

Para trocar o segredo do JWT no Docker, defina `JWT_SECRET` antes de subir:

```powershell
$env:JWT_SECRET = "um-segredo-bem-grande"; docker compose up -d
```

## Rotas da API

O detalhamento está em [apps/api/README.md](apps/api/README.md) e no Swagger
(<http://localhost:3000/docs>). Em resumo:

| Prefixo         | O que cobre                                      |
| --------------- | ------------------------------------------------ |
| `/auth`         | Login da equipe e dados do usuário da sessão     |
| `/tutores`      | Cadastro de clientes do petshop                  |
| `/pets`         | Pets de cada tutor                               |
| `/servicos`     | Serviços oferecidos e preços                     |
| `/produtos`     | Produtos e estoque                               |
| `/agendamentos` | Atendimentos: data, pet, serviço e situação      |
| `/health`       | Status da API e do banco                         |

## Organização do trabalho

| Branch                 | Responsável | Escopo    |
| ---------------------- | ----------- | --------- |
| `main`                 | —           | integração |
| `Feature/BackEnd-Levi` | Levi        | API       |
| `levi-branch`          | Levi        | base      |

## Problemas comuns

**`docker compose up` reclama que a porta 5432 ou 3000 está em uso**
Já existe um Postgres ou um servidor Node rodando na máquina. Duas saídas:
pare o serviço local, ou publique o container em outra porta:

```powershell
$env:DB_PORT = "5433"; $env:API_PORT = "3001"; docker compose up -d
```

Se mudar a `API_PORT`, ajuste também o `target` em `apps/web/proxy.conf.json`.
Para descobrir quem está na porta: `Get-NetTCPConnection -LocalPort 5432`.

**O front mostra "Não foi possível conectar à API"**
Confira se a API está de pé (`docker compose ps` ou `curl http://localhost:3000/health`).
O front chama `/api` e o proxy do Angular repassa para `localhost:3000`; se você
mudou a porta da API, ajuste `apps/web/proxy.conf.json`.

**A tela de login recusa o acesso**
Rode o seed (`npm run db:seed -w api` ou `docker compose exec api npm run db:seed`):
sem ele não existe nenhuma conta cadastrada.

**`npm install` falha no `bcrypt` no Windows**
O `bcrypt` compila código nativo e não gosta de caminhos com acento nem de
pastas sincronizadas pelo OneDrive. Rode `npm rebuild bcrypt` ou clone o
projeto em um caminho simples, por exemplo `C:\dev\kingpet`. No Docker isso
não acontece.

**Mudei o `schema.prisma` e a API não vê o campo novo**
Rode `npm run db:migrate -w api` (cria a migration) e
`npm run db:generate -w api` (regera o client).
