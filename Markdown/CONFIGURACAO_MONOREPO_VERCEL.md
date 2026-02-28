# 🚀 Configuração do Monorepo na Vercel

## ✅ O que foi configurado

### 1. Script `npm run dev` para rodar front e back simultaneamente

O `package.json` raiz foi atualizado para incluir:
- `npm run dev` - Roda frontend e backend ao mesmo tempo
- `npm run dev:frontend` - Roda apenas o frontend (Vite na porta 3000)
- `npm run dev:backend` - Roda apenas o backend (Next.js na porta 3001)

**Dependência adicionada**: `concurrently` - Para rodar múltiplos comandos simultaneamente

### 2. Configuração do `vercel.json` para monorepo

O `vercel.json` foi atualizado para:
- Buildar tanto o frontend quanto o backend
- Rotear corretamente as requisições `/api/*` para o backend
- Servir o frontend estático nas outras rotas

### 3. Documentação das variáveis de ambiente

Foi criado o arquivo `VARIAVEIS_AMBIENTE_VERCEL.md` com todas as variáveis necessárias.

## 📋 Próximos Passos

### Passo 1: Instalar dependências

```powershell
npm install
```

Isso instalará o `concurrently` necessário para rodar front e back simultaneamente.

### Passo 2: Testar localmente

```powershell
npm run dev
```

Isso deve iniciar:
- Frontend em: http://localhost:3000
- Backend em: http://localhost:3001

### Passo 3: Configurar variáveis de ambiente na Vercel

Acesse https://vercel.com e configure as seguintes variáveis em **Settings** > **Environment Variables**:

#### Variáveis Obrigatórias:

1. **DATABASE_URL**
   - String de conexão PostgreSQL
   - Exemplo: `postgresql://usuario:senha@host:porta/database?sslmode=require`

2. **JWT_SECRET**
   - Chave secreta para JWT (mínimo 32 caracteres)
   - Exemplo: `seu-jwt-secret-super-seguro-para-producao-2024-abc123xyz789`

3. **VITE_API_URL**
   - URL da API (será preenchida após o primeiro deploy)
   - Formato: `https://seu-projeto.vercel.app/api`
   - ⚠️ **IMPORTANTE**: Substitua `seu-projeto.vercel.app` pela URL real do seu projeto

**Para cada variável:**
- Selecione os ambientes: ✅ Production, ✅ Preview, ✅ Development
- Clique em **Save**

📖 **Detalhes completos**: Veja o arquivo `VARIAVEIS_AMBIENTE_VERCEL.md`

### Passo 4: Fazer deploy na Vercel

1. Faça commit e push das alterações:
   ```powershell
   git add .
   git commit -m "Configurar monorepo para Vercel"
   git push
   ```

2. A Vercel fará deploy automático

3. Após o primeiro deploy, descubra a URL do projeto:
   - Acesse a dashboard da Vercel
   - Veja a URL na página inicial ou em **Settings** > **Domains**

4. Atualize a variável `VITE_API_URL`:
   - Vá em **Settings** > **Environment Variables**
   - Edite `VITE_API_URL` com a URL real: `https://sua-url.vercel.app/api`
   - Faça um redeploy

### Passo 5: Inicializar o banco de dados

Após o deploy, inicialize o banco:

1. Acesse: `https://seu-projeto.vercel.app/api/init`
2. Faça uma requisição **POST** (pode usar Postman, curl, ou extensão do navegador):
   ```bash
   curl -X POST https://seu-projeto.vercel.app/api/init
   ```
3. Deve retornar: `{"message": "Banco de dados inicializado com sucesso"}`

## 🔍 Verificar se está funcionando

### 1. Verificar Build
- Acesse **Deployments** na Vercel
- Verifique se o build foi bem-sucedido

### 2. Verificar Functions
- Vá em **Functions** no projeto
- Deve aparecer uma lista de funções da API

### 3. Testar Frontend
- Acesse a URL do projeto
- Tente fazer login
- Abra o Console do navegador (F12)
- Verifique se as requisições estão indo para a URL correta da API

## 📝 Resumo das Mudanças

### Arquivos Modificados:
- ✅ `package.json` - Adicionado script `dev` e `concurrently`
- ✅ `vercel.json` - Configurado para monorepo

### Arquivos Criados:
- ✅ `VARIAVEIS_AMBIENTE_VERCEL.md` - Documentação completa das variáveis
- ✅ `CONFIGURACAO_MONOREPO_VERCEL.md` - Este arquivo

## 🎯 Estrutura do Projeto na Vercel

```
/
├── /api/*          → Backend (Next.js)
├── /               → Frontend (Vite - arquivos estáticos)
└── /dist/*         → Arquivos buildados do frontend
```

## ⚠️ Importante

- O `npm run dev` agora roda front e back simultaneamente
- Todas as variáveis de ambiente devem ser configuradas na Vercel
- A `VITE_API_URL` deve ser atualizada após o primeiro deploy com a URL real
- O banco de dados precisa ser inicializado após o deploy

## 🐛 Problemas Comuns

### Erro ao rodar `npm run dev`
**Solução**: Execute `npm install` primeiro para instalar o `concurrently`

### Erro de build na Vercel
**Solução**: Verifique se todas as variáveis de ambiente estão configuradas

### Frontend não conecta ao backend
**Solução**: 
- Verifique se `VITE_API_URL` está configurada corretamente
- Verifique se a URL termina com `/api`
- Faça um redeploy após atualizar a variável

### Erro de CORS
**Solução**: O middleware já está configurado. Verifique se a URL do frontend está na lista de origens permitidas.

---

**Pronto!** Agora você pode fazer deploy do monorepo completo na Vercel! 🎉

