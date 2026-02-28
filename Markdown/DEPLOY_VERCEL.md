# Deploy na Vercel - Sistema de Agendamento de Espaços Universitários

## 📋 Pré-requisitos

1. Conta na [Vercel](https://vercel.com)
2. Projeto conectado ao GitHub
3. Banco de dados PostgreSQL (recomendado: Neon)

## 🚀 Passo a Passo para Deploy

### 1. Preparar o Repositório

Certifique-se de que todos os arquivos estão commitados e enviados para o GitHub:

```bash
git add .
git commit -m "Configuração para deploy na Vercel"
git push origin main
```

### 2. Conectar na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Selecione seu repositório: `sistema-de-agendamento-de-espacos-universit-rios`

### 3. Configurar o Projeto

A Vercel detectará automaticamente que é um monorepo. Configure:

- **Framework Preset**: Vite (para o frontend)
- **Root Directory**: `/` (raiz do projeto)
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `dist`

### 4. Configurar Variáveis de Ambiente

Na seção "Environment Variables" da Vercel, adicione:

```
# Banco de Dados (OBRIGATÓRIO)
DATABASE_URL=postgresql://usuario:senha@host:porta/database?sslmode=require

# JWT Secret (OBRIGATÓRIO - use um valor seguro)
JWT_SECRET=seu-jwt-secret-super-seguro-para-producao

# URLs da API (serão preenchidas automaticamente pela Vercel)
VITE_API_URL=https://seu-projeto.vercel.app/api
NEXT_PUBLIC_API_URL=https://seu-projeto.vercel.app/api

# Ambiente
NODE_ENV=production
```

**⚠️ IMPORTANTE**: 
- **DATABASE_URL**: Configure uma string de conexão PostgreSQL válida (recomendado: Neon)
- **JWT_SECRET**: Use um valor único e seguro para produção (não use o mesmo do desenvolvimento)
- **VITE_API_URL e NEXT_PUBLIC_API_URL**: Serão preenchidas automaticamente pela Vercel após o primeiro deploy
- **NODE_ENV**: Deixe como "production"

### 5. Deploy

1. Clique em "Deploy"
2. Aguarde o processo de build (pode levar alguns minutos)
3. Após o sucesso, você receberá uma URL como: `https://seu-projeto.vercel.app`

## 🔧 Configurações Adicionais

### Banco de Dados

Se estiver usando Neon (recomendado):

1. Acesse [neon.tech](https://neon.tech)
2. Crie um novo projeto
3. Copie a connection string
4. Cole na variável `DATABASE_URL` na Vercel

### Domínio Personalizado (Opcional)

1. Na dashboard da Vercel, vá em "Settings" > "Domains"
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruções

## 🐛 Troubleshooting

### Erro de Build

Se houver erro de build:

1. Verifique se todas as dependências estão no `package.json`
2. Confirme se as variáveis de ambiente estão configuradas
3. Verifique os logs de build na Vercel

### Erro de API

Se a API não funcionar:

1. Verifique se `DATABASE_URL` está correta
2. Confirme se `JWT_SECRET` está definido
3. Verifique se `NEXT_PUBLIC_API_URL` aponta para a URL correta

### Erro de CORS

O projeto já está configurado para CORS no `backend/next.config.js`, mas se houver problemas:

1. Verifique se a URL da API está correta no frontend
2. Confirme se as rotas estão configuradas corretamente no `vercel.json`

## 📱 Acessando a Aplicação

Após o deploy bem-sucedido:

1. **Frontend**: `https://seu-projeto.vercel.app`
2. **API**: `https://seu-projeto.vercel.app/api`

## 🔄 Deploy Automático

A Vercel fará deploy automático sempre que você fizer push para a branch principal (main).

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs na dashboard da Vercel
2. Confirme se todas as variáveis de ambiente estão corretas
3. Teste localmente antes de fazer deploy

---

**✅ Pronto!** Seu sistema de agendamento estará rodando na Vercel com frontend e backend integrados!

