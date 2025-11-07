# 🔧 Solução: Usar Projetos Separados na Vercel

## 🐛 Problema Atual

O Next.js não está sendo buildado corretamente quando está em uma subpasta `backend/`. As funções serverless não aparecem na seção Functions da Vercel, resultando em erro 404 nas rotas de API.

## ✅ Solução Recomendada: Projetos Separados

A solução mais confiável para monorepos é usar **2 projetos separados** na Vercel:

### Passo 1: Criar Projeto Backend

1. Acesse: https://vercel.com/dashboard
2. Clique em **Add New Project**
3. Conecte o mesmo repositório
4. Configure:
   - **Project Name**: `siruufc-backend` (ou outro nome)
   - **Framework Preset**: Next.js
   - **Root Directory**: `backend`
   - **Build Command**: (deixe vazio ou `npm run build`)
   - **Output Directory**: (deixe vazio - Next.js usa `.next`)

5. Configure as variáveis de ambiente:
   - `DATABASE_URL` - Connection string do PostgreSQL
   - `JWT_SECRET` - Chave secreta para JWT
   - `NODE_ENV=production`

6. Faça o deploy

### Passo 2: Criar Projeto Frontend

1. Acesse: https://vercel.com/dashboard
2. Clique em **Add New Project**
3. Conecte o mesmo repositório
4. Configure:
   - **Project Name**: `siruufc` (ou o nome atual)
   - **Framework Preset**: Vite
   - **Root Directory**: (deixe vazio - raiz)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Configure as variáveis de ambiente:
   - `VITE_API_URL` - URL do projeto backend (ex: `https://siruufc-backend.vercel.app/api`)

6. Faça o deploy

### Passo 3: Atualizar Frontend para Usar URL do Backend

No arquivo `src/services/authService.js`, a URL da API será automaticamente usada da variável de ambiente `VITE_API_URL`.

## 📋 Vantagens desta Abordagem

✅ **Mais confiável** - Cada projeto é buildado independentemente
✅ **Melhor para debugging** - Logs separados para frontend e backend
✅ **Escalabilidade** - Pode escalar frontend e backend separadamente
✅ **Deploys independentes** - Pode fazer deploy de um sem afetar o outro

## 🔍 Verificar se Funcionou

1. **Backend**: Acesse `https://siruufc-backend.vercel.app/api/init`
   - Deve retornar JSON (não 404)

2. **Frontend**: Acesse `https://siruufc.vercel.app/login`
   - Deve carregar a página
   - O login deve funcionar usando a API do backend

3. **Verificar Functions**: No projeto backend, vá em **Functions**
   - Deve aparecer todas as rotas de API:
     - `/api/auth/login`
     - `/api/auth/verify`
     - `/api/init`
     - etc.

## 🎯 Resultado Final

- ✅ Backend rodando em: `https://siruufc-backend.vercel.app`
- ✅ Frontend rodando em: `https://siruufc.vercel.app`
- ✅ Frontend fazendo requisições para: `https://siruufc-backend.vercel.app/api`
- ✅ Todas as rotas de API funcionando corretamente

