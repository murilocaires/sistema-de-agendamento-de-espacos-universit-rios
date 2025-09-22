# 🚀 Como Usar o Sistema SIRU - Guia Completo

## 📋 **Status Atual**

✅ **Backend criado** com Next.js + PostgreSQL  
✅ **APIs implementadas** (login, register, users)  
✅ **Conexão SSL configurada** para Neon  
✅ **Frontend atualizado** para usar APIs  
❌ **Banco não inicializado** (precisa fazer)  

## 🔧 **Passo a Passo para Funcionar**

### **1. Configurar Variáveis de Ambiente**

Na pasta `backend/`, execute:

```powershell
# Opção A - Usar script automático
npm run setup-env

# Opção B - Criar manualmente
# Criar arquivo .env.local com o conteúdo do arquivo CONFIGURAR_ENV.md
```

### **2. Inicializar Banco de Dados**

```powershell
# Na pasta backend/
npm run init-db
```

**Resultado esperado:**
```
🚀 Inicializando banco de dados...
✅ Conexão com banco estabelecida
🌱 Populando banco com dados iniciais...
👥 Usuários criados:
   • Admin: admin@siru.com / admin123
   • Professor: joao.silva@universidade.edu / professor123
   [... outros usuários]
🎉 Pronto para uso!
```

### **3. Executar Servidor Backend**

```powershell
# Na pasta backend/
npm run dev
```

**Deve mostrar:**
```
▲ Next.js 14.2.32
- Local: http://localhost:3001
✓ Ready in 1886ms
```

### **4. Executar Frontend**

Em outro terminal, na pasta raiz:

```powershell
npm run dev
```

**Deve mostrar:**
```
Local: http://localhost:5173
```

### **5. Testar Login**

1. Acesse: `http://localhost:5173`
2. Faça login com:
   - **Email:** `admin@siru.com`
   - **Senha:** `admin123`

## 👥 **Usuários Disponíveis**

| Tipo | Email | Senha | Funcionalidades |
|------|-------|-------|----------------|
| **Admin** | admin@siru.com | admin123 | Acesso total |
| **Professor** | joao.silva@universidade.edu | professor123 | Reservas, histórico | cria ALUNO E PROJETO
| **Coordenador** | maria.santos@universidade.edu | coordenador123 | Gerenciar reservas |
| **Aluno** | pedro.costa@aluno.universidade.edu | aluno123 | Fazer reservas | PRECISA DE UM PROJETO VINCULADO
| **Portaria** | ana.oliveira@universidade.edu | portaria123 | Confirmações |


## 🔧 **Resolução de Problemas**

### **Erro: "relation users does not exist"**
```powershell
# Execute a inicialização do banco
npm run init-db
```

### **Erro: "The server does not support SSL connections"**
```powershell
# Verifique se o .env.local está correto (sem channel_binding=require)
# Recrie o arquivo com: npm run setup-env
```

### **Erro: "secretOrPrivateKey must have a value"**
```powershell
# Verifique se JWT_SECRET está no .env.local
# Recrie o arquivo com: npm run setup-env
```

### **Erro: "Cannot connect to server"**
```powershell
# Verifique se o backend está rodando na porta 3001
# Execute: npm run dev (na pasta backend/)
```

## 📡 **URLs Importantes**

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Inicializar Banco:** http://localhost:3001/api/init (POST)
- **Login API:** http://localhost:3001/api/auth/login (POST)

## 🗂️ **Estrutura de Arquivos**

```
projeto/
├── backend/                 # Servidor Next.js
│   ├── lib/                # Configurações do banco
│   ├── pages/api/          # Endpoints da API
│   ├── scripts/            # Scripts utilitários
│   ├── .env.local          # Variáveis de ambiente
│   └── package.json
├── src/                    # Frontend React
│   ├── services/           # Conexão com API
│   ├── context/            # Context de autenticação
│   └── pages/              # Páginas do sistema
└── package.json
```

## ✅ **Checklist Final**

- [ ] Arquivo `.env.local` criado no backend
- [ ] Banco inicializado com `npm run init-db`
- [ ] Backend rodando na porta 3001
- [ ] Frontend rodando na porta 5173
- [ ] Login funcionando com admin@siru.com

## 🎯 **Próximos Passos**

Após tudo funcionando:
1. Testar diferentes tipos de usuário
2. Implementar funcionalidades de reservas
3. Adicionar sistema de salas
4. Criar relatórios

---

**Sistema pronto para desenvolvimento!** 🚀

*Se tiver problemas, verifique os arquivos de log e as instruções específicas nos arquivos .md criados.*
