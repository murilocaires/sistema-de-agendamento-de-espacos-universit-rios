# 🔗 Conectar Frontend ao Backend na Vercel

## ✅ Backend Deployado com Sucesso!

URL do Backend: `https://sistema-de-agendamento-de-espacos-u.vercel.app`

## 📋 Próximos Passos

### Passo 1: Atualizar Variável de Ambiente no Frontend

1. Acesse a dashboard da Vercel
2. Selecione o projeto do **frontend** (não o backend)
3. Vá em **Settings** > **Environment Variables**
4. Procure por `VITE_API_URL`
5. Se existir, edite. Se não existir, adicione:
   - **Nome**: `VITE_API_URL`
   - **Valor**: `https://sistema-de-agendamento-de-espacos-u.vercel.app/api`
   - **Ambientes**: ✅ Production, ✅ Preview, ✅ Development
6. Clique em **Save**

### Passo 2: Fazer Redeploy do Frontend

Após atualizar a variável:

1. Vá em **Deployments**
2. Clique nos três pontos (⋯) do último deployment
3. Selecione **Redeploy**
4. Aguarde o deploy concluir

### Passo 3: Inicializar o Banco de Dados

Após o deploy do backend, você precisa inicializar o banco:

1. Acesse: `https://sistema-de-agendamento-de-espacos-u.vercel.app/api/init`
2. Faça uma requisição **POST** (pode usar Postman, curl, ou extensão do navegador):
   ```bash
   curl -X POST https://sistema-de-agendamento-de-espacos-u.vercel.app/api/init
   ```
3. Deve retornar: `{"message": "Banco de dados inicializado com sucesso"}`

### Passo 4: Verificar se Funcionou

1. Acesse o site do frontend
2. Tente fazer login
3. Abra o Console do navegador (F12)
4. Verifique se as requisições estão indo para:
   - `https://sistema-de-agendamento-de-espacos-u.vercel.app/api/auth/login`
   - E não para `localhost:3001`

## 🔍 Verificar Functions do Backend

No projeto do backend na Vercel:

1. Vá em **Functions**
2. Agora você deve ver uma lista de funções:
   - `/api/auth/login`
   - `/api/auth/verify`
   - `/api/projects/[id]/students`
   - etc.

## 📝 Resumo das URLs

- **Frontend**: `https://siruufc.vercel.app` (ou sua URL do frontend)
- **Backend**: `https://sistema-de-agendamento-de-espacos-u.vercel.app`
- **API Base**: `https://sistema-de-agendamento-de-espacos-u.vercel.app/api`

## ✅ Checklist Final

- [ ] `VITE_API_URL` configurada no frontend: `https://sistema-de-agendamento-de-espacos-u.vercel.app/api`
- [ ] Redeploy do frontend feito
- [ ] Banco de dados inicializado via `/api/init`
- [ ] Teste de login funcionando
- [ ] Functions aparecem na lista do backend
- [ ] Requisições do frontend vão para a URL do backend (não localhost)

## 🎉 Pronto!

Agora seu sistema está completamente deployado:
- ✅ Frontend rodando na Vercel
- ✅ Backend rodando na Vercel
- ✅ Conectados e funcionando!

