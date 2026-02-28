# 🔧 Corrigir Erro 404 nas Rotas da API na Vercel

## 🐛 Problema

As rotas da API estão retornando 404, especialmente rotas dinâmicas como `/api/projects/11/students`.

**Erros comuns:**
- `GET https://siruufc.vercel.app/api/projects/11/students 404 (Not Found)`
- `SyntaxError: Unexpected token 'T', "The page c"... is not valid JSON`

## 🔍 Causa

O problema é que o `vercel.json` estava roteando `/api/(.*)` para `/backend/api/$1`, mas o Next.js espera que as rotas sejam mapeadas para `pages/api/` diretamente.

## ✅ Solução Aplicada

O `vercel.json` foi corrigido para rotear corretamente:

**Antes:**
```json
{
  "src": "/api/(.*)",
  "dest": "/backend/api/$1"
}
```

**Depois:**
```json
{
  "src": "/api/(.*)",
  "dest": "/backend/$1"
}
```

Isso permite que o Next.js gerencie as rotas dinâmicas corretamente, pois ele procura por `pages/api/` dentro do diretório `backend/`.

## 📋 Passos para Aplicar a Correção

1. **O arquivo `vercel.json` já foi corrigido** ✅

2. **Fazer commit e push:**
   ```bash
   git add vercel.json
   git commit -m "Corrigir roteamento de API no vercel.json"
   git push origin main
   ```

3. **Aguardar deploy automático na Vercel**

4. **Verificar se funcionou:**
   - Acesse: `https://siruufc.vercel.app/api/projects/11/students`
   - Deve retornar JSON (não 404)

## 🔍 Verificar Outras Possíveis Causas

Se o erro persistir após o deploy:

### 1. Verificar se o arquivo existe
Confirme que o arquivo está em:
```
backend/pages/api/projects/[id]/students.js
```

### 2. Verificar logs na Vercel
1. Acesse a dashboard da Vercel
2. Vá em **Functions** > **Logs**
3. Procure por erros relacionados à rota

### 3. Verificar se o Next.js está buildando corretamente
1. Na Vercel, vá em **Deployments**
2. Clique no último deployment
3. Verifique os logs de build
4. Procure por erros de compilação

### 4. Testar a rota diretamente
Após o deploy, teste:
```bash
curl https://siruufc.vercel.app/api/projects/11/students
```

Deve retornar JSON, não HTML de erro 404.

## 🐛 Problemas Comuns

### Erro: "The page could not be found"
**Causa**: Rota não está sendo reconhecida pelo Next.js
**Solução**: Verifique se o `vercel.json` está correto e faça um novo deploy

### Erro: "SyntaxError: Unexpected token 'T'"
**Causa**: O servidor está retornando HTML (página 404) ao invés de JSON
**Solução**: Isso geralmente indica que a rota não existe. Verifique o roteamento.

### Erro: Rota funciona localmente mas não na Vercel
**Causa**: Diferença na configuração de roteamento
**Solução**: O `vercel.json` corrigido deve resolver isso

## 📝 Estrutura Esperada

Para que as rotas funcionem, a estrutura deve ser:

```
backend/
  pages/
    api/
      projects/
        [id]/
          students.js  ← Rota dinâmica
        [id].js
        index.js
```

E o Next.js automaticamente mapeia:
- `/api/projects/11/students` → `backend/pages/api/projects/[id]/students.js`
- `/api/projects/11` → `backend/pages/api/projects/[id].js`
- `/api/projects` → `backend/pages/api/projects/index.js`

## ✅ Checklist

- [ ] `vercel.json` corrigido
- [ ] Commit e push feitos
- [ ] Deploy na Vercel concluído
- [ ] Rota `/api/projects/11/students` retorna JSON (não 404)
- [ ] Logs da Vercel não mostram erros

