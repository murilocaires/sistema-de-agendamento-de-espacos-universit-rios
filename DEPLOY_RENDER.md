# 🚀 Deploy do Backend no Render

## 📋 Pré-requisitos

1. Conta no [Render](https://render.com)
2. Repositório no GitHub/GitLab/Bitbucket
3. Banco de dados PostgreSQL (pode usar o Neon ou criar no Render)

## 🔧 Configuração no Render

### Opção 1: Usar render.yaml (Recomendado)

O arquivo `render.yaml` já está configurado na raiz do projeto. Basta:

1. Acesse: https://dashboard.render.com
2. Clique em **New +** > **Blueprint**
3. Conecte seu repositório
4. O Render detectará automaticamente o `render.yaml`
5. Configure as variáveis de ambiente (veja abaixo)
6. Clique em **Apply**

### Opção 2: Configuração Manual

1. Acesse: https://dashboard.render.com
2. Clique em **New +** > **Web Service**
3. Conecte seu repositório

Configure os seguintes campos:

- **Name**: `siru-backend` (ou outro nome)
- **Environment**: `Node`
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: `Free` (ou outro plano)

### Passo 3: Configurar Variáveis de Ambiente

Adicione as seguintes variáveis de ambiente no Render:

- `NODE_ENV` = `production`
- `DATABASE_URL` = `sua-connection-string-do-postgresql`
- `JWT_SECRET` = `seu-jwt-secret-super-seguro`
- `ALLOWED_ORIGIN` = `https://siruufc.vercel.app` (URL do frontend)
- `PORT` = (deixe vazio - o Render define automaticamente)

### Passo 4: Deploy

1. Clique em **Create Web Service** (ou **Apply** se usar Blueprint)
2. Aguarde o build e deploy
3. Anote a URL gerada (ex: `https://siru-backend.onrender.com`)

## 🔍 Verificar se Funcionou

1. **Testar API**:
   ```
   https://seu-backend.onrender.com/api/init
   ```
   Deve retornar JSON (não 404)

2. **Testar Login**:
   ```
   POST https://seu-backend.onrender.com/api/auth/login
   ```

## 🔗 Configurar Frontend

No frontend (Vercel), atualize a variável de ambiente:

```env
VITE_API_URL=https://seu-backend.onrender.com/api
```

## 📝 Notas Importantes

- O Render pode "dormir" serviços gratuitos após 15 minutos de inatividade
- O primeiro request após dormir pode demorar ~30 segundos
- Para evitar isso, considere usar um plano pago ou um serviço de "ping" automático
- O `output: 'standalone'` no `next.config.js` está configurado para otimizar o build

## 🆚 Diferenças entre Render e Vercel

- **Render**: Servidor tradicional Node.js (sempre rodando)
- **Vercel**: Serverless Functions (executadas sob demanda)
- **Render**: Melhor para APIs que precisam estar sempre disponíveis
- **Vercel**: Melhor para APIs com tráfego variável

## ✅ Arquivos Criados

- `render.yaml` - Configuração do Render
- `backend/server.js` - Script de inicialização customizado
- `DEPLOY_RENDER.md` - Este guia

