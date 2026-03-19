# Renzas Finanças 💰

Este é um projeto pessoal de **Gerenciamento de Finanças**, desenvolvido para simular o fluxo de caixa, despesas, faturas de cartão e receitas de forma intuitiva e fácil. O projeto foi construído separando o Frontend e o Backend em pastas no modelo monorepo.

---

## 🚀 Tecnologias e Stack

A aplicação foi feita com uma stack moderna de JavaScript/TypeScript, visando estabilidade, tipagem e interfaces dinâmicas.

### Backend (Pasta `/backend`)
*   **NestJS:** Framework Node.js progressivo para construir aplicações server-side escaláveis e eficientes.
*   **TypeScript:** Garantia de forte tipagem.
*   **TypeORM:** Mapeamento objeto-relacional (ORM) para lidar com o banco de dados.
*   **PostgreSQL (via Docker):** Banco de dados relacional robusto para garantir a integridade dos saldos, chaves estrangeiras (`UUIDv4`) e operações financeiras. Subido facilmente através de um contêiner `docker-compose`.
*   **Class-Validator / Passport (JWT):** Validações estritas de DTO para segurança das rotas e controle de sessão (Autenticação JWT encapsulada em Cookies HTTP-Only).

### Frontend (Pasta `/frontend`)
*   **Next.js (App Router):** Framework React para SSR e roteamento moderno.
*   **React Query (TanStack):** Gerenciamento de estado de servidor e refetching dinâmico para garantir que os relatórios sempre exibam o saldo correto após cada alteração.
*   **Tailwind CSS:** Para uma estilização utilitária elegante, responsiva e num tema escuro (emerald wash) agradável aos olhos.
*   **Shadcn/UI & Lucide Icons:** Componentes de interface polidos, minimalistas e altamente acessíveis.
*   **Recharts:** Para renderização de gráficos em anel (Donut Charts) para visualizar a divisão percentual dos ralos de gastos.

---

## 🔥 Funcionalidades

O projeto possui todos os recursos essenciais para se observar a vida financeira:

1.  **Autenticação JWT:** Sistema seguro de Cadastro e Login. As informações e carteiras são vinculadas com privacidade a apenas o usuário autenticado.
2.  **Múltiplas Carteiras (Contas):** Crie várias contas (ex: "Nubank", "Itaú", "Carteira Física") para que cada transação afete o saldo especificamente de sua origem.
3.  **Gestão Dinâmica de Lançamentos:**
    *   Formulários Interativos em Modais.
    *   Lançamentos de Despesas (Saída) e Receitas (Entrada).
    *   Integração direta de Meios de Pagamento (`Cartão de Crédito`, `Cartão de Débito`, `PIX`).
    *   Controle de restrição matemática: Ao se usar "Cartão de Crédito", a despesa gera o relatório do gasto, porém não desconta do seu caixa/saldo instantaneamente.
4.  **Sistema de Categorias e Subcategorias Inline:** Classifique seus lançamentos em níveis (ex: `Mercado` -> `Assaí`). Crie subcategorias magicamente direto da guia de nova transação.
5.  **Dashboard Visual com Filtros:** Visão geral do saldo das contas. Gráficos filtráveis e responsivos. Interaja com os resultados selecionando diferentes meses, anos, ou um leque específico de *múltiplas categorias simultaneamente*.
6.  **Edição e Estorno (Ações em Cascata):** Apagar ou refatorar dados de uma transação atualiza automaticamente as Queries do TanStack, refletindo dinamicamente o estorno na conta corrente associada.

---

## 🛠️ Como Rodar Localmente

### 1. Iniciar o Banco de Dados
Na raiz do projeto (ou na pasta backend), rode o ambiente Docker que irá subir o **PostgreSQL** e o **pgAdmin** (opcional para visualizar o DB).
```bash
cd backend
docker-compose up -d
```

### 2. Rodar o Backend
Crie um arquivo `.env` baseado no `.env.example` dentro do `/backend` (com dados do banco e secret JWT).
```bash
cd backend
npm install
npm run start:dev
```

### 3. Rodar o Frontend
Crie um arquivo `.env.local` contendo a `NEXT_PUBLIC_API_URL` apontando para o seu backend local (ex: `http://localhost:3000`).
```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:3001` no seu navegador favorito. O sistema já vai ter populado algumas `Categorias Globais` base, e você poderá iniciar sua Gestão Imediatamente.
