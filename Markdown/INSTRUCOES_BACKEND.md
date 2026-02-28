# 🚀 Instruções para Executar o Backend SIRU

## 📋 O que foi criado

Foi criado um **backend completo com Next.js** que se conecta ao banco **Neon PostgreSQL** usando a string de conexão fornecida. O sistema inclui:

- ✅ **Autenticação JWT completa**
- ✅ **APIs de login e registro**
- ✅ **Conexão com PostgreSQL (Neon)**
- ✅ **Criptografia de senhas com bcrypt**
- ✅ **Middleware de autenticação**
- ✅ **Controle de roles/permissões**
- ✅ **Seed automático do banco**
- ✅ **Frontend atualizado para usar as APIs**

## 🚀 Como executar

### 1. **Instalar dependências do backend**
```bash
cd backend
npm install
```

### 2. **Iniciar o servidor backend**
```bash
npm run dev
```
*O backend rodará na porta **3001** (http://localhost:3001)*

### 3. **Inicializar o banco de dados**
Abra outro terminal e execute:
```bash
curl -X POST http://localhost:3001/api/init
```

Ou acesse no navegador: `http://localhost:3001/api/init` (método POST)

### 4. **Executar o frontend** (em outro terminal)
```bash
# Na raiz do projeto
npm run dev
```
*O frontend rodará na porta **5173** (http://localhost:5173)*

## 🔐 Credenciais para teste

Após inicializar o banco, use estas credenciais:

| Tipo | Email | Senha |
|------|-------|-------|
| **Admin** | admin@siru.com | admin123 |
| **Professor** | joao.silva@universidade.edu | professor123 |
| **Coordenador** | maria.santos@universidade.edu | coordenador123 |
| **Aluno** | pedro.costa@aluno.universidade.edu | aluno123 |
| **Portaria** | ana.oliveira@universidade.edu | portaria123 |

## 📁 Estrutura criada

```
backend/
├── lib/
│   ├── database.js      # Conexão PostgreSQL
│   ├── auth.js          # Funções JWT e bcrypt
│   └── seedDatabase.js  # Dados iniciais
├── pages/api/
│   ├── auth/
│   │   ├── login.js     # POST /api/auth/login
│   │   ├── register.js  # POST /api/auth/register
│   │   └── verify.js    # GET /api/auth/verify
│   ├── users/
│   │   └── index.js     # GET /api/users
│   └── init.js          # POST /api/init
├── package.json
├── next.config.js
├── .env.local           # Configurações do banco
└── README.md
```

## 🔄 Fluxo de funcionamento

1. **Backend** conecta com **Neon PostgreSQL**
2. **Inicialização** cria tabelas e usuários padrão
3. **Frontend** faz login via API `/api/auth/login`
4. **API retorna** JWT token + dados do usuário
5. **Frontend salva** token no localStorage
6. **Requisições futuras** usam o token no header `Authorization: Bearer {token}`

## 🛠️ APIs disponíveis

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Cadastro
- `GET /api/auth/verify` - Verificar token

### Usuários
- `GET /api/users` - Listar usuários (requer auth)

### Sistema
- `POST /api/init` - Inicializar banco

## ⚠️ Importantes

1. **Execute o backend PRIMEIRO** na porta 3001
2. **Inicialize o banco** com `/api/init`
3. **Execute o frontend** na porta 5173
4. **Use as credenciais** listadas acima

## 🐛 Troubleshooting

### "Erro de conexão"
- Verifique se o backend está rodando na porta 3001
- Execute `curl -X POST http://localhost:3001/api/init`

### "Token inválido"
- Faça logout e login novamente
- Verifique se o backend está rodando

### "CORS error"
- Certifique-se que frontend está na porta 5173
- Certifique-se que backend está na porta 3001

## 🎉 Resultado

Agora você tem:
- ✅ **Sistema completamente funcional**
- ✅ **Dados salvos no PostgreSQL (Neon)**
- ✅ **Autenticação JWT segura**
- ✅ **6 usuários de teste criados**
- ✅ **Frontend integrado com backend**
- ✅ **Senhas criptografadas**
- ✅ **Sistema de roles/permissões**

**O sistema está pronto para uso em desenvolvimento!**

---

*Desenvolvido para o Sistema de Reservas Universitário (SIRU)*
