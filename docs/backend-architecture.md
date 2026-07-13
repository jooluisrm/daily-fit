# Arquitetura do Backend (Next.js + Prisma)

Este documento descreve o padrão arquitetural escolhido para o backend do projeto, visando manter o código organizado, testável e de fácil manutenção.

## 🏗️ Padrão Arquitetural: Camadas (Layered Architecture)

Para evitar que as rotas da API se tornem arquivos "monstro" (com validação, regras de negócio e queries de banco de dados misturadas), adotamos a separação em três camadas principais:

1.  **Controllers (Rotas / Route Handlers)**
2.  **Services (Serviços / Lógica de Negócio)**
3.  **Repositories (Repositórios / Acesso a Dados)**

---

### 1. Controllers (Rotas)
**Localização:** `app/api/.../route.ts`

**Responsabilidades:**
*   Receber a requisição HTTP (`Request`).
*   Extrair dados (params, query, body).
*   Validar os dados de entrada (ex: usando Zod).
*   Chamar o **Service** responsável passando os dados validados.
*   Tratar exceções (Try/Catch) e formatar a resposta HTTP de erro (Status Codes 400, 404, 500).
*   Retornar a resposta de sucesso (`NextResponse`).

**O que NÃO deve fazer:**
*   Escrever regras de negócio (ex: checar se o usuário tem saldo, calcular calorias).
*   Chamar o banco de dados diretamente (nada de `prisma.user.findUnique` aqui).

---

### 2. Services (Lógica de Negócios)
**Localização:** `src/backend/services/` (ex: `user.service.ts`)

**Responsabilidades:**
*   Conter o "coração" da aplicação: as regras de negócio.
*   Receber dados processados do Controller.
*   Fazer validações de negócio (ex: "O usuário já registrou hidratação hoje?").
*   Orquestrar as chamadas para os **Repositories**.
*   Lançar erros específicos (ex: `Error("UserNotFound")`) que o Controller vai capturar e transformar em HTTP 404.

**O que NÃO deve fazer:**
*   Lidar com objetos HTTP (`Request`, `Response`). Um Service deve ser testável fora de um servidor web.
*   Escrever SQL ou chamadas complexas do Prisma diretamente (ele delega isso para o Repository).

---

### 3. Repositories (Acesso a Dados)
**Localização:** `src/backend/repositories/` (ex: `user.repository.ts`)

**Responsabilidades:**
*   Isolar a dependência do Prisma ORM.
*   Realizar as operações de CRUD (Create, Read, Update, Delete) no banco de dados.
*   Retornar dados estruturados para os Services.

**O que NÃO deve fazer:**
*   Ter regras de negócio. Se houver uma lógica como "marcar usuário como VIP se tiver mais de 100 treinos", isso pertence ao Service. O Repository tem apenas métodos como `countWorkouts` e `updateVipStatus`.

---

## 🛠️ Banco de Dados e ORM

Utilizamos o **Prisma ORM**.
*   **Instância do Prisma:** A conexão com o banco não deve ser instanciada em cada arquivo. Use sempre o arquivo centralizado em `src/lib/prisma.ts`.
*   **Schema:** O modelo de dados fica em `prisma/schema.prisma`.

---

## 🚀 Exemplo de Fluxo Completo (A Rota de Teste)

Quando o front-end chama `GET /api/test`:
1.  **`app/api/test/route.ts`** recebe a requisição.
2.  Chama a função no **`src/backend/services/test.service.ts`**.
3.  O Service pode aplicar alguma lógica ou simplesmente delegar para **`src/backend/repositories/test.repository.ts`** que busca algo no banco de dados.
4.  A resposta sobe de volta (Repository -> Service -> Controller -> Frontend).
