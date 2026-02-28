# 🔧 Solução para 404 NOT_FOUND nas Rotas da API

## ✅ Status Atual

- ✅ Backend está sendo buildado corretamente
- ✅ Todas as rotas foram identificadas pelo Next.js
- ✅ Funções serverless foram criadas
- ❌ Rotas retornam 404 quando acessadas

## 🐛 Problema

O roteamento no `vercel.json` não está encontrando as funções do Next.js.

## ✅ Soluções Aplicadas

### 1. Adicionado `handle: filesystem`

Isso garante que arquivos estáticos sejam servidos primeiro:

```json
{
  "routes": [
    {
      "handle": "filesystem"  // ← Serve arquivos estáticos primeiro
    },
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ]
}
```

### 2. Ajustado rota catch-all

A rota catch-all agora exclui `/api` para não interferir:

```json
{
  "src": "/((?!api).*)",
  "dest": "/$1"
}
```

### 3. Adicionado rewrites no next.config.js

Isso garante que o Next.js processe as rotas corretamente.

## 📋 Próximos Passos

### Passo 1: Fazer Commit e Push

```bash
git add vercel.json backend/next.config.js
git commit -m "Corrigir roteamento de API - adicionar filesystem handle"
git push origin main
```

### Passo 2: Aguardar Deploy

### Passo 3: Testar

Após o deploy:
```
https://siruufc.vercel.app/api/init
```

## 🔍 Se Ainda Não Funcionar

### Verificar Onde as Funções Estão

O problema pode ser que quando o Next.js é buildado em `backend/`, as funções estão em um caminho diferente. Verifique nos logs de build onde as funções foram criadas.

### Alternativa: Remover Roteamento de /api

Se o problema persistir, tente remover completamente o roteamento de `/api` e deixar o Next.js gerenciar automaticamente:

```json
{
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

O Next.js com `@vercel/next` deve automaticamente expor as rotas em `/api/*` baseado em `pages/api/`.

### Verificar Output Directory

O Next.js pode estar colocando as funções em um local diferente. Nos logs, procure por:
- "Created all serverless functions in:"
- Veja o caminho onde foram criadas

## 💡 Dica

Se nada funcionar, pode ser uma limitação do plano Hobby da Vercel com monorepos. Nesse caso, a melhor solução é manter projetos separados (que você já tem funcionando).

