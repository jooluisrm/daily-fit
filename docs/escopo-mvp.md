# Documentação de Escopo: App de Rastreamento Fitness (MVP)

## 🎯 Visão Geral do Sistema
O sistema é uma aplicação web/mobile (Progressive Web App - PWA) projetada para funcionar como um "bloco de notas" diário inteligente para praticantes de musculação. O objetivo principal é unificar o rastreamento de treinos, gasto calórico, ingestão alimentar (calorias/macros), hidratação e métricas corporais, oferecendo relatórios semanais de progressão e balanço energético.

---

## 🛠️ Arquitetura e Tecnologias (Stack)
*   **Framework Principal:** Next.js (Full Stack - Frontend e Backend/API Routes).
*   **Ambiente de Desenvolvimento:** Docker para orquestração de containers (banco de dados, backend, frontend).
*   **Plataforma Alvo:** Web e Mobile (via PWA).
*   **Padrão de Versionamento:** Commits semânticos (ex: `feat:`, `ui:`, `fix:`).

---

## 🎨 Identidade Visual e UX/UI
*   **Tema Padrão:** Dark Mode com fundos profundos (ex: `#121212`).
*   **Estética:** Design premium, minimalista, focado em alta legibilidade durante o treino.
*   **Componentes:** Utilização de *Glassmorphism* (cards com transparência e efeito de blur) sobrepostos a backgrounds escuros.
*   **Interação:** Inputs otimizados para uso em ambiente de academia (botões de incremento rápido, foco em toques largos em vez de digitação extensa).

---

## ⚙️ Funcionalidades do MVP (Produto Mínimo Viável)

### 1. Perfil do Usuário e TMB
*   **Dados Base:** Idade, gênero, altura e peso atual.
*   **Taxa Metabólica Basal (TMB):** Cálculo automático (fórmula de Mifflin-St Jeor) atualizado sempre que um novo peso for registrado.
*   **Controle Corporal:** Histórico de pesagem com opção de atualização diária, semanal ou mensal.

### 2. Módulo de Atividades Físicas
*   **Planejamento de Treino (Split):** Criação de rotinas semanais divididas por dias da semana (Ex: Seg: Peito, Ter: Costas, etc.).
*   **Registro de Execução (Musculação):** 
    *   Cadastro de exercícios no dia.
    *   Registro por série: carga utilizada (kg) e repetições.
    *   Cronômetro de descanso entre séries.
*   **Módulo de Cardio:**
    *   Seleção de intensidade em 3 níveis (Leve, Moderado, Intenso).
    *   Input de duração (minutos).
*   **Gasto Calórico:** Cálculo integrado utilizando MET (Equivalente Metabólico) para estimar a queima calórica da musculação e do cardio.

### 3. Nutrição e Hidratação
*   **Entrada de Alimentos (Manual):**
    *   Registro simplificado: Nome do alimento, Porção/Quantidade, Calorias totais (Opcional: Macronutrientes).
*   **Biblioteca Pessoal:** Salvamento automático de alimentos inseridos anteriormente para autocompletar em registros futuros (agilizando a UX).
*   **Hidratação:** Contador diário com botões de incremento rápido, medindo o progresso contra a meta diária (calculada pelo peso).

### 4. Ciclo Diário e Relatórios (Business Logic)
*   **Regra da Meia-Noite (Trava Temporal):** O registro de atividades e alimentos é estritamente vinculado ao dia atual. Às 00:00, a interface zera para um novo ciclo diário, arquivando os dados do dia anterior.
*   **Dashboard Semanal:**
    *   Gráfico de balanço energético (Calorias Ingeridas *vs.* Calorias Gastas + TMB).
    *   Visualização da progressão de cargas nos exercícios cadastrados.