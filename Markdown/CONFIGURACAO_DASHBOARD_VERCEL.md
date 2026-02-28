# ⚙️ Configuração da Dashboard da Vercel para Monorepo

## 📋 Configurações Essenciais na Dashboard

### 1. Settings > General

#### Root Directory
- **Valor**: Deixe vazio ou `./` (raiz do repositório)
- **⚠️ IMPORTANTE**: NÃO configure como `backend/` - isso faria a Vercel ignorar o frontend
- O `vercel.json` na raiz cuida de orquestrar os builds

#### Framework Preset
- **Valor**: `Other` ou deixe em branco
- A Vercel detectará automaticamente através do `vercel.json`

### 2. Settings > Build and Output Settings

#### Install Command
- **Valor**: 
  ```bash
  npm install --prefix backend && npm install
  ```
- **Explicação**: Instala dependências do backend primeiro, depois do frontend
- **Alternativa** (se usar workspaces):
  ```bash
  npm install
  ```

#### Build Command
- **Valor**: Deixe vazio
- **Explicação**: O `vercel.json` com a seção `builds` cuida de todos os builds automaticamente
- **⚠️ NÃO use**: `npm run vercel-build` aqui, pois o `vercel.json` já gerencia isso

#### Output Directory
- **Valor**: `dist`
- **Explicação**: Diretório onde o Vite compila o frontend
- O Next.js gerencia seu próprio output automaticamente

#### Development Command
- **Valor**: `npm run dev`
- **Explicação**: Comando para rodar em desenvolvimento (opcional)

### 3. Settings > Environment Variables

Configure as seguintes variáveis:

#### DATABASE_URL (Obrigatório)
```
postgresql://usuario:senha@host:porta/database?sslmode=require
```

#### JWT_SECRET (Obrigatório)
```
seu-jwt-secret-super-seguro-para-producao-2024-abc123xyz789
```

#### VITE_API_URL (Obrigatório)
```
https://seu-projeto.vercel.app/api
```
⚠️ **Atualize após o primeiro deploy** com a URL real do projeto

**Para cada variável:**
- Selecione ambientes: ✅ Production, ✅ Preview, ✅ Development
- Clique em **Save**

## 🔍 Como o Build Funciona

### Ordem de Execução:

1. **Install Command** executa:
   ```bash
   npm install --prefix backend && npm install
   ```
   - Instala dependências do backend em `backend/node_modules`
   - Instala dependências do frontend em `node_modules`

2. **Vercel lê o `vercel.json`** e executa os `builds`:

   a. **Build do Backend (Next.js)**:
      - Usa `@vercel/next` para buildar `backend/package.json`
      - Cria Serverless Functions em `backend/pages/api/*`
      - As rotas `/api/*` ficam disponíveis automaticamente

   b. **Build do Frontend (Vite)**:
      - Usa `@vercel/static-build` para buildar `package.json` (raiz)
      - Compila React/Vite para a pasta `dist/`
      - Serve arquivos estáticos

3. **Rotas são aplicadas**:
   - `/api/*` → Serverless Functions do Next.js
   - `/*` → Arquivos estáticos do frontend (dist/)

## ✅ Checklist de Configuração

Antes de fazer deploy, verifique:

- [ ] **Root Directory**: Vazio ou `./` (raiz do repositório)
- [ ] **Install Command**: `npm install --prefix backend && npm install`
- [ ] **Build Command**: Vazio (deixar o `vercel.json` gerenciar)
- [ ] **Output Directory**: `dist`
- [ ] **Environment Variables**: Todas as 3 variáveis configuradas
- [ ] **`vercel.json`**: Configurado corretamente na raiz
- [ ] **`package.json`**: Tem scripts `build:frontend` e `build:backend`

## 🐛 Problemas Comuns

### Erro: "Cannot find module" durante build
**Causa**: Install Command não está instalando dependências do backend
**Solução**: Use `npm install --prefix backend && npm install`

### Erro: 404 nas rotas `/api/*`
**Causa**: Root Directory pode estar configurado como `backend/`
**Solução**: Deixe Root Directory vazio (raiz do repositório)

### Erro: Frontend não aparece
**Causa**: Output Directory pode estar incorreto
**Solução**: Configure como `dist` (ou o diretório que o Vite usa)

### Build Command conflitando
**Causa**: Build Command na dashboard pode estar sobrescrevendo o `vercel.json`
**Solução**: Deixe Build Command vazio na dashboard

## 📝 Resumo das Configurações

| Configuração | Valor |
|--------------|-------|
| Root Directory | Vazio ou `./` |
| Framework Preset | `Other` ou vazio |
| Install Command | `npm install --prefix backend && npm install` |
| Build Command | **Vazio** (deixar `vercel.json` gerenciar) |
| Output Directory | `dist` |
| Environment Variables | `DATABASE_URL`, `JWT_SECRET`, `VITE_API_URL` |

## 🚀 Após Configurar

1. **Salve todas as configurações** na dashboard
2. **Faça commit e push** das alterações no `vercel.json`
3. **Aguarde o deploy automático** ou faça redeploy manual
4. **Verifique as Functions** em **Functions** na dashboard
5. **Teste a API**: `https://seu-projeto.vercel.app/api/init`

---

**Importante**: A configuração do Root Directory e dos comandos de build na dashboard é crucial. Se não estiver correta, o monorepo não funcionará.

