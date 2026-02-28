# 🔐 Variáveis de Ambiente para Vercel (Monorepo)

## 📋 Variáveis Obrigatórias

Configure estas variáveis na Vercel em **Settings** > **Environment Variables**:

### 1. **DATABASE_URL** (OBRIGATÓRIO)
- **Descrição**: String de conexão com o banco de dados PostgreSQL
- **Formato**: `postgresql://usuario:senha@host:porta/database?sslmode=require`
- **Exemplo**: 
  ```
  postgresql://neondb_owner:senha@ep-dark-bird-ad71s1dg-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
  ```
- **Onde obter**: 
  - Neon (recomendado): https://neon.tech
  - Supabase: https://supabase.com
  - Outro provedor PostgreSQL
- **Ambientes**: ✅ Production, ✅ Preview, ✅ Development

### 2. **JWT_SECRET** (OBRIGATÓRIO)
- **Descrição**: Chave secreta para assinar e verificar tokens JWT
- **Formato**: String longa e aleatória (mínimo 32 caracteres)
- **Exemplo**: 
  ```
  seu-jwt-secret-super-seguro-para-producao-2024-abc123xyz789
  ```
- **⚠️ IMPORTANTE**: 
  - Use uma chave única e segura em produção
  - NÃO use a mesma chave do desenvolvimento
  - Gere uma chave aleatória forte
- **Como gerar** (PowerShell):
  ```powershell
  -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
  ```
- **Ambientes**: ✅ Production, ✅ Preview, ✅ Development

### 3. **VITE_API_URL** (OBRIGATÓRIO)
- **Descrição**: URL base da API para o frontend
- **Formato**: `https://seu-projeto.vercel.app/api`
- **⚠️ IMPORTANTE**: 
  - Substitua `seu-projeto.vercel.app` pela URL real do seu projeto na Vercel
  - Deve começar com `https://` (não `http://`)
  - Deve terminar com `/api`
- **Exemplo**: 
  ```
  https://sistema-de-agendamento-de-espacos-u.vercel.app/api
  ```
- **Como descobrir a URL**:
  1. Acesse https://vercel.com
  2. Entre no seu projeto
  3. Veja a URL na página inicial ou em **Settings** > **Domains**
- **Ambientes**: ✅ Production, ✅ Preview, ✅ Development

## 📝 Variáveis Opcionais

### 4. **NODE_ENV** (Opcional)
- **Descrição**: Ambiente de execução
- **Valores**: `production` ou `development`
- **Padrão**: A Vercel define automaticamente como `production` em produção
- **Ambientes**: ✅ Production (automático), ✅ Preview, ✅ Development

### 5. **NEXT_PUBLIC_API_URL** (Opcional - se usar Next.js no frontend)
- **Descrição**: URL da API para uso no Next.js (se necessário)
- **Formato**: Mesmo que `VITE_API_URL`
- **Nota**: Geralmente não é necessário, pois estamos usando Vite

## 🚀 Como Configurar na Vercel

### Passo 1: Acessar Configurações
1. Acesse https://vercel.com
2. Entre no seu projeto
3. Vá em **Settings** > **Environment Variables**

### Passo 2: Adicionar Variáveis
Para cada variável:
1. Clique em **Add New**
2. Preencha:
   - **Name**: Nome da variável (ex: `DATABASE_URL`)
   - **Value**: Valor da variável
   - **Environments**: Selecione Production, Preview e Development
3. Clique em **Save**

### Passo 3: Fazer Redeploy
Após adicionar todas as variáveis:
1. Vá em **Deployments**
2. Clique nos três pontos (⋯) do último deployment
3. Selecione **Redeploy**
4. Aguarde o deploy concluir

## ✅ Checklist de Configuração

Antes de fazer deploy, verifique se todas estas variáveis estão configuradas:

- [ ] `DATABASE_URL` - String de conexão PostgreSQL válida
- [ ] `JWT_SECRET` - Chave secreta única e segura (mínimo 32 caracteres)
- [ ] `VITE_API_URL` - URL do projeto na Vercel terminando com `/api`
- [ ] Todas as variáveis estão configuradas para Production, Preview e Development
- [ ] Redeploy feito após adicionar as variáveis

## 🔍 Como Verificar se Está Funcionando

### 1. Verificar Build
- Acesse **Deployments** na Vercel
- Verifique se o build foi bem-sucedido
- Se houver erros, verifique os logs

### 2. Verificar Functions
- Vá em **Functions** no projeto
- Deve aparecer uma lista de funções da API:
  - `/api/auth/login`
  - `/api/auth/verify`
  - `/api/projects/[id]/students`
  - etc.

### 3. Testar API
- Acesse: `https://seu-projeto.vercel.app/api/init`
- Deve retornar JSON (não HTML 404)

### 4. Testar Frontend
- Acesse a URL do frontend
- Tente fazer login
- Abra o Console do navegador (F12)
- Verifique se as requisições estão indo para a URL correta da API

## 🐛 Problemas Comuns

### Erro: "DATABASE_URL is not defined"
**Solução**: Adicione a variável `DATABASE_URL` nas configurações da Vercel

### Erro: "JWT_SECRET is not defined"
**Solução**: Adicione a variável `JWT_SECRET` nas configurações da Vercel

### Erro: "Cannot connect to database"
**Solução**: 
- Verifique se a `DATABASE_URL` está correta
- Verifique se o banco de dados está ativo
- Verifique se o banco permite conexões externas

### Frontend não consegue conectar ao backend
**Solução**: 
- Verifique se `VITE_API_URL` está configurada corretamente
- Verifique se a URL termina com `/api`
- Faça um redeploy após adicionar a variável

### Erro de CORS
**Solução**: 
- O middleware já está configurado
- Verifique se a URL do frontend está na lista de origens permitidas no `backend/middleware.js`

## 📝 Resumo das Variáveis

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `DATABASE_URL` | ✅ Sim | String de conexão PostgreSQL |
| `JWT_SECRET` | ✅ Sim | Chave secreta para JWT |
| `VITE_API_URL` | ✅ Sim | URL da API para o frontend |
| `NODE_ENV` | ❌ Não | Ambiente (definido automaticamente) |

## 🎯 Exemplo Completo de Configuração

```
DATABASE_URL=postgresql://usuario:senha@host:porta/database?sslmode=require
JWT_SECRET=seu-jwt-secret-super-seguro-para-producao-2024-abc123xyz789
VITE_API_URL=https://seu-projeto.vercel.app/api
```

**⚠️ Lembre-se**: Substitua os valores de exemplo pelos valores reais do seu projeto!

