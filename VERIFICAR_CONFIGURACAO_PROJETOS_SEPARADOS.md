# ✅ Configuração: Projetos Separados (Recomendado)

## 📋 Checklist

### Frontend (`siruufc.vercel.app`)

1. **Variável de Ambiente:**
   - Nome: `VITE_API_URL`
   - Valor: `https://sistema-de-agendamento-de-espacos-u.vercel.app/api`
   - Ambientes: ✅ Production, ✅ Preview, ✅ Development

2. **Verificar:**
   - Vá em **Settings** > **Environment Variables**
   - Confirme que `VITE_API_URL` está configurada corretamente

### Backend (`sistema-de-agendamento-de-espacos-u.vercel.app`)

1. **Variáveis de Ambiente:**
   - `DATABASE_URL` - Connection string do PostgreSQL
   - `JWT_SECRET` - Chave secreta para JWT

2. **Verificar Functions:**
   - Vá em **Functions**
   - Deve aparecer: `/api/auth/login`, `/api/auth/verify`, etc.

## 🔍 Como Testar

1. Acesse: `https://siruufc.vercel.app/login`
2. Abra o Console do navegador (F12)
3. Tente fazer login
4. Verifique se as requisições vão para:
   - ✅ `https://sistema-de-agendamento-de-espacos-u.vercel.app/api/auth/login`
   - ❌ NÃO para `localhost:3001`

## 🎯 Por que Projetos Separados?

- ✅ Mais confiável
- ✅ Sem problemas de roteamento
- ✅ Deploys independentes
- ✅ Mais fácil de debugar
- ✅ Funciona perfeitamente no plano gratuito

## 📝 Resumo

**NÃO precisa pagar!** O plano gratuito permite projetos separados sem problemas. Monorepos podem funcionar, mas projetos separados são mais simples e confiáveis.

