# 🔧 Configurar Variáveis de Ambiente

## 📝 **Passo a Passo**

### **1. Criar arquivo .env.local**

Na pasta `backend/`, crie um arquivo chamado `.env.local` com este conteúdo:

```env
# Configuração do Banco Neon PostgreSQL
DATABASE_URL="postgresql://neondb_owner:npg_wI4NJHKXF2lZ@ep-dark-bird-ad71s1dg-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# JWT Secret - IMPORTANTE: Altere em produção!
JWT_SECRET="siru-jwt-secret-2024-super-seguro-mude-em-producao-123456789"

# Configurações da aplicação
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### **2. Como criar o arquivo**

**Opção A - Pelo VS Code:**
1. Abra a pasta `backend/`
2. Clique com botão direito → "New File"
3. Nome do arquivo: `.env.local`
4. Cole o conteúdo acima

**Opção B - Pelo PowerShell:**
```powershell
# Na pasta backend/
New-Item -Name ".env.local" -ItemType File
# Depois edite o arquivo e cole o conteúdo
```

**Opção C - Copiar arquivo existente:**
```powershell
# Na pasta backend/
Copy-Item "config.env" ".env.local"
```

### **3. Verificar se funcionou**

Após criar o arquivo, execute:

```powershell
# Inicializar o banco de dados
npm run init-db

# Depois executar o servidor
npm run dev
```

## 🔑 **Explicação das Variáveis**

### **DATABASE_URL**
- **O que é:** String de conexão com PostgreSQL
- **Importante:** Removemos `&channel_binding=require` para evitar erros SSL
- **Produção:** Use uma string de conexão própria

### **JWT_SECRET**
- **O que é:** Chave secreta para assinar tokens JWT
- **Importante:** Deve ser uma string longa e aleatória
- **Produção:** SEMPRE altere para uma chave única e segura

### **NODE_ENV**
- **O que é:** Ambiente de execução (development/production)
- **Desenvolvimento:** `development`
- **Produção:** `production`

### **NEXT_PUBLIC_API_URL**
- **O que é:** URL base da API para o frontend
- **Desenvolvimento:** `http://localhost:3001`
- **Produção:** URL do seu servidor

## ⚠️ **Segurança**

### **❌ NÃO FAÇA:**
- Commitar o arquivo `.env.local` no Git
- Usar a mesma JWT_SECRET em produção
- Compartilhar as credenciais do banco

### **✅ FAÇA:**
- Mantenha o `.env.local` no `.gitignore`
- Use JWT_SECRET único em produção
- Use variáveis de ambiente no servidor de produção

## 🚀 **Próximos Passos**

Após criar o `.env.local`:

1. **Inicializar banco:**
   ```powershell
   npm run init-db
   ```

2. **Executar servidor:**
   ```powershell
   npm run dev
   ```

3. **Testar login:**
   - Email: `admin@siru.com`
   - Senha: `admin123`

## 🔍 **Verificação**

Se tudo estiver correto, você verá:

```
✅ Conexão com banco estabelecida
🌱 Iniciando seed do banco de dados...
👥 Criando usuários padrão...
✓ Usuário criado: Administrador (admin)
🎉 Seed do banco de dados concluído com sucesso!
```

---

**Agora o sistema estará pronto para uso!** 🎉
