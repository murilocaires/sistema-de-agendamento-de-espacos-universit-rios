# 🔍 Verificar se o Backend está Rodando na Vercel

## ❓ Como Saber se o Backend está Executando?

### 1. Verificar Functions na Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto `siruufc`
3. Vá em **Functions** (menu lateral)
4. **Se o backend estiver rodando**, você deve ver funções listadas como:
   - `/api/auth/login`
   - `/api/auth/verify`
   - `/api/projects/[id]/students`
   - etc.

**Se não aparecer nenhuma função, o backend NÃO está sendo executado!**

### 2. Verificar Logs de Build

1. Na Vercel, vá em **Deployments**
2. Clique no último deployment
3. Veja os logs de build
4. Procure por:
   - `Building backend...` ou similar
   - `Next.js build completed`
   - Erros relacionados ao backend

**Se não houver logs do Next.js, o backend não foi buildado!**

### 3. Verificar se há Erro de Build

Nos logs de build, procure por:
- ❌ `Error: Could not find a production build`
- ❌ `Error: Build failed`
- ❌ `Error: Cannot find module`

**Se houver erros, o backend não está rodando!**

## 🐛 Problema Comum: Backend Não Está Sendo Buildado

### Causa

Em monorepos, a Vercel pode não detectar automaticamente que precisa buildar o backend se:
1. O **Root Directory** não estiver configurado
2. O `vercel.json` não estiver correto
3. O backend não estiver sendo detectado como um projeto Next.js separado

## ✅ Solução: Garantir que o Backend seja Buildado

### Opção 1: Configurar Root Directory na Vercel (RECOMENDADO)

1. Na Vercel, vá em **Settings** > **General**
2. Role até **Build & Development Settings**
3. Você verá duas seções (ou precisa criar):

   **Frontend:**
   - **Root Directory**: `/` (raiz)
   - **Framework Preset**: Vite
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist`

   **Backend (criar novo projeto ou configurar):**
   - **Root Directory**: `backend` ⚠️ **CRÍTICO**
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (ou deixe vazio)
   - **Output Directory**: `.next` (ou deixe vazio)

### Opção 2: Criar Projeto Separado para Backend

Se a configuração de monorepo não funcionar:

1. Crie um **novo projeto** na Vercel
2. Conecte ao mesmo repositório GitHub
3. Configure:
   - **Root Directory**: `backend`
   - **Framework**: Next.js
4. Configure as variáveis de ambiente
5. Atualize `VITE_API_URL` no frontend para apontar para a nova URL

### Opção 3: Verificar vercel.json

O `vercel.json` atual está assim:

```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    },
    {
      "src": "backend/package.json",
      "use": "@vercel/next"
    }
  ]
}
```

Isso **deveria** funcionar, mas pode não estar funcionando se:
- A Vercel não detectar o segundo build
- O Root Directory não estiver configurado na interface

## 🔧 Teste Rápido

### Teste 1: Verificar se a rota existe

Acesse no navegador:
```
https://siruufc.vercel.app/api/init
```

**Se retornar 404 ou HTML**, o backend não está rodando.

**Se retornar JSON** (mesmo que erro), o backend está rodando!

### Teste 2: Verificar Functions

Na Vercel:
1. Vá em **Functions**
2. Se não aparecer nenhuma função, o backend não está rodando
3. Se aparecer funções, o backend está rodando

### Teste 3: Verificar Logs

Na Vercel:
1. Vá em **Functions** > **Logs**
2. Tente acessar uma rota da API
3. Se aparecer logs, o backend está rodando
4. Se não aparecer nada, o backend não está rodando

## 📋 Checklist de Diagnóstico

- [ ] Functions aparecem na Vercel? (Sim = backend rodando)
- [ ] Logs de build mostram "Next.js build"? (Sim = backend buildado)
- [ ] `/api/init` retorna JSON? (Sim = backend rodando)
- [ ] Root Directory configurado como `backend`? (Sim = necessário)
- [ ] `vercel.json` tem build do backend? (Sim = configurado)

## 🚨 Se o Backend NÃO Está Rodando

### Passo 1: Verificar Configuração na Vercel

1. Settings > General > Build & Development Settings
2. Verifique se há configuração para o backend
3. Se não houver, configure o Root Directory como `backend`

### Passo 2: Fazer Novo Deploy

Após configurar:
1. Vá em **Deployments**
2. Clique em **Redeploy**
3. Aguarde o build
4. Verifique se o backend foi buildado

### Passo 3: Verificar Logs

Após o deploy:
1. Vá em **Functions**
2. Deve aparecer funções do backend
3. Se não aparecer, há um problema de configuração

## 💡 Dica

A forma mais fácil de verificar é:
1. Acesse: `https://siruufc.vercel.app/api/init`
2. Se retornar JSON (mesmo que erro), o backend está rodando ✅
3. Se retornar 404 ou HTML, o backend NÃO está rodando ❌

