# Calculadora para Nail Designers - Frontend

Este módulo fornece uma interface para gerenciar agendamentos e calcular ganhos para nail designers.

## Funcionalidades

- Agendamento de clientes
- Registro de valores de procedimentos
- Marcação de procedimentos como concluídos
- Visualização de estatísticas de ganhos semanais e mensais

## Componentes

### AppointmentForm

Formulário para adicionar novos agendamentos de clientes.

### AppointmentList

Lista de agendamentos com opções para marcar como concluído ou excluir.

### EarningsStats

Exibe estatísticas de ganhos semanais e mensais.

## Integração com o Backend

Este módulo consome a API fornecida pelo microserviço `calculator-for-nail-designers`.

## Estilo

- Utiliza a fonte Inter em todo o módulo
- Esquema de cores principal: rosa (#e62e69)
- Design responsivo para diferentes tamanhos de tela

## Autenticação

- Requer que o usuário esteja autenticado
- Utiliza o email do usuário como identificador único

## Como Usar

1. Faça login na aplicação
2. Navegue até a página da calculadora
3. Adicione agendamentos usando o formulário
4. Visualize e gerencie seus agendamentos na lista
5. Acompanhe seus ganhos nas estatísticas 