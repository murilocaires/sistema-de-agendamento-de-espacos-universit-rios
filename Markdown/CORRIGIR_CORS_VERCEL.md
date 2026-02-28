# 🔧 Corrigir Erro CORS na Vercel

## 🐛 Problema

Erro de CORS ao tentar acessar a API:
```
Access to fetch at 'https://sistema-de-agendamento-de-espacos-u.vercel.app/api/auth/login' 
from origin 'https://siruufc.vercel.app' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ Solução Aplicada

### 1. CORS Corrigido no `backend/pages/api/auth/login.js`

O arquivo foi atualizado para:
- Detectar a origem do frontend automaticamente
- Configurar headers CORS corretamente
- Responder a requisições OPTIONS (preflight)

### 2. CORS Melhorado no `backend/next.config.js`

Adicionado `Access-Control-Max-Age` para cache de preflight.

## 📋 Próximos Passos

### Passo 1: Fazer Commit e Push

```bash
git add backend/pages/api/auth/login.js backend/next.config.js
git commit -m "Corrigir configuração de CORS"
git push origin main
```

### Passo 2: Aguardar Deploy Automático

A Vercel fará deploy automático do backend.

### Passo 3: Verificar se Funcionou

Após o deploy:

1. Acesse o site do frontend
2. Tente fazer login
3. O erro de CORS deve desaparecer

## 🔍 Se Ainda Não Funcionar

### Verificar Headers CORS

1. Abra o Console do navegador (F12)
2. Vá em **Network**
3. Tente fazer login
4. Clique na requisição `/api/auth/login`
5. Veja os **Response Headers**
6. Deve aparecer:
   - `Access-Control-Allow-Origin: https://siruufc.vercel.app`
   - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
   - `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With`

### Verificar se a Rota Existe

Teste diretamente:
```bash
curl -X OPTIONS https://sistema-de-agendamento-de-espacos-u.vercel.app/api/auth/login \
  -H "Origin: https://siruufc.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Deve retornar status 200 com headers CORS.

## 📝 Configuração de CORS

O CORS está configurado em dois lugares:

1. **next.config.js**: Headers globais para todas as rotas `/api/*`
2. **Cada rota individual**: Headers específicos no handler

Isso garante que o CORS funcione mesmo se uma configuração falhar.

## ✅ Checklist

- [ ] Código atualizado e commitado
- [ ] Deploy do backend concluído
- [ ] Teste de login funcionando
- [ ] Headers CORS aparecem nas requisições
- [ ] Erro de CORS desapareceu

