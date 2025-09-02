# 🔧 Solução para Problema de Login

## 🚨 Problema Identificado

O sistema não está encontrando os usuários cadastrados. Isso pode acontecer por alguns motivos:

1. **Inconsistência no email** do admin (já corrigido)
2. **Cache do localStorage** com dados antigos
3. **Usuários não foram criados** na primeira execução

## ✅ Soluções

### **1. Usar o Debug Tool (Recomendado)**

No dashboard, você verá um painel de debug no canto superior direito:

1. **Clique em "Verificar Usuários"** - Vai mostrar no console se existem usuários
2. **Clique em "Resetar Banco"** - Vai limpar e recriar todos os usuários
3. **Abra o console** (F12) para ver os logs

### **2. Limpar Manualmente (Alternativo)**

Se preferir fazer manualmente:

1. **Abra o DevTools** (F12)
2. **Vá para Application/Storage**
3. **Local Storage** → Seu domínio
4. **Delete** a chave `users_db`
5. **Recarregue** a página

### **3. Verificar no Console**

Execute no console do navegador:

```javascript
// Verificar se existem usuários
console.log(JSON.parse(localStorage.getItem("users_db") || "[]"));

// Limpar e recriar
localStorage.removeItem("users_db");
location.reload();
```

## 🔐 Credenciais Corretas

Após resetar, use estas credenciais:

### **ADMIN**

- **Email:** `admin@siru.com`
- **Senha:** `admin123`

### **PROFESSOR**

- **Email:** `joao.silva@universidade.edu`
- **Senha:** `professor123`

### **COORDENADOR**

- **Email:** `maria.santos@universidade.edu`
- **Senha:** `coordenador123`

### **ALUNO**

- **Email:** `pedro.costa@aluno.universidade.edu`
- **Senha:** `aluno123`

### **PORTARIA**

- **Email:** `ana.oliveira@universidade.edu`
- **Senha:** `portaria123`

### **DIREÇÃO**

- **Email:** `carlos.ferreira@universidade.edu`
- **Senha:** `direcao123`

## 🎯 Passos para Resolver

1. **Acesse** o dashboard (faça login com qualquer credencial que funcione)
2. **Use o debug tool** para resetar o banco
3. **Teste** o login com `admin@siru.com` / `admin123`
4. **Verifique** se a sidebar mostra "ADMIN" no header
5. **Teste** outros usuários para ver menus diferentes

## 🔍 Verificação

Após resetar, você deve ver no console:

```
Banco de dados resetado com sucesso!
Usuários no banco: [
  {id: "admin-001", name: "Administrador", email: "admin@siru.com", ...},
  {id: "professor-001", name: "João Silva", email: "joao.silva@universidade.edu", ...},
  ...
]
```

## ⚠️ Importante

- O debug tool será removido após resolver o problema
- Em produção, não use essas funções de debug
- Sempre teste com diferentes tipos de usuário

---

_Sistema de Reservas da Universidade (SIRU) - Debug de Login_
