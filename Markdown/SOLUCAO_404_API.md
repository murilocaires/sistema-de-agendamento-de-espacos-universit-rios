# 🔧 Solução para Erro 404 nas Rotas da API

## 🐛 Problema

As rotas `/api/*` estão retornando 404, indicando que as Serverless Functions do Next.js não estão sendo encontradas.

## 🔍 Causa

Quando o Next.js está em uma subpasta (`backend/`), o `@vercel/next` precisa de configuração específica para expor as rotas corretamente.

## ✅ Solução

O problema pode estar em uma das seguintes áreas:

### 1. Verificar se as Functions foram criadas

Na dashboard da Vercel:
1. Vá em **Functions**
2. Verifique se aparecem funções como:
   - `/api/auth/login`
   - `/api/auth/verify`
   - `/api/init`
   - etc.

**Se não aparecerem**: O Next.js não foi buildado corretamente.

### 2. Verificar Root Directory na Dashboard

**Settings > General > Root Directory**:
- Deve estar **VAZIO** ou `./` (raiz do repositório)
- **NÃO** deve estar como `backend/`

### 3. Verificar Build Logs

Na dashboard da Vercel:
1. Vá em **Deployments**
2. Clique no último deployment
3. Veja os **Build Logs**
4. Procure por erros relacionados ao Next.js

### 4. Configuração Alternativa: Usar Projetos Separados

Se o monorepo continuar dando problemas, a solução mais confiável é usar **2 projetos separados**:

#### Projeto 1: Backend
- Root Directory: `backend`
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`

#### Projeto 2: Frontend  
- Root Directory: vazio (raiz)
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

#### Configurar `VITE_API_URL`:
- No projeto Frontend, configure:
  ```
  VITE_API_URL=https://seu-backend.vercel.app/api
  ```

## 🔍 Debugging

### Testar API diretamente:

```bash
curl https://seu-projeto.vercel.app/api/init
```

**Se retornar 404 HTML**: As Functions não foram criadas
**Se retornar JSON**: As Functions estão funcionando

### Verificar se o Next.js foi buildado:

Nos logs de build, procure por:
```
Creating an optimized production build
Compiled successfully
```

Se não aparecer, o Next.js não foi buildado.

## 📝 Checklist

- [ ] Root Directory na dashboard está vazio (não `backend/`)
- [ ] Functions aparecem na lista de Functions
- [ ] Build do Next.js foi bem-sucedido (verificar logs)
- [ ] `VITE_API_URL` está configurada corretamente
- [ ] Teste direto da API retorna JSON (não 404 HTML)

## 🎯 Próximos Passos

1. Verificar Functions na dashboard
2. Se não aparecerem, verificar logs de build
3. Se necessário, considerar usar projetos separados

