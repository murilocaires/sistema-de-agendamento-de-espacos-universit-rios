# Sistema de Agendamentos de Espaços Universitários

Sistema de login e autenticação para agendamentos de espaços universitários desenvolvido em React.

## Funcionalidades

- **Página de Login**: Interface moderna e responsiva com formulário de autenticação
- **Autenticação**: Sistema de login com contexto React e localStorage
- **Rotas Protegidas**: Redirecionamento automático para usuários não autenticados
- **Dashboard**: Página principal do sistema após login
- **Design System**: Cores e tipografia padronizadas

## Tecnologias Utilizadas

- React 18
- React Router DOM
- Tailwind CSS
- Vite

## Instalação

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Execute o projeto:

```bash
npm run dev
```

## Estrutura do Projeto

```
src/
├── components/
│   └── ProtectedRoute.jsx    # Componente para rotas protegidas
├── context/
│   └── AuthContext.jsx       # Contexto de autenticação
├── pages/
│   ├── login/
│   │   └── Login.jsx         # Página de login
│   └── dashboard/
│       └── Dashboard.jsx     # Página principal
├── App.jsx                   # Configuração de rotas
├── main.jsx                  # Ponto de entrada
└── index.css                 # Estilos globais
```

## Especificações do Design

### Página de Login (Desktop)

- **Container**: 380px de largura, border-radius 20px no topo esquerdo
- **Padding**: 140px nas laterais, 48px em cima/baixo
- **Formulário**: 400px x 347px, border-radius 10px
- **Fonte**: Lato (Bold para títulos, Regular para subtítulos)
- **Cores**:
  - Azul escuro: #2E3DA3
  - Cinza escuro: #1E2024
  - Cinza médio: #535964
  - Cinza claro: #858B99

## Uso

1. Acesse a aplicação
2. Se não estiver logado, será redirecionado para `/login`
3. Preencha email e senha
4. Após login, será redirecionado para `/dashboard`
5. Use o botão "Sair" para fazer logout

## Próximos Passos

- Integração com API de autenticação
- Validação de formulários
- Recuperação de senha
- Registro de usuários
- Responsividade mobile
# sistema-de-agendamento-de-espacos-universit-rios
