# 🚨 Backend Não Está Rodando na Vercel - Solução

## ✅ Confirmação do Problema

Se na seção **Functions** da Vercel você só vê configurações (Fluid Compute, Function Region, etc.) e **NÃO vê uma lista de funções** como:
- `/api/auth/login`
- `/api/auth/verify`
- `/api/projects/[id]/students`

Isso significa que o **backend NÃO está sendo executado**.

## 🔧 Solução: Criar Projeto Separado para Backend (RECOMENDADO)

A forma mais simples e confiável é criar um projeto separado na Vercel apenas para o backend.

### Passo 1: Criar Novo Projeto na Vercel

1. Acesse: https://vercel.com/dashboard
2. Clique em **Add New...** > **Project**
3. Selecione o mesmo repositório: `sistema-de-agendamento-de-espacos-universit-rios`
4. Clique em **Import**

### Passo 2: Configurar o Projeto Backend

Na tela de configuração:

1. **Framework Preset**: Next.js (deve detectar automaticamente)
2. **Root Directory**: `backend` ⚠️ **CRÍTICO - Clique em "Edit" e digite: `backend`**
3. **Build Command**: Deixe vazio (auto-detect) ou `npm run build`
4. **Output Directory**: Deixe vazio (auto-detect) ou `.next`
5. **Install Command**: Deixe vazio (auto-detect) ou `npm install`

### Passo 3: Configurar Variáveis de Ambiente

Na mesma tela, role até **Environment Variables** e adicione:

```
DATABASE_URL=postgresql://usuario:senha@host:porta/database?sslmode=require
JWT_SECRET=seu-jwt-secret-super-seguro-para-producao
NODE_ENV=production
```

⚠️ **IMPORTANTE**: Use os mesmos valores que você configurou no projeto do frontend!

### Passo 4: Fazer Deploy

1. Clique em **Deploy**
2. Aguarde o build concluir
3. Anote a URL do backend (algo como: `https://siruufc-backend.vercel.app`)

### Passo 5: Atualizar Frontend para Usar o Backend

1. Volte para o projeto do **frontend** na Vercel
2. Vá em **Settings** > **Environment Variables**
3. Atualize `VITE_API_URL` para:
   ```
   https://siruufc-backend.vercel.app/api
   ```
   (Substitua `siruufc-backend` pela URL real do seu projeto backend)

4. Faça um **Redeploy** do frontend

### Passo 6: Verificar se Funcionou

1. No projeto do **backend**, vá em **Functions**
2. Agora você deve ver uma lista de funções:
   - `/api/auth/login`
   - `/api/auth/verify`
   - `/api/projects/[id]/students`
   - etc.

3. Teste a rota:
   ```
   https://siruufc-backend.vercel.app/api/init
   ```
   Deve retornar JSON (não 404)

## 🔄 Alternativa: Configurar Monorepo (Mais Complexo)

Se preferir manter tudo em um projeto:

### Passo 1: Verificar Configuração Atual

1. No projeto do frontend, vá em **Settings** > **General**
2. Role até **Build & Development Settings**
3. Verifique se há configuração para o backend

### Passo 2: Configurar Root Directory

Se não houver configuração separada:

1. A Vercel pode não suportar múltiplos builds no mesmo projeto no plano Hobby
2. **Recomendação**: Use a solução de projeto separado (mais simples e confiável)

## 📋 Checklist

Após criar o projeto separado:

- [ ] Projeto backend criado na Vercel
- [ ] Root Directory configurado como `backend`
- [ ] Variáveis de ambiente configuradas (DATABASE_URL, JWT_SECRET)
- [ ] Deploy do backend concluído com sucesso
- [ ] Functions aparecem na lista (não só configurações)
- [ ] `VITE_API_URL` atualizada no frontend
- [ ] Redeploy do frontend feito
- [ ] Teste de `/api/init` retorna JSON

## 🐛 Se Ainda Não Funcionar

### Verificar Logs de Build

1. No projeto do backend, vá em **Deployments**
2. Clique no último deployment
3. Veja os logs de build
4. Procure por erros

### Erros Comuns

**Erro: "Could not find a production build"**
- Verifique se o Root Directory está como `backend`
- Verifique se há um `package.json` em `backend/`

**Erro: "Module not found"**
- Execute `npm install` localmente na pasta `backend/`
- Verifique se todas as dependências estão no `package.json`

**Erro: "Build failed"**
- Verifique os logs completos
- Procure por erros específicos de compilação

## 💡 Dica Final

A solução de **projeto separado** é mais simples porque:
- ✅ Cada projeto tem sua própria configuração
- ✅ Deploys independentes
- ✅ Mais fácil de debugar
- ✅ Funciona perfeitamente no plano Hobby

A solução de **monorepo** pode ser mais complexa e pode não funcionar bem no plano Hobby da Vercel.

