# 🔧 Corrigir Erro 404 NOT_FOUND nas Rotas da API

## ✅ Boa Notícia

O backend **ESTÁ sendo buildado**! Os logs mostram:
- ✅ Todas as rotas foram identificadas
- ✅ `Created all serverless functions`
- ✅ `Build Completed`

## 🐛 Problema

As rotas estão sendo buildadas, mas quando você acessa no navegador, aparece:
```
404: NOT_FOUND
Code: NOT_FOUND
```

Isso significa que o **roteamento** está incorreto.

## 🔍 Causa

Quando você usa `builds` no `vercel.json`, o Next.js cria as funções serverless, mas o roteamento precisa apontar corretamente para onde elas estão.

## ✅ Soluções Aplicadas

### 1. Ajustado vercel.json

Adicionado `"continue": true` na rota catch-all para permitir que o Next.js processe as rotas:

```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1",
      "continue": true  // ← Permite que o Next.js processe
    }
  ]
}
```

### 2. Adicionado rewrites no next.config.js

Adicionado `rewrites` no `backend/next.config.js` para garantir que as rotas funcionem:

```javascript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: '/api/:path*',
    },
  ];
}
```

## 📋 Próximos Passos

### Passo 1: Fazer Commit e Push

```bash
git add vercel.json backend/next.config.js
git commit -m "Corrigir roteamento de API - adicionar rewrites e continue"
git push origin main
```

### Passo 2: Aguardar Deploy

A Vercel fará deploy automático.

### Passo 3: Testar

Após o deploy, teste:
```
https://siruufc.vercel.app/api/init
```

Deve retornar JSON (não 404).

## 🔍 Se Ainda Não Funcionar

### Verificar Output do Next.js

O Next.js pode estar colocando as funções em um local diferente. Verifique nos logs:
- Procure por "Created all serverless functions"
- Veja onde as funções foram criadas

### Alternativa: Remover Roteamento Manual

Se o problema persistir, tente remover o roteamento de `/api` e deixar o Next.js gerenciar:

```json
{
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

O Next.js deve automaticamente expor as rotas em `/api/*` quando buildado com `@vercel/next`.

## 📝 Checklist

- [ ] `vercel.json` atualizado com `continue: true`
- [ ] `next.config.js` atualizado com `rewrites`
- [ ] Commit e push feitos
- [ ] Deploy concluído
- [ ] `/api/init` retorna JSON (não 404)
- [ ] Functions aparecem na lista

