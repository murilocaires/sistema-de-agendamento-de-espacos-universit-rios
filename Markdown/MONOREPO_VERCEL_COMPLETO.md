# 🔧 Configurar Monorepo Completo na Vercel

## ✅ Configuração Aplicada

O `vercel.json` foi ajustado para garantir que o backend seja buildado **ANTES** do frontend:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

**Mudança importante**: O backend agora é buildado primeiro, garantindo que as rotas da API estejam disponíveis.

## 📋 Passos para Aplicar

### Passo 1: Fazer Commit e Push

```bash
git add vercel.json
git commit -m "Ajustar ordem de builds no vercel.json - backend primeiro"
git push origin main
```

### Passo 2: Verificar Variáveis de Ambiente

No projeto na Vercel, certifique-se de ter:

- `DATABASE_URL` - Connection string do PostgreSQL
- `JWT_SECRET` - Chave secreta para JWT
- `VITE_API_URL` - URL do próprio projeto (será preenchida automaticamente ou use a URL do projeto)
- `NODE_ENV=production` (opcional)

### Passo 3: Aguardar Deploy

A Vercel fará deploy automático. Verifique os logs para ver se ambos os builds aparecem.

### Passo 4: Verificar Logs de Build

Nos logs, você deve ver:

1. **Build do Backend (primeiro):**
   ```
   Building backend/package.json...
   Running "npm run build"
   > next build
   ```

2. **Build do Frontend (depois):**
   ```
   Building package.json...
   Running "npm run vercel-build"
   > vite build
   ```

## 🔍 Verificar se Funcionou

### 1. Verificar Functions

1. Na Vercel, vá em **Functions**
2. Deve aparecer uma lista de funções:
   - `/api/auth/login`
   - `/api/auth/verify`
   - `/api/projects/[id]/students`
   - etc.

### 2. Testar Rota da API

Acesse:
```
https://siruufc.vercel.app/api/init
```

Deve retornar JSON (não 404).

### 3. Testar Login

1. Acesse o site do frontend
2. Tente fazer login
3. Não deve haver erro de CORS ou 404

## 🐛 Se Ainda Não Funcionar

### Problema: Backend não aparece nos logs

**Solução**: Verifique se o `backend/package.json` existe e tem o script `build`:

```json
{
  "scripts": {
    "build": "next build"
  }
}
```

### Problema: Erro "Cannot find module"

**Solução**: 
1. Verifique se todas as dependências estão no `backend/package.json`
2. Execute `npm install` localmente na pasta `backend/` para verificar

### Problema: Rotas retornam 404

**Solução**: 
1. Verifique se as rotas estão em `backend/pages/api/`
2. Verifique se o roteamento no `vercel.json` está correto
3. Verifique os logs de build para ver se o Next.js foi buildado

## 📝 Estrutura Esperada

```
projeto/
├── package.json          (frontend)
├── backend/
│   ├── package.json      (backend)
│   ├── pages/
│   │   └── api/
│   │       ├── auth/
│   │       │   └── login.js
│   │       └── ...
│   └── next.config.js
└── vercel.json
```

## ✅ Checklist Final

- [ ] `vercel.json` atualizado com backend primeiro
- [ ] Commit e push feitos
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy concluído
- [ ] Logs mostram build do Next.js
- [ ] Functions aparecem na lista
- [ ] `/api/init` retorna JSON
- [ ] Login funciona sem erros

