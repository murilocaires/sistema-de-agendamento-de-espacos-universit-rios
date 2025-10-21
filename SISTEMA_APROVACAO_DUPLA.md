# 🎓 Sistema de Aprovação em Duas Etapas - Professor + Admin

## 📋 Visão Geral

Foi implementado um **sistema de aprovação em duas etapas** para reservas de alunos:

1. **1ª Etapa**: Professor aprova a reserva do aluno do seu projeto
2. **2ª Etapa**: Admin faz a aprovação final

## 🔄 Fluxo Completo de Aprovação

```
┌─────────────────┐
│  Aluno cria     │
│  reserva com    │
│  projeto        │
└────────┬────────┘
         │
         │ status: pending
         ▼
┌─────────────────────────────┐
│  Professor vê em            │
│  "Aprovar Reservas"         │
│  (apenas projetos dele)     │
└────────┬────────────────────┘
         │
         ├─► Aprovar ────┐
         │               │
         └─► Rejeitar    │
                         │
         ┌───────────────┘
         │
         │ status: professor_approved
         ▼
┌─────────────────────────────┐
│  Admin vê em                │
│  "Reservas"                 │
│  (todas aprovadas por prof) │
└────────┬────────────────────┘
         │
         ├─► Aprovar Final ──┐
         │                   │
         └─► Rejeitar        │
                             │
         ┌───────────────────┘
         │
         │ status: approved
         ▼
┌─────────────────┐
│  Reserva        │
│  CONFIRMADA     │
└─────────────────┘
```

## ✨ Funcionalidades Implementadas

### 🎓 Para Professores

#### Nova Página: "Aprovar Reservas"

**Localização**: `/professor/aprovar-reservas`

**Características**:
- ✅ Mostra apenas reservas dos **projetos do professor**
- ✅ Filtra automaticamente por projetos coordenados
- ✅ 3 Abas de visualização:
  - **Pendentes**: Reservas aguardando aprovação do professor
  - **Aprovadas por Mim**: Reservas aprovadas aguardando admin
  - **Rejeitadas**: Reservas rejeitadas pelo professor
- ✅ **Filtro por Projeto**: Quando tem múltiplos projetos
- ✅ Cards informativos com todos os detalhes
- ✅ Ações rápidas: Aprovar, Rejeitar, Ver Detalhes
- ✅ Aviso claro sobre aprovação em duas etapas

**Fluxo do Professor**:
1. Acessa "Aprovar Reservas" no menu
2. Vê lista de reservas pendentes dos seus alunos
3. Clica em "Aprovar" ou "Rejeitar"
4. Se aprovar: status muda para `professor_approved`
5. Aluno e Admin recebem notificação por email

### 👨‍💼 Para Administradores

**Localização**: `/admin/aprovar-reservas` (página existente, já atualizada)

**Características**:
- ✅ Mostra reservas com status `professor_approved`
- ✅ Pode fazer aprovação final
- ✅ Também vê reservas `pending` (sem projeto)

**Fluxo do Admin**:
1. Acessa "Reservas" no menu
2. Vê reservas já aprovadas por professores
3. Faz aprovação final
4. Status muda para `approved` (confirmada)
5. Aluno recebe notificação de confirmação

## 📊 Status das Reservas

| Status | Descrição | Quem Vê |
|--------|-----------|---------|
| `pending` | Aguardando aprovação do professor | Professor (do projeto) |
| `professor_approved` | Aprovada pelo professor, aguardando admin | Admin |
| `approved` | Aprovada pelo admin - CONFIRMADA | Todos |
| `rejected` | Rejeitada por professor ou admin | Todos |

## 🔐 Permissões e Regras

### Professor:
- ✅ Pode aprovar/rejeitar apenas reservas **PENDENTES**
- ✅ Apenas de projetos que coordena
- ✅ Precisa da reserva ter `project_id` associado
- ❌ Não pode alterar reservas já aprovadas

### Admin:
- ✅ Pode aprovar reservas `professor_approved`
- ✅ Pode aprovar/rejeitar reservas `pending` direto
- ✅ Pode revogar reservas `approved`
- ✅ Pode reaprovar reservas `rejected`

## 📧 Notificações por Email

### Quando Professor Aprova:
1. **Email para o Aluno**: "Sua reserva foi aprovada pelo professor e enviada para aprovação final"
2. **Email para o Admin**: "Nova reserva aprovada por professor precisa de aprovação final"

### Quando Admin Aprova:
1. **Email para o Aluno**: "Sua reserva foi confirmada! Você pode usar o espaço no horário agendado"

### Quando Rejeita (Professor ou Admin):
1. **Email para o Aluno**: "Sua reserva foi rejeitada" + motivo

## 🎨 Interface Visual

### Cards de Reserva (Professor)

```
┌─────────────────────────────────┐
│ Título da Reserva          Alta │
│ 📁 Nome do Projeto              │
│                                 │
│ 👤 Nome do Aluno                │
│ 🚪 Sala XYZ                     │
│ 🕐 01/01/2024 14:00             │
│                                 │
│ [Aprovar] [Rejeitar] [Detalhes]│
└─────────────────────────────────┘
```

### Aviso Informativo

Um banner azul explica claramente o fluxo:

> **Fluxo de Aprovação em Duas Etapas**
> 
> Ao aprovar uma reserva aqui, ela será enviada para **aprovação final do administrador**.
> Somente após a aprovação do admin a reserva estará **confirmada**.

## 🗂️ Arquivos Criados/Modificados

### Criados:
- ✅ `src/pages/professor/AprovarReservas.jsx` - Nova página de aprovação
- ✅ `SISTEMA_APROVACAO_DUPLA.md` - Esta documentação

### Modificados:
- ✅ `src/config/userMenus.js` - Adicionado item "Aprovar Reservas"
- ✅ `src/App.jsx` - Adicionada rota `/professor/aprovar-reservas`

### Backend (já existente):
- ✅ `backend/pages/api/reservations/approve.js` - Já tinha lógica completa

## 🚀 Como Usar

### Para Professores:

1. **Login** como professor no sistema
2. Clique em **"Aprovar Reservas"** no menu lateral
3. Veja as reservas pendentes dos seus alunos
4. **Filtre por projeto** (se tiver vários)
5. Clique em **"Aprovar"** para enviar ao admin
6. Ou clique em **"Rejeitar"** e informe o motivo
7. Acompanhe na aba **"Aprovadas por Mim"** as que aguardam admin

### Para Alunos:

1. **Crie uma reserva** normalmente
2. **Selecione um projeto** do professor
3. Aguarde aprovação do professor
4. Receberá email quando professor aprovar
5. Depois aguarde aprovação final do admin
6. Receberá email de confirmação quando tudo estiver ok

### Para Admins:

1. Acesse **"Reservas"** no menu
2. Veja reservas já aprovadas por professores
3. Faça a **aprovação final**
4. Sistema envia confirmação ao aluno

## 📈 Estatísticas e Contadores

Em cada aba, há **badges coloridos** mostrando quantidades:

- **Pendentes** 🟡: Número de reservas aguardando você
- **Aprovadas por Mim** 🟢: Suas aprovações aguardando admin
- **Rejeitadas** 🔴: Total de rejeições

## 🔍 Componentes Reutilizados

A página do professor usa os mesmos componentes do admin:
- ✅ `ReservationDetailsModal` - Modal com detalhes completos
- ✅ `RejectReservationModal` - Modal para rejeitar com motivo
- ✅ Mesma estilização e UX

## ✅ Validações Implementadas

### No Backend:
- ✅ Professor só pode aprovar reservas dos seus projetos
- ✅ Verificação se o professor é responsável pelo projeto
- ✅ Status deve ser 'pending' para professor aprovar
- ✅ Motivo obrigatório para rejeição
- ✅ Verificação de conflitos de horário

### No Frontend:
- ✅ Filtro automático por projetos do professor
- ✅ Botões desabilitados durante processamento
- ✅ Mensagens claras de erro e sucesso
- ✅ Loading states em todas as operações

## 🎯 Benefícios do Sistema

1. **Controle Acadêmico**: Professor tem controle sobre reservas dos projetos
2. **Validação Administrativa**: Admin valida disponibilidade final
3. **Transparência**: Aluno acompanha cada etapa por email
4. **Organização**: Reservas sempre vinculadas a projetos acadêmicos
5. **Rastreabilidade**: Sistema registra quem aprovou em cada etapa

## 📞 Suporte

Em caso de dúvidas sobre o sistema de aprovação:

1. Professores: Verificar se a reserva tem projeto associado
2. Alunos: Sempre selecionar um projeto ao criar reserva
3. Admins: Reservas sem projeto podem ser aprovadas diretamente

---

**Sistema implementado e testado com sucesso!** ✅


