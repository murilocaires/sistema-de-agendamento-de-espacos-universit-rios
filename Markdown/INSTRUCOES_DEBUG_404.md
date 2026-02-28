# 🔍 Instruções para Debug do Erro 404

## ⚠️ Problema Atual

As rotas `/api/*` estão retornando 404, indicando que as Serverless Functions do Next.js não estão sendo encontradas.

## 🔧 O que foi ajustado

1. **Removido `rewrites` do `vercel.json`**: O `@vercel/next` já expõe as rotas `/api/*` automaticamente. O `rewrites` estava redundante e pode causar conflitos.

## 📋 Próximos Passos para Debug

### 1. Verificar Functions na Dashboard da Vercel

1. Acesse https://vercel.com
2. Entre no seu projeto
3. Vá em **Functions** (no menu lateral)
4. **Verifique se aparecem funções**:
   - `/api/auth/login`
   - `/api/auth/verify`
   - `/api/init`
   - etc.

**Se NÃO aparecerem**: O Next.js não foi buildado corretamente.

### 2. Verificar Build Logs

1. Na dashboard, vá em **Deployments**
2. Clique no último deployment
3. Veja os **Build Logs**
4. Procure por:
   - `Creating an optimized production build` (Next.js)
   - `Compiled successfully` (Next.js)
   - Erros relacionados ao Next.js

### 3. Verificar Root Directory

1. Vá em **Settings** > **General**
2. Verifique **Root Directory**:
   - ✅ Deve estar **VAZIO** ou `./`
   - ❌ **NÃO** deve estar como `backend/`

### 4. Testar API Diretamente

Após fazer redeploy, teste:

```bash
curl https://seu-projeto.vercel.app/api/init
```

**Resultados esperados**:
- ✅ Retorna JSON: Functions estão funcionando
- ❌ Retorna HTML 404: Functions não foram criadas

### 5. Verificar Install Command

1. Vá em **Settings** > **Build and Output Settings**
2. Verifique **Install Command**:
   ```
   npm install --prefix backend && npm install
   ```

### 6. Verificar Variáveis de Ambiente

Certifique-se de que estão configuradas:
- `DATABASE_URL`
- `JWT_SECRET`
- `VITE_API_URL`

## 🎯 Possíveis Soluções

### Solução A: Se Functions não aparecem

O Next.js não está sendo buildado. Verifique:
1. Build logs para erros
2. Se `backend/package.json` está correto
3. Se as dependências foram instaladas

### Solução B: Se Functions aparecem mas retornam 404

Pode ser problema de roteamento. Tente:
1. Fazer redeploy
2. Limpar cache da Vercel
3. Verificar se `VITE_API_URL` está correta

### Solução C: Usar Projetos Separados (Mais Confiável)

Se o monorepo continuar dando problemas:

1. **Criar Projeto Backend**:
   - Root Directory: `backend`
   - Framework: Next.js

2. **Criar Projeto Frontend**:
   - Root Directory: vazio (raiz)
   - Framework: Vite
   - Configurar `VITE_API_URL` apontando para o backend

## 📝 Checklist de Verificação

Após fazer redeploy com as alterações:

- [ ] Functions aparecem na lista de Functions
- [ ] Build do Next.js foi bem-sucedido (verificar logs)
- [ ] Teste direto da API retorna JSON (não 404 HTML)
- [ ] Root Directory está vazio (não `backend/`)
- [ ] Install Command está correto
- [ ] Variáveis de ambiente estão configuradas

## 🚀 Após Verificar

1. Faça commit e push das alterações
2. Aguarde o deploy automático
3. Verifique Functions na dashboard
4. Teste a API diretamente
5. Se ainda não funcionar, considere usar projetos separados

---

**Importante**: O `@vercel/next` deve automaticamente expor as rotas `/api/*` quando buildado corretamente. Se não estiver funcionando, o problema está na configuração do build ou na dashboard da Vercel.

