# 🔧 Solução Definitiva para Erro 404 na Vercel

## 🐛 Problema

Todas as rotas da API estão retornando 404, incluindo rotas básicas como `/api/auth/login` e `/api/auth/verify`.

**Erros:**
- `GET https://siruufc.vercel.app/api/auth/verify 404`
- `POST https://siruufc.vercel.app/api/auth/login 404`
- `SyntaxError: Unexpected token 'T', "The page c"... is not valid JSON`

## 🔍 Causa Raiz

O problema é que a Vercel precisa saber que o **Root Directory** do Next.js é `backend/`, não a raiz do projeto. Isso deve ser configurado na **interface da Vercel**, não apenas no `vercel.json`.

## ✅ Solução Completa

### Passo 1: Configurar Root Directory na Vercel

1. Acesse a dashboard da Vercel: https://vercel.com/dashboard
2. Selecione seu projeto `siruufc`
3. Vá em **Settings** > **General**
4. Role até a seção **Build & Development Settings**
5. Para o build do **Backend** (Next.js), configure:
   - **Root Directory**: `backend`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (ou deixe vazio para auto-detect)
   - **Output Directory**: `.next` (ou deixe vazio para auto-detect)

### Passo 2: Verificar Configuração do Projeto

Na mesma página de Settings, verifique:

**Para o Frontend (Vite):**
- **Root Directory**: `/` (raiz)
- **Framework Preset**: Vite
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist`

**Para o Backend (Next.js):**
- **Root Directory**: `backend` ⚠️ **IMPORTANTE**
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (ou auto)
- **Output Directory**: `.next` (ou auto)

### Passo 3: Verificar vercel.json

O `vercel.json` deve estar assim:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "backend/package.json",
      "use": "@vercel/next"
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

### Passo 4: Fazer Novo Deploy

Após configurar o Root Directory:

1. Na Vercel, vá em **Deployments**
2. Clique nos três pontos (⋯) do último deployment
3. Selecione **Redeploy**
4. Ou faça um commit vazio para trigger automático:
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push origin main
   ```

## 🔍 Verificar se Funcionou

Após o deploy:

1. **Teste a rota de verificação:**
   ```bash
   curl https://siruufc.vercel.app/api/auth/verify
   ```
   Deve retornar JSON (não 404)

2. **Teste a rota de login:**
   ```bash
   curl -X POST https://siruufc.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@test.com","password":"test"}'
   ```
   Deve retornar JSON com erro de credenciais (não 404)

3. **Verifique os logs:**
   - Vá em **Functions** > **Logs** na Vercel
   - Não deve haver erros 404

## 🐛 Se Ainda Não Funcionar

### Opção A: Criar Projeto Separado para Backend

Se o monorepo estiver causando problemas:

1. Crie um novo projeto na Vercel apenas para o backend
2. Configure:
   - **Root Directory**: `backend`
   - **Framework**: Next.js
3. Atualize `VITE_API_URL` no frontend para apontar para a nova URL do backend

### Opção B: Usar Rewrites no Next.js

Adicione no `backend/next.config.js`:

```javascript
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};
```

### Opção C: Verificar Estrutura de Pastas

Confirme que a estrutura está assim:

```
projeto/
├── backend/
│   ├── pages/
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login.js
│   │       │   └── verify.js
│   │       └── projects/
│   │           └── [id]/
│   │               └── students.js
│   ├── package.json
│   └── next.config.js
├── src/
├── package.json
└── vercel.json
```

## 📋 Checklist Final

- [ ] Root Directory configurado como `backend` na Vercel (Settings > General)
- [ ] `vercel.json` está correto
- [ ] Novo deploy feito após configurar Root Directory
- [ ] Rota `/api/auth/verify` retorna JSON (não 404)
- [ ] Rota `/api/auth/login` retorna JSON (não 404)
- [ ] Logs da Vercel não mostram erros 404

## ⚠️ Importante

O **Root Directory** na Vercel é a configuração mais importante para monorepos. Sem isso, o Next.js não consegue encontrar as rotas em `backend/pages/api/`.

