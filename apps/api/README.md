# King Pet — API

API REST do King Pet (back-office de petshop), em NestJS + Prisma + PostgreSQL.

A equipe do petshop faz login e administra tutores, pets, serviços, produtos e
agendamentos. É essa API que o front end (`apps/web`) consome: os nomes dos
campos e os rótulos de status são os mesmos da tela, sem tradução no meio.

## Como rodar

O passo a passo completo está no [README da raiz](../../README.md). Em resumo,
a partir da raiz do monorepo:

```bash
docker compose up -d --build
npm run db:seed -w api
```

A API fica em `http://localhost:3000` e o Swagger em
`http://localhost:3000/docs`.

## Scripts úteis (`-w api`)

| Script        | O que faz                                        |
| ------------- | ------------------------------------------------ |
| `start:dev`   | API em watch mode                                |
| `build`       | Compila para `dist/`                             |
| `test`        | Testes unitários (Jest)                          |
| `db:generate` | Gera o Prisma Client em `src/generated/prisma`   |
| `db:migrate`  | Cria/aplica migration em desenvolvimento         |
| `db:deploy`   | Aplica as migrations existentes                  |
| `db:seed`     | Cria a conta da equipe e o catálogo de serviços  |
| `db:reset`    | Recria o banco do zero                           |

## Modelo de dados

```
Usuario (login da equipe)

Tutor 1—N Pet
  └─ 1—N Agendamento N—1 Servico
Pet   1—N Agendamento

Produto (catálogo próprio, sem vínculo)
```

- **Usuario** — conta de acesso de quem trabalha no petshop: nome, e-mail,
  hash da senha e `funcao` (texto exibido no perfil).
- **Tutor** — cliente do petshop: nome, contato, telefone e endereço. **Não
  tem login**; é um cadastro feito pela equipe.
- **Pet** — pertence a um tutor: nome, espécie, raça e sexo (textos livres,
  iguais aos selects da tela).
- **Servico** — nome (único), descrição e preço.
- **Produto** — nome (único), descrição, preço e estoque.
- **Agendamento** — liga tutor, pet e serviço em uma data/hora, com `status`
  em um dos rótulos: `Agendado`, `Confirmado`, `Em atendimento`, `Concluído`
  ou `Cancelado`.

O preço é `DECIMAL(10,2)` no banco e sai como **número** no JSON, que é o que
o front espera.

## Endpoints

Todas as rotas exigem `Authorization: Bearer <access_token>`, menos
`POST /auth/login`, `POST /auth/register`, `GET /` e `GET /health`.

### Status

| Método | Rota      | Descrição                       |
| ------ | --------- | ------------------------------- |
| GET    | `/`       | Identificação da API            |
| GET    | `/health` | Checa API + conexão com o banco |

### Autenticação (`/auth`)

| Método | Rota             | Descrição                                   |
| ------ | ---------------- | ------------------------------------------- |
| POST   | `/auth/register` | Cria conta da equipe (nome, e-mail, senha)  |
| POST   | `/auth/login`    | Devolve `access_token` + dados do usuário   |
| GET    | `/auth/me`       | Usuário autenticado (`id, nome, email, funcao`) |

### Cadastros

Os cinco cadastros seguem o mesmo desenho REST:

| Método | Rota             | Descrição               |
| ------ | ---------------- | ----------------------- |
| GET    | `/<recurso>`     | Lista tudo              |
| GET    | `/<recurso>/:id` | Consulta um registro    |
| POST   | `/<recurso>`     | Cadastra                |
| PATCH  | `/<recurso>/:id` | Atualiza (campos parciais) |
| DELETE | `/<recurso>/:id` | Exclui (204)            |

Recursos: `/tutores`, `/pets`, `/servicos`, `/produtos`, `/agendamentos`.
`GET /pets` aceita `?tutorId=<uuid>` para filtrar os pets de um tutor.

## Regras garantidas no servidor

Eram validações só do navegador; agora o servidor também recusa:

- **Tutor** — telefone com 10 ou 11 dígitos; o texto é guardado como veio da
  tela, com máscara.
- **Pet** — o tutor precisa existir. Trocar o tutor de um pet que já tem
  agendamentos é recusado (409), senão o histórico ficaria apontando para o
  tutor antigo.
- **Serviço / Produto** — nome único (409 em duplicidade) e preço ≥ 0; o
  estoque do produto é inteiro ≥ 0.
- **Agendamento** — tutor e serviço precisam existir, e **o pet precisa ser
  do tutor informado**; a data precisa ser válida e o status precisa ser um
  dos cinco rótulos. Na atualização o trio tutor/pet/serviço é revalidado
  inteiro, porque trocar só uma das pontas também quebra o vínculo.
- **Exclusões** — tutor com pets ou agendamentos é recusado (409); pet ou
  serviço com agendamentos também. As mensagens são as mesmas que a tela já
  mostrava.

## Variáveis de ambiente

Veja `.env.example`. O seed aceita `SEED_USUARIO_NOME`, `SEED_USUARIO_EMAIL`,
`SEED_USUARIO_SENHA` e `SEED_USUARIO_FUNCAO` para criar a conta inicial com
outros valores.
