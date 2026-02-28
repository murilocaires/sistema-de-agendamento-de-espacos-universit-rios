# 🔧 Corrigir Erro 500 na Vercel

## 🐛 Problema

O backend está retornando erro 500 (Internal Server Error) porque faltam variáveis de ambiente essenciais na Vercel.

## ✅ Solução Passo a Passo

### Passo 1: Verificar Variáveis de Ambiente na Vercel

Acesse a dashboard da Vercel e verifique se TODAS estas variáveis estão configuradas:

1. **VITE_API_URL** (já configurada)
   ```
   https://siruufc.vercel.app/api
   ```

2. **DATABASE_URL** (OBRIGATÓRIO - provavelmente faltando)
   ```
   postgresql://usuario:senha@host:porta/database?sslmode=require
   ```

3. **JWT_SECRET** (OBRIGATÓRIO - provavelmente faltando)
   ```
   seu-jwt-secret-super-seguro-para-producao
   ```

4. **NODE_ENV** (opcional, mas recomendado)
   ```
   production
   ```

### Passo 2: Configurar DATABASE_URL

**Opção A - Se você já tem um banco Neon:**

1. Acesse [neon.tech](https://neon.tech)
2. Entre no seu projeto
3. Vá em **Connection Details** ou **Connection String**
4. Copie a connection string (algo como):
   ```
   postgresql://usuario:senha@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require
   ```
5. Na Vercel, adicione como variável:
   - **Nome**: `DATABASE_URL`
   - **Valor**: Cole a connection string completa
   - **Ambientes**: Production, Preview, Development

**Opção B - Criar novo banco Neon (se não tiver):**

1. Acesse [neon.tech](https://neon.tech)
2. Crie uma conta (se não tiver)
3. Crie um novo projeto
4. Copie a connection string
5. Configure na Vercel conforme Opção A

### Passo 3: Configurar JWT_SECRET

1. Gere uma string secreta segura (pode usar um gerador online ou:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. Na Vercel, adicione:
   - **Nome**: `JWT_SECRET`
   - **Valor**: A string gerada (ex: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`)
   - **Ambientes**: Production, Preview, Development

⚠️ **IMPORTANTE**: Use um valor diferente do desenvolvimento!

### Passo 4: Inicializar o Banco de Dados

Após configurar as variáveis, você precisa inicializar o banco:

**Opção A - Via API (Recomendado):**

1. Após fazer o deploy, acesse:
   ```
   https://siruufc.vercel.app/api/init
   ```
2. Faça uma requisição POST (pode usar Postman, curl, ou o navegador com extensão):
   ```bash
   curl -X POST https://siruufc.vercel.app/api/init
   ```

**Opção B - Via Vercel Functions Logs:**

1. Na Vercel, vá em **Functions** > **Logs**
2. Procure por erros relacionados ao banco
3. Se houver erro de "relation users does not exist", significa que precisa inicializar

### Passo 5: Fazer Novo Deploy

Após adicionar todas as variáveis:

1. Na Vercel, vá em **Deployments**
2. Clique nos três pontos (⋯) do último deployment
3. Selecione **Redeploy**
4. Aguarde o processo concluir

## 🔍 Verificar se Funcionou

1. Acesse: `https://siruufc.vercel.app/api/init` (POST)
   - Deve retornar: `{"message": "Banco de dados inicializado com sucesso"}`

2. Tente fazer login no site
   - O erro 500 deve desaparecer
   - O login deve funcionar

3. Verifique os logs na Vercel:
   - Vá em **Functions** > **Logs**
   - Não deve haver erros de conexão com banco

## 📋 Checklist Completo

- [ ] `VITE_API_URL` configurada: `https://siruufc.vercel.app/api`
- [ ] `DATABASE_URL` configurada com connection string válida
- [ ] `JWT_SECRET` configurado com valor seguro
- [ ] `NODE_ENV` configurado como `production` (opcional)
- [ ] Banco de dados inicializado via `/api/init`
- [ ] Novo deploy feito após adicionar variáveis
- [ ] Teste de login funcionando

## 🐛 Problemas Comuns

### Erro: "relation users does not exist"
**Solução**: Execute `POST https://siruufc.vercel.app/api/init`

### Erro: "Cannot connect to database"
**Solução**: Verifique se `DATABASE_URL` está correta e se o banco Neon está ativo

### Erro: "secretOrPrivateKey must have a value"
**Solução**: Verifique se `JWT_SECRET` está configurado na Vercel

### Erro: "Connection timeout"
**Solução**: Verifique se a connection string do Neon está correta e se o banco permite conexões externas

## 📞 Próximos Passos

Após resolver:
1. Teste login com usuário admin: `admin@siru.com` / `admin123`
2. Verifique se todas as funcionalidades estão funcionando
3. Monitore os logs na Vercel para garantir que não há erros

